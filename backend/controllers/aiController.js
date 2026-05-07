exports.suggestService = async (req, res) => {
  try {
    const { problemText } = req.body;
    
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY === 'your_gemini_or_openai_api_key_here') {
      // Mocked AI for testing without key
      const lower = problemText.toLowerCase();
      let categoryId = 2;
      if (lower.includes('ac') || lower.includes('air conditioner')) categoryId = 3;
      else if (lower.includes('water tank')) categoryId = 4;
      else if (lower.includes('cooler')) categoryId = 5;
      else if (lower.includes('washing machine')) categoryId = 6;
      else if (lower.includes('generator') || lower.includes('inverter')) categoryId = 7;
      else if (lower.includes('chimney')) categoryId = 8;
      else if (lower.includes('aquaguard') || lower.includes('purifier')) categoryId = 9;
      else if (lower.includes('clean') || lower.includes('janitor')) categoryId = 10;
      else if (lower.includes('bike') || lower.includes('wheeler')) categoryId = 11;
      else if (lower.includes('urgent') || lower.includes('emergency')) categoryId = 1;
      else categoryId = 2; // Default to General Visit
      
      return res.json({ serviceId: categoryId, mock: true });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI assistant for a local service platform called Fastlane. The user will describe their problem. You must classify their problem into exactly one of the following Service IDs (return ONLY the number from 1 to 12):
1 - Instant visit (High urgency, emergency repairs)
2 - General visit (Standard repairs, fan not working, light fixing, plumbing, general issues)
3 - A.C Jet machine service (AC servicing or repair)
4 - Watertank clean by machine
5 - Air Cooler Service
6 - Washing Machine Service
7 - Generator/Inverter Rentals
8 - Chimney Services
9 - Aquaguard/Water Purifier service
10 - Janitorial/Cleaning services
11 - 2 wheeler Services @ doorstep (Bike, scooter repair)
12 - Others (If none of the above fit)

Problem: "${problemText}"
Return only the integer ID.`
    });

    const serviceId = parseInt(response.text.trim()) || 2;
    
    res.json({ serviceId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
