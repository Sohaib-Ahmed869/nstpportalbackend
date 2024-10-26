const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardAllocationSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    card_number: {
      type: Number,
    },
    is_issued: {
      type: Boolean,
      default: false,
    },
    is_requested: {
      type: Boolean,
      default: false,
    },
    is_returned: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    date_issued: {
      type: Date,
    },
    date_requested: {
      type: Date,
    },
    date_returned: {
      type: Date,
    },
    date_invalid: {
      type: Date,
    },
    validity: {
      type: Number,
    },
    reason_decline: {
      type: String,
    },
  },
  { timestamps: true }
);

const CardAllocation = mongoose.model("CardAllocation", cardAllocationSchema);

module.exports = CardAllocation;
