import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
  faSpinner,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import BillDetail from "../components/BillDetail";
import {
  fetchBill,
  fetchBillById,
  deleteBillById,
  fetchAllProduct,
} from "../service/mainApi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import AddBillModal from "../components/AddBillModal";

const ITEMS_PER_PAGE = 10;

interface BillDetail {
  productId: number;
  productName: string;
  price: number;
  afterDiscount: number | null;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  phone_number: string;
}

interface Employee {
  id: number;
  name: string;
  phone_number: string;
}

interface Bill {
  id: number;
  total_cost: number;
  after_discount: number;
  customer: Customer;
  employee: Employee;
  isDeleted: boolean;
  billDetails: BillDetail[];
  createdAt: string;
  totalQuantity: number;
  notes: string | null;
  pointsToUse: number | null;
  is_error: boolean;
}

interface BillResponse {
  content: Bill[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}
interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  suppliers: string;
  quantityAvailable: number;
  dateExpired: Date | null;
  salePrice: number | null;
  inputPrice: number;
  price: number;
  categoryId: number;
  categoryName: string;
}

function HoaDon() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedTime, setSelectedTime] = useState("allTime");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchBills();
  }, [currentPage, startDate, endDate]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    const response = await fetchAllProduct();
    setProducts(response);
  };

  const fetchBills = async () => {
    try {
      console.log("Request params:", {
        page: currentPage,
        size: ITEMS_PER_PAGE,
        search: searchTerm,
        startDate,
        endDate,
      });

      const response = await fetchBill(
        currentPage,
        ITEMS_PER_PAGE,
        searchTerm,
        startDate,
        endDate
      );

      console.log("API Response:", response);

      if (!response || !response.content) {
        console.error("Invalid response format:", response);
        setError("Dữ liệu trả về không đúng định dạng");
        return;
      }

      setBills(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError("Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.");
      throw err; // Re-throw error to be caught by handleSearch
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (bill: Bill) => {
    try {
      const billData = await fetchBillById(bill.id);
      setSelectedBill(billData);
      setIsModalOpen(true);
    } catch (error) {
      setError("Không thể tải chi tiết hóa đơn. Vui lòng thử lại sau.");
    }
  };
  const handleCloseModal = () => {
    setSelectedBill(null);
    setIsModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const onClickButton = () => {
    if (!tempStartDate || !tempEndDate) {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
      return;
    }

    const [startDay, startMonth, startYear] = tempStartDate.split("-");
    const [endDay, endMonth, endYear] = tempEndDate.split("-");

    const start = new Date(`${startYear}-${startMonth}-${startDay}`);
    const end = new Date(`${endYear}-${endMonth}-${endDay}`);

    if (end < start) {
      alert("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
      return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(0);
  };

  useEffect(() => {
    if (selectedTime === "thisMonth") {
      const now = new Date();

      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
      setCurrentPage(0);
    } else if (selectedTime === "allTime") {
      setStartDate("");
      setEndDate("");
      setTempStartDate("");
      setTempEndDate("");
      setCurrentPage(0);
    }
  }, [selectedTime]);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoadingSearch(true);
      setCurrentPage(0);
      try {
        await fetchBills();
      } finally {
        setLoadingSearch(false);
      }
    }
  };

  const handleDeleteClick = (billId: number) => {
    setBillToDelete(billId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!billToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteBillById(billToDelete);
      setIsDeleteModalOpen(false);
      setBillToDelete(null);
      // Refresh the bills list
      fetchBills();
    } catch (err) {
      console.error("Delete Error:", err);
      setError("Không thể xóa hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setBillToDelete(null);
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

  ///LOADING
  if (loading) {
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
            onClick={fetchBills}
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
        <title>Hóa đơn</title>
      </Helmet>

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">Hóa đơn</h1>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            {/* Nút chức năng */}
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer">
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Xuất file
              </button>
            </div>
          </div>
        </div>

        {/* Bộ lọc thời gian - phiên bản mobile */}
        <div className="mb-4 md:hidden bg-white shadow rounded-lg p-4">
          <h2 className="font-bold mb-2">Thời gian</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <input
                type="radio"
                name="timeFilter"
                id="allTimeMobile"
                value="allTime"
                checked={selectedTime === "allTime"}
                onChange={() => setSelectedTime("allTime")}
                className="cursor-pointer"
              />
              <label htmlFor="allTimeMobile" className="cursor-pointer">
                Tất cả
              </label>
            </li>
            <li className="flex items-center space-x-2">
              <input
                type="radio"
                name="timeFilter"
                id="thisMonthMobile"
                value="thisMonth"
                checked={selectedTime === "thisMonth"}
                onChange={() => setSelectedTime("thisMonth")}
                className="cursor-pointer"
              />
              <label htmlFor="thisMonthMobile" className="cursor-pointer">
                Tháng này
              </label>
            </li>
            <li className="flex items-start space-x-2">
              <input
                type="radio"
                name="timeFilter"
                id="customTimeMobile"
                value="customTime"
                checked={selectedTime === "customTime"}
                onChange={() => setSelectedTime("customTime")}
                className="cursor-pointer"
              />
              <label htmlFor="customTimeMobile" className="cursor-pointer">
                Thời gian khác
              </label>
            </li>
            {selectedTime === "customTime" && (
              <div className="pl-6 space-y-2">
                <div>
                  <label htmlFor="startDateMobile" className="block text-sm">
                    Từ ngày:
                  </label>
                  <input
                    type="date"
                    id="startDateMobile"
                    value={
                      tempStartDate
                        ? tempStartDate.split("-").reverse().join("-")
                        : ""
                    }
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split("-");
                      setTempStartDate(`${day}-${month}-${year}`);
                    }}
                    className="border p-1 rounded w-full"
                  />
                </div>
                <div>
                  <label htmlFor="endDateMobile" className="block text-sm">
                    Đến ngày:
                  </label>
                  <input
                    type="date"
                    id="endDateMobile"
                    value={
                      tempEndDate
                        ? tempEndDate.split("-").reverse().join("-")
                        : ""
                    }
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split("-");
                      setTempEndDate(`${day}-${month}-${year}`);
                    }}
                    className="border p-1 rounded w-full"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-6 py-1 cursor-pointer text-white bg-[#0070f4] hover:bg-[#0400f4] rounded transition-all duration-200 outline-none ring-offset-2 focus-visible:ring-2 active:scale-[0.98]"
                    onClick={onClickButton}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </ul>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar desktop */}
          <div className="hidden md:block w-full md:w-1/4 bg-white shadow rounded-lg p-4">
            <h2 className="font-bold mb-2">Thời gian</h2>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="timeFilter"
                  id="allTime"
                  value="allTime"
                  className="cursor-pointer"
                  checked={selectedTime === "allTime"}
                  onChange={() => setSelectedTime("allTime")}
                  disabled={loadingSearch}
                />
                <label htmlFor="allTime" className="cursor-pointer">
                  Tất cả
                </label>
              </li>
              <li className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="timeFilter"
                  id="thisMonth"
                  value="thisMonth"
                  className="cursor-pointer"
                  checked={selectedTime === "thisMonth"}
                  onChange={() => setSelectedTime("thisMonth")}
                  disabled={loadingSearch}
                />
                <label htmlFor="thisMonth" className="cursor-pointer">
                  Tháng này
                </label>
              </li>
              <li className="flex items-start space-x-2">
                <input
                  type="radio"
                  name="timeFilter"
                  id="customTime"
                  value="customTime"
                  className="cursor-pointer"
                  checked={selectedTime === "customTime"}
                  onChange={() => setSelectedTime("customTime")}
                  disabled={loadingSearch}
                />
                <label htmlFor="customTime" className="cursor-pointer">
                  Thời gian khác
                </label>
              </li>
              {selectedTime === "customTime" && (
                <div className="pl-6 space-y-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm">
                      Từ ngày:
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={
                        tempStartDate
                          ? tempStartDate.split("-").reverse().join("-")
                          : ""
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        setTempStartDate(`${day}-${month}-${year}`);
                      }}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm">
                      Đến ngày:
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={
                        tempEndDate
                          ? tempEndDate.split("-").reverse().join("-")
                          : ""
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        setTempEndDate(`${day}-${month}-${year}`);
                      }}
                      className="border p-1 rounded w-full"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      className="px-6 py-1 cursor-pointer text-white bg-[#0070f4] hover:bg-[#0400f4] rounded transition-all duration-200 outline-none ring-offset-2 focus-visible:ring-2 active:scale-[0.98]"
                      onClick={onClickButton}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </ul>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {loadingSearch ? (
              <div className="flex justify-center items-center h-80">
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-4xl text-blue-500 animate-spin mb-4"
                  />
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-80">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchBills}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {bills.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Không có hóa đơn nào
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mã HĐ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nhân viên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tổng tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{bill.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bill.customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {bill.customer.phone_number}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bill.employee.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {bill.employee.phone_number}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(bill.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(bill.after_discount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    bill.isDeleted
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {bill.isDeleted ? "Đã xóa" : "Hoàn thành"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                <button
                                  onClick={() => handleOpenModal(bill)}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                >
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="mr-1"
                                  />
                                  Chi tiết
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(bill.id)}
                                  className="text-red-600 hover:text-red-900 cursor-pointer"
                                  disabled={bill.isDeleted}
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
                            setCurrentPage((prev) => Math.max(0, prev - 1))
                          }
                          disabled={currentPage === 0}
                          className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Trang trước
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages - 1, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages - 1}
                          className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Trang sau
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Hiển thị{" "}
                            <span className="font-medium">
                              {currentPage * 10 + 1}
                            </span>{" "}
                            đến{" "}
                            <span className="font-medium">
                              {Math.min(
                                (currentPage + 1) * ITEMS_PER_PAGE,
                                totalElements
                              )}
                            </span>{" "}
                            của{" "}
                            <span className="font-medium">{totalElements}</span>{" "}
                            kết quả
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(0, prev - 1))
                              }
                              disabled={currentPage === 0}
                              className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              Trang trước
                            </button>
                            {getPaginationRange(
                              currentPage + 1,
                              totalPages
                            ).map((page, index) =>
                              typeof page === "number" ? (
                                <button
                                  key={index}
                                  onClick={() => setCurrentPage(page - 1)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                                    currentPage === page - 1
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
                                  Math.min(totalPages - 1, prev + 1)
                                )
                              }
                              disabled={currentPage === totalPages - 1}
                              className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              Trang sau
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa hóa đơn
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa hóa đơn #{billToDelete}? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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

      {/* Existing Bill Detail Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết hóa đơn #{selectedBill.id}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 cursor-pointer"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Thông tin khách hàng
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBill.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedBill.customer.phone_number}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Thông tin nhân viên
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBill.employee.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedBill.employee.phone_number}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Chi tiết sản phẩm
                  </h4>
                  <div className="mt-2 border-t border-gray-200">
                    {selectedBill.billDetails.map((detail, index) => (
                      <div key={index} className="py-2 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-900">
                            {detail.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {detail.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-gray-900">
                          {formatCurrency(detail.price * detail.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-500">Tổng số lượng:</p>
                    <p className="text-gray-900">
                      {selectedBill.totalQuantity}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-500">Tổng tiền:</p>
                    <p className="text-gray-900">
                      {formatCurrency(selectedBill.total_cost)}
                    </p>
                  </div>
                  {selectedBill.after_discount !== selectedBill.total_cost && (
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">Sau giảm giá:</p>
                      <p className="text-gray-900">
                        {formatCurrency(selectedBill.after_discount)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedBill.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Ghi chú
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBill.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        products={products}
        onSave={(newBill) => {
          // TODO: xử lý lưu bill mới, ví dụ gọi API
          console.log("Hóa đơn mới:", newBill);
          setBills([newBill, ...bills]);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}

export default HoaDon;
