import { EXERCISES, MUSCLES } from './catalog.js';

const WARRIOR = [
  { id: 'explosive-push-ups', name: 'Explosive push-ups', credit: 12, unit: 'reps', load: true, stats: ['strength'] },
  { id: 'broad-jump-burpees', name: 'Broad-jump burpees', credit: 10, unit: 'reps', load: true, stats: ['strength', 'cardio'] },
  { id: 'tuck-jumps', name: 'Tuck jumps', credit: 15, unit: 'reps', stats: ['power', 'cardio'] },
  { id: 'jumping-lunges', name: 'Jumping lunges', credit: 16, unit: 'reps', detail: '8 each leg', load: true, stats: ['power', 'core'] },
  { id: 'side-plank', name: 'Side plank', credit: 30, unit: 'sec', detail: '15 each side', load: true, stats: ['endurance', 'core'] },
  { id: 'high-knees', name: 'Controlled high knees', credit: 40, unit: 'reps', detail: '20 each leg', stats: ['cardio'] },
  { id: 'russian-twists', name: 'Russian twists', credit: 20, unit: 'reps', detail: '10 each side', stats: ['core'] },
  { id: 'plyo-squats', name: 'Plyo squats', credit: 15, unit: 'reps', stats: ['power', 'cardio'] },
];

const MONK = [
  { id: 'slow-push-ups', name: 'Slow push-ups', credit: 10, unit: 'reps', detail: '4-second descent', load: true, stats: ['strength'] },
  { id: 'wall-sit', name: 'Wall sit', credit: 45, unit: 'sec', stats: ['endurance'] },
  { id: 'dead-bug', name: 'Dead bug', credit: 16, unit: 'reps', detail: '8 each side', stats: ['core'] },
  { id: 'side-plank-hold', name: 'Side plank hold', credit: 30, unit: 'sec', detail: '15 each side', load: true, stats: ['endurance', 'core'] },
  { id: 'slow-squats', name: 'Slow squats', credit: 12, unit: 'reps', detail: '4-second descent', stats: ['power'] },
  { id: 'superman-hold', name: 'Superman hold', credit: 30, unit: 'sec', stats: ['endurance'] },
  { id: 'glute-bridge-hold', name: 'Glute bridge hold', credit: 40, unit: 'sec', stats: ['strength'] },
  { id: 'mountain-controlled', name: 'Controlled mountain climbers', credit: 20, unit: 'reps', detail: '10 each leg', stats: ['cardio', 'power'] },
];

const RECRUIT = [
  { id: 'knee-push-ups', name: 'Knee push-ups', credit: 12, unit: 'reps', load: true, stats: ['strength'] },
  { id: 'squat-still', name: 'Squats', credit: 15, unit: 'reps', detail: 'No jump', stats: ['power'] },
  { id: 'standing-marches', name: 'Standing marches', credit: 30, unit: 'reps', detail: '15 each leg', stats: ['cardio'] },
  { id: 'knee-plank', name: 'Knee plank', credit: 30, unit: 'sec', load: true, stats: ['endurance'] },
  { id: 'side-bends', name: 'Standing side bends', credit: 20, unit: 'reps', detail: '10 each side', stats: ['core'] },
  { id: 'glute-bridges', name: 'Glute bridges', credit: 15, unit: 'reps', stats: ['strength'] },
  { id: 'step-back-lunges', name: 'Step-back lunges', credit: 16, unit: 'reps', detail: '8 each leg', load: true, stats: ['core'] },
  { id: 'leg-raises', name: 'Lying leg raises', credit: 12, unit: 'reps', stats: ['core'] },
];

export const WORKOUT_PATHS = [
  {
    id: 'starter',
    name: 'Starter Path',
    multiplier: 0.75,
    exercises: RECRUIT,
    muscles: [
      { name: 'Chest, shoulders, triceps', moves: 'Knee push-ups' },
      { name: 'Quads and glutes', moves: 'Squats, Glute bridges, Step-back lunges' },
      { name: 'Core', moves: 'Knee plank, Standing side bends, Lying leg raises' },
      { name: 'Hip flexors', moves: 'Standing marches, Lying leg raises' },
    ],
    cardioLine: 'Standing marches are the cardio.',
  },
  {
    id: 'superhuman',
    name: 'Superhuman',
    multiplier: 1,
    exercises: EXERCISES,
    muscles: MUSCLES,
    cardioLine: 'Burpees, jump squats, and mountain climbers are the cardio.',
  },
  {
    id: 'warrior',
    name: 'Warrior',
    multiplier: 1.25,
    exercises: WARRIOR,
    muscles: [
      { name: 'Chest, shoulders, triceps', moves: 'Explosive push-ups, Broad-jump burpees' },
      { name: 'Quads and glutes', moves: 'Tuck jumps, Jumping lunges, Plyo squats' },
      { name: 'Obliques', moves: 'Side plank, Russian twists' },
      { name: 'Hip flexors', moves: 'Controlled high knees, Jumping lunges' },
    ],
    cardioLine: 'Broad-jump burpees, tuck jumps, high knees, and plyo squats are the cardio.',
  },
  {
    id: 'monk',
    name: 'Monk',
    multiplier: 0.9,
    exercises: MONK,
    muscles: [
      { name: 'Chest, shoulders, triceps', moves: 'Slow push-ups' },
      { name: 'Quads and glutes', moves: 'Wall sit, Slow squats, Glute bridge hold' },
      { name: 'Core', moves: 'Dead bug, Side plank hold' },
      { name: 'Back', moves: 'Superman hold' },
      { name: 'Hip flexors', moves: 'Controlled mountain climbers' },
    ],
    cardioLine: 'Controlled mountain climbers are the cardio.',
  },
  {
    id: 'recruit',
    name: 'Recruit',
    multiplier: 0.75,
    exercises: RECRUIT,
    muscles: [
      { name: 'Chest, shoulders, triceps', moves: 'Knee push-ups' },
      { name: 'Quads and glutes', moves: 'Squats, Glute bridges, Step-back lunges' },
      { name: 'Core', moves: 'Knee plank, Standing side bends, Lying leg raises' },
      { name: 'Hip flexors', moves: 'Standing marches, Lying leg raises' },
    ],
    cardioLine: 'Standing marches are the cardio.',
  },
];

export function workoutPath(id) {
  return WORKOUT_PATHS.find((path) => path.id === id) || WORKOUT_PATHS.find((path) => path.id === 'starter');
}

export function exercisesFor(id) {
  return workoutPath(id).exercises;
}

export function exerciseById(id) {
  for (const path of WORKOUT_PATHS) {
    const found = path.exercises.find((exercise) => exercise.id === id);
    if (found) return found;
  }
  return null;
}
