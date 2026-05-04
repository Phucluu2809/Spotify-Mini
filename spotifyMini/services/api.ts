import axios from "axios";

export const API = axios.create({
  baseURL: "http://172.20.10.2:5000"
});