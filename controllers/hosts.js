var express = require('express')
var app = express()

var session = require('express-session')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var mongoose = require("mongoose")

var Host = require("../models/host.js")

const bcrypt = require('bcrypt')
const saltRounds = 9

const multer  = require('multer')
const upload = multer({ dest: './public/uploads/' })
var cpUpload = upload.fields([{ name: 'contact_person_pic', maxCount: 1 }, 
                              { name: 'facility_pics', maxCount: 5 },  
                              { name: 'accommodation_pics', maxCount: 5 }, 
                              { name: 'classroom_pics', maxCount: 5 }])

//List hosts
app.get('/list', function(req, res, next) {
	Host.find({}, function (err, result) {
		if (err) {
			console.log("ERROR!!", err);
			res.end();
		} else {
			res.render("list", {
					hosts: result
				})
		}
	})
})

//Sign Up page for hosts
app.get('/signup', function(req, res) {
  res.render('signup-hosts')
})

app.post("/signup", cpUpload, function(req, res, next) {
  Host.find({email: req.body.email})
  .then ((result) => {
    if(result[0]) res.send("This email already exists, would you like to log in instead of signing up again?")
    else {
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

        var host = new Host({
          ...req.body 
        })
        
        host.password = hash

        let facilityArray = req.files['facility_pics'].map((obj) => {
          return obj.path
        }) 
        host.facility_pics = facilityArray

        let accommodationArray = req.files['accommodation_pics'].map((obj) => {
          return obj.path
        }) 
        host.accommodation_pics = accommodationArray

        let classroomArray = req.files['classroom_pics'].map((obj) => {
          return obj.path
        }) 
        host.accommodation_pics = classroomArray
        
        host.save(function(err){
        res.send("Success!");
        })
      })
    }
  })
  .catch((err)=> {
    throw(err)
  })
})



module.exports = app;
