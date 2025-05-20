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

Geef een kort en concreet AI-advies in HTML gebaseerd op dit profiel:
- Naam: ${naam}
- Functie: ${functie}
- Sector: ${sector}
- Taken: ${taken}
- Ervaring: ${ervaring}
- Soft-skills: ${softskills}
- Of de persoon bereid is zich bij te scholen als de functie door ai vervalt: ${bereidheid}
- AI-risicoscore: [getal tussen 0 en 100]

Beperk je tot het volgende format:

<p><strong>AI-risicoscore van [Getal] (Hoeveel % kans je hebt om vervangen te worden door AI)</strong></p>
<p>In maximaal 2 zinnen: leg uit waarom deze score geldt voor iemand in de functie van "${functie}", en geef één concreet voorbeeld van hoe deze persoon zichzelf futureproof kan maken. Geen vaag taalgebruik of algemene adviezen. Noem geen andere beroepen.</p>
<p><em>Toekomsttip:</em> één praktische actie die deze persoon de komende maanden kan nemen om relevant te blijven.</p>

Spreek de persoon direct aan. Geen markdown. Antwoord alleen in HTML.`



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
