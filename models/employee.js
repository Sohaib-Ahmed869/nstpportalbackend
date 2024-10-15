const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      // required: true,
    },
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
    phone: {
      //
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    father_name: {
      //
      type: String,
      // required: true,
    },
    image: {
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
    temp_address: {
      type: String,
    },
    date_joining: {
      //
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
    is_nustian: {
      type: Boolean,
    },
    status_employment: {
      //
      type: Boolean,
      default: true,
    },
    layoff_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

employeeSchema.index(
  { tenant_id: 1, email: 1, status_employment: 1 },
  { unique: true }
);
employeeSchema.index(
  { tenant_id: 1, cnic: 1, status_employment: 1 },
  { unique: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
