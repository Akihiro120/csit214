// get the router, again, sigh...
const express = require('express');
const router = express.Router();

// create the default route
router.get('/api/', async (_, res) => {
    // send a cheeky response msg
    res.send("8==D");
});

// reuturn router
module.exports = router;