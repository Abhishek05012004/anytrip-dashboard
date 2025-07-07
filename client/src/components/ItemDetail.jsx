"use client"

import { useState, useEffect } from "react"
import BackButton from "./BackButton"
import "./ItemDetail.css"

const ItemDetail = ({ item, type, onBack, onEdit, onDelete, onTogglePin }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    if (item) {
      setEditData({ ...item })
    }
  }, [item])

  if (!item) {
    return (
      <div className="item-detail">
        <BackButton onBack={onBack} currentPath={`/${type}s/${item?.id || ""}`} />
        <div className="item-not-found">
          <div className="not-found-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Item not found</h2>
          <p>The {type} you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    onEdit(item.id, editData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      onDelete(item.id)
      onBack()
    }
  }

  const getIcon = () => {
    if (type === "sheet") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
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

  return (
    <div className="item-detail">
      <BackButton onBack={onBack} currentPath={`/${type}s/${item.id}`} />

      <div className="detail-container">
        <div className="detail-header">
          <div className="detail-icon">{getIcon()}</div>
          <div className="detail-title-section">
            {isEditing ? (
              <input
                type="text"
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="detail-title-input"
              />
            ) : (
              <h1 className="detail-title">{item.name}</h1>
            )}
            <div className="detail-meta">
              <span className="detail-category">{item.category}</span>
              {item.status && <span className={`detail-status ${getStatusColor(item.status)}`}>{item.status}</span>}
              {item.isPinned && (
                <span className="detail-pinned">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 9l3-3 3 3" />
                    <path d="M12 6v12" />
                    <path d="M21 19H3" />
                  </svg>
                  Pinned
                </span>
              )}
            </div>
          </div>
          <div className="detail-actions">
            <button
              onClick={() => onTogglePin(item.id, type === "sheet" ? "excel" : "tasks")}
              className={`action-btn pin-btn ${item.isPinned ? "pinned" : ""}`}
              title={item.isPinned ? "Unpin" : "Pin"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 9l3-3 3 3" />
                <path d="M12 6v12" />
                <path d="M21 19H3" />
              </svg>
            </button>
            {isEditing ? (
              <>
                <button onClick={handleSave} className="action-btn save-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                </button>
                <button onClick={() => setIsEditing(false)} className="action-btn cancel-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="action-btn edit-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={handleDelete} className="action-btn delete-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="detail-textarea"
                rows="4"
              />
            ) : (
              <p className="detail-description">{item.description || "No description provided."}</p>
            )}
          </div>

          {type === "sheet" && item.url && (
            <div className="detail-section">
              <h3>Google Sheet Link</h3>
              <div className="detail-link">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="sheet-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open in Google Sheets
                </a>
              </div>
            </div>
          )}

          {type === "task" && (
            <>
              {item.priority && (
                <div className="detail-section">
                  <h3>Priority</h3>
                  <span className={`priority-badge priority-${item.priority}`}>{item.priority.toUpperCase()}</span>
                </div>
              )}

              {item.dueDate && (
                <div className="detail-section">
                  <h3>Due Date</h3>
                  <div className="detail-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="detail-section">
            <h3>Details</h3>
            <div className="detail-info-grid">
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{item.category}</span>
              </div>
              {item.status && (
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`info-value ${getStatusColor(item.status)}`}>{item.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail
