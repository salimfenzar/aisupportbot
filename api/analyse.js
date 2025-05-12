export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { functie, ervaring, taken, vaardigheden, opleiding, sector } = req.body;

  const prompt = `Je bent een AI-loopbaanadviseur. Analyseer dit profiel:
Functie: ${functie}
Ervaring: ${ervaring} jaar
Taken: ${taken}
Vaardigheden: ${vaardigheden}
Opleidingsniveau: ${opleiding}
Sector: ${sector}

Geef:
1. Een AI-risicoscore van 0-100
2. Een korte uitleg waarom
3. Eén suggestie om futureproof te blijven
Gebruik maximaal 100 woorden.`;

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

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || "Geen resultaat ontvangen.";

    res.status(200).json({ resultaat: output });
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van AI-analyse." });
  }
}
