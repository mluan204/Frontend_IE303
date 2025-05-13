import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import BillItem from "../components/BillItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PopupThanhToan from "./PopupThanhToan";
import { fetchAllProduct } from "../service/mainApi";

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
  const [showMobileBill, setShowMobileBill] = useState(false);

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
      const result = await fetchAllProduct();
      setRawProductList(result);
      const mapped: Product[] = result.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price ?? 100000,
        image: item.image,
        quantity: 0
      }));
      setProducts(mapped);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-[calc(100vh-2.5rem)] bg-gray-100 relative">
      <Helmet>
        <title>Bán hàng</title>
      </Helmet>

      {/* Nút xem hóa đơn trên mobile */}
      {!showMobileBill && !showPopup && (
        <button
          className="lg:hidden fixed top-10 right-0 z-50 bg-[#007bff] text-white px-4 py-2 rounded shadow"
          onClick={() => setShowMobileBill(true)}
        >
          Xem hóa đơn ({cart.length})
        </button>
      )}

      <div className="flex flex-col w-full lg:w-2/3 h-full">
      {/* Thanh tìm kiếm nằm bên trong danh sách, có nền trắng để dễ nhìn hơn */}
        <div className="absolute z-10" onMouseLeave={() => setIsSearchOpen(false)}>
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
            // Thanh Tìm Kiếm
            <div className="relative w-96 bg-white shadow-lg rounded-md flex items-center">
              <span className="absolute pl-2 text-gray-400 ">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-8 py-2 bg-white rounded-md focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />          
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 mt-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((product) => (
                <li key={product.id}>
                  <ProductCard {...product} addToCart={() => addToCart(product)} />
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Hóa đơn */}
      <div className={`h-full w-full lg:w-1/3 bg-white flex flex-col border-l-2 border-gray-300 z-40 transition-transform duration-300 ease-in-out
        ${showMobileBill ? 'translate-x-0 fixed top-0 right-0' : 'hidden lg:flex'}`}>
        <h2 className="h-12 w-full text-center text-lg font-bold py-2 shadow-md">HÓA ĐƠN</h2>
        <ul className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {cart.map((product, index) => (
            <BillItem
              index={index + 1}
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

        <div className="bg-white w-full p-4 border-t-2 border-gray-300">
          <div className="font-bold w-full text-right">
            Tổng tiền: {calculateTotal().toLocaleString("vi-VN")}đ
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() => {
                setShowPopup(true);
                setShowMobileBill(false);
              }}
            >
              Thanh toán
            </button>
            <button
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded lg:hidden"
              onClick={() => setShowMobileBill(false)}
            >
              Đóng hóa đơn
            </button>
          </div>
        </div>
      </div>

      {/* Overlay và popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black opacity-60 backdrop-blur-sm z-10"
          onClick={() => setShowPopup(false)}
        ></div>
      )}
      {showPopup && (
        <PopupThanhToan total={calculateTotal()} cart={cart} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default BanHang;
