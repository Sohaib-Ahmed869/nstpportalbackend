const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const receptionistSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  job_start: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
  },
});

receptionistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

receptionistSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Receptionist = mongoose.model("Receptionist", receptionistSchema);

module.exports = Receptionist;
