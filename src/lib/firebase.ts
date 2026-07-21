import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Config from firebase-applet-config.json for seamless standalone and Netlify export
const firebaseConfig = {
  projectId: "gen-lang-client-0871310780",
  appId: "1:170919002615:web:d8afe0b78179d0ef7aaef2",
  apiKey: "AIzaSyAAkKCLk0zPS5szTDRekmAW0mRXOXYF1J4",
  authDomain: "gen-lang-client-0871310780.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-141b3956-01f5-432b-9a72-c6fff21abc9e",
  storageBucket: "gen-lang-client-0871310780.firebasestorage.app",
  messagingSenderId: "170919002615",
  measurementId: "",
  oAuthClientId: "170919002615-93bs2tgab8obufhoju5v07rcp1g88f0e.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
