import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  price: string;
}

interface SelectedComboItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AddComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (combo: {
    created_at: string;
    time_end: string;
    items: SelectedComboItem[];
  }) => void;
}

export default function AddComboModal({ isOpen, onClose, products, onSave }: AddComboModalProps) {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>([]);
  const [comboInfo, setComboInfo] = useState({
    time_end: "",
    created_at: "",
  });

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          !selectedItems.some((sp) => sp.id === p.id)
      ),
    [search, products, selectedItems]
  );

  const handleAddProduct = (product: Product) => {
    if (!selectedItems.find((p) => p.id === product.id)) {
      setSelectedItems([
        ...selectedItems,
        {
          id: product.id,
          name: product.name,
          price: parseInt(product.price.replace(/\D/g, "")),
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedItems(selectedItems.filter((p) => p.id !== id));
  };

  const handleChange = (id: string, field: keyof SelectedComboItem, value: number) => {
    setSelectedItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = () => {
    if (!comboInfo.time_end || selectedItems.length === 0) {
      alert("Vui lòng nhập ngày hết hạn và chọn ít nhất một sản phẩm.");
      return;
    }
    onSave({ ...comboInfo, items: selectedItems });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tạo combo sản phẩm</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x h-[calc(90vh-60px)]">
          {/* Product List */}
          <div className="w-full lg:w-2/3 flex flex-col lg:h-auto h-1/2 overflow-hidden">
            <div className="sticky top-0 z-10 bg-white p-4">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              />
            </div>
            <div className="flex-1 overflow-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">STT</th>
                    <th className="px-4 py-2 text-left">Tên SP</th>
                    <th className="px-4 py-2 text-left">Số lượng</th>
                    <th className="px-4 py-2 text-left">Giá tiền</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 max-w-[160px] truncate">{p.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={p.quantity}
                          min={1}
                          className="w-16 border rounded text-sm"
                          onChange={(e) => handleChange(p.id, "quantity", +e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={p.price}
                          className="w-24 border rounded px-2 text-sm text-right"
                          onChange={(e) => handleChange(p.id, "price", +e.target.value)}
                        />
                      </td>

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

          {/* Combo Info */}
          <div className="w-full lg:w-1/3 lg:h-auto h-1/2 p-6 overflow-auto space-y-4">

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Ngày tạo</label>
              <input
                type="text"
                readOnly
                value={new Date().toISOString().slice(0, 10)} 
                className="w-full border rounded px-3 py-1 bg-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Ngày hết hạn</label>
              <input
                type="date"
                value={comboInfo.time_end}
                onChange={(e) => setComboInfo({ ...comboInfo, time_end: e.target.value })}
                className="w-full border rounded px-3 py-1 text-sm"
              />

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Lưu
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
