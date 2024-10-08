const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");


router.get("/towers/:towerId/dashboard", auth.verifyToken, auth.verifyAdmin, adminController.getDashboard);
router.get("/towers/:towerId/tenants", auth.verifyToken, auth.verifyAdmin, adminController.getTenants);
router.get("/towers/:towerId/tenants/:tenantId", auth.verifyToken, auth.verifyAdmin, adminController.getTenant);
router.get("/towers/:towerId/receptionists", auth.verifyToken, auth.verifyAdmin, adminController.getReceptionists);
router.get("/towers/:towerId/employees", auth.verifyToken, auth.verifyAdmin, adminController.getEmployees);
router.get("/towers/:towerId/complaints", auth.verifyToken, auth.verifyAdmin, adminController.getComplaints);
router.get("/towers/:towerId/tenants/:tenantId/employees", auth.verifyToken, auth.verifyAdmin, adminController.getTenantEmployees);
router.get("/towers/:towerId/card/allocations", auth.verifyToken, auth.verifyAdmin, adminController.getCardAllocations);
router.get("/towers/:towerId/etag/allocations", auth.verifyToken, auth.verifyAdmin, adminController.getEtagAllocations);
router.get("/towers/:towerId/rooms", auth.verifyToken, auth.verifyAdmin, adminController.getRooms);
router.get("/towers/:towerId/room-types", auth.verifyToken, auth.verifyAdmin, adminController.getRoomTypes);
router.get("/towers/:towerId/services", auth.verifyToken, auth.verifyAdmin, adminController.getServices);
router.get("/towers/:towerId/receptionists/performance", auth.verifyToken, auth.verifyAdmin, adminController.getReceptionistsPerformance);
router.get("/towers/:towerId/office/requests", auth.verifyToken, auth.verifyAdmin, adminController.getOfficeRequests);
router.get("/towers/:towerId/workpermits", auth.verifyToken, auth.verifyAdmin, adminController.getWorkPermits);
router.get("/towers/:towerId/lost-and-found", auth.verifyToken, auth.verifyAdmin, adminController.getLostAndFound);
router.get("/towers/:towerId/room/bookings", auth.verifyToken, auth.verifyAdmin, adminController.getRoomBookings);

router.post("/tenant/add", auth.verifyToken, auth.verifyAdmin, adminController.addTenant);
router.post("/service/add", auth.verifyToken, auth.verifyAdmin, adminController.addService);
router.post("/office/assign", auth.verifyToken, auth.verifyAdmin, adminController.assignOffice);
router.post("/room/add", auth.verifyToken, auth.verifyAdmin, adminController.addRoom);
router.post("/room-type/add", auth.verifyToken, auth.verifyAdmin, adminController.addRoomType);

router.put("/card/accept", auth.verifyToken, auth.verifyAdmin, adminController.acceptCardRequest);
router.put("/card/reject", auth.verifyToken, auth.verifyAdmin, adminController.rejectCardRequest);
router.put("/etag/accept", auth.verifyToken, auth.verifyAdmin, adminController.acceptEtagRequest);
router.put("/etag/reject", auth.verifyToken, auth.verifyAdmin, adminController.rejectEtagRequest);
router.put("/complaint/resolve", auth.verifyToken, auth.verifyAdmin, adminController.handleComplaint);
router.put("/employee/layoff", auth.verifyToken, auth.verifyAdmin, adminController.layOffEmployee);
router.put("/room/update", auth.verifyToken, auth.verifyAdmin, adminController.updateRoom);
router.put("/clearance/resolve", auth.verifyToken, auth.verifyAdmin, adminController.handleClearance);
router.put("/workpermit/resolve", auth.verifyToken, auth.verifyAdmin, adminController.handleWorkPermit);
router.put("/service/edit", auth.verifyToken, auth.verifyAdmin, adminController.editService);

router.delete("/room/delete", auth.verifyToken, auth.verifyAdmin, adminController.deleteRoom);
router.delete("/service/delete", auth.verifyToken, auth.verifyAdmin, adminController.deleteService);

module.exports = router;
