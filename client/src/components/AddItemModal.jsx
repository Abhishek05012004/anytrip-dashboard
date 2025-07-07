"use client"

import { useState } from "react"
import "./AddItemModal.css"

const AddItemModal = ({ isOpen, onClose, onAddExcel, onAddWebsite, onAddTask, categories, activeTab }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: categories[0] || "Finance",
    status: "pending",
    priority: "medium",
    dueDate: "",
  })
  const [currentTab, setCurrentTab] = useState(activeTab === "dashboard" ? "excel" : activeTab)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || (currentTab !== "tasks" && !formData.url)) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      if (currentTab === "excel") {
        await onAddExcel(formData)
      } else if (currentTab === "websites") {
        await onAddWebsite(formData)
      } else if (currentTab === "tasks") {
        await onAddTask(formData)
      }

      setFormData({
        name: "",
        description: "",
        url: "",
        category: categories[0] || "Finance",
        status: "pending",
        priority: "medium",
        dueDate: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            Add New {currentTab === "excel" ? "Google Sheet" : currentTab === "websites" ? "Website Link" : "Task"}
          </h3>
          <button onClick={onClose} className="close-button" disabled={isSubmitting}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="tab-selector">
          <button
            onClick={() => setCurrentTab("excel")}
            className={`tab-button ${currentTab === "excel" ? "active" : ""}`}
            disabled={isSubmitting}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            Google Sheet
          </button>
          <button
            onClick={() => setCurrentTab("websites")}
            className={`tab-button ${currentTab === "websites" ? "active" : ""}`}
            disabled={isSubmitting}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
            Website
          </button>
          <button
            onClick={() => setCurrentTab("tasks")}
            className={`tab-button ${currentTab === "tasks" ? "active" : ""}`}
            disabled={isSubmitting}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Task
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={
                  currentTab === "excel"
                    ? "Google sheet name"
                    : currentTab === "websites"
                      ? "Website name"
                      : "Task name"
                }
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                disabled={isSubmitting}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description..."
              rows={3}
              className="form-textarea"
              disabled={isSubmitting}
            />
          </div>

          {currentTab !== "tasks" && (
            <div className="form-group">
              <label className="form-label">URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder={currentTab === "excel" ? "Google Sheets URL" : "Website URL"}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {currentTab === "tasks" && (
              <>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting
                ? "Adding..."
                : `Add ${currentTab === "excel" ? "Sheet" : currentTab === "websites" ? "Link" : "Task"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItemModal
