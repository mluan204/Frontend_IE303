import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import BillItem from "../components/BillItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import PopupThanhToan from "./PopupThanhToan";
import { fetchAllProduct } from "../service/mainApi";
import { getProductQuantity } from "../service/billApi";
import { generateProductSuggestions } from "../components/GeminiService";
import { getAllCustomer } from "../service/customerApi";
import { getAllEmployees, getWeeklyShifts } from "../service/employeeApi";
import { getAllComboListProduct } from "../service/comboApi";

// Định nghĩa kiểu dữ liệu cho product
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number; // Giá đã giảm, ví dụ: 5000
}

export interface ComboProduct {
  id: string; // luôn string để thống nhất với product.id trong cart
  price: number;
  quantity: number;
}

export interface Combo {
  products: ComboProduct[];
}


// Combo: mỗi combo là một nhóm sản phẩm có liên quan
const comboList = [
  {
    products: [
      { id: "7", price: 8000, quantity: 1 },
      { id: "14", price: 12000, quantity: 1 },
      { id: "4", price: 15000, quantity: 1 },
    ],
  },
  {
    products: [
      { id: "3", price: 35000, quantity: 1 },
      { id: "4", price: 15000, quantity: 1 },
    ],
  },
  {
    products: [
      { id: "5", price: 670000, quantity: 2 },
      { id: "5", price: 0, quantity: 1 }, // tặng 1 miễn phí
    ],
  },
];
interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

interface Employee {
  id: number;   
  name: string;
}

