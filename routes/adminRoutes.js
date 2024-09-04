const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

router.post("/generate-card", auth.verifyToken, adminController.generateCard);

module.exports = router;
