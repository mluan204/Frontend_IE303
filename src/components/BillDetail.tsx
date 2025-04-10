import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit} from "@fortawesome/free-solid-svg-icons";

interface Bill {
  id: number;
  total_cost: number;
  after_discount: number;
  customer_id: number;
  employee_id: number;
  billDetails: [];
}

interface BillDetailProps {
  bill: Bill; 
  isOpen: boolean;
  onClose: () => void;
}


function BillDetail({ bill, isOpen, onClose }: BillDetailProps) {

    
    const billDetails = [
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

  const handleDeleteBill = async () => {
    if (!bill || !bill.id) return;
  
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?");
    if (!confirmDelete) return;
  
    try {
      const token = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtbHVhbiIsImlhdCI6MTc0MzY3MzM4NCwiZXhwIjoxNzQzNjg3Nzg0fQ.GTCOpVqYT4bEQHN4-MA54hpForB6JfttZA-yElpN5H2sNAytTe2j4fvpHsKxu4Bm";
      const response = await fetch(`http://localhost:8080/api/bills/delete_error/${bill.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Lỗi khi xóa hóa đơn");
      }
  
      alert("Xóa hóa đơn thành công!");
      onClose(); // Đóng modal sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa hóa đơn:", error);
      alert("Xóa hóa đơn thất bại!");
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBill((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className= "fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-[800px] max-h-[600px] shadow-lg overflow-hidden">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5 sticky top-0 z-10">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết hóa đơn</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2" onClick={handleClose} color="red" />
        </div>
        {/* Nội dung có thể cuộn */}
        <div className="overflow-y-auto h-[calc(600px-50px)] p-4">
          {/* Thông tin hóa đơn*/}
          <div className="grid grid-cols-3 gap-4">
            {/* Cột 1: */}
            <div className="col-span-1 space-y-2">
              {["id", "name", "category", "supplier", "stock"].map((field) => (
                <div key={field} className={isEditing ? "": "border-b-1"} >
                  <span className="font-medium">{field}: </span>
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
              {["cost", "price", "expiry"].map((field) => (
                <div key={field} className={isEditing ? "": "border-b-1"}>
                  <span className="font-medium">{field}: </span>
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
          
          <table className="mt-5 h-40 mx-auto w-190  border-collapse">
              {/* LABEL */}
              <thead className="bg-[#E6F1FE] sticky top-0">
                <tr className="border-b border-[#A6A9AC]">
                  <th className="p-2 text-left">Mã hóa đơn</th>
                  <th className="p-2 text-left">Tên sản phẩm</th>
                  <th className="p-2 text-left">Đơn giá</th>
                  <th className="p-2 text-left">Số lượng</th>
                  <th className="p-2 text-left">Thành tiền</th>
                </tr>
              </thead>
              {/* HÓA ĐƠN*/}
              <tbody>
                {billDetails.map((bill, index) => (
                  <tr key={bill.id} className={ `${index % 2 === 0 ? "bg-white" : "bg-gray-100 border-b border-[#A6A9AC]"} hover:bg-[#E6F1FE]`}>
                    <td className="p-2">{bill.productName}</td>
                    <td className="p-2">{bill.unitPrice}</td>
                    <td className="p-2">{bill.quantity}</td>
                    <td className="p-2">{bill.discount}</td>
                    <td className="p-2">{bill.totalPrice}</td>
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
                <span>Giảm giá hóa đơn:</span>
                <span>0</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng cộng:</span>
                <span>310000</span>
              </div>
            </div>
          </div>
          {/* Nút điều khiển */}
          <div className="flex justify-end gap-10 mt-4 mb-8 mr-8">
            {isEditing ? (
              <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded"><FontAwesomeIcon icon={faSave} className="mr-2"/>Lưu</button>
            ) : (
              <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white rounded"><FontAwesomeIcon icon={faEdit} className="mr-2"/>Chỉnh sửa</button>
            )}
            <button onClick={handleDeleteBill} className="px-4 py-2 bg-red-400 text-white rounded"><FontAwesomeIcon icon={faClose} className="mr-2"/>Xóa hóa đơn</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BillDetail;
