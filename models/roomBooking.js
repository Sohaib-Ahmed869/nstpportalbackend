const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomBookingSchema = new Schema(
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
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    handled_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
      index: true,
    },
    cancelled_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    time_start: {
      type: Date,
      required: true,
    },
    time_end: {
      type: Date,
      required: true,
    },
    status_booking: {
      type: Boolean,
    },
    reason_booking: {
      type: String,
      required: true,
    },
    reason_decline: {
      type: String,
    },
    is_cancelled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index the room_id and tenant_id fields for faster queries
roomBookingSchema.index({ room_id: 1, tenant_id: 1 });

const RoomBooking = mongoose.model("RoomBooking", roomBookingSchema);

module.exports = RoomBooking;
