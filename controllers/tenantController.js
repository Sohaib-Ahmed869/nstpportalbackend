const Tenant = require("../models/tenant");
const Employee = require("../models/employee");
const CardAllocation = require("../models/cardAllocation");

const tenantController = {
  registerEmployee: async (req, res) => {
    try {
      const tenantId = req.id;
      console.log("🚀 ~ registerEmployee: ~ tenantId:", tenantId);
      if (!tenantId) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const tenant = await Tenant.findById(tenantId).select(
        "registration.organizationName"
      );
      console.log("🚀 ~ registerEmployee: ~ tenant:", tenant);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }
      const tenantName = tenant.registration.organizationName;
      if (!tenantName) {
        return res.status(400).json({ message: "Tenant name not found" });
      }
      const {
        email,
        name,
        designation,
        cnic,
        dob,
        dateJoining,
        contractType,
        contractEnd,
        statusEmployment,
        isNustian,
      } = req.body;

      if (
        !email ||
        !name ||
        !designation ||
        !cnic ||
        !dob ||
        !dateJoining ||
        !contractType ||
        !contractEnd ||
        statusEmployment === undefined ||
        isNustian === undefined
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }
      const employee = new Employee({
        tenant_id: tenantId,
        tenant_name: tenantName,
        email,
        name,
        designation,
        cnic,
        dob,
        date_joining: dateJoining,
        contract_type: contractType,
        contract_end: contractEnd,
        status_employment: statusEmployment,
        is_nustian: isNustian,
      });

      const cardAllocation = new CardAllocation({
        tenant_id: tenantId,
        employee_id: employee._id,
      });

      await cardAllocation.save();
      await employee.save();
      return res
        .status(200)
        .json({ message: "Employee registered successfully", employee });
    } catch (err) {
      console.log("🚀 ~ registerEmployee: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEmployees: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const employees = await Employee.find({ tenant_id });
      return res.status(200).json(employees);
    } catch (err) {
      console.log("🚀 ~ getEmployees: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestCard: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { employeeId } = req.body;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "No employee found" });
      }

      const cardAllocation = await CardAllocation.findOne({
        tenant_id,
        employee_id: employeeId,
      });
      if (!cardAllocation) {
        return res.status(400).json({ message: "No card allocation found" });
      }

      cardAllocation.is_requested = true;
      cardAllocation.date_requested = new Date();
      await cardAllocation.save();

      return res.status(200).json({ message: "Card requested successfully" });
    } catch (err) {
      console.log("🚀 ~ requestCard: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = tenantController;

/*
* Register Employee body
{
  "email": "employee@example.com",
  "name": "John Doe",
  "designation": "Software Engineer",
  "cnic": "12345-6789012-3",
  "dob": "1990-01-01T00:00:00.000Z",
  "dateJoining": "2022-01-01T00:00:00.000Z",
  "contractType": "Full-time",
  "contractEnd": "2025-01-01T00:00:00.000Z",
  "statusEmployment": true,
  "statusCard": false,
  "isNustian": true
}
*/
