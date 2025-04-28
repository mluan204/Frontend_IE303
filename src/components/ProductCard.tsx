import React from "react";

// Định nghĩa kiểu dữ liệu cho props
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  addToCart: (product: { id: string; name: string; price: number; image: string }) => void; // Hàm thêm vào hóa đơn
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, addToCart }) => {
  return (
    <button
      className="w-52 bg-white rounded-lg shadow-md p-2 flex flex-col items-center outline-1 outline-gray-200"
      onClick={() => addToCart({ id, name, price, image })}
    >
      {/* Hình ảnh sản phẩm */}
      <img className="w-48 h-32 object-cover" src={image} alt={name} />

      {/* Thông tin sản phẩm */}
      <div className="text-center mt-2">
        {/* Thêm các thuộc tính CSS để giới hạn tên sản phẩm */}
        <p className="text-lg font-medium text-gray-800 truncate whitespace-nowrap text-ellipsis w-48">
          {name}
        </p>
        <p className="text-blue-600 text-lg font-semibold">{price.toLocaleString("vi-VN")}đ</p>
      </div>
    </button> 
  );
};

export default ProductCard;
