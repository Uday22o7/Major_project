const mongoose = require('mongoose');
const { User } = require('./models/user');
require('dotenv').config();

async function verifyAllUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find all users
        const allUsers = await User.find({});
        console.log(`📊 Found ${allUsers.length} total users in database`);

        // Count unverified users
        const unverifiedUsers = await User.find({ isVerified: false });
        console.log(`❌ Found ${unverifiedUsers.length} unverified users`);

        if (unverifiedUsers.length > 0) {
            console.log('\n🔍 Unverified users:');
            unverifiedUsers.forEach(user => {
                console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
            });

            // Update all users to verified
            const result = await User.updateMany(
                { isVerified: false },
                { $set: { isVerified: true } }
            );
            
            console.log(`\n✅ Successfully verified ${result.modifiedCount} users`);
        } else {
            console.log('✅ All users are already verified');
        }

        // Verify the update
        const verifiedCount = await User.countDocuments({ isVerified: true });
        const unverifiedCount = await User.countDocuments({ isVerified: false });
        
        console.log('\n📈 Final Status:');
        console.log(`✅ Verified users: ${verifiedCount}`);
        console.log(`❌ Unverified users: ${unverifiedCount}`);

        // List all users for confirmation
        console.log('\n👥 All users in database:');
        const allUsersAfter = await User.find({}, 'firstName lastName email isVerified createdAt');
        allUsersAfter.forEach((user, index) => {
            const date = new Date(user.createdAt).toLocaleDateString();
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.isVerified ? '✅ Verified' : '❌ Not Verified'} - Registered: ${date}`);
        });

        console.log('\n🎉 All users can now login successfully!');

    } catch (error) {
        console.error('❌ Error verifying users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
verifyAllUsers();







