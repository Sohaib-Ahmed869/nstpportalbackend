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
    type: String,
    required: true,
    unique: true,
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
  date_joining: {
    type: Date,
  },
  contract_type: {
    type: String,
    required: true,
  },
  contract_end: {
    type: Date,
  },
  status_employment: {
    type: Boolean,
    required: true,
  },
  status_card: {
    type: Boolean,
    default: false,
  },
  is_nustian: {
    type: Boolean,
    required: true,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
