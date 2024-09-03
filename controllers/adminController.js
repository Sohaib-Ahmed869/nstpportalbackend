const Admin = require("../models/admin");
const Tenant = require("../models/tenant");
const Employee = require("../models/employee");

const adminController = {
  generateCard: async (req, res) => {
    try {
      const { tenantID, employeeID } = req.body;
      if (!tenantID || !employeeID) {
        return res
          .status(400)
          .json({ message: "Please provide tenantID and employeeID" });
      }

      const tenant = await Tenant.findById(tenantID);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      const employee = await Employee.findById(employeeID);
      
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = adminController;
