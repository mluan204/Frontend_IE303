import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
  faEye,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import CustomerDetail from "../components/CustomerDetail";
import { deleteCustomerById, getAllCustomer } from "../service/customerApi";
import { CommonUtils } from "../utils/CommonUtils";
import AddCustomerModal from "../components/AddCustomerModal";

// Kiểu dữ liệu cho khách hàng
interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}


const ITEMS_PER_PAGE = 10;

function KhachHang() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getAllCustomer();
        setCustomers(result);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách khách hàng:", err);
        setError("Không thể tải dữ liệu khách hàng. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc khách hàng theo tìm kiếm (theo tên, mã, hoặc SĐT)
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.id.toString().includes(search.toLowerCase()) ||
      customer.phone_number.includes(search)
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const displayedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Modal chi tiết khách hàng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const handleOpenModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  //Modal thêm mới khách hàng
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const removeCustomer = (customerId: number) => {
    setCustomers((prevCustomers) =>
      prevCustomers.filter((customer) => customer.id !== customerId)
    );
  };

  const handleOnClickExport = async () => {
    try {
      const res = await getAllCustomer();
      const mappedCustomers = customers.map((customer) => ({
        "Mã khách hàng": customer.id.toString(),
        "Giới tính": customer.gender ? "Nam" : "Nữ",
        "Tên khách hàng": customer.name,
        "Số điện thoại": customer.phone_number,
        "Điểm tích lũy": customer.score,
        "Ngày tạo": new Date(customer.created_at).toLocaleDateString("vi-VN"),
      }));
      if (res && res.length > 0) {
        await CommonUtils.exportExcel(
          mappedCustomers,
          "Danh sách khách hàng",
          "Danh sách khách hàng"
        );
        console.log(res);
      }
    } catch (error) {
      console.error("Error exporting category list:", error);
      alert("Đã xảy ra lỗi khi xuất file!");
    }
  };
  //PHÂN TRANG
  function getPaginationRange(
    currentPage: number,
    totalPages: number
  ): (number | string)[] {
    const delta = 1; // số trang kề trước và sau currentPage được hiển thị
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      // Nếu tổng số trang ít hơn hoặc bằng 5 thì hiển thị toàn bộ
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      range.push(1);

      if (currentPage > 3) {
        range.push("...");
      }

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (currentPage < totalPages - 2) {
        range.push("...");
      }

      // Luôn hiển thị trang cuối
      range.push(totalPages);
    }

    return range;
  }

const handleOpenDeleteModal = (customer: Customer) => {
  setCustomerToDelete(customer);
  setIsDeleteModalOpen(true);
};

const handleDeleteCancel = () => {
  setIsDeleteModalOpen(false);
  setCustomerToDelete(null);
};

const handleDeleteConfirm = async () => {
  if (!customerToDelete) return;
  setDeleteLoading(true);
  try {
    await deleteCustomerById(customerToDelete.id); // API xóa
    removeCustomer(customerToDelete.id); // Xóa khỏi UI
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    alert("Xóa thất bại. Vui lòng thử lại.");
  } finally {
    setDeleteLoading(false);
  }
};


  //LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Khách hàng</title>
      </Helmet>

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">Khách hàng</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            {/* Tìm kiếm */}
            <div className="relative w-full sm:w-1/2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-2 pl-10 rounded w-full bg-white focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Nút */}
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={handleOnClickExport}
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Xuất file
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {displayedCustomers.length === 0 ? (
            <div className="w-full text-center py-10">
              <p className="text-gray-500">Không tìm thấy khách hàng.</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã KH
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giới tính
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SĐT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.gender ? "Nam" : "Nữ"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.score}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                            <button
                              onClick={() => handleOpenModal(customer)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                handleOpenDeleteModal(customer)
                              }}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-1"
                              />
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Trang trước
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Trang sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredCustomers.length
                        )}
                      </span>{" "}
                      của{" "}
                      <span className="font-medium">
                        {filteredCustomers.length}
                      </span>{" "}
                      kết quả
                    </p>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Trang trước
                      </button>
                      {getPaginationRange(currentPage, totalPages).map(
                        (page, index) =>
                          typeof page === "number" ? (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                                currentPage === page
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ) : (
                            <span
                              key={`ellipsis-${index}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Trang sau
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Modal chi tiết khách hàng */}
              {selectedCustomer && (
                <CustomerDetail
                  customer={selectedCustomer}
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  removeCustomer={removeCustomer}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm mới */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={(newCustomer) => {
          setCustomers((prev) => [...prev, newCustomer]);
        }}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa khách hàng
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa khách hàng{" "}
              <strong>{customerToDelete?.name}</strong> ({customerToDelete?.id})? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {deleteLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  "Xác nhận xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default KhachHang;
