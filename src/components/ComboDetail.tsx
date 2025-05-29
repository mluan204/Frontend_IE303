import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../utils/FormatDate";
import { updateCombo } from "../service/comboApi";
import { toast } from "react-toastify";

interface ComboProduct {
  productId: number;
  price: number;
  quantity: number;
}

interface Combo {
  id: number;
  timeEnd: string;
  createdAt: string;
  comboProducts: ComboProduct[];
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
  const handleSave = async () => {
    try {
      await updateCombo(editedCombo.id, editedCombo.timeEnd);
      toast.success("Cập nhật cpmbo sản phẩm thành công!", { autoClose: 1000 });
      setIsEditing(false);
      // Optionally, you can add a success message or notification here
    } catch (error) {
      console.error("Failed to update combo", error);
      // Optionally, you can add an error message or notification here
    }
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedCombo((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Chi tiết combo sản phẩm
          </h2>
          <FontAwesomeIcon
            icon={faClose}
            className="text-2xl text-gray-500 cursor-pointer"
            onClick={handleClose}
          />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-6 pb-6 scrollbar-hide">
          {/* Combo Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["id", "createdAt", "timeEnd"].map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-500 block mb-1 capitalize">
                  {field === "id"
                    ? "Mã combo"
                    : field === "createdAt"
                    ? "Ngày tạo"
                    : field === "timeEnd"
                    ? "Ngày kết thúc"
                    : field}
                </label>
                {field === "timeEnd" && isEditing ? (
                  <input
                    type="date"
                    name={field}
                    value={(editedCombo as Combo)[field]?.slice(0, 10)}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <div className="text-gray-900 text-sm">
                    {field === "createdAt" || field === "timeEnd"
                      ? formatDate((editedCombo as any)[field])
                      : (editedCombo as any)[field]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Danh sách sản phẩm trong combo */}
          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              Danh sách sản phẩm
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-2">
                <thead className="bg-gray-50 sticky top-0 z-10 border-t border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">STT</th>
                    <th className="px-3 py-2 text-left">Mã sản phẩm</th>
                    <th className="px-3 py-2 text-center">Số lượng</th>
                    <th className="px-3 py-2 text-right">Giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="border-b border-gray-200">
                  {editedCombo.comboProducts.map((item, index) => (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td className="px-3 py-2">{item.productId}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        {item.price.toLocaleString()}đ
                      </td>
                      <td className="px-3 py-2 text-right">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6">
            {isEditing ? (
              <button
                onClick={handleSave}
                className={`px-3 py-1.5 text-sm rounded text-white
                ${combo!==editedCombo ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Lưu
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded"
              >
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
