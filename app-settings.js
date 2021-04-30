const appSettings = {
    log4js: {
        traceLogConfig: {
            'appenders': {
                'access': {
                    'type': 'dateFile',
                    'filename': './logs/access.log',
                    'pattern': '-yyyy-MM-dd',
                    'keepFileExt': true,
                    'category': 'http'
                },
                'app': {
                    'type': 'file',
                    'filename': './logs/app.log',
                    'maxLogSize': 10485760,
                    'numBackups': 3
                },
                'conlogFile': {
                    'type': 'stdout'
                    // 'filename': './logs/trace.log'
                },
                'conlog': {
                    'type': 'logLevelFilter',
                    'level': 'DEBUG',
                    'appender': 'conlogFile'
                },
                'errorFile': {
                    'type': 'file',
                    'filename': './logs/errors.log'
                },
                'errors': {
                    'type': 'logLevelFilter',
                    'level': 'ERROR',
                    'appender': 'errorFile'
                }
            },
            'categories': {
                'default': { 'appenders': ['app', 'errors', 'conlog'], 'level': 'TRACE' },
                'http': { 'appenders': ['access', 'errors', 'conlog'], 'level': 'TRACE' }
            }

        }
    }
};

module.exports = appSettings;
