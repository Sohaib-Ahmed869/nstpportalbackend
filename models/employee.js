const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: "Tenant",
    index: true,
  },
  tenant_name: {
    type: String,
    required: true,
  },
  email: {
    //
    type: String,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  designation: {
    //
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  address: {
    //
    type: String,
    required: true,
  },
  date_joining: {
    type: Date,
  },
  employee_type: {
    //
    type: String,
    required: true,
  },
  contract_duration: {
    //
    type: String,
  },
  status_employment: {
    //
    type: Boolean,
    default: true,
  },
  is_nustian: {
    type: Boolean,
  },
});

employeeSchema.index({ tenant_id: 1, email: 1 }, { unique: true });
employeeSchema.index({ tenant_id: 1, cnic: 1 }, { unique: true });

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
