export const MEDICAL =
  'This is general form guidance, not medical advice. If pain persists, see a doctor or physiotherapist.';

const STOP = 'Sharp or pinching pain is a stop. Muscular burn is not. Numbness or tingling is a stop.';

const SHAPES = {
  burpee: {
    pose: 'burpee',
    form: [
      'Stand with feet about hip-width. Drop the hands to the floor just outside the feet.',
      'Jump or step the feet back to a straight plank. Chest and hips move together.',
      'Jump the feet back in, then leave the floor only as high as you can land quietly.',
    ],
    avoid: ['Hips sagging in the plank', 'Knees caving inward on the jump', 'A limp landing on straight knees'],
    feel: ['Chest, shoulders, and legs sharing the work', 'Breath climbing rep by rep', 'Ordinary muscle fatigue in the legs and chest after the set'],
    notFeel: [STOP, 'Wrist pain, shoulder pain, or lower-back pain is joint stress, not the working muscle.'],
    mods: ['Step the feet back instead of jumping.', 'Leave out the push-up at the bottom and keep the plank brief.'],
    modPose: 'burpee-step',
  },
  'push-up': {
    pose: 'push-up',
    form: [
      'Hands under the shoulders, fingers forward, body one line from head to heels.',
      'Bend the elbows and lower until the chest is a fist off the floor. Ribs stay down.',
      'Press the floor away and finish with the arms straight, without shrugging.',
    ],
    avoid: ['Hips sagging', 'Elbows flared straight out to the sides', 'Half reps that never reach the bottom'],
    feel: ['Chest and the back of the arms doing the press', 'A muscular burn in the chest late in the set', 'Shoulders working without a pinch at the bottom'],
    notFeel: [STOP, 'Wrist pain or a pinch in the front of the shoulder is a stop.'],
    mods: ['Push-ups on the knees, body straight from head to knee.', 'Hands on a sturdy bench so the body stays one line.'],
    modPose: 'push-up-knees',
  },
  diamond: {
    pose: 'diamond',
    form: [
      'Bring the hands together under the chest so the thumbs and index fingers make a diamond.',
      'Keep the body one line. Elbows track back, close to the ribs.',
      'Lower until the chest nears the hands, then press back up without sagging.',
    ],
    avoid: ['Hands so far forward the shoulders shrug', 'Elbows splaying wide', 'Hips dropping to cheat the last reps'],
    feel: ['Triceps and the inner chest taking more of the load', 'A burn in the back of the arms', 'Wrists stacked, not bent to their end range'],
    notFeel: [STOP, 'Wrist pain from the narrow hands is a stop, not something to grind through.'],
    mods: ['Regular push-ups.', 'Hands close, but up on a bench, or on the knees with the body straight.'],
    modPose: 'push-up-knees',
  },
  archer: {
    pose: 'archer',
    form: [
      'Set the hands wider than a push-up. Shift the chest toward one hand.',
      'Bend that elbow and keep the other arm reaching, almost straight.',
      'Press back to center, then switch sides. Hips stay square to the floor.',
    ],
    avoid: ['Twisting the hips to help', 'Collapsing the chest', 'Bending the long arm into a sloppy wide push-up'],
    feel: ['One side of the chest and shoulder doing the bend', 'The straight arm working to stay long', 'A hard but muscular effort, not a joint grind'],
    notFeel: [STOP, 'Shoulder strain on the straight arm is a stop.'],
    mods: ['Regular push-ups.', 'A slightly uneven push-up with one hand a little wider, not a full archer.'],
    modPose: 'push-up',
  },
  'jump-squat': {
    pose: 'jump-squat',
    form: [
      'Feet about shoulder-width, toes free to turn out a little.',
      'Sit the hips back and down until the thighs are at least parallel, knees tracking over the toes.',
      'Drive the floor away, leave the ground, and land softly with the hips back, not on locked knees.',
    ],
    avoid: ['Knees caving inward', 'Heels lifting the whole squat', 'Landing with a crash and straight knees'],
    feel: ['Quads and glutes powering the jump', 'A burn in the thighs late in the set', 'Quiet feet on the landing'],
    notFeel: [STOP, 'Knee pain is not the same as thigh burn.'],
    mods: ['Bodyweight squats with no jump.', 'Squat to a chair and stand without leaving the floor.'],
    modPose: 'squat',
  },
  squat: {
    pose: 'squat',
    form: [
      'Feet under the hips or a bit wider. Brace the midsection.',
      'Sit down and back until the thighs reach at least parallel if the knees allow it.',
      'Stand by pushing the floor away. Knees track over the mid-foot.',
    ],
    avoid: ['Knees caving inward', 'Heels popping up', 'The lower back rounding at the bottom'],
    feel: ['Quads and glutes', 'A working burn in the thighs', 'The torso staying tall enough that the chest does not collapse'],
    notFeel: [STOP, 'Knee pain or a grab in the lower back is a stop.'],
    mods: ['Squat to a chair and tap it lightly.', 'A shorter squat that stays pain-free.'],
    modPose: 'squat',
  },
  'broad-jump': {
    pose: 'broad-jump',
    form: [
      'Stand with feet hip-width. Swing the arms back as the hips sit.',
      'Throw the arms forward and jump out, not only up.',
      'Land with both feet, hips back, knees bent, and the knees tracking over the toes.',
    ],
    avoid: ['Landing on locked knees', 'Knees caving as the feet hit', 'Pitching forward so the hands have to save you'],
    feel: ['Legs driving as one', 'A firm, quiet landing', 'Ordinary impact through the feet, not a jab in the knees'],
    notFeel: [STOP, 'Knee pain on the landing is a stop.'],
    mods: ['A squat with no jump.', 'A small hop in place, landing soft, before you add distance.'],
    modPose: 'squat',
  },
  'tuck-jump': {
    pose: 'tuck-jump',
    form: [
      'Start in a squat. Jump and pull both knees up toward the chest.',
      'Land with the hips back and the knees soft, then go again if the landing is quiet.',
    ],
    avoid: ['Knees slamming into the chest with the back rounded', 'Knees caving on the landing', 'Stiff-leg landings'],
    feel: ['Hip flexors and quads', 'A hard breath', 'Landings you could pause on'],
    notFeel: [STOP, 'Knee pain or a pinch in the hip is a stop.'],
    mods: ['Jump squats without the tuck.', 'Squats with no jump.'],
    modPose: 'jump-squat',
  },
  pistol: {
    pose: 'pistol',
    form: [
      'Stand on one leg. The other leg reaches forward.',
      'Sit straight down on the standing leg. Knee tracks over the toes. Heel stays down if you can.',
      'Drive back up without the free foot touching. Then switch legs.',
    ],
    avoid: ['The standing knee caving inward', 'The heel lifting and the weight dumping onto the toes', 'Falling into the hip of the standing leg'],
    feel: ['One quad and glute doing all of the stand', 'A hard muscular effort', 'The free leg staying quiet'],
    notFeel: [STOP, 'Knee pain on the standing leg is a stop.'],
    mods: ['A single-leg squat to a chair, using a hand for balance.', 'Two-leg squats.'],
    modPose: 'squat',
  },
  mountain: {
    pose: 'mountain',
    form: [
      'Hands under the shoulders, body a straight line, like the top of a push-up.',
      'Drive one knee toward the chest, then switch. Count 15 each leg at the full dose.',
      'Keep the hips level. The shoulders stay over the wrists.',
    ],
    avoid: ['Hips piking up high', 'Bouncing off the toes', 'The lower back sagging between steps'],
    feel: ['Hip flexors and shoulders', 'Breath getting short', 'A burn through the midsection from holding the line'],
    notFeel: [STOP, 'Wrist pain or a pinch in the lower back is a stop.'],
    mods: ['Slow steps instead of a run.', 'Hands on a bench so the shoulders carry less.'],
    modPose: 'mountain',
  },
  downdog: {
    pose: 'downdog',
    form: [
      'Start in a straight plank.',
      'Lift the hips up and back into a downdog. Press the floor away. Knees can be soft.',
      'Walk the feet or shoulders back to the plank. That trip is one direction. Count both ways.',
    ],
    avoid: ['Hips sagging in the plank', 'Shoulders shrugged to the ears', 'Yanking the hamstrings until the lower back rounds hard'],
    feel: ['Shoulders and calves in the downdog', 'The midsection holding the plank', 'A stretch in the hamstrings that stays muscular, not electric'],
    notFeel: [STOP, 'A grab in the lower back when the hips lift is a stop.'],
    mods: ['Hold the plank only.', 'Downdog with the knees deeply bent, then return to the plank.'],
    modPose: 'plank',
  },
  lunge: {
    pose: 'lunge',
    form: [
      'Stand tall. Step one foot back and lower until the back knee is near the floor.',
      'Front knee tracks over the mid-foot, not caving in.',
      'Drive through the front heel and bring the back knee up in front of you. Then switch legs.',
    ],
    avoid: ['Front knee caving inward', 'Slamming the back knee into the floor', 'Twisting the torso to find balance'],
    feel: ['Front quad and glute', 'A balance challenge you can still own', 'The hip flexor of the driving leg working on the knee lift'],
    notFeel: [STOP, 'Knee pain in either knee is a stop. Thigh burn is the work.'],
    mods: ['A split squat with no knee drive.', 'A shorter reverse step, using a wall for a fingertip balance.'],
    modPose: 'lunge',
  },
  bear: {
    pose: 'bear',
    form: [
      'Hands under shoulders, knees under hips, then lift the knees a few inches off the floor.',
      'Step the opposite hand and foot. Hips stay low and level, not piked to the ceiling.',
      'Keep moving for the time. Breathe. Knees never rest on the floor during the set.',
    ],
    avoid: ['Hips high like a pike', 'Lower back sagging', 'Holding the breath until the set falls apart'],
    feel: ['Shoulders, quads, and the midsection', 'A deep burn that builds', 'Shaky muscles with the spine still quiet'],
    notFeel: [STOP, 'Wrist pain or a pinch in the lower back is a stop.'],
    mods: ['A shorter crawl.', 'A plank hold if the crawl pulls the back.'],
    modPose: 'plank',
  },
  bicycle: {
    pose: 'bicycle',
    form: [
      'Lie on your back. Hands light at the temples, elbows wide. Lift the shoulder blades.',
      'Extend one leg long and rotate the opposite rib toward the bent knee.',
      'Switch sides under control. The neck stays neutral. The abs turn the body, not the hands.',
    ],
    avoid: ['Pulling the head forward', 'Yanking the neck with the hands', 'Rocking the hips instead of rotating the ribs'],
    feel: ['Obliques and the front of the hips', 'A burn across the stomach', 'The neck quiet the whole set'],
    notFeel: [STOP, 'Neck strain from pulling the head is a stop. That is not ab work.'],
    mods: ['Half-range bicycle crunches, shoulder blades barely up.', 'Dead bugs: back flat, arms and legs moving without a crunch.'],
    modPose: 'bicycle-half',
  },
  'bicycle-half': {
    pose: 'bicycle-half',
    form: [
      'Same setup as a bicycle crunch, but the shoulder blades only just leave the floor.',
      'Rotate a short way. Keep the hands off the neck.',
    ],
    avoid: ['Pulling the head', 'Using speed to fake the turn'],
    feel: ['A smaller burn in the obliques', 'The neck staying easy'],
    notFeel: [STOP, 'Any neck pain means stop and rest the head on the floor.'],
    mods: ['Dead bug, back pressed into the floor.', 'A brace hold with both feet down.'],
    modPose: 'bicycle-half',
  },
  hollow: {
    pose: 'hollow',
    form: [
      'Lie on your back. Press the lower back into the floor.',
      'Lift the shoulders and the legs. Arms reach long by the hips or overhead if the back stays down.',
      'Hold. If the lower back peels up, raise the legs or bend the knees until it sticks again.',
    ],
    avoid: ['The lower back arching off the floor', 'Holding the breath', 'Craning the neck to watch the feet'],
    feel: ['A deep brace through the front of the trunk', 'Quads helping if the legs are low', 'Shaking that you can still breathe through'],
    notFeel: [STOP, 'Lower-back pain means the hold is too long or too low. Stop the set.'],
    mods: ['Knees bent, shins parallel to the floor, lower back pressed down.', 'Dead bug holds.'],
    modPose: 'hollow',
  },
  'v-up': {
    pose: 'v-up',
    form: [
      'Lie flat, arms overhead, legs long, lower back heavy.',
      'Lift the chest and the legs together so the body makes a V. Reach the hands toward the feet.',
      'Lower with control until the shoulders and heels lightly touch, then go again.',
    ],
    avoid: ['Yanking with the neck', 'Using a swing of the arms for momentum', 'The lower back popping and taking the load'],
    feel: ['Abs and hip flexors', 'A hard burn in the stomach', 'Each rep owned, not thrown'],
    notFeel: [STOP, 'A jab in the lower back or neck strain is a stop.'],
    mods: ['Tuck-ups with the knees bent.', 'Half-range bicycle crunches.'],
    modPose: 'bicycle-half',
  },
  plank: {
    pose: 'plank',
    form: [
      'Forearms or hands under the shoulders. Legs long. Knees off the floor.',
      'Make one line from head to heels. Ribs down, glutes lightly on, neck neutral.',
      'Breathe. If the hips sag or pike, stop the hold.',
    ],
    avoid: ['Hips sagging', 'Hips too high', 'Holding the breath'],
    feel: ['The midsection, shoulders, and quads holding', 'A muscular shake', 'The lower back quiet'],
    notFeel: [STOP, 'Lower-back pain is a stop. Sagging into that pain is the miss.'],
    mods: ['Plank on the knees, body straight from head to knee.', 'A shorter hold you can keep straight.'],
    modPose: 'push-up-knees',
  },
};

