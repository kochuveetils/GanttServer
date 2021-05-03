var createError = require('http-errors');
var express = require('express');
var path = require('path');
var morganlogger = require('morgan');
var indexRouter = require('./routes/index');


// App settings

const MODULE = 'app';

const logger = require('./configurelogger').logger(MODULE);

// Create the logger
// const logger = log4js.getLogger(MODULE);
// Log a message
// logger.trace('Trace, Testing Log4js!');
// logger.debug('Debug, Testing Log4js!');
// logger.info('Hello, Testing Log4js!');
// logger.warn('Heads up, Testing Log4js!');
// logger.error('Danger, Testing Log4js!');
// logger.fatal('Fatal, Testing Log4js!');


logger.info("***Mounting Oracle DB Router***");
// Oracle Routers below
var ganttRouter = require('./routes/ganttRouterOra');
var dutyRouter = require('./routes/dutyRouterOra');

var app = express();

app.all('*', (req, res, next) => {
  logger.info('Inside App All Request')
  if (req.secure) {
    logger.info('Request to Secure server ' + req.secure + ' Proceeding to https://' + req.hostname + ':' + app.get('secPort') + req.url);
    return next();
  }
  else {

    // Uncomment for Secure Config
    // UnComment this if you want to use secure server. Comment the return next then
    // console.log('Request to Secure server ' + req.secure + ' Rediriecting to secure server - ' + 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
    // res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);

    // This is for Insecure server
    logger.info('Request to Secure server ' + req.secure + ' Proceeding to http://' + req.hostname + ':' + app.get('port') + req.url);
    return next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morganlogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/gantt', ganttRouter);
app.use('/duty', dutyRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  logger.error('In Error Handler. Creating Error 404');
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  logger.error('In Error Handler Catch.');
  logger.error(err);
  logger.error(req.app.get('env'))
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    status: err.status,
    error: true
  });
  // res.render('error');
});

module.exports = app;
