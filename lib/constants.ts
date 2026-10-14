export const PROTEIN_TARGET_MIN = 160;
export const PROTEIN_TARGET_MAX = 200;
export const CREATINE_GRAMS = 5;
export const DEFAULT_REST_SECONDS = 90;
export const KNEE_PAIN_JUMP_THRESHOLD = 3;
export const EASY_ROW_GUIDANCE =
  "Same structure at a conversational pace, about 20 spm.";
export const FALLBACK_AM_ROW = {
  title: "Easy steady row",
  description: "20 minutes easy aerobic row if the Concept2 workout of the day is unavailable.",
} as const;

export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const WORKOUT_WARMUP = [
  "2-min row",
  "Lateral band walks",
  "Clamshells",
  "Spanish squat hold 2×30 s",
  "10 slant-board squats",
  "Leg swings",
  "World's greatest stretch",
  "Ramp-up sets",
];

export const WORKOUT_COOLDOWN = [
  "Easy row or walk",
  "Couch stretch",
  "Hamstring stretch",
  "Calf stretch",
  "Breathing",
];

export const VOLLEYBALL_WARMUP = [
  "Jump rope",
  "Bands",
  "Spanish squat holds",
  "Walking lunges with twist",
  "Shoulder prep",
  "Pogo hops 2×15",
  "Approach jumps",
];

export const VOLLEYBALL_COOLDOWN = [
  "Spanish squat hold 3×45 s",
  "Couch / hip / calf stretches",
  "Sleeper stretch",
];

export const FUELING = {
  pre: "PB toast + fruit",
  post: "Shake with milk + creatine",
  evening: "Cottage cheese",
};

export const FOOD_STAPLES = [
  { name: "Bananas", proteinGrams: 1.3, sortOrder: 0 },
  { name: "Milk", proteinGrams: 8, sortOrder: 1 },
  { name: "Raisin bran", proteinGrams: 5, sortOrder: 2 },
  { name: "Granola", proteinGrams: 4, sortOrder: 3 },
  { name: "Protein powder", proteinGrams: 25, sortOrder: 4 },
  { name: "Oranges", proteinGrams: 1.2, sortOrder: 5 },
  { name: "Cottage cheese", proteinGrams: 25, sortOrder: 6 },
  { name: "Bread", proteinGrams: 4, sortOrder: 7 },
  { name: "Peanut butter", proteinGrams: 8, sortOrder: 8 },
  { name: "Leftover chicken", proteinGrams: 30, sortOrder: 9 },
] as const;

export const ROAD_STAPLES = [
  { name: "Eggs", proteinGrams: 12, sortOrder: 100 },
  { name: "Greek yogurt", proteinGrams: 17, sortOrder: 101 },
  { name: "Protein bar", proteinGrams: 20, sortOrder: 102 },
  { name: "Jerky", proteinGrams: 12, sortOrder: 103 },
  { name: "Nuts", proteinGrams: 6, sortOrder: 104 },
  { name: "Conference chicken", proteinGrams: 30, sortOrder: 105 },
] as const;

export const TRAVEL_WARMUP = [
  "Easy walk, bike, or march in place 2 min",
  "Lateral band walks",
  "Clamshells",
  "Spanish squat hold 2×30 s",
  "Leg swings",
  "World's greatest stretch",
];

export const TRAVEL_COOLDOWN = [
  "Easy walk",
  "Couch stretch",
  "Hamstring stretch",
  "Calf stretch",
  "Breathing",
];

export const DEFAULT_TRAVEL_RANGE = {
  startDate: "2026-10-18",
  endDate: "2026-10-24",
  label: "Raleigh / San Jose",
} as const;

export const TRAVEL_DAY_NOTES: Record<string, string> = {
  "2026-10-18":
    "Fly to Raleigh. After the flight: 20–30 min walk, hips and calves mobility, Spanish squat holds.",
  "2026-10-19":
    "Raleigh. Speaker dinner in the evening. Hotel-gym upper body in the morning (about 40 min). Protein main at dinner, 1–2 drinks max, water with each drink.",
  "2026-10-20":
    "Talk at 11 AM CT (12 PM ET). Morning: 15 min easy mobility and a walk only — nothing hard before the talk. Volleyball option: Taylor YMCA advanced pickup, 6:30 PM ET, after confirming guest access. Play about an hour and stop by 8. If no guest access, 20 min easy cardio intervals.",
  "2026-10-21":
    "Fly RDU → SJC. Walk the airport, do the daily knee work at the hotel, and sleep.",
  "2026-10-22":
    "San Jose. Hotel-gym legs, no jumping. Keep the weight moderate — Friday is volleyball.",
  "2026-10-23":
    "IVL open gym, 8–10:30 PM at Wilcox HS (Santa Clara). $14; register in the Reclub app. Replaces Beyond the Baseline this week. Morning easy: walk and band work. Cap play at about 90 minutes, sitting out every few games.",
  "2026-10-24":
    "Fly home. Spanish squat holds and a walk. Next-morning knee check: if it's 3 or higher on the stairs, keep next week's jumping to Friday only.",
};
