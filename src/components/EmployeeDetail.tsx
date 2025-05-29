import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import { updateEmployeeById } from "../service/employeeApi";
import { toast } from "react-toastify";
interface Employee {
  id: number;
  name: string;
  address: string;
  birthday: string;
  created_at: string;
  email: string;
  gender: boolean;
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

function EmployeeDetail({ employee, isOpen, onClose }: EmployeeDetailProps) {

  const employeeFieldLabels: { [key in keyof Employee]?: string } = {
    id: "Mã nhân viên",
    name: "Họ và tên",
    position: "Chức vụ",
    address: "Địa chỉ",
    birthday: "Ngày sinh",
    created_at: "Ngày tạo",
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
    Object.assign(employee, editedEmployee);
    const res = await updateEmployeeById(editedEmployee);
    setIsEditing(false);
    if(res){
      toast.success("Cập nhật thông tin nhân viên thành công!", { autoClose: 1000 });
    }else{
      toast.error("Cập nhật thông tin nhân viên thất bại!", { autoClose: 1000 })
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEmployee((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-30">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết nhân viên</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-56px)] px-6 pb-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1: Avatar */}
            <div className="flex justify-center items-center flex-col">
              <img src={editedEmployee.image} alt={editedEmployee.name} className="w-32 h-32 object-cover rounded" />
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
              <div className="space-y-4">
                {(["phone_number", "email", "salary", "birthday"] as (keyof Employee)[]).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      {employeeFieldLabels[field]}
                    </label>
                    {isEditing ? (
                      field === "birthday" ? (
                        <input
                          type="date"
                          name={field}
                          value={editedEmployee[field]?.slice(0, 10) ?? ""}
                          onChange={(e) =>
                            setEditedEmployee((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          name={field}
                          value={editedEmployee[field]?.toString() ?? ""}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        />
                      )
                    ) : (
                      <div className="text-gray-900 text-sm">
                        {field === "birthday"
                          ? new Date(editedEmployee[field] ?? "").toLocaleDateString("vi-VN")
                          : editedEmployee[field]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Column 4 */}
            <div className="space-y-4">
              {(["gender", "created_at"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{employeeFieldLabels[field]}</label>
                  {isEditing ? (
                      field === "gender" ? (
                        <select
                          name={field}
                          value={editedEmployee[field] === true ? "true" : "false"}
                          onChange={(e) =>
                            setEditedEmployee((prev) => ({
                              ...prev,
                              [field]: e.target.value === "true",
                            }))
                          }
                          className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        >
                          <option value="true">Nam</option>
                          <option value="false">Nữ</option>
                        </select>
                      ) : field === "created_at" ? (
                        <input
                          type="date"
                          name={field}
                          value={editedEmployee[field]?.slice(0, 10) ?? ""}
                          onChange={(e) =>
                            setEditedEmployee((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          name={field}
                          value={editedEmployee[field]?.toString() ?? ""}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        />
                      )
                    ) : (
                      <div className="text-gray-900 text-sm">
                        {field === "gender"
                          ? employee[field] === true
                            ? "Nam"
                            : "Nữ"
                          : field === "created_at"
                          ? new Date(employee[field]).toLocaleDateString("vi-VN")
                          : employee[field]}
                      </div>
                    )}


                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {isEditing ? (
              <button onClick={handleSave} className={`px-3 py-1.5 text-sm rounded text-white
                ${employee !== editedEmployee ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}>
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