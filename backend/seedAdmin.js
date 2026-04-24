/**
 * Admin user seeding script for the Personal Gift application
 * Creates a default admin user if one doesn't already exist
 * This runs automatically when the server starts
 */

import User from './models/User.js';
import bcryptjs from 'bcryptjs';

/**
 * Seeds the database with a default admin user
 * Only creates the admin if it doesn't already exist
 * Admin credentials: admin@gmail.com / admin@123
 */
export const seedAdmin = async () => {
  try {
    // Define admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@123';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      // Hash the admin password for security
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(adminPassword, salt);

      // Create new admin user
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
        role: 'admin', // Admin role for full system access
        profileComplete: true // Admin profile is considered complete
      });

      // Save admin user to database
      await admin.save();
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};
