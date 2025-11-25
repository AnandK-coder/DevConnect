const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const config = require('../lib/config');
const logger = require('../lib/logger');

/**
 * Create a company/recruiter user
 * Usage: node server/scripts/createCompany.js <email> <password> <companyName>
 * Example: node server/scripts/createCompany.js company@example.com Company123! "Tech Corp"
 */
async function createCompany() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error('Usage: node createCompany.js <email> <password> <companyName>');
      console.error('Example: node createCompany.js company@example.com Company123! "Tech Corp"');
      process.exit(1);
    }

    const [email, password, companyName] = args;

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

    // Check if company already exists
    const existingCompany = await prisma.user.findUnique({
      where: { email }
    });

    if (existingCompany) {
      if (existingCompany.role === 'COMPANY') {
        console.log('⚠️  Company user already exists with this email');
        process.exit(0);
      } else {
        // Update existing user to company
        const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            role: 'COMPANY',
            subscription: 'COMPANY',
            name: companyName
          }
        });
        console.log('✅ Existing user updated to company');
        console.log(`   Email: ${email}`);
        console.log(`   Company: ${companyName}`);
        console.log(`   Role: COMPANY`);
        process.exit(0);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create company user
    const company = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: companyName,
        role: 'COMPANY',
        subscription: 'COMPANY'
      }
    });

    console.log('✅ Company user created successfully!');
    console.log(`   Email: ${company.email}`);
    console.log(`   Company: ${company.name}`);
    console.log(`   Role: ${company.role}`);
    console.log(`   Subscription: ${company.subscription}`);
    console.log('\n📝 You can now login with these credentials at /login');

  } catch (error) {
    console.error('❌ Error creating company:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCompany();

