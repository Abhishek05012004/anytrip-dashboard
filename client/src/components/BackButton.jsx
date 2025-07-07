"use client"

import "./BackButton.css"

const BackButton = ({ onBack, currentPath }) => {
  const getBackText = () => {
    if (currentPath.includes("/sheets/")) return "Back to Google Sheets"
    if (currentPath.includes("/tasks/")) return "Back to Tasks"
    if (currentPath === "/excel") return "Back to Dashboard"
    if (currentPath === "/tasks") return "Back to Dashboard"
    if (currentPath === "/websites") return "Back to Dashboard"
    return "Back"
  }

  return (
    <button className="back-button" onClick={onBack} title={getBackText()}>
      <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span className="back-text">{getBackText()}</span>
    </button>
  )
}

export default BackButton
