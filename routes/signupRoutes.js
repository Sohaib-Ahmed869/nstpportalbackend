const express = require("express");
const signupController = require("../controllers/signupController");
const router = express.Router();

router.post("/super-admin", signupController.superAdminSignup);
router.post("/admin", signupController.adminSignup);
router.post("/supervisor", signupController.supervisorSignup);
router.post("/receptionist", signupController.receptionistSignup);
router.post("/tenant", signupController.tenantSignup);

module.exports = router;