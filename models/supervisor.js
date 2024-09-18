const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const supervisorSchema = new Schema({
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
}, { timestamps: true });

supervisorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

supervisorSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);

module.exports = Supervisor;
