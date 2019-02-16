const express = require("express");
const funcRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

const Incident = require("../models/Incident");
const User = require("../models/User");

const uploadCloud = require("../config/cloudinary");

funcRoutes.get("/", (req, res, next) => {
  Incident.find().then(incidents => {
    const totalIncidents = incidents.length;

    const conteoPorDelegacion = {
      "alvaro" : 0,
    "azcapotzalco":0,
    "benito": 0,
    "coyoacan":0,
    "cuajimalpa": 0,
    "cuahutemoc":0,
    "gustavo":  0,
    "iztacalco":0,
    "iztapalapa":0,
    "magdalena": 0,
    "miguel": 0,
    "milpa": 0,
    "tlahuac":0,
    "tlalpan":0,
    "venustiano": 0,
    "xochimilco":0
    }

    incidents.forEach(current=>{
      conteoPorDelegacion[current.delegacion] += 1;
    })

   
    
    
    const nombresDeDelegaciones = [
      {"href": "alvaro",
       "nombre": "Álvaro Obregón"},
      {"href": "azcapotzalco",
       "nombre": "Azcapotzalco"},
      {"href": "benito",
       "nombre": "Benito Juárez"},
      {"href": "coyoacan",
       "nombre": "Coyoacán"},
      {"href": "cuajimalpa",
       "nombre": "Cuajimapla de Morelos"},
      {"href": "cuahutemoc",
       "nombre": "Cuauhtémoc"},
      {"href": "gustavo",
       "nombre": "Gustavo A. Madero"},
      {"href": "iztacalco",
       "nombre": "Iztacalco"},
      {"href": "iztapalapa",
       "nombre": "Iztapalapa"},
      {"href": "magdalena",
       "nombre": "Magdalena Contreras"},
      {"href": "miguel",
       "nombre": "Miguel Hidalgo"},
      {"href": "milpa",
       "nombre": "Milpa Alta"},
      {"href": "tlahuac",
       "nombre": "Tláhuac"},
      {"href": "tlalpan",
       "nombre": "Tlalpan"},
      {"href": "venustiano",
       "nombre": "Venustiano Carranza"},
      {"href": "xochimilco",
       "nombre": "Xochimilco"}
    ];

    const nombreDelegacion = {
      "alvaro" : "Álvaro Obregón",
    "azcapotzalco": "Azcapotzalco",
    "benito": "Benito Juárez",
    "coyoacan": "Coyoacán",
    "cuajimalpa": "Cuajimapla de Morelos",
    "cuahutemoc": "Cuauhtémoc",
    "gustavo": "Gustavo A. Madero",
    "iztacalco": "Iztacalco",
    "iztapalapa": "Iztapalapa",
    "magdalena": "Magdalena Contreras",
    "miguel": "Miguel Hidalgo",
    "milpa": "Milpa Alta",
    "tlahuac": "Tláhuac",
    "tlalpan": "Tlalpan",
    "venustiano": "Venustiano Carranza",
    "xochimilco": "Xochimilco"
    }

    let graphByDelegacionLabelsTemp = Object.values(nombreDelegacion);
    let graphByDelegacionDataTemp = Object.values(conteoPorDelegacion);

    let graphByDelegacionLabels = JSON.stringify(graphByDelegacionLabelsTemp);
    let graphByDelegacionData = JSON.stringify(graphByDelegacionDataTemp);


    res.render("index", {graphByDelegacionLabels, graphByDelegacionData, totalIncidents, nombresDeDelegaciones});
  
  });
});

funcRoutes.get(
  "/newIncident",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const user = req.user;
    res.render("func/incident.hbs", { user });
  }
);

