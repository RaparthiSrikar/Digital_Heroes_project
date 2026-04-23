import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const charities = [
    { name: 'Global Water Initiative', description: 'Providing clean water to communities in need.' },
    { name: 'Code for the Future', description: 'Teaching underprivileged youth how to code.' },
    { name: 'Wildlife Defenders', description: 'Protecting endangered species and habitats.' },
    { name: 'Health Without Borders', description: 'Medical aid and supplies globally.' },
    { name: 'Green Earth Foundation', description: 'Combating climate change through reforestation.' },
  ];

  console.log('Seeding charities...');
  
  for (const charity of charities) {
    await prisma.charity.create({
      data: charity
    });
  }

  console.log('Charities seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
