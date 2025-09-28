const mongoose = require('mongoose');
const { User } = require('./models/user');
require('dotenv').config();

async function fixUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system');
        console.log('Connected to MongoDB');

        // Find all unverified users
        const unverifiedUsers = await User.find({ isVerified: false });
        console.log(`Found ${unverifiedUsers.length} unverified users`);

        if (unverifiedUsers.length > 0) {
            // Auto-verify all users
            const result = await User.updateMany(
                { isVerified: false },
                { $set: { isVerified: true } }
            );
            
            console.log(`✅ Auto-verified ${result.modifiedCount} users`);
            console.log('All users can now login successfully!');
        } else {
            console.log('✅ All users are already verified');
        }

        // List all users for verification
        const allUsers = await User.find({}, 'firstName lastName email isVerified');
        console.log('\n📋 All users:');
        allUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.isVerified ? '✅ Verified' : '❌ Not Verified'}`);
        });

    } catch (error) {
        console.error('Error fixing users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixUsers();







