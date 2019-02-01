const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    mail: String,
    //Not sure about this...
   reportedIncidents: [String] 
}, {
    timestamps:{
        createdAt: "created_at"
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

