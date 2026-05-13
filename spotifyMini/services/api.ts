import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();

export const API = axios.create({
  baseURL: API_BASE_URL
});

// Add Bearer token to all requests
API.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("spotifymini.auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error retrieving auth token:", error);
  }
  return config;
});

