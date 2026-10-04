import {
    AxiosHeaders,
    type AxiosAdapter,
    type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import apiClient from "../lib/axios";
import {
    ACCESS_TOKEN_STORAGE_KEY,
    clearAccessToken,
    writeAccessToken,
} from "../services/auth/auth.token.storage";

describe("apiClient", () => {
    const adapterOriginal = apiClient.defaults.adapter;
    let requestConfig: InternalAxiosRequestConfig | undefined;

    const adapter: AxiosAdapter = async (config) => {
        requestConfig = config;
        return {
            data: {},
            status: 200,
            statusText: "OK",
            headers: new AxiosHeaders(),
            config,
        };
    };

    beforeEach(() => {
        requestConfig = undefined;
        apiClient.defaults.adapter = adapter;
        clearAccessToken();
    });

    afterEach(() => {
        apiClient.defaults.adapter = adapterOriginal;
        window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    });

    it("agrega el token de sesión como Bearer en las solicitudes", async () => {
        writeAccessToken("token-de-prueba");

        await apiClient.get("/recurso");

        expect(requestConfig?.headers.get("Authorization")).toBe(
            "Bearer token-de-prueba",
        );
    });

    it("no agrega Authorization cuando no hay token", async () => {
        await apiClient.get("/recurso");

        expect(requestConfig?.headers.get("Authorization")).toBeUndefined();
    });
});