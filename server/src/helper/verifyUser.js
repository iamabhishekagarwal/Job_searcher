import { prisma } from "./pooler.js";
import bcrypt from 'bcrypt'
export async function verifyUser(email,password) {
    try{
        const user = await prisma.user.findFirst({
            where:{
                email:email.toLowerCase()
            }
        })
        if (!user) {
	  return null;
	}
       const isPasswordValid = await bcrypt.compare(password,user.password) 
       if(isPasswordValid){
        return {id:user.id ,firstName : user.firstName , LastName : user.lastName,email:user.email,isAdmin:user.isAdmin}
       }
       else{
        return null}
    }
    catch(e){
        console.error("Error in verifying user");
        return null
    }
}