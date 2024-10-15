const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const economicPerformanceSchema = new Schema({
  sales_total: {
    type: Number,
    required: true,
  },
  sales_tenants: {
    type: Number,
    required: true,
  },
  sales_exports: {
    type: Number,
    required: true,
  },
  earning: {
    type: Number,
    required: true,
  },
  investment_rnd: {
    type: Number,
    required: true,
  },
  investment_snm: {
    type: Number,
    required: true,
  },
  investment_hr: {
    type: Number,
    required: true,
  },
  customers_total: {
    type: Number,
    required: true,
  },
  customers_b2b: {
    type: Number,
    required: true,
  },
  investment_raised: {
    type: Boolean,
    required: true,
  },
  inverstor_origin: {
    type: String,
  },
  investor_type: {
    type: String,
  },
  investor_name: {
    type: String,
  },
  investment_amount: {
    type: Number,
  },
  employees_total: {
    type: Number,
    required: true,
  },
  employees_rnd: {
    type: Number,
    required: true,
  },
  employees_snm: {
    type: Number,
    required: true,
  },
  employees_hr: {
    type: Number,
    required: true,
  },
  employees_interns: {
    type: Number,
    required: true,
  },
  employees_support: {
    type: Number,
    required: true,
  },
  avg_employee_retention: {
    type: Number,
    required: true,
  },
  avg_internship_duration: {
    type: Number,
    required: true,
  },
  avg_salary: {
    type: Number,
    required: true,
  },
});

const innovationTechnologySchema = new Schema({
  num_technologies: {
    type: Number,
    required: true,
  },
  num_ips_filed: {
    type: Number,
    required: true,
  },
  num_ips_awarded: {
    type: Number,
    required: true,
  },
  num_ips_owned: {
    type: Number,
    required: true,
  },
  num_technologies_transfers: {
    type: Number,
    required: true,
  },
  num_research_national: {
    type: Number,
    required: true,
  },
  num_research_international: {
    type: Number,
    required: true,
  },
  value_research_international: {
    type: Number,
    required: true,
  },
  num_collaborations: {
    type: Number,
    required: true,
  },
});

const nustInteractionSchema = new Schema({
  num_internships: {
    type: Number,
    required: true,
  },
  num_jobs: {
    type: Number,
    required: true,
  },
  num_placements: {
    type: Number,
    required: true,
  },
  num_research_projects: {
    type: Number,
    required: true,
  },
  value_research_projects: {
    type: Number,
    required: true,
  },
  participation_jobfair: {
    type: Boolean,
    required: true,
  },
});

const otherDetailsSchema = new Schema({
  achievements: {
    type: String,
    required: true,
  },
  comments: {
    type: String,
    required: true,
  },
});

const evaluationSchema = new Schema({
  tower: {
    type: Schema.Types.ObjectId,
    ref: "Tower",
    required: true,
  },
  tenant: {
    type: Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
  },
  date_end: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  is_submitted: {
    type: Boolean,
    default: false,
  },
  date_submitted: {
    type: Date,
  },
  economic_performance: {
    type: economicPerformanceSchema,
    // required: true,
  },
  innovation_technology: {
    type: innovationTechnologySchema,
    // required: true,
  },
  nust_interaction: {
    type: nustInteractionSchema,
    // required: true,
  },
  other_details: {
    type: otherDetailsSchema,
    // required: true,
  },
}, { timestamps: true });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;
