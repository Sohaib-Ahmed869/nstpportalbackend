const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");

router.get("/services", commonController.getServices);

module.exports = router;
