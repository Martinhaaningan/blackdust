var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const sharedsession = require("express-socket.io-session");

var socket_io = require( "socket.io" );
var io = socket_io();


//Mongoose connection
mongoose.connect(process.env.DB_HOST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then( function() { console.log('mongoose connection open'); })
    .catch( function(err) { console.error(err); });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(session(                        // setup session
    {
        secret: '&/()=fghjklTYUIFGHJVBNM&5678DFcfghj¤%&',  // footprints of the keyboard cat
        resave: true,
        saveUninitialized: true
  }));
//deler sessions objectet med socket.io

io.use(sharedsession(session, {
    autoSave:true
})); 
io.of('/namespace').use(sharedsession(session, {
    autoSave: true
}));


// Passport middleware
app.use(passport.initialize());         // init passport
app.use(passport.session());            // connect passport and sessions
require('./services/passport')(passport);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
