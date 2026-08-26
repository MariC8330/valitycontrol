import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


// CONFIGURAÇÃO FIREBASE

const firebaseConfig = {

  apiKey: "AIzaSyBbDl22bEZchepT4kGUs_YoFD8ul90BogA",

  authDomain: "valitycontrol.firebaseapp.com",

  projectId: "valitycontrol",

  storageBucket: "valitycontrol.firebasestorage.app",

  messagingSenderId: "100773453070",

  appId: "1:100773453070:web:5ee9ecf37a12c6a1a6cb5f",

  measurementId: "G-0QZ0LRZEMS"
};


// INICIALIZA FIREBASE

const app = initializeApp(firebaseConfig);


// SERVIÇOS

const auth = getAuth(app);

const db = getFirestore(app);


// DISPONIBILIZA GLOBALMENTE

window.firebaseAuth = auth;

window.firebaseDB = db;


// EXPORTA

export {
  auth,
  db
};