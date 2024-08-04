import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const hashString = async (userValue) => {
    const salt = await bcrypt.genSalt(12);


    const hashedPassword = await bcrypt.hash(userValue, salt);
    return hashedPassword;
};

export const compareString = async (userPassword, password) => {
    try {

        const res = await bcrypt.compare(userPassword, password);
        console.log(userPassword);
        console.log(password);
        console.log(res);
        return res;
    } catch (error) {
        console.log(error);
    }
};


export const createJWT = (id) => {
    return jwt.sign({
        userId: id
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "5s"
    });
};
export const createOtp = () => {
    let otp = "";
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 9);
    }
    return otp;
};