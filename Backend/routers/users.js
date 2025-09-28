const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { Candidate } = require('../models/candidate');
const { PoliticalParty } = require('../models/party');
const Service = require('../Services/GenericService');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'identity-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for identity documents
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Allowed: JPEG, PNG, PDF'), false);
        }
    }
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const name = 'User';
const mongoose = require('mongoose');


//Get users
router.get('/', async (req, res) => {
    try {
        const result = await User.find()
            .populate('politicalParty', 'name abbreviation')
            .select('-passwordHash');

        // For each user, check if they are a candidate and get their approval status
        const usersWithCandidateStatus = await Promise.all(result.map(async (user) => {
            const userObj = user.toObject();
            if (user.isCandidate) {
                const candidate = await Candidate.findOne({ user: user._id });
                userObj.candidateApproved = candidate ? candidate.isApproved : false;
            } else {
                userObj.candidateApproved = false;
            }
            return userObj;
        }));

        res.status(200).json({
            success: true,
            data: usersWithCandidateStatus,
            message: "All users fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
})

//Get User By id
router.get('/profile/:id', async (req, res) => {
    Service.getById(req, res, User, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})



// Delete a User and associated Candidate data if exists
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    // Validate the provided ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send('Invalid User ID');
    }

    try {
        // Check if the user is a candidate
        const candidate = await Candidate.findOne({ user: userId });

        if (candidate) {
            // Delete the candidate record if found
            await Candidate.findByIdAndDelete(candidate._id);
            console.log(`Candidate record for user ${userId} deleted.`);
        }

        // Delete the user record
        const user = await User.findByIdAndDelete(userId);

        if (user) {
            res.status(200).json({
                success: true,
                message: `User ${userId} and associated candidate data deleted successfully.`,
            });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error deleting user and candidate data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});


//getCount
router.get('/get/count', (req, res) => {
    Service.getCount(res, User, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})


//Post new User - Registration with age and document upload
router.post('/register', upload.single('identityDocument'), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            address,
            email,
            password,
            phone,
            gender,
            age,
            location,
            isCandidate,
            politicalParty
        } = req.body;

        // Validation
        if (!firstName || !lastName || !address || !email || !password || !phone || !gender || !age || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: firstName, lastName, address, email, password, phone, gender, age, location'
            });
        }

        // Age validation
        const userAge = parseInt(age);
        if (isNaN(userAge) || userAge < 18) {
            return res.status(400).json({
                success: false,
                message: 'You must be at least 18 years old to register and vote'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            address,
            email,
            passwordHash,
            phone,
            gender,
            age: userAge,
            location,
            identityDocument: req.file ? req.file.filename : '',
            isCandidate: isCandidate === 'true' || isCandidate === true,
            politicalParty: politicalParty || null
        });

        await newUser.save();

        // If registering as candidate, create Candidate record too
        if (isCandidate === 'true' || isCandidate === true) {
            if (!politicalParty) {
                return res.status(400).json({
                    success: false,
                    message: 'Political party is required for candidate registration'
                });
            }

            const partyExists = await PoliticalParty.findById(politicalParty);
            if (!partyExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Political Party ID'
                });
            }

            const existingCandidate = await Candidate.findOne({ user: newUser._id });
            if (!existingCandidate) {
                const candidate = new Candidate({
                    user: newUser._id,
                    party: politicalParty,
                    isVerified: true
                });
                await candidate.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                gender: newUser.gender,
                isCandidate: newUser.isCandidate
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + error.message
            });
        }

        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
});




// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        const secret = process.env.SECRET_KEY;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'The user not found'
            });
        }

        // Skip verification check for now - all users can login
        // Auto-verify users if they were created before verification was required
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
            console.log(`Auto-verified user: ${user.email}`);
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Password is wrong'
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            secret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                address: user.address,
                gender: user.gender,
                age: user.age,
                location: user.location,
                isCandidate: user.isCandidate,
                isApproved: user.isApproved
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


// Approve user for voting
router.put('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isApproved = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User approved successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Approve candidate for elections
router.put('/approve-candidate/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isCandidate) {
            return res.status(400).json({
                success: false,
                message: 'User is not a candidate'
            });
        }

        const candidate = await Candidate.findOne({ user: user._id });
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate record not found'
            });
        }

        candidate.isApproved = true;
        await candidate.save();

        res.status(200).json({
            success: true,
            message: 'Candidate approved successfully',
            candidate: {
                _id: candidate._id,
                user: user._id,
                isApproved: candidate.isApproved
            }
        });
    } catch (error) {
        console.error('Error approving candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

//Update user details
router.put('/:id', upload.single('profilePhoto'), async (req, res) => {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const profilePhotoUrl = req.file ? req.file.path : userExist.profilePhoto;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            nic: req.body.nic,
            gender: req.body.gender,
            passwordHash: newPassword,
            email: req.body.email,
            phone: req.body.phone,
            addressline1: req.body.addressline1,
            addressline2: req.body.addressline2,
            city: req.body.city,
            district: req.body.district,
            province: req.body.province,
            isCandidate: req.body.isCandidate,
            profilePhoto: profilePhotoUrl
        },
        { new: true }
    )

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/edit/verify-password', async (req, res) => {
    try {
        const { currentPassword, userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid current password" });
        }

        res.json({ success: true, message: "Password verified" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//Get pending verifications
router.get('/pending-verifications', async (req, res) => {
    try {
        const pendingUsers = await User.find({ isVerified: false }).select('firstName lastName nic nicFront nicBack profilePhoto realtimePhoto');

        /* if (!pendingUsers.length) {
            return res.status(404).json({ success: false, message: 'No pending verifications found' });
        } */

        res.status(200).json({ success: true, users: pendingUsers });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//API Route to Verify or Reject Users
router.put('/verify/:userId', async (req, res) => {
    const { isVerified } = req.body;

    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isVerified = isVerified;
        await user.save();

        res.status(200).json({ success: true, message: `User ${isVerified ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        console.error('Error updating verification status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Auto-verify all users endpoint (for fixing existing users)
router.post('/auto-verify-all', async (req, res) => {
    try {
        const result = await User.updateMany(
            {},
            { $set: { isVerified: true } }
        );

        res.status(200).json({
            success: true,
            message: `Auto-verified ${result.modifiedCount} users`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error auto-verifying users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all users endpoint (for debugging)
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName email isVerified createdAt');
        res.status(200).json({
            success: true,
            users: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update user details with real-time photo
router.put('/updatephoto/:id', upload.single('realtimePhoto'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if a new real-time photo is uploaded
        const realtimePhotoUrl = req.file ? req.file.path : null;

        if (!realtimePhotoUrl) {
            return res.status(400).json({ success: false, message: 'Real-time photo is required' });
        }

        // Update the user's real-time photo and update timestamp
        user.realtimePhoto = realtimePhotoUrl;
        user.photoUpdatedAt = Date.now();

        await user.save();

        res.status(200).json({ success: true, message: 'Real-time photo updated successfully', user });
    } catch (error) {
        console.error('Error updating real-time photo:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.get('/get/pendingverifications/count', async (req, res) => {
    try {
        const pendingUsersCount = await User.countDocuments({ isVerified: false });
        res.status(200).json({ success: true, count: pendingUsersCount });
    } catch (error) {
        console.error('Error fetching pending verifications count:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;