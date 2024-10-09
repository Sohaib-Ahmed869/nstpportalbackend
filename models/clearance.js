const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clearanceSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    applicant_name: {
      type: String,
      required: true,
    },
    applicant_cnic: {
      type: String,
      // required: true,
    },
    applicant_designation: {
      type: String,
      required: true,
    },
    date_vacate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    is_cleared: {
      type: Boolean,
      default: false,
    },
    date_cleared: {
      type: Date,
    },
    cleared_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Clearance = mongoose.model("Clearance", clearanceSchema);

module.exports = Clearance;
