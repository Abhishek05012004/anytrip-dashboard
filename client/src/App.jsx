"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import ExcelGrid from "./components/ExcelGrid"
import WebsiteLinks from "./components/WebsiteLinks"
import TaskGrid from "./components/TaskGrid"
import ItemDetail from "./components/ItemDetail"
import AddItemModal from "./components/AddItemModal"
import { ToastContainer } from "./components/Toast"
import { apiService } from "./services/apiService"
import "./App.css"

function App() {
  const [currentPath, setCurrentPath] = useState("/dashboard")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [excelSheets, setExcelSheets] = useState([])
  const [websiteLinks, setWebsiteLinks] = useState([])
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState(["Finance", "HR", "Inventory", "Sales", "Reports", "Marketing"])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toasts, setToasts] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load data from server on component mount
  useEffect(() => {
    loadData()
  }, [])

  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    setToasts((prev) => [...prev, toast])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [sheetsData, linksData, tasksData] = await Promise.all([
        apiService.getExcelSheets(),
        apiService.getWebsiteLinks(),
        apiService.getTasks(),
      ])

      setExcelSheets(sheetsData)
      setWebsiteLinks(linksData)
      setTasks(tasksData)
      setError(null)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please try again.")
      showToast("Failed to load data", "error")
    } finally {
      setLoading(false)
    }
  }

  const navigate = (path) => {
    setCurrentPath(path)
    setIsSidebarOpen(false)
    // Clear search when navigating
    setSearchTerm("")
    setSelectedCategory("all")
  }

  const goBack = () => {
    if (currentPath.includes("/sheets/")) {
      navigate("/excel")
    } else if (currentPath.includes("/tasks/")) {
      navigate("/tasks")
    } else {
      navigate("/dashboard")
    }
  }

  const addExcelSheet = async (sheetData) => {
    try {
      const newSheet = await apiService.createExcelSheet({
        ...sheetData,
        isPinned: false,
      })
      setExcelSheets([newSheet, ...excelSheets])
      setIsModalOpen(false)
      showToast("Google Sheet added successfully!", "success")
    } catch (error) {
      console.error("Error adding excel sheet:", error)
      showToast("Failed to add Google Sheet", "error")
    }
  }

  const addWebsiteLink = async (linkData) => {
    try {
      const newLink = await apiService.createWebsiteLink({
        ...linkData,
        isPinned: false,
      })
      setWebsiteLinks([newLink, ...websiteLinks])
      setIsModalOpen(false)
      showToast("Website link added successfully!", "success")
    } catch (error) {
      console.error("Error adding website link:", error)
      showToast("Failed to add website link", "error")
    }
  }

  const addTask = async (taskData) => {
    try {
      const newTask = await apiService.createTask({
        ...taskData,
        isPinned: false,
      })
      setTasks([newTask, ...tasks])
      setIsModalOpen(false)
      showToast("Task added successfully!", "success")
    } catch (error) {
      console.error("Error adding task:", error)
      showToast("Failed to add task", "error")
    }
  }

  const deleteItem = async (id, type) => {
    try {
      if (type === "excel") {
        await apiService.deleteExcelSheet(id)
        setExcelSheets(excelSheets.filter((sheet) => sheet.id !== id))
        showToast("Google Sheet deleted successfully!", "success")
      } else if (type === "websites") {
        await apiService.deleteWebsiteLink(id)
        setWebsiteLinks(websiteLinks.filter((link) => link.id !== id))
        showToast("Website link deleted successfully!", "success")
      } else if (type === "tasks") {
        await apiService.deleteTask(id)
        setTasks(tasks.filter((task) => task.id !== id))
        showToast("Task deleted successfully!", "success")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast("Failed to delete item", "error")
    }
  }

  const editItem = async (id, updatedData, type) => {
    try {
      if (type === "excel") {
        const updatedSheet = await apiService.updateExcelSheet(id, updatedData)
        setExcelSheets(excelSheets.map((sheet) => (sheet.id === id ? updatedSheet : sheet)))
        showToast("Google Sheet updated successfully!", "success")
      } else if (type === "websites") {
        const updatedLink = await apiService.updateWebsiteLink(id, updatedData)
        setWebsiteLinks(websiteLinks.map((link) => (link.id === id ? updatedLink : link)))
        showToast("Website link updated successfully!", "success")
      } else if (type === "tasks") {
        const updatedTask = await apiService.updateTask(id, updatedData)
        setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)))
        showToast("Task updated successfully!", "success")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      showToast("Failed to update item", "error")
    }
  }

  const togglePin = async (id, type) => {
    try {
      if (type === "excel") {
        const sheet = excelSheets.find((s) => s.id === id)
        const updatedSheet = await apiService.updateExcelSheet(id, { ...sheet, isPinned: !sheet.isPinned })
        setExcelSheets(excelSheets.map((s) => (s.id === id ? updatedSheet : s)))
        showToast(`Google Sheet ${updatedSheet.isPinned ? "pinned" : "unpinned"}!`, "success")
      } else if (type === "websites") {
        const link = websiteLinks.find((l) => l.id === id)
        const updatedLink = await apiService.updateWebsiteLink(id, { ...link, isPinned: !link.isPinned })
        setWebsiteLinks(websiteLinks.map((l) => (l.id === id ? updatedLink : l)))
        showToast(`Website link ${updatedLink.isPinned ? "pinned" : "unpinned"}!`, "success")
      } else if (type === "tasks") {
        const task = tasks.find((t) => t.id === id)
        const updatedTask = await apiService.updateTask(id, { ...task, isPinned: !task.isPinned })
        setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)))
        showToast(`Task ${updatedTask.isPinned ? "pinned" : "unpinned"}!`, "success")
      }
    } catch (error) {
      console.error("Error toggling pin:", error)
      showToast("Failed to update pin status", "error")
    }
  }

  // Enhanced search functionality
  const filteredExcelSheets = excelSheets.filter((sheet) => {
    const matchesCategory = selectedCategory === "all" || sheet.category === selectedCategory
    const matchesSearch =
      sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredWebsiteLinks = websiteLinks.filter((link) => {
    const matchesCategory = selectedCategory === "all" || link.category === selectedCategory
    const matchesSearch =
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getActiveTab = () => {
    if (currentPath === "/dashboard") return "dashboard"
    if (currentPath === "/excel" || currentPath.startsWith("/sheets/")) return "excel"
    if (currentPath === "/tasks" || currentPath.startsWith("/tasks/")) return "tasks"
    if (currentPath === "/websites") return "websites"
    return "dashboard"
  }

  const getCurrentItem = () => {
    if (currentPath.startsWith("/sheets/")) {
      const id = currentPath.split("/")[2]
      return excelSheets.find((sheet) => sheet.id === id)
    }
    if (currentPath.startsWith("/tasks/")) {
      const id = currentPath.split("/")[2]
      return tasks.find((task) => task.id === id)
    }
    return null
  }

  const getCurrentItemType = () => {
    if (currentPath.startsWith("/sheets/")) return "sheet"
    if (currentPath.startsWith("/tasks/")) return "task"
    return null
  }

  const renderContent = () => {
    if (currentPath.startsWith("/sheets/") || currentPath.startsWith("/tasks/")) {
      return (
        <ItemDetail
          item={getCurrentItem()}
          type={getCurrentItemType()}
          onBack={goBack}
          onEdit={(id, data) => editItem(id, data, getCurrentItemType() === "sheet" ? "excel" : "tasks")}
          onDelete={(id) => deleteItem(id, getCurrentItemType() === "sheet" ? "excel" : "tasks")}
          onTogglePin={togglePin}
        />
      )
    }

    switch (currentPath) {
      case "/dashboard":
        return (
          <Dashboard
            excelSheets={excelSheets}
            websiteLinks={websiteLinks}
            tasks={tasks}
            onTogglePin={togglePin}
            onNavigate={navigate}
          />
        )
      case "/excel":
        return (
          <ExcelGrid
            sheets={filteredExcelSheets}
            onDelete={(id) => deleteItem(id, "excel")}
            onEdit={(id, data) => editItem(id, data, "excel")}
            onTogglePin={togglePin}
            onItemClick={(id) => navigate(`/sheets/${id}`)}
          />
        )
      case "/websites":
        return (
          <WebsiteLinks
            links={filteredWebsiteLinks}
            onDelete={(id) => deleteItem(id, "websites")}
            onEdit={(id, data) => editItem(id, data, "websites")}
            onTogglePin={togglePin}
          />
        )
      case "/tasks":
        return (
          <TaskGrid
            tasks={filteredTasks}
            onDelete={(id) => deleteItem(id, "tasks")}
            onEdit={(id, data) => editItem(id, data, "tasks")}
            onTogglePin={togglePin}
            onItemClick={(id) => navigate(`/tasks/${id}`)}
          />
        )
      default:
        return (
          <Dashboard
            excelSheets={excelSheets}
            websiteLinks={websiteLinks}
            tasks={tasks}
            onTogglePin={togglePin}
            onNavigate={navigate}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        activeTab={getActiveTab()}
        setActiveTab={(tab) => {
          if (tab === "dashboard") navigate("/dashboard")
          else if (tab === "excel") navigate("/excel")
          else if (tab === "tasks") navigate("/tasks")
          else if (tab === "websites") navigate("/websites")
        }}
        excelCount={excelSheets.length}
        websiteCount={websiteLinks.length}
        taskCount={tasks.length}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`main-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddNew={() => setIsModalOpen(true)}
          activeTab={getActiveTab()}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentPath={currentPath}
          onBack={goBack}
        />

        <main className="main-content">{renderContent()}</main>
      </div>

      {isModalOpen && (
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddExcel={addExcelSheet}
          onAddWebsite={addWebsiteLink}
          onAddTask={addTask}
          categories={categories}
          activeTab={getActiveTab() === "dashboard" ? "excel" : getActiveTab()}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
