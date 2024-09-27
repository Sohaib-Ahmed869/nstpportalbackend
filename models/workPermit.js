const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workPermitSchema = new Schema(
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
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    valid_from: {
      type: Date,
      required: true,
    },
    valid_to: {
      type: Date,
      required: true,
    },
    detailed_information: {
      type: String,
      required: true,
    },
    equipment: {
      type: [String],
      required: true,
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "Supervisor",
      // required: true,
    },
    supervisor_date: {
      type: Date,
    },
    is_resolved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const WorkPermit = mongoose.model("WorkPermit", workPermitSchema);

module.exports = WorkPermit;
