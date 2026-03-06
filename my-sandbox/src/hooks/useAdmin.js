import { useState, useEffect } from "react";
import {
  getAllApisAPI, getAllUsersAPI, getStatsAPI,
  addApiAPI, updateApiAPI, deleteApiAPI, toggleApiAPI,
  getAllHistoryAPI, getCustomerHistoryAPI,
} from "../services/admin.service";

export const useAdmin = () => {
  const [apis,      setApis]      = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [apisRes, usersRes, statsRes, historyRes] = await Promise.all([
        getAllApisAPI(),
        getAllUsersAPI(),
        getStatsAPI(),
        getAllHistoryAPI(), 
      ]);

      const allHistory  = historyRes?.data || [];
      const rawCustomers = usersRes.data   || [];

      const customersWithCalls = rawCustomers.map((c) => ({
        ...c,
        totalCalls: allHistory.filter(
          (h) => h.user?._id === c._id || h.user === c._id
        ).length,
      }));

      setApis(apisRes.data         || []);
      setCustomers(customersWithCalls);
      setStats(statsRes.data       || null);
      setHistory(allHistory);

    } catch (err) {
      console.log("❌ fetchAll Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId = null) => {
    try {
      setLoading(true);
      const res = userId
        ? await getCustomerHistoryAPI(userId)
        : await getAllHistoryAPI();
      console.log("✅ History:", res);
      setHistory(res.data || []);
      return res;
    } catch (err) {
      console.log("❌ History Error:", err.response?.data);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addApi = async (data) => {
    try { const res = await addApiAPI(data); await fetchAll(); return res; }
    catch (err) { console.log("❌ Add API Error:", err.response?.data); throw err; }
  };

  const updateApi = async (id, data) => {
    try { const res = await updateApiAPI(id, data); await fetchAll(); return res; }
    catch (err) { console.log("❌ Update API Error:", err.response?.data); throw err; }
  };

  const deleteApi = async (id) => {
    try { const res = await deleteApiAPI(id); await fetchAll(); return res; }
    catch (err) { console.log("❌ Delete API Error:", err.response?.data); throw err; }
  };

  const toggleApi = async (id) => {
    try { const res = await toggleApiAPI(id); await fetchAll(); return res; }
    catch (err) { console.log("❌ Toggle API Error:", err.response?.data); throw err; }
  };

  useEffect(() => { fetchAll(); }, []);

  return {
    apis, customers, stats, history,
    loading, error,
    addApi, updateApi, deleteApi, toggleApi,
    fetchAll, fetchHistory,
  };
};