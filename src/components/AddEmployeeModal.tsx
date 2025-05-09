import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";

interface Employee {
  id: string;
  name: string;
  address: string;
  birthday: string;
  email: string;
  gender: string;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultEmployee: Employee = {
  id: "",
  name: "",
  address: "",
  birthday: "",
  email: "",
  gender: "",
  image: "",
  phone_number: "",
  position: "",
  salary: 0,
};
const labelMapping: Record<keyof Employee, string> = {
  id: "Mã nhân viên",
  name: "Họ và tên",
  address: "Địa chỉ",
  birthday: "Ngày sinh",
  email: "Email",
  gender: "Giới tính",
  image: "Ảnh đại diện",
  phone_number: "Số điện thoại",
  position: "Chức vụ",
  salary: "Lương"
};
function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const [newEmployee, setNewEmployee] = useState<Employee>(defaultEmployee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // TODO: Save logic here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-4/5 max-h-[540px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Thêm nhân viên mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(440px-48px)] px-6 pb-4 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            {/* Column 1: Avatar */}
            <div className="space-y-4">
              <div className="flex justify-center items-center flex-col h-full">
                <div className="w-32 h-32 border border-gray-300 flex items-center justify-center rounded">
                  {newEmployee.image ? (
                    <img src={newEmployee.image} alt="avatar" className="object-cover w-full h-full rounded" />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>
                <button
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => alert("Thêm ảnh dô")}
                >
                  Thêm ảnh
                </button>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
            {(["id", "name", "position", "address"] as (keyof Employee)[]).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {labelMapping[field]}
                </label>
                <input
                  type="text"
                  name={field}
                  value={String(newEmployee[field])}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
            ))}
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              {(["phone_number", "email", "salary", "birthday"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                   {labelMapping[field]}
                  </label>
                  <input
                    type={field === "salary" ? "number" : field === "birthday" ? "date" : "text"}
                    name={field}
                    value={(newEmployee as any)[field] || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Column 4 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Giới tính</label>
                <input
                  name="gender"
                  value={newEmployee.gender}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={handleSave} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded">
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
