import api from "./api";

export const getAllCustomer = async () => {
    try {
      const response = await api.get("/v1/customer");
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
    const response = await api.put("/v1/customer",JSON.stringify(customer), {
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

export const deleteCustomerById = async (id: string) => {
  try {
    console.log(id);
    const response = await api.delete("/v1/customer/"+id);
    console.log(response.data);
  } catch (error) {
    console.log(error);
    return "Loi khi xoa customer";
  }
};
  