const environment_path = require('path');
const dotenv = require('dotenv');

// load envonrment vairbales
const env_path = environment_path.resolve(__dirname, '../../.env');
dotenv.config({path: env_path});

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').RedisStore;
const routes = require('./routes');
const redis_client = require('./redis_client');
const cors = require('cors'); // Import the cors middleware


const app = express();
app.use(express.json());

// Determine if running in production
const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
const corsOptions = {
    origin: isProduction ? 'YOUR_PRODUCTION_FRONTEND_URL' : 'http://localhost:5173', // Replace with your actual frontend URL in production, 5173 is Vite's default dev port
    credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions)); // Use CORS middleware BEFORE routes

// Session Configuration
app.use(session({
	store: new RedisStore({
		client: redis_client
	}),
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: isProduction, // Use the boolean variable here
		httpOnly: true,
		maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 120000,
		sameSite: 'lax' // Corrected property name: 'sameSite'
	}
}));

// begin express service
app.use(routes);

// begin listening
app.listen(3000, () => {
	console.log("Server running on port 3000");
});
