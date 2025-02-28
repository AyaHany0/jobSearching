import mongoose from "mongoose";
import { jobApplicationStatusTypes } from "../../utils/types.js";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Types.ObjectId,
    ref: "jobOpportunity",
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  userCV: {
    secure_url: String,
    public_id: String,
  },
  status: {
    type: String,
    enum: Object.values(jobApplicationStatusTypes),
    default: jobApplicationStatusTypes.pending,
  },
},{timestamps:true , toJSON: { virtuals: true }, toObject: { virtuals: true }});

const applicationModel = mongoose.model("Application", applicationSchema);

export default applicationModel;
