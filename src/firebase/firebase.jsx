import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC3FzezTBQA_DKnCkIMM7yuX7-xslK8O5I",
  authDomain: "exam-generator-748a3.firebaseapp.com",
  projectId: "exam-generator-748a3",
  storageBucket: "exam-generator-748a3.firebasestorage.app",
  messagingSenderId: "916438563685",
  appId: "1:916438563685:web:16b3c061bae2109e8bff8c",
  measurementId: "G-3ZGFZTK6K8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
    