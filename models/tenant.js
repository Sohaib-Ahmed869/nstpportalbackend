const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const tenantSchema = new Schema({
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
  date_joining: {
    type: Date,
    default: Date.now,
  },
  logo: {
    type: String,
  },
});

tenantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

tenantSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
