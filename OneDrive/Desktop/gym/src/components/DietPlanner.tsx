'use client'

import { useState } from 'react'
import { Clock, Target, Droplets, CheckCircle } from 'lucide-react'

const DIET_PLAN = {
  morning: {
    time: "On waking",
    items: [
      "1 glass warm water + lemon + pinch turmeric",
      "5 soaked almonds + 2 walnuts"
    ],
    icon: "🌅"
  },
  breakfast: {
    time: "8:30–9:00 AM",
    items: [
      "4 boiled egg whites or paneer bhurji/tofu",
      "1 brown bread or oats with milk",
      "1 banana or apple",
      "Green tea"
    ],
    icon: "🍳"
  },
  midMorning: {
    time: "11 AM",
    items: [
      "1 fruit (papaya/orange/guava)",
      "Handful of pumpkin or sunflower seeds"
    ],
    icon: "🍎"
  },
  lunch: {
    time: "1–1:30 PM",
    items: [
      "2 multigrain chapatis",
      "1 bowl dal / rajma / chole / soya chunks",
      "1 bowl sabzi (mixed veg / spinach / bhindi)",
      "Salad (carrot + cucumber + lemon)",
      "Buttermilk"
    ],
    icon: "🍛"
  },
  evening: {
    time: "4:30–5:00 PM",
    items: [
      "Green tea or black coffee",
      "Roasted chana / makhana / sprouts"
    ],
    icon: "☕"
  },
  dinner: {
    time: "7:30–8:30 PM",
    items: [
      "1 bowl vegetable soup or paneer + veggies stir-fry",
      "1 roti / small bowl brown rice",
      "Add olive oil or ghee (1 tsp max)"
    ],
    icon: "🍲"
  },
  beforeBed: {
    time: "Before Bed",
    items: [
      "1 glass warm milk (with turmeric or ashwagandha if possible)"
    ],
    icon: "🛏️"
  }
}

const EXTRA_TIPS = [
  {
    icon: "💧",
    title: "Hydration",
    tip: "Drink 3–4 L water daily"
  },
  {
    icon: "🚫",
    title: "Avoid",
    tip: "Sugar, refined carbs, and fried foods"
  },
  {
    icon: "😴",
    title: "Sleep",
    tip: "Get 7–8 hours sleep for recovery and hormones"
  },
  {
    icon: "🦷",
    title: "Jawline",
    tip: "Practice chin tucks (10 reps × 2) daily and chew sugar-free gum (10 min)"
  },
  {
    icon: "🏃",
    title: "Posture",
    tip: "Stand against wall daily for 2 min, head touching the wall"
  }
]

export default function DietPlanner() {
  const [completedMeals, setCompletedMeals] = useState<string[]>([])
  const [waterIntake, setWaterIntake] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const toggleMealCompletion = (mealKey: string) => {
    setCompletedMeals(prev => 
      prev.includes(mealKey) 
        ? prev.filter(meal => meal !== mealKey)
        : [...prev, mealKey]
    )
  }

  const addWater = () => {
    setWaterIntake(prev => Math.min(prev + 0.25, 4))
  }

  const resetWater = () => {
    setWaterIntake(0)
  }

  const currentTime = new Date().getHours()
  const getCurrentMeal = () => {
    if (currentTime < 8) return 'morning'
    if (currentTime < 11) return 'breakfast'
    if (currentTime < 13) return 'midMorning'
    if (currentTime < 16) return 'lunch'
    if (currentTime < 19) return 'evening'
    if (currentTime < 21) return 'dinner'
    return 'beforeBed'
  }

  const currentMeal = getCurrentMeal()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🥗 Diet Planner</h2>
        <p className="text-white/70">Vegetarian diet for fat loss + immunity + lean muscle</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Daily Nutrition Plan</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Water Intake Tracker */}
        <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-400" size={20} />
              <span className="text-white font-medium">Water Intake</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addWater}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                +250ml
              </button>
              <button
                onClick={resetWater}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(waterIntake / 4) * 100}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{waterIntake.toFixed(1)}/4.0L</span>
          </div>
        </div>

        {/* Meal Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DIET_PLAN).map(([key, meal]) => (
            <div 
              key={key}
              className={`bg-white/5 rounded-lg p-4 border transition-all duration-300 ${
                currentMeal === key 
                  ? 'border-blue-400 bg-blue-500/20' 
                  : completedMeals.includes(key)
                  ? 'border-green-400 bg-green-500/20'
                  : 'border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Clock size={12} />
                      <span>{meal.time}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleMealCompletion(key)}
                  className={`transition-colors ${
                    completedMeals.includes(key)
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-white/30 hover:text-white/70'
                  }`}
                >
                  <CheckCircle size={20} />
                </button>
              </div>

              <ul className="space-y-1">
                {meal.items.map((item, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-white/40 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {currentMeal === key && (
                <div className="mt-3 text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                  Current meal time
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target size={20} />
            Today's Progress
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {completedMeals.length}
              </div>
              <div className="text-white/70 text-sm">Meals Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {Object.keys(DIET_PLAN).length - completedMeals.length}
              </div>
              <div className="text-white/70 text-sm">Meals Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">
                {waterIntake.toFixed(1)}L
              </div>
              <div className="text-white/70 text-sm">Water Intake</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((completedMeals.length / Object.keys(DIET_PLAN).length) * 100)}%
              </div>
              <div className="text-white/70 text-sm">Diet Adherence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Tips */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">💡 Extra Health Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXTRA_TIPS.map((tip, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <h4 className="text-white font-semibold mb-1">{tip.title}</h4>
                  <p className="text-white/70 text-sm">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutritional Guidelines */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">📋 Nutritional Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3 text-green-400">✅ Foods to Include</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Protein-rich foods: Paneer, tofu, legumes, eggs</li>
              <li>• Complex carbs: Brown rice, multigrain chapati, oats</li>
              <li>• Healthy fats: Nuts, seeds, olive oil, ghee</li>
              <li>• Fiber: Fresh vegetables, fruits, whole grains</li>
              <li>• Antioxidants: Green tea, turmeric, colorful vegetables</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-red-400">❌ Foods to Avoid</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Refined sugar and artificial sweeteners</li>
              <li>• Processed and packaged foods</li>
              <li>• Deep-fried foods and trans fats</li>
              <li>• White bread and refined carbohydrates</li>
              <li>• Excessive salt and sodium-rich foods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}