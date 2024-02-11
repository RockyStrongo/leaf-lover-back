import { Prisma } from '@prisma/client';
import { log } from 'console';
import { NextFunction, Request, Response } from 'express';
import { Result, body, validationResult } from 'express-validator';
import { serialize } from 'cookie'
import bcrypt from 'bcrypt';

import { getUserIdFromAuthCookie } from '../services/getUserIdFromAuthCookie'
import { userInfoCookieOptions } from '../utils/cookieUtils';

import { unwantedDomains } from '../config/blacklist';
import prisma from '../db-connection/prisma';
import { AuthController, invalidMailMsg } from './AuthController';
import { User } from '@prisma/client';

export const UserController = {
    validateUpdate: [
        body('firstName').notEmpty().isString(),
        body('lastName').notEmpty().isString(),
        body('email').notEmpty().isEmail({ host_blacklist: unwantedDomains }),
        body('phone').optional({ values: 'null' }).isMobilePhone('fr-FR', { strictMode: true }),
        (req: Request, res: Response, next: NextFunction) => {
            const result: Result = validationResult(req);
            const errors = result.array();
            if (errors[0] && errors[0].path) {
                return res.status(422).json(`Invalid ${errors[0].path}.`);
            }
            next();
        }
      ],
    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. get cookie user id
            const userId = getUserIdFromAuthCookie(req);
            if (!userId) return res.status(500);
            // verifiy user exist
            const user = await UserController.findUser(userId);
            if (!user) return res.status(500);
            // 2. extract req.body
            const { firstName, lastName, email } = req.body;
            
            // update isVerified if necessary
            let isVerified: boolean = user.isVerified;
            if(isVerified && user.email !== email) {
                isVerified = false;
                AuthController.sendMailVerification(req, res, next);
            };
            
            const newUser = {
                ...user,
                firstName, lastName, email, isVerified
            }
            await UserController.updateUserData(newUser);

            const cookieUserInfo = {
                id: user.id,
                firstName, lastName, email, isVerified
            }
            const userInfoCookie = serialize(
                'userInfo',
                JSON.stringify(cookieUserInfo),
                userInfoCookieOptions
            )
            res.setHeader('Set-Cookie', userInfoCookie);
            return res.status(200).json(req.body);
        } catch (error) {
            console.log('error in user patch');
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    res.status(401).json(
                        {
                            status: 401,
                            message: invalidMailMsg
                        }
                    );
                }
            }
            return res.status(500);
        }
    },
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    },
    async updateUserData(user: {
        id?: number;
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        active?: boolean;
        phone?: string | null;
        isVerified?: boolean;
    }): Promise<void> {
       await prisma.user.update({
            where: { id: user.id },
            data: user
        });
    },
    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const cookieUserId = getUserIdFromAuthCookie(req);
            if (!cookieUserId) return res.status(403);
            const user = await UserController.findUser(cookieUserId);
            if(!user) return res.status(403);
            const password: string = req.body.password;
            if (!password) return res.status(403);
            const hashedPassword = await UserController.hashPassword(password);
            const userChanges = {
                ...user,
                password: hashedPassword
            }
            await UserController.updateUserData(userChanges);
            return res.status(200).json('success');
        } catch (error) {
            return res.status(500);
        }
    },
    async findUser(id: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    }
}