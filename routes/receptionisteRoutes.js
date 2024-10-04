const express = require("express");
const router = express.Router();
const receptionistController = require("../controllers/receptionistController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/gatepasses", handler: receptionistController.getGatePasses },
  { method: "get", path: "/gatepasses/unhandled", handler: receptionistController.getUnhandledGatePasses },
  { method: "get", path: "/gatepasses/handled-unhandled", handler: receptionistController.getUnhandledHandledGatePasses },
  { method: "get", path: "/workpermits", handler: receptionistController.getWorkPermits },
  { method: "get", path: "/booking/room", handler: receptionistController.getRoomBookings }, 
  { method: "get", path: "/clearances", handler: receptionistController.getClearances },
  { method: "get", path: "/complaints", handler: receptionistController.getComplaints },
  { method: "get", path: "/tenants", handler: receptionistController.getTenants },
  { method: "get", path: "/tenants/:tenantId/occurences", handler: receptionistController.getTenantOccurences },
  { method: "get", path: "/occurences", handler: receptionistController.getAllTenantsOccurences },

  { method: "post", path: "/lostAndFound/add", handler: receptionistController.addLostAndFound },
  { method: "post", path: "/occurence/add", handler: receptionistController.addOccurence },

  { method: "put", path: "/gatepass/approval", handler: receptionistController.handleGatePass },
  { method: "put", path: "/booking/room/approval", handler: receptionistController.handleRoomBooking },
  { method: "put", path: "/booking/room/cancel", handler: receptionistController.cancelRoomBooking },
  { method: "put", path: "/lostAndFound/resolve", handler: receptionistController.resolveLostAndFound },
]

routes.forEach((route) => {
  router[route.method](route.path, auth.verifyToken, auth.verifyReceptionist, route.handler);
})

module.exports = router;
