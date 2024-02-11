import { Request } from "express";
import { User } from "@prisma/client";

export const verificationMailConf = (user: User, req: Request, token: string)  => (
    {
        from: `${process.env.EMAIL_SERVICE}`,
        to: `${user.email}`,
        subject: "Account Verification Link",
        text: `Hello, ${user.firstName} ${user.lastName} Please verify your email by
            clicking this link : 
            ${req.protocol}://${req.get('host')}/api/${process.env.API_VERSION}/users/verify-email/${user.id.toString()}/${token} `,
    }
);