function BanHang() {
  // State để quản lý giỏ hàng và tìm kiếm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawProductList, setRawProductList] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showMobileBill, setShowMobileBill] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [comboList, setComboList] = useState<Combo[]>([]);

    const fetchDataCombo = async () => {
    try{
      setLoading(true)
      const res = await getAllComboListProduct();
      console.log("Raw combo data structure:", JSON.stringify(res, null, 2));
      
      // Map the response data to match the Combo interface with safe checks
      const mappedComboList = res.map((combo: any) => {
        if (!combo.products || !Array.isArray(combo.products)) {
          console.warn("Invalid combo structure:", combo);
          return { products: [] };
        }
        
        return {
          products: combo.products.map((product: any) => {
            // Log the product structure if id is missing
            if (!product.id && !product.productId) {
              console.warn("Product missing ID:", product);
            }
            
            return {
              id: (product.id || product.productId || '').toString(), // Try both id and productId with fallback
              price: product.price || 0,
              quantity: product.quantity || 1
            };
          }).filter(p => p.id) // Remove any products without valid IDs
        };
      });
      
      console.log("Mapped combo list structure:", JSON.stringify(mappedComboList, null, 2));
      setComboList(mappedComboList);

      // Save combo data to localStorage with current date
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("lastComboFetchDate", today);
      localStorage.setItem("combos", JSON.stringify(mappedComboList));
    }catch(err){
       console.error("Error fetching data:", err);
       console.error("Error details:", {
         name: err.name,
         message: err.message,
         stack: err.stack
       });
      setError("Không thể tải danh sách combo. Vui lòng thử lại sau.");
    }finally {
      setLoading(false);
    }
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchAllProduct();
      setRawProductList(result);

      const mapped: Product[] = result.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price ?? 100000,
        image: item.image,
        quantity: 0,
      }));
      setProducts(mapped);

      const resultCustomer = await getAllCustomer();
      const resultEmployee = await getAllEmployees();

      if (resultCustomer) setCustomers(resultCustomer);
      if (resultEmployee) setEmployees(resultEmployee);

      // Lưu dữ liệu và ngày gọi vào localStorage
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("lastFetchDate", today);
      localStorage.setItem("products", JSON.stringify(mapped));
      localStorage.setItem("customers", JSON.stringify(resultCustomer));
      localStorage.setItem("employees", JSON.stringify(resultEmployee));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const lastFetchDate = localStorage.getItem("lastFetchDate");
        const lastComboFetchDate = localStorage.getItem("lastComboFetchDate");

        // Lấy dữ liệu từ localStorage
        const localProducts = localStorage.getItem("products");
        const localCustomers = localStorage.getItem("customers");
        const localEmployees = localStorage.getItem("employees");
        const localCombos = localStorage.getItem("combos");

        // Nếu có dữ liệu trong localStorage thì load vào state
        if (localProducts && localCustomers && localEmployees) {
          setProducts(JSON.parse(localProducts));
          setCustomers(JSON.parse(localCustomers));
          setEmployees(JSON.parse(localEmployees));
        }

        // Load combo data from localStorage if available
        if (localCombos) {
          setComboList(JSON.parse(localCombos));
        }

        // Nếu chưa fetch hôm nay thì gọi API
        if (lastFetchDate !== today) {
          await fetchData();
        }

        // Fetch combo data if not fetched today
        if (lastComboFetchDate !== today) {
          await fetchDataCombo();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const addToCart = async (product: Product) => {
    setCart((prevCart) => {
    // Bước 1: Thêm hoặc tăng sản phẩm
    let updatedCart: Product[] = [];

    const existingProduct = prevCart.find((item) => item.id === product.id);
    if (existingProduct) {
      updatedCart = prevCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...prevCart, { ...product, quantity: 1, discount: 0 }];
    }

    // Bước 2: Kiểm tra và áp dụng combo
    for (const combo of comboList) {
      const isComboSatisfied = combo.products.every((comboItem) => {
        const itemInCart = updatedCart.find((ci) => ci.id == comboItem.id);
        return itemInCart && itemInCart.quantity >= comboItem.quantity;
      });

      if (isComboSatisfied) {
        // Áp dụng discount cho các sản phẩm thuộc combo
        updatedCart = updatedCart.map((item) => {
          const comboItem = combo.products.find((p) => p.id == item.id);
          console.log("comboitem", comboItem)
          if (comboItem) {
            return {
              ...item,
              discount: comboItem.price,
            };
          }
          return item;
        });
      }
    }

    return updatedCart;
  });
    setSearch("");

    // Generate suggestions when adding to cart
    try {
      setIsLoadingSuggestions(true);
      const cartItems = cart.map((item) => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
      }));

      // Add the newly added product to cart items
      cartItems.push({
        productId: parseInt(product.id),
        quantity: 1,
      });

      // Get real sales data using getProductQuantity API
      const allProductQuantities = await getProductQuantity();
      const salesData =
        allProductQuantities?.map(
          (pq: { productId: number; totalQuantity: number }) => ({
            productId: pq.productId,
            totalQuantity: pq.totalQuantity,
          })
        ) || [];

      const suggestions = await generateProductSuggestions(
        cartItems,
        products.map((p) => ({
          id: parseInt(p.id),
          name: p.name,
          description: "",
          image: p.image,
          suppliers: null,
          quantityAvailable: 0,
          dateExpired: null,
          salePrice: null,
          inputPrice: 0,
          price: p.price,
          categoryId: 0,
          categoryName: "",
        })),
        salesData
      );

      // Add quantity property to suggested products
      const suggestedProductsWithQuantity = suggestions.map((p) => ({
        ...p,
        id: p.id.toString(),
        quantity: 1,
      }));

      setSuggestedProducts(suggestedProductsWithQuantity);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
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
    const cartCopy = cart.map((item) => ({ ...item }));

    // Duyệt qua các combo và áp dụng nếu đủ điều kiện
    comboList.forEach((combo) => {
      const comboItems = combo.products;

      // Lặp cho đến khi combo còn có thể áp dụng
      while (
        comboItems.every((cItem) => {
          const found = cartCopy.find((ci) => ci.id === cItem.id);
          return found && found.quantity >= cItem.quantity;
        })
      ) {
        // Cộng tổng giá combo
        const comboPrice = comboItems.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );
        total += comboPrice;

        // Trừ số lượng các sản phẩm trong combo khỏi cartCopy
        comboItems.forEach((cItem) => {
          const found = cartCopy.find((ci) => ci.id === cItem.id);
          if (found) {
            found.quantity -= cItem.quantity;
          }
        });
      }
    });

    // Cộng phần sản phẩm còn lại không nằm trong combo hoặc dư số lượng
    cartCopy.forEach((p) => {
      if (p.quantity > 0) {
        total += p.price * p.quantity;
      }
    });

    return total;
  };




  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const findComboForProduct = (productId: string) => {
    return comboList.find((combo) =>
      combo.products.some((product) => product.id === productId)
    );
  };

  const getOtherProductInCombo = (combo: any, currentId: string) => {
    return combo.products.filter(
      (product: Product) => product.id !== currentId
    );
  };


  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button

            onClick={fetchData}
            className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"

          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-[calc(100vh-2.5rem)] bg-gray-100 relative">
      <Helmet>
        <title>Bán hàng</title>
      </Helmet>

      {/* Nút xem hóa đơn trên mobile */}
      {!showMobileBill && !showPopup && (
        <button
          className="lg:hidden cursor-pointer fixed top-10 right-0 z-50 bg-[#007bff] text-white px-4 py-2 rounded shadow"
          onClick={() => setShowMobileBill(true)}
        >
          Xem hóa đơn ({cart.length})
        </button>
      )}

      <div className="flex flex-col w-full lg:w-2/3 h-full">
        {/* Thanh tìm kiếm nằm bên trong danh sách, có nền trắng để dễ nhìn hơn */}
        <div
          className="absolute z-10"
          onMouseLeave={() => setIsSearchOpen(false)}
        >
          {/* Icon Tìm Kiếm */}

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(""); // Xoá giá trị tìm kiếm
                    setIsSearchOpen(false); // Ẩn thanh tìm kiếm nếu muốn
                  }
                }}
              />
            </div>

        </div>

        <div
          className="flex-1 overflow-y-auto p-4 mt-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products
              .filter((p) =>
                removeVietnameseTones(p.name.toLowerCase()).includes(
                  removeVietnameseTones(search.toLowerCase())
                )
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((product) => (
                <li key={product.id} className=" cursor-pointer">
                  <ProductCard
                    id={product.id}
                    {...product}
                    addToCart={() => {
                      addToCart(product);
                      console.log("onclik",comboList);
                    }}
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Hóa đơn */}
      <div
        className={`h-full w-full lg:w-1/3 bg-white flex flex-col border-l-2 border-gray-300 z-10 transition-transform duration-300 ease-in-out
        ${
          showMobileBill
            ? "translate-x-0 fixed top-0 right-0"
            : "hidden lg:flex"
        }`}
      >
        <h2 className="h-12 w-full text-center text-lg font-bold py-2 shadow-md">
          HÓA ĐƠN
        </h2>
        <ul
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cart.map((product, index) => {
            const combo = findComboForProduct(product.id);
            const suggestedItems = combo
              ? getOtherProductInCombo(combo, product.id)
              : [];

            let discountedPrice = product.price;
            if (combo) {
              const comboSatisfied = combo.products.every((cItem) => {
                const cartItem = cart.find((ci) => ci.id === cItem.id);
                return cartItem && cartItem.quantity >= cItem.quantity;
              });

              if (comboSatisfied) {
                const comboItem = combo.products.find(
                  (item) => item.id === product.id
                );
                if (comboItem) {
                  discountedPrice = comboItem.price;
                }
              }
            }

            const suggestedProducts = suggestedItems
              .filter(
                (item: { id: string; price: number; quantity: number }) =>
                  !cart.find((cartItem) => cartItem.id === item.id)
              )
              .map((item: { id: string; price: number; quantity: number }) => {
                const fullProduct = products.find((p) => p.id === item.id);
                return fullProduct
                  ? {
                      ...fullProduct,
                      price: item.price,
                      quantity: item.quantity,
                    }
                  : null;
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
                    <div className="pl-2">Mua thêm tiết kiệm hơn</div>
                    <ul className="pl-4 mt-1 text-sm list-disc list-inside">
                      {suggestedProducts.map((sp) => (
                        <li
                          key={sp.id}
                          className="flex items-center gap-2 py-1"
                        >
                          {/* Tên sản phẩm */}
                          <div className="w-1/2 text-sm line-clamp-1 text-ellipsis">
                            {sp.name}
                          </div>

                          {/* Giá gốc (nếu có) */}
                          <div className="w-1/6 text-sm text-gray-500 line-through">
                            {products
                              .find((p: Product) => p.id === sp.id)
                              ?.price.toLocaleString()}
                            ₫
                          </div>

                          {/* Giá combo */}
                          <div className="w-1/6 text-sm text-red-600 font-semibold">
                            {sp.price.toLocaleString()}₫
                          </div>

                          {/* Nút thêm */}
                          <button
                            onClick={() => {
                              const foundProduct = products.find(
                                (p: Product) => p.id === sp.id
                              );
                              if (foundProduct) {
                                addToCart(foundProduct);
                              }
                            }}
                            className="text-blue-700 cursor-pointer w-1/6 hover:underline text-sm"
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

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && cart.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Gợi ý cho bạn</h3>
            <div className="space-y-2">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1 bg-blue-500 cursor-pointer text-white rounded hover:bg-blue-600"
                  >
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white w-full p-4 border-t-2 border-gray-300">
          <div className="font-bold w-full text-right">
            Tổng tiền: {calculateTotal().toLocaleString("vi-VN")}đ
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button
              className={`w-full cursor-pointer ${cart.length === 0 ? 'bg-gray-400' : 'bg-blue-500'} text-white py-2 px-4 rounded`}
              disabled={cart.length === 0}
              onClick={() => {
                setShowPopup(true);
                setShowMobileBill(false);
              }}
            >
              Thanh toán
            </button>

            <button
              className="w-full cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded lg:hidden"
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
          className="fixed cursor-pointer inset-0 bg-black opacity-60 backdrop-blur-sm z-10"
          onClick={() => setShowPopup(false)}
        ></div>
      )}
      {showPopup && cart.length != 0 && (
        <PopupThanhToan
          total={calculateTotal()}
          cart={cart}
          onClose={() => setShowPopup(false)}
          setCart={setCart}
          customers={customers}
          employees={employees}
          setCustomers={setCustomers}
        />
      )}
    </div>
  );
}

export default BanHang;
