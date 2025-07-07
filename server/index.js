const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration
const corsOptions = {
  origin: [
    "https://anytrip-dashboard-client.vercel.app",
    "https://anytrip-dashboard-ten.vercel.app",
    "http://localhost:3000",
    /\.vercel\.app$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

// Middleware
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.options("*", cors(corsOptions))

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// Import data handler
const { readData, writeData, generateId, healthCheck, clearAllData, memoryStore } = require("./utils/dataHandler")

// Utility function to validate data
const validateAndCleanData = (data, type) => {
  if (!Array.isArray(data)) {
    console.warn(`⚠️ Data for ${type} is not an array, converting...`)
    return []
  }

  return data.map((item) => ({
    ...item,
    id: item.id || generateId(),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }))
}

// Excel Sheets Routes
app.get("/api/excel-sheets", async (req, res) => {
  try {
    console.log("📊 Fetching excel sheets...")
    const sheets = await readData("excelSheets")
    const cleanSheets = validateAndCleanData(sheets, "excelSheets")
    console.log(`✅ Returning ${cleanSheets.length} excel sheets`)
    res.json(cleanSheets)
  } catch (error) {
    console.error("❌ Error fetching excel sheets:", error)
    res.status(500).json({ message: "Error fetching excel sheets", error: error.message })
  }
})

app.get("/api/excel-sheets/:id", async (req, res) => {
  try {
    const sheets = await readData("excelSheets")
    const sheet = sheets.find((s) => s.id === req.params.id)

    if (!sheet) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    res.json(sheet)
  } catch (error) {
    console.error("❌ Error fetching excel sheet:", error)
    res.status(500).json({ message: "Error fetching excel sheet" })
  }
})

app.post("/api/excel-sheets", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log("📊 Creating excel sheet:", { name, category })

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

    // Read current data
    const sheets = await readData("excelSheets")
    console.log(`📖 Current sheets: ${sheets.length}`)

    // Create new sheet
    const newSheet = {
      id: generateId(),
      name: name.trim(),
      description: (description || "").trim(),
      url: url.trim(),
      category: category || "Finance",
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to array
    const updatedSheets = [newSheet, ...sheets]
    console.log(`📝 New total: ${updatedSheets.length}`)

    // Save immediately
    const success = await writeData("excelSheets", updatedSheets)

    if (success) {
      console.log(`✅ Excel sheet saved: ${newSheet.id}`)

      // Verify the save worked by reading back
      const verifySheets = await readData("excelSheets")
      console.log(`🔍 Verification: ${verifySheets.length} sheets in storage`)

      res.status(201).json(newSheet)
    } else {
      console.error("❌ Failed to save excel sheet")
      res.status(500).json({ message: "Error saving excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error creating excel sheet:", error)
    res.status(500).json({ message: "Error creating excel sheet", error: error.message })
  }
})

app.put("/api/excel-sheets/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log(`📊 Updating excel sheet: ${req.params.id}`)

    const sheets = await readData("excelSheets")
    const sheetIndex = sheets.findIndex((s) => s.id === req.params.id)

    if (sheetIndex === -1) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    // Update the sheet
    sheets[sheetIndex] = {
      ...sheets[sheetIndex],
      name: name !== undefined ? name.trim() : sheets[sheetIndex].name,
      description: description !== undefined ? description.trim() : sheets[sheetIndex].description,
      url: url !== undefined ? url.trim() : sheets[sheetIndex].url,
      category: category !== undefined ? category : sheets[sheetIndex].category,
      status: status !== undefined ? status : sheets[sheetIndex].status,
      isPinned: isPinned !== undefined ? isPinned : sheets[sheetIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    // Save immediately
    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log(`✅ Excel sheet updated: ${req.params.id}`)
      res.json(sheets[sheetIndex])
    } else {
      res.status(500).json({ message: "Error updating excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error updating excel sheet:", error)
    res.status(500).json({ message: "Error updating excel sheet", error: error.message })
  }
})

app.delete("/api/excel-sheets/:id", async (req, res) => {
  try {
    console.log(`📊 Deleting excel sheet: ${req.params.id}`)

    const sheets = await readData("excelSheets")
    const sheetToDelete = sheets.find((s) => s.id === req.params.id)

    if (!sheetToDelete) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    const filteredSheets = sheets.filter((s) => s.id !== req.params.id)
    console.log(`🗑️ Removing: ${sheetToDelete.name}`)

    const success = await writeData("excelSheets", filteredSheets)

    if (success) {
      console.log(`✅ Excel sheet deleted: ${req.params.id}`)
      res.json({ message: "Excel sheet deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error deleting excel sheet:", error)
    res.status(500).json({ message: "Error deleting excel sheet", error: error.message })
  }
})

// Website Links Routes
app.get("/api/website-links", async (req, res) => {
  try {
    console.log("🔗 Fetching website links...")
    const links = await readData("websiteLinks")
    const cleanLinks = validateAndCleanData(links, "websiteLinks")
    console.log(`✅ Returning ${cleanLinks.length} website links`)
    res.json(cleanLinks)
  } catch (error) {
    console.error("❌ Error fetching website links:", error)
    res.status(500).json({ message: "Error fetching website links", error: error.message })
  }
})

app.post("/api/website-links", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log("🔗 Creating website link:", { name, category })

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

    const links = await readData("websiteLinks")
    const newLink = {
      id: generateId(),
      name: name.trim(),
      description: (description || "").trim(),
      url: url.trim(),
      category: category || "Finance",
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedLinks = [newLink, ...links]
    const success = await writeData("websiteLinks", updatedLinks)

    if (success) {
      console.log(`✅ Website link saved: ${newLink.id}`)
      res.status(201).json(newLink)
    } else {
      res.status(500).json({ message: "Error saving website link" })
    }
  } catch (error) {
    console.error("❌ Error creating website link:", error)
    res.status(500).json({ message: "Error creating website link", error: error.message })
  }
})

app.put("/api/website-links/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log(`🔗 Updating website link: ${req.params.id}`)

    const links = await readData("websiteLinks")
    const linkIndex = links.findIndex((l) => l.id === req.params.id)

    if (linkIndex === -1) {
      return res.status(404).json({ message: "Website link not found" })
    }

    links[linkIndex] = {
      ...links[linkIndex],
      name: name !== undefined ? name.trim() : links[linkIndex].name,
      description: description !== undefined ? description.trim() : links[linkIndex].description,
      url: url !== undefined ? url.trim() : links[linkIndex].url,
      category: category !== undefined ? category : links[linkIndex].category,
      status: status !== undefined ? status : links[linkIndex].status,
      isPinned: isPinned !== undefined ? isPinned : links[linkIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("websiteLinks", links)

    if (success) {
      console.log(`✅ Website link updated: ${req.params.id}`)
      res.json(links[linkIndex])
    } else {
      res.status(500).json({ message: "Error updating website link" })
    }
  } catch (error) {
    console.error("❌ Error updating website link:", error)
    res.status(500).json({ message: "Error updating website link", error: error.message })
  }
})

app.delete("/api/website-links/:id", async (req, res) => {
  try {
    console.log(`🔗 Deleting website link: ${req.params.id}`)

    const links = await readData("websiteLinks")
    const linkToDelete = links.find((l) => l.id === req.params.id)

    if (!linkToDelete) {
      return res.status(404).json({ message: "Website link not found" })
    }

    const filteredLinks = links.filter((l) => l.id !== req.params.id)
    const success = await writeData("websiteLinks", filteredLinks)

    if (success) {
      console.log(`✅ Website link deleted: ${req.params.id}`)
      res.json({ message: "Website link deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting website link" })
    }
  } catch (error) {
    console.error("❌ Error deleting website link:", error)
    res.status(500).json({ message: "Error deleting website link", error: error.message })
  }
})

// Tasks Routes
app.get("/api/tasks", async (req, res) => {
  try {
    console.log("📋 Fetching tasks...")
    const tasks = await readData("tasks")
    const cleanTasks = validateAndCleanData(tasks, "tasks")
    console.log(`✅ Returning ${cleanTasks.length} tasks`)
    res.json(cleanTasks)
  } catch (error) {
    console.error("❌ Error fetching tasks:", error)
    res.status(500).json({ message: "Error fetching tasks", error: error.message })
  }
})

app.post("/api/tasks", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body
    console.log("📋 Creating task:", { name, category })

    if (!name) {
      return res.status(400).json({ message: "Name is required" })
    }

    const tasks = await readData("tasks")
    const newTask = {
      id: generateId(),
      name: name.trim(),
      description: (description || "").trim(),
      category: category || "Finance",
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate || null,
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTasks = [newTask, ...tasks]
    const success = await writeData("tasks", updatedTasks)

    if (success) {
      console.log(`✅ Task saved: ${newTask.id}`)
      res.status(201).json(newTask)
    } else {
      res.status(500).json({ message: "Error saving task" })
    }
  } catch (error) {
    console.error("❌ Error creating task:", error)
    res.status(500).json({ message: "Error creating task", error: error.message })
  }
})

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body
    console.log(`📋 Updating task: ${req.params.id}`)

    const tasks = await readData("tasks")
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id)

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" })
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      name: name !== undefined ? name.trim() : tasks[taskIndex].name,
      description: description !== undefined ? description.trim() : tasks[taskIndex].description,
      category: category !== undefined ? category : tasks[taskIndex].category,
      status: status !== undefined ? status : tasks[taskIndex].status,
      priority: priority !== undefined ? priority : tasks[taskIndex].priority,
      dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
      isPinned: isPinned !== undefined ? isPinned : tasks[taskIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("tasks", tasks)

    if (success) {
      console.log(`✅ Task updated: ${req.params.id}`)
      res.json(tasks[taskIndex])
    } else {
      res.status(500).json({ message: "Error updating task" })
    }
  } catch (error) {
    console.error("❌ Error updating task:", error)
    res.status(500).json({ message: "Error updating task", error: error.message })
  }
})

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    console.log(`📋 Deleting task: ${req.params.id}`)

    const tasks = await readData("tasks")
    const taskToDelete = tasks.find((t) => t.id === req.params.id)

    if (!taskToDelete) {
      return res.status(404).json({ message: "Task not found" })
    }

    const filteredTasks = tasks.filter((t) => t.id !== req.params.id)
    const success = await writeData("tasks", filteredTasks)

    if (success) {
      console.log(`✅ Task deleted: ${req.params.id}`)
      res.json({ message: "Task deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting task" })
    }
  } catch (error) {
    console.error("❌ Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task", error: error.message })
  }
})

