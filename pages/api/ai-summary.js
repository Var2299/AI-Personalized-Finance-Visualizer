// pages/api/ai-summary.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!req.body.transactions || !Array.isArray(req.body.transactions)) {
    return res.status(400).json({ error: "Invalid transactions data" });
  }

  const { transactions } = req.body;

  if (transactions.length === 0) {
    return res.status(200).json({
      summary:
        "No transactions found for this period. Add some expenses to get personalized saving tips!",
      model: "no-transactions",
    });
  }

  // total spending
  const totalSpending = transactions.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0
  );

  // category breakdown
  const categoryTotals = {};
  for (const t of transactions) {
    const cat = (t.category || "Uncategorized").toString();
    const amt = parseFloat(t.amount || 0);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  }

  // convert to array and compute percentages
  const categories = Object.keys(categoryTotals).map((cat) => {
    const amt = categoryTotals[cat];
    const pct = totalSpending > 0 ? (amt / totalSpending) * 100 : 0;
    return { category: cat, amount: +amt.toFixed(2), percent: +pct.toFixed(2) };
  });

  // sort descending by amount
  categories.sort((a, b) => b.amount - a.amount);

  // pick top category for suggested % reduction heuristic
  const topCategory = categories[0] || { category: "Uncategorized", amount: 0, percent: 0 };

  // heuristic for suggested reduction (you can tweak these thresholds)
  let suggestedReductionPercent = 10;
  if (topCategory.percent >= 30) suggestedReductionPercent = 20;
  else if (topCategory.percent >= 15) suggestedReductionPercent = 15;
  else suggestedReductionPercent = 10;

  const estimatedSavings = +(totalSpending * (suggestedReductionPercent / 100)).toFixed(2);

  const transactionText = transactions
    .map(
      (t) =>
        `${t.date}: ₹${t.amount} (${t.category || "Uncategorized"}) - ${
          t.description || "No description"
        }`
    )
    .join("\n");

  // create a short categories summary string to pass to the model
  const categoriesSummary = categories
    .slice(0, 6) // top 6 for brevity
    .map((c) => `${c.category}: ₹${c.amount} (${c.percent}%)`)
    .join("\n");

  // Prompt: instruct natural tone, ask for 2-3 paragraph summary, 4 tips,
  // and require at least one tip including a concrete percentage reduction for the top category (with estimated ₹ savings).
  const prompt = `Context (for the assistant; do NOT repeat raw transactions to the user):
Transactions (context only):
${transactionText}

Total Spending: ₹${totalSpending.toFixed(2)}

Category breakdown (top items):
${categoriesSummary}

Top category suggestion:
- Top category: ${topCategory.category} (${topCategory.percent}% of total, ₹${topCategory.amount})
- Suggested reduction example: reduce ${topCategory.category} by ${suggestedReductionPercent}% (≈ ₹${estimatedSavings})

Task for the assistant:
- Write a warm, human monthly summary in 2–3 short paragraphs. Mention overall spending patterns and likely habits (no raw lists).
- Then provide 4 practical money-saving tips. Each tip 1–2 short sentences. Make them realistic and actionable.
- IMPORTANT: At least one of the tips MUST include a concrete percentage reduction for a specific category (preferably the top category above). Also mention the approximate monetary saving for that percent (use the suggested reduction as an example).
- Keep response friendly, non-judgmental, and concise. Use contractions and natural phrasing. Do NOT describe internal reasoning or say "based on the transactions above".
- Format: paragraphs for summary, then numbered list (1.–4.) for tips.
- Keep total output around 250–350 words.`;

  // Helper: fetch available models from Groq and pick a prioritized list
  async function discoverModels() {
    const url = "https://api.groq.com/openai/v1/models";
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (!r.ok) {
        let body;
        try {
          body = await r.json();
        } catch (_) {
          body = await r.text();
        }
        console.warn("Failed to fetch models list:", r.status, body);
        return [];
      }
      const json = await r.json();
      const items = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.models)
        ? json.models
        : json;
      const ids = items
        .map((it) => (typeof it === "string" ? it : it.id || it.model || ""))
        .filter(Boolean);

      const whitelistSubstrings = [
        "llama-3.3",
        "llama-3.1",
        "llama-4",
        "meta-llama",
        "qwen",
        "mistral",
        "mistral-saba",
        "gpt",
        "llama-3",
        "llama3",
      ];

      const picks = ids.filter((id) => {
        const low = id.toLowerCase();
        const hasWhite = whitelistSubstrings.some((s) => low.includes(s));
        const looksDeprecated =
          low.includes("deprec") ||
          low.includes("deprecated") ||
          low.includes("decommissioned") ||
          low.includes("preview");
        return hasWhite && !looksDeprecated;
      });

      return picks.length ? picks.slice(0, 6) : ids.slice(0, 6);
    } catch (err) {
      console.error("discoverModels error:", err);
      return [];
    }
  }

  try {
    let modelOptions = await discoverModels();

    if (!modelOptions || modelOptions.length === 0) {
      modelOptions = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mistral-saba-24b",
        "qwen/qwen3-32b",
      ];
    }

    let lastError = null;

    for (const model of modelOptions) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are a friendly, human-sounding personal finance assistant. Speak conversationally — as if talking to a friend. Use contractions, simple language, and a warm tone. Keep it realistic and encouraging. NEVER explain your internal reasoning process.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 650,
            temperature: 0.75,
            top_p: 0.92,
          }),
        });

        if (!response.ok) {
          let errBody;
          try {
            errBody = await response.json();
          } catch (_) {
            errBody = await response.text();
          }
          throw new Error(
            `Groq API error (${model}): ${response.status} - ${
              typeof errBody === "string"
                ? errBody
                : errBody?.error?.message || JSON.stringify(errBody)
            }`
          );
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) throw new Error(`Empty response from ${model}`);

        let summary = content.trim();

        // Defensive check: ensure at least one percentage string exists in tips section.
        // If model didn't include %, that's okay — but prefer to nudge future attempts.
        // We'll still return the summary as-is.
        return res.status(200).json({
          summary,
          model,
          meta: {
            totalSpending: +totalSpending.toFixed(2),
            topCategory: topCategory.category,
            topCategoryPercent: topCategory.percent,
            suggestedReductionPercent,
            estimatedSavings,
            categories: categories.slice(0, 6),
          },
        });
      } catch (err) {
        console.error(`Attempt failed for model ${model}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("All model attempts failed");
  } catch (err) {
    console.error("AI Summary Error:", err);

    if (transactions.length === 0 || totalSpending === 0) {
      return res.status(200).json({
        summary:
          "No spending data available. Start adding transactions to receive personalized financial advice!",
        fallback: true,
      });
    }

    return res.status(500).json({
      error: "Failed to generate financial summary",
      details: err.message,
      suggestion:
        "Check your GROQ_API_KEY, and verify available models in Groq console or via GET /openai/v1/models.",
    });
  }
}
