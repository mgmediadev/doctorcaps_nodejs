const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyBetoWXk7bkej-OlExXx6iNi-s-vsK-aFY",
    authDomain: "doctor-caps.firebaseapp.com",
    databaseURL: "https://doctor-caps.firebaseio.com",
    projectId: "doctor-caps",
    storageBucket: "doctor-caps.appspot.com",
    messagingSenderId: "103802648278",
    appId: "1:103802648278:web:442a27dd17d34c900e3b77",
    measurementId: "G-96D4T907PY"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);