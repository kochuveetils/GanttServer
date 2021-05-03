const express = require('express');
const dutyRouter = express.Router();
const cors = require('./cors');
const dutydata = require('../oraclemodels/dutydata');

// App settings
const MODULE = 'dutyRouterOra';
const logger = require('../configurelogger').logger(MODULE);


dutyRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {

        logger.trace('Using Oracle DB ');
        dutydata.run(req.query, (getarray) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(getarray);
        });
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported ');
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported ');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported ');
    });

dutyRouter.route('/:creditId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported ');
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported ');
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported ');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported ');
    });


module.exports = dutyRouter;