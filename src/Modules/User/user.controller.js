import { Router } from "express";
import { asyncHandler } from "../../utils/ErrorHandling/errorHandling.js";
import * as US from "./user.service.js";
import { validate } from "../../MiddleWares/validation.middleware.js";
import * as UV from "./user.validation.js";
import { multerHost } from "../../MiddleWares/multer.middleware.js";
import { fileFormats } from "../../utils/types.js";
import { authenticate } from "../../MiddleWares/authenticate.middleware.js";

export const userRouter = Router();
// Auth
//1
userRouter.post(
  "/signUp",
  multerHost(fileFormats.image).fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
  ]),
  validate(UV.signUpSchema),
  asyncHandler(US.signUp)
);

//2
userRouter.post(
  "/confirmEmail",
  validate(UV.confirmEmailSchema),
  asyncHandler(US.confirmEmail)
);
//3
userRouter.post("/signIn", validate(UV.signInSchema), US.signIn);
//4
userRouter.get(
  "/refreshToken",
  validate(UV.refreshTokenSchema),
  asyncHandler(US.refreshToken)
);
//5
userRouter.post(
  "/forgetPassword",
  validate(UV.emailSchema),
  asyncHandler(US.forgetPassword)
);
//6
userRouter.post(
  "/resetPassword",
  validate(UV.resetPasswordSchema),
  asyncHandler(US.resetPassword)
);
//7
userRouter.post("/signupwithgmail", asyncHandler(US.googleSignUp));
//8
userRouter.post("/signinwithgmail", asyncHandler(US.googleSignIn));

// All Auth APIs are done the cron function in otp file in utils folder

userRouter.get("/profile", authenticate, asyncHandler(US.getProfile));

userRouter.get(
  "/userProfile/:userId",
  authenticate,
  validate(UV.userIdSchema),
  asyncHandler(US.getUserProfile)
);

userRouter.patch(
  "/updateProfile",
  authenticate,
  validate(UV.updateProfileSchema),
  asyncHandler(US.updateProfile)
);
userRouter.patch(
  "/updatePassword",
  authenticate,
  validate(UV.updatePasswordSchema),
  asyncHandler(US.updatePassword)
);

userRouter.patch(
  "/updateProfilePic",
  authenticate,
  multerHost(fileFormats.image).single("profilePic"),
  validate(UV.updatePic),
  asyncHandler(US.uploadProfilePic)
);

userRouter.patch(
  "/updateCoverPic",
  authenticate,
  multerHost(fileFormats.image).single("coverPic"),
  validate(UV.updatePic),
  asyncHandler(US.uploadCoverPic)
);

userRouter.delete(
  "/deleteProfilePic",
  authenticate,
  asyncHandler(US.deleteProfilePic)
);

userRouter.delete(
  "/deleteCoverPic",
  authenticate,
  asyncHandler(US.deleteCoverPic)
);
userRouter.delete(
  "/deleteAccount",
  authenticate,
  asyncHandler(US.deleteAccount)
);
