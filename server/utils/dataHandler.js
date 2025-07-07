const fs = require("fs")
const path = require("path")

// Initial data with more comprehensive sample data
const initialData = {
  excelSheets: [
    {
      id: "1751907406474yl4tvdlqz",
      name: "kartik",
      description: "MBA ",
      url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      category: "Finance",
      status: "pending",
      isPinned: true,
      createdAt: "2025-07-07T16:56:46.478Z",
      updatedAt: "2025-07-07T17:54:22.090Z",
    },
    {
      id: "1751898524469cwr086fsd",
      name: "Harsh",
      description: "Hii how are you",
      url: "https://e-commerce-one-woad-52.vercel.app/",
      category: "Finance",
      status: "completed",
      isPinned: false,
      createdAt: "2025-07-07T14:28:44.469Z",
      updatedAt: "2025-07-07T14:28:44.469Z",
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

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV !== "production"

// Data file paths (for development only)
const DATA_DIR = path.join(__dirname, "..", "data")
const FILE_MAP = {
  excelSheets: path.join(DATA_DIR, "excelSheets.json"),
  websiteLinks: path.join(DATA_DIR, "websiteLinks.json"),
  tasks: path.join(DATA_DIR, "tasks.json"),
}

// Global data store for production - using a more persistent approach
let globalDataStore = null

// Initialize global data store
const initializeGlobalStore = () => {
  if (!globalDataStore) {
    console.log("🔄 Initializing global data store...")
    globalDataStore = JSON.parse(JSON.stringify(initialData)) // Deep clone
    console.log("✅ Global data store initialized")
  }
  return globalDataStore
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

// Enhanced data persistence for production
const persistToEnvironment = async (key, data) => {
  try {
    // In a real production environment, you would save to a database
    // For now, we'll use a more robust in-memory approach with backup
    const store = initializeGlobalStore()
    store[key] = JSON.parse(JSON.stringify(data)) // Deep clone to prevent reference issues

    console.log(`💾 Data persisted to global store for ${key}: ${data.length} items`)
    return true
  } catch (error) {
    console.error(`❌ Error persisting data for ${key}:`, error)
    return false
  }
}

const readFromEnvironment = async (key) => {
  try {
    const store = initializeGlobalStore()
    const data = store[key] || initialData[key] || []
    console.log(`📖 Data read from global store for ${key}: ${data.length} items`)
    return JSON.parse(JSON.stringify(data)) // Deep clone to prevent reference issues
  } catch (error) {
    console.error(`❌ Error reading data for ${key}:`, error)
    return initialData[key] || []
  }
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
      console.log(`📖 Read ${parsedData.length} items from ${key} (file)`)
      return parsedData
    } else {
      // Production: Use enhanced global storage
      return await readFromEnvironment(key)
    }
  } catch (error) {
    console.error(`❌ Error reading data for ${key}:`, error)
    // Return initial data as fallback
    const fallbackData = initialData[key] || []
    console.log(`🔄 Using fallback data for ${key}: ${fallbackData.length} items`)
    return fallbackData
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
      console.log(`💾 Successfully wrote ${data.length} items to ${key}.json`)
    } else {
      // Production: Use enhanced global storage
      const success = await persistToEnvironment(key, data)
      if (!success) {
        throw new Error(`Failed to persist data for ${key}`)
      }
      console.log(`💾 Successfully wrote ${data.length} items to ${key} (global store)`)
    }
    return true
  } catch (error) {
    console.error(`❌ Error writing data for ${key}:`, error)
    return false
  }
}

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Health check function to verify data integrity
const healthCheck = async () => {
  try {
    const results = {}
    for (const key of Object.keys(initialData)) {
      const data = await readData(key)
      results[key] = {
        count: data.length,
        lastUpdated: data.length > 0 ? data[0].updatedAt || data[0].createdAt : null,
      }
    }
    return {
      status: "healthy",
      environment: isDevelopment ? "development" : "production",
      dataStore: isDevelopment ? "file-system" : "global-memory",
      data: results,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

// Initialize data files when module loads (development only)
if (isDevelopment) {
  initializeDataFiles()
} else {
  // Initialize global store for production
  initializeGlobalStore()
}

module.exports = {
  readData,
  writeData,
  generateId,
  healthCheck,
}
