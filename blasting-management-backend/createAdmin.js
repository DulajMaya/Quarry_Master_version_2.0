require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Role, sequelize } = require('./models');

async function createAdmin() {
  try {
    await sequelize.sync();

    // Check if the Admin role exists, create if not
    let adminRole = await Role.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'Admin' });
    }

     // Check if an admin user already exists
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role_id: adminRole.id
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } 
    catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
} 

createAdmin();
