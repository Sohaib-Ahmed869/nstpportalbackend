console.log("Hello superRoutes");

const express = require("express");
const router = express.Router();
const superController = require("../controllers/superController"); 



const routes = [
  { method: "get", path: "/towers", handler: superController.getTowers },
  { method: "get", path: "/admins", handler: superController.getAdmins },
  { method: "get", path: "/tasks", handler: superController.getTasks },

  { method: "post", path: "/tower/add", handler: superController.addTower },
  { method: "post", path: "/tasks/add", handler: superController.addTasks },

  { method: "put", path: "/tower/assign", handler: superController.assignTower },
  { method: "put", path: "/tasks/assign", handler: superController.assignTasks },
  { method: "put", path: "/tasks/unassign", handler: superController.unassignTasks },
];

routes.forEach((route) => {
  router[route.method](route.path, route.handler);
});

module.exports = router;
