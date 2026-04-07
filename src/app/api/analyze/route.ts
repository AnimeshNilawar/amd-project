import { NextResponse } from 'next/server';
import { analyzeFoodWithGemini } from '@/lib/geminiClient';
import { FoodAnalysis, getFallbackAnalysis, parseResponse } from '@/lib/parseResponse';

type AnalyzeRequest = {
  goal?: string;
  textInput?: string;
  imageBase64?: string | null;
};

type AnalyzeResponse = {
  analysis: FoodAnalysis;
  fallbackUsed: boolean;
  message?: string;
};

function buildSuccessResponse(analysis: FoodAnalysis): NextResponse<AnalyzeResponse> {
  return NextResponse.json({ analysis, fallbackUsed: false });
}

function buildFallbackResponse(goal: string, input: string, message: string): NextResponse<AnalyzeResponse> {
  return NextResponse.json(
    {
      analysis: getFallbackAnalysis(goal, input),
      fallbackUsed: true,
      message,
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  let body: AnalyzeRequest | null = null;

  try {
    body = (await request.json()) as AnalyzeRequest;
    const goal = body.goal?.trim();
    const textInput = body.textInput?.trim() ?? '';
    const imageBase64 = body.imageBase64 ?? null;

    if (!goal) {
      return NextResponse.json({ message: 'Goal is required.' }, { status: 400 });
    }

    if (!textInput && !imageBase64) {
      return NextResponse.json({ message: 'Please provide a food name or upload an image.' }, { status: 400 });
    }

    const rawOutput = await analyzeFoodWithGemini(goal, textInput, imageBase64);
    const parsed = parseResponse(rawOutput);
    return buildSuccessResponse(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to analyze food right now.';
    console.error('Analyze API failed:', error);

    try {
      const fallbackGoal = body?.goal?.trim() ?? 'General Health';
      const input = body?.textInput?.trim() || 'food from image';
      return buildFallbackResponse(fallbackGoal, input, `${message} Showing fallback estimate.`);
    } catch {
      return NextResponse.json({ message }, { status: 500 });
    }
  }
}
