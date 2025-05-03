import axios from "axios";

const API_URL = "http://localhost:8080/api";

let TOKEN:string;

// Cấu hình axios mặc định
axios.defaults.withCredentials = true;

export const fetchSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/v1/thongke`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay sumary";
  }
};


export const fetchBill = async (page = 0, size = 10, keyword = "", startDate = "", endDate = "") => {
  try {
    const response = await axios.get(`${API_URL}/bills/paged`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      params: {page, size, ...(keyword && { keyword }), ...(startDate && { startDate }), ...(endDate && { endDate }) },
    });
    console.log(`API URL called: ${API_URL}/bills/paged?page=${page}&size=${size}${keyword ? '&keyword=' + keyword : ''}${startDate ? '&startDate=' + startDate : ''}${endDate ? '&endDate=' + endDate : ''}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay bill";
  }
}

export const fetchBillById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/bills/${id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      }
    });
    
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi lay bill by id";
  }
}

export const deleteBillById = async (id: number) => {
  try {
    const response = await axios.put(
      `${API_URL}/bills/delete/${id}`, 
      {}, // Body rỗng (nếu API không cần body)
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bill:", error);
    return "Lỗi khi xóa bill by id";
  }
};


export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(API_URL + "/v1/login", {
      username: username,
      password: password,
    }, 
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
    TOKEN = response.data.token;
    const item = {
      token: TOKEN,
      exp: new Date().getTime() + 3600000
    }

    localStorage.setItem('token', JSON.stringify(item));

    return TOKEN;
  } catch (error) {
    return error;
  }
}


export const fetchProduct = async (page = 0, size = 10, keyword = "") => {
  try {
    const response = await axios.get(`${API_URL}/products/paged`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      params: {page, size, ...(keyword && { keyword })},
    });
    console.log(page, size, keyword);
    return response.data;
  } catch (error) {
    return "Loi khi lay san pham";
  }
}

export const fetchAllProduct = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      }
    });
    
    return response.data;
  } catch (error) {
    return "Loi khi lay tat ca san pham";
  }
}

export const fetchAllBill = async () => {
  try {
    const response = await axios.get(`${API_URL}/bills/get-all-bills`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      }
    });
    
    return response.data;
  } catch (error) {
    return "Loi khi lay tat ca hoa don";
  }
}

export const fetchSalesChart = async (type: string, startDate: string, endDate: string) => {
  try {
    const response = await axios.get(`${API_URL}/sales/chart`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      params: { type, startDate, endDate },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
    return null;
  }
};