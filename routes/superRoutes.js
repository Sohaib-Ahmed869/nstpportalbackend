const express = require("express");
const router = express.Router();
const superController = require("../controllers/superController");

router.get("/towers", superController.getTowers);
router.get("/admins", superController.getAdmins);
router.get("/tasks", superController.getTasks);

router.post("/add-tower", superController.addTower);
router.post("/add-task", superController.addTask);

router.put("/assign-tower", superController.assignTower);
router.put("/assign-tasks", superController.assignTasks);
router.put("/unassign-tasks", superController.unassignTasks);

module.exports = router;
