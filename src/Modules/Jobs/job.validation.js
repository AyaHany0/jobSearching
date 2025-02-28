import Joi from "joi";
import * as Type from "../../utils/types.js";
import { generalValidationRules } from "../../utils/GeneralRules/generalRules.js";

export const addJobSchema = Joi.object({
  jobTitle: Joi.string().required(),
  jobLocation: Joi.string()
    .valid(...Object.values(Type.jobLocationTypes))
    .required(),
  workingTime: Joi.string()
    .valid(...Object.values(Type.jobTypeTypes))
    .required(),
  seniorityLevel: Joi.string()
    .valid(...Object.values(Type.seniorityLevelTypes))
    .required(),
  jobDescription: Joi.string().required(),
  technicalSkills: Joi.array().items(Joi.string()),
  softSkills: Joi.array().items(Joi.string()),
  companyId: generalValidationRules.objectId.required(),
});

export const updateJobSchema = Joi.object({
  jobTitle: Joi.string(),
  jobLocation: Joi.string().valid(...Object.values(Type.jobLocationTypes)),
  workingTime: Joi.string().valid(...Object.values(Type.jobTypeTypes)),
  seniorityLevel: Joi.string().valid(
    ...Object.values(Type.seniorityLevelTypes)
  ),
  jobDescription: Joi.string(),
  technicalSkills: Joi.array().items(Joi.string()),
  softSkills: Joi.array().items(Joi.string()),
  companyId: generalValidationRules.objectId.required(),
  jobId: generalValidationRules.objectId.required(),
});

export const paramsIds = Joi.object({
  companyId: generalValidationRules.objectId.required(),
  jobId: generalValidationRules.objectId.required(),
});
export const companyId = Joi.object({
  companyId: generalValidationRules.objectId.required(),
});
export const applicationStatusSchema = Joi.object({
  applicationId: generalValidationRules.objectId.required(),
    status: Joi.string().valid(...Object.values(Type.jobApplicationStatusTypes)).required(),
});

export const getJobsSchema = Joi.object({
  companyId: generalValidationRules.objectId.required(),
  search: Joi.string(),
  limit: Joi.string(),
  page: Joi.string(),
});

export const getJobsWithFilters = Joi.object({
  companyId: generalValidationRules.objectId,
  search: Joi.string(),
  limit: Joi.string(),
  page: Joi.string(),
  jobTitle: Joi.string(),
  jobLocation: Joi.string().valid(...Object.values(Type.jobLocationTypes)),
  workingTime: Joi.string().valid(...Object.values(Type.jobTypeTypes)),
  seniorityLevel: Joi.string().valid(
    ...Object.values(Type.seniorityLevelTypes)
  ),
  technicalSkills: Joi.array().items(Joi.string()),
});
