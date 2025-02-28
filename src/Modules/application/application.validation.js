import Joi from "joi";
import { generalValidationRules } from "../../utils/GeneralRules/generalRules.js";
import { jobApplicationStatusTypes } from "../../utils/types.js";

export const applyApplicationSchema = Joi.object({
  jobId: generalValidationRules.objectId.required(),
  status: Joi.string().valid(...Object.values(jobApplicationStatusTypes)),
  file: generalValidationRules.file.required()
});
