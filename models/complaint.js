const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      // required: true,
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    complaint_type: {
      type: String,
      required: true,
      enum: ["General", "Service"],
    },
    urgency: {
      type: Number,
      enum: [1, 2, 3],
    },
    subject: {
      type: String,
    },
    description: {
      type: String,
    },
    service_type: {
      type: String,
    },
    is_: {
      type: Boolean,
      default: false,
    },
    initiated_on: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
