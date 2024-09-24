const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/towers/:towerId/tenants", handler: adminController.getTenants },
  { method: "get", path: "/towers/:towerId/receptionists", handler: adminController.getReceptionists },
  { method: "get", path: "/towers/:towerId/employees", handler: adminController.getEmployees },
  { method: "get", path: "/towers/:towerId/complaints", handler: adminController.getComplaints },
  { method: "get", path: "/towers/:towerId/tenants/:tenantId/employees", handler: adminController.getTenantEmployees },
  { method: "get", path: "/towers/:towerId/card/allocations", handler: adminController.getCardAllocations },
  { method: "get", path: "/towers/:towerId/etag/allocations", handler: adminController.getEtagAllocations },
  
  { method: "post", path: "/card/generate", handler: adminController.generateCard },
  { method: "post", path: "/etag/generate", handler: adminController.generateEtag },
  { method: "post", path: "/service/add", handler: adminController.addService },
  { method: "post", path: "/office/assign", handler: adminController.assignOffice },
  
  { method: "put", path: "/complaint/resolve", handler: adminController.resolveComplaint },
  { method: "put", path: "/employee/layoff", handler: adminController.layOffEmployee },
];

routes.forEach((route) => {
  router[route.method](route.path, auth.verifyToken, auth.verifyAdmin, route.handler);
})

module.exports = router;
