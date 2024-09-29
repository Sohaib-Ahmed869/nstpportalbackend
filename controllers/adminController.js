const {
  Tenant,
  Receptionist,
  Employee,
  Complaint,
  CardAllocation,
  EtagAllocation,
  Service,
  Room,
  Clearance,
  GatePass,
  WorkPermit,
} = require("../models");
const { validationUtils } = require("../utils");

const COMPANY_CATEGORIES = ["Company", "Cube 8", "Hatch 8", "Startup"];

const adminController = {
  getDashboard: async (req, res) => {
    try {
      const adminId = req.id;
      const towerId = req.params.towerId;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // get all tenants
      const tenants = await Tenant.find({ tower: towerId, statusTenancy: true })
        .select(
          "registration.organizationName registration.companyEmail registration.category industrySector.category"
        )
        .lean();
      // get number of employees for each tenant
      const tenantsWithEmployees = await Promise.all(
        tenants.map(async (tenant) => {
          const employees = await Employee.find({
            tenant_id: tenant._id,
          }).lean();
          tenant.employees = employees.length;
          return tenant;
        })
      );

      // get company categories
      const companyCategories = COMPANY_CATEGORIES;
      const companyCategoriesCount = {};
      companyCategories.forEach((category) => {
        companyCategoriesCount[category] = tenants.filter(
          (tenant) => tenant.registration.category === category
        ).length;
      });

      // get number of cards issued
      let cards = await CardAllocation.find({ tower: towerId }).lean();
      const cardsIssued = cards.filter((card) => card.is_issued).length;
      const cardsReturned = cards.filter((card) => card.is_returned).length;
      const cardRequested = cards.filter((card) => card.is_requested).length;
      cards = {
        issued: cardsIssued,
        returned: cardsReturned,
        requested: cardRequested,
      };

      // get number of etags issued
      let etags = await EtagAllocation.find({ tower: towerId }).lean();
      const etagsIssued = etags.filter((etag) => etag.is_issued).length;
      const etagsRequested = etags.filter((etag) => etag.is_requested).length;
      etags = {
        issued: etagsIssued,
        requested: etagsRequested,
      };

      // get complaints with type "General"
      let complaints = await Complaint.find({
        tower: towerId,
        type: "General",
      }).lean();
      const complaintsResolved = complaints.filter((complaint) => {
        return (
          complaint.status == "Resolved" &&
          complaint.general_handled_by == adminId
        );
      }).length;

      const complaintsPending = complaints.filter((complaint) => {
        return complaint.status == "Pending";
      }).length;

      complaints = {
        total: complaints.length,
        resolved: complaintsResolved,
        pending: complaintsPending,
      };

      const dashboard = {
        cards,
        complaints,
        tenants: tenantsWithEmployees,
        companyCategories: companyCategoriesCount,
        etags,
      };

      return res.status(200).json({ dashboard });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getTenants: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

  getTenant: async (req, res) => {
    try {
      const adminId = req.id;
      const { towerId, tenantId } = req.params;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      var tenant = await Tenant.findById(tenantId).lean();
      //etags, gatepasses, cards, workpermits, violations, employees

      // get number of etags
      const etags = await EtagAllocation.find({ tenant_id: tenantId }).lean();
      tenant.etags = etags.length;

      // get number of gatepasses
      const gatepasses = await GatePass.find({ tenant_id: tenantId }).lean();
      tenant.gatepasses = gatepasses.length;

      // get number of cards
      const cards = await CardAllocation.find({ tenant_id: tenantId }).lean();

      const employees = await Employee.find({ tenant_id: tenantId }).lean();
      tenant.employees = employees;

      const activeEmployees = employees.filter(
        (employee) => employee.status_employment
      );
      tenant.activeEmployees = activeEmployees.length;

      const internedEmployees = activeEmployees.filter(
        (employee) => employee.employee_type === "intern"
      );
      tenant.internedEmployees = internedEmployees.length;

      // nustian internees
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

      // get number of workpermits
      const workpermits = await WorkPermit.find({ tenant_id: tenantId }).lean();
      // only approved work permits
      tenant.workpermits = workpermits.filter(
        (workpermit) => workpermit.status === "approved"
      ).length;

      // get number of violations
      tenant.violations = tenant.complaints.length;

      return res.status(200).json({ tenant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getReceptionists: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validTenant = await validationUtils.validateTenant(tenantId);
      if (!validTenant.isValid) {
        return res
          .status(validTenant.status)
          .json({ message: validTenant.message });
      }

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

  getRooms: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const rooms = await Room.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ rooms });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getServices: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const services = await Service.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ services });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getReceptionistsPerformance: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const adminId = req.id;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const receptionists = await Receptionist.find({
        tower: towerId,
      }).lean();

      const receptionistsPerformance = receptionists.map((receptionist) => {
        return {
          id: receptionist._id,
          name: receptionist.name,
          handledBookings: receptionist.handled_bookings,
          handledComplaints: receptionist.handled_complaints,
          handledGatepasses: receptionist.handled_gatepasses,
        };
      });

      return res.status(200).json({ receptionistsPerformance });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  addTenant: async (req, res) => {
    try {
      console.log("🚀 ~ tenantSignup: ~ req.body", req.body);
      const {
        registration,
        contactInfo,
        stakeholders,
        companyProfile,
        industrySector,
        companyResourceComposition,
      } = req.body;

      console.log(
        "🚀 ~ tenantSignup: ~ ",
        registration,
        contactInfo,
        stakeholders,
        companyProfile,
        industrySector,
        companyResourceComposition
      );

      const registrationFields = [
        "category",
        "organizationName",
        "presentAddress",
        "website",
        "companyEmail",
      ];

      const contactInformationFields = [
        "applicantName",
        "applicantPhone",
        "applicantEmail",
        // "applicantLandline",
      ];

      const stakeholderFields = [
        "name",
        "designation",
        "email",
        "presentAddress",
        "nationality",
        // "dualNationality",
        "profile",
        "isNustAlumni",
        "isNustEmployee",
      ];

      const companyProfileFields = [
        "companyHeadquarters",
        "yearsInBusiness",
        "numberOfEmployees",
        "registrationNumber",
      ];

      const industrySectorFields = ["category", "rentalSpaceSqFt", "timeFrame"];

      const companyResourceCompositionFields = [
        "management",
        "engineering",
        "marketingAndSales",
        // "remainingPredominantArea",
        "areasOfResearch",
        // "nustSchoolToCollab",
      ];

      if (
        !validationUtils.validateRequiredFields(
          registration,
          registrationFields
        ) ||
        !validationUtils.validateRequiredFields(
          contactInfo,
          contactInformationFields
        ) ||
        !validationUtils.validateRequiredFieldsArray(
          stakeholders,
          stakeholderFields
        ) ||
        !validationUtils.validateRequiredFields(
          companyProfile,
          companyProfileFields
        ) ||
        !validationUtils.validateRequiredFields(
          industrySector,
          industrySectorFields
        ) ||
        !validationUtils.validateRequiredFields(
          companyResourceComposition,
          companyResourceCompositionFields
        )
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const username = registration.organizationName
        .replace(/\s+/g, "") // Remove spaces
        .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
        .toLowerCase(); // Convert to lowercase

      const password = process.env.TENANT_PASSWORD;

      const tenant = new Tenant({
        registration,
        contactInfo,
        stakeholders,
        companyProfile,
        industrySector,
        companyResourceComposition,

        username,
        password,
      });
      await tenant.save();

      res.status(200).json({ message: "Registeration successful", username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

  addRoom: async (req, res) => {
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

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // add room to tower
      const room = new Room({
        tower: towerId,
        name,
        floor,
        time_start: timeStart,
        time_end: timeEnd,
        description,
        capacity,
      });

      await room.save();

      return res.status(200).json({ message: "Room added successfully", room });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  assignOffice: async (req, res) => {
    // CONFIRM office service
    try {
      const adminId = req.id;
      const { tenantId, towerId, office } = req.body;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      tenant.tower = towerId;
      tenant.offices.push(office);
      tenant.dateJoining = new Date();
      tenant.statusTenancy = true;

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
      const complaintValidation = await validationUtils.validateComplaint(
        complaintId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      const complaint = await Complaint.findById(complaintId);
      const towerId = complaint.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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
      const employeeValidation = await validationUtils.validateEmployee(
        employeeId
      );
      if (!employeeValidation.isValid) {
        return res
          .status(employeeValidation.status)
          .json({ message: employeeValidation.message });
      }

      const employee = await Employee.findById(employeeId);
      const towerId = employee.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
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

  updateRoom: async (req, res) => {
    try {
      const adminId = req.id;
      const { roomId, name, floor, timeStart, timeEnd, description, capacity } =
        req.body;
      if (!name || !floor || !timeStart || !timeEnd) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const roomValidation = await validationUtils.validateRoom(roomId);
      if (!roomValidation.isValid) {
        return res
          .status(roomValidation.status)
          .json({ message: roomValidation.message });
      }

      const room = await Room.findById(roomId);
      const towerId = room.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      room.name = name;
      room.floor = floor;
      room.time_start = timeStart;
      room.time_end = timeEnd;
      room.description = description;
      room.capacity = capacity;

      await room.save();

      return res
        .status(200)
        .json({ message: "Room updated successfully", room });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  resolveClearance: async (req, res) => {
    try {
      const adminId = req.id;
      const { clearanceId } = req.body;

      const clearanceValidation = await validationUtils.validateClearance(
        clearanceId
      );
      if (!clearanceValidation.isValid) {
        return res
          .status(clearanceValidation.status)
          .json({ message: clearanceValidation.message });
      }

      const clearance = await Clearance.findById(clearanceId).populate(
        "tenant"
      );
      const towerId = clearance.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (clearance.is_resolved) {
        return res.status(400).json({ message: "Clearance already resolved" });
      }

      clearance.is_resolved = true;
      clearance.resolved_by = adminId;
      clearance.date_resolved = new Date();

      clearance.tenant.statusTenancy = false;

      await clearance.save();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  resolveWorkPermit: async (req, res) => {
    try {
      const adminId = req.id;
      const { workPermitId, approval } = req.body;

      if (approval == undefined) {
        return res
          .status(400)
          .json({ message: "Please provide approval status" });
      }

      const workPermitValidation = await validationUtils.validateWorkPermit(
        workPermitId
      );
      if (!workPermitValidation.isValid) {
        return res
          .status(workPermitValidation.status)
          .json({ message: workPermitValidation.message });
      }

      const workPermit = await WorkPermit.findById(workPermitId);
      const towerId = workPermit.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (workPermit.is_resolved) {
        return res
          .status(400)
          .json({ message: "Work permit already resolved" });
      }

      if (approval) {
        workPermit.status = "approved";
      } else {
        workPermit.status = "rejected";
      }

      workPermit.is_resolved = true;
      workPermit.resolved_by = adminId;
      workPermit.date_resolved = new Date();

      await workPermit.save();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const adminId = req.id;
      const { roomId } = req.body;

      const roomValidation = await validationUtils.validateRoom(roomId);
      if (!roomValidation.isValid) {
        return res
          .status(roomValidation.status)
          .json({ message: roomValidation.message });
      }

      const room = await Room.findById(roomId);
      const towerId = room.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      await room.remove();
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
