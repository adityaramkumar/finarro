/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise(resolve => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let password = '';
    process.stdin.on('data', function (char) {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          if (char.charCodeAt(0) >= 32) {
            // Printable characters
            password += char;
            process.stdout.write('*');
          }
          break;
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log('\n🔐 Admin User Creation Tool\n');
    console.log(
      'This will create a super admin user for the admin dashboard.\n'
    );

    // Check if any admin users exist
    const existingAdmins = await db('admin_users').count('id as count').first();

    if (parseInt(existingAdmins.count) > 0) {
      const proceed = await question(
        'Admin users already exist. Do you want to create another one? (y/N): '
      );
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }

    // Collect admin user details
    const username = await question('Username: ');
    if (username.length < 3) {
      console.log('Username must be at least 3 characters long.');
      process.exit(1);
    }

    const email = await question('Email: ');
    if (!email.includes('@')) {
      console.log('Please enter a valid email address.');
      process.exit(1);
    }

    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');

    const password = await questionHidden('Password (min 12 chars): ');
    if (password.length < 12) {
      console.log('\nPassword must be at least 12 characters long.');
      process.exit(1);
    }

    const confirmPassword = await questionHidden('Confirm Password: ');
    if (password !== confirmPassword) {
      console.log('\nPasswords do not match.');
      process.exit(1);
    }

    // Check if username or email already exists
    const existingUser = await db('admin_users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      console.log(
        '\nAn admin user with this username or email already exists.'
      );
      process.exit(1);
    }

    // Hash password
    console.log('\nCreating admin user...');
    const saltRounds = 14;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const [newAdmin] = await db('admin_users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin',
        permissions: {},
      })
      .returning([
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
      ]);

    console.log('\n✅ Admin user created successfully!');
    console.log('\nDetails:');
    console.log(`- ID: ${newAdmin.id}`);
    console.log(`- Username: ${newAdmin.username}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Name: ${newAdmin.first_name} ${newAdmin.last_name}`);
    console.log(`- Role: ${newAdmin.role}`);
    console.log(
      '\n🔗 You can now log in to the admin dashboard at admin.finarro.com'
    );
    console.log(`   Username: ${newAdmin.username}`);
    console.log('   Password: [the password you just entered]');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
createAdminUser();
