const mongoose = require('mongoose');
const { User } = require('./models/user');
require('dotenv').config();

async function testLogin() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check all users
        const allUsers = await User.find({});
        console.log(`📊 Total users in database: ${allUsers.length}`);

        if (allUsers.length > 0) {
            console.log('\n👥 All users:');
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Verified: ${user.isVerified}`);
                console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
                console.log('   ---');
            });

            // Verify all users
            const result = await User.updateMany(
                {},
                { $set: { isVerified: true } }
            );
            console.log(`\n✅ Verified ${result.modifiedCount} users`);

        } else {
            console.log('📝 No users found. You need to register first.');
            console.log('Go to: http://localhost:3000/register');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testLogin();







