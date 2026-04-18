import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

// Load existing config
const configRaw = fs.readFileSync("./firebase-applet-config.json", "utf-8");
const config = JSON.parse(configRaw);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const collections = [
  "projects",
  "news",
  "staff",
  "partners",
  "stats",
  "applications",
  "site_assets",
  "site_content"
];

async function backup() {
  const backupData = {};

  console.log("Fillimi i backup-it nga databaza aktuale (AI Studio)...");

  for (const colName of collections) {
    try {
      console.log(`Duke marrë të dhënat nga koleksioni: ${colName}...`);
      const q = collection(db, colName);
      const snapshot = await getDocs(q);
      
      backupData[colName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`U morën ${backupData[colName].length} dokumente nga ${colName}.`);
    } catch (error) {
      console.error(`Gabim gjatë marrjes së ${colName}:`, error.message);
    }
  }

  const outputPath = "./scripts/admin_data_backup.json";
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
  console.log(`\nSukses! Backup-i u ruajt në: ${outputPath}`);
  
  // Also count total items
  const total = Object.values(backupData).reduce((acc, val) => acc + val.length, 0);
  console.log(`Gjithsej u shpëtuan ${total} dokumente.`);
}

backup().catch(console.error);
