import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faReceipt,
  faBox,
  faUsers,
  faArrowTrendUp,
  faArrowTrendDown,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchSummary, fetchSalesChart } from "../service/mainApi";
import AOS from "aos";
import "aos/dist/aos.css";

function TongQuan() {
  const [timeRange, setTimeRange] = useState("Tháng này");
  const [activeTab, setActiveTab] = useState("Theo ngày");
  const [sumary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let calPercent = (
    today: number | undefined,
    yesterday: number | undefined
  ) => {
    console.log(today, yesterday);
    if (today === undefined || yesterday === undefined) {
      return "0";
    }
    if (yesterday === 0) {
      return today > 0 ? "100" : "0";
    }
    let x = ((today - yesterday) / yesterday) * 100;
    if (x < 0) {
      x *= -1;
    }
    return x.toFixed(2);
  };

  useEffect(() => {
    loadData();
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    loadChartData();
  }, [activeTab, timeRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rs = await fetchSummary();
      setSummary(rs);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", err);
      setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      setIsChartLoading(true);
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (timeRange) {
        case "Tháng này":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
        case "Tháng trước":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999
          );
          break;
      }

      // Convert to UTC to match backend timezone
      const startDateUTC = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      );
      const endDateUTC = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      );

      const type =
        activeTab === "Theo ngày"
          ? "DAILY"
          : activeTab === "Theo giờ"
          ? "HOURLY"
          : "WEEKLY";
      const data = await fetchSalesChart(
        type,
        startDate.toISOString(),
        endDate.toISOString()
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
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const getSummaryData = () => {
    if (!sumary) return [];

    return [
      {
        label: "Doanh thu",
        value: sumary.homnay?.doanhthu?.toLocaleString("vi") || 0,
        percent: calPercent(sumary.homnay?.doanhthu, sumary.homqua?.doanhthu),
        icon: faDollarSign,
        color: "#4AD991",
        positive:
          (sumary.homnay?.doanhthu || 0) >= (sumary.homqua?.doanhthu || 0),
      },
      {
        label: "Hóa đơn",
        value: sumary.homnay?.tongbill || 0,
        percent: calPercent(sumary.homnay?.tongbill, sumary.homqua?.tongbill),
        icon: faReceipt,
        color: "#0070F4",
        positive:
          (sumary.homnay?.tongbill || 0) >= (sumary.homqua?.tongbill || 0),
      },
      {
        label: "Sản phẩm đã bán",
        value: sumary.homnay?.sanphamdaban || 0,
        percent: calPercent(
          sumary.homnay?.sanphamdaban,
          sumary.homqua?.sanphamdaban
        ),
        icon: faBox,
        color: "#FEC53D",
        positive:
          (sumary.homnay?.sanphamdaban || 0) >=
          (sumary.homqua?.sanphamdaban || 0),
      },
      {
        label: "Khách hàng",
        value: sumary.homnay?.khachhangmoi || 0,
        percent: calPercent(
          sumary.homnay?.khachhangmoi,
          sumary.homqua?.khachhangmoi
        ),
        icon: faUsers,
        color: "#F93C65",
        positive:
          (sumary.homnay?.khachhangmoi || 0) >=
          (sumary.homqua?.khachhangmoi || 0),
      },
    ];
  };

  const timeRanges = ["Tháng này", "Tháng trước"];

  //  LOADING
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
            onClick={loadData}
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
        <title>Tổng quan</title>
      </Helmet>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            KẾT QUẢ BÁN HÀNG HÔM NAY
          </h1>
        </div>

        {/* Summary Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
          data-aos="fade-up"
        >
          {isLoading
            ? // Loading skeleton
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-full">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                ))
            : getSummaryData().map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {item.label}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        {item.value}
                      </p>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={
                            item.positive ? faArrowTrendUp : faArrowTrendDown
                          }
                          className={`mr-2 ${
                            item.positive ? "text-green-500" : "text-red-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            item.positive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {item.percent}% so với hôm qua
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        color={item.color}
                        className="text-lg sm:text-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Chart Section */}
        <div
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          data-aos="fade-down"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              DOANH THU BÁN HÀNG
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:space-x-4">
              <div className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
                {["Theo ngày", "Theo giờ", "Theo thứ"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${
                        activeTab === tab
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${
                        timeRange === range
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[300px] sm:h-[400px]">
            {isChartLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-3xl text-blue-500 animate-spin mb-4"
                  />
                </div>
              </div>
            ) : (
              chartData && (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TongQuan;
