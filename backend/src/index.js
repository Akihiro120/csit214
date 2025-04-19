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

const app = express();
app.use(express.json());

// begin redis client
app.use(session({
	store: new RedisStore({
		client: redis_client
	}),
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: 'production',
		httpOnly: true,
		maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 120000,
		sameState: 'lax'
	}
}));

// begin express service
app.use(routes);

// begin listening
app.listen(3000, () => {
	console.log("Server running on port 3000");
});
