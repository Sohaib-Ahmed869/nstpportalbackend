const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meetingRoomBooking = new Schema(
  {
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    time_start: {
      type: Date,
      required: true,
    },
    time_end: {
      type: Date,
      required: true,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const meetingRoomSchema = new Schema(
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
    bookings: [meetingRoomBooking],
  },
  { timestamps: true }
);

// unique tower+name
meetingRoomSchema.index({ tower: 1, name: 1 }, { unique: true });

const MeetingRoom = mongoose.model("MeetingRoom", meetingRoomSchema);

module.exports = MeetingRoom;
