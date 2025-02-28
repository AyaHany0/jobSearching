import mongoose from "mongoose";
import * as Type from "../../utils/types.js";
const jobOpportunitySchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      enum: Object.values(Type.jobLocationTypes),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(Type.jobTypeTypes),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(Type.seniorityLevelTypes),
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: [
      {
        type: String,
      },
    ],
    softSkills: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    closed: Boolean,
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

jobOpportunitySchema.virtual("Application", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});
const jobOpportunityModel = mongoose.model(
  "jobOpportunity",
  jobOpportunitySchema
);

jobOpportunitySchema.pre(
  "deleteOne",
  { document: true },
  async function (next) {
    await applicationModel.deleteMany({ jobId: this._id });
    next();
  }
);

jobOpportunitySchema.pre("findOneAndDelete", async function (next) {
  const job = await this.model.findOne(this.getQuery());
  if (job) {
    await applicationModel.deleteMany({ jobId: job._id });
  }
  next();
});

export default jobOpportunityModel;
