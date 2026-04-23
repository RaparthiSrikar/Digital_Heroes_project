import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
