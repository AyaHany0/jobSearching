import { Router } from "express";
import { authenticate } from "../../MiddleWares/authenticate.middleware.js";
import { validate } from "../../MiddleWares/validation.middleware.js";
import * as JV from "./job.validation.js";
import * as JS from "./job.service.js";
import { asyncHandler } from "../../utils/ErrorHandling/errorHandling.js";

export const jobRouter = Router({ mergeParams: true });
jobRouter.post(
  "/addJob",
  authenticate,
  validate(JV.addJobSchema),
  asyncHandler(JS.addJob)
);

jobRouter.post(
  "/updateJob/:jobId",
  authenticate,
  validate(JV.updateJobSchema),
  asyncHandler(JS.updateJob)
);

jobRouter.delete(
  "/deleteJob/:jobId",
  authenticate,
  validate(JV.paramsIds),
  asyncHandler(JS.deleteJob)
);

jobRouter.get(
  "/getJobs",
  authenticate,
  validate(JV.getJobsSchema),
  asyncHandler(JS.getJobs)
);
jobRouter.get(
  "/getJob/:jobId",
  authenticate,
  validate(JV.paramsIds),
  asyncHandler(JS.getJobs)
);

jobRouter.get(
  "/getJobsWithFilters",
  authenticate,
  validate(JV.getJobsWithFilters),
  asyncHandler(JS.getJobsWithFilters)
);

jobRouter.get(
  "/getAllApplications/:jobId",
  authenticate,
  validate(JV.paramsIds),
  asyncHandler(JS.getApplications)
);

jobRouter.post(
  "/applicationStatus/:applicationId",
  authenticate,
  validate(JV.applicationStatusSchema),
  asyncHandler(JS.acceptOrRejectApplication)
);
