const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Tenant } = require("../models");

const authMiddlewares = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(403).send({ message: "No token provided" });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized" });

        req.id = decoded.id;
        req.role = decoded.role;

        console.log("🚀 ~ jwt.verify ~ req.id:", req.id);

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

  verifyAdmin: (req, res, next) => {
    if (req.role !== "Admin")
      return res.status(403).send({ message: "Require Admin Role!" });
    next();
  },

  verifySupervisor: (req, res, next) => {
    if (req.role !== "Supervisor")
      return res.status(403).send({ message: "Require Supervisor Role!" });
    next();
  },

  verifyReceptionist: (req, res, next) => {
    if (req.role !== "Receptionist")
      return res.status(403).send({ message: "Require Receptionist Role!" });
    next();
  },

  verifyTenant: async (req, res, next) => {
    if (req.role !== "Tenant")
      return res.status(403).send({ message: "Require Tenant Role!" });

    const tenantId = req.id;
    if (!tenantId)
      return res.status(403).send({ message: "Invalid Tenant ID" });

    const tenant = await Tenant.findById(tenantId).populate("tower").lean();
    if (!tenant) return res.status(404).send({ message: "Tenant not found" });

    const towerId = tenant.tower._id;
    console.log("🚀 ~ verifyTenant: ~ towerId:", towerId);
    req.towerId = towerId;

    next();
  },
};

module.exports = authMiddlewares;
