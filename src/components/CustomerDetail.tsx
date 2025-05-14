import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import { deleteCustomerById, updateCustomer } from "../service/customerApi";

interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

interface CustomerDetailProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  removeCustomer: (id: number) => void;
}

type CustomerField = keyof Customer;


function CustomerDetail({ customer, isOpen, onClose, removeCustomer }: CustomerDetailProps) {

  const customerFieldLabels: Record<CustomerField, string> = {
    id: "Mã KH",
    gender: "Giới tính",
    name: "Họ tên",
    phone_number: "Số điện thoại",
    score: "Điểm tích lũy",
    created_at: "Ngày tạo",
  };


  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    setIsEditing(false);
    customer.name = editedCustomer.name;
    customer.gender = editedCustomer.gender;
    customer.score = editedCustomer.score;
    await updateCustomer(customer);
    // Gọi hàm lưu dữ liệu ở đây nếu cần
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  const handleDelete = async () => {
    // removeCustomer(customer.id);
    await deleteCustomerById(customer.id);
    onClose();
    // Gọi hàm xóa ở đây nếu cần
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: name === "gender" ? value === "Nam" : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-4/5 max-h-[340px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết khách hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(440px-48px)] px-6 pb-4 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            {(["id", "name", "gender", "phone_number"] as (keyof Customer)[]).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {customerFieldLabels[field]}
                </label>
                {isEditing ? (
                  field === "gender" ? (
                    <select
                      name={field}
                      value={editedCustomer.gender ? "Nam" : "Nữ"}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={editedCustomer[field] ?? ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  )
                ) : (
                  <div className="text-gray-900 text-sm">
                    {field === "gender" ? (editedCustomer.gender ? "Nam" : "Nữ") : editedCustomer[field]}
                  </div>
                )}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">{customerFieldLabels["score"]}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="score"
                  value={editedCustomer.score.toString()}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              ) : (
                <div className="text-gray-900 text-sm">{editedCustomer.score}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">{customerFieldLabels["created_at"]}</label>
              <div className="text-gray-900 text-sm">{editedCustomer.created_at}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            {isEditing ? (
              <button onClick={handleSave} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Lưu
              </button>
            ) : (
              <button onClick={handleEdit} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded">
                <FontAwesomeIcon icon={faEdit} className="mr-1" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
