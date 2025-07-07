// Simple file-based storage for development and basic persistence for production
const fs = require("fs")
const path = require("path")

// Start with EMPTY initial data to avoid the reset issue
const initialData = {
  excelSheets: [],
  websiteLinks: [],
  tasks: [],
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

// Simple key-value storage simulation for production
// This will work better than complex in-memory solutions
const STORAGE_KEYS = {
  excelSheets: "erp_excel_sheets",
  websiteLinks: "erp_website_links",
  tasks: "erp_tasks",
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
      console.log(`Initialized ${key}.json with empty array`)
    }
  })
}

// Production storage using environment variables as a simple key-value store
const setEnvData = (key, data) => {
  try {
    // In production, we'll use a simple approach
    // Store data in a global variable that persists during the function lifecycle
    if (!global.erpData) {
      global.erpData = {}
    }
    global.erpData[key] = JSON.parse(JSON.stringify(data))
    console.log(`💾 Stored ${data.length} items for ${key} in global storage`)
    return true
  } catch (error) {
    console.error(`❌ Error storing data for ${key}:`, error)
    return false
  }
}

const getEnvData = (key) => {
  try {
    if (!global.erpData) {
      global.erpData = {}
    }

    if (!global.erpData[key]) {
      // Initialize with empty array if not exists
      global.erpData[key] = []
      console.log(`🔄 Initialized empty array for ${key}`)
    }

    const data = global.erpData[key] || []
    console.log(`📖 Retrieved ${data.length} items for ${key} from global storage`)
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error(`❌ Error retrieving data for ${key}:`, error)
    return []
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
      // Production: Use global storage
      return getEnvData(key)
    }
  } catch (error) {
    console.error(`❌ Error reading data for ${key}:`, error)
    // Return empty array instead of initial data to avoid reset issues
    console.log(`🔄 Returning empty array for ${key}`)
    return []
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
      // Production: Use global storage
      const success = setEnvData(key, data)
      if (!success) {
        throw new Error(`Failed to store data for ${key}`)
      }
      console.log(`💾 Successfully wrote ${data.length} items to ${key} (global)`)
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

// Clear all data function
const clearAllData = async () => {
  try {
    const keys = Object.keys(initialData)
    for (const key of keys) {
      await writeData(key, [])
    }
    console.log("🧹 All data cleared successfully")
    return true
  } catch (error) {
    console.error("❌ Error clearing data:", error)
    return false
  }
}

// Health check function
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
}

module.exports = {
  readData,
  writeData,
  generateId,
  healthCheck,
  clearAllData,
}
