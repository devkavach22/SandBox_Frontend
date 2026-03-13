import { useState, useEffect } from "react";
import {
    getAvailableApisAPI,
    selectApiAPI,
    deselectApiAPI,
    getUserProfileAPI,
    callSandboxAPI,
    updateUserProfileAPI,
} from "../services/customer.service";

export const useCustomer = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Available APIs fetch karo
    const fetchAvailableApis = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAvailableApisAPI();
            setApis(res.data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch APIs");
        } finally {
            setLoading(false);
        }
    };

    // API select karo
    const selectApi = (userId, apiId) => selectApiAPI(userId, apiId);

    // API deselect karo
    const deselectApi = (userId, apiId) => deselectApiAPI(userId, apiId);

    useEffect(() => {
        fetchAvailableApis();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const res = await getUserProfileAPI(userId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch profile");
        }
    };


    const callApi = ({ userId, apiId, requestBody = null, headers = {}, isFormData = false, urlOverride = null }) =>
        callSandboxAPI({ userId, apiId, requestBody, headers, isFormData, urlOverride });
    const updateUserProfile = async (userId, data) => {
        try {
            setLoading(true);
            setError(null);
            const res = await updateUserProfileAPI(userId, data);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        apis,
        loading,
        error,
        fetchAvailableApis,
        selectApi,
        deselectApi,
        fetchUserProfile,
        updateUserProfile,
        callApi,
    };
};