const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const config = require('../lib/config');
const logger = require('../lib/logger');

/**
 * Create an admin user
 * Usage: node server/scripts/createAdmin.js <email> <password> <name>
 * Example: node server/scripts/createAdmin.js admin@devconnect.com Admin123! Admin User
 */
async function createAdmin() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error('Usage: node createAdmin.js <email> <password> <name>');
      console.error('Example: node createAdmin.js admin@devconnect.com Admin123! "Admin User"');
      process.exit(1);
    }

    const [email, password, name] = args;

    // Validate email
    if (!email.includes('@')) {
      console.error('Error: Invalid email address');
      process.exit(1);
    }

    // Validate password
    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters long');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      if (existingAdmin.role === 'ADMIN') {
        console.log('⚠️  Admin user already exists with this email');
        console.log('   To update password, use: UPDATE users SET password = ... WHERE email = ...');
        process.exit(0);
      } else {
        // Update existing user to admin
        const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            role: 'ADMIN',
            subscription: 'COMPANY' // Give admin company subscription too
          }
        });
        console.log('✅ Existing user updated to admin');
        console.log(`   Email: ${email}`);
        console.log(`   Name: ${name}`);
        console.log(`   Role: ADMIN`);
        process.exit(0);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        subscription: 'COMPANY' // Give admin company subscription too
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Subscription: ${admin.subscription}`);
    console.log('\n📝 You can now login with these credentials at /login');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

