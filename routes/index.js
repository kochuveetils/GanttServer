var express = require('express');
var router = express.Router();
const log4js = require('Log4js');

// App settings

const MODULE = 'indexRouter';

const logger = require('../configurelogger').logger(MODULE);

// const { traceLogConfig } = require('../app-settings').log4js;
// Logger configuration
// log4js.configure(traceLogConfig);

// Create the logger
// const logger = log4js.getLogger(MODULE);



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
