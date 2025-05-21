// Express service for the backend
// this contains the class that will be used to create the express service
// and the methods that will be used to create the express service

// express module
const Express = require("express");
const ExpressSession = require("express-session");
const BodyParser = require("body-parser");

// redis
const RedisStore = require("connect-redis").RedisStore;

// corrs
const CORS = require("cors");

class ExpressService {
    // create the express service
    constructor(routing_service, redis_service) {
        // this creates the application for the express service
        this.express_application = new Express();

        // attach express middleware
        // json
        this.express_application.use(Express.json());

        // urlencoded
        this.express_application.use(Express.urlencoded({ extended: true }));

        // body parser
        this.express_application.use(BodyParser.json());

        // cors
        const is_production = process.env.NODE_ENV === "production";
        this.express_application.use(
            CORS({
                origin: is_production
                    ? PRODUCTION_URL
                    : "http://localhost:5173",
                credentials: true, // allow cookies
            }),
        );

        // redis/session
        this.express_application.use(
            new ExpressSession({
                // input in redis the client
                store: new RedisStore({
                    client: redis_service,
                }),
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,

                // specify that cookies should be made
                cookie: {
                    secure: is_production,
                    httpOnly: true,
                    maxAge:
                        parseInt(process.env.SESSION_MAX_AGE, 10) || 1200000,
                    sameSite: "lax",
                },
            }),
        );

        // router
        this.express_application.use(routing_service);

        // begin express entry point???
        // perchance i move this to the main
        this.express_application.listen(3000, () => {
            console.log("Began Express Service at Port 3000");
        });
    }

    // returns the express application
    get_application() {
        return this.express_application;
    }
}

// export
module.exports = ExpressService;
