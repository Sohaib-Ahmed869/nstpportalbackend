const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/employees", handler: tenantController.getEmployees },
  { method: "get", path: "/card/allocations", handler: tenantController.getCardAllocations },
  { method: "get", path: "/etag/allocations", handler: tenantController.getEtagAllocations },

  { method: "post", path: "/employee/register", handler: tenantController.registerEmployee },
  { method: "post", path: "/card/request", handler: tenantController.requestCard },
  { method: "post", path: "/etag/request", handler: tenantController.requestEtag },
  // { method: "post", path: "/return-card", handler: tenantController.returnCard },
  { method: "post", path: "/complaint/generate", handler: tenantController.generateComplaint },

  { method: "put", path: "/employee/update", handler: tenantController.updateEmployee },
  { method: "put", path: "/employee/layoff", handler: tenantController.layoffEmployee },
  
  { method: "delete", path: "/complaint/cancel", handler: tenantController.cancelComplaint },
];

routes.forEach((route) => {
  router[route.method](route.path, auth.verifyToken, auth.verifyTenant, route.handler);
});

module.exports = router;
