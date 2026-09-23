export const STATS = [
  { id: 'strength', name: 'Strength', mark: 'sword' },
  { id: 'power', name: 'Power', mark: 'lightning' },
  { id: 'endurance', name: 'Endurance', mark: 'shield' },
  { id: 'core', name: 'Core', mark: 'coil' },
  { id: 'cardio', name: 'Cardio', mark: 'flame' },
];

export const EXERCISES = [
  {
    id: 'burpees',
    name: 'Burpees',
    credit: 15,
    unit: 'reps',
    stats: ['strength', 'cardio'],
    variant: {
      stat: 'cardio',
      name: 'Wildfire',
      credit: 40,
      unit: 'reps',
      detail: '40 burpees, aim under 6 min',
      guideId: 'wildfire',
    },
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    credit: 15,
    unit: 'reps',
    rangeLabel: '15–18',
    stats: ['strength'],
    variant: {
      stat: 'strength',
      name: 'Twin Fang',
      credit: 8,
      unit: 'reps',
      detail: '8 diamond push-ups',
      guideId: 'twin-fang',
    },
  },
  {
    id: 'jump-squats',
    name: 'Jump squats',
    credit: 20,
    unit: 'reps',
    stats: ['power', 'cardio'],
    variant: {
      stat: 'power',
      name: 'Stormrunner',
      credit: 20,
      unit: 'reps',
      detail: '20 tuck jumps',
      guideId: 'stormrunner',
    },
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain climbers',
    credit: 30,
    unit: 'reps',
    detail: '15 each leg',
    stats: ['power', 'cardio'],
  },
  {
    id: 'plank-downdog',
    name: 'Plank-to-downdog walk',
    credit: 16,
    unit: 'reps',
    detail: '8 each direction',
    stats: ['endurance'],
    variant: {
      stat: 'endurance',
      name: 'Unbroken Wall',
      credit: 120,
      unit: 'sec',
      detail: '2-min plank',
      guideId: 'unbroken-wall',
    },
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse lunge w/ knee drive',
    credit: 20,
    unit: 'reps',
    detail: '10 each leg',
    stats: ['core'],
  },
  {
    id: 'bear-crawl',
    name: 'Bear crawl',
    credit: 30,
    unit: 'sec',
    stats: ['endurance'],
  },
  {
    id: 'bicycle',
    name: 'Bicycle crunches',
    credit: 20,
    unit: 'reps',
    detail: '10 each side',
    stats: ['core'],
    variant: {
      stat: 'core',
      name: 'Anchor Point',
      credit: 45,
      unit: 'sec',
      detail: '45-sec hollow hold',
      guideId: 'anchor-point',
    },
  },
];

export const MUSCLES = [
  { name: 'Chest, shoulders, triceps', moves: 'Push-ups, Burpees' },
  { name: 'Quads and glutes', moves: 'Jump squats, Reverse lunge w/ knee drive, Burpees' },
  { name: 'Hip flexors', moves: 'Mountain climbers, Reverse lunge w/ knee drive' },
  { name: 'Shoulders, hamstrings, calves', moves: 'Plank-to-downdog walk' },
  { name: 'Core and quads', moves: 'Bear crawl, Plank-to-downdog walk' },
  { name: 'Obliques', moves: 'Bicycle crunches' },
];

