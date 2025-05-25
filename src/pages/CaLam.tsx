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

type ShiftType = "DAI1" | "DAI2" | "NGAN1" | "NGAN2" | "NGAN3" | "NGAN4";

const SHIFT_CONFIG = {
  DAI1: {
    label: "Ca sáng (6h-14h)",
    color: "bg-green-100",
    hoverColor: "hover:bg-green-200",
    allowedPositions: ["fulltime"],
  },
  DAI2: {
    label: "Ca chiều (14h-22h)",
    color: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
    allowedPositions: ["fulltime"],
  },
  NGAN1: {
    label: "Ca ngắn 1 (6h-10h)",
    color: "bg-yellow-100",
    hoverColor: "hover:bg-yellow-200",
    allowedPositions: ["parttime"],
  },
  NGAN2: {
    label: "Ca ngắn 2 (10h-14h)",
    color: "bg-orange-100",
    hoverColor: "hover:bg-orange-200",
    allowedPositions: ["parttime"],
  },
  NGAN3: {
    label: "Ca ngắn 3 (14h-18h)",
    color: "bg-purple-100",
    hoverColor: "hover:bg-purple-200",
    allowedPositions: ["parttime"],
  },
  NGAN4: {
    label: "Ca ngắn 4 (18h-22h)",
    color: "bg-pink-100",
    hoverColor: "hover:bg-pink-200",
    allowedPositions: ["parttime"],
  },
};

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
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>("DAI1");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const getShiftsForDay = (date: Date, shiftType: ShiftType) => {
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

  const handleAddShift = (date: string, shiftType: ShiftType) => {
    setCreateShiftDate(date);
    setSelectedShiftType(shiftType);
    setShowEmployeeList(true);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleSubmitShift = async () => {
    if (!selectedEmployee || !createShiftDate) return;

    try {
      await createShift({
        employeeId: selectedEmployee.id,
        date: format(new Date(createShiftDate), "yyyy-MM-dd'T'00:00:00"),
        shiftType: selectedShiftType,
      });

      setShowEmployeeList(false);
      setSelectedEmployee(null);
      setCreateShiftDate("");
      fetchShifts();
    } catch (error) {
      console.error("Error creating shift:", error);
    }
  };

  const handleDeleteShift = async (shift: Shift, event: React.MouseEvent) => {
    event.stopPropagation();
    if (
      window.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi ca làm?")
    ) {
      try {
        await deleteShift(shift.id);
        fetchShifts();
      } catch (error) {
        console.error("Error deleting shift:", error);
      }
    }
  };

  const renderShiftCell = (day: Date, shiftType: ShiftType) => {
    const dayShifts = getShiftsForDay(day, shiftType);
    const config = SHIFT_CONFIG[shiftType];

    return (
      <td key={`${day.toString()}-${shiftType}`} className="border p-2">
        <div className="space-y-2">
          {dayShifts.map((shift) => (
            <div
              key={shift.id}
              className={`${config.color} ${config.hoverColor} p-2 rounded cursor-pointer transition-colors relative group`}
              onClick={() => handleShiftClick(shift)}
            >
              <div className="font-medium">
                {employeeDetails[shift.employeeId]?.name ||
                  `Nhân viên #${shift.employeeId}`}
              </div>
              <div className="text-sm text-gray-600">
                {employeeDetails[shift.employeeId]?.position === "fulltime"
                  ? "Toàn thời gian"
                  : "Bán thời gian"}
              </div>
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
            onClick={() => handleAddShift(format(day, "yyyy-MM-dd"), shiftType)}
            className="cursor-pointer w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </td>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Quản lý ca làm</h1>
        <input
          type="date"
          value={format(viewDate, "yyyy-MM-dd")}
          onChange={(e) => setViewDate(new Date(e.target.value))}
          className="border rounded p-2 w-full md:w-auto"
        />
      </div>

      {loading ? (
        <div className="min-h-screen bg-gray-50 flex justify-center">
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
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 w-48">Ca</th>
                    {weekDays.map((day) => (
                      <th key={day.toString()} className="border p-2">
                        <div className="text-sm md:text-base">
                          {format(day, "EEEE", { locale: vi })}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {format(day, "dd/MM/yyyy")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SHIFT_CONFIG).map(([shiftType, config]) => (
                    <tr key={shiftType}>
                      <td className="border p-2 font-semibold bg-gray-50">
                        <div className="space-y-1">
                          <div className="font-bold text-sm md:text-base">
                            {config.label}
                          </div>
                        </div>
                      </td>
                      {weekDays.map((day) =>
                        renderShiftCell(day, shiftType as ShiftType)
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Details Slide Panel */}
          {selectedShift && employeeDetails[selectedShift.employeeId] && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setSelectedShift(null)}
              />
              <div
                className="fixed z-50 top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
                style={{
                  transform: selectedShift
                    ? "translateX(0)"
                    : "translateX(100%)",
                }}
              >
                <div className="p-4 md:p-6 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-xl font-semibold">
                      Thông tin nhân viên
                    </h2>
                    <button
                      onClick={() => setSelectedShift(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={employeeDetails[selectedShift.employeeId].image}
                        alt={employeeDetails[selectedShift.employeeId].name}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg md:text-xl">
                          {employeeDetails[selectedShift.employeeId].name}
                        </h3>
                        <p className="text-gray-600 text-base md:text-lg">
                          {employeeDetails[selectedShift.employeeId]
                            .position === "fulltime"
                            ? "Toàn thời gian"
                            : "Bán thời gian"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-sm md:text-base">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">
                          {employeeDetails[selectedShift.employeeId].email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Số điện thoại:</span>
                        <p className="font-medium">
                          {
                            employeeDetails[selectedShift.employeeId]
                              .phone_number
                          }
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
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-600">Ca làm:</span>
                          <p className="font-medium text-base md:text-lg">
                            {
                              SHIFT_CONFIG[selectedShift.shiftType as ShiftType]
                                .label
                            }
                          </p>
                          <p className="text-gray-600 text-sm md:text-base">
                            {format(
                              parseISO(selectedShift.date),
                              "EEEE, dd/MM/yyyy",
                              {
                                locale: vi,
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Lương:</span>
                          <p className="font-medium text-base md:text-lg">
                            {employeeDetails[
                              selectedShift.employeeId
                            ].salary.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Employee Selection Modal */}
          {showEmployeeList && (
            <div className="fixed z-50 inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">
                  Chọn nhân viên
                </h2>
                {selectedEmployee && (
                  <p className="mb-4 text-sm md:text-base text-gray-500">
                    {selectedEmployee.position === "fulltime"
                      ? "Nhân viên toàn thời gian chỉ có thể đăng ký ca 8 tiếng"
                      : "Nhân viên bán thời gian chỉ có thể đăng ký ca 4 tiếng"}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {employees
                    .filter((employee) => {
                      const config = SHIFT_CONFIG[selectedShiftType];
                      return config.allowedPositions.includes(
                        employee.position
                      );
                    })
                    .map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedEmployee?.id === employee.id
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm md:text-base">
                              {employee.name}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500">
                              {employee.position === "fulltime"
                                ? "Toàn thời gian"
                                : "Bán thời gian"}
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
                    className="px-3 md:px-4 py-2 border rounded-lg hover:bg-red-400 cursor-pointer text-sm md:text-base"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitShift}
                    disabled={!selectedEmployee}
                    className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base ${
                      selectedEmployee
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
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
