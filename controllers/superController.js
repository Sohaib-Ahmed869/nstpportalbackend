const Tower = require("../models/tower");
const Admin = require("../models/admin");
const Task = require("../models/task");

const superController = {
  getTowers: async (req, res) => {
    try {
      const towers = await Tower.find().lean();
      res.status(200).json({ towers });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAdmins: async (req, res) => {
    try {
      const admins = await Admin.find()
        .populate({
          path: "towers.tower",
          model: "Tower",
        })
        .populate({
          path: "towers.tasks",
          model: "Task",
        })
        .lean();
      res.status(200).json({ admins });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addTower: async (req, res) => {
    try {
      const { name, location, description } = req.body;
      const tower = new Tower({ name, location, description });
      await tower.save();
      res.status(201).json({ message: "Tower added successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // addAdmin: async (req, res) => {
  //   try {
  //     const { username, email, password, name, cnic, jobStart, image } =
  //       req.body;
  //     const admin = new Admin({
  //       username,
  //       email,
  //       password,
  //       name,
  //       cnic,
  //       job_start: jobStart,
  //       image,
  //     });
  //     await admin.save();
  //     res.status(201).json({ message: "Admin added successfully" });
  //   } catch (error) {
  //     res.status(400).json({ message: error.message });
  //   }
  // },

  addTask: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Please provide a name" });
      }

      const exists = await Task.findOne({ name });
      if (exists) {
        return res.status(400).json({ message: "Task already exists" });
      }

      const task = new Task({ name, description });
      await task.save();
      res.status(201).json({ message: "Task added successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  assignTower: async (req, res) => {
    try {
      const { towerId, adminId } = req.body;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }
      const tower = await Tower.findById(towerId);
      if (!tower) {
        return res.status(400).json({ message: "Tower not found" });
      }

      // if already exists
      const exists = admin.towers.find(
        (t) => t.tower.toString() === towerId.toString()
      );
      if (exists) {
        return res.status(400).json({ message: "Tower already assigned" });
      }

      admin.towers.push({ tower: towerId });
      await admin.save();
      res.status(200).json({ message: "Tower assigned successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getTasks: async (req, res) => {
    try {
      const tasks = await Task.find().lean();
      res.status(200).json({ tasks });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  assignTasks: async (req, res) => {
    // overwriting the tasks
    try {
      const { adminId, towerId, tasks } = req.body;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }
      const tower = await Tower.findById(towerId);
      if (!tower) {
        return res.status(400).json({ message: "Tower not found" });
      }
      admin.towers.forEach((t) => {
        if (t.tower.toString() === towerId) {
          t.tasks = tasks;
        }
      });
      await admin.save();
      res.status(200).json({ message: "Tasks assigned successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  unassignTasks: async (req, res) => {
    try {
      const { adminId, towerId, tasks } = req.body;

      // Validate admin
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Validate tower
      const tower = await Tower.findById(towerId);
      if (!tower) {
        return res.status(404).json({ message: "Tower not found" });
      }

      // Validate tasks
      const validTasks = await Task.find({ _id: { $in: tasks } });
      if (validTasks.length !== tasks.length) {
        return res
          .status(400)
          .json({ message: "One or more tasks are invalid" });
      }

      // Unassign tasks
      let towerFound = false;
      admin.towers.forEach((t) => {
        if (t.tower.toString() === towerId) {
          t.tasks = t.tasks.filter((task) => !tasks.includes(task.toString()));
          towerFound = true;
        }
      });

      if (!towerFound) {
        return res
          .status(404)
          .json({ message: "Tower not found in admin's towers" });
      }

      await admin.save();
      res.status(200).json({ message: "Tasks unassigned successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = superController;
