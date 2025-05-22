import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faQrcode,
  faCreditCard,
  faPlus,
  faUser,
  faUserTie,
  faUserTag 
} from "@fortawesome/free-solid-svg-icons";
import { createBill } from "../service/billApi";
import { ca, it } from "date-fns/locale";
import { getAllCustomer } from "../service/customerApi";
import { getAllEmployees, getWeeklyShifts } from "../service/employeeApi";
import { format } from "date-fns";
import type { Shift } from "../service/employeeApi";
import { createCustomer } from "../service/customerApi";

const paymentMethods = [
  { label: "Tiền mặt", icon: faMoneyBillWave },
  { label: "Chuyển khoản", icon: faQrcode },
  { label: "Thẻ", icon: faCreditCard },
  { label: "Khác", icon: faCreditCard },
];

interface PopupThanhToanProps {
  total: number;
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  onClose: () => void;
}


interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

interface Employee {
  id: number;   
  name: string;
}


export default function PopupThanhToan({ total, cart, onClose, setCart }: PopupThanhToanProps) {
  const [selectedMethod, setSelectedMethod] = useState("Tiền mặt");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState(total - discount);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone_number: "", gender: "male" });
  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

   const [employeesToday, setEmployeesToday] = useState<Employee[]>([]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

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
    setCustomer(prev => ({
      ...prev,
      [name === "phone" ? "phone_number" : name]: value,
    }));
  };

  console.log("Khách hàng:", customer);

  const handleCreateBill = async () => {
    if (!selectedEmployee || !selectedCustomer) {
      alert("Vui lòng chọn nhân viên và khách hàng.");
      return;
    }

    const payload = {
      employee: { id:selectedEmployee.id },
      customer: { id:selectedCustomer.id },
      billDetails: cart.map(item => ({
        productId: item.id,
        afterDiscount:  item.discount? item.discount : item.price,
        quantity: item.quantity
      })),
      pointsToUse: discount,
      notes: paymentMethods.find(method => method.label === selectedMethod)?.label,
    };

    try {
      const response = await createBill(payload);

      if (response) {
        alert("Tạo hóa đơn thành công!");
        setCart([])
        onClose();
      } else {
        const err = await response.json();
        console.error("Lỗi khi tạo hóa đơn:", err);
        alert("Tạo hóa đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi mạng:", error);
      alert("Lỗi khi gửi yêu cầu.");
    }
  };

  const fetchCustomers = async () => {
      const result = await getAllCustomer();
      if ( result ) {
        setCustomers(result);
      } else {
        
      }
    };

  const fetchEmployees = async () => {
      const result = await getAllEmployees();
      if ( result ) {
        setEmployees(result);
      } else {
        
      }
    };


  useEffect(() => {
    fetchCustomers();
    fetchTodayShifts();
    fetchEmployees();
    fetchTodayShifts();
  }
  , []);

  

  const fetchTodayShifts = async () => {
  const today = format(new Date(), "yyyy-MM-dd'T'00:00:00");

  try {
    const weeklyShifts = await getWeeklyShifts(today);
    const todayDate = new Date().toISOString().split("T")[0];

    const todayShifts: Shift[] = weeklyShifts.filter(
      (shift) => shift.date.split("T")[0] === todayDate
    );

    const todayEmployees: Employee[] = employees.filter(emp =>
      todayShifts.some(shift => shift.employeeId === emp.id)
    );

    setEmployeesToday(todayEmployees);
    console.log("Nhân viên hôm nay:", todayEmployees);
  } catch (err) {
    console.log(err);
  }
};


  const handleSaveCustomer = async () => {
  // Kiểm tra dữ liệu bắt buộc
  if (!customer.name.trim() || !customer.phone_number.trim() || !customer.gender) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  // Có thể thêm kiểm tra định dạng số điện thoại nếu muốn
  const phoneRegex = /^\d{9,12}$/; // ví dụ 9-12 chữ số
  if (!phoneRegex.test(customer.phone_number)) {
    alert("Số điện thoại không hợp lệ");
    return;
  }

  const customerData = {
    name: customer.name,
    phone_number: customer.phone_number,
    score: 0,
    gender: customer.gender === "male" ? true : false,
    id: 0,
    created_at: "",
  };

  setCustomers(prev => [...prev, customerData]);

  try {
    const newCustomerId = await createCustomer(customerData);
    console.log("Khách hàng mới tạo id:", newCustomerId);
    setIsAddingCustomer(false);
    setCustomer({ name: "", phone_number: "", gender: "male" });

    // TODO: Nếu cần cập nhật danh sách khách hàng, gọi fetch lại hoặc callback
    // fetchCustomers(); hoặc props.onCustomerAdded(newCustomerId);
  } catch (error) {
    console.error("Lỗi tạo khách hàng:", error);
    alert("Tạo khách hàng thất bại, vui lòng thử lại.");
  }

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
            <div className="mb-4 flex items-center gap-4">
              {/* Chọn nhân viên */}
              <div className="flex items-center gap-2 w-1/2">
                <FontAwesomeIcon icon={faUserTie} className=" absolute ml-2 mr-1 text-gray-500" />
                <select
                  className="border rounded-lg pl-6 pr-3 py-2 w-full text-sm focus:outline-none"
                  value={selectedEmployee?.id ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const selected = employees.find(emp => emp.id === id);
                    setSelectedEmployee(selected || null);
                  }}
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* Tìm và chọn khách hàng */}
              <div className="flex items-center gap-2 w-1/2 relative">
                <FontAwesomeIcon icon={faUserTag} className="  absolute ml-2 mr-1 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm khách hàng..."
                  value={selectedCustomer ? selectedCustomer.name : search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedCustomer(null); // Clear khi đang tìm mới
                  }}
                  className="border rounded-lg pl-8 pr-3 py-2 w-full text-sm focus:outline-none"
                  readOnly={!!selectedCustomer}
                  onClick={() => selectedCustomer && setSelectedCustomer(null)} // Bỏ chọn khi click vào ô đã chọn
                />
                <button
                  onClick={() => setIsAddingCustomer(true)}
                  className=" absolute end-2 top-1.5 hover:text-blue-600 text-xl"
                  title="Thêm khách hàng"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>

                {/* Gợi ý danh sách khách hàng khi chưa chọn */}
                {!selectedCustomer && search && (
                  <ul className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow z-10 max-h-40 overflow-y-auto text-sm">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <li
                          key={c.id}
                          className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setSearch('');
                          }}
                        >
                          {c.name}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500 italic">Không tìm thấy khách hàng</li>
                    )}
                  </ul>
                )}
              </div>
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
                      value={customer.phone_number}
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
                      onClick={() => {
                        handleSaveCustomer();

                      }}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tổng, đã nhận, tiền thừa */}
            <div className="mb-2 text-sm md:text-base ">
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
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded"
                onClick={handleCreateBill}
              >
                In hóa đơn và hoàn tất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
