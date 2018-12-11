var mongoose = require("mongoose")
var Schema = mongoose.Schema

var User = mongoose.model("users", new Schema ({
    firstname: String,
    lastname: String,
    nickname: String,

    email: String,
    password: String,

    address: {
        street: String,
        postcode: String,
        city: String,
        country: String
    },

    birthdate: Date,
    profession: String,
    country2: String,

    languages: Array,
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],

    profilepic: String,
    governmentId: String,

    question1: String,
    question2: String,
    question3: String, 

    start_date: Date,
    end_date: Date,

    facebook_profile: String,
    linked_in_profile: String,
    twitter_profile: String,
    instagram_profile: String,

}), "users")

module.exports = User