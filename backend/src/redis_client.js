const redis = require('redis');

const redis_client_options = {
	socket: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || 6379,
	},
};
const redis_client = redis.createClient(redis_client_options);

// redis error handling
redis_client.on('error', (err) => console.error("Redis Client Error: ", err));
redis_client.on('connect', () => console.log("Connected to Redis, les go boys"));
redis_client.connect().catch(console.error);

module.exports = redis_client;
