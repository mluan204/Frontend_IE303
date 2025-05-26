import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";

interface Receipt {
  id: number;
  createdAt: string;
  totalCost: string;
  employeeName: string;
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
    createdAt: "Thời gian",
    totalCost: "Tổng tiền",
    employeeName: "Nhân viên",
    note: "Ghi chú",
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Cột 1 */}
            <div className="space-y-4">
              {["id", "createdAt"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    {receipFieldLabels[field as keyof Receipt]}
                  </label>
                  <div className="text-sm text-gray-900">{(editedBill as any)[field]}</div>
                </div>
              ))}
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              {["totalCost", "employeeName"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    {receipFieldLabels[field as keyof Receipt]}
                  </label>
                  <div className="text-sm text-gray-900">{(editedBill as any)[field]}</div>
                </div>
              ))}
            </div>

            {/* Cột 3–4: Ghi chú */}
            <div className="space-y-4 lg:col-span-2">
              <label className="text-sm font-medium text-gray-500 block mb-1">{receipFieldLabels.note}</label>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{editedBill.note}</div>
            </div>
          </div>

          {/* Bảng sản phẩm */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-2">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá nhập</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receiptDetails.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.unitPrice.toLocaleString("vi-VN")}đ</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.totalPrice.toLocaleString("vi-VN")}đ</td>
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

        </div>
      </div>
    </div>
  );
}

export default ReceiptDetail;
