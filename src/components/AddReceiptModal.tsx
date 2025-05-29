import React, { useState, useMemo, use, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { getAllEmployees } from "../service/employeeApi";
import { addReceipt } from "../service/receiptApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image: string;
  supplier: string;
  notes: string;
}

interface SelectedProduct {
  id: number;
  name: string;
  cost: number;
  quantity: number;
  discount: number;
}

interface AddReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function AddReceiptModal({ isOpen, onClose, products }: AddReceiptModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [receiptInfo, setReceiptInfo] = useState({
    time: "",
    employeeID: 0,
    note: "",
    totalCost: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  const isValid =
  receiptInfo.time.trim() !== "" &&
  receiptInfo.employeeID !== 0 &&
  selectedProducts.length > 0;


  useEffect(() => {
    const fetchEmployee = async () => {
      const response = await getAllEmployees();
      setEmployees(response);
    };
    fetchEmployee();
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
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16); // định dạng yyyy-MM-ddTHH:mm
      setReceiptInfo((prev) => ({ ...prev, time: localISOTime }));
    }
  }, [isOpen]);


  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          cost: product.price,
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleChange = (id: number, field: keyof SelectedProduct, value: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveReceipt = async () => {
    const formData = {
      created_at: new Date(receiptInfo.time).toISOString(),
      total_cost: totalCost,
      note: receiptInfo.note,
      employeeId: receiptInfo.employeeID,
      receiptDetails: selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        input_price: p.cost,
        isCheck: true
      })),
    };
    console.log(formData);
    const id = await addReceipt(formData);
    if(id){      
       toast.success("Thêm phiếu nhập kho thành công!", { autoClose: 1000 });
    }else{
      toast.error("Thêm phiếu nhập kho thất bại!", { autoClose: 1000 })
    }
    console.log(id);
    window.location.reload();
  };

  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.cost * (1 - p.discount / 100),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tạo phiếu nhập hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x h-[calc(90vh-60px)]">
          {/* Product List */}
          <div className="w-full lg:w-2/3 flex flex-col lg:h-auto h-1/2 overflow-hidden">
            <div className="sticky top-0 z-10 bg-white p-4">
              <input
                type="text"
                placeholder="Tìm hàng hóa theo tên..."
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
                      <th className="px-4 py-2 text-left">STT</th>
                      <th className="px-4 py-2 text-left">Tên SP</th>
                      <th className="px-4 py-2 text-left">Giá</th>
                      <th className="px-4 py-2 text-left">Số lượng</th>
                      <th className="px-4 py-2 text-left">Thành tiền</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-100">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 max-w-[160px] truncate">{p.name}</td>
                        <td className="px-4 py-2"><input
                          type="number"
                          value={p.cost===0? "": p.cost}
                          min={0}
                          className="w-20 border rounded text-sm"
                          onChange={(e) => handleChange(p.id, "cost", +e.target.value)}
                        /></td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={p.quantity}
                            min={1}
                            className="w-16 border rounded text-sm"
                            onChange={(e) => handleChange(p.id, "quantity", +e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">{(p.quantity * p.cost).toLocaleString("vi-VN")}đ</td>
                        <td className="px-4 py-2">
                          <button onClick={() => handleRemoveProduct(p.id)}>
                            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => handleAddProduct(p)}>
                        <td colSpan={6} className="px-4 py-2 text-gray-700 truncate max-w-[160px]">
                          + {p.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="w-full lg:w-1/3 lg:h-auto h-1/2 p-6 overflow-auto space-y-4">
            {/* Thời gian */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Thời gian</label>
              <input
                type="datetime-local"
                value={receiptInfo.time}
                onChange={(e) => setReceiptInfo({ ...receiptInfo, time: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm"
              />
            </div>

            {/* Người nhập */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Người nhập</label>
              <select
                value={receiptInfo.employeeID}
                onChange={(e) => setReceiptInfo({ ...receiptInfo, employeeID: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-1 text-sm bg-white"
              >
                <option value="">Chọn nhân viên</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Tổng tiền hàng</label>
              <input
                type="text"
                readOnly
                value={totalCost.toLocaleString("vi-VN") + "đ"}
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Ghi chú</label>
              <textarea
                value={receiptInfo.note}
                onChange={(e) => setReceiptInfo({ ...receiptInfo, note: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSaveReceipt}
                disabled={!isValid}
                className={`px-4 py-2 text-white text-sm rounded ${
                  isValid ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Lưu phiếu
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-red-400 text-white text-sm rounded">
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}