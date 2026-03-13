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

// ── API Add ──
export const addApiAPI = async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData
        ? { headers: { "Content-Type": undefined } }  // ← browser khud boundary set karega
        : {};
    const res = await axiosInstance.post("/apis", data, config);
    return res.data;
};

// ── API Update ──
export const updateApiAPI = async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData
        ? { headers: { "Content-Type": undefined } }  // ← browser khud boundary set karega
        : {};
    const res = await axiosInstance.put(`/apis/${id}`, data, config);
    return res.data;
};

export const deleteApiAPI = async (id) => {
    const res = await axiosInstance.delete(`/apis/${id}`);
    return res.data;
};

export const toggleApiAPI = async (id) => {
    const res = await axiosInstance.patch(`/apis/${id}/toggle`);
    return res.data;
};

// ── History APIs ──
export const getAllHistoryAPI = async () => {
    const res = await axiosInstance.get("/sandbox/history/all");
    return res.data;
};

export const getCustomerHistoryAPI = async (userId) => {
    const res = await axiosInstance.get(`/sandbox/history/${userId}`);
    return res.data;
};