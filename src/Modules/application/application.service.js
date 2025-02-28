import applicationModel from "../../Database/Models/appliction.model.js";
import jobOpportunityModel from "../../Database/Models/jobOpportunity.model.js";
import cloudinary from "../../utils/Cloudinary/cloudinary.js";

export const applyApplication = async (req, res, next) => {
  const { jobId } = req.body;
  const job = await jobOpportunityModel.findById(jobId);
  if (!job) {
    return next(new Error("No job found!", { cause: 404 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path
  );
  const application = await applicationModel.create({
    jobId,
    userCV: { secure_url, public_id },
    userId: req.user._id,
  });
  return res
    .status(201)
    .json({ msg: "Your application has been submitted!", application });
};
