import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import EmployeeDetail from "../components/EmployeeDetail"; 
import AddEmployeeModal from "../components/AddEmployeeModal";
import { getAllEmployees } from "../service/employeeApi";

// Kiểu dữ liệu cho nhân viên
interface Employee {
  id: string;
  name: string;
  address: string;
  birthday: string;
  created_at: string;
  email: string;
  gender: string;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
}

// Danh sách nhân viên mẫu
const mockEmployees: Employee[] = Array.from({ length: 30 }, (_, i) => ({
  id: `NV${String(i + 1).padStart(6, "0")}`,
  name: `Nhân viên ${i + 1}`,
  address: `Địa chỉ ${i + 1}`,
  birthday: `199${i % 10}-01-01`,
  created_at: `2023-0${(i % 9) + 1}-15`,
  email: `nhanvien${i + 1}@gmail.com`,
  gender: i % 2 === 0 ? "Nam" : "Nữ",
  image: "https://static.wikia.nocookie.net/menes-suecos/images/b/bc/Revendedor1.jpg",
  phone_number: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
  position: i % 2 === 0 ? "Quản lý" : "Nhân viên",
  salary: 8000000 + i * 250000,
}));
const ITEMS_PER_PAGE = 10;

function NhanVien() {
    // const [employees, setEmployees] = useState<Employee[]>([]);
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

    useEffect( () => {
      const fetchData = async () => {
        const result = await getAllEmployees();
        setEmployees(result);
        console.log(result);
      }
  
      fetchData();
    },[])

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

  const removeEmployee= (employeeId: string) => {
    setEmployees(prevE => prevE.filter(employee => employee.id !== employeeId));
  };
  // MODAL THÊM NHÂN VIÊN
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Nhân viên</title>
      </Helmet>
  
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center pb-13">
          <h1 className="text-xl font-bold w-1/5">Nhân viên</h1>
          <div className="flex items-center justify-between w-4/5">
            {/* Tìm kiếm */}
            <div className="relative w-2/5 ml-6">
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
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => setShowAddModal(true)}
              >
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
  
        {/* Bảng nhân viên */}
        <div className="flex">
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã NV</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lương</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.phone_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.salary.toLocaleString("vi-VN")}₫</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleOpenModal(employee)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => removeEmployee(employee.id)}
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
  
              {/* Phân trang */}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Trang sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{" "}
                    đến{" "}
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, employees.length)}</span>{" "}
                    của{" "}
                    <span className="font-medium">{employees.length}</span> kết quả
                  </p>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Trang sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
  
            {/* Modal chi tiết nhân viên */}
            {selectedEmployee && (
              <EmployeeDetail
                employee={selectedEmployee}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                removeEmployee={removeEmployee}
              />
            )}
          </div>
        </div>
      </div>
  
      {/* Modal thêm mới nhân viên */}
      <AddEmployeeModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

export default NhanVien;
