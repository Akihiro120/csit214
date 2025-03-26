const express = require('express');
const routes = require('./routes');

// begin express service
const app = express();
app.use(routes);

// begin listening
app.listen(3000, () => {
	console.log("Server running on port 3000");
});
