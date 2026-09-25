import { useEffect, useRef, useState } from 'react';
import { CLASSES, PATHS } from '../catalog.js';
import { friendCode } from '../challenge.js';
import { CORE_BADGES, currentStreak, formatClock, longestStreak, roman } from '../honors.js';
import { BadgeEmblem } from '../icons/marks.jsx';
import { addDays, compareStanding, formatDate, PATH_UNLOCK_LINE, statCredit, statVisualTier } from '../logic.js';
import { WORKOUT_PATHS, workoutPath } from '../paths.js';
import { figureTone, Portrait, Silhouette } from '../components/Figure.jsx';
import { StreakFlame } from '../components/Flame.jsx';
import { proceed } from '../components/ui.jsx';
import { Challenge } from './Challenge.jsx';
import { PhotoAdjust } from './PhotoAdjust.jsx';
import { useGame } from '../state.jsx';

function titleTone(name) {
  if (name === 'Twin-Blade' || name === 'Ascendant') return 'text-gold';
  if (name === 'Iron Novice' || name === 'The Unbroken') return 'text-bronze';
  return 'text-primary';
}

function emblemId(id) {
  return CORE_BADGES.some((item) => item.id === id) ? id : 'weekly';
}

function cabinet(earnedIds) {
  const earned = new Set(earnedIds || []);
  const rows = CORE_BADGES.map((badge) => ({ id: badge.id, name: badge.name, earned: earned.has(badge.id) }));
  for (const id of earned) {
    if (!CORE_BADGES.some((badge) => badge.id === id)) rows.push({ id, name: 'Weekly', earned: true });
  }
  return rows;
}

function unlockedNames(skills) {
  const names = [];
  for (const node of CLASSES) {
    if (skills?.[node.id]) names.push(node.name);
  }
  for (const path of PATHS) {
    for (const node of path.nodes) {
      if (skills?.[node.id]) names.push(node.name);
    }
  }
  return names;
}

export function Profile() {
  const game = useGame();
  if (game.profileView === 'edit') return <EditProfile />;
  if (game.profileView === 'history') return <History rows={game.state.history} today={game.today} />;
  if (game.profileView === 'friend-history') return <History rows={game.friend?.history || []} today={game.today} />;
  return <OwnSheet />;
}

export function Leaderboard() {
  const game = useGame();
  if (game.profileView === 'friend-history') return <History rows={game.friend?.history || []} today={game.today} />;
  if (game.profileView === 'challenge') return <Challenge />;
  if (game.profileView === 'friend') return <FriendSheet />;
  return <Board />;
}

function OwnSheet() {
  const game = useGame();
  const tone = figureTone(game.sheet, game.pace, game.state.ascend);
  const mark = roman(game.state.ascend?.count || 0);
  const path = workoutPath(game.state.path);
  const workouts = (game.state.history || []).filter((row) => (row.rounds || 0) > 0).length;
  const badges = cabinet([
    ...Object.keys(game.state.badges || {}),
    ...(game.state.weeklyBadges || []).map((badge) => badge.id),
  ]);
  return (
    <Sheet
      photo={game.state.photoData || ''}
      tone={tone}
      name={game.state.name}
      title={game.title}
      level={game.sheet.level}
      mark={mark}
      path={path}
      workouts={workouts}
      streak={currentStreak(game.state.trainingDays, game.today)}
      longest={longestStreak(game.state.trainingDays)}
      badges={badges}
      featuredId={game.state.featuredBadge}
      onFeature={game.setFeatured}
      skillNames={unlockedNames(game.state.skills)}
      onSkills={game.openSkills}
      flamePulse={game.flamePulse}
      badgePulse={game.badgePulse}
      onHistory={game.openHistory}
      ascend={game.ascendReady ? game.confirmAscend : null}
    />
  );
}

function FriendSheet() {
  const game = useGame();
  const friend = game.friend;
  if (!friend) {
    return (
      <div className="px-4 pt-4">
        <p className="font-body text-[14px] font-normal text-muted">That profile is not available.</p>
      </div>
    );
  }
  const path = workoutPath(friend.path);
  const badges = cabinet(friend.badges);
  return (
    <div>
      <Sheet
        photo={friend.photo || ''}
        tone={{ tone: 'plain', cape: false, shadow: false }}
        name={friend.name}
        title={friend.title}
        level={friend.level || 0}
        mark={roman(friend.ascension || 0)}
        path={path}
        workouts={friend.workouts || 0}
        streak={friend.streak || 0}
        longest={friend.longest || 0}
        badges={badges}
        featuredId={friend.featuredBadge || ''}
        onFeature={null}
        skillNames={null}
        onSkills={null}
        flamePulse={false}
        badgePulse=""
        onHistory={friend.history ? () => game.openFriendHistory() : null}
        ascend={null}
      />
      {friend.history == null ? (
        <p className="px-4 font-body text-[14px] font-normal text-muted">History opens when they add you back.</p>
      ) : null}
    </div>
  );
}

