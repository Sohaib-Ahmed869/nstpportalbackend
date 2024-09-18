const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");
const auth = require("../middlewares/auth");

router.get("/services", auth.verifyToken, commonController.getServices);

module.exports = router;
