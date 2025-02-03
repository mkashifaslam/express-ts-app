import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';

async function setup() {
  const app = buildApp();

  const userProfile = await saveUserProfileToDatabase(
    createPopulatedUserProfile(),
  );

  onTestFinished(async () => {
    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  return { app, userProfile };
}

describe('/api/v1/login', () => {
  test('given: valid credentiols, should: return a 200 and set a JWT cookie', async () => {
    //
  });
});
