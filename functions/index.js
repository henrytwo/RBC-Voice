const admin = require('firebase-admin');
const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');

const app = express();

admin.initializeApp(functions.config().firebase);

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
//app.use(myMiddleware);

app.post('/login', (req, res) => {

    var data = req.body

    console.log(data);

    let db = admin.firestore();
    var deebee = db.collection('users');

    deebee.doc(data['usercode']).get().then(doc => {
        if (!doc.exists) {
          res.send("Fuck")
        } else {
          console.log('Document data:', doc.data());

          res.send(JSON.stringify(doc.data()))

        }
      })
      .catch(err => {
          console.log(err);
          res.send("Fuck")
      });


});

exports.api = functions.https.onRequest(app);