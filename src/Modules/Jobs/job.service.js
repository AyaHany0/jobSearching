import applicationModel from "../../Database/Models/appliction.model.js";
import companyModel from "../../Database/Models/company.model.js";
import jobOpportunityModel from "../../Database/Models/jobOpportunity.model.js";
import { emailTempContent } from "../../Services/EmailServices/EmailTemplate/content.js";
import { eventEmitter } from "../../utils/Events/sendEmail.event.js";

export const addJob = async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const { companyId } = req.params;
  const company = await companyModel.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found!" });
  }
  // Make sure the user is the owner of the company or an HR
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = company.HRs.some(
    (hrId) => hrId.toString() === req.user._id.toString()
  );

  if (!isOwner && !isHR) {
    return res.status(403).json({
      message: "You are not authorized to add jobs for this company!",
    });
  }
  const job = await jobOpportunityModel.create({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
    addedBy: req.user._id,
  });
  return res.status(201).json({ job });
};

export const updateJob = async (req, res, next) => {
  const { jobId, companyId } = req.params;
  const job = await jobOpportunityModel
    .findOne({ _id: jobId, companyId })
    .populate("companyId");
  if (!job) {
    return next(new Error("No job found!", { cause: 404 }));
  }
  // Make sure the user is the owner of the company
  const isOwner = job.addedBy.toString() === req.user._id.toString();
  if (!isOwner) {
    return res.status(403).json({
      message: "You are not authorized to add jobs for this company!",
    });
  }

  if (req.body.jobTitle) {
    job.jobTitle = req.body.jobTitle;
  }
  if (req.body.jobLocation) {
    job.jobLocation = req.body.jobLocation;
  }
  if (req.body.workingTime) {
    job.workingTime = req.body.workingTime;
  }
  if (req.body.seniorityLevel) {
    job.seniorityLevel = req.body.seniorityLevel;
  }
  if (req.body.jobDescription) {
    job.jobDescription = req.body.jobDescription;
  }

  if (req.body.technicalSkills) {
    job.technicalSkills = req.body.technicalSkills;
  }
  if (req.body.softSkills) {
    job.softSkills = req.body.softSkills;
  }
  const newJob = await job.save();

  return res.status(201).json({ newJob });
};

export const deleteJob = async (req, res, next) => {
  const { jobId, companyId } = req.params;
  const job = await jobOpportunityModel
    .findOne({ _id: jobId, companyId })
    .populate("companyId");
  if (!job) {
    return next(new Error("No job found!", { cause: 404 }));
  }
  const isHR = job.companyId.HRs.some(
    (hrId) => hrId.toString() === req.user._id.toString()
  );
  if (!isHR) {
    return next(
      new Error("You are not authorized to delete jobs for this company!", {
        cause: 403,
      })
    );
  }
  await jobOpportunityModel.findByIdAndDelete(jobId);
  res.status(200).json({ message: "Job deleted successfully" });
};

export const getJobs = async (req, res, next) => {
  const { companyId, jobId } = req.params;
  const { limit = 5, page = 1, search, sort = "createdAt" } = req.query;
  let filter = {};
  if (companyId) {
    filter.companyId = companyId;
  }
  // Specific job for specific company
  if (jobId) {
    const job = await jobOpportunityModel
      .findOne({ _id: jobId, ...filter })
      .populate("companyId");
    if (!job) {
      return next(new Error("No job found", { cause: 404 }));
    }
    return res.status(200).json({ job });
  }
  // Find jobs by company name
  if (search) {
    const company = await companyModel.findOne({
      companyName: { $regex: search, $options: "i" },
    });

    if (!company) {
      return next(new Error("No company found", { cause: 404 }));
    }
    filter.companyId = company._id;
  }

  const jobs = await jobOpportunityModel
    .find(filter)
    .populate("companyId")
    .sort({ [sort]: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();
  const totalJobs = await jobOpportunityModel.countDocuments(filter);

  res.status(200).json({
    totalJobs,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs,
  });
};

export const getJobsWithFilters = async (req, res, next) => {
  // first the pagination , sort , search
  const { limit = 5, page = 1, search, sort = "createdAt" } = req.query;
  // the other filters
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;
  const { companyId } = req.params;

  let filter = {};
  if (companyId) {
    filter.companyId = companyId;
  }

  if (search) {
    const company = await Company.findOne({
      name: { $regex: search, $options: "i" },
    });

    if (!company) {
      return next(new Error("No company found", { cause: 404 }));
    }
    filter.companyId = company._id;
  }

  // Filters
  if (workingTime) filter.workingTime = workingTime;
  if (jobLocation) filter.jobLocation = jobLocation;
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };
  if (technicalSkills) {
    const skillsArray = technicalSkills.split(",");
    filter.technicalSkills = { $in: skillsArray };
  }

  //Find the job with all filters
  const jobs = await jobOpportunityModel
    .find(filter)
    .populate("companyId")
    .sort({ [sort]: -1 })
    .skip((page - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  const totalJobs = await jobOpportunityModel.countDocuments(filter);

  res.status(200).json({
    totalJobs,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs,
  });
};

export const getApplications = async (req, res, next) => {
  const { jobId } = req.params;
  const { page = 1, limit = 10, sort = "createdAt" } = req.query;
  const job = await jobOpportunityModel.findById(jobId).populate("companyId");
  if (!job) {
    return res.status(404).json({ msg: "No job found" });
  }
  const company = job.companyId;
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  // Make sure the user is the owner of the company or an HR
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = company.HRs.some(
    (hrId) => hrId.toString() === req.user._id.toString()
  );

  if (!isOwner && !isHR) {
    return res.status(403).json({
      message: "You are not authorized to add jobs for this company!",
    });
  }

  // get applications with paginations and sorting
  const applications = await applicationModel
    .find({ jobId })
    .populate({
      path: "userId",
      select: "-password -OTP -changeCredentialTime",
    })
    .sort({ [sort]: -1 })
    .skip((page - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const totalApplications = await applicationModel.countDocuments({ jobId });
  return res.status(200).json({
    totalApplications,
    page: parseInt(page),
    limit: parseInt(limit),
    applications,
  });
};

export const acceptOrRejectApplication = async (req, res, next) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const application = await applicationModel
    .findById(applicationId)
    .populate("jobId userId");
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  const job = application.jobId;
  const company = await companyModel.findById(job.companyId);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  const isHR = company.HRs.some(
    (hrId) => hrId.toString() === req.user._id.toString()
  );

  if (!isHR) {
    return res
      .status(403)
      .json({ message: "You are not authorized to modify applications!" });
  }
  application.status = status;
  await application.save();
  
  eventEmitter.emit("applicationStatus", {
    email: application.userId.email,
    status,
    jobTitle: job.jobTitle,
    companyName: company.companyName,
    name:application.userId.userName
  });
  return res.status(200).json({
    message: `Application has been ${status} successfully!`,
  });
};
