const dotenv = require('dotenv');

dotenv.config();

const config = {
    http: {
        port: process.env.HTTP_PORT,
    },
    logs : {
        access: process.env.LOG_ACCESS,
    },
    jwtKey: process.env.JWTKEY,
    apiWeatherKey: process.env.APIWEATHERKEY,
    database: {
        connectionString: process.env.DB_CONNECTION_STRING,
    },
};


module.exports = { config }