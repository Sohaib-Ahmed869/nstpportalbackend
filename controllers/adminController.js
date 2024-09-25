console.log("Hello adminC");
const {
  Tenant,
  Receptionist,
  Employee,
  Complaint,
  CardAllocation,
  EtagAllocation,
  Service,
  MeetingRoom,
} = require("../models");
const {
  validateAdminAndTower,
  validateTenant,
  validateMeetingRoom,
  validateService,
  validateComplaint,
} = require("../utils/validationUtils");

const adminController = {
  getTenants: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const tenants = await Tenant.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ tenants });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getReceptionists: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const receptionists = await Receptionist.find({ tower: towerId }).lean();
      return res.status(200).json({ receptionists });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEmployees: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const employees = await Employee.find({
        tower: towerId,
      }).lean();

      return res.status(200).json({ employees });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getComplaints: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const complaints = await Complaint.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ complaints });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getTenantEmployees: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const tenantId = req.params.tenantId;
      const adminId = req.id;

      const validTenant = await validateTenant(tenantId);
      if (!validTenant.isValid) {
        return res
          .status(validTenant.status)
          .json({ message: validTenant.message });
      }

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const employees = await Employee.find({
        tenant_id: tenantId,
      }).lean();

      return res.status(200).json({ employees });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getCardAllocations: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const cardAllocations = await CardAllocation.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ cardAllocations });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEtagAllocations: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const etagAllocations = await EtagAllocation.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ etagAllocations });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  generateCard: async (req, res) => {
    try {
      const adminId = req.id;
      const { employeeId, cardNumber, validity } = req.body;
      if (!employeeId || cardNumber == undefined || !validity) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const employee = await Employee.findById(employeeId)
        .populate("tower")
        .lean();
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const towerId = employee.tower._id;
      const sponsor = employee.tower.name;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
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
        image: employee.image,
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
      const adminId = req.id;
      const { employeeId, validity, etagNumber } = req.body;

      if (!employeeId || !validity || !etagNumber) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const employee = await Employee.findById(employeeId)
        .populate("tower")
        .lean();
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const towerId = employee.tower._id;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const etagAllocation = await EtagAllocation.findOne({
        employee_id: employeeId,
      });

      etagAllocation.etag_number = etagNumber;
      etagAllocation.is_issued = true;
      etagAllocation.is_active = true;
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
      const adminId = req.id;
      const { towerId, name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const service = new Service({
        tower: towerId,
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

  addMeetingRoom: async (req, res) => {
    try {
      const adminId = req.id;
      const {
        towerId,
        name,
        floor,
        timeStart,
        timeEnd,
        description,
        capacity,
      } = req.body;
      if (!name || !floor || !timeStart || !timeEnd) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // add meeting room to tower
      const meetingRoom = new MeetingRoom({
        tower: towerId,
        name,
        floor,
        time_start: timeStart,
        time_end: timeEnd,
        description,
        capacity,
      });

      await meetingRoom.save();

      return res
        .status(200)
        .json({ message: "Meeting room added successfully", meetingRoom });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  assignOffice: async (req, res) => {
    // CONFIRM office service
    try {
      const { tenantId, office } = req.body;

      // Validate tenant
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Add the new office to the tenant's offices array
      tenant.offices.push(office);

      // Save the updated tenant document
      await tenant.save();

      res.status(200).json({ message: "Office assigned successfully", tenant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  resolveComplaint: async (req, res) => {
    try {
      const adminId = req.id;
      const { complaintId } = req.body;
      const complaintValidation = await validateComplaint(complaintId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const complaint = await Complaint.findById(complaintId);
      const towerId = complaint.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (complaint.is_resolved) {
        return res.status(400).json({ message: "Complaint already resolved" });
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

  layOffEmployee: async (req, res) => {
    try {
      const adminId = req.id;
      const { employeeId } = req.body;
      const employeeValidation = await validateEmployee(employeeId);
      if (!employeeValidation.isValid) {
        return res
          .status(employeeValidation.status)
          .json({ message: employeeValidation.message });
      }

      const employee = await Employee.findById(employeeId);
      const towerId = employee.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (!employee.status_employment) {
        return res.status(400).json({ message: "Employee already laid off" });
      }

      employee.status_employment = false;
      employee.layoff_date = new Date();
      await employee.save();

      return res
        .status(200)
        .json({ message: "Employee laid off successfully", employee });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  startCompanyTenure: async (req, res) => {
    try {
      const adminId = req.id;
      const { tenantId } = req.body;
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      const towerId = tenant.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (tenant.statusTenancy) {
        return res.status(400).json({ message: "Tenancy already started" });
      }

      tenant.statusTenancy = true;
      tenant.dateJoining = new Date();
      await tenant.save();

      return res
        .status(200)
        .json({ message: "Tenancy started successfully", tenant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  endCompanyTenure: async (req, res) => {
    try {
      const adminId = req.id;
      const { tenantId } = req.body;
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      const towerId = tenant.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (!tenant.statusTenancy) {
        return res.status(400).json({ message: "Tenancy already ended" });
      }

      tenant.statusTenancy = false;
      tenant.dateLeaving = new Date();
      await tenant.save();

      return res
        .status(200)
        .json({ message: "Tenancy ended successfully", tenant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateMeetingRoom: async (req, res) => {
    try {
      const adminId = req.id;
      const {
        meetingRoomId,
        name,
        floor,
        timeStart,
        timeEnd,
        description,
        capacity,
      } = req.body;
      if (!name || !floor || !timeStart || !timeEnd) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const meetingRoomValidation = await validateMeetingRoom(meetingRoomId);
      if (!meetingRoomValidation.isValid) {
        return res
          .status(meetingRoomValidation.status)
          .json({ message: meetingRoomValidation.message });
      }

      const meetingRoom = await MeetingRoom.findById(meetingRoomId);
      const towerId = meetingRoom.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      meetingRoom.name = name;
      meetingRoom.floor = floor;
      meetingRoom.time_start = timeStart;
      meetingRoom.time_end = timeEnd;
      meetingRoom.description = description;
      meetingRoom.capacity = capacity;

      await meetingRoom.save();

      return res
        .status(200)
        .json({ message: "Meeting room updated successfully", meetingRoom });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteMeetingRoom: async (req, res) => {
    try {
      const adminId = req.id;
      const { meetingRoomId } = req.body;

      const meetingRoomValidation = await validateMeetingRoom(meetingRoomId);
      if (!meetingRoomValidation.isValid) {
        return res
          .status(meetingRoomValidation.status)
          .json({ message: meetingRoomValidation.message });
      }

      const meetingRoom = await MeetingRoom.findById(meetingRoomId);
      const towerId = meetingRoom.tower;

      const validation = await validateAdminAndTower(adminId, towerId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      await meetingRoom.remove();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  
};

module.exports = adminController;

/*
req body for assignOffice
{
  "tenantId":"66ea5d475fa58a611ba1e0c4",
  "office":{
    "tower":"66ea52292b2783144e29063f",
    "floor":"1",
    "wing":"1",
    "officeNumber":"1103"
  }
}
*/
