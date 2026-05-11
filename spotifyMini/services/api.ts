import axios from "axios";

export const API = axios.create({
  baseURL: "http://10.10.58.229:5000"
});