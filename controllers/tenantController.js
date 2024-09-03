const Tenant = require("../models/tenant");
const Employee = require("../models/employee");

const tenantController = {
  registerEmployee: async (req, res) => {
    try {
      const tenantId = req.id;
      if (!tenantId) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const tenantName = await Tenant.findById(tenantId).select("name");
      if (!tenantName) {
        return res.status(400).json({ message: "Tenant not found" });
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

  // requestCard: async (req, res) => {
  //   try {
  //     const tenant_id = req.id;
  //     const { employeeId } = req.body;
  //     if (!tenant_id) {
  //       return res.status(400).json({ message: "Please provide tenant ID" });
  //     }
  //     const employees = await Employee.find({ tenant_id });
  //     if (!employees) {
  //       return res.status(400).json({ message: "No employees found" });
  //     }
  //     const employee = employees.find((emp) => emp._id == employeeId);
  //     if (!employee) {
  //       return res.status(400).json({ message: "Employee not found" });
  //     }
  //     if (employee.status_card) {
  //       return res.status(400).json({ message: "Card already requested" });
  //     }
  //     employee.status_card = true;
  //     await employee.save();
  //     return res.status(200).json({ message: "Card requested successfully" });
  //   } catch (err) {
  //     console.log("🚀 ~ requestCard: ~ err:", err);
  //     return res.status(500).json({ message: "Internal server error" });
  //   }
  // },
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
