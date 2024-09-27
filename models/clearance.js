const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const utilitySchema = new Schema({
  cards: {
    issued: {
      type: Number,
      required: true,
    },
    returned: {
      type: Number,
      required: true,
    },
  },
  etags: {
    issued: {
      type: Number,
      required: true,
    },
    returned: {
      type: Number,
      required: true,
    },
  },
  keys_handed_over: {
    type: Boolean,
    default: false,
  },
});

const clearanceSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    applicant_name: {
      type: String,
      required: true,
    },
    applicant_cnic: {
      type: String,
      required: true,
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
    utilities: {
      type: utilitySchema,
    },
    is_resolved: {
      type: Boolean,
      default: false,
    },
    date_resolved: {
      type: Date,
    },
    resolved_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Clearance = mongoose.model("Clearance", clearanceSchema);

module.exports = Clearance;
