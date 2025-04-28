import mongoose from "mongoose";
import { CreateTask } from "../Models/createTasksModel.js";
import { User } from "../Models/userModel.js";
import { checkUserRole } from "../Utils/checkRole.js";

import { handleMongoError } from "../Utils/mongooseId_error.js";
import { validateCreateUser } from "../Utils/createUserValidation.js";
import encryptPassword from "../Utils/encryption.js";
import { sendEmail } from "../Utils/sendMail.js";

const getAllusers = async(req,res)=>{
    try {
        const {userId} =req.body
        const userRole =await checkUserRole(userId);

        if(userRole.role === 'superAdmin'){
            const allUsersandAdmins =await User.find({ role: { $ne: 'superAdmin' } });
            console.log('All users and Admins ',allUsersandAdmins);
            return res.status(200).json({success:true,message:'All users and Admins ',allUsersandAdmins})
        }
        if(userRole.role === 'admin'){
            const allUsers = await User.find({role:'user'})
            console.log('All users ' ,allUsers);
            return res.status(200).json({success:true,message:'All users and Admins ',allUsers})
        }
        console.log('only admin and super-admin can access the users data',userRole);
        return res.status(402).json({success:false,message:'only admin and super-admin can access the users data'})
    }
     catch (error) {
        console.log('error in getting all users and admins',error);
        return handleMongoError(error,res)   
        }
}

const changeUserstatus = async(req,res)=>{
    try {
        const {userId,accountStatus,accId} =req.body;
        const userRole = await checkUserRole(userId);
        const acctoModify = await User.findById(accId);

        if(userRole.role==='user'){
            console.log('user have not access to active or de-active account');
            return res.status(403).json({success:false,message:'user have not access to active or de-active account.'})
        }
        if(userRole.role==='admin'){
            if(acctoModify.role ==='user'){
                acctoModify.accIsActive = accountStatus
                await acctoModify.save();
                console.log(`user account status is changed to ${ acctoModify.accIsActive} by ${userRole.role}`); 
                return res.status(200).json({success:true,message:`user account status is changed to ${ acctoModify.accIsActive} by ${userRole.role}`})
            }

            console.log('Admin can only access and modify the status of a simple user');
            return res.status(403).json({success:false,message:'Admin can only access and modify the status of a simple user'})
        }

        if(acctoModify.role==='superAdmin'){
            console.log('you cant De-active the super admin');
            return res.status(403).json({success:false,message:'you cant De-active the super admin'})
        }
        
        acctoModify.accIsActive = accountStatus
        await acctoModify.save();
        
        console.log(`user account status is changed to ${ acctoModify.accIsActive} by ${userRole.role}`); 
        return res.status(200).json({success:true,message:`user account status is changed to ${ acctoModify.accIsActive} by ${userRole.role}`})

    } 
    catch (error) {
        console.log('error in changing user account status');
        return handleMongoError(error,res)   
        }
}

const changeUserRole =async (req,res)=>{
    try {
        const {userId,userIdtomodifyRole,role} =req.body;
        if(!userId || !userIdtomodifyRole || !role){
            console.log('Please provide all required field to modify role of a user.');
            return res.status(403).json({success:false,message:'Please provide all required field to modify role of a user.'})
        }
 
        const checkRole = await checkUserRole(userId);
        const usertoModifyRole = await User.findById(userIdtomodifyRole);

        if(checkRole.role==='superAdmin'){
         
            if(usertoModifyRole.role === 'superAdmin' || role === 'superAdmin'){
                console.log('you cant change the role of a super admin');
                return res.status(403).json({success:false,message:'only super-admin have authority to change role'})
            }
            usertoModifyRole.role = role
            await usertoModifyRole.save();
            console.log(`${usertoModifyRole.name} is become an ${usertoModifyRole.role} now.`);
            return res.status(200).json({success:true,message:`${usertoModifyRole.name} is become an ${usertoModifyRole.role} now.`})
        }

        console.log('only super-admin have authority to change role');
        return  res.status(403).json({success:false,message:'only super-admin have authority to change role'})
       
    } 
    catch (error) {
        console.log('error in changing user role');
        return handleMongoError(error,res)   
     }
}

