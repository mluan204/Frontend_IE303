import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";
import { createProduct } from "../service/productApi";
import { uploadImage } from "../service/uploadImg";
const CATEGORIES = [
  "Thực phẩm ăn liền",
  "Đồ uống có cồn",
  "Kẹo bánh",
  "Mỹ phẩm",
  "Nước ngọt",
  "Sữa",
  "Thuốc lá",
  "Văn phòng phẩm",
  "Đồ dùng cá nhân"
] as const;


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

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProduct: Product) => void;
}

const emptyProduct: Product = {
  categoryId: 1,
  categoryName: "",
  dateExpired: new Date(),
  description: "",
  id: 0,
  image: "",
  inputPrice: 0,
  name: "",
  price: 0,
  quantityAvailable: 0,
  salePrice: "",
  suppliers: ""
};

function ProductAddModal({ isOpen, onClose, onSave }: ProductAddModalProps) {
  const [newProduct, setNewProduct] = useState<Product>(emptyProduct);
  const [fileImg, setFileImg] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(name);

    if (name === "categoryId") {
      setNewProduct((prev) => ({ ...prev, categoryId: (CATEGORIES.indexOf(value as typeof CATEGORIES[number]) + 1) }));
    } else if (name === "dateExpired") {
      setNewProduct((prev) => ({ ...prev, dateExpired: new Date(value) }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: name === "quantityAvailable" || name === "inputPrice" || name === "price" ? Number(value) : value }));
    }

  };

  const handleSave = async () => {
    if (!newProduct.name.trim()) {
      alert("Tên sản phẩm không được để trống!");
      return;
    }

    try {
      let productToSave = { ...newProduct };

      if (fileImg) {
        const url = await uploadImage(fileImg);
        if (url) {
          productToSave = { ...productToSave, image: url };
        }
      }

      const resId = await createProduct(productToSave);
      const updatedProduct = {
        ...productToSave,
        id: Number(resId)
      };

      onSave(updatedProduct);
      setNewProduct(emptyProduct);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Có lỗi xảy ra khi lưu sản phẩm!");
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileImg(file);
    const previewUrl = URL.createObjectURL(file);
    setNewProduct((prev) => ({ ...prev, image: previewUrl }));
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] md:w-4/5 max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Thêm sản phẩm mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-56px)] px-6 pb-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cột 1 - Ảnh */}
            <div className="space-y-4">
              <div className="flex justify-center items-center flex-col h-full">
                <div className="w-32 h-32 border border-gray-300 flex items-center justify-center rounded">
                  {newProduct.image ? (
                    <img src={newProduct.image} alt="Preview" className="object-cover w-full h-full rounded" />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />

                <button
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleButtonClick}
                >
                  Thêm ảnh
                </button>
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Phân loại</label>
                <select
                  name="categoryId"
                  value={CATEGORIES[newProduct.categoryId]}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  name="suppliers"
                  value={newProduct.suppliers}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Cột 3 */}
            <div className="space-y-4">
              {[
                { name: "quantityAvailable", label: "Tồn kho" },
                { name: "inputPrice", label: "Giá nhập" },
                { name: "price", label: "Giá bán" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    value={field.name === "dateExpired" ? (newProduct.dateExpired.toISOString().split("T")[0]) : (newProduct as any)[field.name]}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Cột 4 - Ghi chú */}
            <div className="space-y-4">
              {[
                { name: "dateExpired", label: "Hạn sử dụng", type: "date" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{field.label}</label>
                  <input
                    type={field.type} // dùng type="date"
                    name={field.name}
                    value={
                      field.name === "dateExpired"
                        ? newProduct.dateExpired?.toISOString().split("T")[0]
                        : (newProduct as any)[field.name]
                    }
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                </div>
              ))}

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-500 block mb-1">Ghi chú</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm h-24"
                />
              </div>
            </div>
            
          </div>

          {/* Nút Lưu */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleSave} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded">
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductAddModal;
