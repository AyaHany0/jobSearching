import userModel from "../../Database/Models/user.model.js";
import { decodeToken } from "../../MiddleWares/authenticate.middleware.js";
import { emailTempContent } from "../../Services/EmailServices/EmailTemplate/content.js";
import { compareHash } from "../../utils/Bcrypt/bcrypt.js";
import cloudinary from "../../utils/Cloudinary/cloudinary.js";
import { eventEmitter } from "../../utils/Events/sendEmail.event.js";
import { generateJWT } from "../../utils/JWT/jwt.js";
import { generateOTP, verifyOTP } from "../../utils/OTP/otp.js";
import { OAuth2Client } from "google-auth-library";

import {
  OTPTypes,
  providerTypes,
  roleTypes,
  tokenTypes,
} from "../../utils/types.js";

/////////////////////////////// Sign Up ///////////////////////////////
export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password, gender, mobileNumber, DOB } =
    req.body;

  // Check if the email already exist
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return next(new Error("This email is already exist", { cause: 403 }));
  }
  // Check if the pics uploaded
  if (req.files?.length == 0) {
    return next(new Error("Please upload the needed pictures", { cause: 400 }));
  }
  const profile = await cloudinary.uploader.upload(
    req.files.profilePic[0].path,
    {
      folder: "jobSearching/profilePics",
    }
  );
  const cover = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
    folder: "jobSearching/coverPics",
  });
  // Create the user
  const user = await userModel.create({
    firstName,
    lastName,
    email,
    password,
    gender,
    mobileNumber,
    coverPic: { public_id: cover.public_id, secure_url: cover.secure_url },
    DOB,
    profilePic: {
      public_id: profile.public_id,
      secure_url: profile.secure_url,
    },
  });
  if (!user) {
    return next(new Error("Error in creating the user", { cause: 500 }));
  }
  // Generating the OTP and sending confirm email to the user's email
  const code = await generateOTP(user, OTPTypes.confirmEmail, 600000);
  eventEmitter.emit("sendEmail", {
    email,
    code,
    content: emailTempContent.confirmation.content,
    subject: emailTempContent.confirmation.subject,
    expires: emailTempContent.confirmation.expires,
  });
  return res.status(201).json({ msg: "User created successfully!", user });
};

/////////////////////////////// Confirm Email ///////////////////////////////
export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const verfiy = await verifyOTP(user, OTPTypes.confirmEmail, code);
  if (verfiy.status == false) {
    return next(new Error(verfiy.message, { cause: 400 }));
  }

  await userModel.updateOne({ email }, { isConfirmed: true });
  return res.status(200).json({ msg: "Email confirmed successfully!" });
};

/////////////////////////////// sign in ///////////////////////////////

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email,
    provider: providerTypes.system,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const isPasswordValid = await compareHash(password, user.password);

  if (!isPasswordValid) {
    return next(new Error("Password is incorrect", { cause: 400 }));
  }

  const access_token = await generateJWT({
    payload: { email, _id: user._id },
    signature:
      user.role == roleTypes.user
        ? process.env.ACCESS_SIGNATURE_USER
        : process.env.ACCESS_SIGNATURE_ADMIN,

    options: { expiresIn: "1h" },
  });
  const refresh_token = await generateJWT({
    payload: { email, _id: user._id },
    signature:
      user.role == roleTypes.user
        ? process.env.REFRESH_SIGNATURE_USER
        : process.env.REFRESH_SIGNATURE_ADMIN,

    options: { expiresIn: "1w" },
  });
  return res.status(200).json({
    msg: "User signed in successfully!",
    token: access_token,
    refresh: refresh_token,
  });
};

////////////////////////////// Refresh Token ///////////////////////////////

export const refreshToken = async (req, res, next) => {
  const { authenticate } = req.body;

  const user = await decodeToken({
    authenticate,
    tokenType: tokenTypes.refresh,
    next,
  });

  const access_token = await generateJWT({
    payload: { email: user.email, _id: user._id },
    signature:
      user.role == roleTypes.user
        ? process.env.ACCESS_SIGNATURE_USER
        : process.env.ACCESS_SIGNATURE_ADMIN,

    options: { expiresIn: "1h" },
  });
  return res.status(200).json({
    msg: "Token refreshed successfully!",
    token: access_token,
  });
};

//////////////////////////////////////// forgot password ////////////////////////////////////////

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email, isConfirmed: true });
  if (!user) {
    return next(
      new Error("User not found or you didn't confirm your account", {
        cause: 404,
      })
    );
  }
  const code = await generateOTP(user, OTPTypes.forgetPassword, 600000);
  eventEmitter.emit("sendEmail", {
    email,
    code,
    content: emailTempContent.forgetPassword.content,
    subject: emailTempContent.forgetPassword.subject,
    expires: emailTempContent.forgetPassword.expires,
  });
  return res.status(200).json({ msg: "Code sent successfully!" });
};

////////////////////////////////////////// reset password ////////////////////////////////////////
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email });
  const verify = await verifyOTP(user, OTPTypes.forgetPassword, otp);
  if (verify.status == false) {
    return next(new Error(verify.message, { cause: 400 }));
  }
  user.password = newPassword;
  user.changeCredentialTime = Date.now();
  await user.save();

  if (!user) {
    return next(new Error("Failed to reset password!", { cause: 404 }));
  }
  return res.status(200).json({ msg: "Password reset successfully!" });
};

