import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";

interface ComboItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Combo {
  id: number;
  time_end: string;
  created_at: string;
  items: ComboItem[];
}

interface ComboDetailProps {
  combo: Combo;
  isOpen: boolean;
  onClose: () => void;
}

function ComboDetail({ combo, isOpen, onClose }: ComboDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCombo, setEditedCombo] = useState(combo);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCombo((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết combo sản phẩm</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-6 pb-6 scrollbar-hide space-y-6">
          {/* Combo Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["id", "created_at", "time_end"].map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-500 block mb-1 capitalize">
                  {field === "id" ? "Mã combo" :
                   field === "startDate" ? "Ngày bắt đầu" :
                   field === "endDate" ? "Ngày kết thúc" : field}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={(editedCombo as any)[field] || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                ) : (
                  <div className="text-gray-900 text-sm">
                    {field === "totalPrice"
                      ? Number((editedCombo as any)[field]).toLocaleString() + "đ"
                      : (editedCombo as any)[field]}
                  </div>
                )}
              </div>
            ))}
            
          </div>

          {/* Danh sách sản phẩm trong combo */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">Danh sách sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-2">
                <thead className="bg-gray-50 sticky top-0 z-10 border-t border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">STT</th>
                    <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                    <th className="px-3 py-2 text-center">Số lượng</th>
                    <th className="px-3 py-2 text-right">Giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="border-b border-gray-200">
                  {editedCombo.items.map((item, index) => (
                    <tr key={item.product_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.price.toLocaleString()}đ</td>
                      <td className="px-3 py-2 text-right">{(item.price * item.quantity).toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            {isEditing ? (
              <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Lưu
              </button>
            ) : (
              <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faEdit} className="mr-2" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComboDetail;
