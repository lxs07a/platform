var mongoose = require("mongoose")
var Schema = mongoose.Schema

var User = mongoose.model("users", new Schema ({
    firstname: String,
    lastname: String,

    birthdate: Date,
    profession: String,
    profilepic: String,
    governmentId: String,

    question1: String,
    question2: String,
    question3: String, 

    start_date: Date,
    end_date: Date,

    country_of_origin: String,
    address: {
        streetname: String,
        streetnumber: Number,
        postcode: Number,
        country: String
    },

    languages: Array,
    // skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    skills: [{ type: ObjectId, ref: 'Skill' }],

    facebook_profile: String,
    linked_in_profile: String,
    twitter_profile: String,
    instagram_profile: String,
    email: String,

    username: String,
    password: String,
}), "users")

module.exports = User