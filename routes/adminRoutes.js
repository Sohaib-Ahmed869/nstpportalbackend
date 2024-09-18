const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

router.get("/tenants/:id", auth.verifyToken, adminController.getTenants);
router.get("/tenant-employees/:id", auth.verifyToken, adminController.getTenantEmployees);
router.get("/employees/:id", auth.verifyToken, adminController.getEmployees);
router.get("/complaints", auth.verifyToken, adminController.getComplaints);

router.post("/generate-card", auth.verifyToken, adminController.generateCard);
router.post("/generate-etag", auth.verifyToken, adminController.generateEtag);
router.post("/add-service", auth.verifyToken, adminController.addService);
router.post("/assign-office", auth.verifyToken, adminController.assignOffice);

router.put("/resolve-complaint", auth.verifyToken, adminController.resolveComplaint);
router.put("/layoff-employee", auth.verifyToken, adminController.layOffEmployee);

module.exports = router;
