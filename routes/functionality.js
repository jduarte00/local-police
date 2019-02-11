const express = require("express");
const funcRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

const Incident = require("../models/Incident");
const User = require("../models/User");

const uploadCloud = require("../config/cloudinary");

funcRoutes.get("/newIncident", ensureLogin.ensureLoggedIn(),(req, res, next) => {
  const user = req.user;
  res.render("func/incident.hbs",{user});
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
  const user = req.user;
  User.findById(userId).populate('reportedIncidents').then(user => {
    let incidents = user.reportedIncidents;
    res.render("func/control-panel", {incidents, user});
  })

});

funcRoutes.get("/changeProfile", ensureLogin.ensureLoggedIn(), (req,res,next) => {
  const user = req.user;
  res.render("func/profile", {user});
});

funcRoutes.post("/changeProfile", ensureLogin.ensureLoggedIn(), (req,res,next) =>{
  const user = req.user;
  const newUsername = req.body.username;
  const newMail = req.body.mail;
  
  if (newUsername !== user.username || newMail!== user.mail){
    User.findById(user._id).then(user =>{
      user.username = newUsername;
      user.mail = newMail;
      user.save().then(user => {
        res.render("func/profile", {message: "Información actualizada correctamente", user});
      })
    });
  } else {
    res.render("func/profile", {message: "No hiciste ningún cambio en tu información!", user});
  }
  
  
});

funcRoutes.get("/changeImage", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const user = req.user;
  res.render("func/change-picture", {user});
});

funcRoutes.post("/changeImage", ensureLogin.ensureLoggedIn(), uploadCloud.single("photo"), (req, res, next) => {
  const user = req.user._id;
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  User.findById(user).then(user => {
    user.imgName = imgName;
    user.imgPath = imgPath;
    user.save().then(user => {
      console.log(user);
      res.redirect("/");
    })
  });
});

funcRoutes.get("/incidentes/view/:id", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const libroID = req.params.id;
  const user = req.user;
  Incident.findById(libroID).then(incident=>{
    res.render("func/incident-detail", {incident, user});
  })

}); 

module.exports = funcRoutes;