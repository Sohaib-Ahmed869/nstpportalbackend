const {
  Employee,
  CardAllocation,
  EtagAllocation,
  Tenant,
  Complaint,
  Room,
  RoomBooking,
  GatePass,
  WorkPermit,
  Clearance,
  Inspection,
  Service,
  LostAndFound,
} = require("../models");
const { validationUtils } = require("../utils");

const tenantController = {
  getEmployees: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const employees = await Employee.find({ tenant_id });
      return res.status(200).json({ employees, message: "Employees found" });
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
      return res.status(200).json({ cardAllocations });
    } catch (err) {
      console.log("🚀 ~ getCardAllocations: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEtagAllocations: async (req, res) => {
    try {
      console.log("🚀 ~ getEtagAllocations: ~ req.id:", req.id);
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const etagAllocations = await EtagAllocation.find({ tenant_id });
      // const activeAllocations = etagAllocations.filter((allocation) => {
      //   console.log("🚀 ~ getEtagAllocations: ~ allocation:", allocation);
      //   return allocation.is_active;
      // });
      return res.status(200).json({ etagAllocations });
    } catch (err) {
      console.log("🚀 ~ getEtagAllocations: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getGatePasses: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const gatePasses = await GatePass.find({ tenant_id });
      return res.status(200).json({ gatePasses });
    } catch (err) {
      console.log("🚀 ~ getGatePasses: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getComplaints: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const complaints = await Complaint.find({ tenant_id });
      return res.status(200).json({ complaints });
    } catch (err) {
      console.log("🚀 ~ getComplaints: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getWorkPermits: async (req, res) => {
    try {
      const tenant_id = req.id;
      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }
      const workPermits = await WorkPermit.find({ tenant: tenant_id });
      return res.status(200).json({ workPermits });
    } catch (err) {
      console.log("🚀 ~ getWorkPermits: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  viewClearance: async (req, res) => {
    try {
      const tenant_id = req.id;
      const clearance = await Clearance.find({ tenant: tenant_id });

      return res.status(200).json({ clearance });
    } catch (err) {
      console.log("🚀 ~ viewClearance: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getOccurences: async (req, res) => {
    try {
      const tenant_id = req.id;
      const complaints = await Tenant.findById(tenant_id).select("complaints");
      return res.status(200).json({ complaints });
    } catch (err) {
      console.log("🚀 ~ getOccurences: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getInspections: async (req, res) => {
    try {
      const tenant_id = req.id;
      const inspections = await Inspection.find({ tenant: tenant_id });
      return res.status(200).json({ inspections });
    } catch (err) {
      console.log("🚀 ~ getInspections: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getServices: async (req, res) => {
    try {
      const towerId = req.towerId;
      const services = await Service.find({ tower: towerId });
      return res.status(200).json({ services });
    } catch (err) {
      console.log("🚀 ~ getInspections: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getLostAndFound: async (req, res) => {
    try {
      const towerId = req.towerId;
      const lostAndFound = await LostAndFound.find({ tower: towerId });
      return res.status(200).json({ lostAndFound });
    } catch (err) {
      console.log("🚀 ~ getLostAndFound: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getRooms: async (req, res) => {
    try {
      const towerId = req.towerId;
      const rooms = await Room.find({ tower: towerId });
      return res.status(200).json({ rooms });
    } catch (err) {
      console.log("🚀 ~ getRooms: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getRoomBookings: async (req, res) => {
    try {
      const tenant_id = req.id;
      const bookings = await RoomBooking.find({ tenant_id });
      return res.status(200).json({ bookings });
    } catch (err) {
      console.log("🚀 ~ getRoomBooking: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllRoomBookings: async (req, res) => {
    try {
      const towerId = req.towerId;
      const bookings = await RoomBooking.find({ tower: towerId });
      return res.status(200).json({ bookings });
    } catch (err) {
      console.log("🚀 ~ getAllRoomBookings: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  registerEmployee: async (req, res) => {
    try {
      const tenantId = req.id;
      const towerId = req.towerId;
      console.log("🚀 ~ registerEmployee: ~ req.body:", req.body);
      const { empBody } = req.body;
      const {
        name,
        image,
        email,
        phone,
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
        phone,
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
        !phone ||
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
        tower: towerId,
        tenant_id: tenantId,
        tenant_name: tenantName,
        email,
        phone,
        name,
        image,
        designation,
        cnic,
        dob,
        address,
        date_joining: doj,
        employee_type: empType,
        contract_duration: contractDuration,
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
      const tower = employee.tower;

      const existingCard = await CardAllocation.findOne({
        tenant_id,
        employee_id: employeeId,
      });

      if (existingCard) {
        if (existingCard.is_requested) {
          return res.status(400).json({ message: "Card already requested" });
        }
        if (existingCard.is_issued) {
          return res.status(400).json({ message: "Card already issued" });
        }
      }

      let cardAllocation = new CardAllocation({
        tower,
        tenant_id,
        employee_id: employeeId,
      });

      cardAllocation.is_requested = true;
      cardAllocation.date_requested = new Date();
      await cardAllocation.save();

      return res
        .status(200)
        .json({ message: "Card requested successfully", cardAllocation });
    } catch (err) {
      console.log("🚀 ~ requestCard: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  returnCard: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { employeeId } = req.body;

      const validation = await validationUtils.validateTenantAndEmployee(
        tenant_id,
        employeeId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const cardAllocation = await CardAllocation.findOne({
        tenant_id,
        employee_id: employeeId,
      });
      if (!cardAllocation) {
        return res.status(400).json({ message: "No card allocation found" });
      }

      cardAllocation.is_returned = true;
      cardAllocation.is_issued = false;
      cardAllocation.date_returned = new Date();
      await cardAllocation.save();

      return res.status(200).json({ message: "Card returned successfully" });
    } catch (err) {
      console.log("🚀 ~ returnCard: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestEtag: async (req, res) => {
    try {
      const tenant_id = req.id;
      let { employeeId, plateNum } = req.body; // images

      if (!plateNum) {
        return res.status(400).json({ message: "Please provide plate number" });
      }

      plateNum = plateNum.toUpperCase();

      const validation = await validationUtils.validateTenantAndEmployee(
        tenant_id,
        employeeId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // chnage based on rule of etags
      const etagExists = await EtagAllocation.findOne({
        employee_id: employeeId,
        vehicle_number: plateNum,
      });
      if (etagExists) {
        return res
          .status(400)
          .json({ message: "Etag for this car already requested by Employee" });
      }

      const employee = await Employee.findById(employeeId)
        .select("tower")
        .lean();
      console.log("🚀 ~ requestEtag: ~ employee:", employee);
      const tower = employee.tower;

      const etagAllocation = new EtagAllocation({
        tower,
        tenant_id,
        employee_id: employeeId,
      });

      etagAllocation.vehicle_number = plateNum;
      etagAllocation.is_requested = true;
      etagAllocation.date_requested = new Date();
      await etagAllocation.save();

      return res
        .status(200)
        .json({ message: "Etag requested successfully", etagAllocation });
    } catch (err) {
      console.log("🚀 ~ requestEtag: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  returnEtag: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { employeeId } = req.body;

      const validation = await validationUtils.validateTenantAndEmployee(
        tenant_id,
        employeeId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const etagAllocation = await EtagAllocation.findOne({
        tenant_id,
        employee_id: employeeId,
      });
      if (!etagAllocation) {
        return res.status(400).json({ message: "No etag allocation found" });
      }

      etagAllocation.is_returned = true;
      etagAllocation.date_returned = new Date();
      await etagAllocation.save();

      return res.status(200).json({ message: "Etag returned successfully" });
    } catch (err) {
      console.log("🚀 ~ returnEtag: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestGatePass: async (req, res) => {
    try {
      console.log("🚀 ~ requestGatePass: ~ req.bod  y:", req.body);
      const tenant_id = req.id;
      const { guestName, guestCnic, guestContact, gateNumber } = req.body;

      if (
        !guestName ||
        !guestCnic ||
        !guestContact ||
        gateNumber === undefined
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      let towerId = await Tenant.findById(tenant_id).select("tower").lean();
      console.log("🚀 ~ requestGatePass: ~ towerId:", towerId);

      towerId = towerId.tower;
      console.log("🚀 ~ requestGatePass: ~ towerId:", towerId);

      const gatePass = new GatePass({
        tower: towerId,
        tenant_id,
        guest_name: guestName,
        guest_cnic: guestCnic,
        guest_contact: guestContact,
        gate_number: gateNumber,
        date: new Date(),
      });

      await gatePass.save();
      return res.status(200).json({ message: "Gate pass requested", gatePass });
    } catch (err) {
      console.log("🚀 ~ requestGatePass: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  generateComplaint: async (req, res) => {
    try {
      const tenant_id = req.id;
      const towerId = req.towerId;

      const { complaintType, subject, description, serviceType } = req.body;
      let { urgency } = req.body;
      if (!complaintType) {
        return res
          .status(400)
          .json({ message: "Please provide Complaint Type" });
      }

      let serviceName;
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
        serviceName = await Service.findById(serviceType).select("name");
        serviceName = serviceName.name;
        urgency = parseInt(urgency);
      }

      const tenant = await Tenant.findById(tenant_id)
        .select("registration.organizationName registration.companyEmail")
        .lean();

      console.log("🚀 ~ generateComplaint: ~ serviceName", serviceName);
      const complaint = new Complaint({
        tower: towerId,
        tenant_id,
        tenant_name: tenant.registration.organizationName,
        complaint_type: complaintType,
        subject,
        description,
        service_type: serviceType,
        service_name: serviceName,
        urgency,
      });
      await complaint.save();

      return res
        .status(200)
        .json({ message: "Complaint generated successfully", complaint });
    } catch (err) {
      console.log("🚀 ~ generateComplaint: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestRoomBooking: async (req, res) => {
    try {
      const tenant_id = req.id;
      const towerId = req.towerId;
      const { roomId, timeStart, timeEnd, reasonBooking } = req.body;

      const roomValidation = await validationUtils.validateRoom(roomId);
      if (!roomValidation.isValid) {
        return res
          .status(roomValidation.status)
          .json({ message: roomValidation.message });
      }

      if (!timeStart || !timeEnd) {
        return res.status(400).json({ message: "Please provide time slots" });
      }

      const booking = new RoomBooking({
        tower: towerId,
        tenant_id,
        room_id: roomId,
        time_start: timeStart,
        time_end: timeEnd,
        reason_booking: reasonBooking,
      });

      await booking.save();

      return res.status(200).json({ message: "Booking request sent", booking });
    } catch (err) {
      console.log("🚀 ~ bookRoom: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestWorkPermit: async (req, res) => {
    try {
      const tenant_id = req.id;
      const towerId = req.towerId;
      const { permitBody } = req.body;
      const {
        name,
        department,
        description,
        startDate: validFrom,
        endDate: validTo,
        detailedInfo,
        ppe: equipment,
      } = permitBody;

      if (
        !name ||
        !department ||
        !description ||
        !validFrom ||
        !validTo ||
        !detailedInfo ||
        !equipment
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const workPermit = new WorkPermit({
        tower: towerId,
        tenant: tenant_id,
        name,
        department,
        description,
        valid_from: validFrom,
        valid_to: validTo,
        detailed_information: detailedInfo,
        equipment,
      });

      await workPermit.save();
      return res.status(200).json({
        message: "Work permit requested successfully",
        id: workPermit._id,
      });
    } catch (err) {
      console.log("🚀 ~ requestWorkPermit: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  initiateClearance: async (req, res) => {
    try {
      const tenant_id = req.id;
      const towerId = req.towerId;

      const {
        applicantName,
        applicantDesignation,
        applicantCnic,
        dateVacate,
        reason,
      } = req.body;

      if (
        !applicantName ||
        !applicantDesignation ||
        !applicantCnic ||
        !dateVacate ||
        !reason
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const tenant = await Tenant.findById(tenant_id);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      let tenantCardAllocations = await CardAllocation.find({ tenant_id });
      const cardsIssued = tenantCardAllocations.filter(
        (allocation) => allocation.is_issued
      ).length;
      const cardsReturned = tenantCardAllocations.filter(
        (allocation) => allocation.is_returned
      ).length;

      let tenantEtagAllocations = await EtagAllocation.find({ tenant_id });
      const etagsIssued = tenantEtagAllocations.filter(
        (allocation) => allocation.is_issued
      ).length;
      const etagsReturned = tenantEtagAllocations.filter(
        (allocation) => allocation.is_returned
      ).length;

      const utilities = {
        cards: {
          issued: cardsIssued,
          returned: cardsReturned,
        },
        etags: {
          issued: etagsIssued,
          returned: etagsReturned,
        },
      };

      const offices = tenant.offices.map((office) => office.number).join(", ");
      const clearanceForm = {
        tenantName: tenant.registration.organizationName,
        category: tenant.registration.category,
        offices,
        applicantName,
        applicantDesignation,
        applicantCnic,
        constractStart: tenant.dateJoining,
        contractEnd: tenant.dateLeaving,
        dateVacate,
        utilities,
        reason,
      };

      const clearance = new Clearance({
        tower: towerId,
        tenant_id,
        applicant_name: applicantName,
        applicant_designation: applicantDesignation,
        applicant_cnic: applicantCnic,
        date_vacate: dateVacate,
        reason,
        utilities,
      });

      await clearance.save();

      return res
        .status(200)
        .json({ message: "Clearance initiated", clearance, clearanceForm });
    } catch (err) {
      console.log("🚀 ~ initiateClearance: ~ err:", err);
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
        phone,
        designation,
        address,
        empType,
        contractDuration,
        internType,
      } = empBody;

      const validation = await validationUtils.validateTenantAndEmployee(
        tenant_id,
        employeeId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
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
      employee.phone = phone;
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
        employee.layoff_date = undefined;
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

      const validation = await validationUtils.validateTenantAndEmployee(
        tenant_id,
        employeeId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const employee = await Employee.findById(employeeId);

      if (employee.status_employment === false) {
        return res.status(400).json({ message: "Employee already laid off" });
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

  cancelComplaint: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { complaintId } = req.params;

      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }

      const validation = await validationUtils.validateComplaint(complaintId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }
      const complaint = await Complaint.findByIdAndDelete(complaintId);

      return res
        .status(200)
        .json({ message: "Complaint cancelled successfully", complaint });
    } catch (err) {
      console.log("🚀 ~ cancelComplaint: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  cancelWorkPermit: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { permitId } = req.body;

      if (!tenant_id) {
        return res.status(400).json({ message: "Please provide tenant ID" });
      }

      const validation = await validationUtils.validateWorkPermit(permitId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }
      const workPermit = await WorkPermit.findByIdAndDelete(permitId);

      return res
        .status(200)
        .json({ message: "Work permit cancelled successfully", workPermit });
    } catch (err) {
      console.log("🚀 ~ cancelWorkPermit: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  cancelRoomBooking: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { bookingId } = req.params;
      const response = await validationUtils.validateTenantRoomBooking(
        tenant_id,
        bookingId
      );
      if (!response.isValid) {
        return res.status(response.status).json({ message: response.message });
      }

      const booking = await RoomBooking.findByIdAndDelete(bookingId);

      return res.status(200).json({ message: "Booking cancelled", booking });
    } catch (err) {
      console.log("🚀 ~ cancelRoomBooking: ~ err:", err);
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
    "phone": "0123123123",
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
