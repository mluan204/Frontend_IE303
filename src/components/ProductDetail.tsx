import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit} from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  price: string;
  cost: string;
  stock: number;
  image: string;
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type ProductField = keyof Product;

function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Gọi hàm lưu ở đây
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  const handleDelete = () => {
    ///
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-[800px] shadow-lg">
        {/* Thanh tiêu đề */}
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Chi tiết sản phẩm</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2" onClick={handleClose} color="red" />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="grid grid-cols-4 gap-4">
          {/* Cột 1: Ảnh */}
          <div className="col-span-1 flex flex-col justify-center items-center">
            <img src={editedProduct.image} alt={editedProduct.name} className="mb-5 w-32 h-32 object-cover" />
            <label htmlFor="image-upload" className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600">
             Tải ảnh lên
            </label>
           
          </div>

          {/* Cột 2: ID, Tên, Phân loại, Nhà cung cấp, Tồn kho */}
          <div className="col-span-1 space-y-2">
            {(["id", "name", "category", "supplier", "stock"] as Array<keyof Product>).map((field) => (
              <div key={field} className={isEditing ? "": "border-b-1"} >
                <span className="font-medium">{field}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedProduct[field] || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span >{editedProduct[field]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột 3: Giá nhập, Giá bán, Hạn sử dụng */}
          <div className="col-span-1 space-y-2">
            {(["cost", "price", "expiry"] as Array<keyof Product>).map((field) => (
              <div key={field} className={isEditing ? "": "border-b-1"}>
                <span className="font-medium">{field}: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={editedProduct[field] || ""}
                    onChange={handleChange}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span>{editedProduct[field]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột 4: Ghi chú */}
          <div className="col-span-1 border-l-1 pl-2">
            <span className="font-medium">Ghi chú: </span>
            {isEditing ? (
              <textarea
                name="notes"
                value={""}
                // onChange={handleChange}
                className="border rounded p-1 w-full h-24"
              />
            ) : (
              <p></p>
            )}
          </div>
        </div>

        {/* Nút điều khiển */}
        <div className="flex justify-end gap-10 mt-4 mb-8 mr-8">
          {isEditing ? (
            <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded"><FontAwesomeIcon icon={faSave} className="mr-2"/>Lưu</button>
          ) : (
            <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white rounded"><FontAwesomeIcon icon={faEdit} className="mr-2"/>Chỉnh sửa</button>
          )}
          <button onClick={handleDelete} className="px-4 py-2 bg-red-400 text-white rounded"><FontAwesomeIcon icon={faClose} className="mr-2"/>Xóa sản phẩm</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
