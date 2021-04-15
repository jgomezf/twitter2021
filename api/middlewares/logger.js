const logger = (req, res, next) =>{
    const dateTime = new Date().toLocaleString();    
    const {ip = '', method = '', hostname = '', path = '', body = {} } = req;
    
    console.log(`${dateTime} :: ${method} ::${hostname} :: ${path} :: ${body && JSON.stringify(body)} :: ${ip}`);

    next();
};

module.exports = { logger }