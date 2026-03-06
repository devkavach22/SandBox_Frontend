import axiosInstance from "../URL/axiosInstance";

export const getAllApisAPI = async () => {
  const res = await axiosInstance.get("/apis/all");
  return res.data;
};

export const getAllUsersAPI = async () => {
  const res = await axiosInstance.get("/user/all");
  return res.data;
};

export const getStatsAPI = async () => {
  const res = await axiosInstance.get("/apis/stats");
  return res.data;
};

// ✅ Router routes match karo
export const addApiAPI = async (data) => {
  const res = await axiosInstance.post("/apis", data);        // POST /
  return res.data;
};

export const updateApiAPI = async (id, data) => {
  const res = await axiosInstance.put(`/apis/${id}`, data);   // PUT /:id
  return res.data;
};

export const deleteApiAPI = async (id) => {
  const res = await axiosInstance.delete(`/apis/${id}`);      // DELETE /:id
  return res.data;
};

export const toggleApiAPI = async (id) => {
  const res = await axiosInstance.patch(`/apis/${id}/toggle`); 
  return res.data;
};

// History APIs
export const getAllHistoryAPI = async () => {
  const res = await axiosInstance.get("/sandbox/history/all");
  return res.data;
};

export const getCustomerHistoryAPI = async (userId) => {
  const res = await axiosInstance.get(`/sandbox/history/${userId}`);
  return res.data;
};