import {z} from 'zod'
export const userSchema = z.object(
    {
        fname:z.string().optional(),
        lname:z.string().optional(),
        email:z.string().email(),
        password:z.string().min(8),
        role:z.enum(["Employee" , "Company"]).optional()
    }
)