export const TEXT_STEPS = {
  burpee: SHAPES.burpee.form,
  downdog: SHAPES.downdog.form,
  bear: SHAPES.bear.form,
  archer: SHAPES.archer.form,
  'broad-jump': SHAPES['broad-jump'].form,
  pistol: SHAPES.pistol.form,
  hollow: SHAPES.hollow.form,
  'v-up': SHAPES['v-up'].form,
};

const ITEMS = [
  ['burpees', 'burpee', 'Burpees', '15 burpees', 'Own the plank on every rep before you jump.', 'Burpees: lumbar strain from a sagging lower back, or knee pain from knees caving on the jump. Stop the set. Do not push through.'],
  ['push-ups', 'push-up', 'Push-ups', '15–18 push-ups', 'Credit on the sheet is 15. The extra reps are optional if the line stays straight.', 'Push-ups: lumbar strain from a sagging lower back. Stop the set. Do not push through.'],
  ['jump-squats', 'jump-squat', 'Jump squats', '20 jump squats', 'Full depth, then a quiet landing.', 'Jump squats: knee pain from knees caving inward. Stop the set. Do not push through.'],
  ['mountain-climbers', 'mountain', 'Mountain climbers', '30 mountain climbers, 15 each leg', 'Keep the hips level while the knees drive.', 'Mountain climbers: lower-back pinch from a sagging plank, or wrist pain. Stop the set. Do not push through.'],
  ['plank-downdog', 'downdog', 'Plank-to-downdog walk', '16 walks, 8 each direction', 'Move from a straight plank to a long downdog and back.', 'Plank-to-downdog: a grab in the lower back when the hips lift, or shoulders jammed to the ears. Stop the set. Do not push through.'],
  ['reverse-lunge', 'lunge', 'Reverse lunge w/ knee drive', '20 reps, 10 each leg', 'Step back, then drive the knee through.', 'Reverse lunges: front-knee pain from the knee caving in, or a slam of the back knee. Stop the set. Do not push through.'],
  ['bear-crawl', 'bear', 'Bear crawl', '30 seconds', 'Knees stay off the floor the whole interval.', 'Bear crawl: wrist pain or lower-back pinch from sagging or piking. Stop the set. Do not push through.'],
  ['bicycle', 'bicycle', 'Bicycle crunches', '20 reps, 10 each side', 'Turn the ribs. Leave the neck alone.', 'Bicycle crunches: neck strain from pulling the head instead of using the abs. Stop the set. Do not push through.'],
  ['steady-guard', 'push-up', 'Steady Guard', 'Full-ROM push-up, 3-sec descent', 'Take three seconds to lower. The bottom is a fist off the floor.', 'A fast drop or a sagging lower back misses the skill. Lumbar strain is a stop.'],
  ['piston-strike', 'push-up', 'Piston Strike', '10 push-ups unbroken', 'Ten full reps without a knee down.', 'If the hips sag to finish the ten, stop. Lumbar strain is not the last rep.'],
  ['twin-fang', 'diamond', 'Twin Fang', '8 diamond push-ups unbroken', 'Eight full diamond reps. Elbows stay close.', 'Wrist pain from the narrow hands, or a sagging lower back, is a stop.'],
  ['warbringer', 'archer', 'Warbringer', '4 archer push-ups per side', 'Four each side. The long arm stays long.', 'Shoulder strain on the straight arm is a stop. Do not twist the hips to finish.'],
  ['spark-step', 'squat', 'Spark Step', '15 explosive bodyweight squats', 'Fifteen full squats, standing fast, feet staying on the floor.', 'Knee pain from knees caving inward is a stop. Speed does not replace depth.'],
  ['thunderclap', 'broad-jump', 'Thunderclap', 'Broad jump equal to own height', 'One jump that matches your height. Stick the landing.', 'Knee pain on the landing, or locked knees, is a failed attempt. Stop.'],
  ['stormrunner', 'tuck-jump', 'Stormrunner', '20 tuck jumps unbroken', 'Twenty tucks. Each landing is soft enough to continue.', 'Knees caving on the landing or slamming into the chest is a stop.'],
  ['tempest-edge', 'pistol', "Tempest's Edge", '3 single-leg jump squats per leg', 'A small jump from a single-leg squat, three each leg. Stick it.', 'Knee pain or a cave of the standing knee is a stop.'],
  ['held-ground', 'plank', 'Held Ground', '45-sec plank', 'Forty-five seconds, one straight line.', 'If the lower back starts to carry the hold, stop. Sagging is the miss.'],
  ['iron-root', 'bear', 'Iron Root', '90-sec bear crawl', 'Ninety seconds of crawl. Knees hover the whole time.', 'Wrist pain or a sagging lower back is a stop, even if time is left.'],
  ['unbroken-wall', 'plank', 'Unbroken Wall', '2-min plank', 'Two minutes. Reset the ribs if they flare.', 'Lower-back pain means the wall broke. Stop. Do not push through.'],
  ['sentinel-vow', 'bear', "Sentinel's Vow", '4-min bear crawl', 'Four minutes continuous. Short steps beat a sprint that falls apart.', 'Shoulders shrugging into the ears or a pinching lower back is a stop.'],
  ['braced-core', 'bicycle', 'Braced Core', '20 bicycle crunches unbroken', 'Twenty turns, ten each side, no rest in the set.', 'Neck strain from pulling the head is a stop.'],
  ['coiled-serpent', 'hollow', 'Coiled Serpent', '20-sec hollow body hold', 'Twenty seconds with the lower back pressed down.', 'If the lower back arches off the floor, the hold is over. Stop.'],
  ['anchor-point', 'hollow', 'Anchor Point', '45-sec hollow body hold', 'Forty-five seconds. Bend the knees if that is what keeps the back down.', 'Lower-back pain or neck strain from looking at the ceiling is a stop.'],
  ['unyielding-core', 'v-up', 'Unyielding Core', '15 V-ups unbroken', 'Fifteen V-ups. Lower with control.', 'A jab in the lower back or a yanked neck is a stop.'],
  ['first-spark', 'burpee', 'First Spark', '8 burpees under 75 sec', 'Eight burpees. The clock is loose. The plank is not.', 'A sagging lower back to beat the clock is a stop.'],
  ['rising-flame', 'burpee', 'Rising Flame', '15 burpees under 90 sec', 'Fifteen burpees inside a minute and a half.', 'Knees caving on the jump, or lumbar strain in the plank, is a stop.'],
  ['wildfire', 'burpee', 'Wildfire', '40 burpees under 6 min', 'Forty burpees. Break the set into breaths, not into a collapsed plank.', 'Wrist pain, knee cave, or a sagging lower back is a stop even if minutes remain.'],
  ['inferno-heart', 'burpee', "Inferno's Heart", '80 burpees under 12 min', 'Eighty burpees. Quality sets inside the clock.', 'Do not buy time with sagging hips or caving knees. Stop if those show up.'],
  ['trial-strength-3', 'push-up', '15 push-ups unbroken', '15 full push-ups, no rest on the floor', 'One set. Knees stay up.', 'Lumbar strain from sagging is a missed trial. Stop.'],
  ['trial-strength-6', 'push-up', '30 push-ups unbroken', '30 full push-ups, no rest', 'Pace it. The last reps still reach the bottom.', 'If the hips drop to survive the count, stop. That is not the trial.'],
  ['trial-strength-9', 'push-up', '50 push-ups unbroken', '50 full push-ups, no rest', 'Fifty is a long set. The line from head to heels stays the standard.', 'Shoulder pinch or lumbar strain is a stop, not rep fifty.'],
  ['trial-strength-12', 'archer', '5 deficit or archer push-ups', '5 deficit push-ups or 5 archer push-ups', 'Hands on blocks for a deeper press, or an archer to each side as the five.', 'Shoulder strain in the bottom of a deficit, or on the straight arm of an archer, is a stop.'],
  ['trial-power-3', 'jump-squat', '20 full-depth jump squats unbroken', '20 jump squats, thighs to parallel, no pause standing', 'Depth on every rep, including the last.', 'Knee pain from knees caving inward is a stop.'],
  ['trial-power-6', 'broad-jump', 'Broad jump at least 1.5× your height', 'One broad jump of at least one and a half times your height', 'Measure a line before you jump. Stick the landing.', 'Knee pain or a locked-knee landing voids the jump. Stop.'],
  ['trial-power-9', 'tuck-jump', '30 tuck jumps unbroken', '30 tuck jumps, no extra bounce between', 'Knees come up, feet land soft.', 'Knee cave or hip pinch is a stop.'],
  ['trial-power-12', 'pistol', '5 single-leg jump squats per leg', '5 each leg', 'Sit on one leg, leave the floor a little, land on that same leg.', 'Pain or a collapsing knee on the standing leg is a stop.'],
  ['trial-endurance-3', 'plank', '90 sec plank hold', '90 seconds, one line', 'Forearms or hands. Hips neither sag nor pike.', 'Lower-back pain ends the hold.'],
  ['trial-endurance-6', 'bear', '2 min continuous bear crawl', '2 minutes, knees off the floor', 'Keep moving. A high hip pike does not count as crawling.', 'Wrist pain or lumbar pinch is a stop.'],
  ['trial-endurance-9', 'plank', '3 min plank hold', '3 minutes', 'Breathe on purpose. Shake is allowed. A broken line is not.', 'If the lower back takes over, stop.'],
  ['trial-endurance-12', 'bear', '5 min continuous bear crawl', '5 minutes continuous', 'Short steps. The knees do not touch down to rest.', 'Numb hands, wrist pain, or a sagging back is a stop.'],
  ['trial-core-3', 'bicycle', '30 bicycle crunches unbroken', '30 reps, 15 each side', 'Keep the shoulder blades up the whole set.', 'Neck strain from pulling the head misses the trial. Stop.'],
  ['trial-core-6', 'hollow', '30 sec hollow body hold', '30 seconds, lower back down', 'Raise the legs if the back peels up. The floor contact is the test.', 'Lower-back pain is a stop.'],
  ['trial-core-9', 'hollow', '60 sec hollow body hold', '60 seconds', 'Same rule at a minute. Bend the knees before you arch.', 'Neck strain or lumbar pain is a stop.'],
  ['trial-core-12', 'v-up', '20 V-ups unbroken', '20 V-ups', 'Touch or reach the feet. Lower under control.', 'A popping lower back or a yanked neck is a stop.'],
  ['trial-cardio-3', 'burpee', '10 burpees under 60 sec', '10 burpees inside a minute', 'The clock is easy. Use it to keep the plank honest.', 'Sagging hips or caving knees fail the set. Stop.'],
  ['trial-cardio-6', 'burpee', '20 burpees under 90 sec', '20 burpees under 90 seconds', 'Stay smooth. Do not dive the chest into the floor.', 'Wrist pain or lumbar strain is a stop.'],
  ['trial-cardio-9', 'burpee', '50 burpees under 5 min', '50 burpees under 5 minutes', 'Break only inside the movement, not by lying down.', 'Knee cave and a collapsed plank are stops, even near the end.'],
  ['trial-cardio-12', 'burpee', '100 burpees under 10 min', '100 burpees under 10 minutes', 'This is a long grind. The plank standard does not drop at rep 80.', 'Sharp pain, numbness, or a sagging lower back ends the trial.'],
];

