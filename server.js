import { configDotenv } from 'dotenv';
import express from 'express'
import connectMongoose from './Configration/mongoose.js';
import alluserRoutes from './Routes/routesIndex.js';
import { historyMiddleware } from './MiddleWares/historyTrackMiddleware.js';
import Userauthentication from './MiddleWares/userAuthenticationMiddleware.js';
import logger from './loggs.js';

configDotenv();
const app = express();
const port = process.env.PORT || 3000;

connectMongoose();
app.use(express.json());
// app.use(Userauthentication('Plz login before.'))
// app.use(historyMiddleware)

app.get('/',(req,res)=>{
    res.json({success:true,message:'Server started..'})
})

//end points
app.use('/api',alluserRoutes);

app.listen(port,()=>logger.info('Server is running on port..',port));
