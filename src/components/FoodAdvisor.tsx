"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight, Image as ImageIcon, Send, Target, X } from 'lucide-react';
import { FoodAnalysis } from '../lib/parseResponse';
import AnalysisResult from './AnalysisResult';

const GOALS = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'general_health', label: 'General Health' }
];

const EXAMPLES = ['A slice of pepperoni pizza', 'A bowl of quinoa salad', 'Double cheeseburger'];

type NutritionTip = {
  eyebrow: string;
  title: string;
  body: string;
};

const NUTRITION_TIPS: Record<string, NutritionTip[]> = {
  'Weight Loss': [
    {
      eyebrow: 'Satiety first',
      title: 'Prioritize protein and fiber',
      body: 'These help you feel full longer, which makes calorie control easier without feeling deprived.',
    },
    {
      eyebrow: 'Better cooking methods',
      title: 'Choose grilled, baked, or steamed foods',
      body: 'These usually keep calories lower than fried versions while still feeling satisfying.',
    },
    {
      eyebrow: 'Hidden calories',
      title: 'Watch drinks and sauces',
      body: 'Sugary beverages, creamy sauces, and extras can silently raise the total calorie load.',
    },
  ],
  'Muscle Gain': [
    {
      eyebrow: 'Recovery fuel',
      title: 'Pair carbs with lean protein',
      body: 'That combination supports training recovery and helps you build meals that actually move the needle.',
    },
    {
      eyebrow: 'Calorie quality',
      title: 'Add nutrient-dense extras',
      body: 'Nuts, avocado, olive oil, and whole grains raise calories without making the meal junk-heavy.',
    },
    {
      eyebrow: 'Consistency',
      title: 'Eat enough total energy',
      body: 'Muscle gain stalls when intake is too low, even if the food choices look healthy on paper.',
    },
  ],
  'General Health': [
    {
      eyebrow: 'Balanced plate',
      title: 'Build around whole foods',
      body: 'Vegetables, whole grains, and lean protein create a strong baseline for everyday nutrition.',
    },
    {
      eyebrow: 'Practical mindset',
      title: 'Aim for balance, not perfection',
      body: 'One food rarely defines a full day. The goal is consistently decent choices over time.',
    },
    {
      eyebrow: 'Long-term health',
      title: 'Choose less processed foods when possible',
      body: 'Less processing usually means better fiber, better micronutrients, and easier portion control.',
    },
  ],
};

type AnalyzeResponse = {
  analysis: FoodAnalysis;
  fallbackUsed: boolean;
  message?: string;
};

export default function FoodAdvisor() {
  const [textInput, setTextInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].label);
  const [tipIndex, setTipIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tips = NUTRITION_TIPS[selectedGoal] ?? NUTRITION_TIPS['General Health'];

  useEffect(() => {
    setTipIndex(0);
  }, [selectedGoal]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % tips.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [tips.length]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExampleSelect = (example: string) => {
    setTextInput(example);
    setImageBase64(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!textInput.trim() && !imageBase64) {
      setError('Please provide a food name or upload an image.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: selectedGoal,
          textInput,
          imageBase64,
        }),
      });

      const data = (await response.json()) as AnalyzeResponse | { message?: string };

      if (!response.ok || !('analysis' in data)) {
        throw new Error(data.message || 'Unable to analyze food.');
      }

      setResult(data.analysis);
      setError(data.fallbackUsed ? data.message ?? 'Showing fallback estimate.' : null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong while analyzing your food.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Area */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Goal Selector */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Target className="w-4 h-4 mr-2 text-brand-400" />
                Select Your Goal
              </label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.label)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${selectedGoal === g.label ? 'bg-brand-500 text-white font-medium shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-glass-border'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Selection */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What are you eating? (e.g., Avocado Toast)"
                  className="glass-input w-full p-4 pr-12 rounded-xl text-lg font-medium placeholder-gray-500 focus:ring-brand-500"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Upload an image"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </div>

              {/* Image Preview */}
              {imageBase64 && (
                <div className="relative inline-block mt-4 glass-panel p-2 rounded-xl border border-brand-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <Image src={imageBase64} alt="Food upload" width={128} height={128} className="h-32 w-32 object-cover rounded-lg" unoptimized />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Examples */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Try an example</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleExampleSelect(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-lg shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>AI is analyzing...</>
              ) : (
                <>Analyze Food <Send className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </form>

          <div className="glass-panel rounded-2xl p-5 border border-white/10 overflow-hidden relative">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-300/80 font-semibold">Nutrition Tips</p>
                <h3 className="text-lg font-semibold text-white">Quick guidance for {selectedGoal.toLowerCase()}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {tipIndex + 1}/{tips.length}
                </span>
                <button
                  type="button"
                  onClick={() => setTipIndex((currentIndex) => (currentIndex - 1 + tips.length) % tips.length)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous nutrition tip"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTipIndex((currentIndex) => (currentIndex + 1) % tips.length)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Next nutrition tip"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/20">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${tipIndex * 100}%)` }}
              >
                {tips.map((tip) => (
                  <div key={tip.title} className="w-full shrink-0 p-5 md:p-6 min-h-[170px] flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="inline-flex w-fit items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-200">
                        {tip.eyebrow}
                      </span>
                      <h4 className="text-xl md:text-2xl font-semibold text-white leading-tight">
                        {tip.title}
                      </h4>
                      <p className="text-sm md:text-base leading-relaxed text-gray-300 max-w-2xl">
                        {tip.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {tips.map((tip, index) => (
                <button
                  key={tip.title}
                  type="button"
                  onClick={() => setTipIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === tipIndex ? 'w-8 bg-brand-500' : 'w-2.5 bg-white/20 hover:bg-white/35'}`}
                  aria-label={`Show tip ${index + 1}`}
                  aria-pressed={index === tipIndex}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Output Results Area */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[300px] flex items-center justify-center">
             {!loading && !result && !error ? (
               <div className="text-center space-y-4 opacity-50 p-8 glass-panel rounded-2xl w-full border-dashed border-2 border-white/10">
                 <ImageIcon className="w-16 h-16 mx-auto text-gray-500" />
                 <h3 className="text-xl font-medium text-white">Your Insights Await</h3>
                 <p className="text-gray-400">Enter a food name or upload a photo to get a detailed AI health analysis.</p>
               </div>
             ) : (
               <AnalysisResult result={result} loading={loading} error={error} />
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
