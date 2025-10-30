'use client'

import { useState } from 'react'
import { Clock, Target, Users } from 'lucide-react'

const WORKOUT_SCHEDULE = [
  {
    day: 'Monday',
    dayNumber: 1,
    focus: 'Chest, Back, Shoulders',
    color: 'from-red-500 to-red-600',
    warmup: [
      'Arm circles forward & backward – 30 sec each',
      'Shoulder shrugs – 20 reps',
      'Push-ups (slow, controlled) – 10–15 reps',
      'Cat-cow stretch – 1 min',
      'Band pull-aparts – 15 reps',
      'Torso twists – 1 min'
    ],
    exercises: [
      'Flat bench press (barbell or dumbbell) – 4×10–12',
      'Incline bench press – 3×10–12',
      'Dumbbell fly – 3×12–15',
      'Push-ups variations – 3×12–15',
      'Pull-ups / Assisted pull-ups – 3×8–12',
      'Bent-over barbell or dumbbell rows – 3×10–12',
      'Lat pulldown – 3×10–12',
      'Seated cable row – 3×12',
      'Overhead shoulder press – 3×10–12',
      'Lateral raises – 3×12–15',
      'Front raises – 3×12',
      'Reverse fly (rear delts) – 3×12–15'
    ],
    cooldown: [
      'Chest stretch on wall/door frame – 30 sec each side',
      'Cross-body shoulder stretch – 30 sec each arm',
      'Child\'s pose – 1–2 min',
      'Cat-cow stretch – 1 min',
      'Thread-the-needle stretch – 30 sec each side'
    ]
  },
  {
    day: 'Tuesday',
    dayNumber: 2,
    focus: 'Legs, Arms, Core',
    color: 'from-blue-500 to-blue-600',
    warmup: [
      'Jumping jacks – 1 min',
      'High knees – 30 sec',
      'Bodyweight squats – 15 reps',
      'Arm circles/swings – 30 sec',
      'Lunges in place – 10 each leg',
      'Hip circles – 1 min'
    ],
    exercises: [
      'Barbell/Dumbbell squats – 4×12',
      'Walking lunges – 3×12 each leg',
      'Romanian deadlifts – 3×10',
      'Step-ups (with dumbbells) – 3×12 each leg',
      'Calf raises – 3×20',
      'Dumbbell curls – 3×12–15',
      'Hammer curls – 3×12',
      'Tricep dips – 3×12',
      'Overhead dumbbell triceps extension – 3×12',
      'Plank – 3×30–60 sec',
      'Side plank – 2×30 sec each side',
      'Russian twists (with weight) – 3×15 each side',
      'Leg raises – 3×12–15',
      'Bicycle crunches – 3×20'
    ],
    cooldown: [
      'Standing quad stretch – 30 sec each leg',
      'Hamstring stretch (seated or lying) – 30 sec each leg',
      'Triceps stretch – 30 sec each arm',
      'Side stretch – 30 sec each side',
      'Cobra stretch (abs) – 30 sec'
    ]
  },
  {
    day: 'Wednesday',
    dayNumber: 3,
    focus: 'Biceps, Triceps, Glutes',
    color: 'from-green-500 to-green-600',
    warmup: [
      'Arm swings/circles – 30 sec',
      'Light squats – 10–15 reps',
      'Hip circles – 1 min',
      'Push-ups – 10–12 reps',
      'Glute bridges – 10–15 reps',
      'Dynamic leg swings – 10 each leg'
    ],
    exercises: [
      'Dumbbell curls – 3×12',
      'Concentration curls – 3×10 each arm',
      'Barbell curls – 3×12',
      'Cable curls – 3×12',
      'Tricep kickbacks – 3×12',
      'Overhead dumbbell triceps extension – 3×12',
      'Close-grip bench press – 3×10–12',
      'Rope pushdowns – 3×12',
      'Hip thrusts – 4×12–15',
      'Glute bridges – 3×15',
      'Donkey kicks – 3×15 each leg',
      'Bulgarian split squats – 3×10 each leg',
      'Side-lying leg raises – 3×15 each side'
    ],
    cooldown: [
      'Seated hamstring/glute stretch – 30 sec each leg',
      'Figure-four stretch – 30 sec each side',
      'Biceps wall stretch – 30 sec each arm',
      'Overhead triceps stretch – 30 sec each arm',
      'Pigeon pose (glutes/hips) – 30 sec each side'
    ]
  },
  {
    day: 'Thursday',
    dayNumber: 4,
    focus: 'Active Recovery + Flexibility',
    color: 'from-yellow-500 to-yellow-600',
    warmup: [
      'Gentle arm circles – 30 sec',
      'Neck rolls – 30 sec',
      'Light walking in place – 1 min'
    ],
    exercises: [
      'Light Walking – 20-30 min',
      'Dynamic Stretching',
      'Yoga Flow',
      'Foam Rolling',
      'Meditation – 10 min'
    ],
    cooldown: [
      'Full body stretching routine – 15-20 min',
      'Deep breathing exercises – 5 min'
    ]
  },
  {
    day: 'Friday',
    dayNumber: 5,
    focus: 'Upper Body Power + Core',
    color: 'from-purple-500 to-purple-600',
    warmup: [
      'Arm swings – 30 sec',
      'Shoulder rolls – 20 reps',
      'Light push-ups – 8-10 reps',
      'Torso twists – 1 min'
    ],
    exercises: [
      'Incline Dumbbell Press – 4×8-10',
      'Pull-ups/Lat Pulldown – 4×8-12',
      'Overhead Press – 3×10-12',
      'Bent-over Row – 3×10-12',
      'Dips – 3×10-15',
      'Cable Curls – 3×12',
      'Plank – 3×45-60 sec',
      'Russian Twists – 3×20'
    ],
    cooldown: [
      'Upper body stretching – 10-15 min',
      'Child\'s pose – 2 min'
    ]
  },
  {
    day: 'Saturday',
    dayNumber: 6,
    focus: 'Full Body + Conditioning',
    color: 'from-indigo-500 to-indigo-600',
    warmup: [
      'Full body dynamic warm-up – 5-8 min',
      'Joint mobility routine'
    ],
    exercises: [
      'Deadlifts – 4×8-10',
      'Squats – 4×10-12',
      'Push-ups – 3×12-15',
      'Pull-ups – 3×8-12',
      'Lunges – 3×12 each leg',
      'Plank – 3×60 sec',
      'Burpees – 3×8-10',
      'Mountain Climbers – 3×20'
    ],
    cooldown: [
      'Full body stretching – 15-20 min',
      'Relaxation – 5 min'
    ]
  },
  {
    day: 'Sunday',
    dayNumber: 7,
    focus: 'Rest + Recovery',
    color: 'from-gray-500 to-gray-600',
    warmup: [
      'Gentle movements – 5 min'
    ],
    exercises: [
      'Complete Rest or Light Activity',
      'Gentle Yoga',
      'Meditation',
      'Meal Prep',
      'Recovery Planning'
    ],
    cooldown: [
      'Relaxation and preparation for next week'
    ]
  }
]

