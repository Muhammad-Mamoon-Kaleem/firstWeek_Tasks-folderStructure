import express from 'express'
import { changePassword, createTask, createUser, getUserHistory, loginUser, logOut, showAllUserTask, updateTaskStatus } from '../Controllers/userController.js';
import multer from 'multer';
import {   verifyConfirmationForChangePass, verifyConfirmationForNewAccount } from '../MiddleWares/confirmationMiddleware.js';
import Userauthentication from '../MiddleWares/userAuthenticationMiddleware.js';
import { historyMiddleware } from '../MiddleWares/historyTrackMiddleware.js';
const userRouter = express.Router();
const midlleware = multer();
userRouter.post('/createuser',midlleware.none(),createUser)
userRouter.post('/verifyandcreate',midlleware.none(), verifyConfirmationForNewAccount)
userRouter.post('/loginuser',midlleware.none(),historyMiddleware,loginUser)
userRouter.post('/changepassword',midlleware.none(),historyMiddleware,changePassword)
userRouter.post('/verifyandchangepassword',midlleware.none(),historyMiddleware,verifyConfirmationForChangePass)
userRouter.post('/createtask',midlleware.none(),Userauthentication('Please login before creating task'),historyMiddleware,createTask)
userRouter.get('/allusertasks',midlleware.none(),Userauthentication('Please login before getting user tasks'),historyMiddleware,showAllUserTask)
userRouter.patch('/updatetaskstatus',midlleware.none(),Userauthentication('Please login to update task status'),historyMiddleware,updateTaskStatus)
userRouter.post('/logout',midlleware.none(),Userauthentication('Logout failed'),historyMiddleware,logOut)
userRouter.get('/getuserhistory',midlleware.none(),Userauthentication('please login before getting history'),getUserHistory)
export default userRouter;