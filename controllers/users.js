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

var User = require("../models/user.js")

const bcrypt = require('bcryptjs')
const saltRounds = 9

const multer  = require('multer')
const upload = multer({ dest: './public/uploads/' })
var cpUpload = upload.fields([{ name: 'profilepic', maxCount: 1 }, { name: 'governmentId', maxCount: 1 }])

//Sign Up page
app.get('/signup', function(req, res) {
  res.render('signup')
})

app.post("/signup", cpUpload, function
  (req, res, next) {
  if (req.session.currentUser!=undefined) req.session.destroy()
  else {
    User.find({email: req.body.email})
    .then ((result) => {
      if(result[0]) res.send("This email already exists, would you like to log in instead of signing up again?")
      else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          var user = new User({
            ...req.body
          })
          user.profilepic = req.files['profilepic'][0].filename
          user.governmentId = req.files['governmentId'][0].filename
          user.password = hash
          user.save(function(err){
            //start session
            req.session.currentUser = req.body.email
            res.render('users/list')
          })
        })
      }
    })
    .catch((err)=> {
      throw(err)
    })
  }
})

//Login page
app.get('/login', function(req, res) {
  res.render('login')
})

app.post("/login", function
  (req, res) {
    //log out previous user
  if (req.session.currentUser!=undefined) req.session.destroy()
  else {
    //check if there's a freelancer with this email
    User.find({email: req.body.login-email})
    .then ((result) => {
      if(result[0]) {
        bcrypt.compare(req.body.password, result[0].password, function(err, res) {
          if(false) res.send("Wrong email/password combination")
          else {
            //start session
            req.session.currentUser = req.body.email
            res.render('hosts/list')
          }
        })
      }
      //If there is no such freelancer, check if there's a host with this email
      else {
        Host.find({email: req.body.login-email})
        .then((result) => {
          if(result[0]===undefined) {
            res.render("No such email found. Would you like to sign up?")
          }
        })
        bcrypt.compare(req.body.password, result[0].password, function(err, res) {
          if(false) res.send("Wrong username/password combination")
          else {
            //start session
            req.session.currentUser = req.body.email
            res.render('users/list')
          }
        })
      }
    })
    .catch((err)=> {
      throw(err)
    })
  }
})

//List freelancers
app.get('/list', function(req, res, next) {
	User.find({}, function (err, result) {
		if (err) {
			console.log("ERROR!!", err);
			res.end();
		} else {
			res.render("userslist", {
					freelancers: result
				})
		}
	})
})

module.exports = app
