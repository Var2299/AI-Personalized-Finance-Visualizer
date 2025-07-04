export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate request body
  if (!req.body.transactions || !Array.isArray(req.body.transactions)) {
    return res.status(400).json({ error: 'Invalid transactions data' });
  }

  const { transactions } = req.body;
  
  // Handle empty transactions scenario
  if (transactions.length === 0) {
    return res.status(200).json({
      summary: "No transactions found for this period. Add some expenses to get personalized saving tips!",
      model: "no-transactions"
    });
  }

  // Calculate total spending for verification
  const totalSpending = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // Create transaction text
  const transactionText = transactions
    .map(t => `${t.date}: ₹${t.amount} (${t.category || 'Uncategorized'}) - ${t.description || 'No description'}`)
    .join("\n");

  // Enhanced prompt with spending context
  const prompt = `You are a personal finance assistant. 
  
Transaction Summary:
${transactionText}

Total Spending: ₹${totalSpending.toFixed(2)}

Provide:
1. A brief monthly spending analysis
2. 3 practical money-saving tips relevant to these expenses
3. Avoid mentioning specific transaction details unless particularly significant`;

  try {
    const modelOptions = [
      "llama3-70b-8192",
      "llama3-8b-8192",
      "mixtral-8x7b-32768"
    ];

    let lastError = null;
    
    for (const model of modelOptions) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [
              { 
                role: "system", 
                content: "You are a helpful personal finance assistant. Provide concise analysis and actionable tips based ONLY on the provided transactions. If no meaningful pattern exists, provide general tips."
              },
              { role: "user", content: prompt }
            ],
            max_tokens: 400,
            temperature: 0.5,  // Lower temperature for more factual responses
            top_p: 0.85
          }),
          timeout: 10000
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Groq API error (${model}): ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error(`Empty response from ${model}`);
        }

        const summary = data.choices[0].message.content.trim();
        
        // Validate AI response quality
        if (summary.toLowerCase().includes("no transaction") || 
            summary.toLowerCase().includes("no data")) {
          throw new Error(`AI returned empty analysis for ${model}`);
        }
        
        return res.status(200).json({ summary, model });
        
      } catch (err) {
        console.error(`Attempt failed for model ${model}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("All model attempts failed");
    
  } catch (err) {
    console.error("AI Summary Error:", err);
    
    // Special handling for empty transactions edge case
    if (transactions.length === 0 || totalSpending === 0) {
      return res.status(200).json({
        summary: "No spending data available. Start adding transactions to receive personalized financial advice!",
        fallback: true
      });
    }
    
    return res.status(500).json({ 
      error: "Failed to generate financial summary",
      details: err.message,
      suggestion: "Try adding more transaction details or try again later"
    });
  }
}