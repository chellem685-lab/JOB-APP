import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDepBXRz5dJL7tOiDgIMU34cWa2n_x2WK4",
    authDomain: "job-application-d7c70.firebaseapp.com",
    projectId: "job-application-d7c70",
    storageBucket: "job-application-d7c70.firebasestorage.app",
    messagingSenderId: "19698870315",
    appId: "1:19698870315:web:50d2a426575c4e976fe26e",
    measurementId: "G-ST86REJG12"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };