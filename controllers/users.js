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

const bcrypt = require('bcrypt')
const saltRounds = 9

const multer  = require('multer')
const upload = multer({ dest: './public/uploads/' })
var cpUpload = upload.fields([{ name: 'profilepic', maxCount: 1 }, { name: 'governmentId', maxCount: 1 }])

//Sign Up page
app.get('/signup', function(req, res, next) {
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
        //start session
        req.session.currentUser = req.body.email
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          var user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            nickname: req.body.nickname,

            email: req.body.email,
            password: hash,

            address: {
                street: req.body.street,
                postcode: req.body.postcode,
                city: req.body.city,
                country: req.body.country
            },

            birthdate: req.body.birthdate, //saves as datestamp
            profession: req.body.profession,
            country_of_origin: req.body.country_of_origin,

            // languages: Array,
            // skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],

            profilepic: req.files['profilepic'][0].path,
            governmentId: req.files['governmentId'][0],

            question1: req.body.question1,
            question2: req.body.question2,
            question3: req.body.question3, 

            start_date: req.body.start_date,
            end_date: req.body.end_date,
          })
          user.save(function(err){
          res.send("Success!" + user.birthdate)
          })
        })
      }
    })
    .catch((err)=> {
      throw(err)
    })
  }
})

module.exports = app
