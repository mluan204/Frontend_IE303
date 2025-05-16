import api from "./api";

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

export const getAllEmployees = async () => {
  try {
    const response = await api.get("/v1/employees");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay all employee";
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