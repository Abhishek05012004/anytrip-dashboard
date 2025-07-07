"use client"

import { useState } from "react"
import EditModal from "./EditModal"
import "./WebsiteLinks.css"

const WebsiteLinks = ({ links, onDelete, onEdit, onTogglePin }) => {
  const [editingLink, setEditingLink] = useState(null)

  const handleOpenLink = (url) => {
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

  const handleEdit = (link) => {
    setEditingLink(link)
  }

  const handleSaveEdit = (updatedData) => {
    onEdit(editingLink.id, updatedData)
    setEditingLink(null)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this website link?")) {
      onDelete(id)
    }
  }

  const handleTogglePin = (link) => {
    onTogglePin(link.id, "websites")
  }

  if (links.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <h3 className="empty-title">No website links</h3>
        <p className="empty-description">Get started by adding your first website link.</p>
      </div>
    )
  }

  return (
    <div className="website-links">
      <div className="grid-header">
        <h2 className="grid-title">Website Links</h2>
        <p className="grid-description">Quick access to your important websites</p>
      </div>

      <div className="cards-grid">
        {links.map((link) => (
          <div key={link.id} className="card">
            <div className="card-content">
              <div className="card-header">
                <div className="card-title-section">
                  <svg className="website-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <h3 className="card-title">{link.name}</h3>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleTogglePin(link)}
                    className={`action-button pin-button ${link.isPinned ? "pinned" : ""}`}
                    title={link.isPinned ? "Unpin" : "Pin"}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 9l3-3 3 3" />
                      <path d="M12 6v12" />
                      <path d="M21 19H3" />
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(link)} className="action-button edit-button" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="action-button delete-button" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="card-description">{link.description}</p>

              <div className="card-meta">
                <span className={`category-badge ${getCategoryColor(link.category)}`}>{link.category}</span>
                {link.status && <span className={`status-badge status-${link.status}`}>{link.status}</span>}
                <div className="date-info">
                  <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {new Date(link.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button onClick={() => handleOpenLink(link.url)} className="open-button">
                <svg className="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Visit Website
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingLink && (
        <EditModal item={editingLink} type="website" onSave={handleSaveEdit} onClose={() => setEditingLink(null)} />
      )}
    </div>
  )
}

export default WebsiteLinks