export default function WorkoutSchedule() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentWorkoutDay = today === 0 ? 7 : today // Convert Sunday to 7

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Weekly Workout Schedule</h2>
        <p className="text-white/70">Your personalized training program</p>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKOUT_SCHEDULE.map((workout) => (
          <div
            key={workout.dayNumber}
            className={`relative bg-gradient-to-r ${workout.color} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
              currentWorkoutDay === workout.dayNumber ? 'ring-4 ring-white/50' : ''
            }`}
            onClick={() => setSelectedDay(selectedDay === workout.dayNumber ? null : workout.dayNumber)}
          >
            {currentWorkoutDay === workout.dayNumber && (
              <div className="absolute top-2 right-2">
                <div className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                  TODAY
                </div>
              </div>
            )}

            <div className="text-white">
              <h3 className="text-lg font-bold mb-2">{workout.day}</h3>
              <p className="text-sm opacity-90 mb-4">{workout.focus}</p>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Target size={16} />
                  <span>{workout.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>45-60 min</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedDay && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          {(() => {
            const workout = WORKOUT_SCHEDULE.find(w => w.dayNumber === selectedDay)
            if (!workout) return null

            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{workout.day} Workout</h3>
                    <p className="text-white/70">{workout.focus}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Warmup Section */}
                {workout.warmup && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      🔥 Warm-Up (7-10 min)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workout.warmup.map((exercise, index) => (
                        <div
                          key={index}
                          className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20"
                        >
                          <span className="text-yellow-100 text-sm">{exercise}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Exercises */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    💪 Main Exercises
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{exercise}</span>
                          <span className="text-white/50 text-sm">#{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooldown Section */}
                {workout.cooldown && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      🧘 Cool-Down (7-10 min)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workout.cooldown.map((exercise, index) => (
                        <div
                          key={index}
                          className="bg-green-500/10 rounded-lg p-3 border border-green-500/20"
                        >
                          <span className="text-green-100 text-sm">{exercise}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                    Start Workout
                  </button>
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                    View Exercise Videos
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Tips */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">💡 Training Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
          <div>
            <h4 className="font-semibold mb-2">🔥 Warm-Up (10 min)</h4>
            <ul className="text-sm space-y-1">
              <li>• Jumping Jacks - 2 sets × 30 sec</li>
              <li>• Arm Circles - 15 each direction</li>
              <li>• Shoulder Rotations - 2×15</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🧘 Cool-Down (10 min)</h4>
            <ul className="text-sm space-y-1">
              <li>• Chest Stretch - 30 sec each side</li>
              <li>• Shoulder Stretch - 30 sec</li>
              <li>• Deep Breathing - 5 slow breaths</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}