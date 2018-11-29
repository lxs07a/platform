var mongoose = require("mongoose")
var Schema = mongoose.Schema

var Host = mongoose.model("hosts", new Schema ({
    contact_person: String,
    contact_person_pic: String,
    facility_name: String,
    email: String,
    
    country: String,
    continent: String,
    address: {
        streetname: String,
        streetnumber: Number,
        postcode: String,
		city: String,
        country: String
    },

    question1: String,
    question2: String,
    question3: String,

    //skills_needed: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],

    start_date: Date,
    end_date: Date,

    facility_pics: Array,
    accommodation_pics: Array,
    classroom_pics: Array,

    username: String,
    password: String,
}), "hosts")

module.exports = Host