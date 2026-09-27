import axios from "axios";

import { readAccessToken } from "@/services/auth/auth.token.storage";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "",
});

apiClient.interceptors.request.use((config) => {
    const token = readAccessToken();

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiClient;