function Sheet({ photo, tone, name, title, level, mark, path, workouts, streak, longest, badges, featuredId, onFeature, skillNames, onSkills, flamePulse, badgePulse, onHistory, ascend }) {
  const featured = badges.find((badge) => badge.earned && badge.id === featuredId) || null;
  const label = 'font-body text-[13px] font-medium leading-none text-muted';
  return (
    <div className="pb-8">
      <header className="flex flex-col items-center px-4 pt-4 text-center">
        <Portrait src={photo} tone={tone.tone} cape={tone.cape} shadow={tone.shadow} />
        <p data-testid="hero-name" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          {name}
          {mark ? <span data-testid="ascend-mark"> {mark}</span> : null}
        </p>
        <p data-testid="title-label" className={`mt-2 font-display text-[22px] font-semibold leading-none ${titleTone(title)}`}>
          {title}
        </p>
        <p data-testid="player-level" className="mt-2 font-display text-[28px] font-semibold leading-none text-primary">
          {level}
        </p>
        {ascend ? (
          <button type="button" data-testid="ascend" onClick={ascend} className="mt-4 rounded bg-accent px-4 py-2 font-body text-[14px] font-normal text-primary">
            Ascend
          </button>
        ) : null}
      </header>
      <section className="px-4 pt-8 text-left">
        <h2 className={label}>Path</h2>
        <p data-testid="path-open" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          {path.name}
        </p>
      </section>
      <section className="px-4 pt-8 text-left">
        <h2 className={label}>Quick stats</h2>
        <p data-testid="workouts-logged" className="mt-2 font-body text-[14px] font-normal text-primary">
          {workouts} workouts logged
        </p>
        <div className="mt-2">
          <StreakFlame streak={streak} pulse={flamePulse} count testId="streak-current" />
        </div>
        <p className="mt-2 font-body text-[13px] font-medium text-muted">Current streak</p>
        <p data-testid="streak-longest" className="mt-4 font-body text-[14px] font-normal text-primary">
          Longest streak {longest}
        </p>
      </section>
      <section className="px-4 pt-8 text-left">
        <h2 className={label}>Badges</h2>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Earned medals are the gold ones.</p>
        {featured ? (
          <div data-testid="featured-badge" className="mt-4 text-gold">
            <BadgeEmblem id={emblemId(featured.id)} earned pulse={badgePulse === featured.id || badgePulse === emblemId(featured.id)} className="h-24 w-24" />
            <p className="mt-2 font-body text-[14px] font-normal text-primary">{featured.name}</p>
          </div>
        ) : null}
        <div data-testid="badge-shelf" className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">
          {badges.map((badge) => {
            const markClass = badge.earned && badge.id === featuredId ? 'ring-2 ring-gold' : '';
            const body = (
              <>
                <BadgeEmblem
                  id={emblemId(badge.id)}
                  earned={badge.earned}
                  pulse={badgePulse === badge.id}
                  className={`h-14 w-14 ${badge.earned ? 'text-gold' : 'text-muted'}`}
                />
                <p className={`mt-2 font-body text-[12px] font-normal leading-snug ${badge.earned ? 'text-primary' : 'text-muted'}`}>{badge.name}</p>
              </>
            );
            if (!onFeature || !badge.earned) {
              return (
                <div key={badge.id} data-testid={badge.earned ? `badge-earned-${badge.id}` : `badge-locked-${badge.id}`} className="text-left">
                  {body}
                </div>
              );
            }
            return (
              <button
                key={badge.id}
                type="button"
                data-testid={`badge-earned-${badge.id}`}
                onClick={() => onFeature(badge.id)}
                className={`rounded text-left ${markClass}`}
              >
                {body}
              </button>
            );
          })}
        </div>
      </section>
      {skillNames ? (
        <section className="px-4 pt-8 text-left">
          <h2 className={label}>Skills</h2>
          <div data-testid="unlocked-skills" className="mt-2">
            {skillNames.length ? (
              skillNames.map((skill) => (
                <p key={skill} className="mb-2 font-body text-[14px] font-normal leading-none text-primary">
                  {skill}
                </p>
              ))
            ) : (
              <p className="font-body text-[14px] font-normal text-muted">None yet</p>
            )}
          </div>
          {onSkills ? (
            <button type="button" data-testid="all-skills" onClick={onSkills} className={`mt-4 ${proceed}`}>
              All skills
            </button>
          ) : null}
        </section>
      ) : null}
      {onHistory ? (
        <section className="px-4 pt-8 text-left">
          <h2 className={label}>History</h2>
          <button type="button" data-testid="view-history" onClick={onHistory} className={`mt-2 ${proceed}`}>
            View History
          </button>
        </section>
      ) : null}
    </div>
  );
}

