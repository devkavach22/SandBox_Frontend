import axiosInstance from "../URL/axiosInstance";

export const createOrderAPI = async (amount) => {
  const res = await axiosInstance.post("/payment/order", { amount });
  return res.data;
};

export const verifyPaymentAPI = async (data) => {
  const res = await axiosInstance.post("/payment/verify", data);
  return res.data;
};

export const getAllPaymentsAPI = async () => {
  const res = await axiosInstance.get("/payment/all");
  return res.data;
};

export const getCustomerPaymentsAPI = async (userId) => {
  const res = await axiosInstance.get(`/payment/history/${userId}`);
  return res.data;
};