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

var Host = require("../models/host.js")

const bcrypt = require('bcryptjs')
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


app.get('/:hostId', (req, res) => {

//	
//	res.render('single-host', req.params.hostId)
////	spotifyApi.getArtistAlbums(req.params.artistId)
////		.then(data => {
////			res.render('albums', {
////				albums: data.body.items
////			})
////		})
////		.catch(err => {
////			console.log('Something went wrong... ', err)
////		})
	

	
	
});

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

        let urlString = req.body.name + req.body.country
        host.url_name = urlString.replace(/\s+/g, '-').toLowerCase() //?
        
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
