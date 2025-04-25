import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";

interface Customer {
  id: string;
  gender: string;
  name: string;
  phone_number: string;
  score: number;
  create_at: string;
}

interface CustomerDetailProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

type CustomerField = keyof Customer;

function CustomerDetail({ customer, isOpen, onClose }: CustomerDetailProps) {

  const customerFieldLabels: Record<CustomerField, string> = {
    id: "Mã KH",
    gender: "Giới tính",
    name: "Họ tên",
    phone_number: "Số điện thoại",
    score: "Điểm tích lũy",
    create_at: "Ngày tạo",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Gọi hàm lưu dữ liệu ở đây nếu cần
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  const handleDelete = () => {
    // Gọi hàm xóa ở đây nếu cần
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white w-3/5 shadow-lg">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết khách hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2" onClick={handleClose} color="red" />
        </div>

        {/* Thông tin khách hàng */}
        <div className="grid grid-cols-2 gap-4 px-4">
          {/* Cột 1 */}
          <div className="space-y-2">
            {(["id", "name", "gender"] as Array<CustomerField>).map((field) => (
              <div key={field}>
                <span className="font-medium">{customerFieldLabels[field]}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedCustomer[field]?.toString() || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span>{editedCustomer[field]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột 2 */}
          <div className="space-y-2">
            {(["phone_number", "score", "create_at"] as Array<CustomerField>).map((field) => (
              <div key={field}>
                <span className="font-medium">{customerFieldLabels[field]}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedCustomer[field]?.toString() || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span>{editedCustomer[field]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nút điều khiển */}
        <div className="flex justify-end gap-10 mt-4 mb-8 mr-8">
          {isEditing ? (
            <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
              <FontAwesomeIcon icon={faSave} className="mr-2" />Lưu
            </button>
          ) : (
            <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white rounded">
              <FontAwesomeIcon icon={faEdit} className="mr-2" />Chỉnh sửa
            </button>
          )}
          <button onClick={handleDelete} className="px-4 py-2 bg-red-400 text-white rounded">
            <FontAwesomeIcon icon={faClose} className="mr-2" />Xóa khách hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
