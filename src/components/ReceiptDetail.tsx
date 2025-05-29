import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";

interface Receipt {
  id: number;
  created_at: string;
  total_cost: string;
  employee_name: string;
  note: string;
  receipt_details: {
    productId: number, 
    supplier: String, 
    quantity: number, 
    input_price: number,
    check: boolean,
    productName: string,
  }[];
}
interface ReceiptDetailProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
}


function ReceiptDetail({ receipt: bill, isOpen, onClose }: ReceiptDetailProps) {

  console.log("ReceiptDetail props:", bill );
  const receipFieldLabels: Record<keyof Receipt, string> = {
    id: "Mã phiếu nhập",
    created_at: "Thời gian",
    total_cost: "Tổng tiền",
    employee_name: "Nhân viên",
    note: "Ghi chú",
    receipt_details: "Chi tiết phiếu nhập",
  };

  

  const [isEditing, setIsEditing] = useState(false);
  const [editedBill, setEditedBill] = useState(bill);

  const handleEdit = () => setIsEditing(true);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBill((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  console.log("ReceiptDetail rendered with bill:", bill);
  

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-30">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 ">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết phiếu nhập</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-56px)] px-6 pb-6 scrollbar-hide">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        
              {["id", "created_at", "total_cost", "employee_name", "note"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    {receipFieldLabels[field as keyof Receipt]}
                  </label>
                 <div className="text-sm text-gray-900">
                  {field === "created_at"
                    ? new Date((editedBill as any)[field]).toLocaleString("vi-VN")
                    : (editedBill as any)[field]}
                </div>
                </div>
              ))}              
          </div>

          {/* Bảng sản phẩm */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-2">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã sản phẩm</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>                  
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhà cung cấp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá nhập</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bill.receipt_details.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.productId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.supplier}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.input_price.toLocaleString("vi-VN")}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng kết */}
          <div className="p-4 mt-6 bg-gray-50 rounded">
            <div className="space-y-2 text-sm text-gray-900">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng số lượng:</span>
                <span>4</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Tổng cộng:</span>
                <span>310,000đ</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ReceiptDetail;
