import Joi from 'joi';

const validator = (schema : Joi.Schema) => (payload : object) => schema.validate(payload, {abortEarly : false});

const registerSchema = Joi.object({
    fullName : Joi.string().required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(6).required(),
    profilePic : Joi.string(),
    birthDay : Joi.date()
    // confirmPassword : Joi.ref('password'),
});

export const validateRegister = validator(registerSchema);

const loginSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().min(6).required(),
});

export const validateLogin = validator(loginSchema);