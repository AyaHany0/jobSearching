import { Router } from "express";
import { authenticate } from "../../MiddleWares/authenticate.middleware.js";
import { authorization } from "../../MiddleWares/authorization.middleware.js";
import { roleTypes } from "../../utils/types.js";
import { validate } from "../../MiddleWares/validation.middleware.js";
import { userIdSchema } from "../User/user.validation.js";
import { asyncHandler } from "../../utils/ErrorHandling/errorHandling.js";
import {
  approveCompany,
  banOrUnbanCompany,
  banOrUnbanUser,
} from "./admin.service.js";
import { companyIdSchema } from "../Company/company.validation.js";

export const adminRouter = Router();
adminRouter.patch(
  "/banOrUnbanUser/:userId",
  validate(userIdSchema),
  authenticate,
  authorization([roleTypes.admin]),
  asyncHandler(banOrUnbanUser)
);

adminRouter.patch(
  "/banOrUnbanCompany/:companyId",
  validate(companyIdSchema),
  authenticate,
  authorization([roleTypes.admin]),
  asyncHandler(banOrUnbanCompany)
);

adminRouter.patch(
  "/approveCompany/:companyId",
  validate(companyIdSchema),
  authenticate,
  authorization([roleTypes.admin]),
  asyncHandler(approveCompany)
);
