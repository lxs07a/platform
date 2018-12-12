var express = require('express')
var app = express()

var session = require('express-session')

var mongoose = require('mongoose')
const MongoStore = require("connect-mongo")(session)

const nodemailer = require('nodemailer');
var ObjectId = require("mongodb").ObjectID;

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
// var Host = require("../models/host.js")

const bcrypt = require('bcryptjs')
const saltRounds = 9

const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })
var cpUpload = upload.fields([{ name: 'profilepic', maxCount: 1 }, { name: 'governmentId', maxCount: 1 }])

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: 'jchinsue@gmail.com',
         pass: 'qbxnhjpcetztewrt'
     }
 });

//Sign Up page
app.get('/signup', function (req, res) {
  res.render('signup')
})

app.post("/signup", cpUpload, function
  (req, res, next) {
  if (req.session.currentUser != undefined) req.session.destroy()
  else {
    User.find({ email: req.body.email })
      .then((result) => {
        if (result[0]) res.send("This email already exists, would you like to log in instead of signing up again?")
        else {
          bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            var user = new User({
              ...req.body
            })

            user.address.street = req.body.street;
            user.address.postcode = req.body.postcode;
            user.address.city = req.body.city;
            user.address.country = req.body.country;

            if (req.files["profilepic"]) {
              user.profilepic = req.files['profilepic'][0].filename
            }
            if (req.files["governmentId"]) {
              user.governmentId = req.files['governmentId'][0].filename
            }            
            
            user.password = hash
            user.save(function (err) {
              //start session
              req.session.currentUser = req.body.email

              var mailOptions = {
                from: '"Lulu from Upcharge" <info@upcharge.nl>', // sender address
                to: `${req.body.firstname} ${req.body.lastname} <${req.body.email}>`, // list of receivers
                subject: 'Request ', // Subject line
                text: req.body.to, // plaintext body
                html:
                `
                <h2>Hi ${req.body.firstname},</h2>
                <br>
                <p>Thank you for subscription!</p>
                <br>
                <p>Kind regards, Team Upcharge</p>
                `      
  
              };
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  return console.log(error);
                }
                console.log('Message sent: ' + info.response);
              });
  


              res.redirect("list")
            })           

          })
        }
      })
      .catch((err) => {
        throw (err)
      })
  }
})

//Login page
app.get('/login', function (req, res, next) {
  res.render('login')
})

app.post("/login", function (req, res, next) {

  //log out previous user
  if (req.session.currentUser != undefined) req.session.destroy()
  else {
    //check if there's a freelancer with this email  

    User.find({ email: req.body.loginemail })
      .then((result) => {
        if (result[0]) {


          bcrypt.compare(req.body.password, result[0].password, function (err, result) {
            if (result == true) {
              req.session.currentUser = req.body.email
              res.redirect("list")
            } else {
              res.render('no-user');
            }
          });

        }
        //If there is no such freelancer, check if there's a host with this email
        else {
          User.find({ email: req.body.loginemail })
            .then((result) => {
              if (result[0] === undefined) {
                res.render('no-user')
              }
            })
          bcrypt.compare(req.body.password, result[0].password, function (err, res) {
            if (false) res.send("Wrong username/password combination")
            else {
              //start session
              req.session.currentUser = req.body.email
              res.render('users/list')
            }
          })
        }
      })
      .catch((err) => {
        throw (err)
      })
  }
})

//List freelancers
app.get('/list', function (req, res, next) {
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

app.get("/single/:id", function (req, res) {
  User.findOne({ "_id": req.params.id })
    .then(data => {
      startDate = new Date(data.start_date)
      res.render("single-user", {
        nickname: data.nickname,
        city: data.address.city,
        country: data.address.country,
        question1: data.question1,
        question2: data.question2,
        question3: data.question3,
        profilepic: data.profilepic,
        startdate: startDate.toDateString(),
        enddate: data.end_date,
      })

    })
    .catch(err => {
      throw err;
    });
});




module.exports = app