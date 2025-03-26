const express = require('express');
const router = express.Router();
const {check_connection} = require('./database');

// confirm base connection
router.get('/', (_, res) => {
	// determine connection status
	check_connection()
		.catch((err) => {
			res.send(err);
		});	
});

// router.get('/airports', (_, res) => {
//
// });

// export the router
module.exports = router;