funcRoutes.post("/newIncident", (req, res, next) => {
  const delegacion = req.body.delegacion;
  const colonia = req.body.colonia;
  const type = req.body.type;
  const oficialNumber = req.body.oficialNumber;
  const date = req.body.date;
  const additionalDetails = req.body.additionalDetails;
  const userID = req.user._id;
  
  const quitarEspacios = (string) => {
    let arrayOfLetters = string.split("");
    let arrayWithoutSpaces = [];
    arrayOfLetters.forEach(letter => {
      if (letter === " "){
        arrayWithoutSpaces.push("-");
      } else {
        arrayWithoutSpaces.push(letter);
      }
    });
    return arrayWithoutSpaces.join("");
  }
  const coloniaSinEspacios = quitarEspacios(colonia);

  const newIncident = new Incident({
    delegacion,
    colonia,
    coloniaSinEspacios,
    type,
    oficialNumber,
    date,
    additionalDetails
  });

  newIncident.save().then(incident => {
    const incidentID = incident._id;
    User.findById(userID).then(user => {
      user.reportedIncidents.push(incidentID);
      user.save().then(user => {
        res.redirect("/");
      });
    });
  });
});

funcRoutes.get(
  "/controlPanel",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const userId = req.user._id;
    const user = req.user;
    User.findById(userId)
      .populate("reportedIncidents")
      .then(user => {
        let incidents = user.reportedIncidents;
        res.render("func/control-panel", { incidents, user });
      });
  }
);

funcRoutes.get(
  "/changeProfile",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const user = req.user;
    res.render("func/profile", { user });
  }
);

funcRoutes.post(
  "/changeProfile",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const user = req.user;
    const newUsername = req.body.username;
    const newMail = req.body.mail;

    if (newUsername !== user.username || newMail !== user.mail) {
      User.findById(user._id).then(user => {
        user.username = newUsername;
        user.mail = newMail;
        user.save().then(user => {
          res.render("func/profile", {
            message: "Información actualizada correctamente",
            user
          });
        });
      });
    } else {
      res.render("func/profile", {
        message: "No hiciste ningún cambio en tu información!",
        user
      });
    }
  }
);

funcRoutes.get(
  "/changeImage",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const user = req.user;
    res.render("func/change-picture", { user });
  }
);

funcRoutes.post(
  "/changeImage",
  ensureLogin.ensureLoggedIn(),
  uploadCloud.single("photo"),
  (req, res, next) => {
    const user = req.user._id;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    User.findById(user).then(user => {
      user.imgName = imgName;
      user.imgPath = imgPath;
      user.save().then(user => {
        res.redirect("/");
      });
    });
  }
);

funcRoutes.get(
  "/incidentes/view/:id",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const incidenteID = req.params.id;
    const user = req.user;
    Incident.findById(incidenteID).then(incident => {
      res.render("func/incident-detail", { incident, user });
    });
  }
);

