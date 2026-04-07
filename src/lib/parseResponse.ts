export interface FoodAnalysis {
  food_name: string;
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  health_score: number; // 0 - 100
  is_healthy: boolean;
  better_alternative: string;
  actionable_advice: string;
}

const FOOD_DB: Array<{
  keywords: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  score: number;
  healthy: boolean;
  alternative: string;
}> = [
  {
    keywords: ["pizza", "pepperoni"],
    calories: 320,
    protein: 12,
    carbs: 34,
    fat: 15,
    score: 42,
    healthy: false,
    alternative: "Whole-wheat veggie pizza with light cheese",
  },
  {
    keywords: ["burger", "cheeseburger"],
    calories: 540,
    protein: 26,
    carbs: 36,
    fat: 31,
    score: 35,
    healthy: false,
    alternative: "Grilled chicken burger with salad",
  },
  {
    keywords: ["salad", "quinoa"],
    calories: 280,
    protein: 10,
    carbs: 32,
    fat: 9,
    score: 85,
    healthy: true,
    alternative: "Add mixed seeds for extra protein",
  },
  {
    keywords: ["rice", "bowl"],
    calories: 410,
    protein: 15,
    carbs: 58,
    fat: 11,
    score: 62,
    healthy: true,
    alternative: "Half rice + extra vegetables",
  },
  {
    keywords: ["fries", "fried"],
    calories: 430,
    protein: 5,
    carbs: 53,
    fat: 22,
    score: 28,
    healthy: false,
    alternative: "Baked sweet potato wedges",
  },
];

function getGoalAdvice(goal: string, healthy: boolean): string {
  const normalized = goal.toLowerCase();

  if (normalized.includes("weight")) {
    return healthy
      ? "Good pick. Keep portions moderate and pair with water to support a calorie deficit."
      : "Reduce portion size and swap in higher-protein, lower-fat ingredients to stay in a calorie deficit.";
  }

  if (normalized.includes("muscle")) {
    return healthy
      ? "Solid choice. Add a lean protein side to help hit your daily muscle-building targets."
      : "Increase lean protein and cut deep-fried elements so calories improve muscle gain quality.";
  }

  return healthy
    ? "Balanced choice. Pair with vegetables and stay hydrated for better overall health."
    : "Try a less processed version with more fiber and lean protein for better long-term health.";
}

export function getFallbackAnalysis(goal: string, input: string): FoodAnalysis {
  const normalized = input.toLowerCase();
  const matched = FOOD_DB.find((item) => item.keywords.some((k) => normalized.includes(k)));

  const baseline = matched ?? {
    keywords: [],
    calories: 360,
    protein: 14,
    carbs: 42,
    fat: 14,
    score: 55,
    healthy: false,
    alternative: "A minimally processed version with more vegetables",
  };

  return {
    food_name: input.trim() || "Detected food item",
    calories: baseline.calories,
    macronutrients: {
      protein: baseline.protein,
      carbs: baseline.carbs,
      fat: baseline.fat,
    },
    health_score: baseline.score,
    is_healthy: baseline.healthy,
    better_alternative: baseline.alternative,
    actionable_advice: getGoalAdvice(goal, baseline.healthy),
  };
}

export function parseResponse(rawResponse: string): FoodAnalysis {
  try {
    // Attempt to strip out any markdown formatting, e.g., ```json and ```
    let cleanString = rawResponse.trim();
    if (cleanString.startsWith('```json')) {
      cleanString = cleanString.replace(/^```json/, '');
    }
    if (cleanString.startsWith('```')) {
        cleanString = cleanString.replace(/^```/, '');
    }
    if (cleanString.endsWith('```')) {
      cleanString = cleanString.substring(0, cleanString.length - 3);
    }
    cleanString = cleanString.trim();

    const parsed = JSON.parse(cleanString);

    // Light shape validation (fallback mechanisms happen upstream if this throws)
    if (
      typeof parsed.food_name !== 'string' ||
      typeof parsed.calories !== 'number' ||
      !parsed.macronutrients ||
      typeof parsed.health_score !== 'number'
    ) {
      throw new Error('Invalid JSON structure returned from AI.');
    }

    return parsed as FoodAnalysis;
  } catch (error) {
    console.error('Failed to parse Gemini response:', rawResponse, error);
    throw new Error('Failed to parse the health analysis data.');
  }
}
