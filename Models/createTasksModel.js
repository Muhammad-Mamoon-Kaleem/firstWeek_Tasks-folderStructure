import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    task: { type:String,required:true},
    status: { type: String, enum: ['pending', 'complete', 'start', 'block'],default:'start' },
    description: String,
  }, { timestamps: true });
  
 export const CreateTask=mongoose.models.CreateTask || mongoose.model('Activity', activitySchema);
