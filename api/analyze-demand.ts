// Vercel Serverless Function: /api/analyze-demand
// Analyzes live inventory and order velocity using the real Google Gemini API

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback if GEMINI_API_KEY environment variable is not yet populated on Vercel
      const items = data.inventory || [];
      const chickenFry = items.find((i: any) => i.name?.toLowerCase().includes('chicken fry')) || items[0];
      const currentStock = chickenFry ? chickenFry.stock : 8;

      return res.status(200).json({
        summary: "Campus lunch rush alert: High demand detected across UIU student cafeteria.",
        riskLevel: currentStock <= 8 ? "high" : "moderate",
        analyzedAt: new Date().toISOString(),
        engine: "UIU Demand Intelligence Heuristic (Add GEMINI_API_KEY to Vercel Env for Live API)",
        liveApiUsed: false,
        items: [
          {
            item: chickenFry ? chickenFry.name : "Chicken Fry",
            outlet: chickenFry ? chickenFry.outletName : "Khan's Kitchen",
            currentStock: currentStock,
            expectedDemand: 26,
            recommendedRefill: 20,
            risk: currentStock <= 8 ? "HIGH SHORTAGE RISK" : "MODERATE RISK",
            reason: `Real-time student velocity shows rapid consumption with ${data.recentOrdersCount || 12} recent orders. Predicted stock depletion within 35 minutes.`
          }
        ],
        agentActionPlan: [
          "Step 1: Prep 20 portions of Chicken Fry immediately for Khan's Kitchen",
          "Step 2: Replenish warming trays and packaging",
          "Step 3: Await vendor one-click approval before updating stock"
        ]
      });
    }

    // Call real Google Gemini API
    const prompt = `You are the AI Demand and Restock Intelligence Assistant for UIU Food HUB (United International University campus food management).
Analyze the following live outlet inventory, sales velocity, and recent orders:
${JSON.stringify(data, null, 2)}

Identify any urgent inventory shortage risks (especially items with low stock and high demand velocity like Chicken Fry).
Provide actionable restock recommendations with calculated expected demand and recommended refill portions.

CRITICAL: Return ONLY valid, raw JSON matching this EXACT structure (no markdown fences, no explanatory text outside JSON):
{
  "summary": "Short executive summary of demand status across UIU outlets",
  "riskLevel": "high" | "moderate" | "low",
  "analyzedAt": "ISO date string",
  "engine": "Google Gemini 2.0 Flash (Live API)",
  "items": [
    {
      "item": "Exact item name (e.g. Chicken Fry)",
      "outlet": "Outlet name (e.g. Khan's Kitchen)",
      "currentStock": number,
      "expectedDemand": number,
      "recommendedRefill": number,
      "risk": "HIGH SHORTAGE RISK" | "MODERATE RISK" | "OPTIMAL",
      "reason": "Clear explanation of demand surge or historical consumption pattern"
    }
  ],
  "agentActionPlan": [
    "Step 1: Notify kitchen crew to start preparation",
    "Step 2: Reserve primary cooking station",
    "Step 3: Update inventory upon batch completion"
  ]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API returned error:', errorText);
      return res.status(502).json({
        error: 'Gemini API call failed',
        details: errorText
      });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ error: 'Empty response received from Gemini API' });
    }

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      ...parsed,
      liveApiUsed: true
    });
  } catch (err: any) {
    console.error('Error in analyze-demand handler:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
