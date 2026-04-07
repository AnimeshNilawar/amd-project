"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Image as ImageIcon, Send, Target, X } from 'lucide-react';
import { analyzeFoodWithGemini } from '../lib/geminiClient';
import { parseResponse, FoodAnalysis, getFallbackAnalysis } from '../lib/parseResponse';
import AnalysisResult from './AnalysisResult';

const GOALS = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'general_health', label: 'General Health' }
];

const EXAMPLES = ['A slice of pepperoni pizza', 'A bowl of quinoa salad', 'Double cheeseburger'];

export default function FoodAdvisor() {
  const [textInput, setTextInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].label);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

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

    if (!geminiApiKey.trim()) {
      setError('Missing NEXT_PUBLIC_GEMINI_API_KEY. Add it to your .env.local file and restart the dev server.');
      return;
    }

    if (!textInput.trim() && !imageBase64) {
      setError('Please provide a food name or upload an image.');
      return;
    }

    setLoading(true);

    try {
      const rawOutput = await analyzeFoodWithGemini(geminiApiKey, selectedGoal, textInput, imageBase64);
      const parsedData = parseResponse(rawOutput);
      setResult(parsedData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong while analyzing your food.';
      const fallbackInput = textInput.trim() || 'food from image';
      setResult(getFallbackAnalysis(selectedGoal, fallbackInput));
      setError(`Live AI analysis failed (${message}). Showing fallback estimate.`);
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
