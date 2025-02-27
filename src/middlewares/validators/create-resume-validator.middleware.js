import Joi from "joi";
import { MIN_RESUME_LENGTH } from "../../constant/resume.constant.js";
import { MESSAGES } from "../../constant/messages.constant.js";

const schema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": MESSAGES.RESUMES.COMMON.TITLE.REQUIRED,
  }),
  content: Joi.string().required().min(MIN_RESUME_LENGTH).messages({
    "any.required": MESSAGES.RESUMES.COMMON.CONTENT.REQUIRED,
    "string.min": MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
  }),
});

export const createResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
