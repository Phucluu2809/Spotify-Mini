import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../app/config/api";

export const API = axios.create({
  baseURL: API_URL
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

