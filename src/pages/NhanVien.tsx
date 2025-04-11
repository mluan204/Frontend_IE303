import { Helmet } from "react-helmet";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport } from "@fortawesome/free-solid-svg-icons";
import EmployeeDetail from "../components/EmployeeDetail"; 

// Kiểu dữ liệu cho nhân viên
interface Employee {
  id: string;
  name: string;
  address: string;
  birthday: string;
  create_at: string;
  email: string;
  gender: string;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
}

// Danh sách nhân viên mẫu
const employees: Employee[] = Array.from({ length: 30 }, (_, i) => ({
  id: `NV${String(i + 1).padStart(6, "0")}`,
  name: `Nhân viên ${i + 1}`,
  address: `Địa chỉ ${i + 1}`,
  birthday: `199${i % 10}-01-01`,
  create_at: `2023-0${(i % 9) + 1}-15`,
  email: `nhanvien${i + 1}@gmail.com`,
  gender: i % 2 === 0 ? "Nam" : "Nữ",
  image: "https://static.wikia.nocookie.net/menes-suecos/images/b/bc/Revendedor1.jpg/revision/latest?cb=20210323154547&path-prefix=pt-br",
  phone_number: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
  position: i % 2 === 0 ? "Quản lý" : "Nhân viên",
  salary: 8000000 + i * 250000,
}));

const ITEMS_PER_PAGE = 10;

function NhanVien() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const displayedEmployees = employees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Modal chi tiết nhân viên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleOpenModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#E8EAED]">
      <Helmet>
        <title>Nhân viên</title>
      </Helmet>

      <div className="p-6">
        {/* Tiêu đề và thanh tìm kiếm */}
        <div className="flex items-center mb-4">
          <h1 className="text-xl font-bold w-1/5">Nhân viên</h1>
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
                onChange={(e) => setSearch(e.target.value)}
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

        {/* Bảng hiển thị danh sách nhân viên */}
        <div className="flex">
          <div className="w-full">
            <div className="overflow-y-auto h-100 scrollbar-hide">
              <table className="w-full border-collapse">
                <thead className="bg-[#E6F1FE] sticky top-0">
                  <tr className="border-b border-[#A6A9AC]">
                    
                    <th className="p-2 text-left">Mã NV</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2 text-left">Chức vụ</th>
                    <th className="p-2 text-left">SĐT</th>
                    <th className="p-2 text-left">Lương</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEmployees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-100 border-b border-[#A6A9AC]"
                      } hover:bg-[#E6F1FE]`}
                      onClick={() => handleOpenModal(employee)}
                    >
                      
                      <td className="p-2">{employee.id}</td>
                      <td className="p-2">{employee.name}</td>
                      <td className="p-2">{employee.position}</td>
                      <td className="p-2">{employee.phone_number}</td>
                      <td className="p-2">{employee.salary.toLocaleString("vi-VN")}₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Modal chi tiết nhân viên (nếu cần) */}
              {selectedEmployee && (
                <EmployeeDetail
                  employee={selectedEmployee}
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

export default NhanVien;
