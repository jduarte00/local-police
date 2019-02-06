const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    mail: String,
    //Not sure about this...
   reportedIncidents: [{type: Schema.Types.ObjectId, ref: 'Incident'}], 
}, {
    timestamps:{
        createdAt: "created_at"
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

