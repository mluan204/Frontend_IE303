import axios from "axios";

const API_URL = "http://localhost:8080/api";
const TOKEN = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtbHVhbiIsImlhdCI6MTc0NDI2MjYwOSwiZXhwIjoxNzQ0Mjc3MDA5fQ.YijWaWyKkDrasYcDej222B4bOB64Ne9pQZSNhZeNIEpolaHzDDMPR5pLwG8nVhaR";

export const fetchSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/v1/thongke`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    return response.data;
  } catch (error) {
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
    console.log(page, size, keyword, startDate, endDate);
    return response.data;
  } catch (error) {
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

// export const createCustomer = async () => {
//   try {
//     const response = await axios.post(`${API_URL}/customer`, 
//       {
//       headers: {
//         Authorization: `Bearer ${TOKEN}`,
//       },

//     });

//     return response;
//   }
//   catch (error) {
//     return "Loi khi tao customer";
//   }
// }

export const login = async (username: any, password: any) => {
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
  console.log('====================================');
  console.log(response.data);
  console.log('====================================');
    return response.data;
  } catch (error) {
    return error;
  }
}