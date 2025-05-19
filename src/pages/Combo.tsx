import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import ComboDetail from "../components/ComboDetail";
import AddComboModal from "../components/AddComboModal";
import { getAllCombo } from "../service/comboApi";
import { getAllProduct } from "../service/productApi";
import { formatDate } from "../utils/FormatDate";

// Định nghĩa kiểu dữ liệu cho Combo
interface ComboProduct {
  productId: number;
  price: number;
  quantity: number;
}

interface Combo {
  id: number;
  createdAt: string;
  timeEnd: string;
  comboProducts: ComboProduct[];
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

interface ComboResponse {
  content: Combo[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  suppliers: string | null;
  quantityAvailable: number;
  dateExpired: string | null;
  salePrice: number | null;
  inputPrice: number;
  price: number;
  categoryId: number;
  categoryName: string;
}

const ITEMS_PER_PAGE = 10; // Số sản phẩm hiển thị trên mỗi trang

function Combo() {
  // Cơ chế phân trang
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const categories = [
    { label: "Tất cả", value: "all" },
    { label: "Còn thời hạn", value: "valid" },
    { label: "Hết thời hạn", value: "expired" },
  ];
  const [selectedTime, setSelectedTime] = useState("all");

  // MODAL CHI TIẾT SẢN PHẨM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  // Mở modal và truyền thông tin combo
  const handleOpenModal = (combo: Combo) => {
    setSelectedCombo(combo);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedCombo(null);
    setIsModalOpen(false);
  };

  //Modal thêm combo mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response: ComboResponse = await getAllCombo(
          currentPage - 1,
          ITEMS_PER_PAGE
        );
        setCombos(response.content);
        setTotalItems(response.totalElements);
      } catch (error) {
        console.error("Error fetching combos:", error);
      }
    };
    fetchCombos();
  }, [currentPage, isAddModalOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProduct();
        setProducts(response);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const renderCategoryList = () => (
    <ul className="max-h-[300px] overflow-y-auto">
      {categories.map(({ label, value }) => (
        <li key={value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={value}
            name="timeFilter"
            value={value}
            className="cursor-pointer"
            checked={selectedTime === value}
            onChange={() => setSelectedTime(value)}
          />
          <label htmlFor={value} className="cursor-pointer">
            {label}
          </label>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Combo sản phẩm</title>
      </Helmet>

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">
              Combo sản phẩm
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            {/* Tìm kiếm */}
            <div className="relative w-full sm:w-1/2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-2 pl-10 rounded w-full bg-white focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Nút */}
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Xuất file
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar  */}
        <div className="mb-4 md:hidden bg-white shadow rounded-lg p-4">
          <h2 className="font-bold mb-2">Trạng thái</h2>
          {renderCategoryList()}

          {/* Sidebar mobile */}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar desktop */}
          <div className="hidden md:block w-full md:w-1/4 bg-white shadow rounded-lg p-4">
            <h2 className="font-bold mb-2">Trạng thái</h2>
            {renderCategoryList()}
          </div>

          {/* Table content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-max w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã combo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày hết hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map((combo) => (
                      <tr key={combo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {combo.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(combo.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(combo.timeEnd)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {combo.comboProducts.length}
                        </td>
                        <td className="px-6 py-4 space-x-4">
                          <button
                            onClick={() => handleOpenModal(combo)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />{" "}
                            Chi tiết
                          </button>
                          <button
                            onClick={() => alert(`Xóa combo ${combo.id}`)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />{" "}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, combos.length)}
                    </span>{" "}
                    của <span className="font-medium">{combos.length}</span> kết
                    quả
                  </p>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
            {selectedCombo && (
              <ComboDetail
                combo={selectedCombo}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal thêm sản phẩm */}
      {isAddModalOpen && (
        <AddComboModal isOpen={true} onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

export default Combo;
