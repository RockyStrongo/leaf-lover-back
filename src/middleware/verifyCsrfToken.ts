import jwt from 'jsonwebtoken'

import { Request, Response, NextFunction } from 'express'

function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  try {
    const expectedToken = req.session.csrf
    const actualToken = req.headers['x-csrf-token']

    if (!expectedToken || !actualToken || expectedToken !== actualToken) {
      console.log('missing or incorrect csrf token')
      return res.status(401).json('Not Authorized')
    }

    return next()
  } catch (err) {
    return res.status(401).json('Not Authorized')
  }
}

export default verifyCsrfToken
