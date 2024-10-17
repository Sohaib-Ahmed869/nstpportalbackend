const express = require("express");
const router = express.Router();
const commonController = require('../controllers/commonController')

router.get("/blogs",commonController.getBlogs);

module.exports = router;
