const express = require('express');

class RouterService {
	constructor() {
		this.router = express.Router();

		// setup the routes
		this.router.use(require('../routes/routes'));
		this.router.use(require('../routes/flights'));
		this.router.use(require('../routes/booking/seats'))
		this.router.use(require('../routes/booking/session'))
		this.router.use(require('../routes/booking/search'))
		this.router.use(require('../routes/booking/extras'))
		this.router.use(require('../routes/booking/payment'))
	}

	// returns the router
	get_router() {
		return this.router;
	}
}

// export the reouter service
module.exports = RouterService;