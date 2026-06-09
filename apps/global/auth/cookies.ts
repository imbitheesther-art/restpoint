import { Response, Request } from 'express';

export const getSecureCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
});

export const getPublicCookieOptions = () => ({
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('accessToken', token, {
    ...getSecureCookieOptions(),
    maxAge: 15 * 60 * 1000,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string, opts?: object): void => {
  res.cookie('refreshToken', token, {
    ...getSecureCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...opts,
  });
};

export const setCsrfSecretCookie = (res: Response, secret: string, opts?: object): void => {
  res.cookie('csrfSecret', secret, {
    ...getPublicCookieOptions(),
    ...opts,
  });
};

export const setUserInfoCookie = (res: Response, info: any): void => {
  res.cookie('userInfo', JSON.stringify(info), {
    ...getPublicCookieOptions(),
    maxAge: 15 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('csrfSecret');
  res.clearCookie('userInfo');
};

export const getUserFromCookies = (req: Request): any => {
  try {
    const userInfo = req.cookies?.userInfo;
    return userInfo ? JSON.parse(userInfo) : null;
  } catch {
    return null;
  }
};

export const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return req.cookies?.accessToken || null;
};

module.exports = {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setCsrfSecretCookie,
  setUserInfoCookie,
  clearAuthCookies,
  getUserFromCookies,
  getTokenFromRequest,
  getSecureCookieOptions,
  getPublicCookieOptions,
};
