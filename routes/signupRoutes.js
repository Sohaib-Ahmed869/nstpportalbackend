const express = require("express");
const signupController = require("../controllers/signupController");
const router = express.Router();

router.post("/super-admin-signup", signupController.superAdminSignup);
router.post("/admin-signup", signupController.adminSignup);
router.post("/supervisor-signup", signupController.supervisorSignup);
router.post("/receptionist-signup", signupController.receptionistSignup);
router.post("/tenant-signup", signupController.tenantSignup);

module.exports = router;
