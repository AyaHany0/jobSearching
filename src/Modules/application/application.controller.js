import { authenticate } from "../../MiddleWares/authenticate.middleware.js";
import { multerHost } from "../../MiddleWares/multer.middleware.js";
import { validate } from "../../MiddleWares/validation.middleware.js";
import { asyncHandler } from "../../utils/ErrorHandling/errorHandling.js";
import { fileFormats } from "../../utils/types.js";
import { applyApplication } from "./application.service.js";
import { applyApplicationSchema } from "./application.validation.js";

import { Router } from "express";

export const applicationRouter = Router();

applicationRouter.post(
  "/applyApplication",
  multerHost(fileFormats.document).single("userCV"),
  authenticate,
  validate(applyApplicationSchema),
  asyncHandler(applyApplication)
);
