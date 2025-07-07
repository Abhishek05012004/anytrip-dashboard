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

// Utility function to ensure data consistency
const ensureDataConsistency = async (data, type) => {
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
    const consistentSheets = await ensureDataConsistency(sheets, "excelSheets")
    console.log(`✅ Found ${consistentSheets.length} excel sheets`)
    res.json(consistentSheets)
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
    console.error("Error fetching excel sheet:", error)
    res.status(500).json({ message: "Error fetching excel sheet" })
  }
})

app.post("/api/excel-sheets", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

    console.log("📝 Creating new excel sheet:", { name, category })

    // Get current data
    const sheets = await readData("excelSheets")

    const newSheet = {
      id: generateId(),
      name,
      description: description || "",
      url,
      category: category || "Finance",
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to beginning of array
    const updatedSheets = [newSheet, ...sheets]

    // Save immediately
    const success = await writeData("excelSheets", updatedSheets)

    if (success) {
      console.log("✅ Excel sheet created and saved:", newSheet.id)
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
    console.log(`📝 Updating excel sheet ${req.params.id}`)

    const sheets = await readData("excelSheets")
    const sheetIndex = sheets.findIndex((s) => s.id === req.params.id)

    if (sheetIndex === -1) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    // Update the sheet
    sheets[sheetIndex] = {
      ...sheets[sheetIndex],
      name: name !== undefined ? name : sheets[sheetIndex].name,
      description: description !== undefined ? description : sheets[sheetIndex].description,
      url: url !== undefined ? url : sheets[sheetIndex].url,
      category: category !== undefined ? category : sheets[sheetIndex].category,
      status: status !== undefined ? status : sheets[sheetIndex].status,
      isPinned: isPinned !== undefined ? isPinned : sheets[sheetIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    // Save immediately
    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log("✅ Excel sheet updated:", req.params.id)
      res.json(sheets[sheetIndex])
    } else {
      console.error("❌ Failed to update excel sheet")
      res.status(500).json({ message: "Error updating excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error updating excel sheet:", error)
    res.status(500).json({ message: "Error updating excel sheet", error: error.message })
  }
})

app.delete("/api/excel-sheets/:id", async (req, res) => {
  try {
    console.log(`🗑️ Deleting excel sheet ${req.params.id}`)

    const sheets = await readData("excelSheets")
    const originalLength = sheets.length
    const filteredSheets = sheets.filter((s) => s.id !== req.params.id)

    if (originalLength === filteredSheets.length) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    // Save immediately
    const success = await writeData("excelSheets", filteredSheets)

    if (success) {
      console.log("✅ Excel sheet deleted:", req.params.id)
      res.json({ message: "Excel sheet deleted successfully" })
    } else {
      console.error("❌ Failed to delete excel sheet")
      res.status(500).json({ message: "Error deleting excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error deleting excel sheet:", error)
    res.status(500).json({ message: "Error deleting excel sheet", error: error.message })
  }
})

// Website Links Routes (similar pattern)
app.get("/api/website-links", async (req, res) => {
  try {
    console.log("🔗 Fetching website links...")
    const links = await readData("websiteLinks")
    const consistentLinks = await ensureDataConsistency(links, "websiteLinks")
    console.log(`✅ Found ${consistentLinks.length} website links`)
    res.json(consistentLinks)
  } catch (error) {
    console.error("❌ Error fetching website links:", error)
    res.status(500).json({ message: "Error fetching website links", error: error.message })
  }
})

app.post("/api/website-links", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

    console.log("📝 Creating new website link:", { name, category })

    const links = await readData("websiteLinks")
    const newLink = {
      id: generateId(),
      name,
      description: description || "",
      url,
      category: category || "Finance",
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedLinks = [newLink, ...links]
    const success = await writeData("websiteLinks", updatedLinks)

    if (success) {
      console.log("✅ Website link created:", newLink.id)
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
    console.log(`📝 Updating website link ${req.params.id}`)

    const links = await readData("websiteLinks")
    const linkIndex = links.findIndex((l) => l.id === req.params.id)

    if (linkIndex === -1) {
      return res.status(404).json({ message: "Website link not found" })
    }

    links[linkIndex] = {
      ...links[linkIndex],
      name: name !== undefined ? name : links[linkIndex].name,
      description: description !== undefined ? description : links[linkIndex].description,
      url: url !== undefined ? url : links[linkIndex].url,
      category: category !== undefined ? category : links[linkIndex].category,
      status: status !== undefined ? status : links[linkIndex].status,
      isPinned: isPinned !== undefined ? isPinned : links[linkIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("websiteLinks", links)

    if (success) {
      console.log("✅ Website link updated:", req.params.id)
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
    console.log(`🗑️ Deleting website link ${req.params.id}`)

    const links = await readData("websiteLinks")
    const filteredLinks = links.filter((l) => l.id !== req.params.id)

    if (links.length === filteredLinks.length) {
      return res.status(404).json({ message: "Website link not found" })
    }

    const success = await writeData("websiteLinks", filteredLinks)

    if (success) {
      console.log("✅ Website link deleted:", req.params.id)
      res.json({ message: "Website link deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting website link" })
    }
  } catch (error) {
    console.error("❌ Error deleting website link:", error)
    res.status(500).json({ message: "Error deleting website link", error: error.message })
  }
})

// Tasks Routes (similar pattern)
app.get("/api/tasks", async (req, res) => {
  try {
    console.log("📋 Fetching tasks...")
    const tasks = await readData("tasks")
    const consistentTasks = await ensureDataConsistency(tasks, "tasks")
    console.log(`✅ Found ${consistentTasks.length} tasks`)
    res.json(consistentTasks)
  } catch (error) {
    console.error("❌ Error fetching tasks:", error)
    res.status(500).json({ message: "Error fetching tasks", error: error.message })
  }
})

app.post("/api/tasks", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body

    if (!name) {
      return res.status(400).json({ message: "Name is required" })
    }

    console.log("📝 Creating new task:", { name, category })

    const tasks = await readData("tasks")
    const newTask = {
      id: generateId(),
      name,
      description: description || "",
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
      console.log("✅ Task created:", newTask.id)
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
    console.log(`📝 Updating task ${req.params.id}`)

    const tasks = await readData("tasks")
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id)

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" })
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      name: name !== undefined ? name : tasks[taskIndex].name,
      description: description !== undefined ? description : tasks[taskIndex].description,
      category: category !== undefined ? category : tasks[taskIndex].category,
      status: status !== undefined ? status : tasks[taskIndex].status,
      priority: priority !== undefined ? priority : tasks[taskIndex].priority,
      dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
      isPinned: isPinned !== undefined ? isPinned : tasks[taskIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("tasks", tasks)

    if (success) {
      console.log("✅ Task updated:", req.params.id)
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
    console.log(`🗑️ Deleting task ${req.params.id}`)

    const tasks = await readData("tasks")
    const filteredTasks = tasks.filter((t) => t.id !== req.params.id)

    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ message: "Task not found" })
    }

    const success = await writeData("tasks", filteredTasks)

    if (success) {
      console.log("✅ Task deleted:", req.params.id)
      res.json({ message: "Task deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting task" })
    }
  } catch (error) {
    console.error("❌ Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task", error: error.message })
  }
})

// Clear all data endpoint (for testing)
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

// Enhanced health check route
app.get("/api/health", async (req, res) => {
  console.log("🏥 Health check requested")
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
    message: "ERP API Server",
    version: "2.0.0",
    server: "https://anytrip-dashboard-ten.vercel.app",
    endpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/excel-sheets",
      "GET /api/website-links",
      "GET /api/tasks",
      "POST /api/clear-all",
    ],
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
  })
}

module.exports = app
