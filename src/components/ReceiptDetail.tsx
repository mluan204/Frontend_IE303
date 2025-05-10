import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit} from "@fortawesome/free-solid-svg-icons";

interface Receipt {
  id: string;
  created_at: string;
  total_cost: string;
  employee_name: string;
  note: string;


}
interface ReceiptDetailProps {
  receipt: Receipt; 
  isOpen: boolean;
  onClose: () => void;
}


function ReceiptDetail({ receipt: bill, isOpen, onClose }: ReceiptDetailProps) {

  const receipFieldLabels: Record<keyof Receipt, string> = {
    id: "Mã phiếu nhập",
    created_at: "Thời gian",
    total_cost: "Tổng tiền",
    employee_name: "Nhân viên",
    note: "Ghi chú",
  }

    const receiptDetails = [
    {
        id: 1,
        productName: "Thuốc lá Vinataba",
        unitPrice: 20000,
        quantity: 2,
        discount: 0.1,
        totalPrice: 36000, 
    },
    {
        id: 2,
        productName: "Sữa Vinamilk",
        unitPrice: 15000,
        quantity: 3,
        discount: 0.05, 
        totalPrice: 42750, 
    },
    {
        id: 3,
        productName: "Nước ngọt Coca-Cola",
        unitPrice: 10000,
        quantity: 5,
        discount: 0, 
        totalPrice: 50000, 
    },
    {
        id: 4,
        productName: "Kẹo Alpenliebe",
        unitPrice: 5000,
        quantity: 10,
        discount: 0.2, 
        totalPrice: 40000, 
    },
    ];

  const [isEditing, setIsEditing] = useState(false);
  const [editedBill, setEditedBill] = useState(bill);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Gọi hàm lưu ở đây
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBill((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-4/5 max-h-[600px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết phiếu nhập</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(600px-48px)] px-6 pb-10 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              {["receiptID", "time"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{receipFieldLabels[field as keyof Receipt]}</label>
                  <div className="text-sm text-gray-900">{(editedBill as any)[field]}</div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              {["totalCost", "employeeID"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{receipFieldLabels[field as keyof Receipt]}</label>
                  <div className="text-sm text-gray-900">{(editedBill as any)[field]}</div>
                </div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="space-y-4 col-span-2">
              <label className="text-sm font-medium text-gray-500 block mb-1">{receipFieldLabels.note}</label>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{editedBill.note}</div>
            </div>
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 mt-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptDetails.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.unitPrice.toLocaleString("vi-VN")}đ</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.totalPrice.toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="p-4 mt-4">
            <div className="space-y-2 text-sm text-gray-900">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng số lượng:</span>
                <span>4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng tiền hàng:</span>
                <span>310,000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giảm giá phiếu nhập:</span>
                <span>0</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Tổng cộng:</span>
                <span>310,000đ</span>
              </div>
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

export default ReceiptDetail;
