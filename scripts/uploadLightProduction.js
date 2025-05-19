
// scripts/uploadLightProduction.js
// Requirements: npm install firebase xlsx
// Run: node uploadLightProduction.js

const path = require('path');
const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config — тот же, что ты уже использовал
const firebaseConfig = {
  apiKey: "AIzaSyCZUbEDX4xbr1QQtii3sQzFLrCDZwk-Vi0",
  authDomain: "ez1smeta-app.firebaseapp.com",
  projectId: "ez1smeta-app",
  storageBucket: "ez1smeta-app.firebasestorage.app",
  messagingSenderId: "95234761924",
  appId: "1:95234761924:web:67b744b8374722e3c81591"
};

// Initialize Firebase
console.log('🔄 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Excel file path
const EXCEL_PATH = path.resolve(__dirname, 'crewkit_lightproduction_ready.xlsx');
console.log(`📄 Reading Excel file from: ${EXCEL_PATH}`);

// Load and parse Excel
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
console.log(`🔖 Using sheet: ${sheetName}`);
const sheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log(`🔢 Parsed rows count: ${rawRows.length}`);

// Clean and prepare
const equipment = rawRows.map((item) => {
  return {
    equipment_name: String(item.equipment_name || '').trim(),
    price_per_day: Number(String(item.price_per_day || '').replace(/\s/g, '').replace(',', '.')) || 0,
    category: String(item.category || '').trim(),
    rental_company: 'LightProduction'
  };
});
console.log(`🛠 Prepared ${equipment.length} equipment items for upload.`);

// Upload
async function uploadAll() {
  if (!equipment.length) {
    console.warn('⚠️ No equipment items found. Check your Excel columns.');
    return;
  }

  console.log('🚀 Starting upload...');
  let successCount = 0;
  let failCount = 0;

  for (const item of equipment) {
    try {
      await addDoc(collection(db, 'equipment'), item);
      console.log(`✅ Uploaded: ${item.equipment_name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error uploading "${item.equipment_name}":`, error.message || error);
      failCount++;
    }
  }

  console.log(`🎉 Upload complete. Success: ${successCount}, Failures: ${failCount}`);
}

uploadAll().catch(err => console.error('Fatal error in uploadAll():', err));
