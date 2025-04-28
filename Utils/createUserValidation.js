import joi from 'joi'

const createUserSchema = joi.object({
        name:joi.string().min(3).max(20).required(),
        email:joi.string().email().required(),
        password:joi.string().min(6).max(8).required(),
        role:joi.string().required(),
        userId:joi.string().required()
    });

export const validateCreateUser = (data)=>createUserSchema.validate(data)
