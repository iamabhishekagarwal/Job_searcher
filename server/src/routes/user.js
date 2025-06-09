import { Router } from "express";
import { userSchema } from "../helper/userSchema.js";
import insertUser from "../helper/insertUser.js";
import { verifyUser } from "../helper/verifyUser.js";
import { generateToken } from "../helper/jwt.js";
import { authenticate } from "../middlewares/authenticate.js";
import { prisma } from "../helper/pooler.js";
const router = Router();


router.post("/signup" , async(req,res)=>{
    const {fname , lname ,email,password} = req.body;
    const inputValidation = userSchema.safeParse({
        firstName:fname,
        lastName:lname,
        email:email,
        password:password
    })
    if(!inputValidation.success)
    {
        return res.status(400).json({msg:"Please enter valid email or password(min:8)"});
    }
    try{
        const userExists = await verifyUser(email,password);
        if(userExists){
            const token = generateToken({userId:userExists.id,email:userExists.email});
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.json({"msg":"User already exists"})
        }
        const createUser = await insertUser(fname,lname,email,password)
        return res.status(200).json({"user":createUser})
        
    }
    catch{
        return res.status(500).json({"msg":"Error during signup"});
    }
})

router.post("/signin",async(req,res)=>{
    const {email , password} = req.body;
    const inputValidation = userSchema.safeParse({
        email,
        password
    })
    if(!inputValidation.success) 
    {
        return res.status(400).json({"msg":"Please enter valid email or password(min:8)"})
    }
    try{
        const userExists = await verifyUser(email,password)
        if(userExists)
        {
            const token = generateToken({userId:userExists.id,email:userExists.email});
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });


            return res.status(200).json({"User":userExists})
        }
        return res.json({"msg":"User does not exist"})
    }
    catch(e)
    {
        console.error(e)
        return res.json({"msg":"Error in signing in"});
    }
})

router.get("/me" , authenticate , async(req,res)=>{
    try{
        const userId = req.user.id;
        const user = await prisma.user.findFirst({
            where:{
                id:userId,
            },
            select:{
                id:true,
                email:true,
                firstName:true,
                lastName:true,
                isAdmin:true
            }
        })
        res.json({"user":user});
    }
    catch(e)
    {
        res.send("Error in authenticating");
    }
})

export default router