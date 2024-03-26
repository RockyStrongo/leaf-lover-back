import { randomBytes } from 'crypto'
import { NextFunction, Request, Response } from 'express'

declare module 'express-session' {
    interface SessionData {
      csrf?: string;
    }
  }

const CsrfTokenController = {
  async getCsrfToken(req: Request, res: Response, next: NextFunction) {
    try {
      const csrfToken = randomBytes(36).toString('base64')
      req.session.csrf = csrfToken
      req.session.save()
      return res.status(200).json(csrfToken)
    } catch (error) {
      next(error)
    }
  },
}

export default CsrfTokenController
