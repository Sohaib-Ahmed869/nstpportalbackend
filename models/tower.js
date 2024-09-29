const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const towerSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  floors: {
    type: [Number],
    // required: true,
  },
  wings: {
    type: [Number],
    // required: true,
  },
  offices: {
    type: [String],
    // required: true,
  },
}, { timestamps: true });

const Tower = mongoose.model("Tower", towerSchema);

module.exports = Tower;