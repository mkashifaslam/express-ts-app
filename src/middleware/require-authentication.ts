import type { Request, Response } from 'express';

import { getJwtTokenFromCookie } from '~/features/user-authentication/user-authentication-helpers.js';

/**
 * Gets the user's token payload from the JWT token.
 * Throws an error if no valid token exists.
 *
 * @param request The request object to get the token from.
 * @returns The token payload containing the user's ID and email.
 */
export function requireAuthentication(request: Request, response: Response) {
  try {
    return getJwtTokenFromCookie(request);
  } catch {
    throw response.status(401).json({ message: 'Unauthorized' });
  }
}
