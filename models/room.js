const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomBooking = new Schema(
  {
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
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

const roomSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    time_open: {
      type: Date,
      required: true,
    },
    time_close: {
      type: Date,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    capacity: {
      type: Number,
      // required: true,
    },
    description: {
      type: String,
    },
    bookings: [roomBooking],
  },
  { timestamps: true }
);

// unique tower+name
roomSchema.index({ tower: 1, name: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
