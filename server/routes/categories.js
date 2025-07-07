const express = require("express")
const router = express.Router()
const Category = require("../models/Category")

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body

    const newCategory = new Category({ name })
    const savedCategory = await newCategory.save()
    res.status(201).json(savedCategory)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category already exists" })
    } else {
      res.status(400).json({ message: error.message })
    }
  }
})

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id)

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
