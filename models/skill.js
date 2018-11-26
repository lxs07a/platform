var mongoose = require("mongoose")
var Schema = mongoose.Schema

var Skill = mongoose.model("skills", new Schema ({
    skill: String
}), "skills")

module.exports = Skill