// import axios from "axios";

import api from "./api";

interface Product {
  categoryId: number,
  dateExpired: Date,
  description: string,
  id: number,
  image: string,
  inputPrice: number,
  name: string,
  price: number,
  quantityAvailable: number,
  salePrice: string,
  suppliers: string
}

export const createProduct = async (prod: Product) => {
  const req = {
    name: prod.name,
    description: prod.description,
    image: prod.image,
    suppliers: prod.suppliers,
    quantity_available: prod.quantityAvailable,
    sale_price: prod.salePrice,
    input_price: prod.inputPrice,
    price: prod.price,
    category: { id: prod.categoryId },
  }
  console.log(req);

  try {
    const response = await api.post("/products/add", req);
    console.log(response.data);

    return response.data.id;
  } catch (error) {
    console.log(error);
    return "Loi khi tao employee";
  }
};

export const getAllProduct = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const updateProduct = async (product: Product, id: number) => {
  try {
    console.log(product);
    const response = await api.put(`/products/${id}`, JSON.stringify(product), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay cap nhat san pham ";
  }
};

export const deleteProductById = async (id: number) => {
  try {
    const response =  await api.delete(`/products/${id}`);
    console.log("xoa san pham thanh cong");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi xoa san pham";
  }
};
