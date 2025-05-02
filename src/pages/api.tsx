import axios from "axios";

const API_URL = "http://127.0.0.1:8080/api";

let TOKEN = "";
export const login = async (username, password) => {
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
  console.log(response.data.token);
  TOKEN = response.data.token;
  console.log('====================================');
    return response.data;
  } catch (error) {
    return error;
  }
}

export const cus = async () => {
  try {
    const response = await axios.post("http://127.0.0.1:8080/api/v1/customer", {
      name: "Do Nguyen Phuong123",
      gender: 0, 
      phone_number : "0838329952"
    }, {
      headers: {
        "Authorization": "Bearer " + TOKEN,
      }
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


export const fetchSumamry = async () => {
  try {
    const response = await axios.get(API_URL + "/v1/thongke", {
      headers: {
        "Authorization": "Bearer " + TOKEN,
      },
    });

    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
};
