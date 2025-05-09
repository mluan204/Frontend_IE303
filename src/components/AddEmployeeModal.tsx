import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";

interface Employee {
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

function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const [newEmployee, setNewEmployee] = useState<Employee>(defaultEmployee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white w-4/5 shadow-lg">
        {/* Tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Thêm nhân viên mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2 cursor-pointer" onClick={onClose} color="red" />
        </div>

        {/* Nội dung form */}
        <div className="grid grid-cols-4 gap-2 mr-10">
          {/* Ảnh đại diện */}
          <div className="col-span-1 flex flex-col justify-center items-center">
            <img src={newEmployee.image || "/default-avatar.png"} alt="avatar" className="mb-5 w-32 h-32 object-cover border" />
            <label htmlFor="avatar-upload" className="bg-blue-500 text-white px-3 py-1 cursor-pointer hover:bg-blue-600">
              Tải ảnh lên
            </label>
          </div>

          {/* Tên, Chức vụ, Địa chỉ */}
          <div className="col-span-1 space-y-2">
          <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input name="name" value={newEmployee.name} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chức vụ</label>
              <input name="position" value={newEmployee.position} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <input name="address" value={newEmployee.address} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
          </div>

          {/* SĐT, email, lương */}
          <div className="col-span-1 space-y-2">
          <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input name="phone_number" value={newEmployee.phone_number} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" value={newEmployee.email} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lương</label>
              <input name="salary" type="number" value={newEmployee.salary} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
          </div>

          {/* Ngày sinh, Giới tính, Ghi chú */}
          <div className="col-span-1 space-y-2 border-l pl-2">
          <div>
              <label className="block text-sm font-medium mb-1">Ngày sinh</label>
              <input name="birthday" type="date" value={newEmployee.birthday} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giới tính</label>
              <input name="gender" value={newEmployee.gender} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea className="border rounded p-1 w-full h-20" placeholder="Tuỳ chọn..." />
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end gap-10 mt-4 mb-8 mr-8">
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
            <FontAwesomeIcon icon={faSave} className="mr-2" />Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
