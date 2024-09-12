const Tenant = require("../models/tenant");
const Employee = require("../models/employee");
const CardAllocation = require("../models/cardAllocation");
const EtagAllocation = require("../models/etagAllocation");
const Complaint = require("../models/complaint");
const Service = require("../models/service");

const tenantController = {
  registerEmployee: async (req, res) => {
    try {
      const tenantId = req.id;
      console.log("🚀 ~ registerEmployee: ~ req.body:", req.body);
      const { empBody } = req.body;
      const {
        name,
        photo,
        email,
        cnic,
        dob,
        doj,
        designation,
        empType,
        contractDuration,
        address,
        internType,
      } = empBody;

      console.log(
        "🚀 ~ registerEmployee ~ required fields:",
        name,
        email,
        cnic,
        dob,
        doj,
        designation,
        empType,
        address
      );

      if (
        !name ||
        !email ||
        !cnic ||
        !dob ||
        !doj ||
        !designation ||
        !empType ||
        !address
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const existingEmployee = await Employee.findOne({
        tenant_id: tenantId,
        cnic,
      });

      console.log(
        "🚀 ~ registerEmployee: ~ existingEmployee:",
        existingEmployee
      );

      if (existingEmployee && existingEmployee.status_employment) {
        return res.status(400).json({ message: "Employee already exists" });
      }

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
      const isNustian = internType === "Nustian" ? true : false;
      console.log("🚀 ~ registerEmployee: ~ isNustian:", isNustian);

      if (existingEmployee && !existingEmployee.status_employment) {
        req.laidOff = true;
        return await tenantController.updateEmployee(req, res);
      }

      console.log("🚀 ~ registerEmployee: ~ Continue");
      const employee = new Employee({
        tenant_id: tenantId,
        tenant_name: tenantName,
        email,
        name,
        photo,
        designation,
        cnic,
        dob,
        address,
        date_joining: doj,
        employee_type: empType,
        contract_duration: contractDuration,
        is_nustian: isNustian,
      });

      const cardAllocation = new CardAllocation({
        tenant_id: tenantId,
        employee_id: employee._id,
      });

      const etagAllocation = new EtagAllocation({
        tenant_id: tenantId,
        employee_id: employee._id,
      });

      await cardAllocation.save();
      await etagAllocation.save();
      await employee.save();
      return res
        .status(200)
        .json({ message: "Employee registered successfully", employee });
    } catch (err) {
      console.log("🚀 ~ registerEmployee: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateEmployee: async (req, res) => {
    try {
      const tenant_id = req.id;
      const laidOff = req.laidOff;
      console.log("🚀 ~ updateEmployee: ~ req.laidOff:", req.laidOff);
      console.log("🚀 ~ updateEmployee: ~ req.body:", req.body);
      const { employeeId, empBody } = req.body;
      const {
        name,
        email,
        designation,
        address,
        empType,
        contractDuration,
        internType,
      } = empBody;

      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }

      let employee;
      if (laidOff) {
        let cnic = empBody.cnic;
        console.log("🚀 ~ updateEmployee: ~ cnic:", cnic);
        employee = await Employee.findOne({ tenant_id, cnic });
      } else {
        employee = await Employee.findById(employeeId);
      }

      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const isNustian = internType === "Nustian" ? true : false;

      name ? (employee.name = name) : null;
      employee.email = email;
      employee.designation = designation;
      employee.address = address;
      employee.employee_type = empType;
      empType === "Contract"
        ? (employee.contract_duration = contractDuration)
        : (employee.contract_duration = undefined);
      empType === "Intern"
        ? (employee.is_nustian = isNustian)
        : (employee.is_nustian = undefined);

      if (laidOff) {
        employee.date_joining = new Date();
        employee.status_employment = true;
      }
      await employee.save();
      return res
        .status(200)
        .json({ message: "Employee updated successfully", employee });
    } catch (err) {
      console.log("🚀 ~ updateEmployee: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  layoffEmployee: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { employeeId } = req.body;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      employee.status_employment = false;
      employee.layoff_date = new Date();

      await employee.save();
      return res
        .status(200)
        .json({ message: "Employee laid off successfully", employee });
    } catch (err) {
      console.log("🚀 ~ layoffEmployee: ~ err:", err);
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

  getCardAllocations: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const cardAllocations = await CardAllocation.find({ tenant_id });
      return res.status(200).json(cardAllocations);
    } catch (err) {
      console.log("🚀 ~ getCardAllocations: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEtagAllocations: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const etagAllocations = await EtagAllocation.find({ tenant_id });
      return res.status(200).json(etagAllocations);
    } catch (err) {
      console.log("🚀 ~ getEtagAllocations: ~ err:", err);
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

  requestEtag: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { employeeId } = req.body; // images
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({ message: "No employee found" });
      }

      const etagAllocation = await EtagAllocation.findOne({
        tenant_id,
        employee_id: employeeId,
      });
      if (!etagAllocation) {
        return res.status(400).json({ message: "No etag allocation found" });
      }

      etagAllocation.is_requested = true;
      etagAllocation.date_requested = new Date();
      await etagAllocation.save();

      return res.status(200).json({ message: "Etag requested successfully" });
    } catch (err) {
      console.log("🚀 ~ requestEtag: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  generateComplaint: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const { complaintType, subject, description, serviceType } = req.body;
      let { urgency } = req.body;
      if (!complaintType) {
        return res
          .status(400)
          .json({ message: "Please provide Complaint Type" });
      }

      if (complaintType === "General") {
        if (!subject || !description) {
          return res
            .status(400)
            .json({ message: "Please provide Subject and Description" });
        }

        urgency = 3;
      } else if (complaintType === "Service") {
        if (!serviceType || urgency === undefined) {
          return res
            .status(400)
            .json({ message: "Please provide Service Type and Urgency" });
        }
      }

      const complaint = new Complaint({
        tenant_id,
        complaint_type: complaintType,
        subject,
        description,
        service_type: serviceType,
        urgency,
      });
      await complaint.save();
      return res
        .status(200)
        .json({ message: "Complaint generated successfully" });
    } catch (err) {
      console.log("🚀 ~ generateComplaint: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = tenantController;

/*
* Register Employee body
{
  "empBody": {
    "name": "John Doe",
    "email": "employee@example.com",
    "cnic": "6110166894529",
    "dob": "1990-01-01T00:00:00.000Z",
    "doj": "2022-01-01T00:00:00.000Z",
    "designation": "Software Engineer",
    "empType": "Full-time",
    "contractDuration": "6 Months",
    "address": "123, St 12, F-16/1, Islamabad, Pakistan"
  }
}

* Update Employee body
{
  "employeeId":"66e276775b184d3b3065cfde",
  "empBody": {
    "email": "employee@example.com",
    "designation": "Software Architect",
    "empType": "Full-time", // if contract then add contractDuration, if intern then add internType
    "address": "124, St 12, F-16/1, Islamabad, Pakistan"
  }
}

* Complaints
{
  "complaintType":"Service",
  "serviceType":"Electrician",
  "urgency":2
}

{
  "complaintType":"Service",
  "serviceType":"Electrician",
  "description":"Hexler bois are laughing out loud and watching CID on high volume"
}

*/
