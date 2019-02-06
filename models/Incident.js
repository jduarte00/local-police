const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
    location: String,
    type: String,
    oficialNumber: String,
    date: Date,
    additionalDetails: String,
    socialGrade: 0
}, {
    timestamps:{
        createdAt: "created_at"
    }
});

const Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;