funcRoutes.get("/delegacion/:nombre", (req, res, next) => {
  let delegacionName = req.params.nombre;

  const nombreDelegacion = {
    "alvaro" : "Álvaro Obregón",
  "azcapotzalco": "Azcapotzalco",
  "benito": "Benito Juárez",
  "coyoacan": "Coyoacán",
  "cuajimalpa": "Cuajimapla de Morelos",
  "cuahutemoc": "Cuauhtémoc",
  "gustavo": "Gustavo A. Madero",
  "iztacalco": "Iztacalco",
  "iztapalapa": "Iztapalapa",
  "magdalena": "Magdalena Contreras",
  "miguel": "Miguel Hidalgo",
  "milpa": "Milpa Alta",
  "tlahuac": "Tláhuac",
  "tlalpan": "Tlalpan",
  "venustiano": "Venustiano Carranza",
  "xochimilco": "Xochimilco"
  }

  let delegacionCompleteName = nombreDelegacion[delegacionName];
  


  Incident.find({ delegacion: delegacionName }).then(incidents => {
    const totalIncidents = incidents.length;
    const recomendaciones = [
      [3, "Esta leve, vete guapo"],
      [6, "Aguas!!, no te lleves el Rolex"],
      [10, "Esta cabrón, llévate la playera del América"]
    ];

    let recomendacion;


    recomendaciones.some(current => {
      recomendacion = current[1];
      return totalIncidents < current[0]
    });
    

    let temporalObjectOfTypes = {
      "Robo a transeúnte con violencia": 0,
      "Robo a transeúnte sin violencia": 0,
      "Robo a negocio con violencia": 0,
      "Robo a negocio sin violencia": 0,
      "Robo de automóvil con violencia": 0,
      "Robo de automóvil sin violencia": 0,
      "Robo a casa habitación con violencia": 0,
      "Robo a casa habitación sin violencia": 0,
      "Daño a propiedad ajena": 0,
      "Lesiones culposas": 0,
      "Vandalismo": 0
    };

    incidents.forEach(current => {
      let type = current.type;
      temporalObjectOfTypes[type] += 1;
    });

    let objectOfTypes = [
      Object.keys(temporalObjectOfTypes),
      Object.values(temporalObjectOfTypes)
    ];

    let graphByTypeLabels = JSON.stringify(objectOfTypes[0]);
    let graphByTypeData = JSON.stringify(objectOfTypes[1]);

    let temporalObjectOfDates = {
      enero: 0,
      febrero: 0,
      marzo: 0,
      abril: 0,
      mayo: 0,
      junio: 0,
      julio: 0,
      agosto: 0,
      septiembre: 0,
      octubre: 0,
      noviembre: 0,
      diciembre: 0
    };

    incidents.forEach(current => {
      let month = current.date.getMonth();
      if (month === 0) {
        temporalObjectOfDates["enero"] += 1;
      } else if (month === 1) {
        temporalObjectOfDates["febrero"] += 1;
      } else if (month === 2) {
        temporalObjectOfDates["marzo"] += 1;
      } else if (month === 3) {
        temporalObjectOfDates["abril"] += 1;
      } else if (month === 4) {
        temporalObjectOfDates["mayo"] += 1;
      } else if (month === 5) {
        temporalObjectOfDates["juni"] += 1;
      } else if (month === 6) {
        temporalObjectOfDates["julio"] += 1;
      } else if (month === 7) {
        temporalObjectOfDates["agosto"] += 1;
      } else if (month === 8) {
        temporalObjectOfDates["septiembre"] += 1;
      } else if (month === 9) {
        temporalObjectOfDates["octubre"] += 1;
      } else if (month === 10) {
        temporalObjectOfDates["noviembre"] += 1;
      } else if (month === 11) {
        temporalObjectOfDates["diciembre"] += 1;
      }
    });

    let objectOfDates = [
      Object.keys(temporalObjectOfDates),
      Object.values(temporalObjectOfDates)
    ];

    let graphByDateLabels = JSON.stringify(objectOfDates[0]);
    let graphByDateData = JSON.stringify(objectOfDates[1]);

    let temporalObjectOfColonias = incidents.reduce((accum, current) => {
      if (!accum[current.colonia]) {
        accum[current.colonia] = 1;
        return accum;
      } else {
        accum[current.colonia] += 1;
        return accum;
      }
    }, {});

    let graphByColoniaLabels = JSON.stringify(Object.keys(temporalObjectOfColonias)); 
    let graphByColoniaData = JSON.stringify(Object.values(temporalObjectOfColonias)); 

    

    let coloniasSinEspaciosObject = incidents.reduce((accum, current) => {
      if (!accum[current.colonia]) {
          accum[current.colonia] = current.coloniaSinEspacios;
        return accum;
      }
    }, {}); 
    
    //console.log(objectOfTypes, temporalObjectOfDates, temporalObjectOfColonias);

    const nombres = Object.keys(coloniasSinEspaciosObject);

    const tablaColonias = nombres.map(current=>{
      let objetito ={
        "href": coloniasSinEspaciosObject[current],
        "nombre": current
      };
      return objetito;
    })
    
    
    res.render("func/delegacion", { delegacionCompleteName, totalIncidents, recomendacion, tablaColonias, graphByTypeLabels, graphByTypeData, graphByDateLabels, graphByDateData, graphByColoniaLabels, graphByColoniaData });
  });
});

