import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import {
  generateJwtToken,
  JWT_COOKIE_NAME,
} from '../user-authentication/user-authentication-helpers.js';
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

  const authenticatedUser = createPopulatedUserProfile();
  await saveUserProfileToDatabase(authenticatedUser);
  const token = generateJwtToken(authenticatedUser);

  return {
    app,
    token,
    profiles: profiles.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    ),
  };
}

describe('/api/v1/user-profiles', () => {
  describe('/', () => {
    describe.skip('GET', () => {
      test('given: an unauthenticated request, should: return a 401', async () => {
        const { app } = await setup();

        const { status: actual } = await request(app).get(
          '/api/v1/user-profiles',
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('given: multiple profiles exist, should: return a 200 with paginated profiles', async () => {
        const { app, profiles, token } = await setup(3);
        const [first, second] = profiles as [UserProfile, UserProfile];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, profiles, token } = await setup(5);
        const [third, fourth] = profiles.slice(2, 4) as [
          UserProfile,
          UserProfile,
        ];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, profiles, token } = await setup(15);
        const firstTenProfiles = profiles.slice(0, 10);

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .get(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, token } = await setup(0);
        const nonExistentId = createId();
        const actual = await request(app)
          .get(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });
    });

    describe('PATCH', () => {
      test('given: an unauthenticated request, should: return a 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];
        const updates = { name: 'Updated Name' };

        const { status: actual } = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send(updates);
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('given: profile exists and valid update data, should: return a 200 with the updated profile', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { name: 'Updated Name' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, token } = await setup(0);
        const updates = { name: 'Updated Name' };
        const nonExistentId = createId();

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('given: empty update object, should: return a 400 with an error message', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send({})
          .expect(400);
        const expected = { message: 'No valid fields to update' };

        expect(actual.body).toEqual(expected);
      });

      test('given: attempt to update id, should: return a 400 with an error message', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { id: 'new-id' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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
        const { app, token } = await setup();
        const updates = { name: 'Updated Name' };

        const actual = await request(app)
          .patch('/api/v1/user-profiles/')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates);
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });

    describe('DELETE', () => {
      test('given: an unauthenticated request, should: return a 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const { status: actual } = await request(app).delete(
          `/api/v1/user-profiles/${profile.id}`,
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('given: existing profile, should: return a 200 with the deleted profile', async () => {
        const { app, profiles, token } = await setup(1);
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
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

      test('given: profile does not exist, should: return a 404 with an error message', async () => {
        const { app, token } = await setup(0);
        const nonExistentId = createId();

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('given: missing id in URL, should: return a 404', async () => {
        const { app, token } = await setup();

        const actual = await request(app)
          .delete('/api/v1/user-profiles/')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`]);
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });
  });
});
