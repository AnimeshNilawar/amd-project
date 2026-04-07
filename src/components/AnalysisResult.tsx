"use client";

import React from 'react';
import { FoodAnalysis } from '../lib/parseResponse';
import { Activity, Flame, Leaf, Apple } from 'lucide-react';

interface Props {
  result: FoodAnalysis | null;
  loading: boolean;
  error: string | null;
}

export default function AnalysisResult({ result, loading, error }: Props) {
  if (loading) {
    return (
      <div className="glass-panel w-full rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse h-64">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        <p className="text-brand-100 font-medium">Analyzing your food...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel w-full rounded-2xl p-6 border-red-500/30 bg-red-500/10">
        <p className="text-red-400 font-medium text-center">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Stat */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity size={120} />
        </div>
        
        <div className="z-10">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            {result.food_name}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${result.is_healthy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {result.is_healthy ? 'Healthy Choice' : 'Proceed with caution'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 z-10">
          <div className="text-center">
            <div className={`text-4xl font-extrabold ${getScoreColor(result.health_score)}`}>
              {result.health_score}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Health Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Macros */}
        <div className="glass-panel rounded-xl p-5 space-y-5">
          <div className="flex items-center font-semibold text-lg text-white mb-2">
            <Flame className="w-5 h-5 mr-2 text-orange-400" />
            Nutritional Facts
          </div>
          
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400">Calories</span>
            <span className="text-2xl font-bold text-white">{result.calories} <span className="text-sm font-normal text-gray-400">kcal</span></span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Protein</span>
                <span className="font-medium text-white">{result.macronutrients.protein}g</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${Math.min((result.macronutrients.protein / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Carbs</span>
                <span className="font-medium text-white">{result.macronutrients.carbs}g</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${Math.min((result.macronutrients.carbs / 100) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Fat</span>
                <span className="font-medium text-white">{result.macronutrients.fat}g</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min((result.macronutrients.fat / 40) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-5 h-full flex flex-col">
            <div className="flex items-center font-semibold text-lg text-white mb-3">
              <Leaf className="w-5 h-5 mr-2 text-green-400" />
              AI Advice
            </div>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base flex-1">
              {result.actionable_advice}
            </p>
            
            {result.better_alternative && !result.is_healthy && (
              <div className="mt-4 pt-4 border-t border-glass-border">
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Better Alternative</div>
                <div className="flex items-center text-green-300 font-medium">
                  <Apple className="w-4 h-4 mr-2" />
                  {result.better_alternative}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
