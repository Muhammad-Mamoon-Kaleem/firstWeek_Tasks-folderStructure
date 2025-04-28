import express from 'express';
import userRouter from './userRoutes.js';
import superAdminRouter from './superAdminRoutes.js';

const alluserRoutes = express.Router();

alluserRoutes.use('/user', userRouter);
alluserRoutes.use('/superadmin',superAdminRouter);
export default alluserRoutes;
