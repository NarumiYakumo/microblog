var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require("connect-flash");
var MongoStore = require('connect-mongo')(session);
var setting = require('./setting');
var db = require('./models/db');
var fs =require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags : 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags : 'a'});


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(logger('dev',{stream : accessLogfile}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: setting.cookieSecret,
  store: new MongoStore({url: 'mongodb://'+setting.host+':'+setting.port})
}));
app.use(flash());

app.use(function(req, res, next){
  console.log('res.local');
  res.locals.user = req.session.user;
  var error = req.flash('error');
  res.locals.error = error.length ? error : null;
  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  next();
});
app.use(routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  errorLogfile.write(req.url+err.stack);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
