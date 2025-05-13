import api from "./api";

export const getAllEmployees = async () => {
  try {
    const response = await api.get("/v1/employees");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay all employee";
  }
};

export const updateEmployeeById = async (employee: any) => {
  try {
    const response = await api.put("/v1/employees/" + employee.id,JSON.stringify(employee),{
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

export const deleteEmployeeById = async (id: string) => {
  try {
    const response = await api.delete("/v1/employees/" + id);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi xoa employee";
  }
};
    
  