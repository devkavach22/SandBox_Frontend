import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://192.168.11.53:6001/api",

});

axiosInstance.interceptors.request.use(
  (config) => {
    // client_id attach
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.client_id) {
      config.params = {
        ...config.params,
        client_id: user.client_id,
      };
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;