import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const hashString = async (userValue) => {
    const salt = await bcrypt.genSalt(12);


    const hashedPassword = await bcrypt.hash(userValue, salt);
    return hashedPassword;
};

export const compareString = async (userPassword, password) => {
    return await bcrypt.compare(userPassword, password);
};


export const createJWT = (id) => {
    return jwt.sign({
        userId: id
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d"
    });
};
export const createOtp = () => {
    let otp = "";
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 9);
    }
    return otp;
};