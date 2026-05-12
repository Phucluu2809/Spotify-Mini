import axios from "axios";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();

export const API = axios.create({
  baseURL: API_BASE_URL
});
