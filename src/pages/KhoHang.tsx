import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport } from "@fortawesome/free-solid-svg-icons";
import ReceiptDetail from "../components/ReceiptDetail";
import { fetchAllReciept, fetchReciept } from "../service/api";
import { CommonUtils } from "../utils/CommonUtils";

interface Receipt {
  id: string;
  created_at: string;
  total_cost: string;
  employee_name: string;
  note: string;

}

const ITEMS_PER_PAGE = 10;

function KhoHang() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    getReceipts();
  }, [currentPage, search]);
  
  const handleOnClickExport = async () => {
    try {
      const res = await fetchAllReciept();
      if (res ) {
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
  return (
    
    <div className="bg-[#E8EAED]">
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
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FontAwesomeIcon icon={faSearch}></FontAwesomeIcon></span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Các nút chức năng */}
            <div className="space-x-5">
              <button className="bg-green-500 text-white px-4 py-1 rounded"><FontAwesomeIcon icon={faAdd} className="mr-2"/>Thêm mới</button>
              <button className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={handleOnClickExport}
              ><FontAwesomeIcon icon={faFileExport} className="mr-2"
              /> Xuất file</button>
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
          {/* TỔNG THU CHI */}
          <div className="w-4/5">            
            {/*BẢNG PHIẾU NHẬP*/}
            <div className="h-5/6 ml-5">
              <div className="overflow-y-auto h-80 scrollbar-hide">
                <table className="w-full border-collapse">
                 {/* LABEL */}
                  <thead className="bg-[#E6F1FE] sticky top-0">
                    <tr className="border-b border-[#A6A9AC]">
                      <th className="p-2 text-left">Mã phiếu nhập</th>
                      <th className="p-2 text-left">Thời gian</th>
                      <th className="p-2 text-left">Nhân viên</th>
                      <th className="p-2 text-left">Tổng tiền</th>
                    </tr>
                  </thead>
                  {/* PHIẾU NHẬP*/}
                  <tbody>
                    {receipts.map((receipt, index) => (
                        <tr
                          key={receipt.id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100 border-b border-[#A6A9AC]"} hover:bg-[#E6F1FE]`}
                          onClick={() => handleOpenModal(receipt)}
                        >
                          <td className="p-2">{receipt.id}</td>
                          <td className="p-2">{new Date(receipt.created_at).toLocaleString("vi-VN")}</td>
                          <td className="p-2">{receipt.employee_name}</td>
                          <td className="p-2">{receipt.total_cost}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>

                

              </div>
              {/* Phân trang */}
              <div className="flex items-center mt-4 ">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-2 disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    ◀
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-2  disabled:opacity-50"
                    disabled={currentPage === totalPages}
                  >
                    ▶
                  </button>
              </div>
                  
              {/* Pop-up chi tiết hóa đơn */}
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
      </div>
    </div>
  );
}

export default KhoHang;