import { CookieSerializeOptions } from 'cookie';

export const userInfoCookieOptions: CookieSerializeOptions = {
    httpOnly: false,
    secure: process.env.COOKIE_DOMAIN === 'localhost' ? false : true,
    sameSite: process.env.COOKIE_DOMAIN === 'localhost' ? 'lax' : 'strict',
    domain:
      process.env.COOKIE_DOMAIN === 'localhost'
        ? undefined
        : process.env.COOKIE_DOMAIN,
    maxAge: 3600,
    path: '/',
};