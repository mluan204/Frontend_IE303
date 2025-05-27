import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAdd, faFileExport, faTrash, faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import EmployeeDetail from "../components/EmployeeDetail";
import AddEmployeeModal from "../components/AddEmployeeModal";
import { deleteEmployeeById, getAllEmployees } from "../service/employeeApi";
import { CommonUtils } from "../utils/CommonUtils";
// Kiểu dữ liệu cho nhân viên
interface Employee {
  id: number;
  name: string;
  address: string;
  birthday: string;
  created_at: string;
  email: string;
  gender: boolean;
  image: string;
  phone_number: string;
  position: string;
  salary: number;
}

const ITEMS_PER_PAGE = 10;

function NhanVien() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getAllEmployees();
        setEmployees(result);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
        setError("Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const displayedEmployees = employees.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
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

  const removeEmployee = (employeeId: number) => {
    setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== employeeId));
  };
  // MODAL THÊM NHÂN VIÊN
  const [showAddModal, setShowAddModal] = useState(false);
  //PHÂN TRANG
  function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 1; // số trang kề trước và sau currentPage được hiển thị
  const range: (number | string)[] = [];

  if (totalPages <= 5) {
    // Nếu tổng số trang ít hơn hoặc bằng 5 thì hiển thị toàn bộ
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
  } else {
    // Luôn hiển thị trang đầu tiên
    range.push(1);

    if (currentPage > 3) {
      range.push("...");
    }

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (currentPage < totalPages - 2) {
      range.push("...");
    }

    // Luôn hiển thị trang cuối
    range.push(totalPages);
  }

  return range;
}

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
  const handleOnClickExport = async () => {
    try {
      const res = await getAllEmployees();
      console.log(res);
      const mappedEmployees = employees.map((employee) => ({
        "Mã nhân viên": employee.id.toString(),
        "Họ và tên": employee.name,
        "Chức vụ": employee.position,
        "Địa chỉ": employee.address,
        "Ngày sinh": new Date(employee.birthday).toLocaleDateString("vi-VN"),
        "Email": employee.email,
        "Giới tính": employee.gender ? "Nam" : "Nữ",
        "Số điện thoại": employee.phone_number,
        "Lương": employee.salary,
      }));

      if (res && res.length > 0) {
        await CommonUtils.exportExcel(mappedEmployees, "Danh sách nhân viên", "Danh sách nhân viên");
        console.log(res);
      }
    } catch (error) {
      console.error("Error exporting category list:", error);
      alert("Đã xảy ra lỗi khi xuất file!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Nhân viên</title>
      </Helmet>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">Nhân viên</h1>
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

            {/* Nút chức năng */}
            <div className="space-x-5">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={() => setShowAddModal(true)}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={handleOnClickExport}
              >
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">{employee.name}</td>
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
                            onClick={() => {
                              deleteEmployeeById(employee.id);
                              removeEmployee(employee.id)
                            }}
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
                    <span className="font-medium">{currentPage * ITEMS_PER_PAGE + 1}</span>{" "}
                    đến{" "}
                    <span className="font-medium">{Math.min((currentPage + 1) * ITEMS_PER_PAGE, employees.length)}</span>{" "}
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
                    {getPaginationRange(currentPage + 1, totalPages).map((page, index) =>
                      typeof page === "number" ? (
                        <button
                          key={index}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} // vì page hiển thị bắt đầu từ 1
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                            currentPage === page - 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={`ellipsis-${index}`} className="...">...</span>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
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
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal thêm mới nhân viên */}
      <AddEmployeeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onEmployeeAdded={(newEmployee) => {
            setEmployees((prev) => [...prev, newEmployee]);
          }} 
      />
    </div>
  );
}

export default NhanVien;
