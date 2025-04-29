import express from 'express'
import Userauthentication from '../MiddleWares/userAuthenticationMiddleware.js';
import { addNewAdminorUser, changeUserRole, changeUserstatus, getAlltaskbyAdmin, getAllusers } from '../Controllers/superAdminController.js';
import { verifyConfirmationForNewAccount } from '../MiddleWares/confirmationMiddleware.js';
import { historyMiddleware } from '../MiddleWares/historyTrackMiddleware.js';
const superAdminRouter = express.Router();

superAdminRouter.get('/getallusers',Userauthentication('Please login before getting users data'),historyMiddleware,getAllusers)
superAdminRouter.patch('/changeuserstatus',Userauthentication('Please login before changing user account status'),historyMiddleware,changeUserstatus)
superAdminRouter.patch('/changeuserrole',Userauthentication('Please login before changing user role'),historyMiddleware,changeUserRole)
superAdminRouter.get('/gettaskbyadmin',Userauthentication('plz login before getting data'),historyMiddleware,getAlltaskbyAdmin)
superAdminRouter.post('/createnewaddminoruser',Userauthentication('plz login before'),historyMiddleware,addNewAdminorUser)
superAdminRouter.post('/verifyandcretenewuseroradmin',historyMiddleware,verifyConfirmationForNewAccount)
export default superAdminRouter;
