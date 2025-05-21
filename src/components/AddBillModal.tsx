import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getAllEmployees } from "../service/employeeApi";
import { getAllCustomer } from "../service/customerApi";
import { createBill } from "../service/billApi";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  suppliers: string;
  quantityAvailable: number;
  dateExpired: Date | null;
  salePrice: number | null;
  inputPrice: number;
  price: number;
  categoryId: number;
  categoryName: string;
}

interface Bill {
  id: number;
  total_cost: number;
  after_discount: number;
  customer: Customer;
  employee: Employee;
  isDeleted: boolean;
  billDetails: BillDetail[];
  createdAt: string;
  totalQuantity: number;
  notes: string | null;
  pointsToUse: number | null;
  is_error: boolean;
}

interface BillDetail {
  productId: number;
  productName: string;
  price: number;
  afterDiscount: number | null;
  quantity: number;
}

interface SelectedProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (data: any) => void;
}

interface Employee {
  id: number;
  name: string;
  address: string;
  birthday: string;
  created_at: string;
  email: string;
  gender: boolean;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
}

interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

export default function AddBillModal({
  isOpen,
  onClose,
  products,
  onSave,
}: AddBillModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [billInfo, setBillInfo] = useState({
    customerId: 0,
    employeeId: 0,
    note: "",
  });
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [customer, setCustomer] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllEmployees();
      console.log("Get all employees");
      setEmployee(response);
      const responseCustomer = await getAllCustomer();
      console.log("Get all customers");
      setCustomer(responseCustomer);
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          !selectedProducts.some((sp) => sp.id === p.id)
      ),
    [search, products, selectedProducts]
  );

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleChange = (id: number, value: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: value } : p))
    );
  };

  const totalQuantity = selectedProducts.reduce(
    (sum, p) => sum + p.quantity,
    0
  );
  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.price * (1 - p.discount / 100),
    0
  );

  const handleSubmit = async () => {
    const formData = {
      employee: {
        id: billInfo.employeeId,
      },
      customer: {
        id: billInfo.customerId,
      },
      billDetails: selectedProducts.map((p) => ({
        productId: p.id,
        afterDiscount: p.price - (p.price * p.discount) / 100,
        quantity: p.quantity,
      })),
      pointsToUse: 0,
      notes: billInfo.note,
    };

    const id = await createBill(formData);

    const newBill: Bill = {
      id: id,
      total_cost: totalCost,
      after_discount: totalCost,
      customer: customer.find((c) => c.id === billInfo.customerId)!,
      employee: employee.find((e) => e.id === billInfo.employeeId)!,
      isDeleted: false,
      billDetails: selectedProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        price: p.price,
        afterDiscount: p.price - (p.price * p.discount) / 100,
        quantity: p.quantity,
      })),
      createdAt: new Date().toISOString(),
      totalQuantity: totalQuantity,
      notes: billInfo.note,
      pointsToUse: 0,
      is_error: false,
    };
    console.log(newBill);
    onSave(newBill);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-h-[90vh] shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Tạo hóa đơn mới
          </h2>
          <FontAwesomeIcon
            icon={faClose}
            className="text-2xl text-gray-500 cursor-pointer"
            onClick={onClose}
          />
        </div>

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x h-[calc(90vh-60px)]">
          {/* Product List */}
          <div className="w-full lg:w-2/3 flex flex-col lg:h-auto h-1/2 overflow-hidden">
            <div className="sticky top-0 z-10 bg-white p-4">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              />
            </div>
            <div className="flex-1 overflow-auto scrollbar-hide">
              <div className="min-w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Mã SP</th>
                      <th className="px-4 py-2 text-left">Tên SP</th>
                      <th className="px-4 py-2 text-left">Đơn giá</th>
                      <th className="px-4 py-2 text-left">Số lượng</th>
                      <th className="px-4 py-2 text-left">Thành tiền</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-100">
                        <td className="px-4 py-2">{p.id}</td>
                        <td className="px-4 py-2 max-w-[160px] truncate">
                          {p.name}
                        </td>
                        <td className="px-4 py-2">
                          {p.price.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) =>
                              handleChange(p.id, +e.target.value)
                            }
                            className="w-16 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {(p.quantity * p.price).toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => handleRemoveProduct(p.id)}>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-red-500"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleAddProduct(p)}
                      >
                        <td
                          colSpan={6}
                          className="px-4 py-2 text-gray-700 truncate max-w-[160px]"
                        >
                          + {p.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bill Info */}
          <div className="w-full lg:w-1/3 lg:h-auto h-1/2 p-6 overflow-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                Khách hàng
              </label>
              <select
                value={billInfo.customerId}
                onChange={(e) =>
                  setBillInfo({
                    ...billInfo,
                    customerId: parseInt(e.target.value),
                  })
                }
                className="w-full border rounded px-3 py-1 text-sm"
              >
                <option value="">Chọn khách hàng</option>
                {customer.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.id === 0 ? "" : " - " + c.phone_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                Nhân viên bán
              </label>
              <select
                value={billInfo.employeeId}
                onChange={(e) =>
                  setBillInfo({
                    ...billInfo,
                    employeeId: parseInt(e.target.value),
                  })
                }
                className="w-full border rounded px-3 py-1 text-sm"
              >
                <option value="">Chọn nhân viên</option>
                {employee.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {e.id === 0 ? "" : " - " + e.phone_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                Ghi chú
              </label>
              <textarea
                rows={4}
                value={billInfo.note}
                onChange={(e) =>
                  setBillInfo({ ...billInfo, note: e.target.value })
                }
                className="w-full border rounded px-3 py-1 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                Tổng số lượng
              </label>
              <input
                type="text"
                readOnly
                value={totalQuantity}
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                Tổng tiền hàng
              </label>
              <input
                type="text"
                readOnly
                value={totalCost.toLocaleString("vi-VN") + "đ"}
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Lưu hóa đơn
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-400 text-white text-sm rounded"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
