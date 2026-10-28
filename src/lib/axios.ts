import axios, { type AxiosInstance } from "axios";

import { readAccessToken } from "@/services/auth/auth.token.storage";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "",
});

export const integrationClient = axios.create({
    baseURL: import.meta.env.VITE_API_INTEGRACION_URL ?? "",
});

function configureAuth(client: AxiosInstance) {
    client.interceptors.request.use((config) => {
        const token = readAccessToken();

        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });
}

configureAuth(apiClient);
configureAuth(integrationClient);

export default apiClient;
