import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from './pooler.js';

dotenv.config();

export default async function insertUser(fname, lname, email, password) {
    if (!fname || !lname || !email || !password) {
        console.error('Missing required fields');
        throw new Error('All fields are required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('Invalid email format');
        throw new Error('Invalid email format');
    }
    if (password.length < 8) {
        console.error('Password too short');
        throw new Error('Password must be at least 8 characters');
    }

    try {
        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await prisma.user.create({
            data: {
                firstName: fname.trim(),
                lastName: lname.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                isAdmin: false 
            },
            select: { 
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isAdmin: true
            }
        });

        return newUser;

    } catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
                throw new Error('Email already exists');
            }
        }
        
        throw new Error('Failed to create user'); 
    }
}