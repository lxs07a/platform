require("dotenv").config();

var express = require("express");
var app = express();

var session = require("express-session");

var mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

var ObjectId = require("mongodb").ObjectID;

mongoose.connect(
  "mongodb://localhost:27017/change",
  {
    useNewUrlParser: true
  }
);

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: ["LULU Carrot", "Just Do It Already"],
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, //set to true after we get HTTPS connection
      sameSite: true
    },
    unset: "destroy"
  })
);

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Host = require("../models/host.js");

const bcrypt = require("bcryptjs");
const saltRounds = 9;

const multer = require("multer");
const upload = multer({ dest: "./public/uploads/" });
var cpUpload = upload.fields([
  { name: "contact_person_pic", maxCount: 1 },
  { name: "cover_pic", maxCount: 1 },
  { name: "facility_pics", maxCount: 5 },
  { name: "accommodation_pics", maxCount: 5 },
  { name: "classroom_pics", maxCount: 5 }
]);

//List hosts
app.get("/list", function(req, res, next) {
  Host.find({}, function(err, result) {
    if (err) {
      console.log("ERROR!!", err);
      res.end();
    } else {
      res.render("list", {
        hosts: result
      });
    }
  });
});

// Create client with a Promise constructor
const googleMapsClient = require("@google/maps").createClient({
  key: process.env.GMAPS,
  Promise: Promise // 'Promise' is the native constructor.
});

//Sign Up page for hosts
app.get("/signup", function(req, res) {
  res.render("signup-hosts");
});

app.get("/single/:hostname", function(req, res) {
  debugger
  Host.findOne({ url_name: req.params.hostname })
    .then(data => {
      debugger
      var address = data.address.street + ", " + data.address.postcode + ", " + data.address.city + ", " + data.country;
      // Geocode an address with a promise
      debugger
      googleMapsClient.geocode({ address: address })
        .asPromise()
        .then(response => {
          var lat = response.json.results[0].geometry.location.lat;
          var lng = response.json.results[0].geometry.location.lng;
          // .catch((err) => {
          //   console.log(err);
          // })
          
          res.render("single-host", {
            key: process.env.GMAPS,
            lng: lng,
            lat: lat,
            country: data.country,
            city: data.city,
            phone: data.phone,
            facility_name: data.facility_name,
            facility_pics: data.facility_pics,
            address: data.address,
            website: data.website,
            cover_pic: data.cover_pic,
            url_name: data.url_name,
            question1: data.question1,
            question2: data.question2
          });
          debugger
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .catch(err => {
      throw err;
    });
});

app.post("/signup", cpUpload, function(req, res, next) {
  Host.find({ email: req.body.email })
    .then(result => {
      if (result[0])
        res.send(
          "This email already exists, would you like to log in instead of signing up again?"
        );
      else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          var host = new Host({
            ...req.body
          });

          host.password = hash;

          host.address.street = req.body.street;
          host.address.postcode = req.body.postcode;
          host.address.city = req.body.city;

          if (req.files["contact_person_pic"]) {
            host.contact_person_pic =
              req.files["contact_person_pic"][0].filename;
          }

          if (req.files["cover_pic"]) {
            host.cover_pic = req.files["cover_pic"][0].filename;
          }

          if (req.files["facility_pics"]) {
            let facilityArray = req.files["facility_pics"].map(obj => {
              return obj.filename;
            });
            host.facility_pics = facilityArray;
          }

          if (req.files["accommodation_pics"]) {
            let accommodationArray = req.files["accommodation_pics"].map(
              obj => {
                return obj.path;
              }
            );
            host.accommodation_pics = accommodationArray;
          }

          if (req.files["classroom_pics"]) {
            let classroomArray = req.files["classroom_pics"].map(obj => {
              return obj.path;
            });
            host.classroom_pics = classroomArray;
          }

          let urlString = req.body.facility_name + req.body.country;
          host.url_name = urlString.replace(/\s+/g, "-").toLowerCase(); //?

          host.save(function(err) {
            console.log("Host is " + host);

            res.redirect("/hosts/list");
          });
        });
      }
    })
    .catch(err => {
      throw err;
    });
});

module.exports = app;
