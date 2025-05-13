import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faQrcode,
  faCreditCard,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const paymentMethods = [
  { label: "Tiền mặt", icon: faMoneyBillWave },
  { label: "Chuyển khoản", icon: faQrcode },
  { label: "Thẻ", icon: faCreditCard },
  { label: "Khác", icon: faCreditCard },
];

interface PopupThanhToanProps {
  total: number;
  cart: any[];
  onClose: () => void;
}

export default function PopupThanhToan({ total, cart, onClose }: PopupThanhToanProps) {
  const [selectedMethod, setSelectedMethod] = useState("Tiền mặt");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState(total - discount);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", gender: "male" });
  const [search, setSearch] = useState("");

  const suggestCashAmounts = (amount: number): number[] => {
    const denominations = [10000, 20000, 50000, 100000, 200000, 500000];
    const suggestions: number[] = [];

    for (let denom of denominations) {
      let next = Math.ceil(amount / denom) * denom;
      if (!suggestions.includes(next)) suggestions.push(next);
    }

    return suggestions.sort((a, b) => a - b).slice(0, 4);
  };

  const change = received - total > 0 ? received - total : 0;
  const suggestions = suggestCashAmounts(total - discount);

  const handleCustomerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thanh toán - {total.toLocaleString()}đ</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">×</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Phương thức thanh toán */}
          <div className="md:w-1/4 space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.label}
                onClick={() => setSelectedMethod(method.label)}
                className={`flex items-center px-3 py-2 w-full border rounded text-sm ${
                  selectedMethod === method.label ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon icon={method.icon} className="mr-2" />
                {method.label}
              </button>
            ))}
          </div>

          {/* Nội dung thanh toán */}
          <div className="md:w-3/4">
            {/* Khách hàng */}
            <div className="mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-gray-500" />
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-3 py-2 w-full text-sm"
              />
              <button
                onClick={() => setIsAddingCustomer(true)}
                className="hover:text-blue-600 text-xl"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {isAddingCustomer && (
              <div className="border p-4 mb-4 rounded bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="font-bold mb-2">Thêm khách hàng mới</h3>
                  <button onClick={() => setIsAddingCustomer(false)} className="text-gray-600 hover:text-black text-xl">×</button>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-4 text-sm">
                  <div className="w-full md:w-1/3">
                    <label className="block font-medium mb-1">Tên khách hàng</label>
                    <input
                      type="text"
                      name="name"
                      value={customer.name}
                      onChange={handleCustomerInput}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="block font-medium mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerInput}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="block font-medium mb-1">Giới tính</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={customer.gender === "male"}
                          onChange={handleCustomerInput}
                        />
                        Nam
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={customer.gender === "female"}
                          onChange={handleCustomerInput}
                        />
                        Nữ
                      </label>
                    </div>
                  </div>
                  <div className="md:w-auto">
                    <button
                      onClick={() => setIsAddingCustomer(false)}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tổng, đã nhận, tiền thừa */}
            <div className="mb-2 text-sm md:text-base mr-2 md:mr-7 ml-2 md:ml-5">
              <div className="flex items-center justify-between py-3 pr-3">
                <label className="block font-medium">Tổng tiền hóa đơn</label>
                <div>{total.toLocaleString("vi-VN")}</div>
              </div>

              <div className="flex items-center justify-between py-3">
                <label className="block font-medium">Giảm giá</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-32 text-right border-b border-gray-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between py-3 pr-3">
                <label className="block font-medium">Khách hàng cần trả</label>
                <div>{(total - discount).toLocaleString("vi-VN")}</div>
              </div>

              <div className="flex items-center justify-between py-3">
                <label className="block font-medium">Khách hàng thanh toán</label>
                <input
                  type="number"
                  value={received}
                  onChange={(e) => setReceived(Number(e.target.value))}
                  className="w-32 text-right border-b border-gray-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between py-3 pr-3">
                <label className="block font-medium">Tiền thừa</label>
                <div>{change.toLocaleString()}</div>
              </div>
            </div>

            {/* Gợi ý nhanh */}
            {selectedMethod === "Tiền mặt" && (
              <div className="flex flex-wrap gap-4 py-3 mr-2 md:mr-7 ml-2 md:ml-5">
                {suggestions.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setReceived(amount)}
                    className="border px-4 py-2 rounded-4xl focus:bg-blue-500 focus:text-white hover:bg-blue-400 hover:text-white font-medium"
                  >
                    {amount.toLocaleString("vi-VN")}đ
                  </button>
                ))}
              </div>
            )}

            {/* Xác nhận thanh toán */}
            <div className="mt-6">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded">
                In hóa đơn và hoàn tất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
