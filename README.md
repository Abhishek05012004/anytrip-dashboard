# Excel ERP System

A clean and simple ERP system for managing Excel sheets and website links with JSON file storage.

## 🚀 Features

- **Excel Sheets Management**: Add, edit, delete, and organize your Google Sheets
- **Website Links**: Quick access to important websites
- **Category Filtering**: Filter by Finance, HR, Sales, Marketing, etc.
- **Search Functionality**: Search across all items
- **JSON File Storage**: Data stored in simple JSON files (no database required)
- **Responsive Design**: Works on all devices
- **Persistent Storage**: Data automatically saved to JSON files

## 📁 Clean Project Structure

\`\`\`
excel-erp-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Express.js Backend
│   ├── data/              # JSON data files
│   │   ├── excelSheets.json
│   │   └── websiteLinks.json
│   └── server.js          # Server with file operations
└── package.json           # Root package.json
\`\`\`

## 🛠️ Installation & Setup

### 1. Clone and Install
\`\`\`bash
git clone <your-repo-url>
cd excel-erp-system
npm run install-all
\`\`\`

### 2. Run the Application
\`\`\`bash
npm run dev
\`\`\`

This starts both:
- **Client**: http://localhost:3000
- **Server**: http://localhost:5000

## 💾 Data Storage

- **Excel Sheets**: Stored in `server/data/excelSheets.json`
- **Website Links**: Stored in `server/data/websiteLinks.json`
- **Auto-created**: JSON files are created automatically when first item is added
- **Persistent**: Data survives server restarts and deployments

## 🌐 API Endpoints

### Excel Sheets
- `GET /api/excel-sheets` - Get all excel sheets
- `POST /api/excel-sheets` - Create new excel sheet
- `PUT /api/excel-sheets/:id` - Update excel sheet
- `DELETE /api/excel-sheets/:id` - Delete excel sheet

### Website Links
- `GET /api/website-links` - Get all website links
- `POST /api/website-links` - Create new website link
- `PUT /api/website-links/:id` - Update website link
- `DELETE /api/website-links/:id` - Delete website link

## 🔧 Usage

1. **Add Excel Sheets**: Click "Add New" → Select "Excel Sheet" → Enter Google Sheets URL
2. **Add Website Links**: Click "Add New" → Select "Website" → Enter website URL
3. **Filter by Category**: Use the sidebar to filter by different categories
4. **Search**: Use the search bar to find specific items
5. **Edit Items**: Click the edit icon on any card
6. **Delete Items**: Click the delete icon on any card

## 🚀 Deployment

### Vercel (Recommended)
1. **Client**: Deploy `client` folder to Vercel
2. **Server**: Deploy `server` folder to Vercel as serverless functions
3. **Data**: JSON files will be created automatically

### Other Platforms
- **Railway**: Deploy server folder
- **Netlify**: Deploy client folder
- **Heroku**: Deploy both client and server

## ✨ Key Benefits

- **No Database Required**: Simple JSON file storage
- **Easy Setup**: No complex configuration
- **Lightweight**: Minimal dependencies
- **Fast**: Direct file operations
- **Portable**: Easy to backup and move data

Perfect for small teams and personal use! 🎯