const getAlltaskbyAdmin = async (req,res)=>{
    try {
        const {userId,specificUserId} =req.body;
        const checkRole = await checkUserRole(userId);
        if(checkRole.role==='user'){
            console.log('only admin or super-admin can access all users tasks');
            return res.status(403).json({success:false,message:'only admin or super-admin can access all users tasks'})
        }

        if(specificUserId ){

            const specificUserTasks = await CreateTask.find({user:specificUserId})
            if(! specificUserTasks || specificUserTasks.length === 0){
            console.log('currently no task exists for this user.');
            return res.status(200).json({success:true,message:'currently no task exists for this user.'})
           }

            console.log(`All tasks of id  ${specificUserId} given below`);
            return res.status(200).json({success:true,message:`All tasks of id  ${specificUserId} given below`,specificUserTasks})

        }
        const allTasks =await CreateTask.find({})
        if(allTasks===null){
            console.log('currently there is no task available for any user.');
            return res.status(200).json({success:true,message:'currently there is no task available for any user.'})
        }
        console.log('The list of all task given below',allTasks);
        return res.status(200).json({success:true,message:'The list of all task given below',allTasks})
    }
     catch (error) {
        console.log('error in getting tasks by admin');
        return handleMongoError(error,res)   
      }
}

const addNewAdminorUser = async(req,res)=>{
    try {
        // const {userId} =req.body
        const {error,value} = validateCreateUser(req.body);
        
        if(error){
            console.log(error.details);
            return res.status(403).json({success:false,message:error.details})
        }

        const {name,email,password,role,userId} =value;

        const creator = await User.findById(userId);

        if(!creator || creator.role === 'user'){
            console.log('only admin or super-admin have authority to create a user.');
            return res.status(403).json({success:false,message:'only admin or super-admin have authority to create a user.'})
        }
        if(creator.role === 'admin' && role !== 'user'){
            console.log('Admin can only create a user.');
            return res.status(403).json({success:false,message:'Admin can only create a user.'})
        }

        if(creator.role ==='superAdmin' && !['admin','user'].includes(role)){
            console.log('super-admin can only create an admin or user.');
            return res.status(403).json({success:false,message:'super-admin can only create an admin or user.'})
        }

        const existingUser =await User.findOne({email});
        const expiresAt = Date.now() + 1 * 60 * 1000;
        if (existingUser) {
            if (!existingUser.isVerified) {
                const confirmationCode = await sendEmail(email, 'Your Verification Code');
                existingUser.confirmationCodeFornewAcc = confirmationCode;
                existingUser.expiresAt = expiresAt;
                await existingUser.save();

                return res.status(401).json({ success: false, message: 'User already exists but is not verified. Verification code resent.' });
            }
           

            return res.status(409).json({ success: false, message: 'User already exists with this email' });
        }

        const hashedPassword = await encryptPassword(password);
        const confirmationCode = await sendEmail(email, 'Your Verification Code');

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            confirmationCodeFornewAcc:confirmationCode,
            expiresAt,
            isVerified: false
        })

        console.log(`New ${role} is created by ${creator.role}. Please verify confirmation code to continue.`);
        return res.status(200).json({success:true,message:`New ${role} is created by ${creator.role}. Please verify confirmation code to continue.`})
   
    }
     catch (error) {
        console.log('error in creating usser by admin or super admin.',error);
        return res.status(500).json({success:false,message:'error in creating usser by admin or super admin.',error})
    }
}

export {getAllusers,changeUserstatus,changeUserRole,getAlltaskbyAdmin,addNewAdminorUser}