funcRoutes.get("/incidentes/delete/:id", (req, res, next)=>{
  const incidentID = req.params.id;
  Incident.deleteOne({_id: incidentID}).then(err=>{
    res.redirect("/controlPanel");
  })
});

funcRoutes.get("/colonia/:name", (req, res, next)=>{
  const coloniaName = req.params.name;
  Incident.find({coloniaSinEspacios: coloniaName}).then(incidents => {
    const coloniaCompleteName = incidents[0].colonia;
    const totalIncidents = incidents.length;
    const delegacionName = incidents[0].delegacion;

    const recomendaciones = [
      [3, "Esta leve, vete guapo"],
      [6, "Aguas!!, no te lleves el Rolex"],
      [10, "Esta cabrón, llévate la playera del América"]
    ];

    let recomendacion;


    recomendaciones.some(current => {
      recomendacion = current[1];
      return totalIncidents < current[0]
    });

    let temporalObjectOfTypes = {
      "Robo a transeúnte con violencia": 0,
      "Robo a transeúnte sin violencia": 0,
      "Robo a negocio con violencia": 0,
      "Robo a negocio sin violencia": 0,
      "Robo de automóvil con violencia": 0,
      "Robo de automóvil sin violencia": 0,
      "Robo a casa habitación con violencia": 0,
      "Robo a casa habitación sin violencia": 0,
      "Daño a propiedad ajena": 0,
      "Lesiones culposas": 0,
      "Vandalismo": 0
    };

    incidents.forEach(current => {
      let type = current.type;
      temporalObjectOfTypes[type] += 1;
    });

    let objectOfTypes = [
      Object.keys(temporalObjectOfTypes),
      Object.values(temporalObjectOfTypes)
    ];

    let graphByTypeLabels = JSON.stringify(objectOfTypes[0]);
    let graphByTypeData = JSON.stringify(objectOfTypes[1]);

    let temporalObjectOfDates = {
      enero: 0,
      febrero: 0,
      marzo: 0,
      abril: 0,
      mayo: 0,
      junio: 0,
      julio: 0,
      agosto: 0,
      septiembre: 0,
      octubre: 0,
      noviembre: 0,
      diciembre: 0
    };

    incidents.forEach(current => {
      let month = current.date.getMonth();
      if (month === 0) {
        temporalObjectOfDates["enero"] += 1;
      } else if (month === 1) {
        temporalObjectOfDates["febrero"] += 1;
      } else if (month === 2) {
        temporalObjectOfDates["marzo"] += 1;
      } else if (month === 3) {
        temporalObjectOfDates["abril"] += 1;
      } else if (month === 4) {
        temporalObjectOfDates["mayo"] += 1;
      } else if (month === 5) {
        temporalObjectOfDates["juni"] += 1;
      } else if (month === 6) {
        temporalObjectOfDates["julio"] += 1;
      } else if (month === 7) {
        temporalObjectOfDates["agosto"] += 1;
      } else if (month === 8) {
        temporalObjectOfDates["septiembre"] += 1;
      } else if (month === 9) {
        temporalObjectOfDates["octubre"] += 1;
      } else if (month === 10) {
        temporalObjectOfDates["noviembre"] += 1;
      } else if (month === 11) {
        temporalObjectOfDates["diciembre"] += 1;
      }
    });

    let objectOfDates = [
      Object.keys(temporalObjectOfDates),
      Object.values(temporalObjectOfDates)
    ];

    let graphByDateLabels = JSON.stringify(objectOfDates[0]);
    let graphByDateData = JSON.stringify(objectOfDates[1]);

    res.render("func/colonia", {coloniaCompleteName,totalIncidents, graphByTypeLabels, graphByTypeData, graphByDateLabels, graphByDateData, recomendacion, delegacionName})
  })
});


module.exports = funcRoutes;
