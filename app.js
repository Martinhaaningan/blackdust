var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

var app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
app.io = io;


const session = require("express-session")({
    secret: "f5epmygeyhcof6yjh,05yc495.y045y0",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.DB_HOST})
});
var sharedsession = require("express-socket.io-session");

// Use express-session middleware for express
app.use(session);

// Passport middleware
app.use(passport.initialize());         // init passport
app.use(passport.session());            // connect passport and sessions
require('./services/passport')(passport);

// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave:true
})); 

//Mongoose connection
mongoose.connect(process.env.DB_HOST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then( function() { console.log('mongoose connection open'); })
    .catch( function(err) { console.error(err); });


var indexRouter = require('./routes/index')(app.io);
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

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

server.listen(process.env.PORT);

module.exports = app;