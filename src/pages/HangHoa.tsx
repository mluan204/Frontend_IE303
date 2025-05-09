import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport, faTrash, faEye} from "@fortawesome/free-solid-svg-icons";
import ProductDetail from "../components/ProductDetail"; 
import AddProductModal from "../components/AddProductModal";
import { useEffect } from "react";
import { fetchProduct } from "../service/mainApi";
import { fetchAllProduct } from "../service/mainApi";
import { CommonUtils } from "../utils/CommonUtils";
import { fetchAllCategory } from "../service/mainApi";

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
interface Category {
  id: number,   
  name: string,
}

const ITEMS_PER_PAGE = 10; // Số sản phẩm hiển thị trên mỗi trang

function HangHoa() {
  // Cơ chế phân trang
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0); 
  const [categories, setCategories] = useState<Category[]>([]);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const [searchCategory, setSearchCategory] = useState("");


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

  //Modal thêm sản phẩm mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
  const getCategory = async () => {
    try {
      const res = await fetchAllCategory();
      console.log(res);
      if (res ) {
        setCategories(res.data);
      }
      console.log(res);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
    }
  };
  useEffect(() => {
    getCategory();
    getProducts();
  }, []);
  useEffect(() => {  
    getProducts();
    getCategory();
  }, [currentPage, search]);
  
  const handleOnClickExport = async () => {
    const res = await fetchAllProduct() as Product[];
    if (res && res.length > 0) {
      const mappedData = res.map((item: Product) => ({
        "Mã sản phẩm": item.id,
        "Tên sản phẩm": item.name,
        "Mô tả": item.description,
        "Danh mục": item.categoryName,
        "Giá nhập": item.inputPrice,
        "Giá bán": item.price,
        "Giá khuyến mãi": item.salePrice,
        "Tồn kho": item.quantityAvailable,
        "Hạn sử dụng": item.dateExpired,
        "Nhà cung cấp": item.suppliers,
        "Link ảnh sản phẩm": item.image
      }));
      await CommonUtils.exportExcel(mappedData, "Danh sách sản phẩm", "Danh sách sản phẩm");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Hàng hóa</title>
      </Helmet>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center pb-13">
          <h1 className="text-xl font-bold w-1/5">Hàng hóa</h1>
          <div className="flex items-center justify-between w-4/5">
            {/* Thanh tìm kiếm */}
            <div className="relative w-2/5 ml-6">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white focus:outline-none "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Các nút chức năng */}
            <div className="space-x-5">
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={handleOnClickExport}
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" /> Xuất file
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/5 p-4 h-full bg-white shadow rounded-lg">
            <h2 className="font-bold mb-2">Nhóm hàng</h2>
            <input
              type="text"
              placeholder="Tìm nhóm hàng"
              value={searchCategory} // Liên kết với state
              onChange={(e) => setSearchCategory(e.target.value)} // Cập nhật state khi nhập
              className="border px-2 py-1 focus:outline-none w-full mb-2 rounded"
            />
            <ul className="list-none overflow-y-auto scrollbar-hide max-h-[300px]">
              {categories
                .filter((category) =>
                  category.name.toLowerCase().includes(searchCategory.toLowerCase()) // Lọc danh sách
                )
                .map((category) => (
                  <li
                    key={category.id}
                    className="p-2 my-1 cursor-pointer hover:bg-gray-200 hover:rounded-sm"
                  >
                    {category.name}
                  </li>
                ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="w-4/5 ml-5">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá vốn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                {/* SẢN PHẨM */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.inputPrice }</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantityAvailable }</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => alert(`Xóa sản phẩm ${product.id}`)} // Thay bằng logic xóa thật nếu cần
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

              </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Trang trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Trang sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, products.length)}
                    </span>{" "}
                    của{" "}
                    <span className="font-medium">{products.length}</span> kết quả
                  </p>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Trang trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                          currentPage === index + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Trang sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Modal chi tiết sản phẩm */}
            {selectedProduct && (
              <ProductDetail
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal thêm sản phẩm */}
      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newProduct) => {
            products.unshift(newProduct);
          }}
        />
      )}
    </div>
  );
}

export default HangHoa;