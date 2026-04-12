const apiKey = "AIzaSyCaSWLgxX7Tq_Ot7bBBku4GAFBVmxMwm1g";

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

listModels();
