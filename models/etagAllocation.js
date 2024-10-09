const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const etagAllocationSchema = new Schema(
  {
    etag_number: {
      type: Number,
    },
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
    },
    etag_number: {
      type: String,
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
      default: false,
    },
    reason_decline: {
      type: String,
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
    vehicle_number: {
      type: String,
    },
    image_car_book: {
      type: String,
    },
    image_cnic_front: {
      type: String,
    },
    image_cnic_back: {
      type: String,
    },
    image_license_front: {
      type: String,
    },
    image_license_back: {
      type: String,
    },
  },
  { timestamps: true }
);

const EtagAllocation = mongoose.model("EtagAllocation", etagAllocationSchema);

module.exports = EtagAllocation;
