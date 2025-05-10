import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:8080/api", // base URL của backend
});

// Thêm token vào mỗi request nếu có
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || !sessionStorage.getItem("token")) {
      localStorage.setItem("sessionExpired", "true");
      window.location.href = "/login"; // hoặc navigate
    }
    return Promise.reject(err);
  }
);

api.defaults.withCredentials = true;

export default api;