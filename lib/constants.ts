export const PROTEIN_TARGET_MIN = 160;
export const PROTEIN_TARGET_MAX = 200;
export const CREATINE_GRAMS = 5;
export const DEFAULT_REST_SECONDS = 90;
export const KNEE_PAIN_JUMP_THRESHOLD = 3;

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
