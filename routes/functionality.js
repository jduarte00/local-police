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
    const delegacion = req.body.delegacion;
    const colonia = req.body.colonia;
    const type = req.body.type;
    const oficialNumber = req.body.oficialNumber;
    const date = req.body.date;
    const additionalDetails = req.body.additionalDetails;
    const userID = req.user._id;
    const newIncident = new Incident({
      delegacion,
      colonia,
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

funcRoutes.get("/delegacion/:nombre", (req, res, next) => {
  let delegacionName = req.params.nombre;
  Incident.find({delegacion: delegacionName}).then(incidents => {
    const totalIncidents = incidents.length;
    let temporalObjectOfTypes = {
      "Robo a transeúnte con violencia": 0,
          "Robo a transeúnte sin violencia":1,
       "Robo a negocio con violencia":0,
       "Robo a negocio sin violencia":0,
       "Robo de automóvil con violencia":0,
       "Robo de automóvil sin violencia":0,
       "Robo a casa habitación con violencia":0,
       "Robo a casa habitación sin violencia":0,
        "Daño a propiedad ajena":0,
        "Lesiones culposas":0,
        "Vandalismo":0
    };

    
    incidents.forEach(current => {
      let type = current.type;
      temporalObjectOfTypes[type] += 1;
    });

    let objectOfTypes = [
      Object.keys(temporalObjectOfTypes),
      Object.values(temporalObjectOfTypes)
    ]

    let temporalObjectOfDates = {
      "enero": 0,
"febrero": 0,
"marzo": 0,
"abril": 0,
"mayo": 0,
"junio": 0,
"julio": 0,
"agosto": 0,
"septiembre": 0,
"octubre": 0,
"noviembre": 0,
"diciembre": 0,
    };

    incidents.forEach(current => {
      let month = current.date.getMonth();
      if (month === 0) {
        temporalObjectOfDates["enero"] += 1;
      } else if (month === 1){
        temporalObjectOfDates["febrero"] += 1;
      } else if (month === 2){
        temporalObjectOfDates["marzo"] += 1;
      } else if (month === 3){
        temporalObjectOfDates["abril"] += 1;
      } else if (month === 4){
        temporalObjectOfDates["mayo"] += 1;
      }else if (month === 5){
        temporalObjectOfDates["juni"] += 1;
      }else if (month === 6){
        temporalObjectOfDates["julio"] += 1;
      }else if (month === 7){
        temporalObjectOfDates["agosto"] += 1;
      } else if (month === 8){
        temporalObjectOfDates["septiembre"] += 1;
      } else if (month === 9){
        temporalObjectOfDates["octubre"] += 1;
      } else if (month === 10){
        temporalObjectOfDates["noviembre"] += 1;
      } else if (month === 11){
        temporalObjectOfDates["diciembre"] += 1;
      }
    });

    let temporalObjectOfColonias = incidents.reduce((accum, current)=>{
      if (!accum[current.colonia]){
        accum[current.colonia] = 1;
        return accum;
      } else {
        accum[current.colonia] += 1;
        return accum;
      }
    },{});
    
    console.log(objectOfTypes, temporalObjectOfDates, temporalObjectOfColonias);

    
      let objectOfTypesLabels = objectOfTypes[0]
      let pruebin = JSON.stringify(objectOfTypes[0]);
      let pruebindos = JSON.stringify(objectOfTypes[1]);
    

    

   
  let testin = "hola"
    res.render("func/delegacion", {pruebin, pruebindos});
    
  })

});

module.exports = funcRoutes;