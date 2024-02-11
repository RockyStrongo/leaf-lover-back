import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CookieSerializeOptions, serialize } from 'cookie'
import { NextFunction, Request, Response } from 'express';
import { Result, body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

import prisma from "../db-connection/prisma";
import { unwantedDomains } from '../config/blacklist';
import sendingMail from '../services/mailer';
import { userInfoCookieOptions } from '../utils/cookieUtils';
import { getUserIdFromAuthCookie } from '../services/getUserIdFromAuthCookie';
import { verificationMailConf } from '../utils/verificationMail';
import { UserController } from './UserController';

interface JwtPayload {
  id: number
}

const strongPasswordOptions: {
    minLength: number
    minLowercase: number
    minUppercase: number
    minNumbers: number
    minSymbols: number
} = {
    minLength: 10,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
}


const TOKEN_EXPIRATION_DELAY = 3600
// return the same error msg for cases : 
// 1. email has unwanted domain name
// 2. email already exist in database
export const invalidMailMsg: string = 'Invalid email.'
const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

const authCookieOptions: CookieSerializeOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_DOMAIN === 'localhost' ? false : true,
  domain:
    process.env.COOKIE_DOMAIN === 'localhost'
      ? undefined
      : process.env.COOKIE_DOMAIN,
  sameSite: process.env.COOKIE_DOMAIN === 'localhost' ? 'lax' : 'strict',
  maxAge: 3600,
  path: '/',
}

export const AuthController = {
  validatePassword: [
    body('password').notEmpty().isString().isStrongPassword(strongPasswordOptions),
    (req: Request, res: Response, next: NextFunction) => {
        const result: Result = validationResult(req);
        const errors = result.array();
        if (errors[0] && errors[0].path) {
            return res.status(422).json(`Invalid ${errors[0].path}.`);
        }
        next();
    }
  ],
  validateRegister: [
    body('firstName').notEmpty().isString(),
    body('lastName').notEmpty().isString(),
    body('email').notEmpty().isEmail({ host_blacklist: unwantedDomains }),
    body('password').notEmpty().isString().isStrongPassword(strongPasswordOptions),
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
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const inputs: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string | null;
      } = req.body;
      let reformatedPhone: string | null = null;
      if (inputs.phone) reformatedPhone = inputs.phone.replace('+33', '')
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(inputs.password, salt);

      const userWithHashedPassword = { 
        ...inputs,
        password: hashedPassword,
        phone: reformatedPhone 
      };

      const userInBase = await prisma.user.create({ data: userWithHashedPassword });

      const { password, ...userWithoutPassword } = userWithHashedPassword;
      
      // sendMailVerification
      
      const setToken = await prisma.emailValidationToken.create({
          data: {
              token: randomBytes(16).toString("hex"),
              userId: userInBase.id
          }
      })

      if(setToken) {
          await sendingMail(verificationMailConf(userInBase, req, setToken.token))
      } else {
          return res.status(400).send("token not created");
      }

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          res.status(401).json(invalidMailMsg);
        }
      }
      console.log(error);
      res.status(401);
    }
  },
  async sendMailVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserIdFromAuthCookie(req);
      if(!userId) return res.status(403);
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        }
      });
      if (!user || user.isVerified) return res.status(403);
      const setToken = await prisma.emailValidationToken.create({
        data: {
          token: randomBytes(16).toString("hex"),
          userId: user.id
        }
      });
      if(setToken) {
        await sendingMail(verificationMailConf(user, req, setToken.token));
        return res.status(200).send("verification mail sended.");
      }
      return res.status(500).send("An error occured.");
    } catch (error) {
      next('error')
    }
  },
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token: string = req.params.token;

      const validationToken = await prisma.emailValidationToken.findUnique({
        where: { token: token }
      });

      if(!validationToken) {
        return res.status(400).send({
          msg: "Your verification link may have expired."
          +" Please click on resend for verify your Email.",
        });
      } else {
        const userId: number = Number(req.params.id);
        const user = await prisma.user.findFirst({
          where: 
          { id: userId }
        });
        if(!user) { 
          return res.status(401).send({
            msg: "We were unable to find a user for this verification."
            +" Please SignUp!"
          });
        } else if (user.isVerified) { 
          return res.status(200).send("User already verified.");
        } else {
          const updated = await prisma.user.update({ 
            where: { email: user.email },
            data: { isVerified: true },
          });
          const userInfoCookie = serialize(
            'userInfo',
            JSON.stringify(updated),
            userInfoCookieOptions
          );
          res.setHeader('Set-Cookie', userInfoCookie);
          return res.status(200).send("User successfully verified.");
        }
      }
    } catch (error) {
      next(error);
    }
  },
  validateLogin: [
    body('email').notEmpty().isString(),
    body('password').notEmpty().isString(),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }
      next();
    }
  ],
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        }
      });
      //if user does not exist
      if (!user) {
          res.status(401).json('Invalid credentials');
          return;
      }

            const isMatch = await bcrypt.compare(req.body.password, user.password)

      // if password is incorrect
      if (!isMatch) {
          res.status(401).json('Invalid credentials');
      }

      //We create 2 cookies : 
      // 1 - one with the JWT (http only = can't be access by client javascript)
      // 2 - one with user information (that can be used by client javascript)

            const tokenPayload = {
                id: user.id,
            }
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_DELAY })

      const authCookie = serialize('token', token as string, authCookieOptions)

      const userInfo = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      };

      const userInfoCookie = serialize(
        'userInfo',
        JSON.stringify(userInfo),
        userInfoCookieOptions
      )

      res.setHeader('Set-Cookie', [authCookie, userInfoCookie]);

      res.status(200).json({ success: true, user: userInfo });
    } catch (error) {
      next(error)
    }
  },
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      //delete authentication cookies
      res.clearCookie('token', authCookieOptions)
      res.clearCookie('userInfo', userInfoCookieOptions)
      res.status(200).json('Logged out')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
        
        try {
            const { email } = req.body;

            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            });

            if (!user) {
                res.status(401).json('User does not exist');
                return;
            }

            const tokenPayload = {
                id: user.id,
                date: Date.now(),
            };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_DELAY, })

        
            const resetPasswordLink = `${process.env.FRONT_DOMAIN_URL}/resetPassword?token=${token}`;

            await sendingMail({
                from: process.env.EMAIL_USER as string,
                to: email,
                subject: "Reset your password",
                text: `Hello ${user.firstName} ${user.lastName},\n
                Please click on the link below to reset your password :\n
                ${resetPasswordLink}\n
                If you did not request a password reset, please ignore this email.\n
                Best regards,\n
                The Leaf Lover team`
            });
            res.status(200).json("Email sent");
        } catch (error) {
            console.log(error)
            next(error)
        }
  },
  validateResetPassword: [
    body('token').notEmpty().isString(),
    body('password')
    .notEmpty()
    .isString()
    .isStrongPassword(strongPasswordOptions),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
      }
      next()
    },
  ],
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { token, password} = req.body;

        const decodedToken = jwt.verify(token, JWT_SECRET) as { id: number, date: number };
        
        const hashedPassword = await UserController.hashPassword(password);
        const userChanges = { id: decodedToken.id, password: hashedPassword };
        
        await UserController.updateUserData(userChanges);

        res.status(200).json("Password updated");
    } catch (error) {
        res.status(401).json("Something went wrong");
        next(error)
    }
  }
}
