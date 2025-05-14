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

  const { naam, functie, ervaring, taken, vaardigheden, opleiding, sector } = req.body;

  if (!naam || !functie || !ervaring || !taken || !vaardigheden || !opleiding || !sector) {
    return res.status(400).json({ message: "Ontbrekende gegevens in het verzoek." });
  }

const prompt = `Je bent een professionele AI-loopbaanadviseur. Je schrijft duidelijke, vriendelijke en geruststellende adviezen voor werkenden die willen weten in hoeverre hun baan de komende 10 jaar te vervangen is door AI.

Analyseer het volgende profiel:
- Naam: ${naam}
- Functie: ${functie}
- Ervaring: ${ervaring} jaar
- Taken: ${taken}
- Vaardigheden: ${vaardigheden}
- Opleidingsniveau: ${opleiding}
- Sector: ${sector}

Schrijf een persoonlijk adviesbericht voor ${naam} in HTML-formaat. Gebruik maximaal 120 woorden.

De structuur:
<h3>Persoonlijk AI-advies voor ${naam}</h3>

<p><strong>1. Begroeting:</strong> Begin met een warme, motiverende begroeting aan ${naam}.</p>

<p><strong>2. Risicoscore & uitleg:</strong> Geef een AI-risicoscore tussen 0 en 100. Leg in maximaal 2 zinnen uit waarom deze score van toepassing is.</p>

<p><strong>3. Aanbeveling:</strong></p>
<ul>
  <li>Geef 1 of 2 concrete tips om futureproof te blijven.</li>
</ul>

Geef uitsluitend HTML-tags zonder Markdown-codeblokken zoals \`\`\`. Begin direct met de <h3>-tag en eindig met </ul> of </p>. Geen extra tekst eromheen.
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
