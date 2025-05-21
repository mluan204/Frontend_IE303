import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faTrash,
  faSave,
  faRobot,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { createCombo } from "../service/comboApi";
import { generateComboSuggestion } from "./GeminiService";
import { getProductQuantity } from "../service/billApi";

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

interface ComboProduct {
  productId: number;
  price: number;
  quantity: number;
}

interface ComboList {
  id: number;
  comboProducts: number[];
}

interface CreateComboRequest {
  timeEnd: string;
  comboProducts: ComboProduct[];
}

interface AddComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboList: ComboList[];
  products: Product[];
}

interface ProductSales {
  productId: number;
  totalQuantity: number;
}

export default function AddComboModal({
  isOpen,
  onClose,
  comboList,
  products,
}: AddComboModalProps) {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<ComboProduct[]>([]);
  // const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [salesData, setSalesData] = useState<ProductSales[]>([]);
  const [comboInfo, setComboInfo] = useState<{
    timeEnd: string;
    comboProducts: ComboProduct[];
  }>({
    timeEnd: "",
    comboProducts: [],
  });

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const data = await getProductQuantity();
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales data:", error);
      }
    };
    loadSalesData();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          !selectedItems.some((sp) => sp.productId === p.id)
      ),
    [search, products, selectedItems]
  );

  const handleAddProduct = (product: Product) => {
    if (!selectedItems.find((p) => p.productId === product.id)) {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedItems(selectedItems.filter((p) => p.productId !== productId));
  };

  const handleChange = (
    productId: number,
    field: keyof ComboProduct,
    value: number
  ) => {
    setSelectedItems((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSave = async () => {
    if (!comboInfo.timeEnd || selectedItems.length === 0) {
      alert("Vui lòng nhập ngày hết hạn và chọn ít nhất một sản phẩm.");
      return;
    }

    const comboRequest: CreateComboRequest = {
      timeEnd: comboInfo.timeEnd,
      comboProducts: selectedItems,
    };

    console.log(comboRequest);
    try {
      await createCombo(comboRequest);
      onClose();
    } catch (error) {
      console.error("Error creating combo:", error);
      alert("Có lỗi xảy ra khi tạo combo");
    }
  };

  const handleAIGenerate = async () => {
    try {
      setIsLoading(true);
      const suggestedCombo = await generateComboSuggestion(
        products,
        salesData,
        comboList
      );
      setComboInfo({
        timeEnd: suggestedCombo.timeEnd,
        comboProducts: [],
      });
      setSelectedItems(suggestedCombo.comboProducts);
    } catch (error) {
      console.error("Error generating combo:", error);
      alert("Có lỗi xảy ra khi tạo combo bằng AI");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-h-[90vh] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Tạo combo sản phẩm
          </h2>
          <div className="items-center flex cursor-pointer " onClick={onClose}>
            <FontAwesomeIcon
              icon={faClose}
              className="text-2xl text-gray-500 hover:text-gray-700"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x h-[calc(90vh-60px)]">
          {/* Product List */}
          <div className="w-full lg:w-2/3 flex flex-col lg:h-auto h-1/2 overflow-hidden">
            <div className="sticky top-0 z-10 bg-white p-4">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">STT</th>
                    <th className="px-4 py-2 text-left">Tên SP</th>
                    <th className="px-4 py-2 text-left">Số lượng</th>
                    <th className="px-4 py-2 text-left">Giá tiền</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((p, index) => (
                    <tr key={p.productId} className="hover:bg-gray-100">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 max-w-[160px] truncate">
                        {products.find((prod) => prod.id === p.productId)?.name}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={p.quantity}
                          min={1}
                          className="w-16 border rounded text-sm"
                          onChange={(e) =>
                            handleChange(
                              p.productId,
                              "quantity",
                              +e.target.value
                            )
                          }
                          disabled={isLoading}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={p.price}
                          className="w-24 border rounded px-2 text-sm text-right"
                          onChange={(e) =>
                            handleChange(p.productId, "price", +e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRemoveProduct(p.productId)}
                          disabled={isLoading}
                          className="cursor-pointer hover:text-red-700"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-red-500"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => !isLoading && handleAddProduct(p)}
                    >
                      <td
                        colSpan={6}
                        className="px-4 py-2 text-gray-700 truncate max-w-[160px]"
                      >
                        + {p.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Combo Info */}
          <div className="w-full lg:w-1/3 lg:h-auto h-1/2 p-6 overflow-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Ngày tạo
              </label>
              <input
                type="text"
                readOnly
                value={new Date().toISOString().slice(0, 10)}
                className="w-full border rounded px-3 py-1 cursor-pointer bg-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Ngày hết hạn
              </label>
              <input
                type="date"
                value={comboInfo.timeEnd}
                onChange={(e) =>
                  setComboInfo({ ...comboInfo, timeEnd: e.target.value })
                }
                className="w-full border cursor-pointer rounded px-3 py-1 text-sm appearance-none bg-white"
                disabled={isLoading}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                }}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded cursor-pointer hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Lưu
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <FontAwesomeIcon icon={faRobot} className="mr-2" />
                )}
                Tạo combo bằng AI
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-red-400 text-white text-sm rounded cursor-pointer hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
