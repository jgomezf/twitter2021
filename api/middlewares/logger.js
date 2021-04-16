const logger = (req, res, next) => {
  const dateTime = new Date().toLocaleString();
  const {
    ip = '', method = '', hostname = '', path = '', body = {},
  } = req;

  /* eslint-disable no-console */
  console.log(`${dateTime} :: ${method} ::${hostname} :: ${path} :: ${body && JSON.stringify(body)} :: ${ip}`);
  /* eslint-enable no-console */
  next();
};

module.exports = { logger };
