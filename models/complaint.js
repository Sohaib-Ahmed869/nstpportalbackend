const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  feedback: {
    type: String,
  },
  service_feedback_by: {
    type: Schema.Types.ObjectId,
    ref: "Receptionist",
  },
  general_feedback_by: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  is_tenant: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

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
    tenant_name: {
      type: String,
      // required: true,
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
    service_name: {
      type: String,
    },
    is_resolved: {
      type: Boolean,
      default: false,
    },
    date_initiated: {
      type: Date,
      default: Date.now,
    },
    date_resolved: {
      type: Date,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "resolved"],
    },
    general_resolved_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    service_resolved_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    feedback: [feedbackSchema],
    time_to_resolve: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
