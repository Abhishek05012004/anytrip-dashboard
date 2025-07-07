// Enhanced data handler with better persistence strategy
const fs = require("fs")
const path = require("path")

// Check environment
const isDevelopment = process.env.NODE_ENV !== "production"
const isVercel = process.env.VERCEL === "1"

console.log(`🌍 Environment: ${isDevelopment ? "development" : "production"}`)
console.log(`☁️ Vercel: ${isVercel ? "yes" : "no"}`)

// Data file paths (for development only)
const DATA_DIR = path.join(__dirname, "..", "data")
const FILE_MAP = {
  excelSheets: path.join(DATA_DIR, "excelSheets.json"),
  websiteLinks: path.join(DATA_DIR, "websiteLinks.json"),
  tasks: path.join(DATA_DIR, "tasks.json"),
}

// In-memory storage for production (since Vercel filesystem is read-only)
let memoryStore = {
  excelSheets: [],
  websiteLinks: [],
  tasks: [],
}

// Initialize memory store with some sample data to test persistence
const initializeMemoryStore = () => {
  console.log("🔄 Initializing memory store...")
  memoryStore = {
    excelSheets: [],
    websiteLinks: [],
    tasks: [],
  }
  console.log("✅ Memory store initialized")
}

// Development file operations
const ensureDataDirectory = () => {
  if (isDevelopment && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log("📁 Created data directory:", DATA_DIR)
  }
}

const initializeDataFiles = () => {
  if (!isDevelopment) return

  ensureDataDirectory()
  Object.keys(memoryStore).forEach((key) => {
    const filePath = FILE_MAP[key]
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      console.log(`📄 Initialized ${key}.json`)
    }
  })
}

// Read data function
const readData = async (key) => {
  try {
    if (isDevelopment) {
      // Development: Read from JSON files
      const filePath = FILE_MAP[key]
      if (!filePath) {
        throw new Error(`Unknown data key: ${key}`)
      }

      if (!fs.existsSync(filePath)) {
        console.log(`📄 File ${filePath} doesn't exist, creating...`)
        ensureDataDirectory()
        fs.writeFileSync(filePath, JSON.stringify([], null, 2))
        return []
      }

      const fileContent = fs.readFileSync(filePath, "utf8")
      const data = JSON.parse(fileContent)
      console.log(`📖 Read ${data.length} items from ${key}.json`)
      return data
    } else {
      // Production: Use memory store
      const data = memoryStore[key] || []
      console.log(`📖 Read ${data.length} items from memory store for ${key}`)
      return [...data] // Return a copy to prevent mutations
    }
  } catch (error) {
    console.error(`❌ Error reading data for ${key}:`, error)
    return []
  }
}

// Write data function
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
      console.log(`💾 Wrote ${data.length} items to ${key}.json`)
      return true
    } else {
      // Production: Write to memory store
      memoryStore[key] = [...data] // Store a copy
      console.log(`💾 Wrote ${data.length} items to memory store for ${key}`)

      // Also try to persist to a simple text-based storage if possible
      try {
        if (typeof process !== "undefined" && process.env) {
          // Store as environment variable (limited but works for small data)
          const dataString = JSON.stringify(data)
          if (dataString.length < 32000) {
            // Environment variable size limit
            process.env[`ERP_DATA_${key.toUpperCase()}`] = dataString
            console.log(`💾 Also stored ${key} in environment variable`)
          }
        }
      } catch (envError) {
        console.log(`⚠️ Could not store in environment: ${envError.message}`)
      }

      return true
    }
  } catch (error) {
    console.error(`❌ Error writing data for ${key}:`, error)
    return false
  }
}

// Load data from environment variables on startup (production)
const loadFromEnvironment = () => {
  if (isDevelopment) return

  try {
    Object.keys(memoryStore).forEach((key) => {
      const envKey = `ERP_DATA_${key.toUpperCase()}`
      const envData = process.env[envKey]
      if (envData) {
        try {
          const parsedData = JSON.parse(envData)
          if (Array.isArray(parsedData)) {
            memoryStore[key] = parsedData
            console.log(`🔄 Loaded ${parsedData.length} items for ${key} from environment`)
          }
        } catch (parseError) {
          console.log(`⚠️ Could not parse environment data for ${key}`)
        }
      }
    })
  } catch (error) {
    console.log(`⚠️ Error loading from environment: ${error.message}`)
  }
}

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Clear all data
const clearAllData = async () => {
  try {
    console.log("🧹 Clearing all data...")

    for (const key of Object.keys(memoryStore)) {
      await writeData(key, [])
    }

    console.log("✅ All data cleared successfully")
    return true
  } catch (error) {
    console.error("❌ Error clearing data:", error)
    return false
  }
}

// Health check
const healthCheck = async () => {
  try {
    const results = {}

    for (const key of Object.keys(memoryStore)) {
      const data = await readData(key)
      results[key] = {
        count: data.length,
        lastUpdated: data.length > 0 ? data[0].updatedAt || data[0].createdAt : null,
      }
    }

    return {
      status: "healthy",
      environment: isDevelopment ? "development" : "production",
      storage: isDevelopment ? "file-system" : "memory-store",
      isVercel: isVercel,
      data: results,
      memoryStoreSize: Object.keys(memoryStore).reduce((acc, key) => {
        acc[key] = memoryStore[key].length
        return acc
      }, {}),
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

if (isDevelopment) {
  initializeDataFiles()
  console.log("📁 Development: Using file system storage")
} else {
  initializeMemoryStore()
  loadFromEnvironment()
  console.log("💾 Production: Using memory store")
}

module.exports = {
  readData,
  writeData,
  generateId,
  healthCheck,
  clearAllData,
  memoryStore, // Export for debugging
}
