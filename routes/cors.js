const express = require('express');
const cors = require('cors');
const app = express();
const log4js = require('Log4js');


// App settings
const MODULE = 'cors';
const logger = require('../configurelogger').logger(MODULE);
// const { traceLogConfig } = require('../app-settings').log4js;
// // Logger configuration
// log4js.configure(traceLogConfig);

// // Create the logger
// const logger = log4js.getLogger(MODULE);

const whiteList = ['http://localhost:3001',
    'https://localhost:3443',
    'http://localhost:5000',
    'http://10.4.208.218:3001',
    'http://192.168.0.19:3001',
    'http://sumith-pc:3001',
    'http://192.168.0.34:3001',
    'https://192.168.0.34:3001',
    'http://192.168.0.34:5000',
    'http://192.168.0.4:3443',
    'https://192.168.0.4:3443',
    'https://192.168.0.4:3001',
    'http://192.168.0.4:5000'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    logger.debug('CORS Option : Origin header is ' + req.header('Origin'));
    if (whiteList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
        logger.debug('CORS Option : Origin True');
        logger.debug('CORS Option : CORS policy will allow from this origin ' + req.header('Origin'));
    }
    else {
        corsOptions = { origin: false };
        logger.error('CORS Option : Origin False');
        logger.error('CORS Option : policy will not allow from this origin ' + req.header('Origin'));
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);