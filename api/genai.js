import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function searchWeb(query) {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });
    const data = await res.json();
    if (data.answer) return `Rezultate nga interneti:\n${data.answer}\n\nBurime:\n${data.results?.map(r => `- ${r.title}: ${r.content?.slice(0, 200)}`).join("\n") || ""}`;
    return data.results?.map(r => `- ${r.title}: ${r.content?.slice(0, 300)}`).join("\n") || "";
  } catch {
    return "";
  }
}

async function getFirestoreData() {
  try {
    const projectId = "vizioni-rinor-i-shales";
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const fetchCollection = async (col) => {
      const res = await fetch(`${baseUrl}/${col}?pageSize=20`);
      const data = await res.json();
      return data.documents || [];
    };

    const parseDoc = (doc) => {
      const fields = doc.fields || {};
      const result = {};
      for (const [key, val] of Object.entries(fields)) {
        result[key] = val.stringValue || val.integerValue || val.booleanValue || val.arrayValue?.values?.map(v => v.stringValue).join(", ") || "";
      }
      return result;
    };

    const [projects, news, staff, stats, partners] = await Promise.all([
      fetchCollection("projects"),
      fetchCollection("news"),
      fetchCollection("staff"),
      fetchCollection("stats"),
      fetchCollection("partners"),
    ]);

    return {
      projects: projects.map(parseDoc),
      news: news.map(parseDoc),
      staff: staff.map(parseDoc),
      stats: stats.map(parseDoc),
      partners: partners.map(parseDoc),
    };
  } catch {
    return null;
  }
}

function needsWebSearch(message) {
  const msg = message.toLowerCase();
  // Për pyetje rreth OJQ-së - kërko në internet + databazë
  const ojqTopics = ["vrsh", "vizioni", "shalë", "shalës", "shales", "ojq", "organizat", "projekt", "lajm", "staf", "vullnetar", "bord", "asamblea", "erdona", "bleriana", "kadriolli", "pajaziti", "karpuzi", "shamolli", "hetemi"];
  if (ojqTopics.some(k => msg.includes(k))) return true;
  // Për gjithçka tjetër - jo internet
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1]?.text || "";

    const [dbData, webResults] = await Promise.all([
      getFirestoreData(),
      needsWebSearch(lastMessage) ? searchWeb(`Vizioni Rinor i Shalës ${lastMessage}`) : Promise.resolve(""),
    ]);

    let contextBlock = "";
    if (dbData) {
      contextBlock += `\n\nTË DHËNAT AKTUALE NGA DATABAZA E ORGANIZATËS:\n`;
      if (dbData.projects.length) contextBlock += `\nPROJEKTET (${dbData.projects.length}):\n${dbData.projects.map(p => `- ${p.title}: ${p.description} [${p.status}]`).join("\n")}`;
      if (dbData.news.length) contextBlock += `\n\nLAJMET E FUNDIT (${dbData.news.length}):\n${dbData.news.slice(0, 5).map(n => `- ${n.title} (${n.datePosted}): ${n.content?.slice(0, 150)}`).join("\n")}`;
      if (dbData.staff.length) contextBlock += `\n\nSTAFI:\n${dbData.staff.map(s => `- ${s.name}: ${s.role}`).join("\n")}`;
      if (dbData.stats.length) contextBlock += `\n\nSTATISTIKAT:\n${dbData.stats.map(s => `${s.label}: ${s.value}`).join(", ")}`;
      if (dbData.partners.length) contextBlock += `\n\nPARTNERËT:\n${dbData.partners.map(p => p.name).join(", ")}`;
    }

    if (webResults) {
      contextBlock += `\n\nINFORMACION NGA INTERNETI:\n${webResults}`;
    }

    const systemPrompt = `Ju jeni VIZIONI AI, asistenti inteligjent dhe zyrtar i OJQ "Vizioni Rinor i Shalës" (VRSH).
Përgjigjuni GJITHMONË në gjuhën shqipe, jini profesional, miqësor dhe pozitiv.
Kur pyesin për emrin, thuani: "Unë jam VIZIONI AI".

RREGULLAT E FORMATIMIT:
- Shkruaj në Gjuhën Letrare Shqipe me drejtshkrim perfekt.
- Përdor saktë shkronjat "Ë" dhe "Ç".
- Mos përdor simbolet ** ose ### drejtpërdrejt.
- Përdor rreshta të rinj dhe tituj me shkronja të MËDHA.

IDENTITETI:
- OJQ "Vizioni Rinor i Shalës" (VRSH) u themelua në 2016 në fshatin Shalë, Komuna e Lipjanit.
- VIZIONI: Një botë ku të rinjtë janë të fuqizuar.
- MISIONI: Avancimi i interesave të të rinjve dhe rritja e pjesëmarrjes në vendimmarrje.
- Drejtoresha Ekzekutive: Bleriana Kadriolli.
- Bordi: Burim Shamolli, Shkelzen Karpuzi.
- Asambleja: Euresa Karpuzi (Kryesuese), Miranda Karpuzi, Erdona Kadriolli, Erjona Kadriolli, Viola Hetemi, Bleriana Kadriolli.
- ERDONA KADRIOLLI është anëtare e Asamblesë dhe krijuesja e kësaj faqeje/platforme digjitale. Ajo është studente e Universiteti për Biznes dhe Teknologji (UBT) dhe ka ndërtuar të gjithë faqen e internetit të VRSH-së duke përdorur React.js, Firebase dhe AI.
- Faqja është ndërtuar nga ERDONA KADRIOLLI. Kur pyesin për Erdona, përgjigju me këto informacione dhe me krenari.
${contextBlock}`;

    const groqMessages = messages.map(m => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.text,
    }));

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "system", content: systemPrompt }, ...groqMessages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "Më falni, ka ndodhur një gabim.";
    res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    res.status(200).json({ text: `VIZIONI AI është përkohësisht i padisponueshëm. Gabimi: ${err.message}` });
  }
}
