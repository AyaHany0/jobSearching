import { Router } from "express";
import { authenticate } from "../../MiddleWares/authenticate.middleware.js";
import { multerHost } from "../../MiddleWares/multer.middleware.js";
import { fileFormats } from "../../utils/types.js";
import { validate } from "../../MiddleWares/validation.middleware.js";
import * as CV from "./company.validation.js";
import * as CS from "./company.service.js";
import { asyncHandler } from "../../utils/ErrorHandling/errorHandling.js";
import { parseNumberOfEmployees } from "../../MiddleWares/parsing.middleWare.js";
import { jobRouter } from "../Jobs/job.controller.js";

export const companyRouter = Router();
companyRouter.use("/:companyId/job/", jobRouter);
companyRouter.post(
  "/addCompany",
  authenticate,
  multerHost(fileFormats.document, fileFormats.image).fields([
    { name: "logo", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
    { name: "legalAttachment", maxCount: 1 },
  ]),
  parseNumberOfEmployees,
  validate(CV.addCompanySchema),
  asyncHandler(CS.addCompany)
);

companyRouter.post(
  "/updateCompany/:companyId",
  authenticate,
  multerHost(fileFormats.image).fields([
    { name: "logo", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
  ]),
  parseNumberOfEmployees,
  validate(CV.updateCompanySchema),
  asyncHandler(CS.updateCompanyInfo)
);

companyRouter.delete(
  "/deleteCompany/:companyId",
  authenticate,
  validate(CV.companyIdSchema),
  asyncHandler(CS.deleteCompany)
);

companyRouter.get(
  "/getCompanyByName",
  authenticate,
  validate(CV.companyNameSchema),
  asyncHandler(CS.searchCompanyByName)
);
companyRouter.get(
  "/getCompanyWithJobs/:companyId",
  authenticate,
  validate(CV.companyIdSchema),
  asyncHandler(CS.getCompanyWithJobs)
);
companyRouter.patch(
  "/uploadLogo/:companyId",
  authenticate,
  multerHost(fileFormats.image).single("logo"),
  validate(CV.updatePic),
  asyncHandler(CS.uploadLogo)
);

companyRouter.patch(
  "/uploadCoverPic/:companyId",
  authenticate,
  multerHost(fileFormats.image).single("coverPic"),
  validate(CV.updatePic),
  asyncHandler(CS.uploadCover)
);

companyRouter.delete(
  "/deleteLogo/:companyId",
  authenticate,
  validate(CV.companyIdSchema),
  asyncHandler(CS.deleteLogo)
);

companyRouter.delete(
  "/deleteCoverPic/:companyId",
  authenticate,
  validate(CV.companyIdSchema),
  asyncHandler(CS.deleteCoverPic)
);

companyRouter.get(
  "/generateApplicationSheet/:companyId",
  authenticate,
  validate(CV.generateApplicationSheetSchema),
  asyncHandler(CS.generateApplicationSheet)
);
