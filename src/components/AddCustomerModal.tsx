import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";
import { createCustomer } from "../service/customerApi";
import { toast } from "react-toastify";

interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (newCustomer: Customer) => void;
}

function AddCustomerModal({ isOpen, onClose, onCustomerAdded }: AddCustomerModalProps) {
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: 0,
    gender: true,
    name: "",
    phone_number: "",
    score: 0,
    created_at: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if(name == "gender"){
      setNewCustomer((prev) => ({
        ...prev,
        gender: value === "Nam"
      }));
    } else {
      setNewCustomer((prev) => ({
        ...prev,
        [name]: name === "score" ? parseInt(value) || 0 : value,
      }));
    }
    
  };

  const handleSave = async () => {
    if (!newCustomer.name.trim()) {
      alert("Tên khách hàng không được để trống!");
      return;
    }

    const resId = await createCustomer(newCustomer);
    if (typeof resId === 'string' && resId.startsWith('Loi')) {
      toast.error("Thêm khách hàng thất bại. Vui lòng thử lại!", { autoClose: 1000 })
    }else{
      toast.success("Thêm khách hàng thành công!", { autoClose: 1000 });
    }

    const updatedCustomer = {
      ...newCustomer,
      id: Number(resId)
    };

    onCustomerAdded(updatedCustomer);

    setNewCustomer({
      id: 0,
      gender: true,
      name: "",
      phone_number: "",
      score: 0,
      created_at: new Date().toISOString(),
    });
    onClose();
  };

  const isCustomerValid =
  newCustomer.name.trim() !== "" &&
  newCustomer.phone_number.trim() !== "" &&
  newCustomer.created_at.trim() !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Thêm khách hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-6 py-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "name", label: "Họ tên" },
              { name: "phone_number", label: "Số điện thoại" },
              { name: "score", label: "Điểm tích lũy" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-500 block mb-1 truncate">{field.label}</label>
                <input
                  type={field.name === "score" ? "number" : "text"}
                  name={field.name}
                  value={(newCustomer as any)[field.name]}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
            ))}

            {/* Tách cột giới tính riêng */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Giới tính</label>
              <select
                name="gender"
                value={newCustomer.gender ? "true" : "false"}
                onChange={(e) =>
                  setNewCustomer((prev) => ({
                    ...prev,
                    gender: e.target.value === "true",
                  }))
                }
                className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
              >
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>


            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1 truncate">Ngày tạo</label>
              <input
                type="date"
                value={
                  newCustomer.created_at
                    ? new Date(newCustomer.created_at).toISOString().split("T")[0]
                    : ""
                }
                disabled
                className="border rounded px-2 py-1 w-full text-gray-700 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleSave} className={`px-3 py-1.5 text-sm rounded text-white
                ${isCustomerValid ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}>
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Thêm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;