export const TRIALS = [
  { id: 'strength-3', stat: 'strength', need: 3, name: '15 push-ups unbroken', guideId: 'trial-strength-3' },
  { id: 'strength-6', stat: 'strength', need: 6, name: '30 push-ups unbroken', guideId: 'trial-strength-6' },
  { id: 'strength-9', stat: 'strength', need: 9, name: '50 push-ups unbroken', guideId: 'trial-strength-9' },
  { id: 'strength-12', stat: 'strength', need: 12, name: '5 deficit or archer push-ups', guideId: 'trial-strength-12' },
  { id: 'power-3', stat: 'power', need: 3, name: '20 full-depth jump squats unbroken', guideId: 'trial-power-3' },
  { id: 'power-6', stat: 'power', need: 6, name: 'Broad jump at least 1.5× your height', guideId: 'trial-power-6' },
  { id: 'power-9', stat: 'power', need: 9, name: '30 tuck jumps unbroken', guideId: 'trial-power-9' },
  { id: 'power-12', stat: 'power', need: 12, name: '5 single-leg jump squats per leg', guideId: 'trial-power-12' },
  { id: 'endurance-3', stat: 'endurance', need: 3, name: '90 sec plank hold', guideId: 'trial-endurance-3' },
  { id: 'endurance-6', stat: 'endurance', need: 6, name: '2 min continuous bear crawl', guideId: 'trial-endurance-6' },
  { id: 'endurance-9', stat: 'endurance', need: 9, name: '3 min plank hold', guideId: 'trial-endurance-9' },
  { id: 'endurance-12', stat: 'endurance', need: 12, name: '5 min continuous bear crawl', guideId: 'trial-endurance-12' },
  { id: 'core-3', stat: 'core', need: 3, name: '30 bicycle crunches unbroken', guideId: 'trial-core-3' },
  { id: 'core-6', stat: 'core', need: 6, name: '30 sec hollow body hold', guideId: 'trial-core-6' },
  { id: 'core-9', stat: 'core', need: 9, name: '60 sec hollow body hold', guideId: 'trial-core-9' },
  { id: 'core-12', stat: 'core', need: 12, name: '20 V-ups unbroken', guideId: 'trial-core-12' },
  { id: 'cardio-3', stat: 'cardio', need: 3, name: '10 burpees under 60 sec', guideId: 'trial-cardio-3' },
  { id: 'cardio-6', stat: 'cardio', need: 6, name: '20 burpees under 90 sec', guideId: 'trial-cardio-6' },
  { id: 'cardio-9', stat: 'cardio', need: 9, name: '50 burpees under 5 min', guideId: 'trial-cardio-9' },
  { id: 'cardio-12', stat: 'cardio', need: 12, name: '100 burpees under 10 min', guideId: 'trial-cardio-12' },
];

export const CLASS_TRIALS = [
  {
    id: 'gauntlet',
    skillId: 'berserker',
    skillName: 'Berserker Awakening',
    name: 'The Gauntlet',
    detail: '50 burpees + 50 jump squats + 50 push-ups, any order, under 15 minutes',
    guideId: 'trial-gauntlet',
  },
  {
    id: 'iron-core',
    skillId: 'guardian',
    skillName: "Guardian's Resolve",
    name: 'Iron Core',
    detail: '3-min plank, then 50 bicycle crunches, then 20 reverse lunges per leg, no rest between movements',
    guideId: 'trial-iron-core',
  },
  {
    id: 'full-send',
    skillId: 'ascended',
    skillName: 'Ascended Form',
    name: 'Full Send',
    detail: 'All 4 rounds of the daily circuit with zero rest between exercises (rest only between rounds)',
    guideId: 'trial-full-send',
  },
];

