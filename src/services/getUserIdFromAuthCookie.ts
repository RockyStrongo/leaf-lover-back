import { Request } from 'express'
import jwt from 'jsonwebtoken'

type AuthToken = {
  id: string
  iat: number
  exp: number
}

export const getUserIdFromAuthCookie = (req: Request) => {
  const cookies = req.cookies
  const { token } = cookies
  const jwtSecret = process.env.JWT_SECRET ?? ''

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, jwtSecret) as AuthToken
    const userId = decoded.id
    //parse userid to number
    return parseInt(userId)
  } catch (err) {
    return null
  }
}
