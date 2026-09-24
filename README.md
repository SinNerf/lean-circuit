# Lean Circuit

A daily eight-move circuit with a character sheet, trials, skills, and form guides. Progress stays in the browser or the Android app. There is no account and workouts are not uploaded.

The phone install is the Android app. The browser can also install it as a standalone app after a production build. Opening `index.html` by itself will not start the app.

## Desktop

Install Node.js from [https://nodejs.org](https://nodejs.org). The Standard install includes npm.

In this folder:

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47329](http://127.0.0.1:47329).

This folder name includes `#`, which stops Vite's live reload. `npm run dev` builds the app, then serves it. After a code change, stop the server and run `npm run dev` again.

The first launch asks for a display name once, with an empty field. That name is kept on the device. There is no rename control. The same moment stores an install id, platform, user agent, and screen size. If a one-time public-IP lookup succeeds, that address is stored on the device too. If it fails, the app continues offline. Nothing is sent to an account server.

`npm run build` writes `dist`. `npm run preview` serves that build. A browser install uses the service worker. The Android app does not.

## Install on a phone

You create the private GitHub repo, push this folder, and install the phone app yourself. The version in `package.json` is the only version number. A release tag is that number with a `v` in front, such as `v1.1.1`.

The first install is the release APK. Sign in on the phone, open that release, allow the browser to install unknown apps, and install the file. The in-app updater cannot install the first copy.

Open Lean Circuit later while the phone is online. If a newer tag exists, the app asks. Update downloads it and opens the Android installer. Not now leaves the current app in place. Offline, it skips the check and training still works.

Every release APK must use the same signing key. Run the bootstrap workflow once, download `lean-circuit-release.jks`, and keep that file. Later tags reuse it. If the key is replaced, uninstall Lean Circuit before installing the new file.

Progress is stored in the app. It survives a force-stop and a reboot. It is wiped only if the app’s storage is cleared or the app is uninstalled. Settings can export a JSON file and import it back onto the device. Import asks before it replaces what is already there.

Oswald and Work Sans ship inside the app, so a later workout does not need a network.

Guide photos are copies from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) dataset, stored in `public/guides`, so a workout does not need a network. Push-ups, jump squats, mountain climbers, and plank use the matching exercise. Reverse lunge, bicycle crunches, diamond push-ups, and tuck jumps use a close match from that dataset. Burpees, plank-to-downdog, bear crawl, archer push-up, broad jump, single-leg jump squat, hollow hold, and V-up stay text.

Streak flame and badge pictures are from [Game-icons.net](https://game-icons.net) by Lorc, Delapouite, and Sbed, under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The files live in `src/assets/marks`.
