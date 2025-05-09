import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import ReceiptDetail from "../components/ReceiptDetail";
import AddReceiptModal from "../components/AddReceiptModal";

interface Receipt {
  receiptID: string;
  time: string;
  totalCost: string;
  employeeID: string;
  note: string;

}

// Mảng dữ liệu phiếu nhập giả định
const receipts: Receipt[] = Array.from({ length: 20 }, (_, i) => ({
  receiptID: `REC${String(i + 1).padStart(6, "0")}`, // ID hóa đơn, ví dụ: BILL000001
  time: new Date(Date.now() - i * 86400000).toLocaleString("vi-VN"), // Thời gian, lùi lại 1 ngày mỗi hóa đơn
  totalCost: (1000000 + i * 50000).toLocaleString("vi-VN"), // Tổng tiền, tăng dần
  employeeID: `EMP${String((i % 3) + 1).padStart(3, "0")}`, // ID nhân viên (3 nhân viên khác nhau)
  note: `CUS${String((i % 5) + 1).padStart(3, "0")}`, // ID khách hàng (5 khách khác nhau)
}));

interface Product {
  id: string;
  name: string;
  price: string;
  cost: string;
  category: string;
  stock: number;
  image: string;
  supplier: string;
  expiry: string;
  notes: string;
}

const products: Product[] = Array.from({ length: 30 }, (_, i) => ({
  id: `SP${String(i + 1).padStart(6, "0")}`,
  name: `Sản phẩm ${i + 1}`,
  price: (100000 + i * 5000).toLocaleString("vi-VN"),
  cost: (95000 + i * 5000).toLocaleString("vi-VN"),
  category: ["Thực phẩm", "Đồ gia dụng", "Thời trang", "Thiết bị điện"][i % 4],
  stock: 300 - i * 10,
  image: "https://static.wikia.nocookie.net/menes-suecos/images/b/bc/Revendedor1.jpg/revision/latest?cb=20210323154547&path-prefix=pt-br",
  supplier: `Nhà cung cấp ${i % 5 + 1}`,
  expiry: `2025-${(i % 12 + 1).toString().padStart(2, "0")}-15`,
  notes: `Ghi chú cho sản phẩm ${i + 1}`
}));
const ITEMS_PER_PAGE = 10;

function KhoHang() {
  // Cơ chế phân trang
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(receipts.length / ITEMS_PER_PAGE);
  const displayedReceipts = receipts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // // MODAL CHI TIẾT SẢN PHẨM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

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
  const [selectedTime, setSelectedTime] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //MODAL THÊM MỚI
  const [openModalAdd, setOpenModalAdd] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Kho hàng</title>
      </Helmet>
  
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center pb-13">
          <h1 className="text-xl font-bold w-1/5">Kho hàng</h1>
          <div className="flex items-center justify-between w-4/5">
            {/* Thanh tìm kiếm */}
            <div className="relative w-2/5 ml-6">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
  
            {/* Nút chức năng */}
            <div className="space-x-5">
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => setOpenModalAdd(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-1 rounded">
                <FontAwesomeIcon icon={faFileExport} className="mr-2" /> Xuất file
              </button>
            </div>
          </div>
        </div>
  
        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/5 p-4 h-full bg-white shadow rounded-lg">
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
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
          <div className="w-4/5 ml-5">
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
                    {displayedReceipts.map((receipt) => (
                      <tr key={receipt.receiptID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.receiptID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.employeeID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.totalCost}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleOpenModal(receipt)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => alert(`Xóa phiếu ${receipt.receiptID}`)}
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                          currentPage === index + 1
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