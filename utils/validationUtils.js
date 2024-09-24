const mongoose = require("mongoose");
const { Admin, Tenant, Employee, Complaint, Tower } = require("../models");

async function validateTenantAndEmployee(tenantId, employeeId) {
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
}

async function validateAdminAndTower(adminId, towerId) {
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
}

async function validateEntity(entityModel, entityId, entityName) {
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
}

async function validateTower(towerId) {
  return validateEntity(Tower, towerId, "Tower");
}

async function validateAdmin(adminId) {
  return validateEntity(Admin, adminId, "Admin");
}

async function validateTenant(tenantId) {
  return validateEntity(Tenant, tenantId, "Tenant");
}

async function validateEmployee(employeeId) {
  return validateEntity(Employee, employeeId, "Employee");
}

async function validateComplaint(complaintId) {
  return validateEntity(Complaint, complaintId, "Complaint");
}

function validateRequiredFields(obj, requiredFields) {
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
}

function validateRequiredFieldsArray(objs, requiredFields) {
  console.log("🚀 ~ validateRequiredFieldsArray ~ objs:", objs);

  for (let obj of objs) {
    if (!validateRequiredFields(obj, requiredFields)) {
      return false;
    }
  }
  return true;
}

module.exports = {
  validateTenantAndEmployee,
  validateAdminAndTower,
  validateTower,
  validateAdmin,
  validateTenant,
  validateEmployee,
  validateComplaint,
  validateRequiredFields,
  validateRequiredFieldsArray,
};
