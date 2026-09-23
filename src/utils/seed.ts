import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Post } from '../models/Post.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@mail.com' });
    if (existingAdmin) {
      console.log('ℹ️ Database already seeded.');
      return;
    }

    console.log('🌱 Seeding initial demo data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);

    // 1. Create Demo Admin (email: admin@mail.com, password: password)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@mail.com',
      password: passwordHash,
      role: 'admin',
      interests: ['technology', 'chess', 'reading'],
    });

    // 2. Create Demo Standard Users
    const user1 = await User.create({
      name: 'Jane Doe',
      email: 'user@mail.com',
      password: passwordHash,
      role: 'user',
      interests: ['chess', 'music', 'gaming'],
    });

    const user2 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@mail.com',
      password: passwordHash,
      role: 'user',
      interests: ['reading', 'chess', 'travel'],
    });

    // 3. Create Sample Notes
    await Note.create([
      {
        title: 'Project Roadmap Q4',
        content: 'Review the sprint deliverables and prepare the architecture presentation.',
        userId: admin._id,
      },
      {
        title: 'Interview Preparation Notes',
        content: 'Focus on MongoDB aggregation pipelines ($unwind, $group, $lookup) and explicit schema.index.',
        userId: user1._id,
      },
      {
        title: 'Book Recommendations',
        content: 'Clean Code, Designing Data-Intensive Applications, and Refactoring.',
        userId: user1._id,
      },
      {
        title: 'Travel Checklist',
        content: 'Passport, tickets, chargers, and hotel reservations.',
        userId: user2._id,
      },
    ]);

    // 4. Create Sample Posts (for Scenario 2 $lookup testing)
    await Post.create([
      {
        title: 'Mastering MongoDB Compound Indexes',
        content: 'Compound indexes with equality on filter and range/sort eliminate in-memory sorting.',
        userId: admin._id,
      },
      {
        title: 'Secure Authentication with JWT and RBAC',
        content: 'Role-based access control enforces least-privilege security at the middleware layer.',
        userId: admin._id,
      },
      {
        title: 'Why I Love Playing Chess',
        content: 'Strategy and deep calculation in chess translate surprisingly well to software engineering.',
        userId: user1._id,
      },
    ]);

    console.log('✅ Demo data seeded successfully:');
    console.log('   Admin: admin@mail.com / password');
    console.log('   User:  user@mail.com  / password');
    console.log('   User:  alex@mail.com  / password');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
};
