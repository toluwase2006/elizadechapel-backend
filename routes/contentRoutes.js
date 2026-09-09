const express = require("express");
const { createContent, deleteContent, listContent } = require("../controller/contentController");

const router = express.Router();
const contentTypes = ["bible-study", "proverbial-digest"];

router.param("type", (req, res, next, type) => {
  if (!contentTypes.includes(type)) {
    return res.status(404).json({ message: "Unsupported content type." });
  }
  next();
});

router.get("/:type", listContent);
router.post("/:type", createContent);
router.delete("/:type/:id", deleteContent);

module.exports = router;
