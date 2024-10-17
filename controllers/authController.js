const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  SuperAdmin,
  Admin,
  Supervisor,
  Receptionist,
  Tenant,
  Evaluation,
} = require("../models");

const authController = {
  superAdminLogin: async (req, res) => {
    try {
      const role = "superadmin";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      SuperAdmin.findOne({ username })
        .then(async (user) => {
          if (!user) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          if (!(await user.comparePassword(password))) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          const token = jwt.sign(
            { id: user._id, role: role },
            process.env.JWT_SECRET,
            {
              expiresIn: "12h",
            }
          );

          res
            .status(200)
            .cookie("token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .json({ message: "Login successful", role: role });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "User not found" });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  adminLogin: async (req, res) => {
    try {
      const role = "admin";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      let towers = [];

      const admin = await Admin.findOne({ username })
        .populate({
          path: "towers.tower",
          model: "Tower",
        })
        .populate({
          path: "towers.tasks",
          model: "Task",
        });
      if (!admin) {
        return res
          .status(400)
          .json({ message: "Invalid username or password" });
      }

      if (!(await admin.comparePassword(password))) {
        return res
          .status(400)
          .json({ message: "Invalid username or password" });
      }

      admin.towers.forEach((tower) => {
        towers.push({
          tower: tower.tower,
          tasks: tower.tasks,
        });
      });

      const token = jwt.sign(
        { id: admin._id, role: role, towers },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
        }
      );

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .json({ message: "Login successful", role: role, towers });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  supervisorLogin: async (req, res) => {
    try {
      const role = "supervisor";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      Supervisor.findOne({ username })
        .then(async (user) => {
          if (!user) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          if (!(await user.comparePassword(password))) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          const token = jwt.sign(
            { id: user._id, role: role },
            process.env.JWT_SECRET,
            {
              expiresIn: "12h",
            }
          );

          res
            .status(200)
            .cookie("token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .json({ message: "Login successful", role: role });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "User not found" });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  receptionistLogin: async (req, res) => {
    try {
      const role = "receptionist";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      Receptionist.findOne({ username })
        .then(async (user) => {
          if (!user) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          if (!(await user.comparePassword(password))) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          const token = jwt.sign(
            { id: user._id, role: role },
            process.env.JWT_SECRET,
            {
              expiresIn: "12h",
            }
          );

          res
            .status(200)
            .cookie("token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .json({ message: "Login successful", role: role });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "User not found" });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  tenantLogin: async (req, res) => {
    try {
      const role = "tenant";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      Tenant.findOne({ username, statusTenancy: true })
        .then(async (user) => {
          if (!user) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          if (!(await user.comparePassword(password))) {
            return res
              .status(400)
              .json({ message: "Invalid username or password" });
          }

          let evalRequested = false;
          const evaluations = await Evaluation.find({ tenant: user._id });
          evaluations.forEach((evaluation) => {
            if (evaluation.is_submitted === false) {
              evalRequested = true;
              return;
            }
          });


          const token = jwt.sign(
            { id: user._id, role: role, evalRequested },
            process.env.JWT_SECRET,
            {
              expiresIn: "12h",
            }
          );

          res
            .status(200)
            .cookie("token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .json({ message: "Login successful", role: role, evalRequested });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "User not found" });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = authController;
