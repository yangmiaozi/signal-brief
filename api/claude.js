export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-2-9b-it:free",
  ];

  let lastError = "";

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://signal-brief.vercel.app",
          "X-Title": "Signal Brief",
        },
        body: JSON.stringify({ ...req.body, model }),
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (text) {
        return res.status(200).json(data);
      }

      lastError = `${model}: ${data?.error?.message || JSON.stringify(data)}`;
    } catch (err) {
      lastError = `${model}: ${err.message}`;
    }
  }

  res.status(500).json({ error: "All models failed", detail: lastError });
}
