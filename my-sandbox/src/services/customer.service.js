import axiosInstance from "../URL/axiosInstance";

// Available APIs fetch karo
export const getAvailableApisAPI = async () => {
  const res = await axiosInstance.get("/user/available-apis");
  return res.data;
};

// API select karo
export const selectApiAPI = async (userId, apiId) => {
  const res = await axiosInstance.post("/user/select-api", { userId, apiId });
  return res.data;
};

// API deselect karo
export const deselectApiAPI = async (userId, apiId) => {
  const res = await axiosInstance.delete("/user/deselect-api", { data: { userId, apiId } });
  return res.data;
};

// User profile fetch karo (selectedApis ke saath)
export const getUserProfileAPI = async (userId) => {
  const res = await axiosInstance.get(`/user/profile/${userId}`);
  return res.data;
};

// User profile update karo
export const updateUserProfileAPI = async (userId, data) => {
  const res = await axiosInstance.put(`/user/profile/${userId}`, data);
  return res.data;
};

// Sandbox API call karo
export const callSandboxAPI = async (payload) => {
  const res = await axiosInstance.post("/sandbox/call", payload);
  return res.data;
};

export const getCustomerHistoryAPI = async (userId) => {
  const res = await axiosInstance.get(`/sandbox/history/${userId}`);
  return res.data;
};

