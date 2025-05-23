import api from "./api";
import axios from "axios";
export const fetchSummary = async () => {
  try {
    const response = await api.get(`/v1/thongke`);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay sumary";
  }
};


export const fetchBill = async (page = 0, size = 10, keyword = "", startDate = "", endDate = "") => {
  try {
    const response = await api.get("/bills/paged", {
      params: { page, size, ...(keyword && { keyword }), ...(startDate && { startDate }), ...(endDate && { endDate }) },
    });
    console.log(`API URL called: /bills/paged?page=${page}&size=${size}${keyword ? '&keyword=' + keyword : ''}${startDate ? '&startDate=' + startDate : ''}${endDate ? '&endDate=' + endDate : ''}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay bill";
  }
}

export const fetchBillById = async (id: number) => {
  try {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay bill by id";
  }
}

export const deleteBillById = async (id: number) => {
  try {
    const response = await api.put(
      `/bills/delete/${id}`,
      {}, // Body rỗng (nếu API không cần body)
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bill:", error);
    return "Lỗi khi xóa bill by id";
  }
};


export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post("http://localhost:8080/api/v1/login", {
      username: username,
      password: password,
    },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.status == 101) {
      return 101;
    }
    const TOKEN = response.data.token;
    if (sessionStorage.getItem('token')) {
      sessionStorage.removeItem('token');
    }
    sessionStorage.setItem('token', TOKEN);
    return TOKEN;
  } catch (error) {
    return error;
  }
}


export const fetchProduct = async (page = 0, size = 10, keyword = "") => {
  try {
    const response = await api.get("/products/paged", {
      params: { page, size, ...(keyword && { keyword }) },
    });
    console.log(page, size, keyword);
    return response.data;
  } catch (error) {
    return "Loi khi lay san pham" + error;
  }
}

export const fetchAllProduct = async () => {
  try {
    const response = await api.get("/products", {
    });

    return response.data;
  } catch (error) {
    return error + "Loi khi lay tat ca san pham";
  }
}

export const fetchAllBill = async () => {
  try {
    const response = await api.get("/bills/get-all-bills");
    return response.data;
  } catch (error) {
    return error + "Loi khi lay tat ca hoa don";
  }
}

export const fetchSalesChart = async (type: string, startDate: string, endDate: string) => {
  try {
    const response = await api.get("/sales/chart", {
      params: { type, startDate, endDate },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
    return null;
  }
};


export const fetchAllCategory = async () => {
  try {
    const response = await api.get("/category/all");
    console.log(response);
    return response;
  } catch (error) {
    console.log("Loi khi lay loai san pham", error);
    return null;
  }
}

export const fetchReciept = async (page = 0, size = 10, keyword = "") => {
  try {
    const response = await api.get("/receipts/paged", {
      params: { page, size, ...(keyword && { keyword }) },
    });
    console.log(response);
    return response;
  } catch (error) {
    return "Loi khi lay nhap kho";
  }
}

export const fetchAllReciept = async () => {
  try {
    const response = await api.get(`/receipts/all`);
    console.log(response);
    return response;
  } catch (error) {
    console.log("Loi khi lay tất cả nhập kho", error);
    return null;
  }
}

export const fetchSalesReport = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get("/sales/report", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo doanh thu:", error);
    return null;
  }
};

// export const changePass = async (username: string, oldPass: string, newPass: string) => {
//   try {
//     const response = await axios.post(`${API_URL}/v1/change-pass`,
//       {
//         username: username,
//         old_pass: oldPass,
//         new_pass: newPass,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${TOKEN}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi khi gọi API đổi mật khẩu", error);
//     throw new Error("Đổi mật khẩu thất bại");
//   }
// };