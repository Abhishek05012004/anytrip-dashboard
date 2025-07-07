"use client"

import { useState, useEffect } from "react"
import "./Dashboard.css"

const Dashboard = ({ excelSheets, websiteLinks, tasks, onTogglePin, onNavigate }) => {
  const [stats, setStats] = useState({
    totalSheets: 0,
    totalLinks: 0,
    totalTasks: 0,
    recentActivity: 0,
    categories: {},
  })
  const [pinnedFilter, setPinnedFilter] = useState("all")

  useEffect(() => {
    const categoryCount = {}
    const allItems = [...excelSheets, ...websiteLinks, ...tasks]

    allItems.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    })

    setStats({
      totalSheets: excelSheets.length,
      totalLinks: websiteLinks.length,
      totalTasks: tasks.length,
      recentActivity: allItems.filter((item) => {
        const itemDate = new Date(item.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return itemDate > weekAgo
      }).length,
      categories: categoryCount,
    })
  }, [excelSheets, websiteLinks, tasks])

  // Get pinned items from each category separately
  const pinnedSheets = excelSheets.filter((item) => item.isPinned)
  const pinnedLinks = websiteLinks.filter((item) => item.isPinned)
  const pinnedTasks = tasks.filter((item) => item.isPinned)
  const allPinnedItems = [...pinnedSheets, ...pinnedLinks, ...pinnedTasks]

  const filteredPinnedItems = (() => {
    switch (pinnedFilter) {
      case "sheets":
        return pinnedSheets
      case "websites":
        return pinnedLinks
      case "tasks":
        return pinnedTasks
      case "all":
      default:
        return allPinnedItems
    }
  })()

  const recentSheets = excelSheets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  const recentTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stats-card ${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && (
          <div className="stat-trend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 18" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span>+{trend}%</span>
          </div>
        )}
      </div>
    </div>
  )

  const getItemIcon = (item) => {
    if (item.url && item.url.includes("sheets.google.com")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    } else if (item.url) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "pending":
        return "status-pending"
      case "inactive":
        return "status-inactive"
      default:
        return "status-pending"
    }
  }

  const handleItemClick = (item) => {
    if (item.url && item.url.includes("sheets.google.com")) {
      onNavigate(`/sheets/${item.id}`)
    } else if (!item.url) {
      onNavigate(`/tasks/${item.id}`)
    } else {
      window.open(item.url, "_blank")
    }
  }

  const getItemType = (item) => {
    if (item.url && item.url.includes("sheets.google.com")) {
      return "excel"
    } else if (item.url) {
      return "websites"
    } else {
      return "tasks"
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back! 👋</h1>
          <p className="welcome-subtitle">Here's what's happening with your resources today.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stats-row">
          <StatCard
            title="Google Sheets"
            value={stats.totalSheets}
            color="blue"
            trend={12}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
          />
          <StatCard
            title="Website Links"
            value={stats.totalLinks}
            color="green"
            trend={8}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            }
          />
          <StatCard
            title="Tasks"
            value={stats.totalTasks}
            color="purple"
            trend={25}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
          />
          <StatCard
            title="Recent Activity"
            value={stats.recentActivity}
            color="orange"
            trend={15}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
        </div>

        <div className="main-row">
          {/* Pinned Items Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 9l3-3 3 3" />
                  <path d="M12 6v12" />
                  <path d="M21 19H3" />
                </svg>
                Pinned Items
                <span className="section-count">{allPinnedItems.length}</span>
              </h2>
            </div>
            <div className="pinned-filters">
              <button
                className={`filter-btn ${pinnedFilter === "all" ? "active" : ""}`}
                onClick={() => setPinnedFilter("all")}
              >
                All ({allPinnedItems.length})
              </button>
              <button
                className={`filter-btn ${pinnedFilter === "sheets" ? "active" : ""}`}
                onClick={() => setPinnedFilter("sheets")}
              >
                Sheets ({pinnedSheets.length})
              </button>
              <button
                className={`filter-btn ${pinnedFilter === "tasks" ? "active" : ""}`}
                onClick={() => setPinnedFilter("tasks")}
              >
                Tasks ({pinnedTasks.length})
              </button>
              <button
                className={`filter-btn ${pinnedFilter === "websites" ? "active" : ""}`}
                onClick={() => setPinnedFilter("websites")}
              >
                Links ({pinnedLinks.length})
              </button>
            </div>
            <div className="pinned-items">
              {filteredPinnedItems.length > 0 ? (
                filteredPinnedItems.map((item) => (
                  <div key={item.id} className="pinned-item" onClick={() => handleItemClick(item)}>
                    <div className="item-icon">{getItemIcon(item)}</div>
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        <span className="item-category">{item.category}</span>
                        {item.status && (
                          <span className={`item-status ${getStatusColor(item.status)}`}>{item.status}</span>
                        )}
                        <span className="item-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="pin-button active"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTogglePin(item.id, getItemType(item))
                        }}
                        title="Unpin item"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 9l3-3 3 3" />
                          <path d="M12 6v12" />
                          <path d="M21 19H3" />
                        </svg>
                      </button>
                      {item.url && (
                        <button
                          className="item-action"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(item.url, "_blank")
                          }}
                          title="Open in new tab"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 9l3-3 3 3" />
                      <path d="M12 6v12" />
                      <path d="M21 19H3" />
                    </svg>
                  </div>
                  <p>No pinned items</p>
                  <span>Pin important items for quick access</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Google Sheets Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Recent Google Sheets
            </h2>
            <button className="section-action" onClick={() => onNavigate("/excel")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              View All ({excelSheets.length})
            </button>
          </div>
          <div className="recent-items">
            {recentSheets.length > 0 ? (
              recentSheets.map((sheet) => (
                <div key={sheet.id} className="recent-item" onClick={() => handleItemClick(sheet)}>
                  <div className="item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="item-content">
                    <div className="item-name">{sheet.name}</div>
                    <div className="item-meta">
                      <span className="item-category">{sheet.category}</span>
                      {sheet.status && (
                        <span className={`item-status ${getStatusColor(sheet.status)}`}>{sheet.status}</span>
                      )}
                      <span className="item-date">{new Date(sheet.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    className="item-action"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(sheet.url, "_blank")
                    }}
                    title="Open sheet"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <p>No Google Sheets</p>
                <span>Add your first Google Sheet to get started</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Recent Tasks
            </h2>
            <button className="section-action" onClick={() => onNavigate("/tasks")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              View All ({tasks.length})
            </button>
          </div>
          <div className="recent-items">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="recent-item" onClick={() => handleItemClick(task)}>
                  <div className="item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div className="item-content">
                    <div className="item-name">{task.name}</div>
                    <div className="item-meta">
                      <span className="item-category">{task.category}</span>
                      <span className={`item-status ${getStatusColor(task.status)}`}>{task.status}</span>
                      <span className="item-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="task-priority">
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <p>No tasks</p>
                <span>Create your first task to get organized</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
