// load all the environment variables
const environment_path = require('path');
const dotenv = require('dotenv');

// load envonrment vairbales
const env_path = environment_path.resolve(__dirname, '../../.env');
dotenv.config({path: env_path});