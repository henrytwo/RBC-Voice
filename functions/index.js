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
];



app.post('/transfer', (req, res) => {

    function capitalize(s) {
        var i = s.split(' ');
        var out = '';

        for (var z = 0 ; z < i.length; z++) {

            var k = i[z];

            out += k.charAt(0).toUpperCase() + k.substr(1)
        };

        return out.trim();
    }

    var data = req.body;

    console.log(data);

    let db = admin.firestore();
    var deebee = db.collection('users');

    var amount = parseFloat(data['amount'].toString().replace('$', '').replace(',', ''));
    var recipient = data['recipient'].toLowerCase();
    var time = {
        'year': new Date().getFullYear(),
        'month': months[new Date().getMonth()],
        'day': new Date().getDate()
    };
    var from = data['from'];

    console.log('Adjusted amount: ', amount);


    //deebee.doc(from).get().then((peopleRef) => {

    // CHECK AUTHORIZED RECIPIENT!!!!

    deebee.where('first_name', '==', capitalize(recipient.split(' ')[0].toLowerCase())).get()
      .then(recipient_snapshot => {

        if (recipient_snapshot.empty) {
          res.send({'status': 'Sorry, I couldn\'t find anyone named ' + capitalize(recipient) + '! '});
        }

        console.log('Recipient data', recipient_snapshot.docs[0].id)

        var recipient_user = recipient_snapshot.docs[0].data();
        var recipient_id = recipient_snapshot.docs[0].id;

        deebee.doc(from).get().then(doc => {
            if (!doc.exists) {
              res.send({'status': 'Sorry, something went wrong. '})
            } else {
              console.log('Document data:', doc.data());

              var from_user = doc.data();

              console.log('Authorization', from_user['authorized_recipients'], recipient_id);

              if (from_user['authorized_recipients'].indexOf(recipient_id) != -1) {

                  console.log('From user amount:', from_user['accounts']['Chequing'], amount);

                  if (from_user['accounts']['Chequing'] - amount > 0) {
                      console.log('Transfer approved', from_user['transactions'], recipient_user['transactions']);

                      var transaction_from_data = {
                            'name': '[MONEY TRANSFER] To '+ capitalize(recipient),
                            'location': 'CANADA',
                            'timestamp': time,
                            'amount': -amount,
                            'category': 'BANKING'
                        };

                      var transaction_to_data = {
                            'name': '[MONEY TRANSFER] From '+ capitalize(from_user['name']),
                            'location': 'CANADA',
                            'timestamp': time,
                            'amount': amount,
                            'category': 'BANKING'
                        };

                      from_user['accounts']['Chequing'] -= amount;
                      from_user['transactions'].push(transaction_from_data);

                      recipient_user['accounts']['Chequing'] += amount;
                      recipient_user['transactions'].push(transaction_to_data);


                      deebee.doc(recipient_id).set(recipient_user).then(() => {
                          deebee.doc(from).set(from_user).then(() => {
                              res.send({'status': 'Successfully transferred $' + amount.toString() + ' to ' + capitalize(recipient_user['name']) + '. Your new Chequing balance is $' + (from_user['accounts']['Chequing'] - amount).toString() + '. '})
                          });
                      });

                  } else {
                     res.send({'status': 'Sorry, I can\'t process the transfer to ' + capitalize(recipient_user['name']) + ' since you have insufficient funds. In order to transfer $' + amount.toString() + ', you will need an additional $' + (amount - from_user['accounts']['Chequing']).toString() + '. '})
                  }


              } else {
                  res.send({'status': 'Sorry, I can\'t process the transfer to' + capitalize(recipient_user['name']) + ' since they aren\'t listed as an authorized recipient. Please go to the RBC dashboard to change this setting. '})
              }
            }
          })
          .catch(err => {
              console.log(err);
              res.send({'status': 'Sorry, an unexpected error occurred. '})
          })


      })
      .catch(err => {
        console.log('Error getting documents', err);
        res.send({'status': 'Sorry, an unexpected error occurred.'})
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
          res.send({'status': 'Access Denied'})
        } else {
          console.log('Document data:', doc.data());

          var out = doc.data();
          out['status'] = '';

          res.send(JSON.stringify(out))

        }
      })
      .catch(err => {
          console.log(err);
          res.send({'status': 'Access Denied'})
      });


});

exports.api = functions.https.onRequest(app);