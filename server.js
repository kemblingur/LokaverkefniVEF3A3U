// Nauðsynjar fyrir serverinn
//Express er vefþjónninn sem sér um að þjóna upp vefsíðunni
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
//mongodb er gagnagrunnsþjónninn sem ég vinn með í þessu verkefni
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
//Statísk glóbalbreyta sem geymir nafni á "collectioninu" sem ég ætla að nota
var CONTACTS_COLLECTION = "contacts";
//Stilli express þjónin
var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
//skilgreini DB breytina utan scope til þess að geta gengið að henni hvar sem er
var db;
//Tengi mig við gagnagrunninn
// Gagnagrunnurinn er hýstur hjá Heroku, á sama stað og APInn sjálfur
// Það eru ekki notaðar neinar ipaddressur eða lykilorð þess vegna
// process.env.MONGODB_URI er umhverfisbreyta á vegum Heroku sem geymir
// staðsetningu vefþjónsis og finnst þegar ég ýti verkefninu á Heroku
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  // Logga error í console-ið ef það er eitthvað
  // Conoleið er síðan aðgengilegt á mínu svæði á heroku
  if (err) {
    console.log(err);
    //drep forritið
    process.exit(1);
  }
  //Set gagnagrunninn í DB breytuna
  db = database;
  console.log("Database connection ready");
  //tengi við port 8080
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

//Hérna er general vandamálafunction. tekur við svari, ástæðu, skilaboðum og kóða(HTTP)
function errorHandler(res, reason, message, code) {
  // Logga bobban í consoleið
  console.log("BOBBI: " + reason);
  // sendi kóðann áfram ef það er eitthver, annars default 500. Sendi síðan bobban með því
  res.status(code || 500).json({"bobbi": message});
}

//Routerinn er hér fyrir neðan
//Basic get sem skilar til baka öllum tengiliðum
app.get("/contacts", function(req, res) {
  //Byð gagnagrunninn um að láta mig fá allt "collectionið" sem væri líklega líkast töflu í MySQL
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    //Meðhöndla vandamál
    if (err) {
      errorHandler(res, err.message, "Fann ekki tengiliðina");
    } else {
      //Sendi annars 200 status og allt er good
      res.status(200).json(docs);  
    }
  });
});
//Skilgreini hvað á að gerast þegar það er póstað á /contacts
//surprise: það er fyrir nýja tengiliði
app.post("/contacts", function(req, res) {
  //tek út upplýsingarnar sem ég fæ frá Angular
  var newContact = req.body;
  //tek inn dagsetninguna. newContact er object útaf því að req.body er object
  newContact.createDate = new Date();
  //smá tékk hvort það sé allavega nafn til staðar
  if (!(req.body.firstName)) {
    //ef ekki, vandamál
    errorHandler(res, "Smá bobbi hérna", "Kommon, það þarf allavega að vera nafn", 400);
  }
  //Hendi inn einni línu í collectionið
  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    //ef vandamál, láta vita
    if (err) {
      errorHandler(res, err.message, "Það fokkaðist eitthvað upp að búa til tengiliðinn");
    } else {
      //Annars senda ok
      res.status(201).json(doc.ops[0]);
    }
  });
});

//hér fyrir neðan eru routes sem eiga við staka tengiliði
//fá til baka einn stakan tengilið
app.get("/contacts/:id", function(req, res) {
  //byð gagnagrunninn um að senda mér hann úr collectioninu út frá ID
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    // ef error, láta vita
    if (err) {
      errorHandler(res, err.message, "Náði ekki að fá nákvæmlega þennan tengilið");
    } else {
      // annars 200
      res.status(200).json(doc);  
    }
  });
});
// uppfæri einn tengilið útfrá ID
app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      errorHandler(res, err.message, "Gat af einhverri ástæðu ekki uppfært nákvæmlega þennan tengilið");
    } else {
      res.status(204).end();
    }
  });
});
//Eyði contact útfrá ID
app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      errorHandler(res, err.message, "Náði ekki að eyða þessum tengilið");
    } else {
      res.status(204).end();
    }
  });
});