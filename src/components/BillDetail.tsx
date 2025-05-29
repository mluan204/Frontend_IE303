  import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit} from "@fortawesome/free-solid-svg-icons";
import { deleteBillById } from "../service/mainApi";

interface Bill {
  id: number;
  total_cost: number;
  after_discount: number;
  customer: {
    id: number,
    name: string,
    phone: string
  };
  employee: {
    id: number,
    name: string,
  };
  isDeleted: boolean;
  created_at: string;
  totalQuantity: number;
  billDetails: {
    productId: number;
    price: number;
    afterDiscount: number | null;
    quantity: number;
  }[];
  notes: string;
}

interface BillDetailProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}


function BillDetail({ bill, isOpen, onClose }: BillDetailProps) {
  const billFieldLabels: Record<keyof Bill | string, string> = {
    id: "Mã hóa đơn",
    total_cost: "Tổng tiền",
    after_discount: "Sau giảm giá",
    created_at: "Ngày lập",
    isDeleted: "Đã xóa?",
    totalQuantity: "Tổng số lượng",
    notes: "Ghi chú",
    // Các field lồng bên trong
    "customer.id": "Mã khách hàng",
    "customer.name": "Tên khách hàng",
    "customer.phone": "SĐT khách hàng",
    "employee.id": "Mã nhân viên",
    "employee.name": "Tên nhân viên",
    "billDetails": "Chi tiết sản phẩm",
  };

  if (!isOpen || !bill) return null; // Kiểm tra nếu modal đóng thì return null

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

  const handleDelete = async () => {
    try {
      await deleteBillById(bill.id);
      onClose(); // Đóng modal sau khi xóa thành công
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBill((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className= "fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-4/5 max-h-[600px] shadow-lg overflow-hidden">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5 sticky top-0 z-10">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết hóa đơn</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2 cursor-pointer" onClick={handleClose} color="red" />
        </div>
        {/* Nội dung có thể cuộn */}
        <div className="overflow-y-auto h-[calc(600px-50px)] p-4 scrollbar-hide">
          {/* Thông tin hóa đơn*/}
          <div className="grid grid-cols-3 gap-4 pr-5">
            {/* Cột 1: */}
            <div className="col-span-1 space-y-2">
              {["id", "total_cost", "after_discount", "totalQuantity"].map((field) => (
                <div key={field} className={isEditing ? "": "border-b-1"} >
                  <span className="font-medium">{billFieldLabels[field] || field}: </span>
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
             {["created_at", "isDeleted", "customer.name", "employee.name"].map((field) => (
                <div key={field}>
                  <span className="font-medium">{billFieldLabels[field] || field}: </span>
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
              <span className="font-medium">{billFieldLabels["notes"]}: </span>
              {isEditing ? (
                <textarea
                  name="notes"
                  // value={editedBill.notes || ""}
                  // onChange={handleChange}
                  className="border rounded p-1 w-full h-24"
                />
              ) : (
                <p>{bill.notes}</p>
              )}
            </div>
          </div>
          
          <table className="mt-5 h-40 mx-auto w-190  border-collapse">
              {/* LABEL */}
              <thead className="bg-[#E6F1FE] sticky top-0 ">
                <tr className="border-b border-[#A6A9AC]">
                  <th className="p-2 text-left">Mã sản phẩm</th>
                  <th className="p-2 text-left">Tên sản phẩm</th>
                  <th className="p-2 text-left">Đơn giá</th>
                  <th className="p-2 text-left">Số lượng</th>
                  <th className="p-2 text-left">Thành tiền</th>
                </tr>
              </thead>
              {/* HÓA ĐƠN*/}
              <tbody>
                {bill.billDetails.map((billDetails: any, index: number) => (
                  <tr key={billDetails.productId} className={ `${index % 2 === 0 ? "bg-white" : "bg-gray-100 border-b border-[#A6A9AC]"} hover:bg-[#E6F1FE]`}>
                    <td className="p-2">SP00{billDetails.productId}</td>
                    <td className="p-2">{billDetails.productName}</td>
                    <td className="p-2">{billDetails.price.toLocaleString("vi-VN")}</td>
                    <td className="p-2">{billDetails.quantity}</td>
                    <td className="p-2">{(billDetails.price * billDetails.quantity).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          {/* SUMMARY */}

          <div className="p-4 ml-120">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng số lượng:</span>
                <span>{bill.totalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span>{(bill.total_cost).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá hóa đơn:</span>
                <span>{(bill.total_cost - bill.after_discount).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng cộng:</span>
                <span>{(bill.after_discount).toLocaleString("vi-VN")}</span>
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
            <button onClick={handleDelete} className="px-4 py-2 bg-red-400 text-white rounded cursor-pointer"><FontAwesomeIcon icon={faClose} className="mr-2"/>Xóa hóa đơn</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BillDetail;
