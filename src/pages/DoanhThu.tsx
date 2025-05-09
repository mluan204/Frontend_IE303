import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { format } from "date-fns";
import { Bar } from "react-chartjs-2";

function DoanhThu() {

  const [selectedDate, setSelectedDate] = useState(new Date());

  
  const generateSalesData = () => {
    // Tạo 12 mốc thời gian trong ngày, cách nhau 2 tiếng
    const labels = Array.from({ length: 12 }, (_, i) => {
      const hour = i * 2;
      return `${hour.toString().padStart(2, "0")}:00`;
    });
  
    const data = labels.map(() => Math.floor(Math.random() * 1500000 + 500000));
  
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu theo giờ",
          data,
          backgroundColor: "#3b82f6",
          maxBarThickness: 40,
        },
      ],
    };
  };
  

  const data = {
    date: "Thứ Hai 07-04-2025",
    dineIn: {
      transactions: 18,
      total: 1943000,
    },
    takeAway: {
      transactions: 0,
      total: 0,
    },
    details: {
      totalCustomers: 18,
      avgPerTransaction: 107944,
      avgPerCustomer: 107944,
      discount: 0,
      refund: 0,
      serviceFee: 0,
    },
  };

  return (
    
    <div className="w-5/6 mx-auto bg-white p-6 ">
      <Helmet>
        <title>Báo cáo doanh thu</title>
      </Helmet>
      {/* Ngày */}
      <div className="flex justify-between items-center gap-2 mb-4 ">
        <h2 className="text-lg font-semibold">
          Báo cáo ngày {format(new Date(selectedDate), "dd-MM-yyyy")}
        </h2>

        <div className="relative w-8 h-8 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-gray-600 w-5 h-5 cursor-pointer z-10 "
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
      <div className="border border-gray-400 rounded-md mb-6 p-6">
        <div className="grid grid-cols-3 font-semibold text-sm p-3 border-b border-gray-400">
          <div>Loại</div>
          <div>Giao dịch</div>
          <div className="text-right">Tổng số tiền thu được</div>
        </div>

        {/* Tổng */}
        <div className="grid grid-cols-3 p-3 text-xl font-medium items-center ">
          <div className='flex text-center '>Tổng</div>
          <div>{data.dineIn.transactions + data.takeAway.transactions}</div>
          <div className="text-right text-2xl font-bold">{data.dineIn.total.toLocaleString()}đ</div>
        </div>

        {/* Khánh vãng lai */}
        <div className="grid grid-cols-3 p-3  text-base">
          <div className="pl-4">Khánh vãng lai</div>
          <div>{data.dineIn.transactions}</div>
          <div className="text-right">{data.dineIn.total.toLocaleString()}đ</div>
        </div>

        {/* Khách hàng thân thiết */}
        <div className="grid grid-cols-3 border-b border-gray-400 p-3 text-base">
          <div className="pl-4">Khách hàng thân thiết</div>
          <div>{data.takeAway.transactions}</div>
          <div className="text-right">{data.takeAway.total.toLocaleString()}đ</div>
        </div>

        <h3 className="font-bold text-xl border-b border-gray-400 py-4">Chi tiết</h3>
        <div className="grid grid-cols-2 text-base ">
          <div className='p-3 '>Tổng số khách: <span className="font-semibold">{data.details.totalCustomers}</span></div>
          <div className='p-3'>Trung bình mỗi khách: <span className="font-semibold">{data.details.avgPerCustomer.toLocaleString()}đ</span></div>
          <div className=' p-3'>Số hóa đơn giảm giá: <span className="font-semibold">{data.details.avgPerTransaction}đ</span></div>
          <div className='p-3'>Trung bình giá tiền giảm giá: <span className="font-semibold">{data.details.discount.toLocaleString()}đ</span></div>
          <div className='p-3 '>Hoàn tiền: <span className="font-semibold">{data.details.refund.toLocaleString()}đ</span></div>
          <div className=' p-3 '>Tổng phí dịch vụ thu được: <span className="font-semibold">{data.details.serviceFee.toLocaleString()}đ</span></div>
        </div>

      </div>

      {/* Chi tiết */}
      <h2 className="text-lg font-semibold mt-10">
          Doanh thu theo giờ
        </h2>
      <div className="bg-white shadow rounded-lg p-4 mt-3">
        <Bar data={generateSalesData()} options={{ plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
}   

export default DoanhThu;