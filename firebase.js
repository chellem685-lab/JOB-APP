import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBCb_nOhtBsOcRa37UjyH6eRn12X6zdryg",
    authDomain: "job-application-manageme-95a94.firebaseapp.com",
    projectId: "job-application-manageme-95a94",
    storageBucket: "job-application-manageme-95a94.firebasestorage.app",
    messagingSenderId: "814561625549",
    appId: "1:814561625549:web:9e20e5346e8b446650b084",
    measurementId: "G-Q7YVPQ0JX9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);