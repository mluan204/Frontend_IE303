import api from "./api";

interface Customer {
  id: number;
  gender: boolean;
  name: string;
  phone_number: string;
  score: number;
  created_at: string;
}

export const getAllCustomer = async () => {
  try {
    const response = await api.get("/v1/customer");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay all customer";
  }
};

export const updateCustomer = async (customer: Customer) => {
  try {
    console.log(customer);
    const response = await api.put("/v1/customer", JSON.stringify(customer), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay update customer";
  }
};

export const deleteCustomerById = async (id: number) => {
  try {
    console.log(id);
    const response = await api.delete("/v1/customer/" + id);
    console.log(response.data);
  } catch (error) {
    console.log(error);
    return "Loi khi xoa customer";
  }
};

export const createCustomer = async (customer: Customer) => {
  console.log(customer);
  const req = {
    gender: customer.gender,
    name: customer.name,
    phone_number: customer.phone_number,
    score: customer.score
  }
  try {
    const response = await api.post("/v1/customer", req);
    console.log(response.data);
    return response.data.id;
  } catch (error) {
    console.log(error);
    return "Loi khi tao customer";
  }
};