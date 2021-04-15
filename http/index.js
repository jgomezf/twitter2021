const express = require("express");
const { config } = require('./../config')
const api = require('./../api');

const { port } = config.http;

const app = express();
app.use(express.json());
app.use('/api', api);
app.use('/api/v1', api);


const init = () => {
    app.listen(port, () => console.log(`Servidor iniciado en el puerto ${port}`));
}

module.exports = { init };
