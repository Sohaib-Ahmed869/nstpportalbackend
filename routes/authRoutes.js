const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const routes = [
  { method: "post", path: "/login/admin/super", handler: authController.superAdminLogin },
  { method: "post", path: "/login/admin", handler: authController.adminLogin },
  { method: "post", path: "/login/supervisor", handler: authController.supervisorLogin },
  { method: "post", path: "/login/receptionist", handler: authController.receptionistLogin },
  { method: "post", path: "/login/tenant", handler: authController.tenantLogin },
];

routes.forEach((route) => {
  router[route.method](route.path, route.handler);
});

module.exports = router;
