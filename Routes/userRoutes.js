import express from 'express'
import { changePassword, createTask, createUser, getUserHistory, loginUser, logOut, showAllUserTask, updateTaskStatus } from '../Controllers/userController.js';
import {   verifyConfirmationForChangePass, verifyConfirmationForNewAccount } from '../MiddleWares/confirmationMiddleware.js';
import Userauthentication from '../MiddleWares/userAuthenticationMiddleware.js';
import { historyMiddleware } from '../MiddleWares/historyTrackMiddleware.js';
const userRouter = express.Router();
userRouter.post('/createuser',createUser)
userRouter.post('/verifyandcreate', verifyConfirmationForNewAccount)
userRouter.post('/loginuser',historyMiddleware,loginUser)
userRouter.post('/changepassword',historyMiddleware,changePassword)
userRouter.post('/verifyandchangepassword',historyMiddleware,verifyConfirmationForChangePass)
userRouter.post('/createtask',Userauthentication('Please login before creating task'),historyMiddleware,createTask)
userRouter.get('/allusertasks',Userauthentication('Please login before getting user tasks'),historyMiddleware,showAllUserTask)
userRouter.patch('/updatetaskstatus',Userauthentication('Please login to update task status'),historyMiddleware,updateTaskStatus)
userRouter.post('/logout',Userauthentication('Logout failed'),historyMiddleware,logOut)
userRouter.get('/getuserhistory',Userauthentication('please login before getting history'),getUserHistory)
export default userRouter;
