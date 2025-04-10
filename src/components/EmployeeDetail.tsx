import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";

interface Employee {
    id: string;
    name: string;
    address: string;
    birthday: string;
    create_at: string;
    email: string;
    gender: string;
    image: string;
    phone_number: string;
    position: string;
    salary: number;
  }

interface EmployeeDetailProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

type EmployeeField = keyof Employee;

function EmployeeDetail({ employee, isOpen, onClose }: EmployeeDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Gọi hàm lưu ở đây
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  const handleDelete = () => {
    // Gọi hàm xóa ở đây
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEmployee((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-[800px] shadow-lg">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết nhân viên</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2" onClick={handleClose} color="red" />
        </div>

        {/* Thông tin nhân viên */}
        <div className="grid grid-cols-4 gap-4">
          {/* Cột 1: Ảnh đại diện */}
          <div className="col-span-1 flex flex-col justify-center items-center">
            <img src={editedEmployee.image} alt={editedEmployee.name} className="mb-5 w-32 h-32 object-cover" />
            <label htmlFor="avatar-upload" className="bg-blue-500 text-white px-3 py-1 cursor-pointer hover:bg-blue-600">
              Tải ảnh lên
            </label>
          </div>

          {/* Cột 2: ID, Tên, Chức vụ, Phòng ban */}
          <div className="col-span-1 space-y-2">
            {(["id", "name", "position", "department"] as Array<keyof Employee>).map((field) => (
              <div key={field}>
                <span className="font-medium">{field}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedEmployee[field] || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span>{editedEmployee[field]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột 3: Số điện thoại, Email */}
          <div className="col-span-1 space-y-2">
            {(["phone", "email"] as Array<keyof Employee>).map((field) => (
              <div key={field}>
                <span className="font-medium">{field}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedEmployee[field] || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span>{editedEmployee[field]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột 4: Ghi chú */}
          <div className="col-span-1 border-l pl-2">
            <span className="font-medium">Ghi chú: </span>
            {isEditing ? (
              <textarea
                name="notes"
                value={""}
                onChange={handleChange}
                className="border rounded p-1 w-full h-24"
              />
            ) : (
              <p></p>
            )}
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
            <FontAwesomeIcon icon={faClose} className="mr-2" />Xóa nhân viên
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;
