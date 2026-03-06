import { useState } from "react";
import { registerAPI, loginAPI ,forgotPasswordAPI, resetPasswordAPI} from "../services/auth.service";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await registerAPI(formData);
      console.log("✅ Register res:", res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      return res;
    } catch (err) {
      console.log("❌ Register Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginAPI(formData);
      console.log("✅ Login res:", res);
      console.log("✅ Token:", res.data.token);
      console.log("✅ User:", res.data.user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      return res;
    } catch (err) {
      console.log("❌ Login Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await forgotPasswordAPI({ email });
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      const res = await resetPasswordAPI(resetData);
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, login, forgotPassword,resetPassword,loading, error };
};