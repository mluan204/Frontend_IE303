import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bar } from "react-chartjs-2";
import { fetchSalesChart, fetchSalesReport } from "../service/mainApi";

function DoanhThu() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState<any>(null);
  //loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadChartData();
    loadReportData();
  }, [selectedDate]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      // Convert to UTC to match backend timezone
      const startDateUTC = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      );
      const endDateUTC = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      );

      const data = await fetchSalesChart(
        "HOURLY",
        startDateUTC.toISOString(),
        endDateUTC.toISOString()
      );

      if (data) {
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Doanh thu",
              data: data.data,
              backgroundColor: "#3b82f6",
              borderRadius: 6,
              maxBarThickness: 30,
              minBarLength: 4,
            },
          ],
        });
      } else {
        setError("Dữ liệu trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải biểu đồ:", err);
      setError("Không thể tải biểu đồ doanh thu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportData = async () => {
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    const startDateUTC = new Date(
      startDate.getTime() - startDate.getTimezoneOffset() * 60000
    );
    const endDateUTC = new Date(
      endDate.getTime() - endDate.getTimezoneOffset() * 60000
    );
    const data = await fetchSalesReport(
      startDateUTC.toISOString(),
      endDateUTC.toISOString()
    );
    console.log(data);
    setReportData(data);
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu biểu đồ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadChartData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto bg-white py-6">
      <Helmet>
        <title>Báo cáo doanh thu</title>
      </Helmet>

      {/* Ngày */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">
          Báo cáo ngày {format(new Date(selectedDate), "dd-MM-yyyy")}
        </h2>
        <div className="relative w-8 h-8 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-gray-600 w-5 h-5 cursor-pointer z-10"
          />
          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="absolute left-0 top-0 w-8 h-8 z-10 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Tổng giao dịch */}
      <div className="border border-gray-300 rounded-lg mb-6 p-4 sm:p-6">
        <div className="hidden sm:grid grid-cols-3 font-semibold text-sm p-3 border-b border-gray-300">
          <div>Loại</div>
          <div>Giao dịch</div>
          <div className="text-right">Tổng số tiền thu được</div>
        </div>
        {reportData &&
          [
            {
              label: "Tổng",
              transactions: reportData.totalTransactions,
              total: reportData.totalAmount,
            },
            {
              label: "Khánh vãng lai",
              transactions: reportData.guestTransactions,
              total: reportData.guestAmount,
            },
            {
              label: "Khách hàng thân thiết",
              transactions: reportData.loyalTransactions,
              total: reportData.loyalAmount,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:grid sm:grid-cols-3 p-3 text-base border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between sm:block">
                <span className="font-semibold sm:hidden">Loại:</span>
                <span>{item.label}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="font-semibold sm:hidden">Giao dịch:</span>
                <span>{item.transactions}</span>
              </div>
              <div className="flex justify-between sm:block text-right sm:text-right">
                <span className="font-semibold sm:hidden">Tổng tiền:</span>
                <span>{item.total.toLocaleString()}đ</span>
              </div>
            </div>
          ))}

        <h3 className="font-bold text-lg sm:text-xl border-b border-gray-300 py-4">
          Chi tiết
        </h3>
        {reportData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 text-base">
            <div className="p-3">
              Tổng số khách:{" "}
              <span className="font-semibold">{reportData.totalCustomers}</span>
            </div>
            <div className="p-3">
              Trung bình mỗi khách:{" "}
              <span className="font-semibold">
                {reportData.averagePerCustomer.toLocaleString()}đ
              </span>
            </div>
            <div className="p-3">
              Số hóa đơn giảm giá:{" "}
              <span className="font-semibold">
                {reportData.discountedBillsAmount.toLocaleString()}đ
              </span>
            </div>
            <div className="p-3">
              Trung bình giá tiền giảm giá:{" "}
              <span className="font-semibold">
                {reportData.averageDiscountAmount.toLocaleString()}đ
              </span>
            </div>
            <div className="p-3">
              Hoàn tiền:{" "}
              <span className="font-semibold">
                {reportData.refundAmount.toLocaleString()}đ
              </span>
            </div>
            <div className="p-3">
              Tổng phí dịch vụ thu được:{" "}
              <span className="font-semibold">
                {reportData.serviceFeeAmount.toLocaleString()}đ
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chi tiết biểu đồ */}
      <h2 className="text-lg font-semibold mt-10">Doanh thu theo giờ</h2>
      <div className="bg-white shadow rounded-lg p-4 mt-3 h-[300px] sm:h-[400px]">
        <Bar
          data={chartData || { labels: [], datasets: [] }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { display: true } },
              x: { grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  );
}

export default DoanhThu;
