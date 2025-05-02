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
} from "@fortawesome/free-solid-svg-icons";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchSummary, fetchSalesChart } from "../service/api";

// type SummaryType = {
//   homnay: {
//     tongbill: number;
//     khachhangmoi: number;
//     sanphamdaban: number;
//     doanhthu: number;
//   };
//   homqua: {
//     tongbill: number;
//     khachhangmoi: number;
//     sanphamdaban: number;
//     doanhthu: number;
//   };
// };

function TongQuan() {
  const [timeRange, setTimeRange] = useState("Tháng này");
  const [activeTab, setActiveTab] = useState("Theo ngày");
  const [sumary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  let calPercent = (today: number, yesterday: number) => {
    let x = ((today - yesterday) / yesterday) * 100;
    if (x < 0) {
      x *= -1;
    }
    return x.toFixed(2);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [activeTab, timeRange]);

  const loadData = async () => {
    const rs = await fetchSummary();
    setSummary(rs);
  };

  const loadChartData = async () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Tính toán khoảng thời gian dựa trên timeRange
    switch (timeRange) {
      case "Hôm qua":
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "7 ngày qua":
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
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
  };

  const summaryData = [
    {
      label: "Doanh thu",
      value: sumary?.homnay?.doanhthu?.toLocaleString("vi") || 0,
      percent:
        sumary?.homqua?.doanhthu === 0
          ? "0"
          : calPercent(sumary?.homnay?.doanhthu, sumary?.homqua?.doanhthu),
      icon: faDollarSign,
      color: "#4AD991",
      positive:
        sumary?.homnay?.doanhthu >= sumary?.homqua?.doanhthu ? true : false,
    },
    {
      label: "Hóa đơn",
      value: sumary?.homnay?.tongbill || 0,
      percent:
        sumary?.homqua?.tongbill === 0
          ? "0"
          : calPercent(sumary?.homnay?.tongbill, sumary?.homqua?.tongbill),
      icon: faReceipt,
      color: "#0070F4",
      positive:
        sumary?.homnay?.tongbill >= sumary?.homqua?.tongbill ? true : false,
    },
    {
      label: "Sản phẩm đã bán",
      value: sumary?.homnay?.sanphamdaban || 0,
      percent:
        sumary?.homqua?.sanphamdaban === 0
          ? "0"
          : calPercent(
              sumary?.homnay?.sanphamdaban,
              sumary?.homqua?.sanphamdaban
            ),
      icon: faBox,
      color: "#FEC53D",
      positive:
        sumary?.homnay?.sanphamdaban >= sumary?.homqua?.sanphamdaban
          ? true
          : false,
    },
    {
      label: "Khách hàng",
      value: sumary?.homnay?.khachhangmoi || 0,
      percent:
        sumary?.homqua?.khachhangmoi === 0
          ? "0"
          : calPercent(
              sumary?.homnay?.khachhangmoi,
              sumary?.homqua?.khachhangmoi
            ),
      icon: faUsers,
      color: "#F93C65",
      positive:
        sumary?.homnay?.khachhangmoi >= sumary?.homqua?.khachhangmoi
          ? true
          : false,
    },
  ];

  const timeRanges = ["Hôm qua", "7 ngày qua", "Tháng này", "Tháng trước"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Tổng quan</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            KẾT QUẢ BÁN HÀNG HÔM NAY
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {item.label}
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {item.value}
                  </p>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={item.positive ? faArrowTrendUp : faArrowTrendDown}
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
                  className="w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    color={item.color}
                    className="text-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              DOANH THU BÁN HÀNG
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                {["Theo ngày", "Theo giờ", "Theo thứ"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
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
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
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

          <div className="h-[400px]">
            {chartData && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TongQuan;