// Debug endpoint to check memory store
app.get("/api/debug", async (req, res) => {
  try {
    const debug = {
      environment: process.env.NODE_ENV || "development",
      isVercel: process.env.VERCEL === "1",
      memoryStore: {
        excelSheets: memoryStore.excelSheets.length,
        websiteLinks: memoryStore.websiteLinks.length,
        tasks: memoryStore.tasks.length,
      },
      timestamp: new Date().toISOString(),
    }

    console.log("🐛 Debug info:", debug)
    res.json(debug)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Clear all data endpoint
app.post("/api/clear-all", async (req, res) => {
  try {
    console.log("🧹 Clearing all data...")
    const success = await clearAllData()
    if (success) {
      res.json({ message: "All data cleared successfully" })
    } else {
      res.status(500).json({ message: "Error clearing data" })
    }
  } catch (error) {
    console.error("❌ Error clearing data:", error)
    res.status(500).json({ message: "Error clearing data", error: error.message })
  }
})

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const healthData = await healthCheck()
    res.json({
      message: "ERP Server is running!",
      timestamp: new Date().toISOString(),
      ...healthData,
    })
  } catch (error) {
    res.status(500).json({
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "ERP API Server - Enhanced Persistence",
    version: "2.2.0",
    environment: process.env.NODE_ENV || "development",
    storage: process.env.NODE_ENV === "production" ? "memory-store" : "file-system",
    endpoints: [
      "GET /api/health",
      "GET /api/debug",
      "GET /api/excel-sheets",
      "POST /api/excel-sheets",
      "PUT /api/excel-sheets/:id",
      "DELETE /api/excel-sheets/:id",
      "GET /api/website-links",
      "POST /api/website-links",
      "PUT /api/website-links/:id",
      "DELETE /api/website-links/:id",
      "GET /api/tasks",
      "POST /api/tasks",
      "PUT /api/tasks/:id",
      "DELETE /api/tasks/:id",
      "POST /api/clear-all",
    ],
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

module.exports = app
