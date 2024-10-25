const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/dashboard", handler: tenantController.getDashboard },
  { method: "get", path: "/profile", handler: tenantController.getProfile },
  { method: "get", path: "/employees", handler: tenantController.getEmployees },
  { method: "get", path: "/card/allocations", handler: tenantController.getCardAllocations },
  { method: "get", path: "/etag/allocations", handler: tenantController.getEtagAllocations },
  { method: "get", path: "/gatepasses", handler: tenantController.getGatePasses },
  { method: "get", path: "/workpermits", handler: tenantController.getWorkPermits },
  { method: "get", path: "/complaints", handler: tenantController.getComplaints },
  { method: "get", path: "/clearance", handler: tenantController.viewClearance },
  { method: "get", path: "/occurences", handler: tenantController.getOccurences },  
  { method: "get", path: "/inspection", handler: tenantController.getInspections },
  { method: "get", path: "/services", handler: tenantController.getServices },
  { method: "get", path: "/lost-and-found", handler: tenantController.getLostAndFound },
  { method: "get", path: "/rooms", handler: tenantController.getRooms },
  { method: "get", path: "/room/bookings", handler: tenantController.getRoomBookings },
  { method: "get", path: "/room/bookings/all", handler: tenantController.getAllRoomBookings },
  { method: "get", path: "/evaluations", handler: tenantController.getEvaluations },
  { method: "get", path: "/evaluations/:evaluationId", handler: tenantController.getEvaluation },

  { method: "post", path: "/employee/register", handler: tenantController.registerEmployee },
  { method: "post", path: "/card/request", handler: tenantController.requestCard },
  { method: "post", path: "/card/return", handler: tenantController.returnCard },
  { method: "post", path: "/etag/request", handler: tenantController.requestEtag },
  { method: "post", path: "/etag/return", handler: tenantController.returnEtag },
  { method: "post", path: "/gatepass/request", handler: tenantController.requestGatePass },
  { method: "post", path: "/complaint/generate", handler: tenantController.generateComplaint },
  { method: "post", path: "/room/bookings/request", handler: tenantController.requestRoomBooking },
  { method: "post", path: "/workpermit/request", handler: tenantController.requestWorkPermit },
  { method: "post", path: "/clearance/initiate", handler: tenantController.initiateClearance },

  { method: "put", path: "/profile/password/update", handler: tenantController.updatePassword },
  { method: "put", path: "/employee/update", handler: tenantController.updateEmployee },
  { method: "put", path: "/employee/layoff", handler: tenantController.layoffEmployee },
  { method: "put", path: "/evaluation/submit", handler: tenantController.submitEvaluation },
  { method: "put", path: "/complaint/feedback", handler: tenantController.giveComplaintFeedback },
  { method: "put", path: "/complaint/reopen", handler: tenantController.reOpenComplaint },

  { method: "delete", path: "/complaints/:complaintId/cancel", handler: tenantController.cancelComplaint },
  { method: "delete", path: "/workpermit/cancel", handler: tenantController.cancelWorkPermit },
  { method: "delete", path: "/room/bookings/:bookingId/cancel", handler: tenantController.cancelRoomBooking },
];

routes.forEach((route) => {
  router[route.method]( route.path, auth.verifyToken, auth.verifyTenant, route.handler );
});

module.exports = router;
