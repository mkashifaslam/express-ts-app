import { createId, isCuid } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import { createPopulatedUserProfile } from './user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from './user-profile-model.js';

async function setup(numberOfProfiles = 1) {
  const app = buildApp();

  const profiles = await Promise.all(
    Array.from({ length: numberOfProfiles }).map(() =>
      saveUserProfileToDatabase(createPopulatedUserProfile()),
    ),
  );

  onTestFinished(async () => {
    try {
      await Promise.all(
        profiles.map(profile => deleteUserProfileFromDatabaseById(profile.id)),
      );
    } catch {
      // The test failed so there was nothing to clean up.
    }
  });

  return {
    app,
    profiles: profiles.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    ),
  };
}

describe('/api/v1/user-profiles', () => {
  describe('/', () => {
    describe('POST', () => {
      test('given: valid user profile data, should: return a 201 with the created profile', async () => {
        const { app } = await setup(0);
        const profileData = createPopulatedUserProfile();

        onTestFinished(async () => {
          try {
            await deleteUserProfileFromDatabaseById(profileData.id);
          } catch {
            // The test failed so there was nothing to clean up.
          }
        });

        const actual = await request(app)
          .post('/api/v1/user-profiles')
          .send(profileData)
          .expect(201);
        const expected = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          createdAt: profileData.createdAt.toISOString(),
          updatedAt: profileData.updatedAt.toISOString(),
          hashedPassword: profileData.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: missing email, should: return a 400 with an error message', async () => {
        const { app } = await setup(0);
        const profileData = { name: 'Test User' };

        const actual = await request(app)
          .post('/api/v1/user-profiles')
          .send(profileData)
          .expect(400);
        const expected = {
          message: 'Bad Request',
          errors: [
            {
              code: 'invalid_type',
              expected: 'string',
              message: 'Required',
              path: ['email'],
              received: 'undefined',
            },
          ],
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: only required fields, should: return a 201 with profile and default values', async () => {
        const { app } = await setup(0);
        const { email } = createPopulatedUserProfile();

        onTestFinished(async () => {
          try {
            await deleteUserProfileFromDatabaseById(actual.body.id);
          } catch {
            // The test failed so there was nothing to clean up.
          }
        });

        const actual = await request(app)
          .post('/api/v1/user-profiles')
          .send({ email })
          .expect(201);
        const expected = {
          id: expect.any(String),
          email,
          name: '',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          hashedPassword: expect.any(String),
        };

        expect(actual.body).toEqual(expected);
        expect(isCuid(actual.body.id)).toEqual(true);
      });

      test('given: profile with given ID already exists, should: return a 409 with an error message', async () => {
        const { app, profiles } = await setup(1);
        const [existingProfile] = profiles as [UserProfile];
        const newProfileData = createPopulatedUserProfile({
          id: existingProfile.id,
        });

        const actual = await request(app)
          .post('/api/v1/user-profiles')
          .send(newProfileData)
          .expect(409);
        const expected = { message: 'Profile already exists' };

        expect(actual.body).toEqual(expected);
      });
    });

    describe.skip('GET', () => {
      test('given: multiple profiles exist, should: return a 200 with paginated profiles', async () => {
        const { app, profiles } = await setup(3);
        const [first, second] = profiles as [UserProfile, UserProfile];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .query({ page: 1, pageSize: 2 })
          .expect(200);
        const expected = [
          {
            id: first.id,
            email: first.email,
            name: first.name,
            createdAt: first.createdAt.toISOString(),
            updatedAt: first.updatedAt.toISOString(),
          },
          {
            id: second.id,
            email: second.email,
            name: second.name,
            createdAt: second.createdAt.toISOString(),
            updatedAt: second.updatedAt.toISOString(),
          },
        ];

        expect(actual.body).toEqual(expected);
        expect(actual.body).toHaveLength(2);
      });

      test('given: query params exist, should: return a 200 with profiles for the requested page', async () => {
        const { app, profiles } = await setup(5);
        const [third, fourth] = profiles.slice(2, 4) as [
          UserProfile,
          UserProfile,
        ];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .query({ page: 2, pageSize: 2 })
          .expect(200);
        const expected = [
          {
            id: third.id,
            email: third.email,
            name: third.name,
            createdAt: third.createdAt.toISOString(),
            updatedAt: third.updatedAt.toISOString(),
            hashedPassword: third.hashedPassword,
          },
          {
            id: fourth.id,
            email: fourth.email,
            name: fourth.name,
            createdAt: fourth.createdAt.toISOString(),
            updatedAt: fourth.updatedAt.toISOString(),
            hashedPassword: fourth.hashedPassword,
          },
        ];

        expect(actual.body).toEqual(expected);
        expect(actual.body).toHaveLength(2);
      });

      test('given: no query params, should: return a 200 with default pagination values', async () => {
        const { app, profiles } = await setup(15);
        const firstTenProfiles = profiles.slice(0, 10);

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .expect(200);
        const expected = firstTenProfiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          hashedPassword: profile.hashedPassword,
        }));

        expect(actual.body).toEqual(expected);
        expect(actual.body).toHaveLength(10);
      });
    });
  });

  describe('/:id', () => {
    describe('GET', () => {
      test('given: profile exists, should: return a 200 with the profile', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .get(`/api/v1/user-profiles/${profile.id}`)
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          hashedPassword: profile.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: profile does not exist, should: return a 404 with error message', async () => {
        const { app } = await setup(0);
        const nonExistentId = createId();
        const actual = await request(app)
          .get(`/api/v1/user-profiles/${nonExistentId}`)
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });
    });

    describe('PATCH', () => {
      test('given: profile exists and valid update data, should: return a 200 with the updated profile', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { name: 'Updated Name' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send(updates)
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: updates.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: actual.body.updatedAt,
          hashedPassword: profile.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: invalid id, should: return a 404 with an error message', async () => {
        const { app } = await setup(0);
        const updates = { name: 'Updated Name' };
        const nonExistentId = createId();

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${nonExistentId}`)
          .send(updates)
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('given: empty update object, should: return a 400 with an error message', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send({})
          .expect(400);
        const expected = { message: 'No valid fields to update' };

        expect(actual.body).toEqual(expected);
      });

      test('given: attempt to update id, should: return a 400 with an error message', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { id: 'new-id' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send(updates)
          .expect(400);
        const expected = {
          message: 'Bad Request',
          errors: [
            {
              code: 'invalid_type',
              expected: 'never',
              message: 'Expected never, received string',
              path: ['id'],
              received: 'string',
            },
          ],
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: missing id in URL, should: return a 404', async () => {
        const { app } = await setup();
        const updates = { name: 'Updated Name' };

        const actual = await request(app)
          .patch('/api/v1/user-profiles/')
          .send(updates);
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });

    describe('DELETE', () => {
      test('given: existing profile, should: return a 200 with the deleted profile', async () => {
        const { app, profiles } = await setup(1);
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${profile.id}`)
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
        };

        expect(actual.body).toEqual(expected);
      });

      test('given: profile does not exist, should: return a 404 with an error message', async () => {
        const { app } = await setup(0);
        const nonExistentId = createId();

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${nonExistentId}`)
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('given: missing id in URL, should: return a 404', async () => {
        const { app } = await setup();

        const actual = await request(app).delete('/api/v1/user-profiles/');
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });
  });
});
