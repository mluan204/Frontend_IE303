import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import ReceiptDetail from "../components/ReceiptDetail";
import { fetchAllProduct, fetchAllReciept, fetchReciept } from "../service/mainApi";
import { CommonUtils } from "../utils/CommonUtils";
import AddReceiptModal from "../components/AddReceiptModal";
import { deleteReceiptById } from "../service/receiptApi";

interface Receipt {
  id: number;
  created_at: string;
  total_cost: string;
  employee_name: string;
  note: string;

}


interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image: string;
  supplier: string;
  expiry: string;
  notes: string;
}

const ITEMS_PER_PAGE = 10;

function KhoHang() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTime, setSelectedTime] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  // // MODAL CHI TIẾT SẢN PHẨM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  //MODAL THÊM MỚI
  const [openModalAdd, setOpenModalAdd] = useState(false);

  // // Mở modal và truyền thông tin sản phẩm
  const handleOpenModal = (bill: Receipt) => {
    setSelectedReceipt(bill);
    setIsModalOpen(true);
  };

  // // Đóng modal
  const handleCloseModal = () => {
    setSelectedReceipt(null);
    setIsModalOpen(false);
  };
  

  const getReceipts = async () => {
    setIsLoading(true);
    const response = await fetchReciept(currentPage - 1, ITEMS_PER_PAGE, search);
    console.log(response);
    if (typeof response === "string") {
      console.error(response);
    } else {
      const data = response.data;
      setReceipts(data.content || []);
      setTotalPages(data.totalPages || 1);
    }


    setIsLoading(false);
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    const response = await fetchAllProduct();
    setProducts(response);
  };

  useEffect(() => {
    getReceipts();
  }, [currentPage, search]);

  const handleOnClickExport = async () => {
    try {
      const res = await fetchAllReciept();
      if (res) {
        const mappedData = res.data.map((item: Receipt) => ({
          "Mã phiếu nhập": item.id,
          "Thời gian": new Date(item.created_at).toLocaleString("vi-VN"),
          "Nhân viên": item.employee_name,
          "Tổng tiền": item.total_cost,
          "Ghi chú": item.note || "",
        }));
        await CommonUtils.exportExcel(mappedData, "Danh sách phiếu nhập", "Phiếu nhập kho");

      }
    } catch (error) {
      console.error("Error exporting product list:", error);
      alert("Đã xảy ra lỗi khi xuất file!");
    }
  };

  const onClickDeleteProduct = async (receipt: Receipt) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập hàng này?`);
    if (confirmDelete) {
      try {
        const result = await deleteReceiptById(receipt.id);
        console.log(result);
        getReceipts(); // Refresh lại danh sách
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm!");
        console.error(error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Kho hàng</title>
      </Helmet>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">Kho hàng</h1>
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Nút chức năng */}
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setOpenModalAdd(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleOnClickExport}
              >
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
                id="thisMonthMobile"
                value="thisMonth"
                checked={selectedTime === "thisMonth"}
                onChange={() => setSelectedTime("thisMonth")}
                className="cursor-pointer"
              />
              <label htmlFor="thisMonthMobile" className="cursor-pointer">Tháng này</label>
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
              <label htmlFor="customTimeMobile" className="cursor-pointer">Thời gian khác</label>
            </li>
            {selectedTime === "customTime" && (
              <div className="pl-6 space-y-2">
                <div>
                  <label htmlFor="startDateMobile" className="block text-sm">Từ ngày:</label>
                  <input
                    type="date"
                    id="startDateMobile"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </div>
                <div>
                  <label htmlFor="endDateMobile" className="block text-sm">Đến ngày:</label>
                  <input
                    type="date"
                    id="endDateMobile"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </div>
              </div>
            )}
          </ul>
        </div>

        {/* Phiên bản desktop */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar desktop */}
          <div className="hidden md:block w-full md:w-1/4 bg-white shadow rounded-lg p-4">
            <h2 className="font-bold mb-2">Thời gian</h2>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="timeFilter"
                  id="thisMonth"
                  value="thisMonth"
                  className="cursor-pointer"
                  checked={selectedTime === "thisMonth"}
                  onChange={() => setSelectedTime("thisMonth")}
                />
                <label htmlFor="thisMonth" className="cursor-pointer">Tháng này</label>
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
                />
                <label htmlFor="customTime" className="cursor-pointer">Thời gian khác</label>
              </li>
              {selectedTime === "customTime" && (
                <div className="pl-6 space-y-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm">Từ ngày:</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm">Đến ngày:</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                </div>
              )}
            </ul>
          </div>


          {/* DANH SÁCH PHIẾU NHẬP */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu nhập</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(receipt.created_at).toLocaleString("vi-VN")}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.employee_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.total_cost}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleOpenModal(receipt)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => onClickDeleteProduct(receipt)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                {/* MOBILE: Trang trước / sau */}
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Trang trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Trang sau
                  </button>
                </div>

                {/* DESKTOP: Số trang + điều hướng */}
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, receipts.length)}
                    </span>{" "}
                    của{" "}
                    <span className="font-medium">{receipts.length}</span> kết quả
                  </p>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Trang trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${currentPage === index + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Trang sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Chi tiết phiếu */}
            {selectedReceipt && (
              <ReceiptDetail
                receipt={selectedReceipt}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal thêm mới */}
      <AddReceiptModal
        isOpen={openModalAdd}
        onClose={() => setOpenModalAdd(false)}
        products={products}
      />
    </div>
  );
}

export default KhoHang;