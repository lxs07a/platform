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

app.get('/:hostId', (req, res) => {
	Host.find({})(function(err, result) {
    if (err) throw err;
    console.log(result);
  });
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
