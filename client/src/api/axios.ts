import axios from "axios";
import Cookies from "js-cookie"
import { setToken, getToken } from "./tokenStore";
import { forceLogout } from "../auth/authHandler";


export const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const unsafeMethods = ["post", "patch", "put", "delete"]
    const token = getToken();

    if (token && !config.url?.includes("/auth/refresh")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method && unsafeMethods.includes(config.method.toLocaleLowerCase())) {
        config.headers["X-CSRF-TOKEN"] = Cookies.get("csrf_refresh_token") || "";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/signup");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post("/auth/refresh");
        const newAccess = res.data.access_token;
        setToken(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
