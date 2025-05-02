import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport } from "@fortawesome/free-solid-svg-icons";
import ProductDetail from "../components/ProductDetail";
import { useEffect } from "react";
import { fetchProduct } from "../service/productApi";
import { fetchAllProduct } from "../service/productApi";
import { CommonUtils } from "../utils/CommonUtils";

// Định nghĩa kiểu dữ liệu cho product
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
// Tạo mảng products với kiểu Product[]
// const products: Product[] = Array.from({ length: 30 }, (_, i) => ({
//   id: `SP${String(i + 1).padStart(6, "0")}`,
//   name: `Sản phẩm ${i + 1}`,
//   price: (100000 + i * 5000).toLocaleString("vi-VN"),
//   cost: (95000 + i * 5000).toLocaleString("vi-VN"),
//   category: ["Thực phẩm", "Đồ gia dụng", "Thời trang", "Thiết bị điện"][i % 4],
//   stock: 300 - i * 10,
//   image: "https://static.wikia.nocookie.net/menes-suecos/images/b/bc/Revendedor1.jpg/revision/latest?cb=20210323154547&path-prefix=pt-br",
//   supplier: `Nhà cung cấp ${i % 5 + 1}`,
//   expiry: `2025-${(i % 12 + 1).toString().padStart(2, "0")}-15`,
//   notes: `Ghi chú cho sản phẩm ${i + 1}`
// }));

const ITEMS_PER_PAGE = 10; // Số sản phẩm hiển thị trên mỗi trang


function HangHoa() {
  // Cơ chế phân trang
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0); 
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);


  // MODAL CHI TIẾT SẢN PHẨM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  // Mở modal và truyền thông tin sản phẩm
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };
  const getProducts = async () => {
    try {
      const res = await fetchProduct(currentPage - 1, ITEMS_PER_PAGE, search);
      if (res && res.content) {
        setProducts(res.content);         // danh sách sản phẩm
        setTotalItems(res.totalElements); // tổng số sản phẩm
      }
      console.log(res);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
    }
  };
  useEffect(() => {  
    getProducts();
  }, [currentPage, search]);
  
  const handleOnClickExport = async () => {
      try {
        const res = await fetchAllProduct();
        if (res && res.length > 0) {
          await CommonUtils.exportExcel(res, "Danh sách sản phẩm", "Danh sách sản phẩm");
        }
      } catch (error) {
        console.error("Error exporting category list:", error);
        alert("Đã xảy ra lỗi khi xuất file!");
      }
    };
  return (
    
    <div className="bg-[#E8EAED]">
      <Helmet>
        <title>Hàng hóa</title>
      </Helmet>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center pb-15">
          <h1 className="text-xl font-bold w-1/5">Hàng hóa</h1>
          <div className="flex items-center justify-between w-4/5">
          {/* Thanh tìm kiếm */}
            <div className="relative w-2/5 ml-5">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FontAwesomeIcon icon={faSearch}></FontAwesomeIcon></span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Các nút chức năng */}
            <div className="space-x-5">
              <button className="bg-green-500 text-white px-4 py-1 rounded"><FontAwesomeIcon icon={faAdd} className="mr-2"/>Nhập hàng</button>
              <button className="bg-green-500 text-white px-4 py-1 rounded"><FontAwesomeIcon icon={faAdd} className="mr-2"/>Thêm mới</button>
              <button className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={handleOnClickExport}
              ><FontAwesomeIcon icon={faFileExport} className="mr-2"/> Xuất file</button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/5 p-4 h-100 overflow-y-auto items-center justify-between bg-white shadow rounded-lg">
            <h2 className="font-bold mb-2">Nhóm hàng</h2>
            <input
              type="text"
              placeholder="Tìm nhóm hàng"
              className="border p-2 w-full mb-2 rounded"
            />
            <ul>
              <li className="p-2 cursor-pointer hover:bg-gray-200">Thuốc lá</li>
              <li className="p-2 cursor-pointer hover:bg-gray-200">Sữa</li>
              <li className="p-2 cursor-pointer hover:bg-gray-200">Nước ngọt</li>
              <li className="p-2 cursor-pointer hover:bg-gray-200">Kẹo bánh</li>
            </ul>
          </div>

          {/* Bảng sản phẩm */}
          {/* LABEL */}
          <div className="w-4/5 ml-5">
            <div className="overflow-y-auto h-100 scrollbar-hide">
              <table className="w-full border-collapse ">
                <thead className="bg-[#E6F1FE] sticky top-0">
                  <tr className="border-b border-[#A6A9AC]">
                    <th className="p-2 text-left w-[100px]"></th>
                    <th className="p-2 text-left">Mã sản phẩm</th>
                    <th className="p-2 text-left">Tên sản phẩm</th>
                    <th className="p-2 text-left">Giá bán</th>
                    <th className="p-2 text-left">Giá vốn</th>
                    <th className="p-2 text-left">Tồn kho</th>
                  </tr>
                </thead>
                {/* SẢN PHẨM */}
                <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100 border-b border-[#A6A9AC]"} hover:bg-[#E6F1FE]`}
                        onClick={() => handleOpenModal(product)}
                      >
                        <td className="p-2 w-[100px]">
                          <img src={product.image} alt={product.name} className="w-12 h-12" />
                        </td>
                        <td className="p-2">{product.id}</td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.price}</td>
                        <td className="p-2">{product.inputPrice }</td>
                        <td className="p-2">{product.quantityAvailable }</td>
                      </tr>
                    ))}
                  </tbody>

              </table>

              {/* Pop-up chi tiết sản phẩm */}
              {selectedProduct && (
                <ProductDetail
                  product={selectedProduct}
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                />
              )}

            </div>
            {/* Phân trang */}
            <div className="flex items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-2 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  ◀
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-2  disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
            </div>
          </div>       
          
        </div>
      </div>
    </div>
  );
}

export default HangHoa;