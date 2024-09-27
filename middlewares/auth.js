const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Admin, Tenant, Receptionist } = require("../models");

const authMiddlewares = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(403).send({ message: "No token provided" });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized" });

        if (!decoded.id || !decoded.role)
          return res.status(401).send({ message: "Invalid token" });

        req.id = decoded.id;
        req.role = decoded.role;

        console.log("🚀 ~ jwt.verify ~ req.id:", req.id);
        console.log("🚀 ~ jwt.verify ~ req.role:", req.role);

        next();
      });
    } catch (err) {
      console.log(err);
      return res.status(401).send({ message: err.message });
    }
  },

  verifySuperAdmin: (req, res, next) => {
    if (req.role !== "Superadmin")
      return res.status(403).send({ message: "Require Super Admin Role!" });
    next();
  },

  verifyAdmin: async (req, res, next) => {
    if (req.role !== "Admin")
      return res.status(403).send({ message: "Require Admin Role!" });

    const adminId = req.id;
    if (!adminId) return res.status(403).send({ message: "Invalid Admin ID" });

    const admin = await Admin.findById(adminId).lean();
    if (!admin) return res.status(404).send({ message: "Admin not found" });

    const permissions = admin.towers.map((tower) => ({
      towerId: tower.tower,
      tasks: tower.tasks,
    }));

    req.permissions = permissions;

    next();
  },

  verifySupervisor: (req, res, next) => {
    if (req.role !== "Supervisor")
      return res.status(403).send({ message: "Require Supervisor Role!" });
    next();
  },

  verifyReceptionist: async (req, res, next) => {
    if (req.role !== "Receptionist")
      return res.status(403).send({ message: "Require Receptionist Role!" });

    const receptionistId = req.id;
    if (!receptionistId)
      return res.status(403).send({ message: "Invalid Receptionist ID" });

    const receptionist = await Receptionist.findById(receptionistId).lean();
    if (!receptionist)
      return res.status(404).send({ message: "Receptionist not found" });

    const towerId = receptionist.tower;
    console.log("🚀 ~ verifyReceptionist: ~ towerId:", towerId);
    req.towerId = towerId;

    next();
  },

  verifyTenant: async (req, res, next) => {
    if (req.role !== "Tenant")
      return res.status(403).send({ message: "Require Tenant Role!" });

    const tenantId = req.id;
    if (!tenantId)
      return res.status(403).send({ message: "Invalid Tenant ID" });

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) return res.status(404).send({ message: "Tenant not found" });

    const towerId = tenant.tower;
    console.log("🚀 ~ verifyTenant: ~ towerId:", towerId);
    req.towerId = towerId;

    next();
  },
};

module.exports = authMiddlewares;
