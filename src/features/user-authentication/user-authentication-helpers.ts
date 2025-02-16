import type { UserProfile } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * Hash a password.
 *
 * @param password The password to hash.
 * @returns The hashed password.
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hashed password.
 *
 * @param password The password to compare.
 * @param hashedPassword The hashed password to compare against.
 * @returns True if the password is valid, false otherwise.
 */
export async function getIsPasswordValid(
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword);
}

export type TokenPayload = {
  id: string;
  email: string;
};

/**
 * Generate a JWT token. Make sure to define process.env.JWT_SECRET in your
 * environment.
 *
 * @param userProfile The user profile to generate the token for.
 * @returns The generated JWT token.
 */
export function generateJwtToken(userProfile: UserProfile) {
  const tokenPayload: TokenPayload = {
    id: userProfile.id,
    email: userProfile.email,
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60 * 24 * 365, // 1 year
  });
}

export const JWT_COOKIE_NAME = 'jwt';

/**
 * Set the JWT cookie.
 *
 * @param response The response object to set the cookie on.
 * @param token The JWT token to set.
 */
export function setJwtCookie(response: Response, token: string) {
  response.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use secure cookies in production
    sameSite: 'strict',
  });
}

/**
 * Modifies the response to instruct the browser to delete the JWT cookie.
 *
 * @param response The response object to clear the cookie from.
 */
export function clearJwtCookie(response: Response) {
  response.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

/**
 * Check if a token is valid.
 *
 * @param token The token to check.
 * @returns True if the token is valid, false otherwise.
 */
const isTokenValid = (
  token: jwt.JwtPayload | string,
): token is TokenPayload => {
  if (
    typeof token === 'object' &&
    token !== null &&
    'id' in token &&
    'email' in token
  ) {
    return true;
  }

  return false;
};

/**
 * Get the JWT token from the cookie.
 *
 * @param request The request object to get the cookie from.
 * @returns The JWT token from the cookie.
 */
export function getJwtTokenFromCookie(request: Request) {
  const token = request.cookies[JWT_COOKIE_NAME];

  if (!token) {
    throw new Error('No token found');
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

  if (isTokenValid(decodedToken)) {
    return decodedToken;
  }

  throw new Error('Invalid token payload');
}
