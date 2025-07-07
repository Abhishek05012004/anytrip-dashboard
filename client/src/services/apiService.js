import axios from "axios"

// API base URL - Updated to use the correct server URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://anytrip-dashboard-ten.vercel.app/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log(`🔗 Full URL: ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("❌ API Error:", error)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error setting up request:", error.message)
    }
    return Promise.reject(error)
  },
)

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get("/health")
    return response.data
  },

  // Excel Sheets API
  getExcelSheets: async () => {
    const response = await api.get("/excel-sheets")
    return response.data
  },

  getExcelSheet: async (id) => {
    const response = await api.get(`/excel-sheets/${id}`)
    return response.data
  },

  createExcelSheet: async (data) => {
    const response = await api.post("/excel-sheets", data)
    return response.data
  },

  updateExcelSheet: async (id, data) => {
    const response = await api.put(`/excel-sheets/${id}`, data)
    return response.data
  },

  deleteExcelSheet: async (id) => {
    const response = await api.delete(`/excel-sheets/${id}`)
    return response.data
  },

  // Website Links API
  getWebsiteLinks: async () => {
    const response = await api.get("/website-links")
    return response.data
  },

  getWebsiteLink: async (id) => {
    const response = await api.get(`/website-links/${id}`)
    return response.data
  },

  createWebsiteLink: async (data) => {
    const response = await api.post("/website-links", data)
    return response.data
  },

  updateWebsiteLink: async (id, data) => {
    const response = await api.put(`/website-links/${id}`, data)
    return response.data
  },

  deleteWebsiteLink: async (id) => {
    const response = await api.delete(`/website-links/${id}`)
    return response.data
  },

  // Tasks API
  getTasks: async () => {
    const response = await api.get("/tasks")
    return response.data
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data) => {
    const response = await api.post("/tasks", data)
    return response.data
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },
}
