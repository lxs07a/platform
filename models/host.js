var mongoose = require("mongoose")
var Schema = mongoose.Schema

var ObjectId = require('mongodb').ObjectID;

var Host = mongoose.model("hosts", new Schema ({
    contact_person: String,
    contact_person_pic: String,
    facility_name: String,
    cover_pic: String,
    email: String,
    url_name: String,
    
    country: String,
    continent: String,
    address: {
        street: String,
        postcode: String,
		city: String,
    },

    question1: String,
    question2: String,
    question3: String,

    skills_needed: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],

    start_date: Date,
    end_date: Date,

    facility_pics: Array,
    accommodation_pics: Array,
    classroom_pics: Array,

    username: String,
    password: String,
}), "hosts")

module.exports = Host