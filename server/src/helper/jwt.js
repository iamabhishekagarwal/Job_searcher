import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY
if(!SECRET_KEY)
{
    throw new Error("Secret key not defined");
}

export const generateToken = (payload) =>{
    return jwt.sign(payload,SECRET_KEY,{expiresIn:3600});
}

export const verifyToken = (token)=>{
    return jwt.verify(token,SECRET_KEY);
}