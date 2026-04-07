import "server-only";

type GeminiInlineDataPart = {
  inline_data: {
    mime_type: string;
    data: string;
  };
};

type GeminiTextPart = {
  text: string;
};

type GeminiRequestPart = GeminiInlineDataPart | GeminiTextPart;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function analyzeFoodWithGemini(
  goal: string,
  textInput: string,
  imageBase64: string | null = null
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY on the server.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert AI nutritionist. I need you to analyze the provided food (either by image or text) and output a strict JSON array or object based on the schema below.
Goal of the user: ${goal}
User Input: ${textInput || "See attached image."}

Analyze the food and provide the following details:
1. food_name: The name of the food detected.
2. calories: Estimated total calories as a number.
3. macronutrients: An object with 'protein', 'carbs', and 'fat' (all numbers in grams).
4. health_score: A number from 0 to 100 representing how healthy this food is.
5. is_healthy: A boolean.
6. better_alternative: A short string suggesting a healthier alternative.
7. actionable_advice: A concise, actionable piece of advice tailored specifically to the user's goal (${goal}).

CRITICAL INSTRUCTION: Your response MUST be EXACTLY valid JSON matching the interface below. Do NOT wrap it in markdown blockquotes like \`\`\`json. Do not include any conversational text before or after the JSON.

{
  "food_name": "string",
  "calories": 0,
  "macronutrients": {
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "health_score": 0,
  "is_healthy": true,
  "better_alternative": "string",
  "actionable_advice": "string"
}
`;

  const contents: Array<{ parts: GeminiRequestPart[] }> = [];
  const parts: GeminiRequestPart[] = [{ text: prompt }];

  if (imageBase64) {
    // Remove data:image/*;base64, prefix if present
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    // Attempting to deduce mime type or assuming jpeg for simplicity
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('data:image/png;base64,')) mimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/webp;base64,')) mimeType = 'image/webp';
    else if (imageBase64.startsWith('data:image/heic;base64,')) mimeType = 'image/heic';

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data
      }
    });
  }

  contents.push({ parts });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API Error:', errorBody);
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('No valid response received from Gemini.');
  }

  return textOutput;
}
