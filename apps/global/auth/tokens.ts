import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (payload: UserPayload, expiry?: string): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: expiry || ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload: UserPayload, expiry?: string): string => {
  return jwt.sign(payload, config.REFRESH_SECRET, { expiresIn: expiry || REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, config.REFRESH_SECRET) as UserPayload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwt.decode(token) as UserPayload;
  } catch {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
