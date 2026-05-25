import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://librarymanagementsystembe.onrender.com/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data.message === 'object' && response.data.message !== null && 'isSuccess' in response.data.message) {
      response.data = response.data.message;
    }
    return response;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data.message === 'object' && error.response.data.message !== null && 'isSuccess' in error.response.data.message) {
      error.response.data = error.response.data.message;
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Could also trigger a global logout event here
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
