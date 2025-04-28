import { configDotenv } from "dotenv";
import mongoose from "mongoose"

const connectMongoose = async()=>{
    try {
     await mongoose.connect(process.env.MONGODB_URL);
     console.log("Mongo Db connected successfully");
     
    } 
    catch (error) {
        console.log('Mongo Db connection error',error);
    }
}

export default connectMongoose;