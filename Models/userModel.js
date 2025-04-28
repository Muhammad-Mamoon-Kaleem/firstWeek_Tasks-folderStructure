import mongoose from "mongoose";
import { type } from "os";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    tempPasswordHash: {
        type: String,
    },
    confirmationCodeFornewAcc: {
        type: Number,
    },
    confirmationCodeForChangePass: {
        type: Number,
    },
    expiresAt: {
        type: Date, 
    },
    isVerified: {
        type: Boolean,
        default: false, 
    },
    isChangedPassword: {
        type: Boolean,
        default: false, 
    },
    accIsActive:{
        type:Boolean,
        default:true,
    },
    role: {
        type: String,
        enum: ['superAdmin', 'admin', 'user'],     
    },
   token: {
    type:String,
    },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
