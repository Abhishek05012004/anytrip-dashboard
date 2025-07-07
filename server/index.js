const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration for production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://your-client-domain.vercel.app", // Will update this after client deployment
          "https://*.vercel.app", // Allow all Vercel preview deployments
        ]
      : "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Import data handler
const { readData, writeData, generateId } = require("./utils/dataHandler")

// Excel Sheets Routes
app.get("/api/excel-sheets", async (req, res) => {
  try {
    const sheets = await readData("excelSheets")
    res.json(sheets)
  } catch (error) {
    console.error("Error fetching excel sheets:", error)
    res.status(500).json({ message: "Error fetching excel sheets" })
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
      console.log("✅ Excel sheet created and saved")
      res.status(201).json(newSheet)
    } else {
      res.status(500).json({ message: "Error saving excel sheet" })
    }
  } catch (error) {
    console.error("Error creating excel sheet:", error)
    res.status(500).json({ message: "Error saving excel sheet" })
  }
})

app.put("/api/excel-sheets/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    const sheets = await readData("excelSheets")
    const sheetIndex = sheets.findIndex((s) => s.id === req.params.id)

    if (sheetIndex === -1) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    sheets[sheetIndex] = {
      ...sheets[sheetIndex],
      name: name || sheets[sheetIndex].name,
      description: description !== undefined ? description : sheets[sheetIndex].description,
      url: url || sheets[sheetIndex].url,
      category: category || sheets[sheetIndex].category,
      status: status || sheets[sheetIndex].status,
      isPinned: isPinned !== undefined ? isPinned : sheets[sheetIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("excelSheets", sheets)

    if (success) {
      console.log("✅ Excel sheet updated and saved")
      res.json(sheets[sheetIndex])
    } else {
      res.status(500).json({ message: "Error updating excel sheet" })
    }
  } catch (error) {
    console.error("Error updating excel sheet:", error)
    res.status(500).json({ message: "Error updating excel sheet" })
  }
})

app.delete("/api/excel-sheets/:id", async (req, res) => {
  try {
    const sheets = await readData("excelSheets")
    const filteredSheets = sheets.filter((s) => s.id !== req.params.id)

    if (sheets.length === filteredSheets.length) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    const success = await writeData("excelSheets", filteredSheets)

    if (success) {
      console.log("✅ Excel sheet deleted")
      res.json({ message: "Excel sheet deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting excel sheet" })
    }
  } catch (error) {
    console.error("Error deleting excel sheet:", error)
    res.status(500).json({ message: "Error deleting excel sheet" })
  }
})

// Website Links Routes
app.get("/api/website-links", async (req, res) => {
  try {
    const links = await readData("websiteLinks")
    res.json(links)
  } catch (error) {
    console.error("Error fetching website links:", error)
    res.status(500).json({ message: "Error fetching website links" })
  }
})

app.get("/api/website-links/:id", async (req, res) => {
  try {
    const links = await readData("websiteLinks")
    const link = links.find((l) => l.id === req.params.id)

    if (!link) {
      return res.status(404).json({ message: "Website link not found" })
    }

    res.json(link)
  } catch (error) {
    console.error("Error fetching website link:", error)
    res.status(500).json({ message: "Error fetching website link" })
  }
})

app.post("/api/website-links", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body

    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" })
    }

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
      console.log("✅ Website link created and saved")
      res.status(201).json(newLink)
    } else {
      res.status(500).json({ message: "Error saving website link" })
    }
  } catch (error) {
    console.error("Error creating website link:", error)
    res.status(500).json({ message: "Error saving website link" })
  }
})

app.put("/api/website-links/:id", async (req, res) => {
  try {
    const { name, description, url, category, status, isPinned } = req.body
    const links = await readData("websiteLinks")
    const linkIndex = links.findIndex((l) => l.id === req.params.id)

    if (linkIndex === -1) {
      return res.status(404).json({ message: "Website link not found" })
    }

    links[linkIndex] = {
      ...links[linkIndex],
      name: name || links[linkIndex].name,
      description: description !== undefined ? description : links[linkIndex].description,
      url: url || links[linkIndex].url,
      category: category || links[linkIndex].category,
      status: status || links[linkIndex].status,
      isPinned: isPinned !== undefined ? isPinned : links[linkIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("websiteLinks", links)

    if (success) {
      console.log("✅ Website link updated and saved")
      res.json(links[linkIndex])
    } else {
      res.status(500).json({ message: "Error updating website link" })
    }
  } catch (error) {
    console.error("Error updating website link:", error)
    res.status(500).json({ message: "Error updating website link" })
  }
})

app.delete("/api/website-links/:id", async (req, res) => {
  try {
    const links = await readData("websiteLinks")
    const filteredLinks = links.filter((l) => l.id !== req.params.id)

    if (links.length === filteredLinks.length) {
      return res.status(404).json({ message: "Website link not found" })
    }

    const success = await writeData("websiteLinks", filteredLinks)

    if (success) {
      console.log("✅ Website link deleted")
      res.json({ message: "Website link deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting website link" })
    }
  } catch (error) {
    console.error("Error deleting website link:", error)
    res.status(500).json({ message: "Error deleting website link" })
  }
})

// Tasks Routes
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await readData("tasks")
    res.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ message: "Error fetching tasks" })
  }
})

app.get("/api/tasks/:id", async (req, res) => {
  try {
    const tasks = await readData("tasks")
    const task = tasks.find((t) => t.id === req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ message: "Error fetching task" })
  }
})

app.post("/api/tasks", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body

    if (!name) {
      return res.status(400).json({ message: "Name is required" })
    }

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
      console.log("✅ Task created and saved")
      res.status(201).json(newTask)
    } else {
      res.status(500).json({ message: "Error saving task" })
    }
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ message: "Error saving task" })
  }
})

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { name, description, category, status, priority, dueDate, isPinned } = req.body
    const tasks = await readData("tasks")
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id)

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" })
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      name: name || tasks[taskIndex].name,
      description: description !== undefined ? description : tasks[taskIndex].description,
      category: category || tasks[taskIndex].category,
      status: status || tasks[taskIndex].status,
      priority: priority || tasks[taskIndex].priority,
      dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
      isPinned: isPinned !== undefined ? isPinned : tasks[taskIndex].isPinned,
      updatedAt: new Date().toISOString(),
    }

    const success = await writeData("tasks", tasks)

    if (success) {
      console.log("✅ Task updated and saved")
      res.json(tasks[taskIndex])
    } else {
      res.status(500).json({ message: "Error updating task" })
    }
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ message: "Error updating task" })
  }
})

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const tasks = await readData("tasks")
    const filteredTasks = tasks.filter((t) => t.id !== req.params.id)

    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ message: "Task not found" })
    }

    const success = await writeData("tasks", filteredTasks)

    if (success) {
      console.log("✅ Task deleted")
      res.json({ message: "Task deleted successfully" })
    } else {
      res.status(500).json({ message: "Error deleting task" })
    }
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ message: "Error deleting task" })
  }
})

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "ERP Server is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "ERP API Server",
    version: "1.0.0",
    endpoints: ["GET /api/health", "GET /api/excel-sheets", "GET /api/website-links", "GET /api/tasks"],
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