export const PATHS = [
  {
    id: 'bulwark',
    name: 'Path of the Bulwark',
    stat: 'strength',
    nodes: [
      { id: 'steady-guard', tier: 2, name: 'Steady Guard', detail: 'Full-ROM push-up, 3-sec descent', guideId: 'steady-guard' },
      { id: 'piston-strike', tier: 5, name: 'Piston Strike', detail: '10 push-ups unbroken', guideId: 'piston-strike' },
      { id: 'twin-fang', tier: 8, name: 'Twin Fang', detail: '8 diamond push-ups unbroken', guideId: 'twin-fang' },
      { id: 'warbringer', tier: 11, name: 'Warbringer', detail: '4 archer push-ups per side', guideId: 'warbringer' },
    ],
  },
  {
    id: 'tempest',
    name: 'Path of the Tempest',
    stat: 'power',
    nodes: [
      { id: 'spark-step', tier: 2, name: 'Spark Step', detail: '15 explosive bodyweight squats', guideId: 'spark-step' },
      { id: 'thunderclap', tier: 5, name: 'Thunderclap', detail: 'Broad jump equal to own height', guideId: 'thunderclap' },
      { id: 'stormrunner', tier: 8, name: 'Stormrunner', detail: '20 tuck jumps unbroken', guideId: 'stormrunner' },
      { id: 'tempest-edge', tier: 11, name: "Tempest's Edge", detail: '3 single-leg jump squats per leg', guideId: 'tempest-edge' },
    ],
  },
  {
    id: 'warden',
    name: 'Path of the Warden',
    stat: 'endurance',
    nodes: [
      { id: 'held-ground', tier: 2, name: 'Held Ground', detail: '45-sec plank', guideId: 'held-ground' },
      { id: 'iron-root', tier: 5, name: 'Iron Root', detail: '90-sec bear crawl', guideId: 'iron-root' },
      { id: 'unbroken-wall', tier: 8, name: 'Unbroken Wall', detail: '2-min plank', guideId: 'unbroken-wall' },
      { id: 'sentinel-vow', tier: 11, name: "Sentinel's Vow", detail: '4-min bear crawl', guideId: 'sentinel-vow' },
    ],
  },
  {
    id: 'anchor',
    name: 'Path of the Anchor',
    stat: 'core',
    nodes: [
      { id: 'braced-core', tier: 2, name: 'Braced Core', detail: '20 bicycle crunches unbroken', guideId: 'braced-core' },
      { id: 'coiled-serpent', tier: 5, name: 'Coiled Serpent', detail: '20-sec hollow body hold', guideId: 'coiled-serpent' },
      { id: 'anchor-point', tier: 8, name: 'Anchor Point', detail: '45-sec hollow body hold', guideId: 'anchor-point' },
      { id: 'unyielding-core', tier: 11, name: 'Unyielding Core', detail: '15 V-ups unbroken', guideId: 'unyielding-core' },
    ],
  },
  {
    id: 'wildfire',
    name: 'Path of the Wildfire',
    stat: 'cardio',
    nodes: [
      { id: 'first-spark', tier: 2, name: 'First Spark', detail: '8 burpees under 75 sec', guideId: 'first-spark' },
      { id: 'rising-flame', tier: 5, name: 'Rising Flame', detail: '15 burpees under 90 sec', guideId: 'rising-flame' },
      { id: 'wildfire', tier: 8, name: 'Wildfire', detail: '40 burpees under 6 min', guideId: 'wildfire' },
      { id: 'inferno-heart', tier: 11, name: "Inferno's Heart", detail: '80 burpees under 12 min', guideId: 'inferno-heart' },
    ],
  },
];

export const CLASSES = [
  {
    id: 'berserker',
    name: 'Berserker Awakening',
    detail: 'Opens The Gauntlet',
    guideId: 'berserker',
    requires: [
      { stat: 'strength', tier: 5 },
      { stat: 'power', tier: 5 },
      { stat: 'cardio', tier: 5 },
    ],
    lock: 'Strength, Power, and Cardio at tier 5',
  },
  {
    id: 'guardian',
    name: "Guardian's Resolve",
    detail: 'Opens Iron Core',
    guideId: 'guardian',
    requires: [
      { stat: 'core', tier: 5 },
      { stat: 'endurance', tier: 5 },
    ],
    lock: 'Core and Endurance at tier 5',
  },
  {
    id: 'ascended',
    name: 'Ascended Form',
    detail: 'Opens Full Send',
    guideId: 'ascended',
    requires: [
      { stat: 'strength', tier: 8 },
      { stat: 'power', tier: 8 },
      { stat: 'endurance', tier: 8 },
      { stat: 'core', tier: 8 },
      { stat: 'cardio', tier: 8 },
    ],
    lock: 'All five stats at tier 8',
  },
];

export function allSkills() {
  const nodes = [];
  for (const path of PATHS) {
    for (const node of path.nodes) {
      nodes.push({
        ...node,
        path: path.id,
        stat: path.stat,
        requires: [{ stat: path.stat, tier: node.tier }],
        lock: `Tier ${node.tier}`,
      });
    }
  }
  return nodes.concat(CLASSES);
}

export function trialById(id) {
  return [...TRIALS, ...CLASS_TRIALS].find((trial) => trial.id === id);
}
