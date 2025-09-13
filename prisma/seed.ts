import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.userProfile.count();
  if (userCount > 0) {
    console.log(`Database already seeded with ${userCount} users. Exiting...`);
    return;
  }

  console.log('Seeding database with initial data...');
  for (let count = 1; count <= 10; count++) {
    try {
      await prisma.userProfile.upsert({
        where: { email: `user${count}@example.com` },
        update: {},
        create: {
          email: `user${count}@example.com`,
          hashedPassword: `hashedpassword${count}`,
          name: `User ${count}`,
        },
      });
      console.log(`Added user with email: user${count}@example.com`);
    } catch (error) {
      console.error(`Error adding user${count}:`, error);
    }
  }

  console.log('Seeding completed.');
  const totalUsers = await prisma.userProfile.count();
  console.log(`Total users in database: ${totalUsers}`);
}

try {
  await main();
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
  console.log('Disconnected from database.');
  process.exit(1);
}
