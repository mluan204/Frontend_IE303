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
import { fetchSummary } from "../service/api";

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
  const [activeTab, setActiveTab] = useState("Ngày");
  const [sumary, setSummary] = useState<any>(null);
  // const [loading, setLoading] = useState(true);

  let calPercent = (today: number, yesterday: number) => {
    let x = ((today - yesterday) / yesterday) * 100;
    if (x < 0) {
        x *= -1;
    }
    return x.toFixed(2);
}

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const rs = await fetchSummary();
    setSummary(rs);
    console.log("Summary: ", rs);
    // setLoading(false)
  };

  const summaryData = [
    {
      label: "Doanh thu",
      value: (sumary?.homnay?.doanhthu)?.toLocaleString('vi') || 0,
      percent: sumary?.homqua?.doanhthu === 0 ? "0" : calPercent(sumary?.homnay?.doanhthu,sumary?.homqua?.doanhthu) ,
      icon: faDollarSign,
      color: "#4AD991",
      positive: sumary?.homnay?.doanhthu >= sumary?.homqua?.doanhthu ? true : false,
    },
    {
      label: "Hóa đơn",
      value: sumary?.homnay?.tongbill || 0,
      percent: sumary?.homqua?.tongbill === 0 ? "0" : calPercent(sumary?.homnay?.tongbill,sumary?.homqua?.tongbill),
      icon: faReceipt,
      color: "#0070F4",
      positive: sumary?.homnay?.tongbill >= sumary?.homqua?.tongbill ? true : false,
    },
    {
      label: "Sản phẩm đã bán",
      value: sumary?.homnay?.sanphamdaban || 0,
      percent: sumary?.homqua?.sanphamdaban === 0 ? "0" : calPercent(sumary?.homnay?.sanphamdaban,sumary?.homqua?.sanphamdaban),
      icon: faBox,
      color: "#FEC53D",
      positive: sumary?.homnay?.sanphamdaban >= sumary?.homqua?.sanphamdaban ? true : false,
    },
    {
      label: "Khách hàng",
      value: sumary?.homnay?.khachhangmoi || 0,
      percent: sumary?.homqua?.khachhangmoi === 0 ? "0" : calPercent(sumary?.homnay?.khachhangmoi,sumary?.homqua?.khachhangmoi),
      icon: faUsers,
      color: "#F93C65",
      positive: sumary?.homnay?.khachhangmoi >= sumary?.homqua?.khachhangmoi ? true : false,
    },
  ];

  const generateSalesData = () => {
    let labels = [];
    if (activeTab === "Theo ngày") {
      labels = Array.from({ length: 20 }, (_, i) => String(i + 1));
    } else if (activeTab === "Theo giờ") {
      labels = ["00:00", "06:00", "12:00", "18:00"];
    } else {
      labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    }

    const data = labels.map(() => Math.floor(Math.random() * 1500000 + 500000));
    const maxValue = Math.max(...data);

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data,
          backgroundColor: "#3b82f6",
          maxBarThickness: 40,
        },
      ],
    };
  };

  return (
    <div className="bg-[#E8EAED]">
      <Helmet>
        <title>Tổng quan</title>
      </Helmet>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">KẾT QUẢ BÁN HÀNG HÔM NAY</h1>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {summaryData.map((item, index) => (
            <div
              key={index}
              className="p-6 flex items-center justify-between bg-white shadow rounded-lg"
            >
              <div>
                <h3 className="text-lg">{item.label}</h3>
                <p className="text-xl font-bold">{item.value}</p>
                <p
                  className={`text-sm flex items-center ${
                    item.positive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item.positive ? (
                    <FontAwesomeIcon icon={faArrowTrendUp} className="mr-3" />
                  ) : (
                    <FontAwesomeIcon icon={faArrowTrendDown} className="mr-3" />
                  )}{" "}
                  {item.percent}% so với hôm qua
                </p>
              </div>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: `${item.color}30` }}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  color={item.color}
                  className="text-2xl"
                />
              </div>
            </div>
          ))}
        </div>

        <h1 className="text-xl font-bold mb-2">DOANH THU BÁN HÀNG</h1>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              {["Theo ngày", "Theo giờ", "Theo thứ"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 border-b-3 ${
                    activeTab === tab
                      ? "border-b-indigo-500 text-indigo-600"
                      : "border-b-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              className="p-2 border rounded-lg"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {[
                "Hôm nay",
                "Hôm qua",
                "7 ngày qua",
                "Tháng này",
                "Tháng trước",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <Bar
            data={generateSalesData()}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>
      </div>
    </div>
  );
}

export default TongQuan;
