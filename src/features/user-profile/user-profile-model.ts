import type { Prisma, UserProfile } from '@prisma/client';

import { prisma } from '~/database.js';

/* CREATE */

/**
 * Saves a user profile to the database.
 *
 * @param userProfile The user profile to save.
 * @returns The saved user profile.
 */
export async function saveUserProfileToDatabase(
  userProfile: Prisma.UserProfileCreateInput,
) {
  return prisma.userProfile.create({ data: userProfile });
}

/* READ */

/**
 * Retrieves a user profile by its id.
 *
 * @param id The id of the user profile.
 * @returns The user profile or null.
 */
export async function retrieveUserProfileFromDatabaseById(
  id: UserProfile['id'],
) {
  return prisma.userProfile.findUnique({ where: { id } });
}

/**
 * Retrieves a user profile by its email.
 *
 * @param email The email of the user profile.
 * @returns The user profile or null.
 */
export async function retrieveUserProfileFromDatabaseByEmail(
  email: UserProfile['email'],
) {
  return prisma.userProfile.findUnique({ where: { email } });
}

/**
 * Retrieves many user profiles.
 *
 * @param page The page number (starting at 1).
 * @param pageSize The number of profiles per page.
 * @returns A list of user profiles.
 */
export async function retrieveManyUserProfilesFromDatabase({
  page = 0,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  return prisma.userProfile.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

/* UPDATE */

/**
 * Updates a user profile by its id.
 *
 * @param id The id of the user profile.
 * @param data The new data for the profile.
 * @returns The updated user profile.
 */
export async function updateUserProfileInDatabaseById({
  id,
  data,
}: {
  id: UserProfile['id'];
  data: Prisma.UserProfileUpdateInput;
}) {
  return prisma.userProfile.update({ where: { id }, data });
}

/* DELETE */

/**
 * Deletes a user profile by its id.
 *
 * @param id The id of the user profile.
 * @returns The deleted user profile.
 */
export async function deleteUserProfileFromDatabaseById(id: UserProfile['id']) {
  return prisma.userProfile.delete({ where: { id } });
}
