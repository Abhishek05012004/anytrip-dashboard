const express = require("express")
const router = express.Router()
const WebsiteLink = require("../models/WebsiteLink")

// GET all website links
router.get("/", async (req, res) => {
  try {
    const links = await WebsiteLink.find().sort({ createdAt: -1 })
    res.json(links)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET website link by ID
router.get("/:id", async (req, res) => {
  try {
    const link = await WebsiteLink.findById(req.params.id)
    if (!link) {
      return res.status(404).json({ message: "Website link not found" })
    }
    res.json(link)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST create new website link
router.post("/", async (req, res) => {
  try {
    const { name, description, url, category } = req.body

    const newLink = new WebsiteLink({
      name,
      description,
      url,
      category,
    })

    const savedLink = await newLink.save()
    res.status(201).json(savedLink)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update website link
router.put("/:id", async (req, res) => {
  try {
    const { name, description, url, category } = req.body

    const updatedLink = await WebsiteLink.findByIdAndUpdate(
      req.params.id,
      { name, description, url, category, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!updatedLink) {
      return res.status(404).json({ message: "Website link not found" })
    }

    res.json(updatedLink)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE website link
router.delete("/:id", async (req, res) => {
  try {
    const deletedLink = await WebsiteLink.findByIdAndDelete(req.params.id)

    if (!deletedLink) {
      return res.status(404).json({ message: "Website link not found" })
    }

    res.json({ message: "Website link deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
