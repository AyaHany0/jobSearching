import Joi from "joi";
import * as Type from "../../utils/types.js";
import {
  ageValidation,
  generalValidationRules,
} from "../../utils/GeneralRules/generalRules.js";

export const signUpSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  rePassword: Joi.string().min(8).valid(Joi.ref("password")).required(),
  gender: Joi.string()
    .valid(Type.genderTypes.female, Type.genderTypes.male)
    .required(),
  mobileNumber: Joi.string()
    .regex(/^01[0125][0-9]{8}$/)
    .required(),
  profilePic: Joi.array().items(generalValidationRules.file).min(1),
  coverPic: Joi.array().items(generalValidationRules.file).min(1),
  DOB: Joi.date().less("now").iso().required().custom(ageValidation),
}).required();

export const confirmEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required(),
}).required();

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).required();

export const refreshTokenSchema = Joi.object({
  authenticate: Joi.string().required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: Joi.string().min(8).required(),
  reNewPassword: Joi.string().min(8).valid(Joi.ref("newPassword")).required(),
});

export const userIdSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30),
  lastName: Joi.string().min(2).max(30),
  gender: Joi.string().valid(Type.genderTypes.female, Type.genderTypes.male),
  mobileNumber: Joi.string().regex(/^01[0125][0-9]{8}$/),
  DOB: Joi.date().less("now").iso().custom(ageValidation),
}).required();

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
  reNewPassword: Joi.string().min(8).valid(Joi.ref("newPassword")).required(),
});

export const updatePic = Joi.object({
  file: Joi.object().required(),
});
