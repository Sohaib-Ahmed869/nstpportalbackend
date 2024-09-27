const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gatePassSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    tower_representative: {
      type: String,
      // required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    guest_name: {
      type: String,
      required: true,
    },
    guest_cnic: {
      type: String,
      required: true,
    },
    guest_contact: {
      type: String,
      required: true,
    },
    gate_number: {
      type: Number,
      required: true,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    handled_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
      index: true,
    },
    reason_decline: {
      type: String,
    },
  },
  { timestamps: true }
);

const GatePass = mongoose.model("GatePass", gatePassSchema);

module.exports = GatePass;
