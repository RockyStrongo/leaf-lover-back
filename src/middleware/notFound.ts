import { Request, Response, NextFunction } from 'express';

function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404);

    // respond with json
    if (req.accepts('json')) {
        res.json({ error: 'Not found' });
        return;
    }
};

export default notFound