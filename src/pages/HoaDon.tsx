import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import BillDetail from "../components/BillDetail";
import { fetchBill, fetchBillById } from "../service/api";
// import debounce from "lodash.debounce";
// import { useCallback } from "react";

// interface Bill {
//   billID: string;
//   time: string;
//   totalCost: string;
//   customerID: string;
//   employeeID: string;
//   afterDiscount: string;
// }

// // Mảng dữ liệu sản phẩm giả định
// const bills: Bill[] = Array.from({ length: 20 }, (_, i) => ({
//   billID: `BILL${String(i + 1).padStart(6, "0")}`, // ID hóa đơn, ví dụ: BILL000001
//   time: new Date(Date.now() - i * 86400000).toLocaleString("vi-VN"), // Thời gian, lùi lại 1 ngày mỗi hóa đơn
//   totalCost: (1000000 + i * 50000).toLocaleString("vi-VN"), // Tổng tiền, tăng dần
//   customerID: `CUS${String((i % 5) + 1).padStart(3, "0")}`, // ID khách hàng (5 khách khác nhau)
//   employeeID: `EMP${String((i % 3) + 1).padStart(3, "0")}`, // ID nhân viên (3 nhân viên khác nhau)
//   afterDiscount: (900000 + i * 45000).toLocaleString("vi-VN"), // Sau giảm giá, tăng dần
// }));

const ITEMS_PER_PAGE = 10;

function HoaDon() {
  // Cơ chế phân trang
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [displayedBills, setDisplayedBills] = useState<any>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // // MODAL CHI TIẾT SẢN PHẨM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // // Mở modal và truyền thông tin sản phẩm
  const handleOpenModal = async (billId: number) => {
    try {
      const billData = await fetchBillById(billId);
      setSelectedBill(billData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy hóa đơn:", error);
    }
  };

  // // Đóng modal
  const handleCloseModal = () => {
    setSelectedBill(null);
    setIsModalOpen(false);
  };

  const [selectedTime, setSelectedTime] = useState("allTime");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetchBill(
        currentPage - 1,
        ITEMS_PER_PAGE,
        search,
        startDate,
        endDate
      );
      console.log(response);
      setDisplayedBills(response.content);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, startDate, endDate]);

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
      setCurrentPage(1);
    } else if (selectedTime === "allTime") {
      setStartDate("");
      setEndDate("");
      setTempStartDate("");
      setTempEndDate("");
      setCurrentPage(1);
    }
  }, [selectedTime]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#E8EAED] h-screen">
      <Helmet>
        <title>Sổ quỹ</title>
      </Helmet>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="text-xl font-bold w-1/5">Hóa đơn</h1>
          <div className="flex items-center justify-between w-4/5">
            {/* Thanh tìm kiếm */}
            <div className="relative w-2/5 ml-6">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                    fetchData(); // Gọi hàm tìm kiếm
                  }
                }}
              />
            </div>

            {/* Các nút chức năng */}
            <div className="space-x-5">
              <button className="bg-green-500 text-white px-4 py-1 rounded">
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-1 rounded">
                <FontAwesomeIcon icon={faFileExport} className="mr-2" /> Xuất
                file
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
                  id="allTime"
                  value="allTime"
                  className="cursor-pointer"
                  checked={selectedTime === "allTime"}
                  onChange={() => setSelectedTime("allTime")}
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
                      value={
                        tempStartDate
                          ? tempStartDate.split("-").reverse().join("-")
                          : ""
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        setTempStartDate(`${day}-${month}-${year}`); // set theo format dd-MM-yyyy
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
                        setTempEndDate(`${day}-${month}-${year}`); // set theo format dd-MM-yyyy
                      }}
                      className="border p-1 rounded w-full"
                    />
                  </div>

                  <div className="flex justify-end mt-4 transition-all duration-200 outline-none  ring-offset-2 focus-visible:ring-2  active:scale-[0.98]">
                    <div className="inline-block bg-[#0070f4] hover:bg-[#0400f4] rounded">
                      <button
                        className="px-6 py-1 cursor-pointer text-white "
                        onClick={onClickButton}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </div>
          {/* DANH SÁCH HÓA ĐƠN */}
          {/* TỔNG THU CHI */}
          <div className="w-4/5">
            <div className="h-1/6 bg-white ml-5 mb-3 p-5">
              <div className="flex justify-end gap-20 text-center">
                <div className="flex flex-col">
                  <span className="font-bold">Quỹ đầu kỳ</span>
                  <span className="text-black">0</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Tổng thu</span>
                  <span className="text-blue-600">8,919,000</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Tổng chi</span>
                  <span className="text-red-600">-8,910,000</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Tồn quỹ</span>
                  <span className="text-green-600">9,000</span>
                </div>
              </div>
            </div>
            {/*BẢNG HÓA ĐƠN*/}
            <div className="h-5/6 ml-5">
              <div className="overflow-y-auto h-80">
                <table className="w-full border-collapse">
                  {/* LABEL */}
                  <thead className="bg-[#E6F1FE] sticky top-0">
                    <tr className="border-b border-[#A6A9AC]">
                      <th className="p-2 text-left">Mã hóa đơn</th>
                      <th className="p-2 text-left">Thời gian</th>
                      <th className="p-2 text-left">Nhân viên</th>
                      <th className="p-2 text-left">Tổng tiền</th>
                    </tr>
                  </thead>
                  {/* HÓA ĐƠN*/}
                  <tbody>
                    {displayedBills.map((bill: any, index: number) => {
                      const isDeleted = bill.isDeleted;
                      return (
                        <tr
                          key={bill.id}
                          className={`
                        ${
                          isDeleted
                            ? "bg-red-100 text-red-600 line-through"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-100 border-b border-[#A6A9AC]"
                        }
                        hover:bg-[#E6F1FE] cursor-pointer
                      `}
                          onClick={() => !isDeleted && handleOpenModal(bill.id)} // Ngăn click nếu bill bị xóa
                        >
                          <td className="p-2">HD00{bill.id}</td>
                          <td className="p-2">
                            {bill.createdAt
                              ? new Date(bill.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </td>
                          <td className="p-2">{bill.employee.name}</td>
                          <td className="p-2">
                            {bill.after_discount.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Phân trang */}
              <div className="flex items-center mt-4 ">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="p-2 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  ◀
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="p-2  disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
              </div>

              {/* Pop-up chi tiết hóa đơn */}
              {selectedBill && (
                <BillDetail
                  bill={selectedBill}
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

export default HoaDon;
