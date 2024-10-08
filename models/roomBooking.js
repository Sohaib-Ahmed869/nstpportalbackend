const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomBookingSchema = new Schema(
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
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    time_start: {
      type: Date,
      required: true,
    },
    time_end: {
      type: Date,
      required: true,
    },
    reason_booking: {
      type: String,
      // required: true,
    },
    date_initiated: {
      type: Date,
      default: Date.now,
    },
    status_booking: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    handled_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    is_cancelled: {
      type: Boolean,
      default: false,
    },
    cancelled_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    reason_decline: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index the room_id and tenant_id fields for faster queries
roomBookingSchema.index({ room_id: 1, tenant_id: 1 });

const RoomBooking = mongoose.model("RoomBooking", roomBookingSchema);

module.exports = RoomBooking;
