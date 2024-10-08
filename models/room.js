const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },
    floor: {
      type: String,
      required: true,
    },
    time_start: {
      type: String,
      required: true,
    },
    time_end: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ tower: 1, name: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
