import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.11.241:6001/api",  // ✅ Updated URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Har request me client_id auto attach
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.client_id) {
      config.params = {
        ...config.params,
        client_id: user.client_id,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;