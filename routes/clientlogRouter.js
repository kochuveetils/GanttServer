var express = require('express');
var clientlogRouter = express.Router();
const cors = require('./cors');

// App settings

const MODULE = 'http';

const logger = require('../configurelogger').logger(MODULE);

clientlogRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.cors, (req, res, next) => {
        logger.debug('Inside POST client router')
        logger.debug(req.body);
        // logger.debug(req.body.logs[0].stacktrace);
        let error = req.body.logs[0].msg;
        let errorInfo = req.body.logs[0].level;

        // send these errors to some service or to a logger (ex: winston)
        //ex: logger.error(`The app received a new client log: ${error} ${errorInfo}`);
        logger.error((req.user ? req.user.username : '') + '-' + `The app received a new client log: ${error} ${errorInfo}`);

        res.status(200);
    });


module.exports = clientlogRouter;