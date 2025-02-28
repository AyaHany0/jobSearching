import applicationModel from "../../Database/Models/appliction.model.js";
import companyModel from "../../Database/Models/company.model.js";
import jobOpportunityModel from "../../Database/Models/jobOpportunity.model.js";
import cloudinary from "../../utils/Cloudinary/cloudinary.js";
import { roleTypes } from "../../utils/types.js";
import ExcelJS from "exceljs";
export const addCompany = async (req, res, next) => {
  const user = req.user;
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    HRs,
  } = req.body;

  const isUnique = await companyModel.findOne({
    companyEmail,
    companyName,
  });
  if (isUnique) {
    return next(new Error("Company already exists!", { cause: 403 }));
  }
  if (req?.files?.length) {
    return next(new Error("Please upload the required files!", { cause: 403 }));
  }
  const logo = await cloudinary.uploader.upload(req?.files?.logo[0]?.path, {
    folder: "jobSearching/companyLogos",
  });
  const coverPic = await cloudinary.uploader.upload(
    req?.files?.coverPic[0]?.path,
    { folder: "jobSearching/companyCoverPics" }
  );
  const legalAttachment = await cloudinary.uploader.upload(
    req?.files?.legalAttachment[0]?.path,
    { folder: "jobSearching/companyLegalAttachments" }
  );
  const company = await companyModel.create({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    createdBy: user._id,
    logo: { public_id: logo.public_id, secure_url: logo.secure_url },
    coverPic: {
      public_id: coverPic.public_id,
      secure_url: coverPic.secure_url,
    },
    legalAttachment: {
      public_id: legalAttachment.public_id,
      secure_url: legalAttachment.secure_url,
    },
    HRs,
  });
  if (!company) {
    return nextT(new Error("Error in creating the company!", { cause: 403 }));
  }
  return res
    .status(201)
    .json({ msg: "Your company created successfully!", company });
};

export const updateCompanyInfo = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  // Only the company owner could update the company's info
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error("You are not authorized to update this company!", {
        cause: 403,
      })
    );
  }
  // Make sure that the name and the email of the company are unique
  if (req?.body?.companyName) {
    const isUnique = await companyModel.findOne({
      companyName: req.body.companyName,
    });
    if (isUnique) {
      return next(new Error("Company already exists!", { cause: 403 }));
    }
    company.companyName = req.body.companyName;
  }
  if (req?.body?.companyEmail) {
    const isUnique = await companyModel.findOne({
      companyEmail: req.body.companyEmail,
    });
    if (isUnique) {
      return next(new Error("Company email already exists!", { cause: 403 }));
    }
    company.companyEmail = req.body.companyEmail;
  }
  if (req?.body.description) {
    company.description = req.body.description;
  }
  if (req?.body.industry) {
    company.industry = req.body.industry;
  }
  if (req?.body.address) {
    company.address = req.body.address;
  }
  if (req?.body.numberOfEmployees) {
    company.numberOfEmployees = req.body.numberOfEmployees;
  }
  if (req?.body.HRs) {
    company.HRs = req.body.HRs;
  }
  if (req?.files?.logo) {
    await cloudinary.uploader.destroy(company.logo.public_id);
    const logo = await cloudinary.uploader.upload(req?.files?.logo[0]?.path, {
      folder: "jobSearching/companyLogos",
    });
    company.logo = {
      public_id: logo.public_id,
      secure_url: logo.secure_url,
    };
  }
  if (req?.files?.coverPic) {
    await cloudinary.uploader.destroy(company.coverPic.public_id);

    const coverPic = await cloudinary.uploader.upload(
      req?.files?.coverPic[0]?.path,
      { folder: "jobSearching/companyCoverPics" }
    );
    company.coverPic = {
      public_id: coverPic.public_id,
      secure_url: coverPic.secure_url,
    };
  }
  //Make sure that the legal attachment is not updated
  if (req?.files?.legalAttachment) {
    return next(
      new Error("You can't update the legal attachment!", { cause: 403 })
    );
  }

  const updatedCompany = await company.save();
  if (!updatedCompany) {
    return next(new Error("Error in updating the company!", { cause: 403 }));
  }
  return res
    .status(201)
    .json({ msg: "Your company created successfully!", company });
};

export const deleteCompany = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  // Make sure that the only the owner or the admin could delete the company
  if (
    company.createdBy.toString() !== user._id.toString() &&
    user.role !== roleTypes.admin
  ) {
    return next(
      new Error("You are not authorized to delete this company!", {
        cause: 403,
      })
    );
  }

  company.deletedAt = new Date();
  await company.save();
  return res.status(200).json({ msg: "Company deleted successfully!" });
};

/////// Get specific company with related jobs
//////////////////////////////////////

