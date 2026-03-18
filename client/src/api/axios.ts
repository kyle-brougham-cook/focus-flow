import axios from "axios";
import Cookies from "js-cookie"


export const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const unsafeMethods = ["POST", "PATCH", "PUT", "DELETE", "post", "patch", "put", "delete"]
    const token = localStorage.getItem("token");

    if (token && !config.url?.includes("/auth/refresh")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (unsafeMethods.includes(config.method!)) {
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
    console.log("test")

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      localStorage.getItem("token")
    ) {

      originalRequest._retry = true;

      try {
        const res = await api.post("/auth/refresh");
        const newAccess = res.data.access_token;
        localStorage.setItem("token", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
