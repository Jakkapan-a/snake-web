import {PrismaClient} from '@prisma/client';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";



const prisma = new PrismaClient();

dotenv.config({path: __dirname + '/.env'});
const SECRET = process.env.SECRET || 'secret';

export const join = async (req:any, res:any) => {
    const {username, socketId} = req.body;
    console.log('username', username);

};

export const singIn =async (req:any, res:any)=> {
    const {username, password} = req.body;
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {


        return res.status(404).json({message: 'ไม่พบผู้ใช้งาน'});
    }
    let isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({message: 'รหัสผ่านไม่ถูกต้อง'});
    }

    const _token = jwt.sign({id: user.id}, SECRET);

    await prisma.token.deleteMany({
        where: {
            userId: user.id
        },
    });

    await prisma.token.create({
        data: {
            token: _token,
            userId: user.id
        }
    });
    return res.json({token: _token, user: {
        id: user.id,
        username: user.username
        }
    });
}

export const register = async (req:any, res:any) => {
    let {username, password, confirmPassword} = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({message: 'Password not match'});
    }
    let user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    if (user) {
        return res.status(400).json({message: 'User already exists'});
    }

    const hash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
        data: {
            username: username,
            password: hash
        }
    });
    const token = jwt.sign({id: user.id}, SECRET);
    await prisma.token.deleteMany({
        where: {
            userId: user.id
        }
    });
    await prisma.token.create({
        data: {
            token: token,
            userId: user.id
        }
    });
    return res.json({token: token, user: user});
};

export const checkUsername = async (req:any, res:any) => {
    const {username} = req.params;
    console.log('username', username);
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (user) {
        return res.json({message: 'User already exists',status: true});
    }
    return res.json({message: 'User not found', status: false});
}

export const hasSignedIn = async (req:any, res:any) => {
    const {username} = req.params;
    const user = await prisma.user.findUnique({
        include: {
            tokens: true
        },
        where: {
            username: username
        }
    });

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    if(user.tokens.length === 0){
        return res.status(401).json({message: 'Unauthorized'});
    }

    return res.json({message: 'Authorized'});
}