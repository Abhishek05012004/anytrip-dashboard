const fs = require("fs")
const path = require("path")

// Start with EMPTY initial data
const initialData = {
  excelSheets: [],
  websiteLinks: [],
  tasks: [],
}

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV !== "production"

// Data file paths
const DATA_DIR = path.join(__dirname, "..", "data")
const FILE_MAP = {
  excelSheets: path.join(DATA_DIR, "excelSheets.json"),
  websiteLinks: path.join(DATA_DIR, "websiteLinks.json"),
  tasks: path.join(DATA_DIR, "tasks.json"),
}

// Ensure data directory exists
const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log("📁 Created data directory:", DATA_DIR)
  }
}

// Initialize data files with empty arrays
const initializeDataFiles = () => {
  ensureDataDirectory()

  Object.keys(initialData).forEach((key) => {
    const filePath = FILE_MAP[key]
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      console.log(`📄 Initialized ${key}.json with empty array`)
    }
  })
}

// Clear all data files
const clearAllDataFiles = () => {
  try {
    ensureDataDirectory()

    Object.keys(initialData).forEach((key) => {
      const filePath = FILE_MAP[key]
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      console.log(`🧹 Cleared ${key}.json`)
    })

    // Also clear global storage for production
    if (global.erpData) {
      global.erpData = {
        excelSheets: [],
        websiteLinks: [],
        tasks: [],
      }
      console.log("🧹 Cleared global storage")
    }

    return true
  } catch (error) {
    console.error("❌ Error clearing data files:", error)
    return false
  }
}

// Production storage using global variables
const setGlobalData = (key, data) => {
  try {
    if (!global.erpData) {
      global.erpData = {}
    }
    global.erpData[key] = JSON.parse(JSON.stringify(data))
    console.log(`💾 Stored ${data.length} items for ${key} in global storage`)
    return true
  } catch (error) {
    console.error(`❌ Error storing global data for ${key}:`, error)
    return false
  }
}

const getGlobalData = (key) => {
  try {
    if (!global.erpData) {
      global.erpData = {}
    }

    if (!global.erpData[key]) {
      global.erpData[key] = []
      console.log(`🔄 Initialized empty array for ${key} in global storage`)
    }

    const data = global.erpData[key] || []
    console.log(`📖 Retrieved ${data.length} items for ${key} from global storage`)
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error(`❌ Error retrieving global data for ${key}:`, error)
    return []
  }
}

// Read data from appropriate source
const readData = async (key) => {
  try {
    if (isDevelopment) {
      // Development: Always read from JSON files
      const filePath = FILE_MAP[key]
      if (!filePath) {
        throw new Error(`Unknown data key: ${key}`)
      }

      // Ensure file exists
      if (!fs.existsSync(filePath)) {
        console.log(`📄 File ${filePath} doesn't exist, creating empty file...`)
        ensureDataDirectory()
        fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      }

      const fileContent = fs.readFileSync(filePath, "utf8")
      const parsedData = JSON.parse(fileContent)
      console.log(`📖 Read ${parsedData.length} items from ${key}.json`)
      return parsedData
    } else {
      // Production: Use global storage but also try to sync with files if possible
      return getGlobalData(key)
    }
  } catch (error) {
    console.error(`❌ Error reading data for ${key}:`, error)
    console.log(`🔄 Returning empty array for ${key}`)
    return []
  }
}

// Write data to appropriate destination
const writeData = async (key, data) => {
  try {
    let fileSuccess = false
    let globalSuccess = false

    // Always try to write to JSON file (for both dev and prod)
    try {
      const filePath = FILE_MAP[key]
      if (filePath) {
        ensureDataDirectory()
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
        console.log(`💾 Successfully wrote ${data.length} items to ${key}.json`)
        fileSuccess = true
      }
    } catch (fileError) {
      console.error(`⚠️ Could not write to ${key}.json:`, fileError.message)
    }

    // For production, also store in global memory
    if (!isDevelopment) {
      globalSuccess = setGlobalData(key, data)
    } else {
      globalSuccess = true // In development, file write is primary
    }

    // Consider it successful if at least one method worked
    const success = fileSuccess || globalSuccess

    if (success) {
      console.log(`✅ Data successfully saved for ${key}`)
    } else {
      console.error(`❌ Failed to save data for ${key}`)
    }

    return success
  } catch (error) {
    console.error(`❌ Error writing data for ${key}:`, error)
    return false
  }
}

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Clear all data
const clearAllData = async () => {
  try {
    console.log("🧹 Starting to clear all data...")

    // Clear JSON files
    const filesClearSuccess = clearAllDataFiles()

    // Clear each data type using writeData to ensure consistency
    const keys = Object.keys(initialData)
    let writeSuccess = true

    for (const key of keys) {
      const success = await writeData(key, [])
      if (!success) {
        writeSuccess = false
      }
    }

    const overallSuccess = filesClearSuccess && writeSuccess

    if (overallSuccess) {
      console.log("✅ All data cleared successfully")
    } else {
      console.error("⚠️ Some data clearing operations failed")
    }

    return overallSuccess
  } catch (error) {
    console.error("❌ Error clearing all data:", error)
    return false
  }
}

// Health check function
const healthCheck = async () => {
  try {
    const results = {}
    const fileStatus = {}

    // Check each data type
    for (const key of Object.keys(initialData)) {
      const data = await readData(key)
      results[key] = {
        count: data.length,
        lastUpdated: data.length > 0 ? data[0].updatedAt || data[0].createdAt : null,
      }

      // Check file existence
      const filePath = FILE_MAP[key]
      fileStatus[key] = {
        exists: fs.existsSync(filePath),
        path: filePath,
      }
    }

    return {
      status: "healthy",
      environment: isDevelopment ? "development" : "production",
      dataStore: isDevelopment ? "file-system-primary" : "global-memory-with-file-backup",
      data: results,
      files: fileStatus,
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

// Initialize on module load
console.log("🚀 Initializing data handler...")
initializeDataFiles()

// Clear all data on startup to ensure fresh start
clearAllDataFiles()
console.log("✨ Data handler initialized with empty data")

module.exports = {
  readData,
  writeData,
  generateId,
  healthCheck,
  clearAllData,
  clearAllDataFiles,
}
