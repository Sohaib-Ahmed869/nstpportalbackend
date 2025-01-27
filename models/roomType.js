const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rateListSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    rates: [
      {
        rate_type: {
          type: String,
          required: true,
          enum: ["per_hour", "per_day", "under_4_hours"],
        },
        rate: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { id: false }
);

const roomTypeSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    rate_list: {
      type: [rateListSchema],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomTypeSchema.index({ tower: 1, name: 1 }, { unique: true });

const RoomType = mongoose.model("RoomType", roomTypeSchema);

module.exports = RoomType;
