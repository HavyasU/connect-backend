import Users from "../models/userModel.js";

export const updateStatus = async (userID, status) => {
    try {
        const saveStatus = await Users.findByIdAndUpdate(userID, {
            chatStatus: status
        });
    } catch (error) {
        console.log("error in chatStatus saving..." + error);
    }
};