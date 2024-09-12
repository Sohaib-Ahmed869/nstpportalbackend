const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/auth");

router.get("/employees", auth.verifyToken, tenantController.getEmployees);
router.get("/card-allocations", auth.verifyToken, tenantController.getCardAllocations);
router.get("/etag-allocations", auth.verifyToken, tenantController.getEtagAllocations);

router.post(
  "/register-employee",
  auth.verifyToken,
  tenantController.registerEmployee
);
router.post("/request-card", auth.verifyToken, tenantController.requestCard);
router.post("/request-etag", auth.verifyToken, tenantController.requestEtag);
// router.post("/return-card", auth.verifyToken, tenantController.returnCard);
router.post("/generate-complaint", auth.verifyToken, tenantController.generateComplaint);

router.put("/update-employee", auth.verifyToken, tenantController.updateEmployee);
router.put("/layoff-employee", auth.verifyToken, tenantController.layoffEmployee);

router.delete("/cancel-complaint", auth.verifyToken, tenantController.cancelComplaint);

module.exports = router;
