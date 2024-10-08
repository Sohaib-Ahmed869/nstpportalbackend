const express = require("express");
const router = express.Router();
const receptionistController = require("../controllers/receptionistController");
const auth = require("../middlewares/auth");

router.get("/gatepasses", auth.verifyToken, auth.verifyReceptionist, receptionistController.getGatePasses);
router.get("/gatepasses/unhandled", auth.verifyToken, auth.verifyReceptionist, receptionistController.getUnhandledGatePasses);
router.get("/gatepasses/handled-unhandled", auth.verifyToken, auth.verifyReceptionist, receptionistController.getUnhandledHandledGatePasses);
router.get("/workpermits", auth.verifyToken, auth.verifyReceptionist, receptionistController.getWorkPermits);
router.get("/clearances", auth.verifyToken, auth.verifyReceptionist, receptionistController.getClearances);
router.get("/complaints", auth.verifyToken, auth.verifyReceptionist, receptionistController.getComplaints);
router.get("/tenants", auth.verifyToken, auth.verifyReceptionist, receptionistController.getTenants);
router.get("/tenants/:tenantId/occurences", auth.verifyToken, auth.verifyReceptionist, receptionistController.getTenantOccurences);
router.get("/occurences", auth.verifyToken, auth.verifyReceptionist, receptionistController.getAllTenantsOccurences);
router.get("/lost-and-found", auth.verifyToken, auth.verifyReceptionist, receptionistController.getLostAndFound);
router.get("/rooms", auth.verifyToken, auth.verifyReceptionist, receptionistController.getRooms);
router.get("/room/bookings", auth.verifyToken, auth.verifyReceptionist, receptionistController.getRoomBookings);

router.post("/lost-and-found/add", auth.verifyToken, auth.verifyReceptionist, receptionistController.addLostAndFound);
router.post("/occurence/add", auth.verifyToken, auth.verifyReceptionist, receptionistController.addOccurence);

router.put("/gatepass/approval", auth.verifyToken, auth.verifyReceptionist, receptionistController.handleGatePass);
router.put("/booking/room/approval", auth.verifyToken, auth.verifyReceptionist, receptionistController.handleRoomBooking);
router.put("/booking/room/cancel", auth.verifyToken, auth.verifyReceptionist, receptionistController.cancelRoomBooking);
router.put("/lost-and-found/resolve", auth.verifyToken, auth.verifyReceptionist, receptionistController.resolveLostAndFound);
router.put("/complaint/resolve", auth.verifyToken, auth.verifyReceptionist, receptionistController.handleComplaint);

module.exports = router;
