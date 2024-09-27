const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lostAndFoundSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    item: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    date_found: {
      type: Date,
      required: true,
    },
    reported_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
      required: true,
    },
    resolved_by: {
      type: Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    is_claimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const LostAndFound = mongoose.model("LostAndFound", lostAndFoundSchema);

module.exports = LostAndFound;
