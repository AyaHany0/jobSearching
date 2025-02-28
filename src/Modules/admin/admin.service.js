import companyModel from "../../Database/Models/company.model.js";
import userModel from "../../Database/Models/user.model.js";

export const banOrUnbanUser = async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.findOne({
    _id: userId,
  });
  if (!user) {
    return next(new Error("No user found!", { cause: 403 }));
  }
  if(user.deletedAt){
    return next(new Error("User already deleted",{cause:403}))
  }
  let updatedUser, banAction;
  if (user.bannedAt) {
    updatedUser = await userModel.findByIdAndUpdate(
      { _id: userId },
      { $unset: { bannedAt: 1 } },
      { new: true }
    );
    banAction = "unbanned";
  } else {
    updatedUser = await userModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { bannedAt: Date.now() } },
      { new: true }
    );
    banAction = "banned";
  }
  return res.status(200).json({
    message: `User has been ${banAction}`,
    user: updatedUser,
  });
};

export const banOrUnbanCompany = async (req, res, next) => {
  const { companyId } = req.params;
  const company = await companyModel.findOne({
    _id: companyId,
  });
  if (!company) {
    return next(new Error("No company found!", { cause: 403 }));
  }
  if(company.deletedAt){
    return next(new Error(" company deleted!", { cause: 403 }));

  }
  let updatedCompany, banAction;
  if (company.bannedAt) {
    updatedCompany = await companyModel.findByIdAndUpdate(
      companyId,
      { $unset: { bannedAt: 1 } },
      { new: true }
    );
    banAction = "Unbanned";
  } else {
    updatedCompany = await companyModel.findByIdAndUpdate(
      companyId,
      { $set: { bannedAt: new Date() } },
      { new: true }
    );
    banAction = "banned";
  }
  return res.status(200).json({
    message: `Company has been ${banAction}`,
    company: updatedCompany,
  });
};

export const approveCompany = async (req, res, next) => {
  const { companyId } = req.params;
  const company = await companyModel.findOne({
    _id: companyId,
    approvedByAdmin: false,
  });
  if (!company) {
    return res
      .status(404)
      .json({ msg: "No company found or already approved" });
  }
  if(company.deletedAt){
    return next(new Error(" company deleted!", { cause: 403 }));

  }

  const updatedCompany = await companyModel.findByIdAndUpdate(
    companyId,
    { approvedByAdmin: true },
    { new: true }
  );
  return res.status(200).json({
    message: "Company has been approved",
    company: updatedCompany,
  });
};
