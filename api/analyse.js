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
} = req.body;

if (!naam || !functie || !ervaring || !taken  || !opleiding || !sector) {
  return res.status(400).json({ message: "Ontbrekende gegevens in het verzoek." });
}


const prompt = `Je bent een loopbaan adviseur. Geef een kort advies in HTML op basis van het profiel van ${naam} hoe deze persoon zichzelf futureproof kan maken om niet vervangen te worden door AI.
Spreek tot deze persoon. Beperk tot:
- AI-risicoscore (0-100) in deze format: AI-risicoscore van (Getal)
- Maximaal 2 zinnen uitleg wat deze persoon kan doen om zich beter 
- 1 concrete tip

Antwoord in HTML zonder markdown.

`;


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
