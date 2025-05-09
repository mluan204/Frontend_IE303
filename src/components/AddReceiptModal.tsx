import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faTrash } from "@fortawesome/free-solid-svg-icons";

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

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedProducts.some(sp => sp.id === p.id)
    ), [search, products, selectedProducts]);

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, {
        id: product.id,
        name: product.name,
        cost: parseInt(product.cost.replace(/\D/g, "")),
        quantity: 1,
        discount: 0
      }]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const handleChange = (id: string, field: keyof SelectedProduct, value: number) => {
    setSelectedProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.cost * (1 - p.discount / 100),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white w-11/12 h-[90vh] shadow-lg rounded overflow-hidden flex flex-col">
        {/* Headbar */}
        <div className="bg-[#C3F5DB] p-2 text-lg font-semibold flex justify-between items-center">
          <span>Nhập hàng</span>
          <FontAwesomeIcon icon={faClose} className="cursor-pointer text-xl" onClick={onClose} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Products */}
          <div className="w-2/3 p-4 overflow-hidden flex flex-col">
            <input
              type="text"
              placeholder="Tìm hàng hóa theo mã hoặc tên"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded mb-2"
            />
            <div className="overflow-auto flex-1 scrollbar-hide rounded border border-gray-300">
              <table className="w-full text-sm">
                <thead className="bg-[#E6F1FE] sticky top-0">
                  <tr>
                    <th className="p-3 text-left">STT</th>
                    <th className="p-3 text-left">Mã sản phẩm</th>
                    <th className="p-3 text-left">Tên sản phẩm</th>
                    <th className="p-3 text-left">Số lượng</th>
                    <th className="p-3 text-left">Đơn giá</th>
                    <th className="p-3 text-left">Thành tiền</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((p, idx) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-100">
                      <td className="p-2 align-middle">{idx + 1}</td>
                      <td className="p-2 align-middle">{p.id}</td>
                      <td className="p-2 align-middle">{p.name}</td>
                      <td className="p-2 align-middle">
                        <input
                          type="number"
                          min="1"
                          value={p.quantity}
                          onChange={e => handleChange(p.id, 'quantity', +e.target.value)}
                          className="w-16 border border-gray-400 rounded"
                        />
                      </td>
                      <td className="p-2 align-middle">{p.cost.toLocaleString()}</td>
                      {/* <td className="p-2 align-middle">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={p.discount}
                          onChange={e => handleChange(p.id, 'discount', +e.target.value)}
                          className="w-16 border border-gray-400 rounded"
                        />
                      </td> */}
                      <td className="p-2 align-middle">{(p.quantity * p.cost * (1 - p.discount / 100)).toLocaleString()}</td>
                      <td className="p-2 align-middle">
                        <button onClick={() => handleRemoveProduct(p.id)}>
                          <FontAwesomeIcon icon={faTrash} className="text-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-500">Không tìm thấy sản phẩm</td>
                    </tr>
                  )}
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id} className="cursor-pointer hover:bg-blue-100" onClick={() => handleAddProduct(p)}>
                      <td colSpan={8} className="px-3 py-2 text-gray-700">
                        + {p.name} <span className="text-sm text-green-600 ml-2"></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Receipt Info */}
          <div className="w-1/3 p-4 border-l overflow-auto space-y-3 bg-white">
            <div>
              <label className="block font-semibold mb-1">Mã nhập hàng:</label>
              <input className="w-full border border-gray-400 rounded p-2" value={receiptInfo.receiptID} onChange={(e) => setReceiptInfo({ ...receiptInfo, receiptID: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Thời gian:</label>
              <input className="w-full border border-gray-400 rounded p-2" value={receiptInfo.time} onChange={(e) => setReceiptInfo({ ...receiptInfo, time: e.target.value })} />
            </div>
            {/* <div>
              <label className="block font-semibold mb-1">Nhà cung cấp:</label>
              <input className="w-full border border-gray-400 rounded p-2" placeholder="-- Chưa chọn --" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Trạng thái:</label>
              <input className="w-full border border-gray-400 rounded p-2 bg-gray-100" value="Phiếu tạm" readOnly />
            </div> */}
            <div>
              <label className="block font-semibold mb-1">Người nhập:</label>
              <input className="w-full border border-gray-400 rounded p-2" value={receiptInfo.employeeID} onChange={(e) => setReceiptInfo({ ...receiptInfo, employeeID: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Tổng tiền hàng:</label>
              <input className="w-full border border-gray-400 rounded p-2 bg-gray-100" readOnly value={totalCost.toLocaleString()} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Ghi chú:</label>
              <textarea className="w-full border border-gray-400 rounded p-2" value={receiptInfo.note} onChange={(e) => setReceiptInfo({ ...receiptInfo, note: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-green-500 text-white px-4 py-2 rounded">✅ Hoàn thành</button>
              <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">❌ Hủy bỏ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
