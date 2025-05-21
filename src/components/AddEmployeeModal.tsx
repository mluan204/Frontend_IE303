import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";
import { createEmployee } from "../service/employeeApi";
import { uploadImage } from "../service/uploadImg";

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
  created_at: new Date().toISOString(),
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
  const [fileImg, setFileImg] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setNewEmployee((prev) => ({ ...prev, gender: value === "Nam" }));
    } else {
      setNewEmployee((prev) => ({ ...prev, [name]: value }));
    }
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
    // TODO: Save logic here
    console.log(newEmployee);
    const url = await uploadImage(fileImg);
    if (url) {
      console.log("Image URL:", url);
      setNewEmployee((prev) => ({ ...prev, image: url }));
      // Bạn có thể setState để hiển thị ảnh luôn
    }
    const resId = await createEmployee(newEmployee);

    const updatedEmployee = {
      ...newEmployee,
      id: Number(resId),
    };

    onEmployeeAdded(updatedEmployee);
    onClose();
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
              {(["name", "position", "address"] as (keyof Employee)[]).map(
                (field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
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
                )
              )}
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              {(
                [
                  "phone_number",
                  "email",
                  "salary",
                  "birthday",
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
                        : field === "birthday"
                        ? "date"
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
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1 truncate">
                  Giới tính
                </label>
                <input
                  name="gender"
                  value={newEmployee.gender ? "Nam" : "Nữ"}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded"
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
