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

Geef een concreet, kort en gevarieerd AI-advies in HTML gebaseerd op dit profiel:
- Naam: ${naam}
- Opleiding: ${opleiding}
- Functie: ${functie}
- Sector: ${sector}
- Taken: ${taken}
- Ervaring: ${ervaring}
- Soft-skills: ${softskills}
- Bereidheid tot bijscholing bij AI-verandering: ${bereidheid}
- AI-risicoscore: [getal tussen 0 en 100]

Format:

<p><strong>AI-risicoscore van  – jouw geschatte kans om vervangen te worden door AI.</strong></p>
<p>Je werkt als ${functie} in de sector ${sector}. Leg kort uit waarom deze score van toepassing is (max 1 zin). Geef daarna een specifiek en origineel advies over hoe deze persoon zich futureproof kan maken, afhankelijk van zijn of haar achtergrond (opleiding, ervaring, soft skills).</p>
<p><em>Toekomsttip:</em> Sluit af met een direct toepasbare, originele actie (denk aan een cursus, gesprek met een expert, praktijkervaring of tool die past bij deze persoon).</p>

Wees altijd concreet. Vermijd herhaling of generieke zinnen zoals “leer meer over AI” of “ontwikkel jezelf”. Gebruik verschillende formuleringen en voorbeelden per profiel.

Geen opsommingen. Geen markdown. Alleen HTML als output. Spreek de persoon direct aan met “je”.`;

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
