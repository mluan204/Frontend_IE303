import { useState, useEffect } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CartItemProps {
  index: number;
  id: string;
  name: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const BillItem: React.FC<CartItemProps> = ({ index, id, name, price, quantity, onUpdateQuantity, onRemove }) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  useEffect(() => {
    setCurrentQuantity(quantity);
  }, [quantity]);

  const handleDecrease = () => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      setCurrentQuantity(newQuantity);
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = currentQuantity + 1;
    setCurrentQuantity(newQuantity);
    onUpdateQuantity(id, newQuantity);
  };

  return (
    <div className="flex items-center border-b border-gray-300 p-3 w-full justify-between my-1">
      {/* Số thứ tự & Xóa */}
      <div className="flex w-1/12 items-center justify-end mr-1">
        <span className="text-gray-600 mr-2">{index}</span>
        <FontAwesomeIcon icon={faTrash} onClick={() => onRemove(id)} />
      </div>

      {/* Tên sản phẩm */}
      <div className="flex-1 px-2 w-4/12">
        <p className="text-sm font-medium line-clamp-2 text-ellipsis">{name}</p>
      </div>

      {/* Giá */}
      <span className="text-right text-gray-400 text-sm">{price.toLocaleString("vi-VN")}đ</span>

      {/* Điều chỉnh số lượng */}
      <div className="flex items-center justify-between w-16 mx-4">
        <button className="text-gray-500 rounded-full border border-gray-300 bg-gray-300 w-4 h-4 flex items-center justify-center my-1 " onClick={handleDecrease}>-</button>
        <span className="w-10 text-center  border-b-2 border-gray-300 text-gray-500">{currentQuantity}</span>
        <button className="text-gray-500 rounded-full border border-gray-300 bg-gray-300  w-4 h-4 flex items-center justify-center" onClick={handleIncrease}>+</button>
      </div>

      {/* Tổng tiền */}
      <span className="w-2/12 font-bold text-right">{(price * currentQuantity).toLocaleString("vi-VN")}đ</span>
    </div>
  );
};

export default BillItem;
