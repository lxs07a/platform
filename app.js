var createError = require('http-errors')
var logger = require('morgan')

const express = require('express')
var app = express()

var path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views')

var mongoose = require('mongoose')
var Schema = mongoose.Schema

mongoose.connect("mongodb://localhost:27017/change", {
  useNewUrlParser: true
})

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var hbs = require('hbs')
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')

var indexController = require('./controllers/index')
var usersController = require('./controllers/users')
var hostsController = require('./controllers/hosts')


// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexController)
app.use('/users', usersController)
app.use('/hosts', hostsController)

// Handle 404 - Keep this as a last route
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app


app.listen(3000, function() {
  console.log("Server is running!");
});
