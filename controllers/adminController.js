const Admin = require("../models/admin");
const Tenant = require("../models/tenant");
const Employee = require("../models/employee");
const CardAllocation = require("../models/cardAllocation");
const EtagAllocation = require("../models/etagAllocation");

const adminController = {
  generateCard: async (req, res) => {
    try {
      const sponsor = "NSTP";
      const { employeeId, validity } = req.body;
      if (!employeeId || !validity) {
        return res
          .status(400)
          .json({ message: "Please provide employeeID and validity" });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const cardAllocation = await CardAllocation.findOne({
        employee_id: employeeId,
      });

      cardAllocation.is_issued = true;
      cardAllocation.date_issued = new Date();

      await cardAllocation.save();

      const card = {
        photo: employee.photo,
        name: employee.name,
        designation: employee.designation,
        cnic: employee.cnic,
        institute: employee.tenant_name,
        sponsor: sponsor,
        vehicleNumber: "N/A",
        validity: validity,
      };

      return res
        .status(200)
        .json({ message: "Card issued successfully", card });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  generateEtag: async (req, res) => {
    try {
      const { employeeId, validity, etagNumber } = req.body;
      if (!employeeId || !validity || !etagNumber) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const etagAllocation = await EtagAllocation.findOne({
        employee_id: employeeId,
      });

      etagAllocation.is_issued = true;
      etagAllocation.date_issued = new Date();

      await etagAllocation.save();

      const etag = {
        etagNumber,
      }; // fill this object with the required fields

      return res
        .status(200)
        .json({ message: "Etag issued successfully", etag });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = adminController;
