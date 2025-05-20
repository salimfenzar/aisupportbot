export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

const {
  naam,
  geboortedatum,
  geslacht,
  woonregio,
  functie,
  sector,
  contract,
  ervaring,
  leidinggeven,
  opleiding,
  taken,
  bereidheid,
  softskills
} = req.body;

if (!naam || !functie || !ervaring || !taken  || !opleiding || !sector) {
  return res.status(400).json({ message: "Ontbrekende gegevens in het verzoek." });
}


const prompt = `Je bent een professionele loopbaanadviseur gespecialiseerd in AI-impact.

Geef een concreet en kort AI-advies in HTML op basis van dit profiel:
- Naam: ${naam}
- Opleiding: ${opleiding}
- Functie: ${functie}
- Sector: ${sector}
- Taken: ${taken}
- Ervaring: ${ervaring}
- Soft-skills: ${softskills}
- Bereidheid tot bijscholing bij AI-verandering: ${bereidheid}
- AI-risicoscore: [getal tussen 0 en 100]

Beperk je strikt tot dit format:

<p><strong>AI-risicoscore van [Getal] – jouw geschatte kans om vervangen te worden door AI.</strong></p>
<p>Jij werkt als "${functie}". Op basis van je ervaring en taken is deze score van toepassing. Eén concreet advies om jezelf futureproof te maken: [specifiek voorstel, bijv. "Volg een cursus data-analyse op MBO-niveau" of "Verdiep je in AI-tools zoals ChatGPT voor klantinteractie"].</p>
<p><em>Toekomsttip:</em> [Zeer concrete actie, bijv. "Volg binnen 3 maanden een LinkedIn Learning cursus over AI in jouw sector"].</p>

Gebruik geen vaag taalgebruik zoals "ontwikkel je verder" of "blijf leren" zonder uitleg. Gebruik geen opsommingen, geen markdown, geen synoniemen voor de AI-risicoscore. Spreek de persoon direct aan met "je". Antwoord enkel in HTML.`;



  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI fout:", errorData);
      return res.status(response.status).json({ error: "Fout van OpenAI API", details: errorData });
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || "Geen resultaat ontvangen.";

    res.status(200).json({ resultaat: output });
  } catch (error) {
    console.error("Serverfout:", error);
    res.status(500).json({ error: "Interne serverfout bij het ophalen van AI-analyse." });
  }
}
