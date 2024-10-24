const {
  Employee,
  Receptionist,
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
  Evaluation,
  Service,
  LostAndFound,
} = require("../models");
const { validationUtils } = require("../utils");

const tenantController = {
  getDashboard: async (req, res) => {
    try {
      const tenant_id = req.id;
      const towerId = req.towerId;

      const complaints = await Complaint.find({ tenant_id });
      let complaintsData = {};
      complaintsData.sent = complaints.length;
      complaintsData.resolved = complaints.filter(
        (complaint) => complaint.is_resolved
      ).length;
      complaintsData.unresolved = complaintsData.sent - complaintsData.resolved;
      // get the 5 oldest unresolved complaints
      complaintsData.oldest = complaints
        .filter((complaint) => !complaint.is_resolved)
        .sort((a, b) => a.date - b.date)
        .slice(0, 5);

      const employees = await Employee.find({ tenant_id });
      const employeeData = {};
      employeeData.total = employees.length;
      employeeData.active = employees.filter(
        (employee) => employee.status_employment
      ).length;

      const bookings = await RoomBooking.find({ tenant_id });

      const etagAllocations = await EtagAllocation.find({ tenant_id });
      const etags = {};
      etags.issued = etagAllocations.filter(
        (allocation) => allocation.is_issued
      ).length;
      etags.pending = etagAllocations.filter(
        (allocation) => allocation.is_requested
      ).length;
      etags.total = etags.issued + etags.pending;

      const gatePassesAllocations = await GatePass.find({ tenant_id });
      const gatePasses = {};
      gatePasses.total = gatePassesAllocations.length;
      // pending gate passes are those with is_approved = false and no receptionist id in handled_by
      gatePasses.issued = gatePassesAllocations.filter(
        (gatePass) => gatePass.is_approved
      ).length;
      gatePasses.pending = gatePassesAllocations.filter(
        (gatePass) => gatePass.is_approved == false && !gatePass.handled_by
      ).length;

      const cardAllocations = await CardAllocation.find({ tenant_id });
      const cards = {};
      cards.issued = cardAllocations.filter(
        (allocation) => allocation.is_active
      ).length;
      cards.notIssued = cardAllocations.length - cards.issued;

      const interns = {};
      interns.total = employees.filter(
        (employee) => employee.employee_type === "Intern"
      ).length;
      interns.nustian = employees.filter(
        (employee) => employee.is_nustian
      ).length;
      interns.nonNustian = interns.total - interns.nustian;

      const dashboard = {
        complaintsData,
        employees,
        employeeData,
        bookings,
        etags,
        gatePasses,
        cards,
        interns,
      };

      console.log("🚀 ~ getDashboard: ~ dashboard:", dashboard);
      return res.status(200).json({ dashboard });
    } catch (err) {
      console.log("🚀 ~ getDashboard: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const tenantId = req.id; // Assuming the tenant's ID is stored in req.id

      // Validate tenant
      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      var tenant = await Tenant.findById(tenantId).lean();
      // etags, gatepasses, cards, workpermits, violations, employees

      // Get number of etags
      tenant.etags = {};
      const etags = await EtagAllocation.find({
        tenant_id: tenantId,
        reason_decline: undefined,
      }).lean();
      tenant.etags.issued = etags.filter((etag) => etag.is_issued).length;
      tenant.etags.pending = etags.filter((etag) => etag.is_requested).length;

      // Get number of gatepasses
      tenant.gatepasses = {};
      const gatepasses = await GatePass.find({
        tenant_id: tenantId,
        reason_decline: undefined,
      }).lean();
      tenant.gatepasses.issued = gatepasses.filter(
        (gatepass) => gatepass.is_approved
      ).length;
      tenant.gatepasses.pending = gatepasses.filter(
        (gatepass) => !gatepass.is_approved
      ).length;

      // Get number of cards
      const cards = await CardAllocation.find({ tenant_id: tenantId }).lean();

      let employees = await Employee.find({
        tenant_id: tenantId,
      }).lean();

      tenant.totalEmployees = employees.length;

      const activeEmployees = employees.filter(
        (employee) => employee.status_employment
      );
      tenant.activeEmployees = activeEmployees.length;
      tenant.employees = activeEmployees;

      const internedEmployees = employees.filter(
        (employee) => employee.employee_type === "Intern"
      );
      tenant.internedEmployees = internedEmployees.length;

      // Nustian internees
      const nustianInterns = internedEmployees.filter(
        (employee) => employee.is_nustian
      );
      tenant.nustianInterns = nustianInterns.length;
      tenant.nonNustianInterns =
        tenant.internedEmployees - tenant.nustianInterns;

      const activeEmployeesWithCards = activeEmployees.filter((employee) =>
        cards.some(
          (card) => card.employee_id.toString() === employee._id.toString()
        )
      );
      tenant.cardsIssued = activeEmployeesWithCards.length;
      tenant.cardsNotIssued = tenant.activeEmployees - tenant.cardsIssued;

      // Get number of workpermits
      const workpermits = await WorkPermit.find({ tenant: tenantId }).lean();
      // Only approved work permits
      tenant.workpermits = workpermits.filter(
        (workpermit) => workpermit.status === "approved"
      ).length;

      // Get number of violations
      tenant.violations = tenant.complaints.length;

      tenant.meetingMinutes = 0;
      tenant.meetingMinutesMoney = 0;
      tenant.bookings?.forEach((booking) => {
        tenant.meetingMinutes += booking.minutes;
        tenant.meetingMinutesMoney += booking.cost;
      });

      return res.status(200).json({ tenant });
    } catch (err) {
      console.error(err);
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

  getEvaluations: async (req, res) => {
    try {
      const tenant_id = req.id;
      const evaluations = await Evaluation.find({ tenant: tenant_id })
        .populate("admin")
        .lean();
      return res.status(200).json({ evaluations });
    } catch (err) {
      console.log("🚀 ~ getEvaluations: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEvaluation: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { evaluationId } = req.params;
      const evaluation = await Evaluation.findById(evaluationId)
        .populate("admin")
        .lean();
      return res.status(200).json({ evaluation });
    } catch (err) {
      console.log("🚀 ~ getEvaluation: ~ err:", err);
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
        fatherName,
        image,
        email,
        phone,
        cnic,
        dob,
        doj,
        designation,
        empType,
        contractDuration,
        permAddress,
        tempAddress,
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
        permAddress,
        fatherName,
        tempAddress
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
        !permAddress ||
        !tempAddress
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

      // if (existingEmployee && !existingEmployee.status_employment) {
      //   req.laidOff = true;
      //   return await tenantController.updateEmployee(req, res);
      // }

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
        date_joining: doj,
        employee_type: empType,
        contract_duration: contractDuration,
        is_nustian: isNustian,
        father_name: fatherName,
        address: permAddress,
        temp_address: tempAddress,
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
        complaint_type: complaintType,
        subject,
        description,
        service_type: serviceType,
        service_name: serviceName,
        urgency,
      });
      await complaint.save();
      complaint.tenant_name = tenant.registration.organizationName;

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
        office,
        dateVacate,
        reason,
      } = req.body;

      if (
        !applicantName ||
        !applicantDesignation ||
        !applicantCnic ||
        !office ||
        !dateVacate ||
        !reason
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const exists = await Clearance.findOne({ tenant: tenant_id });
      if (exists) {
        return res.status(400).json({ message: "Clearance already initiated" });
      }

      const tenant = await Tenant.findById(tenant_id);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      // let tenantCardAllocations = await CardAllocation.find({ tenant_id });
      // const cardsIssued = tenantCardAllocations.filter(
      //   (allocation) => allocation.is_issued
      // ).length;
      // const cardsReturned = tenantCardAllocations.filter(
      //   (allocation) => allocation.is_returned
      // ).length;

      // let tenantEtagAllocations = await EtagAllocation.find({ tenant_id });
      // const etagsIssued = tenantEtagAllocations.filter(
      //   (allocation) => allocation.is_issued
      // ).length;
      // const etagsReturned = tenantEtagAllocations.filter(
      //   (allocation) => allocation.is_returned
      // ).length;

      // const utilities = {
      //   cards: {
      //     issued: cardsIssued,
      //     returned: cardsReturned,
      //   },
      //   etags: {
      //     issued: etagsIssued,
      //     returned: etagsReturned,
      //   },
      // };

      // const dateJoining = new Date(tenant.dateJoining);

      // const offices = tenant.offices.map((office) => office.number).join(", ");
      // const clearanceForm = {
      //   tenantName: tenant.registration.organizationName,
      //   category: tenant.registration.category,
      //   offices,
      //   applicantName,
      //   applicantDesignation,
      //   applicantCnic,
      //   constractStart: dateJoining,
      //   contractEnd: new Date(dateJoining.setMonth(dateJoining.getMonth() + 6)),
      //   dateVacate,
      //   // utilities,
      //   reason,
      // };

      const clearance = new Clearance({
        tower: towerId,
        tenant: tenant_id,
        applicant_name: applicantName,
        applicant_designation: applicantDesignation,
        applicant_cnic: applicantCnic,
        office,
        date_vacate: dateVacate,
        reason,
        // utilities,
      });

      await clearance.save();

      return res
        .status(200)
        .json({ message: "Clearance initiated", clearance });
    } catch (err) {
      console.log("🚀 ~ initiateClearance: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  submitEvaluation: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { evaluationId, evaluationBody } = req.body;
      console.log("🚀 ~ submitEvaluation: ~ evaluationId:", evaluationId);
      console.log("🚀 ~ submitEvaluation: ~ evaluationBody:", evaluationBody);

      // Validate tenant
      const validateTenant = await validationUtils.validateTenant(tenant_id);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      // Find the evaluation document for the tenant
      const evaluation = await Evaluation.findById(evaluationId);
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }

      // Update the evaluation document with the provided data
      evaluation.economic_performance = evaluationBody.economic_performance;
      evaluation.innovation_technology = evaluationBody.innovation_technology;
      evaluation.nust_interaction = evaluationBody.nust_interaction;
      evaluation.other_details = evaluationBody.other_details;
      evaluation.is_submitted = true; // Mark as submitted
      evaluation.date_submitted = new Date();

      // Save the updated evaluation document
      await evaluation.save();

      return res
        .status(200)
        .json({ message: "Evaluation submitted successfully", evaluation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  giveComplaintFeedback: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { complaintId, feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({ message: "Please provide feedback" });
      }

      const validation = await validationUtils.validateComplaint(complaintId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const complaint = await Complaint.findById(complaintId);
      if (!complaint.allow_tenant_feedback) {
        return res.status(400).json({ message: "Feedback not allowed" });
      }

      const feedbackObj = {
        feedback,
        date: new Date(),
        is_tenant: true,
      };

      complaint.feedback.push(feedbackObj);

      await complaint.save();

      return res
        .status(200)
        .json({ message: "Feedback given successfully", complaint });
    } catch (err) {
      console.log("🚀 ~ giveComplaintFeedback: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  reOpenComplaint: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { complaintId } = req.body;

      const validation = await validationUtils.validateComplaint(complaintId);
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(400).json({ message: "Complaint not found" });
      }

      // Check if complaint is already open
      if (complaint.status === "pending") {
        return res.status(400).json({ message: "Complaint already open" });
      }

      // Check if the complaint was resolved within the last day
      const oneDayInMillis = 24 * 60 * 60 * 1000;
      const now = new Date();
      let timeSinceResolved = now - new Date(complaint.date_resolved);

      if (timeSinceResolved > oneDayInMillis) {
        return res.status(400).json({
          message:
            "Complaint can only be reopened within one day of resolution",
        });
      }

      // convert timeSinceResolved to minutes
      timeSinceResolved = timeSinceResolved / (1000 * 60);

      complaint.status = "pending";
      complaint.is_resolved = false;
      complaint.date_resolved = undefined;
      complaint.general_resolved_by = undefined;
      complaint.time_to_resolve = undefined; // Reset time to resolve
      complaint.buffer_time += timeSinceResolved; // Set buffer time to time since resolved
      if (complaint.feedback == undefined) 
      
      if (complaint.complaint_type === "Service") {
        const receptionist = await Receptionist.findById(
          complaint.service_resolved_by
        );
        receptionist.handled_complaints -= 1;
        await receptionist.save();
        complaint.service_resolved_by = undefined;
      }

      await complaint.save();

      return res
        .status(200)
        .json({ message: "Complaint reopened successfully", complaint });
    } catch (err) {
      console.log("🚀 ~ reOpenComplaint: ~ err:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const tenant_id = req.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Please provide current and new password" });
      }

      const tenant = await Tenant.findById(tenant_id);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }

      const isMatch = await tenant.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid current password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      tenant.password = hashedPassword;
      await tenant.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.log("🚀 ~ updatePassword: ~ err:", err);
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
        fatherName,
        email,
        phone,
        designation,
        address,
        tempAddress,
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
