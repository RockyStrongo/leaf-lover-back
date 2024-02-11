import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies;
    const { token } = cookies;

    // 1 - token should be in cookies
    if (!token) {
        return res.status(401).json("Not Authorized");
    }

    // 2 - token should be valid
    const jwtSecret = process.env.JWT_SECRET ?? ""
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, jwtSecret);
        // Call next to pass control to the next middleware or route handler
        return next();
    } catch (err) {
        return res.status(401).json("Not Authorized");
    }

}

export default authMiddleware