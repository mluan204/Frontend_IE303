import axios from "axios";

const API_URL = "http://localhost:8080/api";

let TOKEN : string = "";
const tokenStr = localStorage.getItem('token');
const parsedToken = tokenStr ? JSON.parse(tokenStr) : null;
TOKEN = parsedToken.token;

export const getAllEmployees = async () => {

    try {
      const response = await axios.get(`${API_URL}/v1/employees`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return "Loi khi lay all employee";
    }
  };

export const updateEmployeeById = async (employee: any) => {
  console.log(employee);
  
  try {
    const response = await axios.put(`${API_URL}/v1/employees/` + employee.id,JSON.stringify(employee),{
      headers: {
        Authorization: `Bearer ${TOKEN}`,
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
        const response = await axios.delete(`${API_URL}/v1/employees/` + id, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        return response.data;
      } catch (error) {
        console.log(error);
        return "Loi khi xoa employee";
      }
    };
    
  