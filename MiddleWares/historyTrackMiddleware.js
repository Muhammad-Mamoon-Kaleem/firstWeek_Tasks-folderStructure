import { UserHistory } from "../Models/trackHistoryModel.js";
import { User } from "../Models/userModel.js";

export const historyMiddleware = async (req, res,next) => {
    try {
        let { userId, email } = req.body

        // if(!userId || !email){
        //     return res.json({success:false,message:'Plz provide valid userId or email.'})
        // }

        if (!userId && email) {
            const user =await User.findOne({ email });
            if (!user) {
                console.log('Please give the valid email adress.');
                return res.status(403).json({ success: false, message: 'Please give the valid email adress.' })
            }
            userId = user._id;
        }

        const createHistory = new UserHistory({
            userId: userId,
            path: req.originalUrl,
            method: req.method,
        })
        await createHistory.save();
        next();
    }

    catch (error) {
        console.log('error in creating user history.',error);
        return res.status(500).json({success:false,message:'error in creating user history.',error})
    }
}