function History({ rows, today }) {
  const start = addDays(today, -13);
  const recent = (rows || []).filter((row) => row && row.date >= start && row.date <= today);
  const gains = { strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 };
  let workouts = 0;
  for (const row of recent) {
    if ((row.rounds || 0) > 0) workouts += 1;
    for (const stat of Object.keys(gains)) gains[stat] += row.gains?.[stat] || 0;
  }
  const ordered = [...(rows || [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return (
    <div className="px-4 pb-8 pt-4">
      <section data-testid="fortnight">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Last 14 days</h2>
        <p className="mt-2 font-body text-[14px] font-normal text-primary">{workouts} workouts</p>
        <p className="mt-2 font-body text-[12px] font-normal text-muted">
          Strength {Math.round(gains.strength)} · Power {Math.round(gains.power)} · Endurance {Math.round(gains.endurance)} · Core {Math.round(gains.core)} · Cardio {Math.round(gains.cardio)}
        </p>
      </section>
      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">History</h2>
        <div className="mt-2">
          {ordered.map((row) => (
            <article key={row.id} data-testid={`history-${row.id}`} className="mb-4 border-b border-line pb-4">
              <p className="font-body text-[14px] font-normal text-primary">{formatDate(row.date)}</p>
              <p className="mt-2 font-body text-[12px] font-normal text-muted">
                {workoutPath(row.path).name}
                {(row.rounds || 0) > 0 ? ` · ${row.rounds} rounds` : ''}
                {row.durationMs ? ` · ${formatClock(row.durationMs)}` : ''}
              </p>
              {row.pathChange ? <p className="mt-2 font-body text-[12px] font-normal text-primary">{row.pathChange}</p> : null}
              {(row.rounds || 0) > 0 ? (
                <p className="mt-2 font-body text-[12px] font-normal text-muted">
                  Strength {Math.round(row.gains?.strength || 0)} · Power {Math.round(row.gains?.power || 0)} · Endurance {Math.round(row.gains?.endurance || 0)} · Core {Math.round(row.gains?.core || 0)} · Cardio {Math.round(row.gains?.cardio || 0)}
                </p>
              ) : null}
              {row.modified?.length ? (
                <p className="mt-2 font-body text-[12px] font-normal text-muted">Modified: {row.modified.join(', ')}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function rankClass(rank) {
  if (rank === 1) return 'font-display text-[28px] font-semibold leading-none text-gold';
  if (rank <= 3) return 'font-display text-[28px] font-semibold leading-none text-primary';
  return 'font-body text-[14px] font-normal leading-none text-muted';
}

function RowMark({ photo }) {
  if (photo) return <img src={photo} alt="" className="h-10 w-10 rounded object-cover" />;
  return (
    <span data-testid="board-silhouette" className="grid h-10 w-10 place-items-center overflow-hidden rounded bg-surface">
      <span className="origin-center scale-50">
        <Silhouette tone="plain" cape={false} shadow={false} />
      </span>
    </span>
  );
}

function BoardRow({ row, rank, pinned, selfRef }) {
  const game = useGame();
  const mine = row.uid === game.account?.uid;
  return (
    <article
      ref={selfRef}
      data-testid={pinned ? 'board-pin' : `board-${row.uid}`}
      className={`border-b border-line py-4 ${pinned ? 'sticky top-0 z-10 bg-base' : ''}`}
    >
      <button
        type="button"
        onClick={() => {
          if (!mine) game.openFriend(row.uid);
        }}
        className="flex w-full items-center gap-2 text-left"
      >
        <span data-testid={pinned ? 'board-pin-rank' : `board-rank-${row.uid}`} className={`w-8 shrink-0 text-center ${rankClass(rank)}`}>
          {rank}
        </span>
        <RowMark photo={row.photo} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-body text-[14px] font-normal text-primary">{row.name}</span>
          <span data-testid={pinned ? 'board-pin-level' : `board-level-${row.uid}`} className="mt-2 block font-body text-[14px] font-normal text-primary">
            Level {row.level || 0}
          </span>
          <span className="mt-2 block font-body text-[12px] font-normal text-muted">{workoutPath(row.path).name}</span>
        </span>
        <span className="flex items-center gap-1">
          <StreakFlame streak={row.streak || 0} pulse={mine && game.flamePulse && !pinned} testId={pinned ? 'board-pin-flame' : `board-flame-${row.uid}`} className="h-4 w-4" />
          <span data-testid={pinned ? 'board-pin-streak' : `board-streak-${row.uid}`} className="font-body text-[14px] font-normal text-primary">
            {row.streak || 0}
          </span>
        </span>
      </button>
      {mine ? null : (
        <div className="mt-2 flex justify-center">
          <button type="button" data-testid={`challenge-${row.uid}`} onClick={() => game.openChallenge(row)} className={proceed}>
            Challenge
          </button>
        </div>
      )}
    </article>
  );
}

function Board() {
  const game = useGame();
  const [code, setCode] = useState('');
  const [below, setBelow] = useState(false);
  const selfRef = useRef(null);
  const listRef = useRef(null);
  const me = game.account?.uid;
  const friends = (game.board.rows || []).filter((row) => row.uid !== me);
  const self = me
    ? {
        uid: me,
        name: game.state.name,
        photo: game.state.photoData || '',
        path: game.state.path,
        level: game.sheet.level,
        statTier: statVisualTier(game.state.stats.tier),
        statCredit: statCredit(game.state.stats.tier),
        streak: currentStreak(game.state.trainingDays, game.today),
      }
    : null;
  const listed = [...(self ? [self] : []), ...friends].sort(compareStanding);
  const rankOf = new Map(listed.map((row, index) => [row.uid, index + 1]));
  const selfRank = listed.findIndex((row) => row.uid === me);

  useEffect(() => {
    const node = selfRef.current;
    if (!node) return undefined;
    const root = listRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const top = entry.boundingClientRect.top;
        const limit = entry.rootBounds?.bottom ?? 0;
        setBelow(!entry.isIntersecting && top > limit);
      },
      { root, threshold: 1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [listed.length, me, selfRank]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 pt-4">
        {listed.length ? (
          <div data-testid="leaderboard">
            {below && selfRank >= 0 ? <BoardRow row={listed[selfRank]} rank={rankOf.get(me)} pinned /> : null}
            {listed.map((row) => (
              <BoardRow key={row.uid} row={row} rank={rankOf.get(row.uid)} selfRef={row.uid === me ? selfRef : null} />
            ))}
          </div>
        ) : null}
      </div>
      {game.account ? (
        <form
          data-testid="friend-tools"
          className="shrink-0 border-t border-line px-4 pb-4 pt-4 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            game.saveFriend(code);
            setCode('');
          }}
        >
          <p className="font-body text-[12px] font-normal text-muted">Your code</p>
          <div className="mt-2 flex items-center gap-4">
            <p data-testid="friend-code" className="font-body text-[14px] font-normal text-primary">
              {friendCode(game.account.uid)}
            </p>
            <button
              type="button"
              data-testid="friend-copy"
              onClick={() => {
                const code = friendCode(game.account.uid);
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code);
              }}
              className="font-body text-[14px] font-normal text-primary"
            >
              Copy
            </button>
          </div>
          <input
            data-testid="friend-input"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-4 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
          />
          <button type="submit" data-testid="friend-add" className={`mt-4 ${proceed}`}>
            Add friend
          </button>
          {game.authError ? <p className="mt-4 font-body text-[14px] font-normal text-primary">{game.authError}</p> : null}
        </form>
      ) : null}
    </div>
  );
}

function EditProfile() {
  const game = useGame();
  const [photoFile, setPhotoFile] = useState(null);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState(game.state.body?.heightCm ? String(game.state.body.heightCm) : '');
  const [weight, setWeight] = useState(game.state.body?.weightKg ? String(Math.round(game.state.body.weightKg * 10) / 10) : '');

  function commitBody(nextHeight, nextWeight, nextHeightUnit, nextWeightUnit) {
    const heightRaw = Number(nextHeight);
    const weightRaw = Number(nextWeight);
    const heightCm = nextHeight && Number.isFinite(heightRaw) && heightRaw > 0 ? (nextHeightUnit === 'in' ? heightRaw * 2.54 : heightRaw) : null;
    const weightKg = nextWeight && Number.isFinite(weightRaw) && weightRaw > 0 ? (nextWeightUnit === 'lb' ? weightRaw / 2.2046226218 : weightRaw) : null;
    game.setBody({
      heightCm: heightCm ? Math.round(heightCm * 10) / 10 : null,
      weightKg: weightKg ? Math.round(weightKg * 10) / 10 : null,
    });
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <section>
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Photo</h2>
        {game.state.photoData && !photoFile ? <img src={game.state.photoData} alt="" className="mt-4 h-20 w-20 rounded object-cover" /> : null}
        <input
          id="photo-file"
          data-testid="photo-file"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) setPhotoFile(file);
          }}
        />
        {photoFile ? (
          <PhotoAdjust
            file={photoFile}
            onSave={(dataUrl) => {
              const saved = game.setProfilePhoto(dataUrl);
              if (saved === 'ok') setPhotoFile(null);
              return saved;
            }}
            onCancel={() => setPhotoFile(null)}
          />
        ) : (
          <button type="button" data-testid="pick-photo" onClick={() => document.getElementById('photo-file')?.click()} className={`mt-4 ${proceed}`}>
            Choose photo
          </button>
        )}
      </section>

      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Path</h2>
        <div className="mt-2">
          {WORKOUT_PATHS.map((path) => {
            const locked = !game.state.pathsUnlocked && path.id !== 'starter';
            const active = game.state.path === path.id;
            return (
              <button
                key={path.id}
                type="button"
                data-testid={`path-${path.id}`}
                data-locked={locked ? 'true' : 'false'}
                onClick={() => {
                  if (!locked) game.setPath(path.id);
                }}
                className={`mt-2 block w-full text-center ${active ? proceed : 'rounded px-4 py-2 font-body text-[14px] font-normal text-primary'}`}
              >
                <span className="block">{path.name}</span>
                {locked ? <span className="mt-2 block font-body text-[12px] font-normal text-muted">{PATH_UNLOCK_LINE}</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Height and weight</h2>
        <div className="mt-2 flex gap-4">
          <button type="button" data-testid="unit-cm" onClick={() => setHeightUnit('cm')} className={`font-body text-[14px] font-normal ${heightUnit === 'cm' ? 'text-primary' : 'text-muted'}`}>
            cm
          </button>
          <button type="button" data-testid="unit-in" onClick={() => setHeightUnit('in')} className={`font-body text-[14px] font-normal ${heightUnit === 'in' ? 'text-primary' : 'text-muted'}`}>
            in
          </button>
        </div>
        <input
          data-testid="height-input"
          inputMode="decimal"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          onBlur={() => commitBody(height, weight, heightUnit, weightUnit)}
          className="mt-2 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
        />
        <div className="mt-4 flex gap-4">
          <button type="button" data-testid="unit-kg" onClick={() => setWeightUnit('kg')} className={`font-body text-[14px] font-normal ${weightUnit === 'kg' ? 'text-primary' : 'text-muted'}`}>
            kg
          </button>
          <button type="button" data-testid="unit-lb" onClick={() => setWeightUnit('lb')} className={`font-body text-[14px] font-normal ${weightUnit === 'lb' ? 'text-primary' : 'text-muted'}`}>
            lb
          </button>
        </div>
        <input
          data-testid="weight-input"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          onBlur={() => commitBody(height, weight, heightUnit, weightUnit)}
          className="mt-2 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
        />
      </section>

      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Account</h2>
        <div className="mt-2">
          <p className="font-body text-[14px] font-normal text-primary">{game.account?.email}</p>
          <button type="button" data-testid="sign-out" onClick={game.leaveAccount} className="mt-4 font-body text-[14px] font-normal text-primary">
            Sign out
          </button>
        </div>
        {game.authError ? <p className="mt-2 font-body text-[14px] font-normal text-primary">{game.authError}</p> : null}
      </section>
    </div>
  );
}
