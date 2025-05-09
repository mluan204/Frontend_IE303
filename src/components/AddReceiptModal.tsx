import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";

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

interface AddReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function AddReceiptModal({ isOpen, onClose, products }: AddReceiptModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [receiptInfo, setReceiptInfo] = useState({
    receiptID: "",
    time: "",
    employeeID: "",
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
          cost: parseInt(product.cost.replace(/\D/g, "")),
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleChange = (id: string, field: keyof SelectedProduct, value: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.cost * (1 - p.discount / 100),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-11/12 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tạo phiếu nhập hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex divide-x h-[calc(90vh-60px)]">
          {/* Product List */}
          <div className="w-2/3 p-4 overflow-auto scrollbar-hide">
            <input
              type="text"
              placeholder="Tìm hàng hóa theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4 text-sm"
            />
            <table className="min-w-full divide-y divide-gray-200" >
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
                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-4 py-2 text-sm">{p.name}</td>
                    <td className="px-4 py-2 text-sm">{p.cost.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <input
                        type="number"
                        value={p.quantity}
                        min={1}
                        className="w-16 border rounded text-sm"
                        onChange={(e) => handleChange(p.id, "quantity", +e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {(p.quantity * p.cost).toLocaleString()}đ
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <button onClick={() => handleRemoveProduct(p.id)}>
                        <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => handleAddProduct(p)}>
                    <td colSpan={6} className="px-4 py-2 text-gray-700 text-sm">
                      + {p.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Receipt Info */}
          <div className="w-1/3 p-6 overflow-auto space-y-4">
            {[
              { label: "Mã phiếu nhập", key: "receiptID" },
              { label: "Thời gian", key: "time" },
              { label: "Người nhập", key: "employeeID" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-500 block mb-1">{field.label}</label>
                <input
                  type="text"
                  value={(receiptInfo as any)[field.key]}
                  onChange={(e) => setReceiptInfo({ ...receiptInfo, [field.key]: e.target.value })}
                  className="w-full border rounded px-3 py-1 text-sm"
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Tổng tiền hàng</label>
              <input
                type="text"
                readOnly
                value={totalCost.toLocaleString("vi-VN") + "đ"}
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Ghi chú</label>
              <textarea
                value={receiptInfo.note}
                onChange={(e) => setReceiptInfo({ ...receiptInfo, note: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-green-500 text-white text-sm rounded">
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
