const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

router.get("/tenants", auth.verifyToken, adminController.getTenants);
router.get("/tenant-employees/:id", auth.verifyToken, adminController.getTenantEmployees);
router.get("/employees", auth.verifyToken, adminController.getEmployees);
router.get("/complaints", auth.verifyToken, adminController.getComplaints);

router.post("/generate-card", auth.verifyToken, adminController.generateCard);
router.post("/generate-etag", auth.verifyToken, adminController.generateEtag);
router.post("/add-service", auth.verifyToken, adminController.addService);

router.put("/resolve-complaint/:id", auth.verifyToken, adminController.resolveComplaint);
module.exports = router;
