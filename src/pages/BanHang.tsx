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

// Combo: mỗi combo là một nhóm sản phẩm có liên quan
const comboList = [
  {
    comboName: "Combo Trà sữa + Bánh ngọt",
    products: [
      { id: "1", price: 8000, quantity: 1 },
      { id: "2", price: 12000, quantity: 1 },
      { id: "4", price: 15000, quantity: 1 },
    ],
  },
  {
    comboName: "Combo Gà rán + Pepsi",
    products: [
      { id: "3", price: 35000, quantity: 1 },
      { id: "4", price: 15000, quantity: 1 }
    ],
  },
  {
    comboName: "Combo Mua 2 tặng 1",
    products: [
      { id: "5", price: 670000, quantity: 2 },
      { id: "5", price: 0, quantity: 1 } // tặng 1 miễn phí
    ]
  }
];



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
    setSearch("");
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
  let total = 0;

  // Clone giỏ hàng để xử lý mà không ảnh hưởng tới state gốc
  const cartCopy = cart.map(item => ({ ...item }));

  // Duyệt qua các combo và áp dụng nếu đủ điều kiện
  comboList.forEach(combo => {
    const comboItems = combo.products;

    // Lặp cho đến khi combo còn có thể áp dụng
    while (
      comboItems.every(cItem => {
        const found = cartCopy.find(ci => ci.id === cItem.id);
        return found && found.quantity >= cItem.quantity;
      })
    ) {
      // Cộng tổng giá combo
      const comboPrice = comboItems.reduce((sum, p) => sum + p.price * p.quantity, 0);
      total += comboPrice;

      // Trừ số lượng các sản phẩm trong combo khỏi cartCopy
      comboItems.forEach(cItem => {
        const found = cartCopy.find(ci => ci.id === cItem.id);
        if (found) {
          found.quantity -= cItem.quantity;
        }
      });
    }
  });

  // Cộng phần sản phẩm còn lại không nằm trong combo hoặc dư số lượng
  cartCopy.forEach(p => {
    if (p.quantity > 0) {
      total += p.price * p.quantity;
    }
  });

  return total;
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

  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };


  const findComboForProduct = (productId: string) => {
    return comboList.find(combo => 
      combo.products.some((product) => product.id === productId)
    );
  };

  const getOtherProductInCombo = (combo: any, currentId: string) => {
    return combo.products.filter((product: Product) => product.id !== currentId);
  };



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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(""); // Xoá giá trị tìm kiếm
                    setIsSearchOpen(false); // Ẩn thanh tìm kiếm nếu muốn
                  }
                }}
              />
                        
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm có thể cuộn */}
        <div className="flex-1 overflow-y-auto p-4 mt-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.filter(p => removeVietnameseTones(p.name.toLowerCase())
                        .includes(removeVietnameseTones(search.toLowerCase())))
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
            {cart.map((product, index) => {
              const combo = findComboForProduct(product.id);
              const suggestedItems = combo ? getOtherProductInCombo(combo, product.id) : [];
              
              let discountedPrice = product.price;
              if (combo) {
                const comboSatisfied = combo.products.every(cItem => {
                  const cartItem = cart.find(ci => ci.id === cItem.id);
                  return cartItem && cartItem.quantity >= cItem.quantity;
                });

                if (comboSatisfied) {
                  const comboItem = combo.products.find((item) => item.id === product.id);
                  if (comboItem) {
                    discountedPrice = comboItem.price;
                  }
                }
              }

              const suggestedProducts = suggestedItems
                .filter((item: { id: string; price: number; quantity: number }) => !cart.find(cartItem => cartItem.id === item.id))
                .map((item: { id: string; price: number; quantity: number }) => {
                  const fullProduct = products.find(p => p.id === item.id);
                  return fullProduct ? {
                    ...fullProduct,
                    price: item.price,
                    quantity: item.quantity
                  } : null;
                })
                .filter(Boolean) as Product[];

              return (
                <li key={`${product.id}-${product.quantity}`}>
                  <BillItem
                    index={index + 1}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    quantity={product.quantity}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    discount={discountedPrice}
                  />

                  {combo && suggestedProducts.length > 0 && (
                    <div className="p-2 text-xs text-gray-700 bg-blue-50 rounded">
                      <div className="pl-2">
                       Mua thêm tiết kiệm hơn 
                      </div>
                      <ul className="pl-4 mt-1 text-sm list-disc list-inside">
                        {suggestedProducts.map((sp) => (
                          <li key={sp.id} className="flex items-center gap-2 py-1">
                            {/* Tên sản phẩm */}
                            <div className="w-1/2 text-sm line-clamp-1 text-ellipsis">{sp.name}</div>

                            {/* Giá gốc (nếu có) */}
                            <div className="w-1/6 text-sm text-gray-500 line-through">
                              {
                                products.find((p: Product) => p.id === sp.id)?.price.toLocaleString()
                              }₫
                            </div>

                            {/* Giá combo */}
                            <div className="w-1/6 text-sm text-red-600 font-semibold">
                              {sp.price.toLocaleString()}₫
                            </div>

                            {/* Nút thêm */}
                            <button
                              onClick={() => {
                                const foundProduct = products.find((p: Product) => p.id === sp.id);
                                if (foundProduct) {
                                  addToCart(foundProduct);
                                }
                              }}
                              className="text-blue-700 w-1/6 hover:underline text-sm"
                            >
                              Thêm
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}


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
