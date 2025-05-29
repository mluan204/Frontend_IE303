import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";
import { createEmployee } from "../service/employeeApi";
import { uploadImage } from "../service/uploadImg";
import { toast } from "react-toastify";
interface Employee {
  id: number;
  name: string;
  address: string;
  birthday: string;
  email: string;
  gender: boolean;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
  created_at: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: (newEmployee: Employee) => void;
}

const defaultEmployee: Employee = {
  id: 0,
  name: "",
  address: "",
  birthday: "",
  email: "",
  gender: true,
  image: "",
  phone_number: "",
  position: "",
  salary: 0,
  created_at: new Date().toISOString().split("T")[0],
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
  salary: "Lương",
  created_at: "Ngày tạo",
};

function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeAdded,
}: AddEmployeeModalProps) {
  const [newEmployee, setNewEmployee] = useState<Employee>(defaultEmployee);
  const [fileImg, setFileImg] = useState<File | null>(null);

    const isFormValid =
    newEmployee.name.trim() !== "" &&
    newEmployee.position.trim() !== "" &&
    newEmployee.address.trim() !== "" &&
    newEmployee.phone_number.trim() !== "" &&
    newEmployee.email.trim() !== "" &&
    newEmployee.salary > 0 &&
    newEmployee.birthday !== "" &&
    newEmployee.created_at !== "" ;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file) {
      setFileImg(file);
      const url = URL.createObjectURL(file);
      setNewEmployee((prev) => ({ ...prev, image: url }));
    }
  };

  const handleSave = async () => {
  if (!isFormValid) return;

  const imageUrl = fileImg ? await uploadImage(fileImg) : newEmployee.image;

  const employeeToSave = {
    ...newEmployee,
    image: imageUrl,
    salary: Number(newEmployee.salary),
    created_at: newEmployee.created_at || new Date().toISOString().split("T")[0],
  };

  const resId = await createEmployee(employeeToSave);

  const updatedEmployee = {
    ...employeeToSave,
    id: Number(resId),
  };

  if (resId) {
    onEmployeeAdded(updatedEmployee);
    toast.success("Thêm nhân viên thành công!", { autoClose: 1000 });
    onClose();
  } else {
    toast.error("Thêm nhân viên thất bại. Vui lòng thử lại!", { autoClose: 1000 });
  }
};

  const fileInputRef = useRef(null);
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Thêm nhân viên mới
          </h2>
          <FontAwesomeIcon
            icon={faClose}
            className="text-2xl text-gray-500 cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-6 pb-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1: Avatar */}
            <div className="flex justify-center items-center flex-col">
              <div className="w-32 h-32 border border-gray-300 flex items-center justify-center rounded">
                {newEmployee.image ? (
                  <img
                    src={newEmployee.image}
                    alt="avatar"
                    className="object-cover w-full h-full rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                style={{ display: "none" }}
              />

              <button
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleButtonClick}
              >
                Thêm ảnh
              </button>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              {(["name", "position", "address"] as (keyof Employee)[]).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                    {labelMapping[field]}
                  </label>
                  {field === "position" ? (
                    <select
                      name={field}
                      value={newEmployee[field]}
                      onChange={(e) =>
                        setNewEmployee((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    >
                      <option value="">Chọn chức vụ</option>
                      <option value="Parttime">Parttime</option>
                      <option value="Fulltime">Fulltime</option>
                      <option value="Quản lí">Quản lí</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={String(newEmployee[field])}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  )}
                </div>
              ))}

            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              {(
                [
                  "phone_number",
                  "email",
                  "salary",
                ] as (keyof Employee)[]
              ).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                    {labelMapping[field]}
                  </label>
                  <input
                    type={
                      field === "salary"
                        ? "number"
                        : "text"
                    }
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
              {(
                ["created_at", "gender", "birthday"] as (keyof Employee)[]
              ).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                    {labelMapping[field]}
                  </label>

                  {field === "gender" ? (
                    <select
                      name={field}
                      value={newEmployee[field] === true ? "true" : "false"}
                      onChange={(e) =>
                        setNewEmployee((prev) => ({
                          ...prev,
                          [field]: e.target.value === "true",
                        }))
                      }
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  ) : (
                    <input
                        type="date"
                        name={field}
                        value={(newEmployee[field] as string).split("T")[0]}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                      />

                  )}
                </div>
              ))}

              
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleSave}
              className={`px-3 py-1.5 text-sm rounded text-white
                ${isFormValid ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
