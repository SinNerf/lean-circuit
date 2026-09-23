import { useState } from 'react';
import { CORE_BADGES, currentStreak, formatClock, longestStreak, roman } from '../honors.js';
import { BadgeEmblem } from '../icons/marks.jsx';
import { addDays, formatDate } from '../logic.js';
import { WORKOUT_PATHS, workoutPath } from '../paths.js';
import { figureTone, Portrait } from '../components/Figure.jsx';
import { useGame } from '../state.jsx';

function earnedBadges(badges, weekly) {
  const rows = CORE_BADGES.filter((badge) => badges?.[badge.id]).map((badge) => ({ id: badge.id, name: badge.name }));
  for (const badge of weekly || []) rows.push({ id: badge.id, name: 'Weekly' });
  return rows;
}

export function Profile() {
  const game = useGame();
  if (game.profileView === 'edit') return <EditProfile />;
  if (game.profileView === 'history') return <History rows={game.state.history} today={game.today} />;
  if (game.profileView === 'friend-history') return <History rows={game.friend?.history || []} today={game.today} />;
  if (game.profileView === 'board') return <Board />;
  if (game.profileView === 'friend') return <FriendSheet />;
  return <OwnSheet />;
}

function OwnSheet() {
  const game = useGame();
  const tone = figureTone(game.sheet, game.pace, game.state.ascend);
  const mark = roman(game.state.ascend?.count || 0);
  const path = workoutPath(game.state.path);
  const workouts = (game.state.history || []).filter((row) => (row.rounds || 0) > 0).length;
  const badges = earnedBadges(game.state.badges, game.state.weeklyBadges);
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
      onPath={game.openBoard}
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
  const badges = (friend.badges || []).map((id) => ({
    id,
    name: CORE_BADGES.find((badge) => badge.id === id)?.name || 'Weekly',
  }));
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
        onPath={null}
        onHistory={friend.history ? () => game.openFriendHistory() : null}
        ascend={null}
      />
      {friend.history == null ? (
        <p className="px-4 font-body text-[14px] font-normal text-muted">History opens when they add you back.</p>
      ) : null}
    </div>
  );
}

