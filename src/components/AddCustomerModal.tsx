import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";

interface Customer {
  id: string;
  gender: string;
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
    id: "", 
    gender: "",
    name: "",
    phone_number: "",
    score: 0,
    created_at: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: name === "score" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
  
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white w-3/5 shadow-lg">
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Thêm khách hàng</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2 cursor-pointer" onClick={onClose} color="red" />
        </div>

        <div className="grid grid-cols-2 gap-4 px-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ tên</label>
              <input type="text" name="name"
                value={newCustomer.name} onChange={handleChange}
                className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giới tính</label>
              <input type="text" name="gender"
                value={newCustomer.gender} onChange={handleChange}
                className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="text" name="phone_number"
                value={newCustomer.phone_number} onChange={handleChange}
                className="border rounded p-1 w-full" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm tích lũy</label>
              <input type="number" name="score"
                value={newCustomer.score === 0 ? "" : newCustomer.score}
                onChange={handleChange}
                className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
              <input type="text" name="created_at" disabled
                value={new Date(newCustomer.created_at).toLocaleDateString('vi-VN')}
                className="border rounded p-1 w-full bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 mb-8 mr-8">
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
            <FontAwesomeIcon icon={faSave} className="mr-2" />Thêm mới
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;
