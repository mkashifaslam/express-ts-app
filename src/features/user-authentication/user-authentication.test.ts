import { createId } from '@paralleldrive/cuid2';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import { hashPassword } from './user-authentication-helpers.js';

async function setup({ password = 'password' }: { password?: string } = {}) {
  const app = buildApp();

  const userProfile = await saveUserProfileToDatabase(
    createPopulatedUserProfile({
      hashedPassword: await hashPassword(password),
    }),
  );

  onTestFinished(async () => {
    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  return { app, userProfile };
}

describe('/api/v1/login', () => {
  test('given: valid credentials for an existing user, should: return a 200 and set a JWT cookie', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password })
      .expect(200);

    expect(actual.body).toEqual({ message: 'Logged in successfully' });
    // Verify that the HTTP-only cookie has been set. It is typed wrongly as a
    // string by supertest for some reason, even though it is an array.
    const cookies = actual.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('jwt='))).toEqual(true);
  });

  test('given: valid credentials for a non-existing user, should: return a 401', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({ email: 'non-existing@test.com', password: 'password' })
      .expect(401);
    const expected = { message: 'Invalid credentials' };

    expect(actual).toEqual(expected);
  });

  test('given: valid credentials, but wrong password for an existing user, should: return a 401', async () => {
    const { app, userProfile } = await setup();

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password: 'invalid password' })
      .expect(401);

    expect(actual.body).toEqual({ message: 'Invalid credentials' });
  });

  test('given: invalid credentials, should: return a 400', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({})
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
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['password'],
          received: 'undefined',
        },
      ],
    };

    expect(actual).toEqual(expected);
  });
});

describe('/api/v1/register', () => {
  test('given: valid registration data, should: create a user and return a 201', async () => {
    const app = buildApp();
    const email = 'test@example.com';
    const password = 'password123';

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({ email, password })
      .expect(201);

    expect(actual).toEqual({ message: 'User registered successfully' });

    // Verify that the user was created in the database
    const createdUser = await retrieveUserProfileFromDatabaseByEmail(email);
    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toEqual(email);

    // Clean up
    if (createdUser) {
      await deleteUserProfileFromDatabaseById(createdUser.id);
    }
  });

  test('given: an email that already exists, should: return a 409', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({ email: userProfile.email, password: 'newpassword123' })
      .expect(409);

    expect(actual).toEqual({ message: 'User already exists' });
  });

  test('given: invalid registration data, should: return a 400', async () => {
    const app = buildApp();

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({})
      .expect(400);

    expect(actual).toEqual({
      message: 'Bad Request',
      errors: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['email'],
          received: 'undefined',
        },
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['password'],
          received: 'undefined',
        },
      ],
    });
  });
});

describe('/api/v1/logout', () => {
  test('given: a valid JWT cookie, should: clear the JWT cookie and return a 200', async () => {
    const { app } = await setup();

    const response = await request(app).post('/api/v1/logout').expect(200);

    expect(response.body).toEqual({ message: 'Logged out successfully' });

    // Verify that the cookie is cleared
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies).toEqual([
      'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
    ]);
  });
});
