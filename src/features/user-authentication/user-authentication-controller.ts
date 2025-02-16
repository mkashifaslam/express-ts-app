import type { Request, Response } from 'express';
import { z } from 'zod';

import { validateBody } from '~/middleware/validate.js';

import {
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import {
  clearJwtCookie,
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
  setJwtCookie,
} from './user-authentication-helpers.js';

export async function login(request: Request, response: Response) {
  // Validate the request body to contain a valid email and a password of
  // minimum 8 characters.
  const body = await validateBody(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  // Attempt to find the user in the database by email.
  const user = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (user) {
    const isPasswordValid = await getIsPasswordValid(
      body.password,
      user.hashedPassword,
    );

    if (isPasswordValid) {
      // Generate a JWT token, set it in an HTTP-only cookie and return a
      // 200 status and a message.
      const token = generateJwtToken(user);
      setJwtCookie(response, token);
      response.status(200).json({ message: 'Logged in successfully' });
    } else {
      // If the password is invalid, return a 401 status and a message.
      response.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    // If user not found, return an Unauthorized error.
    response.status(401).json({ message: 'Invalid credentials' });
  }
}

export async function register(request: Request, response: Response) {
  // Validate the request body to contain a valid email and a password of
  // minimum 8 characters.
  const body = await validateBody(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  // Check if a user with this email already exists.
  const existingUser = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (existingUser) {
    response.status(409).json({ message: 'User already exists' });
  } else {
    // Hash the password and create the user profile.
    const hashedPassword = await hashPassword(body.password);
    const user = await saveUserProfileToDatabase({
      email: body.email,
      hashedPassword,
    });

    const token = generateJwtToken(user);
    setJwtCookie(response, token);

    response.status(201).json({ message: 'User registered successfully' });
  }
}

export async function logout(request: Request, response: Response) {
  clearJwtCookie(response);

  response.status(200).json({ message: 'Logged out successfully' });
}
