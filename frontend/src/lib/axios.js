import axios from "axios"
const apiUrl = import.meta.env.VITE_API_URL || "/api";
const baseUrl = new URL(apiUrl, window.location.origin).origin;

export const axiosinstance = axios.create({
    baseURL: baseUrl,
    withCredentials:true
})

export default axiosinstance;