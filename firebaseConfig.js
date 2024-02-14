const admin = require('firebase-admin');

// Replace './service-account-file.json' with the path to your Firebase service account file
const serviceAccount = require('./ichkanndasallesnichtmehr-cb7be-firebase-adminsdk-fp5yx-b7123754c6.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ichkanndasallesnichtmehr-cb7be-default-rtdb.europe-west1.firebasedatabase.app"
});

module.exports = admin.database();
