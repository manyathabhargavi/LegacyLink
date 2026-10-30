import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("legacylink_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : !error.response
          ? "Cannot reach the backend. Check that it is running and VITE_API_BASE_URL is correct."
          : `Request failed (${error.response.status}).`);
    return Promise.reject(new Error(message));
  }
);

export function getPayload(response) {
  return response?.data?.data ?? response?.data;
}

export function getList(response) {
  const payload = getPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}
