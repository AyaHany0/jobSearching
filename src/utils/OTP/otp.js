import { customAlphabet } from "nanoid";
import { compareHash, hash } from "../Bcrypt/bcrypt.js";
import cron from "node-cron";
import userModel from "../../Database/Models/user.model.js";

// Generate OTP

export const generateOTP = async (user, OTPType, expiresin) => {
  // Generate a 6 digits OTP
  const code = customAlphabet("1234567890", 6)();
  // Generate the expiration date
  const expiration = new Date(Date.now() + expiresin);
  // Hashed the OTP to be stored in the database
  const hashedOTP = await hash(code, 12);
  // Storing the OTP in the database
  user.OTP.push({ code: hashedOTP, OTPType, expiresIn: expiration });
  await user.save();
  // Return the code to be sent to the user
  return code;
};

// Verify OTP

export const verifyOTP = async (user, OTPType, code) => {
  const OTPfound = user.OTP.find((otp) => otp.OTPType === OTPType);

  if (!OTPfound) {
    return { status: false, message: "Invalid OTP" };
  }

  // Check if the OTP is expired
  if (new Date() > OTPfound.expiresIn) {
    return { status: false, message: "OTP expired" };
  }

  // Compare the hashed OTP
  const isMatch = await compareHash(code, OTPfound.code);
  if (!isMatch) {
    return { status: false, message: "Invalid OTP" };
  }

  // Remove the used OTP
  user.OTP = user.OTP.filter(
    (otp) => otp.code !== OTPfound.code && otp.OTPType !== OTPType
  );
  await user.save();

  return { status: true, message: "OTP verified" };
};

cron.schedule("0 */6 * * *", async () => {
  console.log("schedule deletion Executed!");
  const now = new Date();
  const result = await userModel.updateMany(
    {},
    { $pull: { OTP: { expiresIn: { $lt: now } } } }
  );
  console.log(result);
});
