import { db } from './src/lib/db';

async function main() {
  console.log('Seeding database...');

  // Create a default user if it doesn't exist
  const defaultUser = await db.user.upsert({
    where: { email: 'default@example.com' },
    update: {},
    create: {
      email: 'default@example.com',
      name: 'Default User',
    },
  });

  console.log('Default user created:', defaultUser);

  // Create some sample tasks
  const sampleTasks = [
    {
      title: 'Complete project proposal',
      description: 'Finish the quarterly project proposal for the client',
      priority: 'HIGH' as const,
      userId: defaultUser.id,
    },
    {
      title: 'Review team feedback',
      description: 'Go through all team member feedback from last sprint',
      priority: 'MEDIUM' as const,
      userId: defaultUser.id,
    },
    {
      title: 'Update documentation',
      description: 'Update the API documentation with new endpoints',
      priority: 'LOW' as const,
      userId: defaultUser.id,
    },
  ];

  for (const task of sampleTasks) {
    await db.task.create({
      data: task,
    });
  }

  // Create some sample notes
  const sampleNotes = [
    {
      title: 'Meeting Notes',
      content: 'Discussed new project requirements with the team. Everyone is excited about the new features.',
      tags: 'meeting,project,team',
      userId: defaultUser.id,
    },
    {
      title: 'Ideas for Improvement',
      content: 'Consider implementing a dark mode toggle and adding more keyboard shortcuts for better accessibility.',
      tags: 'ideas,ui,accessibility',
      userId: defaultUser.id,
    },
  ];

  for (const note of sampleNotes) {
    await db.note.create({
      data: note,
    });
  }

  // Create some sample focus sessions
  const sampleSessions = [
    {
      duration: 25,
      type: 'FOCUS' as const,
      userId: defaultUser.id,
    },
    {
      duration: 5,
      type: 'BREAK' as const,
      userId: defaultUser.id,
    },
    {
      duration: 30,
      type: 'FOCUS' as const,
      userId: defaultUser.id,
    },
  ];

  for (const session of sampleSessions) {
    await db.focusSession.create({
      data: session,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });