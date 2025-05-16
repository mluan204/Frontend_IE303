// import axios from "axios";

import api from "./api";

// const API_URL = "http://localhost:8080/api";
// let TOKEN : string = "";
//     const tokenStr = localStorage.getItem('token');
//     const parsedToken = tokenStr ? JSON.parse(tokenStr) : null;
//     TOKEN = parsedToken.token;

//   export const fetchProduct = async (page = 0, size = 10, keyword = "") => {

//       try {
//       const response = await axios.get(`${API_URL}/products/paged`, {
//           headers: {
//           Authorization: `Bearer ${TOKEN}`,
//           },
//           params: {page, size, ...(keyword && { keyword })},
//       });
//       console.log(page, size, keyword);
//       return response.data;
//       } catch (error) {
//       return "Loi khi lay san pham";
//       }
//   }

//   export const fetchAllProduct = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/products`, {
//         headers: {
//           Authorization: `Bearer ${TOKEN}`,
//         }
//       });

//       return response.data;
//     } catch (error) {
//       return "Loi khi lay tat ca san pham";
//     }
//   }

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
