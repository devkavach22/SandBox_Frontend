import axiosInstance from "../URL/axiosInstance";

export const registerAPI = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const loginAPI = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const forgotPasswordAPI = async (data) => {
  const res = await axiosInstance.post("/auth/forgot-password", data);
  return res.data;
};

export const resetPasswordAPI = async (data) => {
  const res = await axiosInstance.post("/auth/reset-password", data);
  return res.data;
};