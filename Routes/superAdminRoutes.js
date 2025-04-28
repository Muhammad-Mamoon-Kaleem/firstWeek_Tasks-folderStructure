import express from 'express'
import multer from 'multer';
import Userauthentication from '../MiddleWares/userAuthenticationMiddleware.js';
import { addNewAdminorUser, changeUserRole, changeUserstatus, getAlltaskbyAdmin, getAllusers } from '../Controllers/superAdminController.js';
import { verifyConfirmationForNewAccount } from '../MiddleWares/confirmationMiddleware.js';
import { historyMiddleware } from '../MiddleWares/historyTrackMiddleware.js';
const superAdminRouter = express.Router();
const midlleware = multer();
superAdminRouter.get('/getallusers',midlleware.none(),Userauthentication('Please login before getting users data'),historyMiddleware,getAllusers)
superAdminRouter.patch('/changeuserstatus',midlleware.none(),Userauthentication('Please login before changing user account status'),historyMiddleware,changeUserstatus)
superAdminRouter.patch('/changeuserrole',midlleware.none(),Userauthentication('Please login before changing user role'),historyMiddleware,changeUserRole)
superAdminRouter.get('/gettaskbyadmin',midlleware.none(),Userauthentication('plz login before getting data'),historyMiddleware,getAlltaskbyAdmin)
superAdminRouter.post('/createnewaddminoruser',midlleware.none(),Userauthentication('plz login before'),historyMiddleware,addNewAdminorUser)
superAdminRouter.post('/verifyandcretenewuseroradmin',midlleware.none(),historyMiddleware,verifyConfirmationForNewAccount)
export default superAdminRouter;