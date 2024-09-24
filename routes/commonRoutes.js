const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");
const auth = require("../middlewares/auth");

const routes = [
  { method: "get", path: "/services", handler: commonController.getServices },
];

routes.forEach((route) => {
  router[route.method](route.path, auth.verifyToken, route.handler);
});

module.exports = router;