function Sheet({ photo, tone, name, title, level, mark, path, workouts, streak, longest, badges, onPath, onHistory, ascend }) {
  return (
    <div className="pb-8">
      <section className="px-4 pt-4">
        <Portrait src={photo} tone={tone.tone} cape={tone.cape} shadow={tone.shadow} />
        <p data-testid="hero-name" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          {name}
          {mark ? <span data-testid="ascend-mark"> {mark}</span> : null}
        </p>
        <p data-testid="title-label" className="mt-2 font-display text-[22px] font-semibold leading-none text-primary">
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
      </section>
      <section className="px-4 pt-8">
        {onPath ? (
          <button type="button" data-testid="path-open" onClick={onPath} className="font-body text-[12px] font-normal leading-none text-muted">
            {path.name}
          </button>
        ) : (
          <p data-testid="path-open" className="font-body text-[12px] font-normal leading-none text-muted">
            {path.name}
          </p>
        )}
        <p data-testid="workouts-logged" className="mt-2 font-body text-[14px] font-normal text-primary">
          {workouts} workouts logged
        </p>
        <p data-testid="streak-current" className="mt-2 font-body text-[14px] font-normal text-primary">
          Current streak {streak}
        </p>
        <p data-testid="streak-longest" className="mt-2 font-body text-[14px] font-normal text-primary">
          Longest streak {longest}
        </p>
      </section>
      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Badges</h2>
        <div data-testid="badge-shelf" className="mt-2 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div key={badge.id} data-testid={`badge-earned-${badge.id}`} className="w-20 text-primary">
              <BadgeEmblem id={CORE_BADGES.some((item) => item.id === badge.id) ? badge.id : 'weekly'} earned className="h-8 w-8 text-gold" />
              <p className="mt-2 font-body text-[12px] font-normal leading-none text-primary">{badge.name}</p>
            </div>
          ))}
        </div>
      </section>
      {onHistory ? (
        <section className="px-4 pt-8">
          <button type="button" data-testid="view-history" onClick={onHistory} className="font-body text-[14px] font-normal text-primary">
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

function Board() {
  const game = useGame();
  const [code, setCode] = useState('');
  const activity = game.board.activity;
  return (
    <div className="px-4 pb-8 pt-4">
      <div data-testid="activity-line" className="flex items-center gap-2">
        {activity?.photo ? (
          <img src={activity.photo} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-surface" />
        )}
        <p className="font-body text-[14px] font-normal text-primary">{activity?.sentence || 'No recent training.'}</p>
      </div>
      <div className="mt-8">
        {game.board.rows.map((row) => (
          <button
            key={row.uid}
            type="button"
            data-testid={`board-${row.uid}`}
            onClick={() => game.openFriend(row.uid)}
            className="mb-2 flex w-full items-center gap-2 border-b border-line py-2 text-left"
          >
            {row.photo ? <img src={row.photo} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-surface" />}
            <span className="min-w-0 flex-1">
              <span className="block font-body text-[14px] font-normal text-primary">{row.name}</span>
              <span className="mt-2 block font-body text-[12px] font-normal text-muted">
                {row.level || 0} · {workoutPath(row.path).name}
              </span>
            </span>
          </button>
        ))}
        {!game.account ? (
          <p className="font-body text-[14px] font-normal text-muted">Sign in from Edit to join the board. Training stays on this device.</p>
        ) : null}
        {game.account && !game.board.rows.length ? <p className="font-body text-[14px] font-normal text-muted">No friends yet.</p> : null}
      </div>
      {game.account ? (
        <form
          className="pt-8"
          onSubmit={(event) => {
            event.preventDefault();
            game.saveFriend(code);
          }}
        >
          <p className="font-body text-[12px] font-normal text-muted">Your code</p>
          <p data-testid="friend-code" className="mt-2 break-all font-body text-[14px] font-normal text-primary">
            {game.account.uid}
          </p>
          <input
            data-testid="friend-input"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-4 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
          />
          <button type="submit" className="mt-4 font-body text-[14px] font-normal text-primary">
            Add friend
          </button>
        </form>
      ) : null}
    </div>
  );
}

function EditProfile() {
  const game = useGame();
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState(game.state.body?.heightCm ? String(game.state.body.heightCm) : '');
  const [weight, setWeight] = useState(game.state.body?.weightKg ? String(Math.round(game.state.body.weightKg * 10) / 10) : '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <input
          id="photo-file"
          data-testid="photo-file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) game.setLocalPhoto(file);
          }}
        />
        <button type="button" data-testid="pick-photo" onClick={() => document.getElementById('photo-file')?.click()} className="mt-2 font-body text-[14px] font-normal text-primary">
          Choose photo
        </button>
        {!game.account ? <p className="mt-2 font-body text-[12px] font-normal text-muted">A board photo needs an account. This device can still show one.</p> : null}
      </section>

      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Path</h2>
        <div className="mt-2">
          {WORKOUT_PATHS.map((path) => (
            <button
              key={path.id}
              type="button"
              data-testid={`path-${path.id}`}
              onClick={() => game.setPath(path.id)}
              className={`mt-2 block font-body text-[14px] font-normal ${game.state.path === path.id ? 'text-primary' : 'text-muted'}`}
            >
              {path.name}
            </button>
          ))}
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
        {game.account ? (
          <div className="mt-2">
            <p className="font-body text-[14px] font-normal text-primary">{game.account.email}</p>
            <button type="button" data-testid="sign-out" onClick={game.leaveAccount} className="mt-4 font-body text-[14px] font-normal text-primary">
              Sign out
            </button>
          </div>
        ) : (
          <form
            className="mt-2"
            onSubmit={(event) => {
              event.preventDefault();
              game.enterAccount(email, password);
            }}
          >
            <p className="font-body text-[12px] font-normal text-muted">
              {game.cloudOn ? 'Optional. The circuit still runs with no account.' : 'Sign-in waits until Firebase is configured. Training still works.'}
            </p>
            <input
              data-testid="email-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-4 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
            />
            <input
              data-testid="password-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-4 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
            />
            <button type="submit" data-testid="sign-in" className="mt-4 font-body text-[14px] font-normal text-primary">
              Sign in
            </button>
            <button
              type="button"
              data-testid="sign-up"
              onClick={() => game.createAccount(email, password)}
              className="mt-4 block font-body text-[14px] font-normal text-primary"
            >
              Create account
            </button>
          </form>
        )}
        {game.authError ? <p className="mt-2 font-body text-[14px] font-normal text-primary">{game.authError}</p> : null}
      </section>
    </div>
  );
}
