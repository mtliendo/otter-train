export type KneeWarning =
  | { active: false }
  | { active: true; sourceDate: string; kneePain: number };

export type PlanExercise = {
  id: number;
  name: string;
  prescription: string | null;
  targetSets: number;
  targetReps: string | null;
  notes: string | null;
  isCircuit: boolean;
};

export type LoggedSet = {
  id: number;
  setIndex: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

export type DayPayload = {
  user: { id: string; name: string; stub: boolean };
  date: string;
  weekday: number;
  kneeWarning: KneeWarning;
  plan: {
    id: number;
    title: string;
    subtitle: string | null;
    kind: string;
    location: string | null;
    timeWindow: string | null;
    notes: string | null;
    warmup: string[];
    cooldown: string[];
    fueling: {
      pre: string | null;
      post: string | null;
      evening: string | null;
    };
    exercises: PlanExercise[];
    habits: { id: number; name: string; prescription: string | null }[];
  } | null;
  log: {
    id: number;
    workoutCompleted: boolean;
    warmupDone: boolean;
    cooldownDone: boolean;
    fuelingPreDone: boolean;
    fuelingPostDone: boolean;
    fuelingEveningDone: boolean;
    creatineTaken: boolean;
    notes: string | null;
    habits: Record<string, boolean>;
    exercises: {
      id: number;
      planExerciseId: number | null;
      name: string;
      sortOrder: number;
      sets: LoggedSet[];
    }[];
    food: {
      id: number;
      name: string;
      proteinGrams: number;
      stapleId: number | null;
    }[];
  } | null;
  previousByExercise: Record<
    string,
    { setIndex: number; weight: number | null; reps: number | null }[]
  >;
  food: {
    totalProtein: number;
    staples: { id: number; name: string; proteinGrams: number }[];
  };
  sleep: {
    bedtime: string;
    wakeTime: string;
    quality: number;
    kneePain: number;
  } | null;
};

export type CalendarDayMarks = {
  workout: boolean;
  protein: boolean;
  sleep: boolean;
};

export type CalendarPayload = {
  year: number;
  month: number;
  days: Record<string, CalendarDayMarks>;
};
