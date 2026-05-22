const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // Create users
  const tejsvi = await prisma.user.create({
    data: { name: 'Tejsvi Bhat', email: 'tejsvi@test.com', passwordHash: hash }
  });
  const priya = await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'priya@test.com', passwordHash: hash }
  });
  const rahul = await prisma.user.create({
    data: { name: 'Rahul Menon', email: 'rahul@test.com', passwordHash: hash }
  });
  const ananya = await prisma.user.create({
    data: { name: 'Ananya Iyer', email: 'ananya@test.com', passwordHash: hash }
  });

  // Project 1: E-commerce Redesign
  const ecommerce = await prisma.project.create({
    data: {
      name: 'E-commerce Redesign',
      description: 'Complete UI overhaul for the online store with new checkout flow',
      createdBy: tejsvi.id,
      members: {
        create: [
          { userId: tejsvi.id, role: 'ADMIN' },
          { userId: priya.id, role: 'MEMBER' },
          { userId: rahul.id, role: 'MEMBER' },
        ]
      }
    }
  });

  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 86400000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

  await prisma.task.createMany({
    data: [
      { title: 'Design new product card component', description: 'Create a responsive card with image, price, and quick-add button', dueDate: daysAgo(2), priority: 'HIGH', status: 'DONE', projectId: ecommerce.id, assigneeId: priya.id, createdBy: tejsvi.id },
      { title: 'Implement cart sidebar', description: 'Slide-out cart panel with quantity controls and subtotal', dueDate: daysAgo(1), priority: 'HIGH', status: 'IN_PROGRESS', projectId: ecommerce.id, assigneeId: rahul.id, createdBy: tejsvi.id },
      { title: 'Set up Stripe payment integration', description: 'Connect Stripe checkout session API for card payments', dueDate: daysFromNow(3), priority: 'HIGH', status: 'TODO', projectId: ecommerce.id, assigneeId: tejsvi.id, createdBy: tejsvi.id },
      { title: 'Add product search with filters', description: 'Search bar with category, price range, and sort options', dueDate: daysFromNow(5), priority: 'MEDIUM', status: 'TODO', projectId: ecommerce.id, assigneeId: priya.id, createdBy: tejsvi.id },
      { title: 'Write unit tests for checkout flow', description: 'Cover edge cases: empty cart, invalid coupon, network errors', dueDate: daysFromNow(7), priority: 'MEDIUM', status: 'TODO', projectId: ecommerce.id, assigneeId: rahul.id, createdBy: tejsvi.id },
      { title: 'Setup order confirmation emails', description: 'Transactional email with order summary using SendGrid', dueDate: daysFromNow(4), priority: 'LOW', status: 'TODO', projectId: ecommerce.id, assigneeId: null, createdBy: tejsvi.id },
      { title: 'Create wireframes for homepage', description: 'Low-fi wireframes for hero section, featured products, and footer', dueDate: daysAgo(5), priority: 'MEDIUM', status: 'DONE', projectId: ecommerce.id, assigneeId: priya.id, createdBy: tejsvi.id },
      { title: 'Optimize images for lazy loading', description: 'Add srcset and lazy loading to all product images', dueDate: daysAgo(1), priority: 'LOW', status: 'IN_PROGRESS', projectId: ecommerce.id, assigneeId: priya.id, createdBy: tejsvi.id },
    ]
  });

  // Project 2: Mobile Fitness App
  const fitness = await prisma.project.create({
    data: {
      name: 'Mobile Fitness App',
      description: 'Cross-platform fitness tracker with workout logging and progress charts',
      createdBy: priya.id,
      members: {
        create: [
          { userId: priya.id, role: 'ADMIN' },
          { userId: tejsvi.id, role: 'MEMBER' },
          { userId: ananya.id, role: 'MEMBER' },
        ]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Design onboarding screens', description: '3-step onboarding: goals, fitness level, schedule preference', dueDate: daysAgo(3), priority: 'HIGH', status: 'DONE', projectId: fitness.id, assigneeId: ananya.id, createdBy: priya.id },
      { title: 'Build workout timer component', description: 'Countdown timer with pause, resume, and rest intervals', dueDate: daysFromNow(2), priority: 'HIGH', status: 'IN_PROGRESS', projectId: fitness.id, assigneeId: tejsvi.id, createdBy: priya.id },
      { title: 'Integrate HealthKit / Google Fit', description: 'Sync step count and calories with native health APIs', dueDate: daysFromNow(6), priority: 'MEDIUM', status: 'TODO', projectId: fitness.id, assigneeId: tejsvi.id, createdBy: priya.id },
      { title: 'Create exercise database schema', description: 'Models for exercises, muscle groups, and equipment types', dueDate: daysAgo(4), priority: 'HIGH', status: 'DONE', projectId: fitness.id, assigneeId: priya.id, createdBy: priya.id },
      { title: 'Add weekly progress charts', description: 'Bar charts for workout frequency and line charts for weight tracking', dueDate: daysFromNow(4), priority: 'MEDIUM', status: 'TODO', projectId: fitness.id, assigneeId: ananya.id, createdBy: priya.id },
      { title: 'Push notifications for reminders', description: 'Daily workout reminders based on user-set schedule', dueDate: daysFromNow(8), priority: 'LOW', status: 'TODO', projectId: fitness.id, assigneeId: null, createdBy: priya.id },
    ]
  });

  // Project 3: College Event Portal
  const events = await prisma.project.create({
    data: {
      name: 'College Event Portal',
      description: 'Platform for managing college fest registrations, schedules, and announcements',
      createdBy: tejsvi.id,
      members: {
        create: [
          { userId: tejsvi.id, role: 'ADMIN' },
          { userId: ananya.id, role: 'MEMBER' },
          { userId: priya.id, role: 'MEMBER' },
          { userId: rahul.id, role: 'MEMBER' },
        ]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Build event registration form', description: 'Form with name, email, college, and event selection', dueDate: daysAgo(1), priority: 'HIGH', status: 'DONE', projectId: events.id, assigneeId: ananya.id, createdBy: tejsvi.id },
      { title: 'Create event schedule page', description: 'Day-wise timeline view with venue and speaker info', dueDate: daysFromNow(1), priority: 'HIGH', status: 'IN_PROGRESS', projectId: events.id, assigneeId: rahul.id, createdBy: tejsvi.id },
      { title: 'Add QR code for entry passes', description: 'Generate unique QR codes after registration, scannable at entry', dueDate: daysFromNow(3), priority: 'MEDIUM', status: 'TODO', projectId: events.id, assigneeId: priya.id, createdBy: tejsvi.id },
      { title: 'Set up announcement notifications', description: 'Admin can post announcements visible on dashboard and via email', dueDate: daysFromNow(5), priority: 'LOW', status: 'TODO', projectId: events.id, assigneeId: null, createdBy: tejsvi.id },
      { title: 'Design sponsor showcase section', description: 'Logo grid with tier-based sizing for gold, silver, bronze sponsors', dueDate: daysAgo(3), priority: 'LOW', status: 'DONE', projectId: events.id, assigneeId: priya.id, createdBy: tejsvi.id },
    ]
  });

  console.log('Seed complete!');
  console.log('');
  console.log('You can log in with any of these accounts (password: password123):');
  console.log('  tejsvi@test.com  - Admin on E-commerce & Event Portal, Member on Fitness');
  console.log('  priya@test.com   - Admin on Fitness, Member on E-commerce & Event Portal');
  console.log('  rahul@test.com   - Member on E-commerce & Event Portal');
  console.log('  ananya@test.com  - Member on Fitness & Event Portal');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
