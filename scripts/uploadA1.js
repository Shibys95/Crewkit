// scripts/uploadA1.js
// Requirements: npm install firebase xlsx
// Run: node uploadA1.js

const path = require('path');
const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config (тот же, что в оригинале)
const firebaseConfig = {
  apiKey: "AIzaSyCZUbEDX4xbr1QQtii3sQzFLrCDZwk-Vi0",
  authDomain: "ez1smeta-app.firebaseapp.com",
  projectId: "ez1smeta-app",
  storageBucket: "ez1smeta-app.firebasestorage.app",
  messagingSenderId: "95234761924",
  appId: "1:95234761924:web:67b744b8374722e3c81591"
};

// Инициализация
console.log('🔄 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Путь к Excel-файлу A1
const EXCEL_PATH = path.resolve(__dirname, 'crewkit_a1_final_ready.xlsx');
console.log(`📄 Reading Excel file from: ${EXCEL_PATH}`);

// Чтение данных
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
console.log(`🔖 Using sheet: ${sheetName}`);
const sheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log(`🔢 Parsed rows count: ${rawRows.length}`);

// Подготовка данных
const equipment = rawRows.map((item) => {
  const nameKey = item.equipment_name ?? item['Equipment Name'] ?? item['equipment_name '];
  const rawPrice = item.price_per_day ?? item['Price per Day'];
  return {
    equipment_name: String(nameKey).trim(),
    price_per_day: Number(String(rawPrice).replace(/\s/g, '').replace(',', '.')) || 0,
    category: String(item.category ?? item['Category']).trim(),
    rental_company: 'A1Rental'
  };
});
console.log(`🛠 Prepared ${equipment.length} equipment items for upload.`);

// Загрузка в Firestore
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
