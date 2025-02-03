import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';

import type { Factory } from '~/utils/types.js';

export const createPopulatedUserProfile: Factory<UserProfile> = ({
  id = createId(),
  email = faker.internet.email(),
  name = faker.person.fullName(),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  hashedPassword = faker.string.uuid(),
} = {}) => ({ id, email, name, createdAt, updatedAt, hashedPassword });
