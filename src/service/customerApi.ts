import axios from "axios";

const API_URL = "http://localhost:8080/api";
let TOKEN : string = "";

export const getAllCustomer = async () => {
  const tokenStr = localStorage.getItem('token');
  const parsedToken = tokenStr ? JSON.parse(tokenStr) : null;
  TOKEN = parsedToken.token;
    try {
      const response = await axios.get(`${API_URL}/v1/customer`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return "Loi khi lay all customer";
    }
};

export const updateCustomer = async (customer : any) => {
  try {
    customer.gender = customer.gender == "Nam";
    console.log(customer);
    const response = await axios.put(`${API_URL}/v1/customer`,JSON.stringify(customer), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay update customer";
  }
};

export const deleteCustomerById = async (id: string) => {
  try {
    console.log(id);
    const response = await axios.delete(`${API_URL}/v1/customer/`+id,{
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error);
    return "Loi khi xoa customer";
  }
};
  