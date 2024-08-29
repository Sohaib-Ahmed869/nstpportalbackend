const jwt = require("jsonwebtoken");
require("dotenv").config();

const SuperAdmin = require("../models/superAdmin");
const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");
const Receptionist = require("../models/receptionist");
const Tenant = require("../models/tenant");

const authController = {
  superAdminLogin: async (req, res) => {
    try {
      const role = "Superadmin";
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
      const role = "Admin";
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      Admin.findOne({ username })
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

  supervisorLogin: async (req, res) => {
    try {
      const role = "Supervisor";
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
      const role = "Receptionist";
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

      Tenant.findOne({ username })
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
};

module.exports = authController;
