const env = require('./environment')
const ExpressService = require('./services/express_service');
const RoutingService = require('./services/routes_service');
const RedisService = require('./services/redis_service');

// additional eror handling
// handles unhandledRejection and uncaughtExceptions
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
	process.exit(1);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	process.exit(1);
});

// async entry point, this will be the centralized entry point
// reduces the need for await promise handling like a loser
// catches all errors at entry
(async() => {
	try {
		// begin redis service
		const redis_service = new RedisService();

		// begin routing service
		const routing_service = new RoutingService();

		// begin express
		const _ = new ExpressService(routing_service.get_router(), redis_service.get_client());

	} catch (err) {
		console.error("Error: ", err);
		process.exit(1); // Close the Server, its failed
	}
})();