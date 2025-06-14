import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
  faTrash,
  faEye,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import ComboDetail from "../components/ComboDetail";
import AddComboModal from "../components/AddComboModal";
import {
  getAllCombo,
  getAllComboList,
  deleteCombo,
  updateCombo,
} from "../service/comboApi";
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

interface ComboList {
  id: number;
  comboProducts: number[];
}

const ITEMS_PER_PAGE = 10; // Số sản phẩm hiển thị trên mỗi trang

function Combo() {
  // Cơ chế phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [comboList, setComboList] = useState<ComboList[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = [
    { label: "Tất cả", value: "all" },
    { label: "Còn thời hạn", value: "valid" },
    { label: "Hết thời hạn", value: "expired" },
  ];
  const [selectedTime, setSelectedTime] = useState("all");

  // Convert selectedTime to isActive parameter
  const getIsActiveParam = () => {
    switch (selectedTime) {
      case "valid":
        return true;
      case "expired":
        return false;
      default:
        return undefined;
    }
  };

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
        setIsTableLoading(true);
        setError(null);
        const response: ComboResponse = await getAllCombo(
          currentPage - 1,
          ITEMS_PER_PAGE,
          getIsActiveParam()
        );
        const responeComboList: ComboList[] = await getAllComboList();
        setComboList(responeComboList);
        setCombos(response.content);
        setTotalItems(response.totalElements);
      } catch (error) {
        console.error("Error fetching combos:", error);
        setError("Không thể tải danh sách combo. Vui lòng thử lại.");
      } finally {
        setIsTableLoading(false);
        setIsLoading(false);
      }
    };
    fetchCombos();
  }, [currentPage, isAddModalOpen, selectedTime]);

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
            disabled={isTableLoading}
          />
          <label htmlFor={value} className="cursor-pointer">
            {label}
          </label>
        </li>
      ))}
    </ul>
  );

  //PHÂN TRANG
  const getPaginationRange = (
    current: number,
    total: number
  ): (number | string)[] => {
    const delta = 1;
    const range: (number | string)[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta + 1);

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= left && i < right)) {
        range.push(i);
      } else if (
        (i === left - 1 && i !== 2) ||
        (i === right && i !== total - 1)
      ) {
        range.push("...");
      }
    }

    return [...new Set(range)];
  };

  const handleDeleteClick = (comboId: number) => {
    setComboToDelete(comboId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!comboToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteCombo(comboToDelete);
      setIsDeleteModalOpen(false);
      setComboToDelete(null);
      // Refresh the combos list
      const response: ComboResponse = await getAllCombo(
        currentPage - 1,
        ITEMS_PER_PAGE,
        getIsActiveParam()
      );
      setCombos(response.content);
      setTotalItems(response.totalElements);
    } catch (err) {
      console.error("Delete Error:", err);
      setError("Không thể xóa combo. Vui lòng thử lại sau.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setComboToDelete(null);
  };

  //LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Nút */}
            <div className="flex self-end gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar  */}
        <div className="mb-4 md:hidden bg-white shadow rounded-lg p-4">
          <h2 className="font-bold mb-2">Trạng thái</h2>
          {renderCategoryList()}
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
              {isTableLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-2xl text-blue-500 animate-spin mb-2"
                    />
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : (
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
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />{" "}
                              Chi tiết
                            </button>
                            <button
                              onClick={() => handleDeleteClick(combo.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-1"
                              />{" "}
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
                    {getPaginationRange(currentPage, totalPages).map(
                      (page, index) =>
                        typeof page === "number" ? (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                              currentPage === page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        )
                    )}
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
        <AddComboModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          products={products}
          comboList={comboList}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa combo
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa combo #{comboToDelete}? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {deleteLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  "Xác nhận xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Combo;
