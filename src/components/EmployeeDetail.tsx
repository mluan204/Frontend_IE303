import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import { deleteEmployeeById, updateEmployeeById } from "../service/employeeApi";

interface Employee {
    id: string;
    name: string;
    address: string;
    birthday: string;
    created_at: string;
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
  removeEmployee: (id:string) =>void;
}

// type EmployeeField = keyof Employee;

function EmployeeDetail({ employee, isOpen, onClose, removeEmployee }: EmployeeDetailProps) {

  const employeeFieldLabels: { [key in keyof Employee]?: string } = {
    id: "Mã nhân viên",
    name: "Họ và tên",
    position: "Chức vụ",
    address: "Địa chỉ",
    birthday: "Ngày sinh",
    // create_at: "Ngày tạo",
    email: "Email",
    gender: "Giới tính",
    image: "Ảnh đại diện",
    phone_number: "Số điện thoại",
    salary: "Lương",
  };
  

  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    setIsEditing(false);
    // Gọi hàm lưu ở đây
    employee.address = editedEmployee.address;
    employee.birthday = editedEmployee.birthday;
    employee.email = editedEmployee.email;
    employee.gender = editedEmployee.gender;
    employee.image = editedEmployee.address;
    employee.name = editedEmployee.name;
    employee.phone_number = editedEmployee.phone_number;
    employee.position = editedEmployee.position;
    employee.salary = editedEmployee.salary;
    await updateEmployeeById(editedEmployee);
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  const handleDelete = async () => {
    // Gọi hàm xóa ở đây
    await deleteEmployeeById(employee.id);
    // removeEmployee(employee.id);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEmployee((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-4/5 max-h-[540px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết nhân viên</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(440px-48px)] px-6 pb-4 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            {/* Column 1: Ảnh */}
            <div className="space-y-4">
              <div className="flex justify-center items-center flex-col h-full">
                <img src={editedEmployee.image} alt={editedEmployee.name} className="w-32 h-32 object-cover rounded" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              {(["id", "name", "position", "address"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{employeeFieldLabels[field]}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={editedEmployee[field]?.toString() ?? ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 text-sm">{editedEmployee[field]}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              {(["phone_number", "email", "salary", "birthday"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{employeeFieldLabels[field]}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={editedEmployee[field]?.toString() ?? ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 text-sm">{editedEmployee[field]}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Column 4 */}
            <div className="space-y-4">
              {(["gender"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{employeeFieldLabels[field]}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={editedEmployee[field]?.toString() ?? ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 text-sm">{editedEmployee[field]}</div>
                  )}
                </div>
              ))}
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

export default EmployeeDetail;
