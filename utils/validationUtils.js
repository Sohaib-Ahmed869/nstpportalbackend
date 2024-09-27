const mongoose = require("mongoose");
const {
  Admin,
  Tenant,
  Employee,
  Receptionist,
  Complaint,
  Tower,
  Room,
  Service,
  GatePass,
  WorkPermit,
  Clearance,
  LostAndFound,
} = require("../models");

const validationUtils = {
  async validateTenantAndEmployee(tenantId, employeeId) {
    try {
      const tenantValidation = await validateTenant(tenantId);
      if (!tenantValidation.isValid) {
        return tenantValidation;
      }

      const employeeValidation = await validateEmployee(employeeId);
      if (!employeeValidation.isValid) {
        return employeeValidation;
      }

      const employee = await Employee.findById(employeeId).lean();
      const hasEmployee = employee.tenant_id.toString() === tenantId;
      if (!hasEmployee) {
        return {
          isValid: false,
          status: 400,
          message: "Employee not assigned to tenant",
        };
      }

      return { isValid: true, status: 200, message: "Validation successful" };
    } catch (error) {
      console.error(error);
      return { isValid: false, status: 500, message: "Internal server error" };
    }
  },

  async validateAdminAndTower(adminId, towerId) {
    try {
      const adminValidation = await validateAdmin(adminId);
      if (!adminValidation.isValid) {
        return adminValidation;
      }

      const towerValidation = await validateTower(towerId);
      if (!towerValidation.isValid) {
        return towerValidation;
      }

      const admin = await Admin.findById(adminId).lean();

      const hasTower = admin.towers.some((t) => t.tower.toString() === towerId);
      if (!hasTower) {
        return {
          isValid: false,
          status: 400,
          message: "Tower not assigned to admin",
        };
      }

      return { isValid: true, status: 200, message: "Validation successful" };
    } catch (error) {
      console.error(error);
      return { isValid: false, status: 500, message: "Internal server error" };
    }
  },

  async validateReceptionistAndTower(receptionistId, towerId) {
    try {
      const receptionistValidation = await validateReceptionist(receptionistId);
      if (!receptionistValidation.isValid) {
        return receptionistValidation;
      }

      const towerValidation = await validateTower(towerId);
      if (!towerValidation.isValid) {
        return towerValidation;
      }

      const receptionist = await Receptionist.findById(receptionistId).lean();

      const towerExists = receptionist.tower == towerId;
      if (!towerExists) {
        return {
          isValid: false,
          status: 400,
          message: "Tower not assigned to receptionist",
        };
      }

      return { isValid: true, status: 200, message: "Validation successful" };
    } catch (error) {
      console.error(error);
      return { isValid: false, status: 500, message: "Internal server error" };
    }
  },

  async validateEntity(entityModel, entityId, entityName) {
    try {
      if (!entityId) {
        return {
          isValid: false,
          status: 400,
          message: `Please provide ${entityName} ID`,
        };
      }

      if (!mongoose.Types.ObjectId.isValid(entityId)) {
        return {
          isValid: false,
          status: 400,
          message: `Invalid ${entityName} ID format`,
        };
      }

      const entityExists = await entityModel.exists({ _id: entityId });
      if (!entityExists) {
        return {
          isValid: false,
          status: 404,
          message: `${entityName} not found`,
        };
      }

      return { isValid: true, status: 200, message: "Validation successful" };
    } catch (error) {
      console.error(error);
      return { isValid: false, status: 500, message: "Internal server error" };
    }
  },

  async validateTower(towerId) {
    return validateEntity(Tower, towerId, "Tower");
  },

  async validateAdmin(adminId) {
    return validateEntity(Admin, adminId, "Admin");
  },

  async validateTenant(tenantId) {
    return validateEntity(Tenant, tenantId, "Tenant");
  },

  async validateReceptionist(receptionistId) {
    return validateEntity(Receptionist, receptionistId, "Receptionist");
  },

  async validateEmployee(employeeId) {
    return validateEntity(Employee, employeeId, "Employee");
  },

  async validateComplaint(complaintId) {
    return validateEntity(Complaint, complaintId, "Complaint");
  },

  async validateService(serviceId) {
    return validateEntity(Service, serviceId, "Service");
  },

  async validateRoom(roomId) {
    return validateEntity(Room, roomId, "Room");
  },

  async validateGatePass(gatePassId) {
    return validateEntity(GatePass, gatePassId, "GatePass");
  },

  async validateWorkPermit(workPermitId) {
    return validateEntity(WorkPermit, workPermitId, "Work Permit");
  },

  async validateClearance(clearanceId) {
    return validateEntity(Clearance, clearanceId, "Clearance");
  },

  async validateLostAndFound(lostAndFoundId) {
    return validateEntity(LostAndFound, lostAndFoundId, "Lost and Found");
  },

  async validateRoomBooking(roomId, bookingId) {
    try {
      const validation = await validateRoom(roomId);
      if (!validation.isValid) {
        return validation;
      }

      if (!bookingId) {
        return {
          isValid: false,
          status: 400,
          message: "Please provide booking ID",
        };
      }

      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return {
          isValid: false,
          status: 400,
          message: "Invalid booking ID format",
        };
      }

      const room = await Room.findById(roomId).lean();
      const bookinfExists = room.bookings.some(
        (booking) => booking._id.toString() == bookingId
      );

      if (!bookinfExists) {
        return {
          isValid: false,
          status: 404,
          message: "Booking not found",
        };
      }

      return { isValid: true, status: 200, message: "Validation successful" };
    } catch (error) {
      console.error(error);
      return { isValid: false, status: 500, message: "Internal server error" };
    }
  },

  validateRequiredFields(obj, requiredFields) {
    console.log("🚀 ~ validateRequiredFields ~ obj:", obj);

    for (let field of requiredFields) {
      console.log("🚀 ~ validateRequiredFields ~ field:", field);
      if (
        !obj.hasOwnProperty(field) ||
        obj[field] === undefined ||
        obj[field] === null ||
        obj[field] === ""
      ) {
        return false;
      }
    }
    return true;
  },

  validateRequiredFieldsArray(objs, requiredFields) {
    console.log("🚀 ~ validateRequiredFieldsArray ~ objs:", objs);

    for (let obj of objs) {
      if (!validateRequiredFields(obj, requiredFields)) {
        return false;
      }
    }
    return true;
  },
};

module.exports = validationUtils;
