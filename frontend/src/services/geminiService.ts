export async function generateBiasAudit(dataset: string, attributes: string[]) {
  const prompt = `
    You are an AI Ethics Auditor. Analyze bias in this dataset:
    Dataset: ${dataset}
    Sensitive attributes: ${attributes.join(", ")}
    Respond with JSON only containing fields:
    {
      "summary": "...",
      "fairness_metrics": [...],
      "recommendations": [...]
    }
  `;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="AIzaSyB0kbECEHbFPS7rsHOnDKkwVIT0R9t_290"", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text);
}
