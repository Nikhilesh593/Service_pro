exports.suggestService = async (req, res) => {
  try {
    const { problemText } = req.body;
    
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY === 'your_gemini_or_openai_api_key_here') {
      // Mocked AI for testing without key
      const lower = problemText.toLowerCase();
      let category = 'Other';
      if (lower.includes('fan') || lower.includes('light') || lower.includes('wire') || lower.includes('electric')) category = 'Electrical';
      if (lower.includes('pipe') || lower.includes('leak') || lower.includes('water') || lower.includes('plumb')) category = 'Plumbing';
      if (lower.includes('clean') || lower.includes('dust')) category = 'Cleaning';
      
      return res.json({ category, mock: true });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Classify the following problem into a service category: Electrical, Plumbing, Cleaning, Carpentry, Painting, Appliance Repair, HVAC, Pest Control, or Other. Only return the category name. Problem: "${problemText}"`
    });

    const category = response.text.trim();
    
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
