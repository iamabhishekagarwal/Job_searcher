import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { prisma } from './pooler.js';
dotenv.config();


export default async function insertUser(fname , lname , email,password) {
    try{
    const saltRounds = parseInt(process.env.saltRounds, 10);
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        
        const newUser = await prisma.user.create({
            data:{
                firstName:fname,
                lastName:lname,
                email:email.toLowerCase(),
                password:hashedPassword
            }
        })
        return {id:newUser.id,firstName:newUser.firstName,LastName:newUser.lastName,email:newUser.email,isAdmin:newUser.isAdmin}
    }
    catch(e){
        console.error("Error in inserting user "+e);
        return null
    }
}