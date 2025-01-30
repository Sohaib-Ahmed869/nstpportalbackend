const {
  Tenant,
  Receptionist,
  Employee,
  Complaint,
  CardAllocation,
  EtagAllocation,
  Service,
  Room,
  RoomType,
  RoomBooking,
  Clearance,
  GatePass,
  WorkPermit,
  LostAndFound,
  Evaluation,
  Blog,
} = require("../models");
const { validationUtils } = require("../utils");
const COMPANY_CATEGORIES = ["Company", "Cube 8", "Hatch 8", "Startup"];
const admin = require("firebase-admin");
const { ref, getDownloadURL } = require("firebase-admin/storage");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const firebase_blogs_dir = "blogs/";
const firebase_logos_dir = "logos/";
const nodemailer = require("nodemailer");

const generateUsername = async (registration) => {
  try {
    let baseUsername = registration.organizationName
      .replace(/\s+/g, "") // Remove spaces
      .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
      .toLowerCase(); // Convert to lowercase

    let username = baseUsername;
    let counter = 1;

    // Check if the username exists in the database
    while (await Tenant.exists({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: process.env.EMAIL,
    // pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getNumberOfCards = async (adminId) => {
  try {
    const validateAdmin = await validationUtils.validateAdmin(adminId);
    if (!validateAdmin.isValid) {
      return res
        .status(validateAdmin.status)
        .json({ message: validateAdmin.message });
    }

    const numberOfCards = await CardAllocation.countDocuments({
      card_number: { $exists: true },
    });

    return numberOfCards;
  } catch (err) {
    console.error(err);
    return -1;
  }
};

const getNumberOfEtags = async (adminId) => {
  try {
    const validateAdmin = await validationUtils.validateAdmin(adminId);
    if (!validateAdmin.isValid) {
      return res
        .status(validateAdmin.status)
        .json({ message: validateAdmin.message });
    }

    const numberOfEtags = await EtagAllocation.countDocuments({
      etag_number: { $exists: true },
    });

    return numberOfEtags;
  } catch (err) {
    console.error(err);
    return -1;
  }
};

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
      }).lean();

      // console.log("Complaints: ", complaints);
      const complaintsResolved = complaints.filter((complaint) => {
        return (
          complaint.complaint_type == "General" &&
          complaint.status == "resolved"
        );
      });
      // // console.log("Complaints Resolved: ",complaintsResolved);

      // calculate mean time to repair
      let generalMinutes = 0;
      let serviceMinutes = 0;
      let generalCount = 0;
      let serviceCount = 0;
      complaints.forEach((complaint) => {
        if (complaint.complaint_type == "General") {
          if (complaint.time_to_resolve != undefined) {
            generalMinutes += complaint.time_to_resolve;
            generalCount++;
          }
        } else {
          if (complaint.time_to_resolve != undefined) {
            serviceMinutes += complaint.time_to_resolve;
            serviceCount++;
          }
        }
      });

      const complaintsPending = complaints.filter((complaint) => {
        return (
          complaint.complaint_type == "General" && complaint.status == "pending"
        );
      });
      // // console.log("Complaints Pending: ",complaintsPending);

      complaints = {
        total: complaintsResolved.length + complaintsPending.length,
        resolved: complaintsResolved.length,
        pending: complaintsPending.length,
        mttr: {
          general: Math.floor(generalMinutes / generalCount),
          service: Math.floor(serviceMinutes / serviceCount),
        },
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

      for (const tenant of tenants) {
        const employeesCount = await Employee.countDocuments({
          tenant_id: tenant._id,
          status_employment: true,
        });
        tenant.numEmployees = employeesCount;
      }
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

      // get number of cards
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

      // nustian internees
      const nustianInterns = internedEmployees.filter(
        (employee) => employee.is_nustian
      );
      tenant.nustianInterns = nustianInterns.length;
      tenant.nonNustianInterns =
        tenant.internedEmployees - tenant.nustianInterns;

      tenant.cardsIssued = cards.filter((card) => card.is_issued).length;
      tenant.cardsNotIssued = tenant.activeEmployees - tenant.cardsIssued;

      // get number of workpermits
      const workpermits = await WorkPermit.find({ tenant: tenantId }).lean();
      // only approved work permits
      tenant.workpermits = workpermits.filter(
        (workpermit) => workpermit.status === "approved"
      ).length;

      // get number of violations
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

  getTenantLogoDownload: async (req, res) => {
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

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const { companyLogo, companyLogoToken } = tenant.registration;
      if (!companyLogo || !companyLogoToken) {
        return res.status(404).json({ message: "Logo not found" });
      }

      // verify if file exists
      const bucket = admin.storage().bucket();
      const file = bucket.file(`${firebase_logos_dir}${companyLogo}`);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ message: "Logo not found" });
      }

      return res.status(200).json({ downloadUrl: companyLogo });
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

      let complaints = await Complaint.find({
        tower: towerId,
        complaint_type: "General",
      }).populate({
        path: "tenant_id",
        select: "registration.organizationName",
      });

      complaints = complaints.map((complaint) => {
        let complaintObj = complaint.toObject();
        complaintObj.tenant_name =
          complaint.tenant_id.registration.organizationName;
        return complaintObj;
      });

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
      const { is_requested, is_issued } = req.query;
      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // Build the query object
      const query = { tower: towerId };
      if (is_requested !== undefined) {
        query.is_requested = is_requested === "true";
      }
      if (is_issued !== undefined) {
        query.is_issued = is_issued === "true";
      }

      const cardAllocations = await CardAllocation.find(query)
        .populate("employee_id")
        .lean();
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
      const { is_requested, is_issued } = req.query;
      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // Build the query object
      const query = { tower: towerId };
      if (is_requested !== undefined) {
        query.is_requested = is_requested === "true";
      }
      if (is_issued !== undefined) {
        query.is_issued = is_issued === "true";
      }

      const etagAllocations = await EtagAllocation.find(query)
        .populate("employee_id")
        .lean();
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
        // is_active: true,
      }).lean();
      return res.status(200).json({ rooms });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getRoomTypes: async (req, res) => {
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

      const roomTypes = await RoomType.find({
        tower: towerId,
        // is_active: true,
      }).lean();


      return res.status(200).json({ roomTypes });
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

  getOfficeRequests: async (req, res) => {
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
        $or: [{ tower: { $exists: false } }, { tower: null }],
        statusTenancy: false,
      });

      return res.status(200).json({ tenants });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getWorkPermits: async (req, res) => {
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

      const workPermits = await WorkPermit.find({
        tower: towerId,
      }).lean();

      // add tenant name
      await Promise.all(
        workPermits.map(async (workPermit) => {
          const tenant = await Tenant.findById(workPermit.tenant).lean();
          workPermit.tenant_name = tenant.registration.organizationName;
        })
      );
      return res.status(200).json({ workPermits });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getLostAndFound: async (req, res) => {
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

      const lostAndFound = await LostAndFound.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ lostAndFound });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getRoomBookings: async (req, res) => {
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

      const bookings = await RoomBooking.find({
        tower: towerId,
      }).lean();
      return res.status(200).json({ bookings });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getClearances: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const clearances = await Clearance.find({ tower: towerId }).lean();

      const detailedClearances = await Promise.all(
        clearances.map(async (clearance) => {
          const tenant = await Tenant.findById(clearance.tenant).lean();

          const etagAllocations = await EtagAllocation.find({
            tenant_id: clearance.tenant,
          }).lean();
          const etags = {};
          etags.issued =
            etagAllocations.filter((etag) => etag.is_issued).length | 0;
          etags.returned =
            etagAllocations.filter((etag) => etag.is_returned).length | 0;

          const cardAllocations = await CardAllocation.find({
            tenant_id: clearance.tenant,
          }).lean();
          const cards = {};
          cards.issued =
            cardAllocations.filter((card) => card.is_issued).length | 0;
          cards.returned =
            cardAllocations.filter((card) => card.is_returned).length | 0;

          // console.log(tenant.bookings);
          const roomBookingCost =
            tenant.bookings?.reduce((acc, booking) => acc + booking.cost, 0) |
            0;

          clearance.etags = etags;
          clearance.cards = cards;
          clearance.bookings = roomBookingCost;
          clearance.tenant_name = tenant.registration.organizationName;

          return clearance;
        })
      );

      return res.status(200).json({ clearances: detailedClearances });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getClearance: async (req, res) => {
    try {
      const clearanceId = req.params.clearanceId;
      const clearance = await Clearance.findById(clearanceId).lean();

      const tenant = await Tenant.findById(clearance.tenant).lean();

      const etagAllocations = await EtagAllocation.find({
        tenant_id: clearance.tenant,
      }).lean();

      const etags = {};
      etags.issued = etagAllocations.filter((etag) => etag.is_issued).length;
      etags.returned = etagAllocations.filter(
        (etag) => etag.is_returned
      ).length;

      const cardAllocations = await CardAllocation.find({
        tenant_id: clearance.tenant,
      }).lean();

      const cards = {};
      cards.issued = cardAllocations.filter((card) => card.is_issued).length;
      cards.returned = cardAllocations.filter(
        (card) => card.is_returned
      ).length;

      const roomBookingCost = tenant.bookings?.reduce(
        (acc, booking) => acc + booking.cost,
        0
      );

      clearance.etags = etags;
      clearance.cards = cards;
      clearance.bookings = roomBookingCost;

      return res.status(200).json({ clearance });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEvaluations: async (req, res) => {
    try {
      const towerId = req.params.towerId;
      const evaluations = await Evaluation.find({ tower: towerId }).lean();

      const detailedEvaluations = await Promise.all(
        evaluations.map(async (evaluation) => {
          const tenant = await Tenant.findById(evaluation.tenant)
            .select("registration.organizationName")
            .lean();
          evaluation.tenant_name = tenant.registration.organizationName;
          return evaluation;
        })
      );

      return res.status(200).json({ evaluations: detailedEvaluations });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getEvaluation: async (req, res) => {
    try {
      const evaluationId = req.params.evaluationId;
      const evaluation = await Evaluation.findById(evaluationId).lean();

      const tenant = await Tenant.findById(evaluation.tenant)
        .select("registration.organizationName")
        .lean();

      evaluation.tenant_name = tenant.registration.organizationName;

      return res.status(200).json({ evaluation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getNotes: async (req, res) => {
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

      const tenant = await Tenant.findById(tenantId)
        .select("notes")
        .populate("notes.admin", "name")
        .lean();

      let notes = [];
      if (tenant.notes) {
        notes = tenant.notes?.map((note) => {
          // check if note was written by the admin hisself
          let isEditable = false;
          if (note.admin._id.toString() == adminId) {
            isEditable = true;
          }
          return {
            id: note._id,
            note: note.note,
            date: note.date,
            adminName: note.admin.name,
            isEditable,
          };
        });
      }

      return res.status(200).json({
        notes,
        message: "Notes fetched successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find().lean();
      return res.status(200).json({ blogs });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getBlog: async (req, res) => {
    try {
      const blogId = req.params.blogId;
      const blog = await Blog.findById(blogId).lean();
      return res.status(200).json({ blog });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  addTenant: [
    upload.single("companyLogo"),
    async (req, res) => {
      try {
        const registration = JSON.parse(req.body.registration);
        const contactInfo = JSON.parse(req.body.contactInfo);
        const stakeholders = JSON.parse(req.body.stakeholders);
        const companyProfile = JSON.parse(req.body.companyProfile);
        const industrySector = JSON.parse(req.body.industrySector);
        const companyResourceComposition = JSON.parse(
          req.body.companyResourceComposition
        );
        const image = req.file;

        // console.log(registration);
        // console.log(contactInfo);
        // console.log(stakeholders);
        // console.log(companyProfile);
        // console.log(industrySector);
        // console.log(companyResourceComposition);

        // const registrationFields = [
        //   "category",
        //   "organizationName",
        //   "presentAddress",
        //   "website",
        //   "companyEmail",
        // ];

        // const contactInformationFields = [
        //   "applicantName",
        //   "applicantPhone",
        //   "applicantEmail",
        //   // "applicantLandline",
        // ];

        // const stakeholderFields = [
        //   "name",
        //   "designation",
        //   "email",
        //   "presentAddress",
        //   "nationality",
        //   // "dualNationality",
        //   "profile",
        //   "isNustAlumni",
        //   "isNustEmployee",
        // ];

        // const companyProfileFields = [
        //   "companyHeadquarters",
        //   "yearsInBusiness",
        //   "numberOfEmployees",
        //   "registrationNumber",
        // ];

        // const industrySectorFields = [
        //   "category",
        //   "rentalSpaceSqFt",
        //   "timeFrame",
        // ];

        // const companyResourceCompositionFields = [
        //   "management",
        //   "engineering",
        //   "marketingAndSales",
        //   // "remainingPredominantArea",
        //   "areasOfResearch",
        //   // "nustSchoolToCollab",
        // ];

        // if (
        //   !validationUtils.validateRequiredFields(
        //     registration,
        //     registrationFields
        //   ) ||
        //   !validationUtils.validateRequiredFields(
        //     contactInfo,
        //     contactInformationFields
        //   ) ||
        //   !validationUtils.validateRequiredFieldsArray(
        //     stakeholders,
        //     stakeholderFields
        //   ) ||
        //   !validationUtils.validateRequiredFields(
        //     companyProfile,
        //     companyProfileFields
        //   ) ||
        //   !validationUtils.validateRequiredFields(
        //     industrySector,
        //     industrySectorFields
        //   ) ||
        //   !validationUtils.validateRequiredFields(
        //     companyResourceComposition,
        //     companyResourceCompositionFields
        //   )
        // ) {
        //   return res
        //     .status(400)
        //     .json({ message: "Please provide all required fields" });
        // }

        if (!image) {
          return res.status(400).json({ message: "Image is required" });
        }

        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const imageFileName = `logos/${uuid}`;

        await bucket.file(imageFileName).save(image.buffer, {
          metadata: {
            contentType: image.mimetype,
            firebaseStorageDownloadTokens: uuid,
          },
        });

        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/logos%2F${uuid}?alt=media&token=${uuid}`;

        registration.companyLogo = imageUrl;
        registration.companyLogoToken = uuid;

        const username = await generateUsername(registration);
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

        res.status(200).json({ message: "Registration successful", username });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  ],

  // addTenant: async (req, res) => {
  //   try {
  //     const {
  //       registration,
  //       contactInfo,
  //       stakeholders,
  //       companyProfile,
  //       industrySector,
  //       companyResourceComposition,
  //     } = req.body;
  //     const registrationFields = [
  //       "category",
  //       "organizationName",
  //       "presentAddress",
  //       "website",
  //       "companyEmail",
  //     ];

  //     const contactInformationFields = [
  //       "applicantName",
  //       "applicantPhone",
  //       "applicantEmail",
  //       // "applicantLandline",
  //     ];

  //     const stakeholderFields = [
  //       "name",
  //       "designation",
  //       "email",
  //       "presentAddress",
  //       "nationality",
  //       // "dualNationality",
  //       "profile",
  //       "isNustAlumni",
  //       "isNustEmployee",
  //     ];

  //     const companyProfileFields = [
  //       "companyHeadquarters",
  //       "yearsInBusiness",
  //       "numberOfEmployees",
  //       "registrationNumber",
  //     ];

  //     const industrySectorFields = ["category", "rentalSpaceSqFt", "timeFrame"];

  //     const companyResourceCompositionFields = [
  //       "management",
  //       "engineering",
  //       "marketingAndSales",
  //       // "remainingPredominantArea",
  //       "areasOfResearch",
  //       // "nustSchoolToCollab",
  //     ];

  //     if (
  //       !validationUtils.validateRequiredFields(
  //         registration,
  //         registrationFields
  //       ) ||
  //       !validationUtils.validateRequiredFields(
  //         contactInfo,
  //         contactInformationFields
  //       ) ||
  //       !validationUtils.validateRequiredFieldsArray(
  //         stakeholders,
  //         stakeholderFields
  //       ) ||
  //       !validationUtils.validateRequiredFields(
  //         companyProfile,
  //         companyProfileFields
  //       ) ||
  //       !validationUtils.validateRequiredFields(
  //         industrySector,
  //         industrySectorFields
  //       ) ||
  //       !validationUtils.validateRequiredFields(
  //         companyResourceComposition,
  //         companyResourceCompositionFields
  //       )
  //     ) {
  //       return res
  //         .status(400)
  //         .json({ message: "Please provide all required fields" });
  //     }

  //     const username = await generateUsername(registration);
  //     const password = process.env.TENANT_PASSWORD;

  //     const tenant = new Tenant({
  //       registration,
  //       contactInfo,
  //       stakeholders,
  //       companyProfile,
  //       industrySector,
  //       companyResourceComposition,

  //       username,
  //       password,
  //     });
  //     await tenant.save();

  //     res.status(200).json({ message: "Registeration successful", username });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // },

  addService: async (req, res) => {
    try {
      const adminId = req.id;
      const { towerId, name, description, icon } = req.body;
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

      const existingService = await Service.findOne({
        tower: towerId,
        name,
        is_active: true,
      });

      if (existingService) {
        return res.status(400).json({ message: "Service already exists" });
      }

      const service = new Service({
        tower: towerId,
        name,
        description,
        icon,
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
      const { towerId, name, typeId, floor, timeStart, timeEnd } = req.body;
      if (!name || !typeId || !floor || !timeStart || !timeEnd) {
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

      const validateRoomType = await validationUtils.validateRoomType(typeId);
      if (!validateRoomType.isValid) {
        return res
          .status(validateRoomType.status)
          .json({ message: validateRoomType.message });
      }

      // add room to tower
      const room = new Room({
        tower: towerId,
        name,
        type: typeId,
        floor,
        time_start: timeStart,
        time_end: timeEnd,
      });

      await room.save();

      const typeName = await RoomType.findById(typeId).select("name");
      room.typeName = typeName.name;

      return res.status(200).json({ message: "Room added successfully", room });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  addRoomType: async (req, res) => {
    try {
      const adminId = req.id;
      const { towerId, name, capacity, rateList } = req.body;
      if (!name || !capacity) {
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

      const existingRoomType = await RoomType.findOne({
        tower: towerId,
        name,
        is_active: true,
      });

      if (existingRoomType) {
        return res.status(400).json({ message: "Room type already exists" });
      }

      const roomType = new RoomType({
        tower: towerId,
        name,
        capacity,
        rate_list: rateList,
      });

      await roomType.save();

      return res
        .status(200)
        .json({ message: "Room type added successfully", roomType });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  requestEvaluation: async (req, res) => {
    try {
      const adminId = req.id;
      let { tenantId, deadline } = req.body;
      if (!tenantId || !deadline) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      const evalExists = await Evaluation.findOne({
        tenant: tenantId,
        is_submitted: false,
      });
      if (evalExists) {
        return res
          .status(400)
          .json({ message: "Evaluation already requested" });
      }

      const tenant = await Tenant.findById(tenantId);
      // get tenant joining date
      const joiningDate = tenant.dateJoining;
      let dateStart;
      // if joining date is before this year, set dateStart to 1st Jan of this year
      if (joiningDate.getFullYear() < new Date().getFullYear()) {
        dateStart = new Date(new Date().getFullYear(), 0, 1);
      } else {
        dateStart = joiningDate;
      }

      // date end is end of this year
      const dateEnd = new Date(new Date().getFullYear(), 11, 31);
      deadline = new Date(deadline);

      const evaluation = new Evaluation({
        tower: tenant.tower,
        tenant: tenantId,
        admin: adminId,
        date_start: dateStart,
        date_end: dateEnd,
        deadline,
      });

      await evaluation.save();
      return res
        .status(200)
        .json({ message: "Evaluation requested sucessfully", evaluation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  addNote: async (req, res) => {
    try {
      const adminId = req.id;
      const { tenantId, note } = req.body;
      if (!tenantId || !note) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validateTenant = await validationUtils.validateTenant(tenantId);
      if (!validateTenant.isValid) {
        return res
          .status(validateTenant.status)
          .json({ message: validateTenant.message });
      }

      const tenant = await Tenant.findById(tenantId);

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        tenant.tower
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      tenant.notes.push({ admin: adminId, note });
      await tenant.save();

      return res.status(200).json({ message: "Note added successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  addBlog: [
    upload.single("image"),
    async (req, res) => {
      try {
        const adminId = req.id;
        const { title, imageIndex, caption, paragraphs } = req.body;
        const image = req.file;

        if (!title || !image || !paragraphs || imageIndex === undefined) {
          return res.status(400).json({ message: "Please provide all fields" });
        }

        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const imageFileName = `blogs/${uuid}`;

        // console.log(bucket.name);

        await bucket.file(imageFileName).save(image.buffer, {
          metadata: {
            contentType: image.mimetype,
            firebaseStorageDownloadTokens: uuid,
          },
        });

        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/blogs%2F${uuid}?alt=media&token=${uuid}`;

        const blog = new Blog({
          title,
          image: imageUrl,
          image_index: imageIndex,
          paragraphs,
          admin: adminId,
          token: uuid,
          caption,
        });

        await blog.save();

        return res
          .status(201)
          .json({ message: "Blog added successfully", blog });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  ],

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

      // send email to tenant
      const subject = "Welcome to NSTP";
      const text = `Your Tenant account has been successfully created. Your username is ${tenant.username} and password is ${process.env.TENANT_PASSWORD}`;
      // await sendEmail(tenant.registration.companyEmail, subject, text);

      res.status(200).json({ message: "Office assigned successfully", tenant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  acceptCardRequest: async (req, res) => {
    try {
      const adminId = req.id;
      let { allocationId, validity, cardNumber } = req.body;

      // if((validity == undefined || validity ==null || validity < 1) || (cardNumber == undefined || cardNumber == null || cardNumber < 0)) {
      //   return res
      //     .status(400)
      //     .json({ message: "Inalid Values" });
      // }

      if (!allocationId) {
        // add validity to required fields
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const validateCardAllocation =
        await validationUtils.validateCardAllocation(allocationId);
      if (!validateCardAllocation.isValid) {
        return res
          .status(validateCardAllocation.status)
          .json({ message: validateCardAllocation.message });
      }
      const cardAllocation = await CardAllocation.findById(allocationId);

      const towerId = cardAllocation.tower;
      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // const cardNumber = await getNumberOfCards(adminId);
      // if (cardNumber === -1) {
      //   return res
      //     .status(500)
      //     .json({ message: "Error in getting card number" });
      // }

      validity = validity || 6;
      cardAllocation.card_number = cardNumber || -1;
      cardAllocation.is_requested = false;
      cardAllocation.is_issued = true;
      cardAllocation.is_active = true;
      cardAllocation.is_declined = false;
      cardAllocation.validity = validity;
      cardAllocation.date_issued = new Date();
      cardAllocation.date_invalid = new Date(
        new Date().setMonth(new Date().getMonth() + validity)
      );

      await cardAllocation.save();

      return res
        .status(200)
        .json({ message: "Card issued successfully", cardAllocation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  rejectCardRequest: async (req, res) => {
    try {
      const adminId = req.id;
      const { allocationId, reasonDecline } = req.body;
      if (!allocationId || !reasonDecline) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validateCardAllocation =
        await validationUtils.validateCardAllocation(allocationId);
      if (!validateCardAllocation.isValid) {
        return res
          .status(validateCardAllocation.status)
          .json({ message: validateCardAllocation.message });
      }

      const cardAllocation = await CardAllocation.findById(allocationId);
      if (!allocationId) {
        return res
          .status(400)
          .json({ message: "Please provide allocation ID" });
      }

      const towerId = cardAllocation.tower;
      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      cardAllocation.is_requested = false;
      cardAllocation.is_declined = true;
      cardAllocation.reason_decline = reasonDecline;

      await cardAllocation.save();

      return res
        .status(200)
        .json({ message: "Card request rejected", cardAllocation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  acceptEtagRequest: async (req, res) => {
    try {
      const adminId = req.id;
      let { allocationId, validity, etagNumber } = req.body;

      // if(validity < 1 || etagNumber < 0){
      //   return res.status(400).json({ message: "Invalid Values" });
      // }

      if (!allocationId) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validateEtagAllocation =
        await validationUtils.validateEtagAllocation(allocationId);
      if (!validateEtagAllocation.isValid) {
        return res
          .status(validateEtagAllocation.status)
          .json({ message: validateEtagAllocation.message });
      }
      const etagAllocation = await EtagAllocation.findById(allocationId);
      const towerId = etagAllocation.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      // const etagNumber = await getNumberOfEtags(adminId);
      // if (etagNumber === -1) {
      //   return res
      //     .status(500)
      //     .json({ message: "Error in getting etag number" });
      // }

      validity = validity || 6;
      etagAllocation.etag_number = etagNumber || -1;
      etagAllocation.is_requested = false;
      etagAllocation.is_issued = true;
      etagAllocation.is_active = true;
      etagAllocation.validity = validity;
      etagAllocation.date_issued = new Date();
      etagAllocation.date_invalid = new Date(
        new Date().setMonth(new Date().getMonth() + validity)
      );

      await etagAllocation.save();

      return res
        .status(200)
        .json({ message: "Etag issued successfully", etagAllocation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  rejectEtagRequest: async (req, res) => {
    try {
      const adminId = req.id;
      const { allocationId, reasonDecline } = req.body;

      if (!allocationId || !reasonDecline) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      const validateEtagAllocation =
        await validationUtils.validateEtagAllocation(allocationId);
      if (!validateEtagAllocation.isValid) {
        return res
          .status(validateEtagAllocation.status)
          .json({ message: validateEtagAllocation.message });
      }

      const etagAllocation = await EtagAllocation.findById(allocationId);
      const towerId = etagAllocation.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      etagAllocation.is_requested = false;
      etagAllocation.reason_decline = reasonDecline;

      await etagAllocation.save();

      return res
        .status(200)
        .json({ message: "Etag request rejected", etagAllocation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  handleComplaint: async (req, res) => {
    try {
      const adminId = req.id;
      const { complaintId, approval } = req.body;
      const complaintValidation = await validationUtils.validateComplaint(
        complaintId
      );
      if (!complaintValidation.isValid) {
        return res
          .status(complaintValidation.status)
          .json({ message: complaintValidation.message });
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
      if (complaint.is_resolved == true) {
        return res.status(400).json({ message: "Complaint already resolved" });
      }

      complaint.date_resolved = new Date();
      let minutesToResolved = Math.abs(
        new Date(complaint.date_resolved) - new Date(complaint.date_initiated)
      );
      // convert to minutes
      minutesToResolved = Math.floor(minutesToResolved / 60000);

      if (approval) {
        complaint.status = "resolved";
      }

      complaint.is_resolved = true;
      complaint.general_resolved_by = adminId;
      complaint.time_to_resolve = +minutesToResolved - +complaint.buffer_time;

      await complaint.save();

      return res
        .status(200)
        .json({ message: "Complaint resolved successfully", complaint });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  giveComplaintFeedback: async (req, res) => {
    try {
      const adminId = req.id;
      const { complaintId, feedback } = req.body;
      if (!feedback) {
        return res.status(400).json({ message: "Please provide feedback" });
      }

      const complaintValidation = await validationUtils.validateComplaint(
        complaintId
      );
      if (!complaintValidation.isValid) {
        return res
          .status(complaintValidation.status)
          .json({ message: complaintValidation.message });
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

      const feedbackObj = {
        feedback,
        date: new Date(),
        general_feedback_by: adminId,
      };

      complaint.feedback.push(feedbackObj);

      await complaint.save();

      return res
        .status(200)
        .json({ message: "Feedback given successfully", complaint });
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
      // console.log("update body: ", req.body)
      const { roomId, name, floor, timeStart, timeEnd, description, capacity, typeId } =
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
      room.type = typeId;

      await room.save();

      return res
        .status(200)
        .json({ message: "Room updated successfully", room });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateRoomType: async (req, res) => {
    try {
      const adminId = req.id;
      const { roomTypeId, towerId, name, capacity, rateList } = req.body;
      if (!roomTypeId || !name || !capacity) {
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

      const roomType = await RoomType.findById(roomTypeId);
      if (!roomType) {
        return res.status(404).json({ message: "Room type not found" });
      }

      roomType.name = name;
      roomType.capacity = capacity;
      roomType.rate_list = rateList;

      await roomType.save();

      return res
        .status(200)
        .json({ message: "Room type updated successfully", roomType });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  handleClearance: async (req, res) => {
    try {
      const adminId = req.id;
      const { clearanceId } = req.body;
      // console.log(req.body);

      const clearanceValidation = await validationUtils.validateClearance(
        clearanceId
      );
      if (!clearanceValidation.isValid) {
        return res
          .status(clearanceValidation.status)
          .json({ message: clearanceValidation.message });
      }

      const clearance = await Clearance.findById(clearanceId);
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

      if (clearance.is_cleared == true) {
        return res.status(400).json({ message: "Clearance already resolved" });
      }

      clearance.is_cleared = true;
      clearance.cleared_by = adminId;
      clearance.date_cleared = new Date();

      // clearance.tenant.statusTenancy = false;

      await clearance.save();

      return res.status(200).json({ message: "Clearance resolved", clearance });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  handleWorkPermit: async (req, res) => {
    try {
      const adminId = req.id;
      const { workPermitId, approval, reasonDecline } = req.body;

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

      if (workPermit.is_resolved == true) {
        return res
          .status(400)
          .json({ message: "Work permit already resolved" });
      }

      if (approval) {
        workPermit.status = "approved";
      } else {
        workPermit.status = "rejected";
        workPermit.reason_decline = reasonDecline;
      }

      workPermit.is_resolved = true;
      workPermit.admin = adminId;
      workPermit.admin_date = new Date();

      await workPermit.save();

      return res.status(200).json({ message: "Work permit resolved" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  editService: async (req, res) => {
    try {
      const adminId = req.id;
      const { serviceId, name, description, icon } = req.body;

      if (!name && !description && !icon) {
        return res.status(400).json({ message: "Please provide some field" });
      }

      const serviceValidation = await validationUtils.validateService(
        serviceId
      );
      if (!serviceValidation.isValid) {
        return res
          .status(serviceValidation.status)
          .json({ message: serviceValidation.message });
      }

      const service = await Service.findById(serviceId);
      const towerId = service.tower;

      const existingService = await Service.findOne({
        tower: towerId,
        name,
        is_active: true,
      });

      if (existingService && existingService._id != serviceId) {
        return res.status(400).json({ message: "Service already exists" });
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

      service.name = name;
      service.description = description;
      service.icon = icon;

      await service.save();

      return res
        .status(200)
        .json({ message: "Service updated successfully", service });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  uploadTenantLogo: [
    upload.single("logo"),
    async (req, res) => {
      try {
        const adminId = req.id;
        const { tenantId } = req.body;
        const logo = req.file;

        if (!tenantId || !logo) {
          return res.status(400).json({ message: "Please provide all fields" });
        }

        const tenantValidation = await validationUtils.validateTenant(tenantId);
        if (!tenantValidation.isValid) {
          return res
            .status(tenantValidation.status)
            .json({ message: tenantValidation.message });
        }

        const tenant = await Tenant.findById(tenantId);
        const towerId = tenant.tower;

        const validation = await validationUtils.validateAdminAndTower(
          adminId,
          towerId
        );
        if (!validation.isValid) {
          return res
            .status(validation.status)
            .json({ message: validation.message });
        }

        const bucket = admin.storage().bucket();

        // check if tenant already has a logo
        if (tenant.registration.companyLogo) {
          const imageUrl = tenant.registration.companyLogo;
          const token = tenant.registration.companyLogoToken;
          const fileName = `logos/${token}`;

          await bucket.file(fileName).delete();

          tenant.registration.companyLogo = null;
          tenant.registration.companyLogoToken = null;
        }

        const uuid = uuidv4();
        const imageFileName = `logos/${uuid}`;

        await bucket.file(imageFileName).save(logo.buffer, {
          metadata: {
            contentType: logo.mimetype,
            firebaseStorageDownloadTokens: uuid,
          },
        });

        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/logos%2F${uuid}?alt=media&token=${uuid}`;

        tenant.registration.companyLogo = imageUrl;
        tenant.registration.companyLogoToken = uuid;

        await tenant.save();

        return res
          .status(200)
          .json({ message: "Logo uploaded successfully", imageUrl });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  ],

  deleteTenantLogo: async (req, res) => {
    try {
      const adminId = req.id;
      const { tenantId } = req.body;

      const tenantValidation = await validationUtils.validateTenant(tenantId);
      if (!tenantValidation.isValid) {
        return res
          .status(tenantValidation.status)
          .json({ message: tenantValidation.message });
      }

      const tenant = await Tenant.findById(tenantId);
      const towerId = tenant.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      if (!tenant.registration.companyLogo) {
        return res.status(400).json({ message: "Tenant does not have a logo" });
      }

      const bucket = admin.storage().bucket();
      const token = tenant.registration.companyLogoToken;
      const fileName = `${firebase_logos_dir}${token}`;

      await bucket.file(fileName).delete();

      tenant.registration.companyLogo = null;
      tenant.registration.companyLogoToken = null;

      await tenant.save();

      return res
        .status(200)
        .json({ message: "Logo deleted successfully", tenant });
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

      room.is_active = false;
      await room.save();

      return res
        .status(200)
        .json({ message: "Room deleted successfully", room });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteRoomType: async (req, res) => {
    try{
      const adminId = req.id;
      const { roomTypeId } = req.body;

      const roomTypeValidation = await validationUtils.validateRoomType(roomTypeId);
      if (!roomTypeValidation.isValid) {
        return res
          .status(roomTypeValidation.status)
          .json({ message: roomTypeValidation.message });
      }

      const roomType = await RoomType.findById(roomTypeId);
      const towerId = roomType.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      roomType.is_active = false;
      await roomType.save();

      return res
        .status(200)
        .json({ message: "Room type deleted successfully", roomType });

    } catch {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteService: async (req, res) => {
    try {
      const adminId = req.id;
      const { serviceId } = req.body;

      const serviceValidation = await validationUtils.validateService(
        serviceId
      );
      if (!serviceValidation.isValid) {
        return res
          .status(serviceValidation.status)
          .json({ message: serviceValidation.message });
      }

      const service = await Service.findById(serviceId);
      const towerId = service.tower;

      const validation = await validationUtils.validateAdminAndTower(
        adminId,
        towerId
      );
      if (!validation.isValid) {
        return res
          .status(validation.status)
          .json({ message: validation.message });
      }

      service.is_active = false;

      await service.save();

      return res
        .status(200)
        .json({ message: "Service deleted successfully", service });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const { blogId } = req.body;

      const blogValidation = await validationUtils.validateBlog(blogId);
      if (!blogValidation.isValid) {
        return res
          .status(blogValidation.status)
          .json({ message: blogValidation.message });
      }

      const blog = await Blog.findById(blogId);

      const firebaseToken = blog.token;
      const bucket = admin.storage().bucket();

      const url = firebase_blogs_dir + firebaseToken;

      await bucket.file(url).delete();
      await blog.deleteOne();

      return res
        .status(200)
        .json({ message: "Blog deleted successfully", blog });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteNote: async (req, res) => {
    try {
      const adminId = req.id;
      const { tenantId, noteId } = req.body;

      const tenantValidation = await validationUtils.validateTenant(tenantId);
      if (!tenantValidation.isValid) {
        return res
          .status(tenantValidation.status)
          .json({ message: tenantValidation.message });
      }

      const tenant = await Tenant.findById(tenantId);
      const note = tenant.notes.id(noteId);

      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.admin.toString() !== adminId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this note" });
      }

      tenant.notes.pull(noteId);
      await tenant.save();

      return res.status(200).json({ message: "Note deleted successfully" });
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

req body for add room-type
{
  "towerId": "66f7b5ee7c51cd5775306b61", 
  "name": "Conference Room",
  "capacity": 50,
  "rateList": [
    {
      "category": "Company",
      "rates": [
        {
          "rate_type": "per_hour",
          "rate": 100
        },
        {
          "rate_type": "under_4_hours",
          "rate": 350
        },
        {
          "rate_type": "per_day",
          "rate": 800
        }
      ]
    },
    {
      "category": "Startup",
      "rates": [
        {
          "rate_type": "per_hour",
          "rate": 80
        },
        {
          "rate_type": "under_4_hours",
          "rate": 300
        },
        {
          "rate_type": "per_day",
          "rate": 700
        }
      ]
    }
  ]
}
*/
