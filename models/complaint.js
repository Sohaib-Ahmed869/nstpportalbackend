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
  priority: {
    type: String,
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
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