const MULTIS = {
  berserker: {
    title: 'Berserker Awakening',
    dose: 'Strength, Power, and Cardio at tier 5',
    strips: ['burpee', 'jump-squat', 'push-up'],
    form: [
      'This confirms the class. It opens The Gauntlet.',
      'The Gauntlet is 50 burpees, 50 jump squats, and 50 push-ups, any order, under 15 minutes.',
      'Keep a straight plank in the burpees, knees over toes in the squats, and a straight line in the push-ups.',
    ],
    avoid: ['Treating the clock as permission to sag', 'Knees caving on the jumps', 'Resting in a heap between movements'],
    feel: ['Lungs and legs working together', 'Muscular burn you can still coordinate'],
    notFeel: [STOP, 'Knee pain, wrist pain, or lumbar strain from a sagging plank is a stop. Do not push through.'],
    mods: ['Step-back burpees.', 'Squats without the jump.', 'Push-ups on the knees while you learn the pace. The trial itself asks for the full versions.'],
  },
  guardian: {
    title: "Guardian's Resolve",
    dose: 'Core and Endurance at tier 5',
    strips: ['plank', 'bicycle', 'lunge'],
    form: [
      'This confirms the class. It opens Iron Core.',
      'Iron Core is a 3-minute plank, then 50 bicycle crunches, then 20 reverse lunges per leg, with no rest between.',
      'Leave the plank before the back takes it. Turn the abs, not the neck. Track the front knee.',
    ],
    avoid: ['Sagging the plank to survive the minutes', 'Pulling the head through the crunches', 'Caving the front knee on the lunges'],
    feel: ['A long brace, then a burn in the obliques, then the legs'],
    notFeel: [STOP, 'Lower-back pain, neck strain, or knee pain is a stop. Do not push through.'],
    mods: ['A shorter plank.', 'Half-range bicycle crunches.', 'Split squats without the knee drive, while you practice. The trial asks for the full chain.'],
  },
  ascended: {
    title: 'Ascended Form',
    dose: 'All five stats at tier 8',
    strips: ['burpee', 'push-up', 'jump-squat', 'plank'],
    form: [
      'This confirms the class. It opens Full Send, and the Stats sheet keeps its aura.',
      'Full Send is all 4 rounds of the daily circuit with zero rest between exercises. Rest only between rounds.',
      'When the breath goes, the positions stay: straight planks, knees over toes, neck out of the crunches.',
    ],
    avoid: ['Skipping the shapes to keep moving', 'Resting between exercises inside a round'],
    feel: ['A hard but organized round', 'Fatigue in the muscles, with the joints still quiet'],
    notFeel: [STOP, 'Any sharp pain, numbness, knee cave, or sagging lower back stops the round. Do not push through.'],
    mods: ['The week 1–3 targets if the ramp is still on.', 'Regress a single move rather than grinding a broken one. Full Send itself is the full circuit.'],
  },
  'trial-gauntlet': {
    title: 'The Gauntlet',
    dose: '50 burpees + 50 jump squats + 50 push-ups, any order, under 15 minutes',
    strips: ['burpee', 'jump-squat', 'push-up'],
    form: [
      'Any order. The clock is 15 minutes.',
      'Burpee plank stays straight. Jump squats hit depth and land soft. Push-ups reach the bottom.',
      'You can partition the reps. You cannot change the shapes.',
    ],
    avoid: ['Knees caving', 'Hips sagging', 'Half push-ups'],
    feel: ['A long mixed burn', 'Breath loud, positions still yours'],
    notFeel: [STOP, 'Knee pain from caving, lumbar strain from a sagging plank or push-up, or wrist pain is a stop.'],
    mods: ['Practice the three moves on separate days first.', 'Step-back burpees and squats without a jump are practice tools, not the trial.'],
  },
  'trial-iron-core': {
    title: 'Iron Core',
    dose: '3-min plank, then 50 bicycle crunches, then 20 reverse lunges per leg, no rest between',
    strips: ['plank', 'bicycle', 'lunge'],
    form: [
      'Start the clock and do not rest between the three parts.',
      'Plank for 3 minutes. Roll into 50 bicycle crunches. Stand into 20 reverse lunges each leg.',
    ],
    avoid: ['Sagging the plank', 'Pulling the neck', 'Caving the front knee'],
    feel: ['Brace, then obliques, then legs, with no kindness from a break'],
    notFeel: [STOP, 'Lower-back pain, neck strain from pulling the head, or knee pain is a stop.'],
    mods: ['Train the pieces separately until the chain is honest.'],
  },
  'trial-full-send': {
    title: 'Full Send',
    dose: 'All 4 rounds, no rest between exercises, rest only between rounds',
    strips: ['burpee', 'push-up', 'jump-squat', 'mountain', 'downdog', 'lunge', 'bear', 'bicycle'],
    form: [
      'Run the daily circuit. Inside a round, go straight from one exercise to the next.',
      'Rest only after the eighth exercise, then start the next round.',
      'Use the targets on the circuit that day, including a swap you have adopted and the week scale if it is on.',
    ],
    avoid: ['Sneaking rest between exercises', 'Letting form dissolve in the later rounds'],
    feel: ['The round as one piece of work'],
    notFeel: [STOP, 'Sharp pain, numbness, knee cave, neck yanking, or a sagging lower back stops the trial.'],
    mods: ['A normal circuit with the written rests is the daily practice. Full Send removes the rests inside the round.'],
  },
};

function fromShape(id, shapeKey, title, dose, step, flag) {
  const shape = SHAPES[shapeKey];
  return {
    id,
    title,
    dose,
    pose: shape.pose,
    strips: [shape.pose],
    modPose: shape.modPose,
    form: [dose, step, ...shape.form],
    avoid: shape.avoid,
    feel: shape.feel,
    notFeel: [...shape.notFeel, flag, 'Stop the set if any of those show up. Do not push through.'],
    mods: shape.mods,
  };
}

const GUIDE_MAP = {};
for (const item of ITEMS) {
  const guide = fromShape(...item);
  GUIDE_MAP[guide.id] = guide;
}
for (const [id, extra] of Object.entries(MULTIS)) {
  GUIDE_MAP[id] = { id, pose: extra.strips[0], ...extra };
}

export function getGuide(id) {
  return GUIDE_MAP[id] || null;
}
