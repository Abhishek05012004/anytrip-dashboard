const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration - Updated with your client domain
const corsOptions = {
  origin: [
    "https://anytrip-dashboard-client.vercel.app",
    "https://anytrip-dashboard-ten.vercel.app",
    "http://localhost:3000",
    /\.vercel\.app$/, // Allow all vercel preview deployments
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

// Add preflight handling
app.options("*", cors(corsOptions))

// Import data handler
const { readData, writeData, generateId, healthCheck } = require("./utils/dataHandler")

// Excel Sheets Routes
app.get("/api/excel-sheets", async (req, res) => {
  try {
    console.log("📊 Fetching excel sheets...")
    const sheets = await readData("excelSheets")
    console.log(`✅ Found ${sheets.length} excel sheets`)
    res.json(sheets)
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

    console.log("📝 Creating new excel sheet:", { name, category, status })
    const sheets = await readData("excelSheets")
    const newSheet = {
      id: generateId(),
      name,
      description: description || "",
      url,
      category,
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    sheets.unshift(newSheet)
    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log("✅ Excel sheet created and saved:", newSheet.id)
      res.status(201).json(newSheet)
    } else {
      console.error("❌ Failed to save excel sheet")
      res.status(500).json({ message: "Error saving excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error creating excel sheet:", error)
    res.status(500).json({ message: "Error saving excel sheet" })
  }
})

app.put("/api/excel-sheets/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log(`📝 Updating excel sheet ${req.params.id}:`, { name, category, status, isPinned })

    const sheets = await readData("excelSheets")
    const sheetIndex = sheets.findIndex((s) => s.id === req.params.id)

    if (sheetIndex === -1) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    const originalSheet = sheets[sheetIndex]
    sheets[sheetIndex] = {
      ...originalSheet,
      name: name !== undefined ? name : originalSheet.name,
      description: description !== undefined ? description : originalSheet.description,
      url: url !== undefined ? url : originalSheet.url,
      category: category !== undefined ? category : originalSheet.category,
      status: status !== undefined ? status : originalSheet.status,
      isPinned: isPinned !== undefined ? isPinned : originalSheet.isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log("✅ Excel sheet updated and saved:", req.params.id)
      res.json(sheets[sheetIndex])
    } else {
      console.error("❌ Failed to update excel sheet")
      res.status(500).json({ message: "Error updating excel sheet" })
    }
  } catch (error) {
    console.error("❌ Error updating excel sheet:", error)
    res.status(500).json({ message: "Error updating excel sheet" })
  }
})

app.delete("/api/excel-sheets/:id", async (req, res) => {
  try {
    console.log(`🗑️ Deleting excel sheet ${req.params.id}`)
    const sheets = await readData("excelSheets")
    const originalLength = sheets.length
    const filteredSheets = sheets.filter((s) => s.id !== req.params.id)

    if (sheets.length === filteredSheets.length) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

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
    res.status(500).json({ message: "Error deleting excel sheet" })
  }
})

// Website Links Routes
app.get("/api/website-links", async (req, res) => {
  try {
    console.log("🔗 Fetching website links...")
    const links = await readData("websiteLinks")
    console.log(`✅ Found ${links.length} website links`)
    res.json(links)
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

    console.log("📝 Creating new website link:", { name, category, status })
    const links = await readData("websiteLinks")
    const newLink = {
      id: generateId(),
      name,
      description: description || "",
      url,
      category,
      status: status || "pending",
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    links.unshift(newLink)
    const success = await writeData("websiteLinks", links)

    if (success) {
      console.log("✅ Website link created and saved:", newLink.id)
      res.status(201).json(newLink)
    } else {
      console.error("❌ Failed to save website link")
      res.status(500).json({ message: "Error saving website link" })
    }
  } catch (error) {
    console.error("❌ Error creating website link:", error)
    res.status(500).json({ message: "Error saving website link" })
  }
})

app.put("/api/website-links/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    console.log(`📝 Updating website link ${req.params.id}:`, { name, category, status, isPinned })

    const links = await readData("websiteLinks")
    const linkIndex = links.findIndex((l) => l.id === req.params.id)

    if (linkIndex === -1) {
      return res.status(404).json({ message: "Website link not found" })
    }

    const originalLink = links[linkIndex]
    links[linkIndex] = {
      ...originalLink,
      name: name !== undefined ? name : originalLink.name,
      description: description !== undefined ? description : originalLink.description,
      url: url !== undefined ? url : originalLink.url,
      category: category !== undefined ? category : originalLink.category,
      status: status !== undefined ? status : originalLink.status,
      isPinned: isPinned !== undefined ? isPinned : originalLink.isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("websiteLinks", links)

    if (success) {
      console.log("✅ Website link updated and saved:", req.params.id)
      res.json(links[linkIndex])
    } else {
      console.error("❌ Failed to update website link")
      res.status(500).json({ message: "Error updating website link" })
    }
  } catch (error) {
    console.error("❌ Error updating website link:", error)
    res.status(500).json({ message: "Error updating website link" })
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
      console.error("❌ Failed to delete website link")
      res.status(500).json({ message: "Error deleting website link" })
    }
  } catch (error) {
    console.error("❌ Error deleting website link:", error)
    res.status(500).json({ message: "Error deleting website link" })
  }
})

// Tasks Routes
app.get("/api/tasks", async (req, res) => {
  try {
    console.log("📋 Fetching tasks...")
    const tasks = await readData("tasks")
    console.log(`✅ Found ${tasks.length} tasks`)
    res.json(tasks)
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

    console.log("📝 Creating new task:", { name, category, status, priority })
    const tasks = await readData("tasks")
    const newTask = {
      id: generateId(),
      name,
      description: description || "",
      category,
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate || null,
      isPinned: isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    tasks.unshift(newTask)
    const success = await writeData("tasks", tasks)

    if (success) {
      console.log("✅ Task created and saved:", newTask.id)
      res.status(201).json(newTask)
    } else {
      console.error("❌ Failed to save task")
      res.status(500).json({ message: "Error saving task" })
    }
  } catch (error) {
    console.error("❌ Error creating task:", error)
    res.status(500).json({ message: "Error saving task" })
  }
})

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body
    console.log(`📝 Updating task ${req.params.id}:`, { name, category, status, priority, isPinned })

    const tasks = await readData("tasks")
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id)

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" })
    }

    const originalTask = tasks[taskIndex]
    tasks[taskIndex] = {
      ...originalTask,
      name: name !== undefined ? name : originalTask.name,
      description: description !== undefined ? description : originalTask.description,
      category: category !== undefined ? category : originalTask.category,
      status: status !== undefined ? status : originalTask.status,
      priority: priority !== undefined ? priority : originalTask.priority,
      dueDate: dueDate !== undefined ? dueDate : originalTask.dueDate,
      isPinned: isPinned !== undefined ? isPinned : originalTask.isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("tasks", tasks)

    if (success) {
      console.log("✅ Task updated and saved:", req.params.id)
      res.json(tasks[taskIndex])
    } else {
      console.error("❌ Failed to update task")
      res.status(500).json({ message: "Error updating task" })
    }
  } catch (error) {
    console.error("❌ Error updating task:", error)
    res.status(500).json({ message: "Error updating task" })
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
      console.error("❌ Failed to delete task")
      res.status(500).json({ message: "Error deleting task" })
    }
  } catch (error) {
    console.error("❌ Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task" })
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
    version: "1.0.0",
    server: "https://anytrip-dashboard-ten.vercel.app",
    endpoints: ["GET /", "GET /api/health", "GET /api/excel-sheets", "GET /api/website-links", "GET /api/tasks"],
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
  })
}

// Export for Vercel
module.exports = app
