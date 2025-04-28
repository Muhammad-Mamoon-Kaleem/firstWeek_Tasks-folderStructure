
import { User } from "../Models/userModel.js";

export const checkUserRole = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return { role: null };
    return { role: user.role };
};
