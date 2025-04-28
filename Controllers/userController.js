import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../Models/userModel.js';
import { sendEmail } from '../Utils/sendMail.js';
import encryptPassword from '../Utils/encryption.js';
import { CreateTask } from '../Models/createTasksModel.js';
import { checkUserRole } from '../Utils/checkRole.js';
import { UserHistory } from '../Models/trackHistoryModel.js';
import paginate from '../Utils/pagination.js';


const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password length must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });

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

        const hashedPassword = await encryptPassword(password)

        const confirmationCode = await sendEmail(email, 'Your Verification Code');

        const existsSuperAdmin = await User.findOne({ role: 'superAdmin' });
        const userRole = existsSuperAdmin ? 'user' : 'superAdmin';

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            confirmationCodeFornewAcc: confirmationCode,
            expiresAt,
            isVerified: false
        });

        await newUser.save();

        console.log(`${userRole} created. Verification code sent to ${email}`);
        return res.status(201).json({
            success: true,
            message: `${userRole}  created. Verification code sent to ${email}`,
        });

    } catch (error) {
        console.error('Error in creating user:', error);
        return res.status(500).json({ success: false, message: 'Error in creating user' });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email or password is missing' })
        }
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User did not exists with this email', email);
            return res.status(404).json({ success: false, message: `User did not exists with this email ${email}` })
        }

        if (!user.isVerified) {
            console.log('User is not verified. Plz verify before login.');
            return res.status(401).json({ success: false, message: 'User is not verified. Plz verify before login.' })
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (matchPassword) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_kEY)
            console.log('login successfully', token);
            user.token = token;
            await user.save();
            return res.status(200).json({ success: true, message: 'Login Successfully', token })
        }
        else {
            return res.status(401).json({ success: false, message: 'Invalid password or credentials' })
        }
    }
    catch (error) {
        console.log('error in login user', error);
        return res.status(500).json({ success: false, message: `error in login user ${error}` })
    }

}

const changePassword = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email or new  password is not provided' })
        }
        const user = await User.findOne({ email });
        const expiresAt = Date.now() + 2 * 60 * 1000;
        const hashPassword = await encryptPassword(password);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' })
        }

        if (!user.isVerified) {
            console.log('Please Verify user before updating password');
            return res.status(403).json({ success: false, message: 'Please Verify user before updating password' })

        }

        const confirmationCode = await sendEmail(email, 'Your Verification Code');
        user.confirmationCodeForChangePass = confirmationCode;
        user.expiresAt = expiresAt;
        user.isChangedPassword = true;

        user.tempPasswordHash = hashPassword
        await user.save()

        console.log('To updte password plz verify confirmation code', hashPassword);
        return res.status(200).json({ success: false, message: 'To updte password plz verify confirmation code' })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `error in changing password ${error}` })
    }
}

const createTask = async (req, res) => {
    try {
        const { userId, task, status, description } = req.body;
        if (!task) {
            console.log("Please Provide details to add a new task");
            return res.status(400).json({ success: false, message: 'Please Provide details to add a new task' })
        }
        const user = await User.findById(userId).select('-password');
        if (!user || !user.isVerified) {
            console.log('user', user);

            return res.status(403).json({ success: false, message: 'unauthorized or invalid user' });
        }
        if (user.accIsActive === false) {
            console.log('Account is blocked by Admin or Super-Admin ');
            return res.status(403).json({ success: false, message: 'Account is blocked by Admin or Super-Admin' })
        }
        if (user.role !== 'user') {
            console.log('only user can create a task');
            return res.status(403).json({ success: false, message: 'only user can create a task' })
        }

        const newTask = new CreateTask({
            user: user._id,
            task,
            status,
            description
        });
        await newTask.save();
        console.log('New task added successfully.');
        return res.status(200).json({ success: true, message: 'New task added successfully.' })
    }
    catch (error) {
        console.log('error in Creating Task', error);
        return res.status(500).json({ success: false, message: 'error in Creating Task', error })
    }
}

const showAllUserTask = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            console.log("User Id is required to display tasks");
            return res.status(403).json({ success: false, message: 'User Id is required to display tasks' })
        }

        const checkRole = await checkUserRole(userId);
        console.log(checkRole.role);

        if (checkRole.role !== 'user') {
            return res.status(400).json({ success: false, message: 'plz provide only user id to see task.' })
        }
        const userTasks = await CreateTask.find({ user: userId });

        if (!userTasks) {
            console.log('currently no task exist for this user');
            return res.status(200).json({ success: true, message: 'currently no task exist for this user' })
        }

        console.log('All tasks created by user', userTasks);
        return res.status(200).json({ success: true, message: 'All tasks created by user', userTasks })
    }
    catch (error) {
        console.log('error in dissplaying usser tasks', error);
        return res.status(500).json({ success: false, message: 'error in dissplaying usser tasks', error })
    }
}

const updateTaskStatus = async (req, res) => {
    try {
        const { userId, taskId, updateStatus } = req.body
        if (!taskId || !updateStatus) {
            console.log('plz provide taskId & status to update task status');
            return res.status(403).json({ success: false, message: 'plz provide taskId & status to update task status' })
        }

        const task = await CreateTask.findById(taskId);
        const user = await User.findById(userId);
        if (task.user.toString() !== userId || user.accIsActive === false) {
            console.log('Current user dont have authority to change  the status of task.');
            return res.json({ success: false, message: 'Current user dont have authority to change  the status of task.' })
        }
        task.status = updateStatus;
        await task.save();
        console.log('Task status updated to ', task.status);
        return res.status(200).json({ success: true, message: `Task status updated to ${task.status}` })

    }
    catch (error) {
        console.log('error in updating user task status', error);
        return res.status(500).json({ success: false, message: 'error in updating user task status', error })
    }
}

const logOut = async (req, res) => {
    try {
        const { userId, email } = req.body
        const user = await User.findById(userId)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_kEY)
        user.token = token;
        await user.save();
        console.log(`${user.name} logout successfully.`);
        return res.status(200).json({ success: true, message: `${user.name} logout successfully.` })
    }
    catch (error) {
        console.log('error in loging out', error);
        return res.status(500).json({ success: false, message: 'error in loging out', error })
    }
}

const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const { page, limit } = req.query;
        const userHistory = await paginate(UserHistory,{userId},page,limit);
        console.log('user history ', userHistory.data);
        return res.status(200).json({
            success: true,
            totalItems : userHistory.totalItems,
            currentPage: userHistory.currentPage,
            perPage: userHistory.perPage,
            data: userHistory.data
        })
    }
    catch (error) {
        console.log('errorin getting user History ', error);
        return res.status(500).json({ success: false, message: 'errorin getting user History ', error })
    }
}
export { createUser, loginUser, changePassword, createTask, showAllUserTask, updateTaskStatus, logOut, getUserHistory }