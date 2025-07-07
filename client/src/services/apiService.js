import axios from "axios"

// API base URL - will be updated after server deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)

export const apiService = {
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
