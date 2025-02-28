import Joi from "joi";
import { generalValidationRules } from "../../utils/GeneralRules/generalRules.js";

export const addCompanySchema = Joi.object({
  companyName: Joi.string().required(),
  description: Joi.string().required().min(5),
  industry: Joi.string().required(),
  address: Joi.string().required(),
  numberOfEmployees: Joi.object({
    from: Joi.number().required(),
    to: Joi.number().required(),
  }).required(),
  companyEmail: Joi.string()
    .required()
    .trim()
    .email({ tlds: { allow: false } }),
  HRs: Joi.array().items(Joi.string()),
  logo: Joi.array().items(generalValidationRules.file).min(1),
  coverPic: Joi.array().items(generalValidationRules.file).min(1),
  legalAttachment: Joi.array().items(generalValidationRules.file).min(1),
}).required();

export const updateCompanySchema = Joi.object({
  companyId: generalValidationRules.objectId.required(),
  companyName: Joi.string(),
  description: Joi.string().min(5),
  industry: Joi.string(),
  address: Joi.string(),
  numberOfEmployees: Joi.object({
    from: Joi.number().required(),
    to: Joi.number().required(),
  }),
  companyEmail: Joi.string()
    .trim()
    .email({ tlds: { allow: false } }),
  HRs: Joi.array().items(Joi.string()),
  logo: Joi.array().items(generalValidationRules.file).min(1),
  coverPic: Joi.array().items(generalValidationRules.file).min(1),
}).required();

export const companyIdSchema = Joi.object({
  companyId: generalValidationRules.objectId.required(),
});

export const companyNameSchema = Joi.object({
  companyName: Joi.string().required(),
});

export const updatePic = Joi.object({
  file: generalValidationRules.file.required(),
  companyId: generalValidationRules.objectId.required(),
});

export const generateApplicationSheetSchema = Joi.object({
  companyId: generalValidationRules.objectId.required(),
  date: Joi.date().less("now").iso().required(),
});
