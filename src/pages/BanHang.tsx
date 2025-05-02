import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import BillItem from "../components/BillItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PopupThanhToan from "./PopupThanhToan";
import { fetchAllProduct } from "../service/productApi";

// Định nghĩa kiểu dữ liệu cho product
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}


function BanHang() {
  
  // State để quản lý giỏ hàng và tìm kiếm
  const [loading, setLoading] = useState(true);
  const [rawProductList, setRawProductList] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);


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


  const fetchData = async () => {
      try {
        const result = await fetchAllProduct(); // trả về mảng any[]
        setRawProductList(result); // giữ nguyên tất cả dữ liệu backend trả về

        // map sang Product để hiển thị
        const mapped: Product[] = result.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price ?? 100000,
          image: item.image,
          quantity: 0
        }));
        setProducts(mapped);        
        console.log(result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div   className="flex h-[calc(100vh-2.5rem)] bg-gray-100 ">
      <Helmet>
        <title>Bán hàng</title>
      </Helmet>
      <div className="flex flex-col w-2/3 h-[calc(100vh-2.5rem)]">
        {/* Thanh tìm kiếm nằm bên trong danh sách, có nền trắng để dễ nhìn hơn */}
        <div className="absolute z-10" onMouseLeave={()=> setIsSearchOpen(false)}>
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
            <div className="relative w-96 bg-white shadow-lg rounded-md flex items-center focus:outline-none focus:ring">
              <span className="absolute pl-2 text-gray-400 ">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-8 py-2 bg-white rounded-md focus:outline-none "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                
              />          
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm có thể cuộn */}
        <div className="flex-1 overflow-y-auto p-4 mt-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
             .sort((a, b) => a.name.localeCompare(b.name)).map((product) => (
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
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mt-2"
               onClick={() => setShowPopup(true)}
            >Thanh toán</button>
          </div>
      </div>
      {showPopup && (
                <div 
                    className="fixed inset-0 bg-black opacity-60 backdrop-blur-sm z-10"
                    onClick={() => setShowPopup(false)}
                ></div>
            )}
      {showPopup && <PopupThanhToan total={calculateTotal()} cart={cart} onClose={() => setShowPopup(false)} />}
    
    </div>
  );
}

export default BanHang;