////////////////////////////////////////// signup with google/////////////////////////////////////////

export const googleSignUp = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const { email, email_verified, family_name, given_name, picture } =
    await verify();

  const user = await userModel.findOne({ email });

  if (user) {
    return res.status(403).json({ msg: "This email is already exist" });
  }
  const newUser = await userModel.create({
    firstName: given_name,
    lastName: family_name,
    email,
    profilePic: { secure_url: picture },
    provider: providerTypes.google,
    isConfirmed: email_verified,
  });
  if (!newUser) {
    return next(new Error("Failed to create the user", { cause: 500 }));
  }
  return res
    .status(201)
    .json({ msg: "User created successfully!", user: newUser });
};

////////////////////////////////////////// signin with google /////////////////////////////////////////

export const googleSignIn = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const { email } = await verify();
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  const access_token = await generateJWT({
    payload: { email, _id: user._id },
    signature:
      user.role == roleTypes.user
        ? process.env.ACCESS_SIGNATURE_USER
        : process.env.ACCESS_SIGNATURE_ADMIN,

    options: { expiresIn: "1h" },
  });
  const refresh_token = await generateJWT({
    payload: { email, _id: user._id },
    signature:
      user.role == roleTypes.user
        ? process.env.REFRESH_SIGNATURE_USER
        : process.env.REFRESH_SIGNATURE_ADMIN,

    options: { expiresIn: "1w" },
  });
  return res.status(200).json({
    msg: "User signed in successfully!",
    token: access_token,
    refresh: refresh_token,
  });
};

/////////////////////////////////////// get user data ////////////////////

export const getProfile = async (req, res, next) => {
  const user = req.user;
  return res.status(200).json({ msg: "User data", user });
};

//////////////////////////////////////// get another user data ///////////////////////

export const getUserProfile = async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel
    .findOne({ _id: userId })
    .select("userName mobileNumber profilePic coverPic");

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  return res.status(200).json({ msg: "User data", user });
};

///////////////////////////////////////// update user data ///////////////////////////////

export const updateProfile = async (req, res, next) => {
  const user = req.user;
  if (req.body.firstName) {
    user.firstName = req.body.firstName;
  }
  if (req.body.lastName) {
    user.lastName = req.body.lastName;
  }
  if (req.body.gender) {
    user.gender = req.body.gender;
  }
  if (req.body.DOB) {
    user.DOB = req.body.DOB;
  }
  if (req.body.mobileNumber) {
    user.mobileNumber = req.body.mobileNumber;
  }

  const updatedUser = await user.save();
  return res
    .status(200)
    .json({ msg: "Profile updated successfully!", updatedUser });
};

///////////////////////////////////// update Password //////////////////////

export const updatePassword = async (req, res, next) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;
  if (!(await compareHash(currentPassword, req.user.password))) {
    return next(new Error("Invalid Password", { cause: 403 }));
  }
  if (currentPassword === newPassword) {
    return next(
      new Error("The new password and the current password can't be the same!")
    );
  }
  user.password = newPassword;
  user.changeCredentialTime = Date.now();
  await user.save();
  return res.status(200).json({ msg: "Password has been updated!", user });
};

///////////////////////////////////// upload profile pic/////////////////

export const uploadProfilePic = async (req, res, next) => {
  const user = req.user;
  if (!req?.file) {
    return res.status(404).json({ msg: "Profile picture ne" });
  }
  if (user.profilePic?.public_id) {
    await cloudinary.uploader.destroy(user.profilePic.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "hobSearching/userProfiles" }
  );

  user.profilePic = { secure_url, public_id };
  await user.save();
  return res.status(200).json({ msg: "Profile picture updated!", user });
};

////////////////////////////////////////// upload cover ////////////////////
export const uploadCoverPic = async (req, res, next) => {
  const user = req.user;
  if (!req?.file) {
    return res.status(404).json({ msg: "Cover picture ne" });
  }
  if (user.coverPic?.public_id) {
    await cloudinary.uploader.destroy(user.coverPic.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "hobSearching/userCovers" }
  );

  user.coverPic = { secure_url, public_id };
  await user.save();
  return res.status(200).json({ msg: "cover picture updated!", user });
};

/////////////////////////////////////// delete profilePic/////////////////

export const deleteProfilePic = async (req, res, next) => {
  const user = req.user;
  if (!user?.profilePic) {
    return res.status(404).json({ msg: "You have no profile pic!" });
  }
  await cloudinary.uploader.destroy(user.profilePic.public_id);

  user.profilePic = null;
  await user.save();
  return res.status(200).json({ msg: "Your profile pic has been deleted!" });
};

/////////////////////////////////////// delete coverPic/////////////////

export const deleteCoverPic = async (req, res, next) => {
  const user = req.user;
  if (!user?.profilePic) {
    return res.status(404).json({ msg: "You have no cover pic!" });
  }
  await cloudinary.uploader.destroy(user.coverPic.public_id);

  user.coverPic = null;
  await user.save();
  return res.status(200).json({ msg: "Your cover pic has been deleted!" });
};


///////////////////////////////////// delete account /////////////////////////////////

export const deleteAccount = async (req, res, next) => {
  const user = req.user;
  user.deletedAt = Date.now();
  await user.save();
  return res.status(200).json({ msg: "Your account has been deleted!" });
}