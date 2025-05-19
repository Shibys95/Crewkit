const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCZUbEDX4xbr1QQtii3sQzFLrCDZwk-Vi0",
  authDomain: "ez1smeta-app.firebaseapp.com",
  projectId: "ez1smeta-app",
  storageBucket: "ez1smeta-app.firebasestorage.app",
  messagingSenderId: "95234761924",
  appId: "1:95234761924:web:67b744b8374722e3c81591"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllEquipment() {
  const snapshot = await getDocs(collection(db, "equipment"));
  const total = snapshot.size;
  console.log(`Найдено ${total} записей. Удаление...`);

  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, "equipment", docSnap.id));
    console.log(`❌ Удалено: ${docSnap.data().equipment_name}`);
  }

  console.log("🧹 Всё удалено!");
  process.exit(0);
}

deleteAllEquipment().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
