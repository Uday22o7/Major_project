const express = require('express');
const app = express();
require('dotenv/config');
const cors = require('cors');
const mongoose = require('mongoose');
require('./schedulars/photoUpdateScheduler')

// CORS: allow frontend dev origins explicitly
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

//middlewares
app.use(express.json());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use('/uploads', express.static(__dirname + '/uploads'));


//Routers
const usersRoutes = require('./routers/users');
const candidateRoutes = require('./routers/candidates');
const projectRoutes = require('./routers/projects');
const commentRoutes = require('./routers/comments');
const electionRoutes = require('./routers/Elections');
const complaintsRoutes = require('./routers/complaints');
const partiesRoutes = require('./routers/parties');
const resultsRoutes = require('./routers/results');
const peoplesRoutes = require('./routers/peoples');
const adminsRoutes = require('./routers/admins');
const passwordRecoveryRoutes = require('./routers/passwordrecoveryroute');
const verificationsRoutes = require('./routers/verifications');
const candidateDescriptionRoutes = require('./routers/candidateDescriptionRoutes');
const reportFakesRoutes = require('./routers/reportFakes');
const uploadRoute = require('./routers/uploadRoute');


const api = process.env.API_URL || "/api/v1"

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/candidates`, candidateRoutes);
app.use(`${api}/projects`, projectRoutes);
app.use(`${api}/comments`, commentRoutes);
app.use(`${api}/elections`, electionRoutes);
app.use(`${api}/complaints`, complaintsRoutes);
app.use(`${api}/parties`, partiesRoutes);
app.use(`${api}/results`, resultsRoutes);
app.use(`${api}/peoples`, peoplesRoutes);
app.use(`${api}/admins`, adminsRoutes);
app.use(`${api}/passwords`, passwordRecoveryRoutes);
app.use(`${api}/passwords`, passwordRecoveryRoutes);
app.use(`${api}/verifications`, verificationsRoutes);
app.use(`${api}/description`, candidateDescriptionRoutes);
app.use(`${api}/reportFakes`, reportFakesRoutes);
app.use(`${api}/upload`, uploadRoute);

// Check for required environment variables
if (!process.env.CONNECTION_STRING || !process.env.PORT) {
    console.error("ERROR: Missing environment variables. Ensure CONNECTION_STRING and PORT are set.");
    process.exit(1);
}

// Database Connection
mongoose
    .connect(process.env.CONNECTION_STRING, { dbName: 'ElectSDatabase' })
    .then(() => {
        console.log('Database Connection is ready...');
    })
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1); // Terminate if the database connection fails
    });


// Set up the server
const port = process.env.PORT || 3000; // Default to port 3000 if PORT is undefined
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
