import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";

interface Product {
  categoryId: number,
  categoryName: string,
  dateExpired: Date,
  description: string,
  id: number,
  image: string,
  inputPrice: number,
  name: string,
  price: number,
  quantityAvailable: number,
  salePrice: string,
  suppliers: string
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  const productFieldLabels: Record<keyof Product, string> = {
    id: "Mã sản phẩm",
    name: "Tên sản phẩm",
    price: "Giá bán",
    inputPrice: "Giá nhập",
    quantityAvailable: "Tồn kho",
    image: "Ảnh",
    categoryName: "Phân loại",
    categoryId: "Mã phân loại",         // <-- Bổ sung
    suppliers: "Nhà cung cấp",
    salePrice: "Giá khuyến mãi",        // <-- Bổ sung
    dateExpired: "Hạn sử dụng",
    description: "Ghi chú",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };
  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-2xl w-4/5 max-h-[540px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết sản phẩm</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(440px-48px)] px-6 pb-4 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="flex justify-center items-center flex-col h-full">
                <img src={editedProduct.image} alt={editedProduct.name} className="w-32 h-32 object-cover rounded" />
              </div>
            </div>
            {/* Column 2 */}
            <div className="space-y-4">
              {["id", "name", "category", "supplier"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{productFieldLabels[field as keyof Product]}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={(editedProduct as any)[field] || ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 text-sm">{(editedProduct as any)[field]}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Column 3*/}
            <div className="space-y-4">
              {["stock", "cost", "price", "expiry"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{productFieldLabels[field as keyof Product]}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={(editedProduct as any)[field] || ""}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                    />
                  ) : (
                    <div className="text-gray-900 text-sm">{(editedProduct as any)[field]}</div>
                  )}
                </div>
              ))}
            </div>

            

            {/* Column 4 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">{productFieldLabels.description}</label>
                {isEditing ? (
                  <textarea
                    name="notes"
                    value={editedProduct.description}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm h-24"
                  />
                ) : (
                  <div className="text-gray-900 text-sm whitespace-pre-wrap">{editedProduct.description}</div>
                )}
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

export default ProductDetail;
