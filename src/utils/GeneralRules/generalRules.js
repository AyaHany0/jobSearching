
import Joi from "joi";
import mongoose from "mongoose";

export const IDValidation = (value, helper) => {
  const isValid = mongoose.Types.ObjectId.isValid(value);
  return isValid ? value : helper.messages("Invalid ID");
};
export const ageValidation = (value , helper)=>{
  const age = new Date().getFullYear() - new Date(value).getFullYear();
  return age >= 18 ? value : helper.message("Age must be 18+");  
}
export const generalValidationRules = {
  objectId: Joi.string().custom(IDValidation),
  headers: Joi.object({
    token: Joi.string().required(),
    "postman-token": Joi.string().required(),
    "content-type": Joi.string().required(),
    "content-length": Joi.string().required(),
    host: Joi.string().required(),
    "user-agent": Joi.string().required(),
    accept: Joi.string().required(),
    "accept-encoding": Joi.string().required(),
    connection: Joi.string().required(),
  }),
  file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
  }),
};
