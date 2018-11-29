var express = require('express')
var app = express()

var session = require('express-session')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var mongoose = require("mongoose")
var Schema = mongoose.Schema

var Host = require("../models/host.js")

const bcrypt = require('bcrypt')
const saltRounds = 9

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
				//res.render({title: title});
		}
	})
})

//Sign Up page hosts
app.get('/signup', function(req, res, next) {
//	db.hosts.find()
  res.render('signup-hosts')
})

app.post("/signup", function(req, res, next) {
    Host.find({email: req.body.email})
    .then ((result) => {
      if(result[0]) res.send("This email already exists, would you like to log in instead of signing up again?")
      else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          var host = new Host({
            facility_name: req.body.name,
            country: req.body.country,
			
			address: {
            	city: req.body.city,
        	}, 
			password: hash
           
          });
          host.save(function(err){
          res.send("Success!");
          })
        })
      }
    })
    .catch((err)=> {
      throw(err)
    })
//  }
})



module.exports = app;
