// import axios from "axios";

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
  
  