
const log4js = require('Log4js');

const { traceLogConfig } = require('./app-settings').log4js;

// Logger configuration
log4js.configure(traceLogConfig);

exports.logger = log4js.getLogger();


exports.logger = (module) => {
    return log4js.getLogger(module);
}


