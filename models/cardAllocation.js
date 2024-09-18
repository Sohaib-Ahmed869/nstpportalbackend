const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardAllocationSchema = new Schema({
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
  date_issued: {
    type: Date,
  },
  date_requested: {
    type: Date,
  },
  validity: {
    type: Number,
  },
  is_returned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const CardAllocation = mongoose.model("CardAllocation", cardAllocationSchema);

module.exports = CardAllocation;
