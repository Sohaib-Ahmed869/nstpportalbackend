const SuperAdmin = require("../models/superAdmin");
const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");
const Receptionist = require("../models/receptionist");
const Tenant = require("../models/tenant");

const {
  validateRequiredFields,
  validateRequiredFieldsArray,
} = require("../utils/validationUtils");

const signupController = {
  superAdminSignup: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Please provide username and password" });
      }

      const superAdmin = new SuperAdmin({ username, password });
      await superAdmin.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  adminSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const admin = new Admin({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await admin.save();
      return res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  supervisorSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const supervisor = new Supervisor({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await supervisor.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  receptionistSignup: async (req, res) => {
    try {
      const { username, email, password, name, cnic, jobStart } = req.body;
      if (!username || !email || !password || !name || !cnic || !jobStart) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const receptionist = new Receptionist({
        username,
        email,
        password,
        name,
        cnic,
        job_start: jobStart,
      });
      await receptionist.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  tenantSignup: async (req, res) => {
    try {
      const {
        registration,
        contactInfo,
        stakeholders,
        companyProfile,
        industrySector,
        companyResourceComposition,
      } = req.body;

      const registrationFields = [
        "category",
        "organizationName",
        "presentAddress",
        "website",
        "companyEmail",
      ];

      const contactInformationFields = [
        "applicantName",
        "applicantPhone",
        "applicantEmail",
        "applicantLandline",
      ];

      const stakeholderFields = [
        "name",
        "designation",
        "email",
        "presentAddress",
        "nationality",
        "dualNationality",
        "profile",
        "isNustAlumni",
        "isNustEmployee",
      ];

      const companyProfileFields = [
        "companyHeadquarters",
        "yearsInBusiness",
        "numberOfEmployees",
        "registrationNumber",
      ];

      const industrySectorFields = ["category", "rentalSpaceSqFt", "timeFrame"];

      const companyResourceCompositionFields = [
        "management",
        "engineering",
        "marketingAndSales",
        "remainingPredominantArea",
        "areasOfResearch",
        "nustSchoolToCollab",
      ];

      if (
        !validateRequiredFields(registration, registrationFields) ||
        !validateRequiredFields(contactInfo, contactInformationFields) ||
        !validateRequiredFieldsArray(stakeholders, stakeholderFields) ||
        !validateRequiredFields(companyProfile, companyProfileFields) ||
        !validateRequiredFields(industrySector, industrySectorFields) ||
        !validateRequiredFields(
          companyResourceComposition,
          companyResourceCompositionFields
        )
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const username = registration.organizationName
        .replace(/\s+/g, "") // Remove spaces
        .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
        .toLowerCase(); // Convert to lowercase

      const password = process.env.TENANT_PASSWORD;

      const tenant = new Tenant({
        registration,
        contactInfo,
        stakeholders,
        companyProfile,
        industrySector,
        companyResourceComposition,
        username,
        password,
      });
      await tenant.save();

      res.status(200).json({ message: "Signup successful", username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  employeeSignup: async (req, res) => {
    try {
      const { email, name, designation, cnic } = req.body;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = signupController;

/*
* Tenant signup body:
{
  "registration": {
    "category": "Company",
    "organizationName": "Tech Innovators Inc.",
    "presentAddress": "123 Innovation Lane, Tech City, TX",
    "website": "https://www.techinnovators.com",
    "companyEmail": "info@techinnovators.com"
  },
  "contactInfo": {
    "applicantName": "John Smith",
    "applicantPhone": "+1-555-123-4567",
    "applicantEmail": "john.smith@techinnovators.com",
    "applicantLandline": "+1-555-765-4321"
  },
  "stakeholders": [
    {
      "name": "Jane Doe",
      "designation": "CEO",
      "email": "jane.doe@techinnovators.com",
      "presentAddress": "789 Executive Drive, Tech City, TX",
      "nationality": "American",
      "dualNationality": "Canadian",
      "profile": "https://www.linkedin.com/in/janedoe",
      "isNustAlumni": false,
      "isNustEmployee": false
    }
  ],
  "companyProfile": {
    "companyHeadquarters": "Tech City, TX",
    "yearsInBusiness": "10",
    "numberOfEmployees": 250,
    "registrationNumber": "9876543210"
  },
  "industrySector": {
    "category": "HealthTech",
    "rentalSpaceSqFt": 5000,
    "timeFrame": "6 months"
  },
  "companyResourceComposition": {
    "management": 40,
    "engineering": 45,
    "marketingAndSales": 15,
    "remainingPredominantArea": "Research and Development",
    "areasOfResearch": "AI in Healthcare; Health Data Analysis; Telemedicine",
    "nustSchoolToCollab": "School of Electrical Engineering and Computer Science"
  }
}
*/
