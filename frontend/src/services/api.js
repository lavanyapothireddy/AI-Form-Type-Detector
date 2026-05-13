import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-form-type-detector.onrender.com"
});

export default API;
