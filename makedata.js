const admin = require('firebase-admin');

// Load your Firebase Admin SDK service account key
// Ensure the path points to your actual JSON file downloaded from Firebase
const serviceAccount = require('./ichkanndasallesnichtmehr-cb7be-firebase-adminsdk-fp5yx-b7123754c6.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ichkanndasallesnichtmehr-cb7be-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

function generateRandomEC() {
    return Math.floor(50 + Math.random() * (500 - 50)); // Generates a random EC value between 50 and 500
}

function createMockData() {
    for (let i = 1; i <= 100; i++) {
        const machineData = {};
        // Generate EC1-6 values between 100 and 500
        for (let ecIndex = 1; ecIndex <= 6; ecIndex++) {
            machineData[`ec${ecIndex}`] = Math.floor(100 + Math.random() * (500 - 100));
        }
        // Generate Timestamps 1-5 values between 7 and 18
        for (let tsIndex = 1; tsIndex <= 5; tsIndex++) {
            machineData[`Timestamp${tsIndex}`] = Math.floor(7 + Math.random() * (18 - 7));
        }
        // Generate a temperature value between 100 and 1000
        machineData['temperature'] = Math.floor(100 + Math.random() * (1000 - 100));

        // Use `set` to update or create the data at the specified path
        db.ref(`maschines/${i}`).set(machineData, (error) => {
            if (error) {
                console.log(`Data for machine ${i} could not be saved.`, error);
            } else {
                console.log(`Data for machine ${i} saved successfully.`);
            }
        });
    }
}

createMockData();
