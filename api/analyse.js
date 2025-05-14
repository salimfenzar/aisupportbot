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

const prompt = `Je bent een AI-loopbaanadviseur die op een vriendelijke en duidelijke manier advies geeft aan individuen over hun werk. 

Analyseer het volgende profiel:
Naam: ${naam}
Functie: ${functie}
Ervaring: ${ervaring} jaar
Taken: ${taken}
Vaardigheden: ${vaardigheden}
Opleidingsniveau: ${opleiding}
Sector: ${sector}

Stel je voor dat je direct tegen ${naam} praat. Schrijf een kort adviesbericht in 3 paragrafen:
1. Begin met een vriendelijke begroeting aan ${naam}.
2. Geef vervolgens de AI-risicoscore (tussen 0 en 100) en leg uit waarom deze score van toepassing is.
3. Sluit af met een concrete suggestie om futureproof te blijven.

Gebruik maximaal 120 woorden. Gebruik eventueel simpele HTML-tags zoals <strong>, <ul>, <li> of <p> zodat het makkelijk te stylen is aan de frontend.`;


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
