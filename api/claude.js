export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Use OpenRouter auto-routing — picks the best available free model automatically
  const MODELS = [
    "openrouter/auto",
    "meta-llama/llama-3.1-8b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
  ];

  let lastError = "";

  for (const model of MODELS) {
    try {
      const body = { ...req.body, model };
      // For auto-routing, allow free models only
      if (model === "openrouter/auto") {
        body.route = "fallback";
        body.transforms = ["middle-out"];
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://signal-brief.vercel.app",
          "X-Title": "Signal Brief",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return res.status(200).json(data);
      lastError = `${model}: ${data?.error?.message || JSON.stringify(data).slice(0, 120)}`;
    } catch (err) {
      lastError = `${model}: ${err.message}`;
    }
  }

  res.status(500).json({ error: "All models failed", detail: lastError });
}
