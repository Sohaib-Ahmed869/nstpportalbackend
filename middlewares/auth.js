require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddlewares = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(403).send({ message: "No token provided" });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized" });

        req.id = decoded.id;
        req.role = decoded.role;

        // console.log("🚀 ~ jwt.verify ~ req.id:", req.id);

        next();
      });
    } catch (err) {
      console.log(err);
      return res.status(401).send({ message: err.message });
    }
  },

  verifySuperAdmin: (req, res, next) => {
    if (req.role !== "superAdmin")
      return res.status(403).send({ message: "Require Super Admin Role!" });
    next();
  },

  verifyAdmin: (req, res, next) => {
    if (req.role !== "admin" && req.role !== "superAdmin")
      return res.status(403).send({ message: "Require Admin Role!" });
    next();
  },

  verifySupervisor: (req, res, next) => {
    if (req.role !== "supervisor" && req.role !== "superAdmin")
      return res.status(403).send({ message: "Require Supervisor Role!" });
    next();
  },

  verifyReceptionist: (req, res, next) => {
    if (req.role !== "receptionist" && req.role !== "superAdmin")
      return res.status(403).send({ message: "Require Receptionist Role!" });
    next();
  },

  verifyTenant: (req, res, next) => {
    if (req.role !== "tenant" && req.role !== "superAdmin")
      return res.status(403).send({ message: "Require Tenant Role!" });
    next();
  },
};

module.exports = authMiddlewares;
