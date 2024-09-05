const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const registrationSchema = new Schema({
  category: { type: String, required: true },
  organizationName: { type: String, required: true },
  presentAddress: { type: String, required: true },
  website: { type: String, required: true },
  companyEmail: { type: String, required: true },
});

const contactInformationSchema = new Schema({
  applicantName: { type: String, required: true },
  applicantPhone: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicantLandline: { type: String },
});

const individualProfileSchema = new Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  presentAddress: { type: String, required: true },
  nationality: { type: String, required: true },
  dualNationality: { type: String }, // Optional
  profile: { type: String }, // Optional
  isNustAlumni: { type: Boolean, required: true },
  isNustEmployee: { type: Boolean, required: true },
});

const companyProfileSchema = new Schema({
  companyHeadquarters: { type: String, required: true },
  yearsInBusiness: { type: Number, required: true },
  numberOfEmployees: { type: Number, required: true },
  registrationNumber: { type: String, required: true },
});

const industrySectorSchema = new Schema({
  category: { type: String, required: true },
  rentalSpaceSqFt: { type: Number, required: true },
  timeFrame: { type: String, required: true },
});

const companyResourceCompositionSchema = new Schema({
  management: { type: Number, required: true },
  engineering: { type: Number, required: true },
  marketingAndSales: { type: Number, required: true },
  remainingPredominantArea: { type: String }, // Optional
  areasOfResearch: { type: String, required: true },
  nustSchoolToCollab: { type: String },
});

const tenantSchema = new Schema({
  registration: registrationSchema,
  contactInfo: contactInformationSchema,
  stakeholders: [individualProfileSchema],
  companyProfile: companyProfileSchema,
  industrySector: industrySectorSchema,
  companyResourceComposition: companyResourceCompositionSchema,

  username: { type: String, unique: true },
  password: { type: String },
  dateJoining: { type: Date },
  logo: { type: String },
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
