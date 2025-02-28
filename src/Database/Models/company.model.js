import mongoose from "mongoose";
const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 5,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      from: { type: Number, required: true },
      to: { type: Number, required: true },
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    HRs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    bannedAt: Date,
    deletedAt: Date,
    legalAttachment: { secure_url: String, public_id: String },
    approvedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

companySchema.virtual("jobOpportunity", {
  ref: "jobOpportunity",
  localField: "_id",
  foreignField: "companyId",
});

companySchema.pre("deleteOne", { document: true }, async function (next) {
  const companyId = this._id;

  const jobs = await jobOpportunityModel.find({ companyId });
  const jobIds = jobs.map((job) => job._id);

  await jobOpportunityModel.deleteMany({ companyId });
  await applicationModel.deleteMany({ jobId: { $in: jobIds } });

  next();
});

companySchema.pre("findOneAndDelete", async function (next) {
  const company = await this.model.findOne(this.getQuery());
  if (company) {
    const jobs = await jobOpportunityModel.find({ companyId: company._id });
    const jobIds = jobs.map((job) => job._id);

    await jobOpportunityModel.deleteMany({ companyId: company._id });
    await applicationModel.deleteMany({ jobId: { $in: jobIds } });
  }
  next();
});

const companyModel = mongoose.model("Company", companySchema);

export default companyModel;
