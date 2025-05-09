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
    <div className= "fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white w-4/5 max-h-[600px] shadow-lg overflow-hidden">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5 sticky top-0 z-10">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết phiếu nhập</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2" onClick={handleClose} color="red" />
        </div>
        {/* Nội dung có thể cuộn */}
        <div className="overflow-y-auto h-[calc(600px-50px)] p-4 scrollbar-hide">
          {/* Thông tin hóa đơn*/}
          <div className="grid grid-cols-3 gap-4">
            {/* Cột 1: */}
            <div className="col-span-1 space-y-2">
              {["receiptID", "time", "totalCost"].map((field) => (
                <div key={field}>
                  <span className="font-medium">{receipFieldLabels[field as keyof Receipt]}: </span>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={(editedBill as any)[field] || ""}
                      onChange={handleChange}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    <span >{(editedBill as any)[field]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Cột 2 */}
            <div className="col-span-1 space-y-2">
              {["employeeID"].map((field) => (
                <div key={field} >
                  <span className="font-medium">{receipFieldLabels[field as keyof Receipt]}: </span>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={(editedBill as any)[field] || ""}
                      onChange={handleChange}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    <span>{(editedBill as any)[field]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Cột 3: Ghi chú */}
            <div className="col-span-1 border-l-1 pl-2">
              <span className="font-medium">Ghi chú: </span>
              {isEditing ? (
                <textarea
                  name="notes"
                  // value={editedBill.notes || ""}
                  // onChange={handleChange}
                  className="border rounded p-1 w-full h-24"
                />
              ) : (
                <p></p>
              )}
            </div>
          </div>
          
          <table className="mt-5 h-40 mx-auto w-full  border-collapse">
              {/* LABEL */}
              <thead className="bg-[#E6F1FE] sticky top-0">
                <tr className="border-b border-[#A6A9AC]">
                  <th className="p-2 text-left">Tên sản phẩm</th>
                  <th className="p-2 text-left">Giá nhập</th>
                  <th className="p-2 text-left">Số lượng</th>
                  <th className="p-2 text-left">Thành tiền</th>
                </tr>
              </thead>
              {/* CHI TIẾT*/}
              <tbody>
                {receiptDetails.map((receipt, index) => (
                  <tr key={receipt.id} className={ `${index % 2 === 0 ? "bg-white" : "bg-gray-100 border-b border-[#A6A9AC]"} hover:bg-[#E6F1FE]`}>
                    <td className="p-2">{receipt.productName}</td>
                    <td className="p-2">{receipt.unitPrice}</td>
                    <td className="p-2">{receipt.quantity}</td>
                    <td className="p-2">{receipt.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          {/* SUMMARY */}

          <div className="p-4 ml-120">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng số lượng:</span>
                <span>4</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span>310000</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá phiếu nhập:</span>
                <span>0</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng cộng:</span>
                <span>310000</span>
              </div>
            </div>
          </div>
          {/* Nút điều khiển */}
          <div className="flex justify-end gap-10 mt-4 mb-8 mr-4">
            {isEditing ? (
              <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded"><FontAwesomeIcon icon={faSave} className="mr-2"/>Lưu</button>
            ) : (
              <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white rounded"><FontAwesomeIcon icon={faEdit} className="mr-2"/>Chỉnh sửa</button>
            )}
            <button onClick={handleClose} className="px-4 py-2 bg-red-400 text-white rounded"><FontAwesomeIcon icon={faClose} className="mr-2"/>Xóa phiếu nhập</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ReceiptDetail;
