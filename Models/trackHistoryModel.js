
import mongoose from "mongoose";

const userHistorySchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    path:{
        type:String
    },
    method:{
        type:String
    },
    time:{
        type:Date
    }
});

export const UserHistory = mongoose.models.UserHistory || mongoose.model('UserHistory',userHistorySchema);
