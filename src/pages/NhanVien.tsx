import { Helmet } from "react-helmet";
import { useEffect, useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAdd,
  faFileExport,
  faTrash,
  faEye,
  faSpinner,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import EmployeeDetail from "../components/EmployeeDetail";
import AddEmployeeModal from "../components/AddEmployeeModal";
import { deleteEmployeeById, getAllEmployees } from "../service/employeeApi";
import { CommonUtils } from "../utils/CommonUtils";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
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

type SortField = 'id' | 'name' | 'position' | 'salary';
type SortDirection = 'asc' | 'desc' | null;

// Custom hook for sorting logic
const useSorting = (employees: Employee[]) => {
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({ field: null, direction: null });

  const sortedEmployees = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return employees;
    }

    return [...employees].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [employees, sortConfig]);

  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        // Same field: cycle through asc -> desc -> null
        if (prev.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { field: null, direction: null };
        } else {
          return { field, direction: 'asc' };
        }
      } else {
        // Different field: start with asc
        return { field, direction: 'asc' };
      }
    });
  }, []);

  const getSortIcon = useCallback((field: SortField) => {
    if (sortConfig.field !== field) {
      return faSort;
    }
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  }, [sortConfig]);

  return {
    sortedEmployees,
    handleSort,
    getSortIcon,
    sortConfig
  };
};

// Custom hook for pagination logic
const usePagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getPaginationRange = useCallback((current: number, total: number): (number | string)[] => {
    const delta = 1;
    const range: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      if (current > 3) range.push("...");
      
      const start = Math.max(2, current - delta);
      const end = Math.min(total - 1, current + delta);
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      if (current < total - 2) range.push("...");
      range.push(total);
    }
    return range;
  }, []);

  const pagination = useMemo(() => 
    getPaginationRange(currentPage + 1, totalPages), 
    [currentPage, totalPages, getPaginationRange]
  );

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    pagination
  };
};

// Custom hook for employee management
const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
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
  }, []);

  const removeEmployee = useCallback((employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  }, []);

  const addEmployee = useCallback((newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    isLoading,
    error,
    removeEmployee,
    addEmployee,
    refetch: fetchEmployees
  };
};

// Custom hook for search and filtering
const useEmployeeSearch = (employees: Employee[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEmployees
  };
};

// Custom hook for modal management
const useModal = () => {
  const [modals, setModals] = useState({
    employeeDetail: { isOpen: false, employee: null as Employee | null },
    addEmployee: { isOpen: false }
  });

  const openEmployeeDetail = useCallback((employee: Employee) => {
    setModals(prev => ({
      ...prev,
      employeeDetail: { isOpen: true, employee }
    }));
  }, []);

  const closeEmployeeDetail = useCallback(() => {
    setModals(prev => ({
      ...prev,
      employeeDetail: { isOpen: false, employee: null }
    }));
  }, []);

  const openAddEmployee = useCallback(() => {
    setModals(prev => ({
      ...prev,
      addEmployee: { isOpen: true }
    }));
  }, []);

  const closeAddEmployee = useCallback(() => {
    setModals(prev => ({
      ...prev,
      addEmployee: { isOpen: false }
    }));
  }, []);

  return {
    modals,
    openEmployeeDetail,
    closeEmployeeDetail,
    openAddEmployee,
    closeAddEmployee
  };
};

function NhanVien() {
  const { employees, isLoading, error, removeEmployee, addEmployee, refetch } = useEmployees();
  const { searchTerm, setSearchTerm, filteredEmployees } = useEmployeeSearch(employees);
  const { sortedEmployees, handleSort, getSortIcon, sortConfig } = useSorting(filteredEmployees);
  const { currentPage, setCurrentPage, totalPages, pagination } = usePagination(
    sortedEmployees.length, 
    ITEMS_PER_PAGE
  );
  const { modals, openEmployeeDetail, closeEmployeeDetail, openAddEmployee, closeAddEmployee } = useModal();

  // Reset to first page when search changes or sort changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortConfig, setCurrentPage]);

  // Calculate displayed employees
  const displayedEmployees = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedEmployees.slice(startIndex, endIndex);
  }, [sortedEmployees, currentPage]);

  // Handle employee deletion
  const handleDeleteEmployee = useCallback(async (employeeId: number) => {
    try {
      await deleteEmployeeById(employeeId);
      removeEmployee(employeeId);
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Có lỗi xảy ra khi xóa nhân viên!");
    }
  }, [removeEmployee]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      const mappedEmployees = employees.map(employee => ({
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

      await CommonUtils.exportExcel(
        mappedEmployees,
        "Danh sách nhân viên",
        "Danh sách nhân viên"
      );
    } catch (error) {
      console.error("Error exporting employee list:", error);
      alert("Đã xảy ra lỗi khi xuất file!");
    }
  }, [employees]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const handleDeleteClick = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!employeeToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteEmployeeById(employeeToDelete.id);
      removeEmployee(employeeToDelete.id);
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Có lỗi xảy ra khi xóa nhân viên!");
    } finally {
      setDeleteLoading(false);
    }
  }, [employeeToDelete, removeEmployee]);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refetch}
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
        <title>Nhân viên</title>
      </Helmet>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl font-bold whitespace-nowrap">Nhân viên</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            {/* Search */}
            <div className="relative w-full sm:w-1/2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border p-2 pl-10 rounded w-full bg-white focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="space-x-5">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={openAddEmployee}
              >
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Thêm mới
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer"
                onClick={handleExport}
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Xuất file
              </button>
            </div>
          </div>
        </div>

        {/* Employee table */}
        <div className="flex">
          {displayedEmployees.length === 0 ? (
            <div className="w-full text-center py-10">
              <p className="text-gray-500">
                {searchTerm ? "Không tìm thấy nhân viên phù hợp." : "Không có nhân viên nào."}
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>Mã NV</span>
                            <button
                              onClick={() => handleSort('id')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={getSortIcon('id')} />
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>Tên</span>
                            <button
                              onClick={() => handleSort('name')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={getSortIcon('name')} />
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>Chức vụ</span>
                            <button
                              onClick={() => handleSort('position')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={getSortIcon('position')} />
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SĐT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>Lương</span>
                            <button
                              onClick={() => handleSort('salary')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={getSortIcon('salary')} />
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
                            {employee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.salary.toLocaleString("vi-VN")}₫
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                            <button
                              onClick={() => openEmployeeDetail(employee)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />
                              Chi tiết
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee)}
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
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1}
                      className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {currentPage * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * ITEMS_PER_PAGE, sortedEmployees.length)}
                      </span>{" "}
                      của <span className="font-medium">{sortedEmployees.length}</span> kết quả
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trang trước
                      </button>
                      {pagination.map((page, index) =>
                        typeof page === "number" ? (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(page - 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                              currentPage === page - 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                            {page}
                          </span>
                        )
                      )}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage === totalPages - 1}
                        className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trang sau
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Employee Detail Modal */}
              {modals.employeeDetail.employee && (
                <EmployeeDetail
                  employee={modals.employeeDetail.employee}
                  isOpen={modals.employeeDetail.isOpen}
                  onClose={closeEmployeeDetail}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={modals.addEmployee.isOpen}
        onClose={closeAddEmployee}
        onEmployeeAdded={addEmployee}
      />

      {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Xác nhận xóa nhân viên
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Bạn có chắc chắn muốn xóa nhân viên{" "}
        <strong>{employeeToDelete?.name}</strong> (Mã:{" "}
        <strong>{employeeToDelete?.id}</strong>)? Hành động này không thể hoàn tác.
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
            "Xác nhận"
          )}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default NhanVien;
