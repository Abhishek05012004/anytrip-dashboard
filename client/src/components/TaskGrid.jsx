"use client"

import { useState } from "react"
import EditModal from "./EditModal"
import "./TaskGrid.css"

const TaskGrid = ({ tasks, onDelete, onEdit, onTogglePin }) => {
  const [editingTask, setEditingTask] = useState(null)

  const getCategoryColor = (category) => {
    const colors = {
      Finance: "category-finance",
      HR: "category-hr",
      Inventory: "category-inventory",
      Sales: "category-sales",
      Reports: "category-reports",
      Marketing: "category-marketing",
    }
    return colors[category] || "category-default"
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
  }

  const handleSaveEdit = (updatedData) => {
    onEdit(editingTask.id, updatedData)
    setEditingTask(null)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(id)
    }
  }

  const handleTogglePin = (task) => {
    onTogglePin(task.id, "tasks")
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString()
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <h3 className="empty-title">No tasks</h3>
        <p className="empty-description">Get started by adding your first task.</p>
      </div>
    )
  }

  return (
    <div className="task-grid">
      <div className="grid-header">
        <h2 className="grid-title">Tasks</h2>
        <p className="grid-description">Manage and track your tasks efficiently</p>
      </div>

      <div className="cards-grid">
        {tasks.map((task) => (
          <div key={task.id} className="card">
            <div className="card-content">
              <div className="card-header">
                <div className="card-title-section">
                  <svg className="task-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <h3 className="card-title">{task.name}</h3>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleTogglePin(task)}
                    className={`action-button pin-button ${task.isPinned ? "pinned" : ""}`}
                    title={task.isPinned ? "Unpin" : "Pin"}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 9l3-3 3 3" />
                      <path d="M12 6v12" />
                      <path d="M21 19H3" />
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(task)} className="action-button edit-button" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="action-button delete-button" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="card-description">{task.description}</p>

              <div className="card-meta">
                <span className={`category-badge ${getCategoryColor(task.category)}`}>{task.category}</span>
                <span className={`status-badge ${getStatusColor(task.status)}`}>{task.status}</span>
                {task.priority && (
                  <span className={`priority-badge ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                )}
              </div>

              <div className="task-details">
                <div className="due-date">
                  <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
                <div className="created-date">
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingTask && (
        <EditModal item={editingTask} type="task" onSave={handleSaveEdit} onClose={() => setEditingTask(null)} />
      )}
    </div>
  )
}

export default TaskGrid
