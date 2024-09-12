const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  },
  complaint_type: {
    type: String,
    required: true,
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
  is_resolved: {
    type: Boolean,
    default: false,
  },
  initiated_on: {
    type: Date,
    default: Date.now,
  },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
