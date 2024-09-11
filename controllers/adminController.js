const Admin = require("../models/admin");
const Tenant = require("../models/tenant");
const Employee = require("../models/employee");
const CardAllocation = require("../models/cardAllocation");
const EtagAllocation = require("../models/etagAllocation");
const Service = require("../models/service");
const Complaint = require("../models/complaint");
const { getEmployees } = require("./tenantController");

const adminController = {
  generateCard: async (req, res) => {
    try {
      const sponsor = "NSTP";
      const { employeeId, cardNumber, validity } = req.body;
      if (!employeeId || cardNumber == undefined || !validity) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const cardAllocation = await CardAllocation.findOne({
        employee_id: employeeId,
      });

      cardAllocation.card_number = cardNumber;
      cardAllocation.is_issued = true;
      cardAllocation.date_issued = new Date();

      await cardAllocation.save();

      const card = {
        cardNumber: cardNumber,
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
      if (!employeeId || !validity || etagNumber == undefined) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const etagAllocation = await EtagAllocation.findOne({
        employee_id: employeeId,
      });

      etagAllocation.etag_number = etagNumber;
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

  addService: async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const service = new Service({
        name,
        description,
      });

      await service.save();

      return res
        .status(200)
        .json({ message: "Service added successfully", service });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getTenants: async (req, res) => {
    try {
      const tenants = await Tenant.find();
      return res.status(200).json({ tenants });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEmployees: async (req, res) => {
    try {
      const employees = await Employee.find();
      return res.status(200).json({ employees });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getTenantEmployees: async (req, res) => {
    try {
      const tenantId = req.params.id;
      const employees = await Employee.find({ tenant_id: tenantId });
      return res.status(200).json({ employees });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.find();
      return res.status(200).json({ complaints });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  resolveComplaint: async (req, res) => {
    try {
      const complaintId = req.params.id;
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(400).json({ message: "Complaint not found" });
      }

      complaint.is_resolved = true;
      await complaint.save();

      return res
        .status(200)
        .json({ message: "Complaint resolved successfully", complaint });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = adminController;
