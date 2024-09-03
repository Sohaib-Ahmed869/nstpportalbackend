const SuperAdmin = require("../models/superAdmin");
const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");
const Receptionist = require("../models/receptionist");
const Tenant = require("../models/tenant");

const signupController = {
  superAdminSignup: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      const superAdmin = new SuperAdmin({ username, password });
      await superAdmin.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  adminSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const admin = new Admin({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await admin.save();
      return res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  supervisorSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const supervisor = new Supervisor({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await supervisor.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  receptionistSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const receptionist = new Receptionist({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await receptionist.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  tenantSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, joiningDate } = req.body;
      if (!username || !email || !password || !name || !cnic || !joiningDate) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const tenant = new Tenant({
        username,
        email,
        password,
        name,
        cnic,
        date_joining: joiningDate,
      });
      await tenant.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = signupController;