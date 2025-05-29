import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { updateProduct } from "../service/productApi"; 
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

interface Category {
  id: number;
  name: string;
}

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

function ProductDetail({ product, isOpen, onClose, categories }: ProductDetailProps) {
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
    description: "Mô tả",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const isFormValid = editedProduct.name.trim() !== "" && editedProduct.price > 0 && editedProduct.inputPrice > 0 && editedProduct.quantityAvailable > 0 && editedProduct.image !== "" && editedProduct !== product;

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    try {
      const res = await updateProduct(editedProduct, product.id);
      toast.success("Cập nhật sản phẩm thành công!", { autoClose: 1000 });
      setIsEditing(false);
    } catch (err) {
      toast.error("Cập nhật sản phẩm thất bại!", { autoClose: 2000 });
    }
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
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Chi tiết sản phẩm</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-6 pb-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cột 1: Ảnh */}
            <div className="flex justify-center items-center flex-col">
              <img src={editedProduct.image} alt={editedProduct.name} className="w-32 h-32 object-cover rounded" />
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              {/* Mã sản phẩm: không chỉnh sửa */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {productFieldLabels["id"]}
                </label>
                {isEditing ? (
                    <input
                      type="text"
                      name="id"
                      value={editedProduct.id}
                      readOnly
                      className="border rounded px-2 py-1 w-full text-gray-700 text-sm bg-gray-100 cursor-not-allowed"
                    />
                ) : (
                   <div className="text-gray-900 text-sm">{editedProduct.id}</div>
                )}
               

              </div>

              {/* Tên sản phẩm */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {productFieldLabels["name"]}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedProduct.name}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                ) : (
                  <div className="text-gray-900 text-sm">{editedProduct.name}</div>
                )}
              </div>

              {/* Loại sản phẩm (dropdown) */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {productFieldLabels["categoryName"]}
                </label>
                {isEditing ? (
                  <select
                    name="categoryId"
                    value={editedProduct.categoryId}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const selectedCategory = categories.find((c) => c.id === selectedId);
                      setEditedProduct((prev) => ({
                        ...prev,
                        categoryId: selectedId,
                        categoryName: selectedCategory?.name || "",
                      }));
                    }}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900 text-sm">{editedProduct.categoryName}</div>
                )}
              </div>

              {/* Nhà cung cấp */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {productFieldLabels["suppliers"]}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="suppliers"
                    value={editedProduct.suppliers}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                ) : (
                  <div className="text-gray-900 text-sm">{editedProduct.suppliers}</div>
                )}
              </div>
            </div>


            {/* Cột 3 */}
            <div className="space-y-4">
              {["quantityAvailable", "inputPrice", "price", "dateExpired"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    {productFieldLabels[field as keyof Product]}
                  </label>
                  {isEditing ? (
                    field === "dateExpired" ? (
                      <input
                        type="date"
                        name={field}
                        value={editedProduct.dateExpired ? new Date(editedProduct.dateExpired).toISOString().split("T")[0] : ""}
                        onChange={(e) => {
                          setEditedProduct((prev) => ({
                            ...prev,
                            dateExpired: new Date(e.target.value),
                          }));
                        }}
                        className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <input
                        type="number"
                        name={field}
                        value={(editedProduct as any)[field] == 0 ?"":(editedProduct as any)[field]}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                      />
                    )
                  ) : (
                    <div className="text-gray-900 text-sm">
                      {field === "dateExpired"
                        ? new Date(editedProduct.dateExpired).toLocaleDateString("vi-VN")
                        : (editedProduct as any)[field]}
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* Cột 4: Ghi chú */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-500 block mb-1">{productFieldLabels.description}</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedProduct.description}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm h-24"
                />
              ) : (
                <div className="text-gray-900 text-sm whitespace-pre-wrap">{editedProduct.description}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            {isEditing ? (
              <button onClick={handleSave} className={`px-3 py-1.5 text-sm rounded text-white
                ${isFormValid ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}>
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
