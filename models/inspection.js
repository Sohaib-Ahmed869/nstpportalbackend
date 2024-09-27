const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluationSchema = new Schema({
  evaluation: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    required: true,
  },
});

const inspectionSchema = new Schema(
  {
    tower: {
      type: Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    evaluations: [evaluationSchema],
  },
  { timestamps: true }
);

const Inspection = mongoose.model("Inspection", inspectionSchema);

module.exports = Inspection;
