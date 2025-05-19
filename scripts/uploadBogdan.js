// scripts/uploadBogdan.js
// Requirements: npm install firebase xlsx
// Run: node uploadBogdan.js

const path = require('path');
const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config (use your app's config)
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

// Path to Excel file
const EXCEL_PATH = path.resolve(__dirname, 'crewkit_bogdan_final_ready.xlsx');
console.log(`📄 Reading Excel file from: ${EXCEL_PATH}`);

// Parse workbook and sheet
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
console.log(`🔖 Using sheet: ${sheetName}`);
const sheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log(`🔢 Parsed rows count: ${rawRows.length}`);

// Map and clean data
const equipment = rawRows.map((item, index) => {
  const nameKey = item.equipment_name ?? item['Equipment Name'] ?? item['equipment_name '];
  const rawPrice = item.price_per_day ?? item['Price per Day'];
  return {
    equipment_name: String(nameKey).trim(),
    price_per_day: Number(String(rawPrice).replace(/\s/g, '').replace(',', '.')) || 0,
    category: String(item.category ?? item['Category']).trim(),
    rental_company: 'Богдан и Бригада'
  };
});
console.log(`🛠 Prepared ${equipment.length} equipment items for upload.`);

// Upload function
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