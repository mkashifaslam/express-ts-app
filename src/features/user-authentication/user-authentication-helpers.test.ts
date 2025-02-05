import { createId } from '@paralleldrive/cuid2';
import { describe, expect, test } from 'vitest';

import {
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
} from './user-authentication-helpers.js';

describe('generateJwtToken()', () => {
  test('given: a user profile, should: return a JWT token', () => {
    const userProfile = {
      id: 'ozlnvq593weqj51j5p69adul',
      email: 'Jamarcus.Haag44@hotmail.com',
      name: 'Dr. Philip Lindgren',
      createdAt: new Date('2022-09-25T20:03:54.119Z'),
      updatedAt: new Date('2025-01-29T11:25:38.342Z'),
      hashedPassword: 'b6d93ffb-8093-4940-bd1f-c9e8020851e4',
    };

    const actual = generateJwtToken(userProfile);

    expect(actual.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toEqual(
      true,
    );
  });
});

describe('getIsPasswordValid() & hashPassword()', () => {
  test('given: a password, should: return a hashed password', async () => {
    const password = createId();
    const hashedPassword = await hashPassword(password);

    const actual = await getIsPasswordValid(password, hashedPassword);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
