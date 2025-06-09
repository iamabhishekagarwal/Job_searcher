import { verifyToken } from "../helper/jwt.js";

export const authenticate = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token)
    {
        return res.status(401).json({"msg":"Access denied, No Token provided."})
    }
    try{
        const verify = verifyToken(token);
        req.user = verify;
        next();
    }catch(e)
    {
        res.status(403).json({"msg":"Invalid or expired token."});
    }
    
}