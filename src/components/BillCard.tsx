import { useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CartItemProps {
    id: string;
    name: string;
    price: number; // Đảm bảo price là number
    quantity: number;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
  }
  
const BillCard: React.FC<CartItemProps> = ({ id, name, price, quantity, onUpdateQuantity, onRemove }) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  const handleDecrease = () => {
    if (currentQuantity > 1) {
      setCurrentQuantity(currentQuantity - 1);
      onUpdateQuantity(id, currentQuantity - 1);
    }
  };

  const handleIncrease = () => {
    setCurrentQuantity(currentQuantity + 1);
    onUpdateQuantity(id, currentQuantity + 1);
  };

  return (
    <div className="flex items-center border rounded-lg p-3 w-full justify-between">
      {/* Số thứ tự & Xóa */}
      <div className="flex items-center">
        <span className="text-gray-600 mr-2">{id}</span>
        <FontAwesomeIcon className="text-red-500 cursor-pointer" icon={faTrash} size="lg" onClick={() => onRemove(id)} />
        
      </div>

      {/* Tên sản phẩm */}
      <div className="flex-1 px-2">
        <p className="text-sm font-medium">{name}</p>
      </div>

      {/* Giá */}
      <span className="text-gray-400 text-sm w-20 text-right">{price.toLocaleString("vi-VN")}</span>

      {/* Điều chỉnh số lượng */}
      <div className="flex items-center border rounded-md px-2 mx-2">
        <button className="px-2 py-1 text-gray-600" onClick={handleDecrease}>-</button>
        <span className="px-3">{currentQuantity}</span>
        <button className="px-2 py-1 text-gray-600" onClick={handleIncrease}>+</button>
      </div>

      {/* Tổng tiền */}
      <span className="font-bold">{(price * currentQuantity).toLocaleString("vi-VN")}</span>
    </div>
  );
};

export default BillCard;
