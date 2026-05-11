import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.10.49.77:5000";

export const API = axios.create({
  baseURL: API_BASE_URL
});