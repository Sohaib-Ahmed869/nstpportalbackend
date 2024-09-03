const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/auth");

router.get("/employees", auth.verifyToken, tenantController.getEmployees);

router.post("/register-employee", auth.verifyToken,  tenantController.registerEmployee);

module.exports = router;