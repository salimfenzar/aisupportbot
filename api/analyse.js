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


const prompt = `Je bent een professionele AI-loopbaanadviseur. Je schrijft duidelijke, vriendelijke en geruststellende adviezen voor werkenden die willen weten in hoeverre hun baan de komende 10 jaar te vervangen is door AI.

Analyseer het volgende profiel:
- Naam: ${naam}
- Geslacht: ${geslacht}
- Geboortedatum: ${geboortedatum}
- Regio: ${woonregio}
- Functie: ${functie}
- Sector: ${sector}
- Contracttype: ${contract}
- Jaren ervaring: ${ervaring}
- Leidinggevende verantwoordelijkheden: ${leidinggeven}
- Opleidingsniveau: ${opleiding}
- Dagelijkse taken: ${taken}
- Bereidheid tot bijscholing: ${bereidheid}

Schrijf een persoonlijk adviesbericht voor ${naam} in HTML-formaat. Gebruik maximaal 120 woorden.

De structuur:
<h3>Begroeting met naam</h3>
Geef een AI-risicoscore tussen 0 en 100. Leg in maximaal 2 zinnen uit waarom deze score van toepassing is.
Leg uit of deze persoon vervangbaar is door ai op basis van de data,
Geef 1 of 2 concrete tips om futureproof te blijven. 
Sluit af met een bedankje en motivatie.

Gebruik uitsluitend HTML-tags zonder Markdown (\`\`\`). Begin direct met de <h3>-tag en eindig met </p> of </ul>. Geen extra tekst eromheen.
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
