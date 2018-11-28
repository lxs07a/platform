var express = require('express')
var app = express()

var session = require('express-session')

var mongoose = require('mongoose')
const MongoStore = require("connect-mongo")(session)

mongoose.connect("mongodb://localhost:27017/change", {
  useNewUrlParser: true
})

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: ['LULU Carrot', 'Just Do It'],
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, //requires HTTPS connection
    sameSite: true 
   },
   unset: 'destroy'
}))

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var mongoose = require("mongoose")
// var Schema = mongoose.Schema

var User = require("../models/user.js")

const bcrypt = require('bcrypt')
const saltRounds = 9

//Sign Up page
app.get('/signup', function(req, res, next) {
  res.render('signup')
})

app.post("/signup", function
  (req, res, next) {
  console.log(req.session.currentUser)
  if (req.session.currentUser!=undefined) req.session.destroy()
  else {
    User.find({email: req.body.email})
    .then ((result) => {
      if(result[0]) res.send("This email already exists, would you like to log in instead of signing up again?")
      //if (result[0]!==undefined)
      else {
        //start session
        req.session.currentUser = req.body.username
        var user = new User(...req.body)
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          user.password = hash
        })
        
        user.save(function(err){
          res.render("hostlist", {name:req.session.currentUser})
        })
      }
    })
    .catch((err)=> {
      throw(err)
    })
  }
})


module.exports = app;
