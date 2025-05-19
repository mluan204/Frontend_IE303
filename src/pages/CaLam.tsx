import React, { useState, useEffect } from "react";
import {
  getWeeklyShifts,
  Shift,
  getEmployeeById,
  Employee,
  getAllEmployees,
  createShift,
  deleteShift,
  updateShift,
} from "../service/employeeApi";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";

const CaLam: React.FC = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [createShiftDate, setCreateShiftDate] = useState<string>("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<{
    [key: number]: Employee;
  }>({});
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState<"DAI1" | "DAI2">(
    "DAI1"
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchShifts();
  }, [viewDate]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const formattedDate = format(viewDate, "yyyy-MM-dd'T'00:00:00");
      const data = await getWeeklyShifts(formattedDate);
      setShifts(data);

      const employeeIds = [...new Set(data.map((shift) => shift.employeeId))];
      const employeeDetailsPromises = employeeIds.map((id) =>
        getEmployeeById(id)
      );
      const employeeDetailsData = await Promise.all(employeeDetailsPromises);

      const employeeDetailsMap = employeeDetailsData.reduce((acc, employee) => {
        acc[employee.id] = employee;
        return acc;
      }, {} as { [key: number]: Employee });

      setEmployeeDetails(employeeDetailsMap);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const getShiftsForDay = (date: Date, shiftType: "DAI1" | "DAI2") => {
    return shifts.filter((shift) => {
      const shiftDate = parseISO(shift.date);
      return (
        format(shiftDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        shift.shiftType === shiftType
      );
    });
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleAddShift = (date: string, shiftType: "DAI1" | "DAI2") => {
    setCreateShiftDate(date);
    setSelectedShiftType(shiftType);
    setShowEmployeeList(true);
  };

  const handleSubmitShift = async () => {
    if (!selectedEmployee || !createShiftDate) return;

    try {
      await createShift({
        employeeId: selectedEmployee.id,
        date: format(new Date(createShiftDate), "yyyy-MM-dd'T'00:00:00"),
        shiftType: selectedShiftType,
      });

      // Close modal and reset states
      setShowEmployeeList(false);
      setSelectedEmployee(null);
      setCreateShiftDate("");

      // Refresh shifts
      fetchShifts();
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  const handleDeleteShift = async (shift: Shift, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering handleShiftClick
    if (
      window.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi ca làm?")
    ) {
      try {
        await deleteShift(shift.id);
        // Refresh shifts after deletion
        fetchShifts();
      } catch (error) {
        console.error("Error deleting shift:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý ca làm</h1>
        <input
          type="date"
          value={format(viewDate, "yyyy-MM-dd")}
          onChange={(e) => setViewDate(new Date(e.target.value))}
          className="border rounded p-2"
        />
      </div>

      {loading ? (
        <div className="min-h-screen bg-gray-50 flex  justify-center">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-blue-500 animate-spin mb-4"
            />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2">Ca</th>
                  {weekDays.map((day) => (
                    <th key={day.toString()} className="border p-2">
                      {format(day, "EEEE, dd/MM/yyyy", { locale: vi })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">
                    Ca sáng (6h-14h)
                  </td>
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDay(day, "DAI1");
                    return (
                      <td key={day.toString()} className="border p-2">
                        <div className="space-y-2">
                          {dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              className="bg-green-100 p-2 rounded cursor-pointer hover:bg-green-200 transition-colors relative group"
                              onClick={() => handleShiftClick(shift)}
                            >
                              {employeeDetails[shift.employeeId]?.name ||
                                `Nhân viên #${shift.employeeId}`}
                              <button
                                onClick={(e) => handleDeleteShift(shift, e)}
                                className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                                title="Xóa nhân viên khỏi ca làm"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              handleAddShift(format(day, "yyyy-MM-dd"), "DAI1")
                            }
                            className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">
                    Ca chiều (14h-22h)
                  </td>
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDay(day, "DAI2");
                    return (
                      <td key={day.toString()} className="border p-2">
                        <div className="space-y-2">
                          {dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              className="bg-blue-100 p-2 rounded cursor-pointer hover:bg-blue-200 transition-colors relative group"
                              onClick={() => handleShiftClick(shift)}
                            >
                              {employeeDetails[shift.employeeId]?.name ||
                                `Nhân viên #${shift.employeeId}`}
                              <button
                                onClick={(e) => handleDeleteShift(shift, e)}
                                className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                                title="Xóa nhân viên khỏi ca làm"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              handleAddShift(format(day, "yyyy-MM-dd"), "DAI2")
                            }
                            className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Employee Details */}
          {selectedShift && employeeDetails[selectedShift.employeeId] && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Thông tin nhân viên
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={employeeDetails[selectedShift.employeeId].image}
                    alt={employeeDetails[selectedShift.employeeId].name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-xl">
                      {employeeDetails[selectedShift.employeeId].name}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {employeeDetails[selectedShift.employeeId].position}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">
                      {employeeDetails[selectedShift.employeeId].email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số điện thoại:</span>
                    <p className="font-medium">
                      {employeeDetails[selectedShift.employeeId].phone_number}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa chỉ:</span>
                    <p className="font-medium">
                      {employeeDetails[selectedShift.employeeId].address}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày sinh:</span>
                    <p className="font-medium">
                      {format(
                        parseISO(
                          employeeDetails[selectedShift.employeeId].birthday
                        ),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600">Ca làm:</span>
                    <p className="font-medium text-lg">
                      {selectedShift.shiftType === "DAI1"
                        ? "Ca sáng (6h-14h)"
                        : "Ca chiều (14h-22h)"}
                    </p>
                    <p className="text-gray-600">
                      {format(
                        parseISO(selectedShift.date),
                        "EEEE, dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">Lương:</span>
                    <p className="font-medium text-lg">
                      {employeeDetails[
                        selectedShift.employeeId
                      ].salary.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee Selection Modal */}
          {showEmployeeList && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Chọn nhân viên</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmployee?.id === employee.id
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee.image}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">
                            {employee.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEmployeeList(false);
                      setSelectedEmployee(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      handleSubmitShift();
                    }}
                    disabled={!selectedEmployee}
                    className={`px-4 py-2 rounded-lg ${
                      selectedEmployee
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaLam;
