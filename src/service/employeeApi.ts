import api from "./api";

export interface Employee {
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
  employeeShifts?: number[];
  bills?: number[];
  receipts?: number[];
}

export interface Shift {
  id: number;
  employeeId: number;
  date: string;
  shiftType: 'DAI1' | 'DAI2';
}

export interface EmployeeShiftDTO {
  id?: number;
  employeeId: number;
  date: string;
  shiftType: "DAI1" | "DAI2";
}

export const getAllEmployees = async () => {
  try {
    const response = await api.get("/v1/employees");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay all employee";
  }
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  try {
    const response = await api.get(`/v1/employees/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateEmployeeById = async (employee: Employee) => {
  try {
    const response = await api.put("/v1/employees/" + employee.id, JSON.stringify(employee), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay update employee";
  }
};

export const deleteEmployeeById = async (id: number) => {
  try {
    const response = await api.delete("/v1/employees/" + id);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi xoa employee";
  }
};

export const createEmployee = async (em : Employee) => {
  const req = {
    name: em.name,
    address: em.address,
    birthday: em.birthday,
    email: em.email,
    gender: em.gender,
    image: em.image,
    phone_number: em.phone_number,
    position: em.position,
    salary: em.salary
  }
  try {
    const response = await api.post("/v1/employees", req);
    console.log(response.data);
    
    return response.data.id;
  } catch (error) {
    console.log(error);
    return "Loi khi tao employee";
  }
};

export const getWeeklyShifts = async (date: string): Promise<Shift[]> => {
  try {
    const response = await api.get(`/shifts/weekly?date=${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shifts:", error);
    throw error;
  }
};

export const createShift = async (shiftData: EmployeeShiftDTO): Promise<EmployeeShiftDTO> => {
  try {
    const response = await api.post<EmployeeShiftDTO>('/shifts', shiftData);
    return response.data;
  } catch (error) {
    console.error("Error creating shift:", error);
    throw error;
  }
};

export const deleteShift = async (id: number): Promise<void> => {
  try {
    await api.delete(`/shifts/${id}`);
  } catch (error) {
    console.error("Error deleting shift:", error);
    throw error;
  }
};

export const updateShift = async (id: number, shiftData: EmployeeShiftDTO): Promise<EmployeeShiftDTO> => {
  try {
    const response = await api.put<EmployeeShiftDTO>(`/shifts/${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error("Error updating shift:", error);
    throw error;
  }
};
