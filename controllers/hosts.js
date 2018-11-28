var express = require('express')
var app = express()
var router = express.Router()

var session = require('express-session')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var mongoose = require("mongoose")
var Schema = mongoose.Schema

var User = require("../models/host.js")

const bcrypt = require('bcrypt')
const saltRounds = 9

//Sign Up page
router.get('/list', function(req, res, next) {
  res.render('list')
})

//router.post("/signup", function(req, res, next){
//  //clear session...
//  User.find({username: req.body.username})
//  .then ((result) => {
//    if(result[0]) res.render("errlogin")
//    //if (result[0]!==undefined)
//    else {
//      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//        var user = new User({
//          username:req.body.username, 
//          password:hash
//        })
//        user.save(function(err){
//          //some session stuff
//          res.render("vipsearch", {name:req.body.username})
//        })
//      })
//    }
//  })
//})



module.exports = router;
