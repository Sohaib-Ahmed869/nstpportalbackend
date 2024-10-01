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
      const tenantValidation = await this.validateTenant(tenantId);
      if (!tenantValidation.isValid) {
        return tenantValidation;
      }

      const employeeValidation = await this.validateEmployee(employeeId);
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
      const adminValidation = await this.validateAdmin(adminId);
      if (!adminValidation.isValid) {
        return adminValidation;
      }

      const towerValidation = await this.validateTower(towerId);
      if (!towerValidation.isValid) {
        return towerValidation;
      }

      const admin = await Admin.findById(adminId).lean();

      const hasTower = admin.towers.some((t) => t.tower.toString() == towerId);
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
      const receptionistValidation = await this.validateReceptionist(
        receptionistId
      );
      if (!receptionistValidation.isValid) {
        return receptionistValidation;
      }
      const towerValidation = await this.validateTower(towerId);
      if (!towerValidation.isValid) {
        return towerValidation;
      }

      const receptionist = await Receptionist.findById(receptionistId).lean();
      const towerExists = receptionist.tower.toString() == towerId;
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

      // const entity = await Admin.findById(entityId);
      const entityExists = await entityModel.findById(entityId);
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
    return this.validateEntity(Tower, towerId, "Tower");
  },

  async validateAdmin(adminId) {
    return this.validateEntity(Admin, adminId, "Admin");
  },

  async validateTenant(tenantId) {
    return this.validateEntity(Tenant, tenantId, "Tenant");
  },

  async validateReceptionist(receptionistId) {
    const response = await this.validateEntity(
      Receptionist,
      receptionistId,
      "Receptionist"
    );
    return response;
  },

  async validateEmployee(employeeId) {
    return this.validateEntity(Employee, employeeId, "Employee");
  },

  async validateComplaint(complaintId) {
    return this.validateEntity(Complaint, complaintId, "Complaint");
  },

  async validateService(serviceId) {
    return this.validateEntity(Service, serviceId, "Service");
  },

  async validateRoom(roomId) {
    return this.validateEntity(Room, roomId, "Room");
  },

  async validateGatePass(gatePassId) {
    return this.validateEntity(GatePass, gatePassId, "GatePass");
  },

  async validateWorkPermit(workPermitId) {
    return this.validateEntity(WorkPermit, workPermitId, "Work Permit");
  },

  async validateClearance(clearanceId) {
    return this.validateEntity(Clearance, clearanceId, "Clearance");
  },

  async validateLostAndFound(lostAndFoundId) {
    return this.validateEntity(LostAndFound, lostAndFoundId, "Lost and Found");
  },

  async validateRoomBooking(roomId, bookingId) {
    try {
      const validation = await this.validateRoom(roomId);
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
    for (let field of requiredFields) {
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
    for (let obj of objs) {
      if (!this.validateRequiredFields(obj, requiredFields)) {
        return false;
      }
    }
    return true;
  },
};

module.exports = validationUtils;
