const express = require("express");
const funcRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

const Incident = require("../models/Incident");
const User = require("../models/User");

funcRoutes.get("/newIncident", ensureLogin.ensureLoggedIn(),(req, res, next) => {
  res.render("incident");
});

funcRoutes.post("/newIncident", (req, res, next)=>{
    const location = req.body.location;
    const type = req.body.type;
    const oficialNumber = req.body.oficialNumber;
    const date = req.body.date;
    const additionalDetails = req.body.additionalDetails;
    const userID = req.user._id;
    const newIncident = new Incident({
      location,
      type,
      oficialNumber,
      date,
      additionalDetails
    });
    newIncident.save().then(incident=>{
      const incidentID = incident._id;
      User.findById(userID).then(user=>{
        user.reportedIncidents.push(incidentID);
        user.save().then(user=>{
          res.redirect("/");
        });
      });
    });
});

funcRoutes.get("/controlPanel", ensureLogin.ensureLoggedIn(),(req, res, next) => {
  const userId = req.user._id;
  User.findById(userId).populate('reportedIncidents').then(user => {
    let incidents = user.reportedIncidents;
    res.render("control-panel", {incidents});
  })

});

module.exports = funcRoutes;