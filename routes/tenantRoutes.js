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

module.exports = router;
