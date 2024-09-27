const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/employees", handler: tenantController.getEmployees },
  { method: "get", path: "/card/allocations", handler: tenantController.getCardAllocations },
  { method: "get", path: "/etag/allocations", handler: tenantController.getEtagAllocations },
  { method: "get", path: "/gatepasses", handler: tenantController.getGatePasses },
  { method: "get", path: "/workpermits", handler: tenantController.getWorkPermits },
  { method: "get", path: "/complaints", handler: tenantController.getComplaints },
  { method: "get", path: "/clearance", handler: tenantController.viewClearance },
  { method: "get", path: "/complaints/tenant", handler: tenantController.getTenantComplaints },  
  { method: "get", path: "/booking/room", handler: tenantController.getRoomBookings },
  { method: "get", path: "/inspection", handler: tenantController.getInspections },

  { method: "post", path: "/employee/register", handler: tenantController.registerEmployee },
  { method: "post", path: "/card/request", handler: tenantController.requestCard },
  { method: "post", path: "/card/return", handler: tenantController.returnCard },
  { method: "post", path: "/etag/request", handler: tenantController.requestEtag },
  { method: "post", path: "/etag/return", handler: tenantController.returnEtag },
  { method: "post", path: "/getepass/request", handler: tenantController.requestGatePass },
  { method: "post", path: "/complaint/generate", handler: tenantController.generateComplaint },
  { method: "post", path: "/booking/room", handler: tenantController.requestRoomBooking },
  { method: "post", path: "/booking/room/cancel", handler: tenantController.cancelRoomBooking },
  { method: "post", path: "/workpermit/request", handler: tenantController.requestWorkPermit },
  { method: "post", path: "/clearance/initiate", handler: tenantController.initiateClearance },

  { method: "put", path: "/employee/update", handler: tenantController.updateEmployee },
  { method: "put", path: "/employee/layoff", handler: tenantController.layoffEmployee },
  
  { method: "delete", path: "/complaint/cancel", handler: tenantController.cancelComplaint },
  { method: "delete", path: "/workpermit/cancel", handler: tenantController.cancelWorkPermit },
];

routes.forEach((route) => {
  router[route.method]( route.path, auth.verifyToken, auth.verifyTenant, route.handler );
});

module.exports = router;
