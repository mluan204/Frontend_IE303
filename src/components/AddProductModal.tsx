import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";

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
  categoryId: 0,
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
  const [fileImg, setFileImg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: name === "stock" ? Number(value) : value }));
  };

  const handleSave = () => {
    if (!newProduct.name.trim()) {
      alert("Tên sản phẩm không được để trống!");
      return;
    }
    onSave(newProduct);
    setNewProduct(emptyProduct);
    onClose();
  };

    const handleUpload= (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file) {
      setFileImg(file);
      const url = URL.createObjectURL(file);
      setNewProduct((prev) => ({ ...prev, image: url }));
    }
  }

    const fileInputRef = useRef(null)
    const handleButtonClick = () => {
      fileInputRef.current.click()
    }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-4/5 max-h-[540px] shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start px-4 py-3 bg-white mb-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Thêm sản phẩm mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl text-gray-500 cursor-pointer" onClick={onClose} />
        </div>
  
        {/* Body */}
        <div className="overflow-y-auto h-[calc(440px-48px)] px-6 pb-4 scrollbar-hide">
          <div className="grid grid-cols-4 gap-6">
            
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
              {["id", "name", "category", "supplier"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">{field === "id" ? "Mã sản phẩm" : field === "name" ? "Tên sản phẩm" : field === "category" ? "Phân loại" : "Nhà cung cấp"}</label>
                  <input
                    type="text"
                    name={field}
                    value={(newProduct as any)[field] || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                </div>
              ))}
            </div>
  
            {/* Cột 3 */}
            <div className="space-y-4">
              {["stock", "cost", "price", "expiry"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    {field === "stock" ? "Tồn kho" : field === "cost" ? "Giá nhập" : field === "price" ? "Giá bán" : "Hạn sử dụng"}
                  </label>
                  <input
                    type={field === "expiry" ? "date" : "text"}
                    name={field}
                    value={(newProduct as any)[field] || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-gray-700 text-sm"
                  />
                </div>
              ))}
            </div>
  
            {/* Cột 4 - Ghi chú */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Ghi chú</label>
                <textarea
                  name="notes"
                  value={newProduct.description}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full text-gray-700 text-sm h-24"
                />
              </div>
            </div>
          </div>
  
          {/* Nút Lưu */}
          <div className="flex justify-end gap-3 mt-4">
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
