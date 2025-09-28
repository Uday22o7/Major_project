const mongoose = require('mongoose');
const { User } = require('./models/user');
require('dotenv').config();

async function fixAllUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // First, let's see what users exist
        const allUsers = await User.find({});
        console.log(`📊 Found ${allUsers.length} total users in database`);

        if (allUsers.length > 0) {
            console.log('\n👥 Current users:');
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Verified: ${user.isVerified}`);
            });

            // Update ALL users to be verified, regardless of current status
            const result = await User.updateMany(
                {}, // Empty filter means all users
                { $set: { isVerified: true } }
            );

            console.log(`\n✅ Updated ${result.modifiedCount} users to be verified`);
        } else {
            console.log('📝 No users found in database');
        }

        // Verify the update
        const verifiedCount = await User.countDocuments({ isVerified: true });
        const unverifiedCount = await User.countDocuments({ isVerified: false });

        console.log('\n📈 Final Status:');
        console.log(`✅ Verified users: ${verifiedCount}`);
        console.log(`❌ Unverified users: ${unverifiedCount}`);

        // Show all users after update
        const allUsersAfter = await User.find({}, 'firstName lastName email isVerified createdAt');
        if (allUsersAfter.length > 0) {
            console.log('\n👥 All users after update:');
            allUsersAfter.forEach((user, index) => {
                const date = new Date(user.createdAt).toLocaleDateString();
                console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.isVerified ? '✅ Verified' : '❌ Not Verified'} - Registered: ${date}`);
            });
        }

        console.log('\n🎉 All users are now verified and can login!');

    } catch (error) {
        console.error('❌ Error fixing users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
fixAllUsers();







