/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  createOrderAPI, verifyPaymentAPI,
  getAllPaymentsAPI, getCustomerPaymentsAPI
} from "../services/payment.service";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);

  const fetchPayments = async (userId = null) => {
    try {
      setLoading(true);
      setError(null);
      const res = userId
        ? await getCustomerPaymentsAPI(userId)
        : await getAllPaymentsAPI();
      console.log("✅ Payments:", res);
      setPayments(res.data || []);
      return res;
    } catch (err) {
      console.log("❌ Fetch Payments Error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (amount) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createOrderAPI(amount);
      console.log("✅ Order Created:", res);
      return res;
    } catch (err) {
      console.log("❌ Order Error:", err.response?.data);
      setError(err.response?.data?.message || "Order creation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await verifyPaymentAPI(paymentData);
      console.log("✅ Payment Verified:", res);
      return res;
    } catch (err) {
      console.log("❌ Verify Error:", err.response?.data);
      setError(err.response?.data?.message || "Payment verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments, loading, error,
    fetchPayments, createOrder, verifyPayment
  };
};