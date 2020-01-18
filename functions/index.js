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

var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

app.post('/transfer', (req, res) => {
    var data = req.body;

    console.log(data);

    let db = admin.firestore();
    var deebee = db.collection('users');

    var amount = data['amount'];
    var recipient = data['recipient'].toLowerCase();
    var time = {
        'year': new Date().getFullYear(),
        'month': months[new Date().getMonth()],
        'day': new Date().getDate()
    };
    var from = data['from'];


    //deebee.doc(from).get().then((peopleRef) => {

    // CHECK AUTHORIZED RECIPIENT!!!!

    deebee.where('name', '==', recipient).get()
      .then(recipient_snapshot => {

        if (recipient_snapshot.empty) {
          res.send({'error': 'Recipient not found!'});
        }

        console.log('Recipient data', recipient_snapshot.docs[0].id)

        var recipient_user = recipient_snapshot.docs[0].data();
        var recipient_id = recipient_snapshot.docs[0].id;

        deebee.doc(from).get().then(doc => {
            if (!doc.exists) {
              res.send({'error': 'Access Denied'})
            } else {
              console.log('Document data:', doc.data());

              var from_user = doc.data();

              console.log('Authorization', from_user['authorized_recipients'], recipient_id);

              if (from_user['authorized_recipients'].indexOf(recipient_id) != -1) {

                  console.log('From user amount:', from_user['accounts']['Chequing Account'], amount);

                  if (from_user['accounts']['Chequing Account'] - amount > 0) {
                      console.log('Transfer approved', from_user['transactions'], recipient_user['transactions']);

                      var transaction_from_data = {
                            'name': '[MONEY TRANSFER] To '+ recipient,
                            'location': 'CANADA',
                            'timestamp': time,
                            'amount': -amount,
                            'category': 'BANKING'
                        };

                      var transaction_to_data = {
                            'name': '[MONEY TRANSFER] From '+ from_user['name'],
                            'location': 'CANADA',
                            'timestamp': time,
                            'amount': amount,
                            'category': 'BANKING'
                        };

                      from_user['accounts']['Chequing Account'] -= amount;
                      from_user['transactions'].push(transaction_from_data);

                      recipient_user['accounts']['Chequing Account'] += amount;
                      recipient_user['transactions'].push(transaction_to_data);


                      deebee.doc(recipient_id).set(recipient_user).then(() => {
                          deebee.doc(from).set(from_user).then(() => {
                              res.send({'status': 'Executed'})
                          });
                      });

                  } else {
                     res.send({'error': 'Insufficient funds!'})
                  }


              } else {
                  res.send({'error': 'Recipient not preauthorized!'})
              }
            }
          })
          .catch(err => {
              console.log(err);
              res.send({'error': 'An error occured'})
          })


      })
      .catch(err => {
        console.log('Error getting documents', err);
      });

    //});
});

app.post('/login', (req, res) => {

    var data = req.body

    console.log(data);

    let db = admin.firestore();
    var deebee = db.collection('users');

    deebee.doc(data['usercode'].toLowerCase()).get().then(doc => {
        if (!doc.exists) {
          res.send({'error': 'Access Denied'})
        } else {
          console.log('Document data:', doc.data());

          var out = doc.data();
          out['error'] = '';

          res.send(JSON.stringify(out))

        }
      })
      .catch(err => {
          console.log(err);
          res.send({'error': 'Access Denied'})
      });


});

exports.api = functions.https.onRequest(app);