export const getCompanyWithJobs = async (req, res, next) => {
  const { companyId } = req.params;

  const company = await companyModel
    .findById(companyId)
    .populate({ path: "jobOpportunity", model: "jobOpportunity" });

  if (!company) {
    return next(new Error("No company found!", { cause: 404 }));
  }

  res.status(200).json(company);
};

export const searchCompanyByName = async (req, res, next) => {
  const { companyName } = req.body;
  const company = await companyModel.findOne({
    companyName,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  });
  if (!company) {
    return next(new Error("No company found!", { cause: 404 }));
  }
  return res.status(200).json({ msg: `${companyName} is found!`, company });
};

export const uploadLogo = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error("You are not authorized to update this company's logo!", {
        cause: 403,
      })
    );
  }
  if (!req?.file) {
    return res.status(404).json({ msg: "logo is needed" });
  }
  if (company.logo?.public_id) {
    await cloudinary.uploader.destroy(company.logo.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "hobSearching/companyLogos" }
  );

  company.logo = { secure_url, public_id };
  await company.save();
  return res.status(200).json({ msg: "Logo updated!", company });
};

export const uploadCover = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error("You are not authorized to update this company's logo!", {
        cause: 403,
      })
    );
  }
  if (!req?.file) {
    return res.status(404).json({ msg: "logo is needed" });
  }
  if (company.coverPic?.public_id) {
    await cloudinary.uploader.destroy(company.coverPic.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "hobSearching/companyCoverPics" }
  );

  company.coverPic = { secure_url, public_id };
  await company.save();
  return res.status(200).json({ msg: "Cover Pictrue updated!", company });
};

export const deleteLogo = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error("You are not authorized to update this company's logo!", {
        cause: 403,
      })
    );
  }
  if (!company?.logo) {
    return res.status(404).json({ msg: "Your company have no logo pic!" });
  }
  await cloudinary.uploader.destroy(company.logo.public_id);

  company.logo = null;
  await company.save();
  return res
    .status(200)
    .json({ msg: "Your logo pic has been deleted!", company });
};

export const deleteCoverPic = async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await companyModel.findOne({ _id: companyId });
  if (!company) {
    return next(new Error("Company not found!", { cause: 404 }));
  }
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error("You are not authorized to update this company's cover pic!", {
        cause: 403,
      })
    );
  }
  if (!company?.coverPic) {
    return res.status(404).json({ msg: "Your company have no cover pic!" });
  }
  await cloudinary.uploader.destroy(company.coverPic.public_id);

  company.coverPic = null;
  await company.save();
  return res
    .status(200)
    .json({ msg: "Your cover pic has been deleted!", company });
};

export const generateApplicationSheet = async (req, res, next) => {
  const { companyId } = req.params;
  const { date } = req.query;
  // Find the company First
  const company = await companyModel.findById(companyId);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  // The owner and hr
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = company.HRs.some(
    (hrId) => hrId.toString() === req.user._id.toString()
  );

  if (!isOwner && !isHR) {
    return res.status(403).json({ message: "You are not authorized!" });
  }

  // Convert the data to be hours of the start and end day like

  const startDay = new Date(date).setHours(0, 0, 0, 0);
  const endDay = new Date(date).setHours(23, 59, 59, 999);
  const jobs = await jobOpportunityModel.find({ companyId });

  const jobIds = jobs.map((job) => job._id);

  if (jobIds.length === 0) {
    return res.status(404).json({ error: "No jobs found for this company" });
  }

  const applications = await applicationModel
    .find({
      jobId: { $in: jobIds },
      createdAt: { $gte: startDay, $lte: endDay },
    })
    .populate("jobId", "jobTitle jobLocation seniorityLevel")
    .populate("userId", "firstName lastName email");
  if (applications.length === 0) {
    return res
      .status(404)
      .json({ error: "No applications found for this date" });
  }
  // Excel
  const workBook = new ExcelJS.Workbook();
  const workSheet = workBook.addWorksheet("Job Applications");
  workSheet.columns = [
    { header: "Application ID", key: "applicationId", width: 25 },
    { header: "candidate name", key: "candidateName", width: 25 },
    { header: "candidate email", key: "candidateEmail", width: 25 },
    { header: "Job Title", key: "jobTitle", width: 25 },
    { header: "Job status", key: "jobStatus", width: 25 },
  ];
  applications.forEach((application) => {
    workSheet.addRow({
      applicationId: application._id.toString(),
      candidateName: application.userId.userName,
      candidateEmail: application.userId.email,
      jobTitle: application.jobId.jobTitle,
      jobStatus: application.jobId.status,
    });
  });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="applications_${company.name}_${date}.xlsx"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workBook.xlsx.write(res);
  res.end();
};
