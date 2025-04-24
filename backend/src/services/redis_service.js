const redis = require('redis');

class RedisService {
    constructor() {
        
        // create the redis client
        try {
            // create client
            this.redis_client = redis.createClient({
                socket: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: process.env.REDIS_PORT || 6379,
                }
            });
            
            // redis connect
            this.redis_client.connect();
            
            console.log("Redis Connection Successful");
        } catch (err) {

            // redis connection error
            throw new Error(`Redis Error: ${err}`);
        }
    }

    // return the redis client
    get_client() {
        return this.redis_client;        
    }
}

// export the redis client
module.exports = RedisService;
