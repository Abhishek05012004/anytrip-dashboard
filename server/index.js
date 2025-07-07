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

// Import data handler
const { readData, writeData, generateId, healthCheck, clearAllData } = require("./utils/dataHandler")

// Utility function to validate and ensure data consistency
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
    console.log("📊 GET /api/excel-sheets - Fetching excel sheets...")
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
    console.log(`📊 GET /api/excel-sheets/${req.params.id}`)
    const sheets = await readData("excelSheets")
    const sheet = sheets.find((s) => s.id === req.params.id)

    if (!sheet) {
      console.log(`❌ Excel sheet not found: ${req.params.id}`)
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    console.log(`✅ Found excel sheet: ${sheet.name}`)
    res.json(sheet)
  } catch (error) {
    console.error("❌ Error fetching excel sheet:", error)
    res.status(500).json({ message: "Error fetching excel sheet" })
  }
})

app.post("/api/excel-sheets", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log("📊 POST /api/excel-sheets - Creating new excel sheet:", { name, category })

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

    // Read current data
    const sheets = await readData("excelSheets")
    console.log(`📖 Current sheets count: ${sheets.length}`)

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

    // Add to beginning of array
    const updatedSheets = [newSheet, ...sheets]
    console.log(`📝 Adding new sheet. New total: ${updatedSheets.length}`)

    // Save immediately to JSON file
    const success = await writeData("excelSheets", updatedSheets)

    if (success) {
      console.log(`✅ Excel sheet created and saved: ${newSheet.id}`)
      res.status(201).json(newSheet)
    } else {
      console.error("❌ Failed to save excel sheet to file")
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
    console.log(`📊 PUT /api/excel-sheets/${req.params.id} - Updating excel sheet`)

    // Read current data
    const sheets = await readData("excelSheets")
    const sheetIndex = sheets.findIndex((s) => s.id === req.params.id)

    if (sheetIndex === -1) {
      console.log(`❌ Excel sheet not found for update: ${req.params.id}`)
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    console.log(`📝 Updating sheet at index ${sheetIndex}: ${sheets[sheetIndex].name}`)

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

    // Save immediately to JSON file
    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log(`✅ Excel sheet updated and saved: ${req.params.id}`)
      res.json(sheets[sheetIndex])
    } else {
      console.error("❌ Failed to update excel sheet in file")
      res.status(500).json({ message: "Error updating excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error updating excel sheet:", error)
    res.status(500).json({ message: "Error updating excel sheet", error: error.message })
  }
})

app.delete("/api/excel-sheets/:id", async (req, res) => {
  try {
    console.log(`📊 DELETE /api/excel-sheets/${req.params.id} - Deleting excel sheet`)

    // Read current data
    const sheets = await readData("excelSheets")
    const originalLength = sheets.length
    const sheetToDelete = sheets.find((s) => s.id === req.params.id)

    if (!sheetToDelete) {
      console.log(`❌ Excel sheet not found for deletion: ${req.params.id}`)
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    console.log(`🗑️ Deleting sheet: ${sheetToDelete.name}`)

    // Filter out the sheet to delete
    const filteredSheets = sheets.filter((s) => s.id !== req.params.id)
    console.log(`📝 Sheets count: ${originalLength} -> ${filteredSheets.length}`)

    // Save immediately to JSON file
    const success = await writeData("excelSheets", filteredSheets)

    if (success) {
      console.log(`✅ Excel sheet deleted and saved: ${req.params.id}`)
      res.json({ message: "Excel sheet deleted successfully" })
    } else {
      console.error("❌ Failed to delete excel sheet from file")
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
    console.log("🔗 GET /api/website-links - Fetching website links...")
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
    console.log("🔗 POST /api/website-links - Creating new website link:", { name, category })

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
      console.log(`✅ Website link created and saved: ${newLink.id}`)
      res.status(201).json(newLink)
    } else {
      console.error("❌ Failed to save website link")
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
    console.log(`🔗 PUT /api/website-links/${req.params.id} - Updating website link`)

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
      console.log(`✅ Website link updated and saved: ${req.params.id}`)
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
    console.log(`🔗 DELETE /api/website-links/${req.params.id} - Deleting website link`)

    const links = await readData("websiteLinks")
    const linkToDelete = links.find((l) => l.id === req.params.id)

    if (!linkToDelete) {
      return res.status(404).json({ message: "Website link not found" })
    }

    console.log(`🗑️ Deleting link: ${linkToDelete.name}`)
    const filteredLinks = links.filter((l) => l.id !== req.params.id)

    const success = await writeData("websiteLinks", filteredLinks)

    if (success) {
      console.log(`✅ Website link deleted and saved: ${req.params.id}`)
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
    console.log("📋 GET /api/tasks - Fetching tasks...")
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
    console.log("📋 POST /api/tasks - Creating new task:", { name, category })

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
      console.log(`✅ Task created and saved: ${newTask.id}`)
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
    console.log(`📋 PUT /api/tasks/${req.params.id} - Updating task`)

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
      console.log(`✅ Task updated and saved: ${req.params.id}`)
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
    console.log(`📋 DELETE /api/tasks/${req.params.id} - Deleting task`)

    const tasks = await readData("tasks")
    const taskToDelete = tasks.find((t) => t.id === req.params.id)

    if (!taskToDelete) {
      return res.status(404).json({ message: "Task not found" })
    }

    console.log(`🗑️ Deleting task: ${taskToDelete.name}`)
    const filteredTasks = tasks.filter((t) => t.id !== req.params.id)

    const success = await writeData("tasks", filteredTasks)

    if (success) {
      console.log(`✅ Task deleted and saved: ${req.params.id}`)
      res.json({ message: "Task deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting task" })
    }
  } catch (error) {
    console.error("❌ Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task", error: error.message })
  }
})

// Clear all data endpoint
app.post("/api/clear-all", async (req, res) => {
  try {
    console.log("🧹 POST /api/clear-all - Clearing all data...")
    const success = await clearAllData()
    if (success) {
      console.log("✅ All data cleared successfully")
      res.json({
        message: "All data cleared successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      console.error("❌ Failed to clear all data")
      res.status(500).json({ message: "Error clearing data" })
    }
  } catch (error) {
    console.error("❌ Error clearing data:", error)
    res.status(500).json({ message: "Error clearing data", error: error.message })
  }
})

// Health check route
app.get("/api/health", async (req, res) => {
  console.log("🏥 GET /api/health - Health check requested")
  try {
    const healthData = await healthCheck()
    res.json({
      message: "ERP Server is running successfully!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      server: "https://anytrip-dashboard-ten.vercel.app",
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
    message: "ERP API Server - Fresh Start",
    version: "2.1.0",
    server: "https://anytrip-dashboard-ten.vercel.app",
    status: "All data cleared - Starting fresh",
    endpoints: [
      "GET /",
      "GET /api/health",
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
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`📁 Data will be saved to JSON files in development mode`)
  })
}

module.exports = app
