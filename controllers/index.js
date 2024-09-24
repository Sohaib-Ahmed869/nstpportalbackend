console.log("Hello indexC");
const adminController = require("./adminController");
const authController = require("./authController");
const commonController = require("./commonController");
const signupController = require("./signupController");
const superController = require("./superController");
const tenantController = require("./tenantController");

module.exports = {
  adminController,
  authController,
  commonController,
  signupController,
  superController,
  tenantController,
};
