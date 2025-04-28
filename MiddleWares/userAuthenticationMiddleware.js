import jwt from 'jsonwebtoken';
import { User } from '../Models/userModel.js';
import { historyMiddleware } from './historyTrackMiddleware.js';

// const excludedPaths = ['/api/user/createuser', '/api/user/verifyandcreate', '/api/user/loginuser',
//     '/api/user/changePassword','/api/user/verifyandchangepassword','superadmin/verifyandcretenewuseroradmin'];

const Userauthentication =  (customMessage) => {
    return async(req, res, next) => {
    try {

        // if (excludedPaths.includes(req.path)) {
        //     return next(); 
        //   }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: customMessage });
        }
        const checkToken = authHeader.split(' ')[1];
        
        const decoded_token = jwt.verify(checkToken, process.env.JWT_SECRET_KEY);

        const user = await User.findById(decoded_token.id);

        if(!user || user.token !== checkToken){
            console.log('expire token. plz login again.');
            return res.status(401).json({success:false,message:'expire token. plz login again.'});
        }
        req.body.userId=decoded_token.id
        // req.userId=decoded_token.id
    //    req.user=user;
        // req.Id = user._id;
       
        next();
    } 
    catch (error) {
        console.log("Error at User authentication:", error);
        return res.status(500).json({ success: false, message: "Authentication failed", error: error.message });
    }
}
}

export default Userauthentication;
