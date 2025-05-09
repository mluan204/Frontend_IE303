import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faSave } from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  price: string;
  cost: string;
  category: string;
  stock: number;
  image: string;
  supplier: string;
  expiry: string;
  notes: string;
}

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProduct: Product) => void;
}

const emptyProduct: Product = {
  id: "",
  name: "",
  price: "",
  cost: "",
  category: "",
  stock: 0,
  image: "",
  supplier: "",
  expiry: "",
  notes: "",
};

function ProductAddModal({ isOpen, onClose, onSave }: ProductAddModalProps) {
  const [newProduct, setNewProduct] = useState<Product>(emptyProduct);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white w-4/5 shadow-lg rounded">
        <div className="flex justify-between border-b pt-2 pl-2 bg-[#C3F5DB] mb-5">
          <h2 className="text-lg p-1 rounded-t-lg font-semibold bg-white">Thêm sản phẩm mới</h2>
          <FontAwesomeIcon icon={faClose} className="text-2xl mr-2 cursor-pointer" onClick={onClose} color="red" />
        </div>
        {/* ẢNH SẢN PHẨM */}
        <div className="grid grid-cols-4 gap-4 pr-5 px-4">
          <div className="col-span-1 flex flex-col justify-center items-center">
            <div className="mb-2 w-32 h-32 border border-gray-300 flex items-center justify-center">
              {newProduct.image ? (
                <img src={newProduct.image} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <label htmlFor="image-upload" className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600">
              Tải ảnh lên
            </label>
          </div>
              
          <div className="col-span-1 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã sản phẩm</label>
              <input type="text" name="id" value={newProduct.id} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input type="text" name="name" value={newProduct.name} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phân loại</label>
              <input type="text" name="category" value={newProduct.category} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nhà cung cấp</label>
              <input type="text" name="supplier" value={newProduct.supplier} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tồn kho</label>
              <input type="number" name="stock" value={newProduct.stock} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
          </div>

          <div className="col-span-1 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Giá nhập</label>
              <input type="text" name="cost" value={newProduct.cost} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giá bán</label>
              <input type="text" name="price" value={newProduct.price} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hạn sử dụng</label>
              <input type="date" name="expiry" value={newProduct.expiry} onChange={handleChange} className="border rounded p-1 w-full" />
            </div>
          </div>

          <div className="col-span-1 space-y-2 pl-2">
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea name="notes" value={newProduct.notes} onChange={handleChange} className="border rounded p-1 w-full h-32" />
          </div>
        </div>

        <div className="flex justify-end gap-10 mt-4 mb-8 mr-8">
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductAddModal;
