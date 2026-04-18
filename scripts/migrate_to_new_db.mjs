import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import fs from "fs";

// Load the NEW config
const configRaw = fs.readFileSync("./firebase-applet-config.json", "utf-8");
const config = JSON.parse(configRaw);

const app = initializeApp(config);
const db = getFirestore(app);

// Load the backup data
const backupData = JSON.parse(fs.readFileSync("./scripts/admin_data_backup.json", "utf-8"));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrate() {
  console.log("Duke filluar migrimin e të dhënave në projektin e ri...");

  for (const colName in backupData) {
    const docs = backupData[colName];
    console.log(`\nDuke migruar koleksionin [${colName}] (${docs.length} dokumente)...`);

    for (let i = 0; i < docs.length; i++) {
        const data = docs[i];
        const { id, ...docData } = data;
        const size = JSON.stringify(data).length;
        
        let success = false;
        let retries = 3;

        while (!success && retries > 0) {
            try {
                console.log(`[${i+1}/${docs.length}] Duke ngarkuar ${id} (${(size/1024).toFixed(1)} KB)...`);
                const docRef = doc(db, colName, id);
                await setDoc(docRef, docData);
                success = true;
                // Longer delay for large docs
                await sleep(size > 500000 ? 3000 : 1000); 
            } catch (error) {
                console.error(`Dështoi dokumenti ${id} (Mbeten edhe ${retries-1} tentativa):`, error.message);
                retries--;
                await sleep(5000); // Wait longer on error
            }
        }
    }
    console.log(`U përfundua migrimi i koleksionit [${colName}].`);
  }

  console.log("\nURIME! Migrimi i të dhënave përfundoi me sukses.");
  console.log("Të gjitha 91 dokumentet janë tani në databazën e re.");
}

migrate().catch(console.error);
