import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import {
  validateBody,
  validateParams,
  validateQuery,
} from '~/middleware/validate.js';
import { getErrorMessage } from '~/utils/get-error-message.js';

import {
  deleteUserProfileFromDatabaseById,
  getAllUserProfilesFromDatabase,
  retrieveUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
  updateUserProfileInDatabaseById,
} from './user-profile-model.js';

export async function createUserProfile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = await validateBody(
      z.object({
        id: z.string().cuid2().optional(),
        email: z.string().email(),
        name: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      }),
      request,
      response,
    );

    try {
      const profile = await saveUserProfileToDatabase(body);
      response.status(201).json(profile);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message.includes('Unique constraint failed')) {
        response.status(409).json({ message: 'Profile already exists' });
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function getAllUserProfiles(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const query = await validateQuery(
      z.object({
        page: z.coerce.number().positive().default(1),
        pageSize: z.coerce.number().positive().default(10),
      }),
      request,
      response,
    );

    const profiles = await getAllUserProfilesFromDatabase({
      skip: (query.page! - 1) * query.pageSize!,
      take: query.pageSize!,
    });

    response.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
}

export async function getUserProfileById(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = await validateParams(
      z.object({ id: z.string().cuid2() }),
      request,
      response,
    );
    const profile = await retrieveUserProfileFromDatabaseById(id);

    if (profile) {
      response.status(200).json(profile);
    } else {
      response.status(404).json({ message: 'Not Found' });
    }
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = await validateParams(
      z.object({ id: z.string().cuid2() }),
      request,
      response,
    );

    const body = await validateBody(
      z.object({
        email: z.string().email().optional(),
        name: z.string().optional(),
        id: z.never().optional(),
      }),
      request,
      response,
    );

    // Check if there are any fields to update
    if (Object.keys(body).length === 0) {
      response.status(400).json({ message: 'No valid fields to update' });
      // Check if trying to update id
    } else if ('id' in body) {
      response.status(400).json({ message: 'ID cannot be updated' });
    } else {
      try {
        const updatedProfile = await updateUserProfileInDatabaseById({
          id,
          data: body,
        });
        response.status(200).json(updatedProfile);
      } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes('Record to update not found')) {
          response.status(404).json({ message: 'Not Found' });
        } else if (message.includes('Unique constraint failed')) {
          response.status(409).json({ message: 'Profile already exists' });
        }
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function deleteUserProfile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = await validateParams(
      z.object({ id: z.string().cuid2() }),
      request,
      response,
    );

    try {
      const deletedProfile = await deleteUserProfileFromDatabaseById(id);
      response.status(200).json(deletedProfile);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message.includes('Record to delete does not exist')) {
        response.status(404).json({ message: 'Not Found' });
      }
    }
  } catch (error) {
    next(error);
  }
}
