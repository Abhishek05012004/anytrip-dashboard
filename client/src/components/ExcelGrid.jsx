"use client"

import { useState } from "react"
import EditModal from "./EditModal"
import "./ExcelGrid.css"

const ExcelGrid = ({ sheets, onDelete, onEdit, onTogglePin }) => {
  const [editingSheet, setEditingSheet] = useState(null)

  const handleOpenSheet = (url) => {
    window.open(url, "_blank")
  }

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

  const handleEdit = (sheet) => {
    setEditingSheet(sheet)
  }

  const handleSaveEdit = (updatedData) => {
    onEdit(editingSheet.id, updatedData)
    setEditingSheet(null)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Excel sheet?")) {
      onDelete(id)
    }
  }

  const handleTogglePin = (sheet) => {
    onTogglePin(sheet.id, "excel")
  }

  if (sheets.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        <h3 className="empty-title">No Excel sheets</h3>
        <p className="empty-description">Get started by adding your first Excel sheet.</p>
      </div>
    )
  }

  return (
    <div className="excel-grid">
      <div className="grid-header">
        <h2 className="grid-title">Google Sheets</h2>
        <p className="grid-description">Manage and access your Google Sheets easily</p>
      </div>

      <div className="cards-grid">
        {sheets.map((sheet) => (
          <div key={sheet.id} className="card">
            <div className="card-content">
              <div className="card-header">
                <div className="card-title-section">
                  <svg className="sheet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  <h3 className="card-title">{sheet.name}</h3>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleTogglePin(sheet)}
                    className={`action-button pin-button ${sheet.isPinned ? "pinned" : ""}`}
                    title={sheet.isPinned ? "Unpin" : "Pin"}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 9l3-3 3 3" />
                      <path d="M12 6v12" />
                      <path d="M21 19H3" />
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(sheet)} className="action-button edit-button" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(sheet.id)} className="action-button delete-button" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="card-description">{sheet.description}</p>

              <div className="card-meta">
                <span className={`category-badge ${getCategoryColor(sheet.category)}`}>{sheet.category}</span>
                {sheet.status && <span className={`status-badge status-${sheet.status}`}>{sheet.status}</span>}
                <div className="date-info">
                  <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {new Date(sheet.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button onClick={() => handleOpenSheet(sheet.url)} className="open-button">
                <svg className="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open Sheet
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingSheet && (
        <EditModal item={editingSheet} type="excel" onSave={handleSaveEdit} onClose={() => setEditingSheet(null)} />
      )}
    </div>
  )
}

export default ExcelGrid
