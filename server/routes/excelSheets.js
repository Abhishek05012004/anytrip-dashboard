const express = require("express")
const router = express.Router()
const ExcelSheet = require("../models/ExcelSheet")

// GET all excel sheets
router.get("/", async (req, res) => {
  try {
    const sheets = await ExcelSheet.find().sort({ createdAt: -1 })
    res.json(sheets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET excel sheet by ID
router.get("/:id", async (req, res) => {
  try {
    const sheet = await ExcelSheet.findById(req.params.id)
    if (!sheet) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }
    res.json(sheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create new excel sheet
router.post("/", async (req, res) => {
  try {
    const { name, description, url, category } = req.body

    const newSheet = new ExcelSheet({
      name,
      description,
      url,
      category,
    })

    const savedSheet = await newSheet.save()
    res.status(201).json(savedSheet)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update excel sheet
router.put("/:id", async (req, res) => {
  try {
    const { name, description, url, category } = req.body

    const updatedSheet = await ExcelSheet.findByIdAndUpdate(
      req.params.id,
      { name, description, url, category, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!updatedSheet) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    res.json(updatedSheet)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE excel sheet
router.delete("/:id", async (req, res) => {
  try {
    const deletedSheet = await ExcelSheet.findByIdAndDelete(req.params.id)

    if (!deletedSheet) {
      return res.status(404).json({ message: "Excel sheet not found" })
    }

    res.json({ message: "Excel sheet deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
