import { Request, Response, NextFunction } from 'express';

function errorHandler(err: globalThis.Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);

    // Return a 500 Internal Server Error response
    process.env.NODE_ENV === "production" ? res.status(500).json({ error: "Internal Server Error" }) : res.status(500).json({ error: err.stack })
}

export default errorHandler