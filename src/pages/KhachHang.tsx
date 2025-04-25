import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport } from "@fortawesome/free-solid-svg-icons";
import CustomerDetail from "../components/CustomerDetail"; 
import { getAllCustomer } from "../service/customerApi";

// Kiểu dữ liệu cho khách hàng
interface Customer {
  id: string;
  gender: string;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

// Danh sách khách hàng mẫu
// const customers: Customer[] = Array.from({ length: 30 }, (_, i) => ({
//   id: `KH${String(i + 1).padStart(6, "0")}`,
//   gender: i % 2 === 0 ? "Nam" : "Nữ",
//   name: `Khách hàng ${i + 1}`,
//   phone_number: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
//   score: Math.floor(Math.random() * 1000),
//   created_at: `2023-0${(i % 9) + 1}-15`,
// }));

const ITEMS_PER_PAGE = 10;

function KhachHang() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect( () => {
    const fetchData = async () => {
      const result = await getAllCustomer();
      setCustomers(result);
    }

    fetchData();
  },[])

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc khách hàng theo tìm kiếm (theo tên, mã, hoặc SĐT)
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.id.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone_number.includes(search)
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const displayedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Modal chi tiết khách hàng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleOpenModal = (customer: Customer) => {
    
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('vi-VN',
      {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      }
      );
  }
  
const removeCustomer = (customerId: string) => {
  setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
};
  

  return (
    <div className="bg-[#E8EAED]">
      <Helmet>
        <title>Khách hàng</title>
      </Helmet>

      <div className="p-6">
        {/* Tiêu đề và thanh tìm kiếm */}
        <div className="flex items-center pb-13">
          <h1 className="text-xl font-bold w-1/5">Khách hàng</h1>
          <div className="flex items-center justify-between w-4/5">
            {/* Thanh tìm kiếm */}
            <div className="relative w-2/5 ml-5">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-1 pl-10 rounded w-full bg-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset trang khi tìm kiếm mới
                }}
              />
            </div>

            {/* Nút chức năng */}
            <div className="space-x-5">
              <button className="bg-green-500 text-white px-4 py-1 rounded">
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button className="bg-green-500 text-white px-4 py-1 rounded">
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Xuất file
              </button>
            </div>
          </div>
        </div>

        {/* Bảng hiển thị danh sách khách hàng */}
        <div className="flex">
          <div className="w-full">
            <div className="overflow-y-auto h-100 scrollbar-hide">
              <table className="w-full border-collapse">
                <thead className="bg-[#E6F1FE] sticky top-0">
                  <tr className="border-b border-[#A6A9AC]">
                    <th className="p-2 text-left">Mã KH</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2 text-left">Giới tính</th>
                    <th className="p-2 text-left">SĐT</th>
                    <th className="p-2 text-left">Điểm tích lũy</th>
                    <th className="p-2 text-left">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className={`${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-100 border-b border-[#A6A9AC]"
                      } hover:bg-[#E6F1FE] cursor-pointer`}
                      onClick={() => handleOpenModal(customer)}
                    >
                      <td className="p-2">{customer.id}</td>
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.gender}</td>
                      <td className="p-2">{customer.phone_number}</td>
                      <td className="p-2">{customer.score}</td>
                      <td className="p-2">{formatDate(customer.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Modal chi tiết khách hàng (nếu cần) */}
              {selectedCustomer && (
                <CustomerDetail
                  customer={selectedCustomer}
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  removeCustomer={removeCustomer}
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
                className="p-2 disabled:opacity-50"
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

export default KhachHang;
