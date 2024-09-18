const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  tower: {
    type: Schema.Types.ObjectId,
    ref: "Tower",
    // required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
