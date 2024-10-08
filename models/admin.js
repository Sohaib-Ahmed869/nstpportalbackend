const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const adminSchema = new Schema({
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
    required: true,
  },
  image: {
    type: String,
  },
  towers: [
    {
      tower: {
        type: Schema.Types.ObjectId,
        ref: "Tower",
      },
      tasks: [
        {
          type: Schema.Types.ObjectId,
          ref: "Task",
        },
      ],
    },
  ],
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
