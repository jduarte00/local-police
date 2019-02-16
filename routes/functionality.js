const express = require("express");
const funcRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

const Incident = require("../models/Incident");
const User = require("../models/User");

const uploadCloud = require("../config/cloudinary");

funcRoutes.get("/", (req, res, next) => {
  Incident.find().then(incidents => {
    const totalIncidents = incidents.length;
    const user = req.user;
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


    res.render("index", {graphByDelegacionLabels, graphByDelegacionData, totalIncidents, nombresDeDelegaciones,user});
  
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
  const coloniaSinEspacios = quitarEspacios(colonia,);

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
  const user = req.user;

  const messagesArray = {
    "alvaro" : "Está conformada por 257 colonias, fraccionamientos y barrios, siendo los más importantes: San Ángel, San Ángel Inn, Tlacopac (que significa lugar entre las jaras o carrizos), Ermita, Chimalistac, Guadalupe Inn, Florida, Jardines del Pedregal, y la mayoría de las colonias que forman la zona de Santa Fe. Además, esta jurisdicción cuenta con poblados de características rurales como San Bartolo Ameyalco y Santa Rosa Xochiac.",
    "azcapotzalco": "Muchas de las colonias actuales de la delegación tienen su origen en antiguos barrios que datan de la época prehispánica y colonial. Tal es el caso de San Miguel Amantla, San Pedro Xalpa, San Juan Tlihuaca, Santiago Ahuizotla, Santa Lucía Tomatlán, Santa Cruz Acayucan, San Francisco Tetecala, Santa María Malinalco, San Lucas Atenco, San Sebastián, Santo Tomás, Santa Catarina, San Andrés, Santa Bárbara, San Martín Xochinahuac, San Francisco Xocotitla, San Andrés de las Salinas, Santa Apolonia Tezcolco, San Marcos Ixquitlán, San Simón y Santo Domingo Huexotitlán. Muchos de ellos, convertidos en colonias, conservan su traza característica con calles y callejones estrechos",
    "benito": "Fue creada a principios de los años cuarenta, pero tomó sus límites territoriales el 29 de diciembre de 1970. Se encuentra en la región central de la ciudad y ocupa 26,63 km² a 2.232 msnm. Al norte, sus alcaldías vecinas son Miguel Hidalgo y Cuauhtémoc; al poniente la alcaldía Álvaro Obregón, al sur la alcaldía de Coyoacán y Álvaro Obregón, y al oriente las alcaldías de Iztacalco e Iztapalapa. La posición céntrica de la alcaldía Benito Juárez la convierte en cruce de caminos entre las diversas zonas de la ciudad, por lo mismo cuenta con abundantes vías de comunicación. ",
    "coyoacan": "Fue creada a principios de los años cuarenta, pero tomó sus límites territoriales el 29 de diciembre de 1970. Se encuentra en la región central de la ciudad y ocupa 26,63 km² a 2.232 msnm. Al norte, sus alcaldías vecinas son Miguel Hidalgo y Cuauhtémoc; al poniente la alcaldía Álvaro Obregón, al sur la alcaldía de Coyoacán y Álvaro Obregón, y al oriente las alcaldías de Iztacalco e Iztapalapa. La posición céntrica de la alcaldía Benito Juárez la convierte en cruce de caminos entre las diversas zonas de la ciudad, por lo mismo cuenta con abundantes vías de comunicación. ",
    "cuajimalpa": "La Alcaldía de Cuajimalpa de Morelos se ubica al poniente de la capital mexicana. Para el 2010 contaba con una población de 186,391 habitantes, la cual representó el 2.1% de la población en Ciudad de México.4​ Se divide territorialmente en 44 colonias y 59 Distritos Electorales.5​ En el año 2016, la ALDF incorporó a su lista de Pueblos Originarios, del todavía entonces Distrito Federal, a los pueblos de San Mateo Tlaltenango, San Lorenzo Acopilco, San Pedro Cuajimalpa y San Pablo Chimalpa6​ ubicados en esta demarcación.",
    "cuahutemoc": "Colinda al norte con las demarcaciones territoriales de Azcapotzalco y Gustavo A. Madero, al sur con Iztacalco y Benito Juárez, al poniente con Miguel Hidalgo y al oriente con Venustiano Carranza. Es su nombre un reconocimiento al tlatoani mexica Cuauhtémoc, quien luchó en la batalla de México-Tenochtitlan. Esta demarcación abarca un total de 34 colonias.",
    "gustavo": "Lleva el nombre de un político mexicano que participó en la Revolución Mexicana y quien fuera hermano del presidente Francisco I. Madero. Es la segunda alcaldía más poblada de la ciudad y anteriormente se le conocía como Tepeyac o Guadalupe Hidalgo. ",
    "iztacalco": "Localizada en la zona centro-oriente-SUR del Distrito Federal, limita al norte con las demarcaciones territoriales de Venustiano Carranza y Cuauhtémoc, al poniente con Benito Juárez, al sur con Iztapalapa y al oriente con el municipio de Nezahualcóyotl en el Estado de México. Es la delegación más pequeña de las dieciséis que comparten el territorio capitalino, con apenas 23,3 kilómetros cuadrados que albergan una población cercana a los 400 mil habitantes.",
    "iztapalapa": "Posee una superficie algo mayor a 116 km² y se localiza en el oriente de la capital mexicana, ocupando la porción sur del vaso del lago de Texcoco. En el censo de población y vivienda realizado por el INEGI en el año 2010 registró una población de 1 815 786 habitantes,3​ con esto es la demarcación más poblada de todo el país.",
    "magdalena": "Localizada al sur-poniente. Limita al norte con la Alcaldía de Álvaro Obregón, al oeste con el Estado de La Alcaldía de La Magdalena Contreras es uno de los principales pulmones verdes de la capital debido a que es una de las delegaciones con más áreas verdes en la CDMX; cuenta con importantes lugares de interés social, turístico, ecológico, cultural y religioso. Por la delegación corre el último río vivo de la ciudad, el cual lleva por nombre Río Magdalena.México y al sur con la Alcaldía de Tlalpan.",
    "miguel": "Colinda al norte con la delegación Azcapotzalco, al oriente con Cuauhtémoc, al suroriente con Benito Juárez, al sur con Álvaro Obregón y al poniente con Cuajimalpa y con los municipios de Naucalpan y Huixquilucan del estado de México. Presenta un clima templado, con lluvias en verano. El relieve del territorio es básicamente plano al norte y con colinas, barrancas y montes al poniente, que es la salida hacia Toluca.",
    "milpa": "Se encuentra situada el extremo sudoriental de esta entidad federativa, en las estribaciones de la sierra de Ajusco-Chichinauhtzin que separa al estado de Morelos y la capital mexicana. Con una superficie de 228 kilómetros cuadrados es la segunda de las demarcaciones territoriales capitalinas y constituye una importante reserva ambiental en el centro del país.",
    "tlahuac": "Su territorio comprende más de 83 km2 y se localiza en el sureste de la capital mexicana, enmarcado por la sierra de Santa Catarina al norte y el Teuhtli al sur. El centro corresponde a los vasos lacustres de Xochimilco y Chalco. De estos lagos se conservan sólo los canales de la zona chinampera y los humedales.",
    "tlalpan": "Tlalpan es una de las 16 demarcaciones territoriales de la Ciudad de México. Su territorio representa el 20.7 % del total de la ciudad, siendo la delegación con mayor extensión territorial. Más del 80 por ciento de su territorio es suelo de conservación, ofreciendo importantes servicios ambientales como son: recargas de los mantos acuíferos, generación de oxígeno y captura de bióxido de carbono. ",
    "venustiano": " Venustiano Carranza se encuentra en la zona centro oriente de la Ciudad de México. Colinda al norte con la delegación Gustavo A. Madero, al poniente con la delegación Cuauhtémoc, al sur con la delegación Iztacalco y al oriente con el municipio de Nezahualcóyotl. Este nombre fue dado en honor a Venustiano Carranza, jefe revolucionario que promulgó la Constitución Mexicana de 1917. Su emblema representa el símbolo del pueblo Xochiacán, cuya imagen aparece en el Códice Mendoza (o también llamado Mendocino) en donde la flor significa: 'lugar de flores fragantes'.",
    "xochimilco": "Se localiza en el sureste de la capital mexicana, y posee una superficie de 122 km².4​ La palabra Xochimilco viene del idioma náhuatl; xōchi- 'flor', mīl- 'tierra de labranza' y -co postposición de lugar, comúnmente traducido como 'la sementera de flores'."
  }

  const selectedMessage = messagesArray[delegacionName];

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
    
    console.log(selectedMessage);
    res.render("func/delegacion", { delegacionCompleteName, totalIncidents, recomendacion, tablaColonias, graphByTypeLabels, graphByTypeData, graphByDateLabels, graphByDateData, graphByColoniaLabels, graphByColoniaData, selectedMessage });
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
    const user = req.user;

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

    res.render("func/colonia", {user,coloniaCompleteName,totalIncidents, graphByTypeLabels, graphByTypeData, graphByDateLabels, graphByDateData, recomendacion, delegacionName})
  })
});


module.exports = funcRoutes;
