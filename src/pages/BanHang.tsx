import { Helmet } from "react-helmet";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import BillItem from "../components/BillItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

// Định nghĩa kiểu dữ liệu cho product
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Tạo danh sách sản phẩm
const products: Product[] = Array.from({ length: 30 }, (_, i) => ({
  id: `SP${String(i + 1).padStart(6, "0")}`,
  name: `Sản phẩm vhhjsd djhdshusd hc sđs ssd shsyudyuds  sdhgghds${i + 1}`,
  price: 100000 + i * 5000,
  image: "https://i.pinimg.com/736x/e8/48/0b/e8480bf7fb0d44e678db430af23723ec.jpg",
  quantity: 1 
}));

function BanHang() {
  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: existingProduct.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  return (
    <div onClick={()=>setIsSearchOpen(false)}  className="flex h-[calc(100vh-2.5rem)] bg-gray-100 ">
      <Helmet>
        <title>Bán hàng</title>
      </Helmet>
      <div className="flex flex-col w-2/3 h-[calc(100vh-2.5rem)]">
        {/* Thanh tìm kiếm nằm bên trong danh sách, có nền trắng để dễ nhìn hơn */}
        <div className="absolute z-10">
      {/* Icon Tìm Kiếm */}
      {!isSearchOpen ? (
        <button 
          onMouseEnter={() => setIsSearchOpen(true)}
          onClick={() => setIsSearchOpen(true)}
          className="py-2 px-3 bg-white rounded-br-lg shadow-md"
        >
          <FontAwesomeIcon icon={faSearch} className="text-gray-600" />
        </button>
      ) : (
        /* Thanh Tìm Kiếm */
        <div className="relative w-96 bg-white shadow-lg rounded-md flex items-center">
          <span className="absolute pl-2 text-gray-400 ">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-8 py-2 bg-white rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            
          />          
        </div>
      )}
    </div>

        {/* Danh sách sản phẩm có thể cuộn */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard {...product} addToCart={() => addToCart(product)} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-[calc(100vh-2.5rem)] w-1/3 bg-white flex flex-col right-0 border-l-2 border-gray-300" >
          <h2 className="h-12 w-full text-center text-lg font-bold py-2 shadow-md">HÓA ĐƠN</h2>
          <ul className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {cart.map((product, index) => (
              <BillItem
                index={index+1}
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                quantity={product.quantity}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </ul>
          <div className="flex flex-col bg-white w-1/3 right-0 p-4 fixed bottom-0 border-t-2 border-l-2 border-gray-300">
              
              <div className="font-bold w-full text-right">
                Tổng tiền: {calculateTotal().toLocaleString("vi-VN")}đ
              </div>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mt-2">Thanh toán</button>
          </div>
      </div>
    </div>
  );
}

export default BanHang;
