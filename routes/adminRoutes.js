const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

router.post("/generate-card", auth.verifyToken, adminController.generateCard);
router.post("/generate-etag", auth.verifyToken, adminController.generateEtag);
router.post("/add-service", auth.verifyToken, adminController.addService);

module.exports = router;
