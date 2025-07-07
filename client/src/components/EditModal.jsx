"use client"

import { useState } from "react"
import "./EditModal.css"

const EditModal = ({ item, type, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    url: item.url,
    category: item.category,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ["Finance", "HR", "Inventory", "Sales", "Reports", "Marketing"]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.url) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error("Error updating item:", error)
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Edit {type === "excel" ? "Excel Sheet" : "Website Link"}</h3>
          <button onClick={onClose} className="close-button" disabled={isSubmitting}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={type === "excel" ? "Excel sheet name" : "Website name"}
              className="form-input"
              required
              disabled={isSubmitting}
            />
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

          <div className="form-group">
            <label className="form-label">URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder={type === "excel" ? "Google Sheets URL" : "Website URL"}
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

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
