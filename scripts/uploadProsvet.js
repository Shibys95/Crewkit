
// scripts/uploadProsvet.js
// Requirements: npm install firebase xlsx
// Run: node uploadProsvet.js

const path = require('path');
const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config (замени на свой, если нужно)
const firebaseConfig = {
  apiKey: "AIzaSyCZUbEDX4xbr1QQtii3sQzFLrCDZwk-Vi0",
  authDomain: "ez1smeta-app.firebaseapp.com",
  projectId: "ez1smeta-app",
  storageBucket: "ez1smeta-app.appspot.com",
  messagingSenderId: "95234761924",
  appId: "1:95234761924:web:67b744b8374722e3c81591"
};

// Initialize Firebase
console.log('🔄 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Path to Excel file
const EXCEL_PATH = path.resolve(__dirname, 'prosvet_ready_for_firebase.xlsx');
console.log(`📄 Reading file: ${EXCEL_PATH}`);

// Read Excel
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

(async () => {
  console.log(`🚀 Uploading ${data.length} items to Firestore...`);
  const colRef = collection(db, 'equipment');

  for (const item of data) {
    try {
      await addDoc(colRef, {
        equipment_name: item.equipment_name,
        price_per_day: item.price_per_day,
        category: item.category,
        rental_company: item.rental_company,
      });
      console.log(`✅ Uploaded: ${item.equipment_name}`);
    } catch (error) {
      console.error(`❌ Error uploading "${item.equipment_name}":`, error);
    }
  }

  console.log('🎉 Upload complete!');
})();
