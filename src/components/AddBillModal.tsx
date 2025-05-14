import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  price: string;
  cost: string;
  category: string;
  stock: number;
  image: string;
  supplier: string;
  expiry: string;
  notes: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  discount: number;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (data: any) => void;
}

export default function AddBillModal({ isOpen, onClose, products, onSave }: AddBillModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [billInfo, setBillInfo] = useState({
    customerName: "",
    employeeName: "",
    note: "",
  });

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
          cost: parseInt(product.price.replace(/\D/g, "")),
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleChange = (id: string, value: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: value } : p))
    );
  };

  const totalQuantity = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.cost * (1 - p.discount / 100),
    0
  );

  const handleSubmit = () => {
    onSave({
      ...billInfo,
      total_cost: totalCost,
      totalQuantity,
      billDetails: selectedProducts,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-h-[90vh] shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tạo hóa đơn mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
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
                      <th className="px-4 py-2 text-left">STT</th>
                      <th className="px-4 py-2 text-left">Tên SP</th>
                      <th className="px-4 py-2 text-left">Đơn giá</th>
                      <th className="px-4 py-2 text-left">Số lượng</th>
                      <th className="px-4 py-2 text-left">Thành tiền</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-100">
                        <td className="px-4 py-2">SP00{p.id}</td>
                        <td className="px-4 py-2 max-w-[160px] truncate">{p.name}</td>
                        <td className="px-4 py-2">{p.cost.toLocaleString("vi-VN")}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) => handleChange(p.id, +e.target.value)}
                            className="w-16 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">{(p.quantity * p.cost).toLocaleString("vi-VN")} đ</td>
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

          {/* Bill Info */}
          <div className="w-full lg:w-1/3 lg:h-auto h-1/2 p-6 overflow-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Khách hàng</label>
              <input
                type="text"
                value={billInfo.customerName}
                onChange={(e) => setBillInfo({ ...billInfo, customerName: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Nhân viên bán</label>
              <input
                type="text"
                value={billInfo.employeeName}
                onChange={(e) => setBillInfo({ ...billInfo, employeeName: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Ghi chú</label>
              <textarea
                rows={4}
                value={billInfo.note}
                onChange={(e) => setBillInfo({ ...billInfo, note: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Tổng số lượng</label>
              <input
                type="text"
                readOnly
                value={totalQuantity}
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
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

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Lưu hóa đơn
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
