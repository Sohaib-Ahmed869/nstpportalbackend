const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupController");

const routes = [
  { method: "post", path: "/admin/super", handler: signupController.superAdminSignup },
  // { method: "post", path: "/admin", handler: signupController.adminSignup },
  { method: "post", path: "/supervisor", handler: signupController.supervisorSignup },
  { method: "post", path: "/receptionist", handler: signupController.receptionistSignup },
  // { method: "post", path: "/tenant", handler: signupController.tenantSignup },
];

routes.forEach((route) => {
  router[route.method](route.path, route.handler);
});

module.exports = router;
