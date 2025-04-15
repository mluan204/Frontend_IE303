import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faQrcode,
  faCreditCard,
  faDeleteLeft,
} from "@fortawesome/free-solid-svg-icons";

const paymentMethods = [
  { label: "Tiền mặt", icon: faMoneyBillWave },
  { label: "Momo", icon: faQrcode },
  { label: "VISA", icon: faCreditCard },
  { label: "ATM", icon: faCreditCard },
  { label: "Khác", icon: faCreditCard },
];
interface PopupThanhToanProps {
    total: number;
    onClose: () => void;
  }
  
export default function PopupThanhToan({ total, onClose }:PopupThanhToanProps) {
  const [received, setReceived] = useState(total);

  const quickAmounts = [256000, 260000, 270000];
  const change = Math.max(0, Number(received) - total);

  const handleInput = (val: number) => {
    setReceived((prev) => (prev === 0 ? val : prev + val));
  };

  // const handleDelete = () => {
  //   setReceived((prev) => prev.slice(0, -1) || "0");
  // };

  const handleClear = () => {
    setReceived(0);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        
      <div className="bg-white rounded-lg shadow-lg w-[900px] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thanh toán - {total.toLocaleString()}đ</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">×</button>
        </div>

        <div className="flex gap-4">
          {/* Danh sách phương thức thanh toán */}
          <div className="w-1/4 space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.label}
                className="flex items-center px-3 py-2 w-full border rounded hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={method.icon} className="mr-2" />
                {method.label}
              </button>
            ))}
          </div>

          {/* Nội dung thanh toán */}
          <div className="w-3/4">
            {/* Số tiền nhận và tổng */}
            <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
              <div>
                <label className="block font-medium">Đã nhận</label>
                <div className="border p-2 rounded">{Number(received).toLocaleString()}đ</div>
              </div>
              <div>
                <label className="block font-medium">Tổng tiền thanh toán</label>
                <div className="border p-2 rounded">{total.toLocaleString()}đ</div>
              </div>
              <div>
                <label className="block font-medium">Tiền thừa</label>
                <div className="border p-2 rounded">{change.toLocaleString()}đ</div>
              </div>
            </div>

            {/* Gợi ý nhanh */}
            <div className="flex gap-4 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setReceived(amount)}
                  className="border px-4 py-2 rounded bg-green-100 text-green-700 font-medium"
                >
                  {amount.toLocaleString()}đ
                </button>
              ))}
            </div>

            {/* Bàn phím */}
            <div className="grid grid-cols-3 gap-3 text-lg font-semibold">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => handleInput(n)}
                  className="p-4 border rounded hover:bg-gray-100"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleInput(0)}
                className="p-4 border rounded hover:bg-gray-100 col-span-1"
              >
                0
              </button>
              <button onClick={() => handleInput(0)} className="p-4 border rounded hover:bg-gray-100">
                000
              </button>
              <button  className="p-4 border rounded hover:bg-gray-100">
                <FontAwesomeIcon icon={faDeleteLeft} />
              </button>
              <button onClick={handleClear} className="p-4 border rounded hover:bg-gray-100 col-span-3">
                C
              </button>
            </div>

            {/* Nút xác nhận */}
            <div className="mt-6">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded">
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
