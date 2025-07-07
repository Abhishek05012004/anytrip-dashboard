const fs = require("fs")
const path = require("path")

// For Vercel deployment, we'll use a different approach
// In production, we'll use environment variables or external storage
// For now, let's use in-memory storage with initialization

// Initial data
const initialData = {
  excelSheets: [
    {
      id: "1751718520090kty154xin",
      name: "test",
      description: "",
      url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      category: "HR",
      status: "inactive",
      isPinned: true,
      createdAt: "2025-07-05T12:28:40.090Z",
      updatedAt: "2025-07-06T12:49:37.133Z",
    },
    {
      id: "17517143634231aq3870n2",
      name: "alis",
      description: "",
      url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      category: "HR",
      status: "completed",
      isPinned: false,
      createdAt: "2025-07-05T11:19:23.423Z",
      updatedAt: "2025-07-06T12:49:20.929Z",
    },
  ],
  websiteLinks: [
    {
      id: "1751718611072dltc5gqk8",
      name: "tripeay",
      description: "",
      url: "https://tripeasy.in/",
      category: "Finance",
      status: "completed",
      isPinned: true,
      createdAt: "2025-07-05T12:30:11.072Z",
      updatedAt: "2025-07-05T12:40:14.530Z",
    },
  ],
  tasks: [
    {
      id: "175171438958586t9rmwbe",
      name: "abhishek",
      description: "",
      category: "HR",
      status: "inactive",
      priority: "low",
      dueDate: "2025-07-15",
      isPinned: true,
      createdAt: "2025-07-05T11:19:49.585Z",
      updatedAt: "2025-07-05T11:20:02.364Z",
    },
  ],
}

// In-memory storage for Vercel (since file system is read-only)
const memoryStore = { ...initialData }

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV !== "production"

// Data file paths (for development only)
const DATA_DIR = path.join(__dirname, "..", "data")
const FILE_MAP = {
  excelSheets: path.join(DATA_DIR, "excelSheets.json"),
  websiteLinks: path.join(DATA_DIR, "websiteLinks.json"),
  tasks: path.join(DATA_DIR, "tasks.json"),
}

// Development functions
const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log("Created data directory:", DATA_DIR)
  }
}

const initializeDataFiles = () => {
  if (!isDevelopment) return

  ensureDataDirectory()

  Object.keys(initialData).forEach((key) => {
    const filePath = FILE_MAP[key]
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialData[key], null, 2))
      console.log(`Initialized ${key}.json`)
    }
  })
}

const readData = async (key) => {
  try {
    if (isDevelopment) {
      // Development: Read from JSON files
      const filePath = FILE_MAP[key]
      if (!filePath) {
        throw new Error(`Unknown data key: ${key}`)
      }

      if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} doesn't exist, initializing...`)
        initializeDataFiles()
      }

      const data = fs.readFileSync(filePath, "utf8")
      const parsedData = JSON.parse(data)
      console.log(`Read ${parsedData.length} items from ${key}`)
      return parsedData
    } else {
      // Production: Use in-memory storage
      console.log(`Read ${memoryStore[key]?.length || 0} items from ${key} (memory)`)
      return memoryStore[key] || []
    }
  } catch (error) {
    console.error(`Error reading data for ${key}:`, error)
    return initialData[key] || []
  }
}

const writeData = async (key, data) => {
  try {
    if (isDevelopment) {
      // Development: Write to JSON files
      const filePath = FILE_MAP[key]
      if (!filePath) {
        throw new Error(`Unknown data key: ${key}`)
      }

      ensureDataDirectory()
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
      console.log(`Successfully wrote ${data.length} items to ${key}.json`)
    } else {
      // Production: Update in-memory storage
      memoryStore[key] = data
      console.log(`Successfully wrote ${data.length} items to ${key} (memory)`)
    }
    return true
  } catch (error) {
    console.error(`Error writing data for ${key}:`, error)
    return false
  }
}

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Initialize data files when module loads (development only)
if (isDevelopment) {
  initializeDataFiles()
}

module.exports = {
  readData,
  writeData,
  generateId,
}
