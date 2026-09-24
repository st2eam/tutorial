# Playback and audio

## Player lifecycle

Enable the player and provide a SoundFont when constructing the Web API. Treat score rendering and audio readiness as separate states: `scoreLoaded` reports the score, while `playerReady` reports the player is ready. Subscribe to `error` and `soundFontLoaded` so the UI can report failures and completion.

Use the same loaded score for notation and playback. The tutorial project does this in `src/components/ScorePlayer.tsx`; it does not maintain a separate MIDI score as the source of truth.

## Playback controls

| API | Meaning | Version documented by alphaTab |
| --- | --- | --- |
| `play()` / `pause()` | Start or pause playback | 0.9.4 |
| `playbackRange` | Select a range in MIDI ticks | 0.9.4 |
| `isLooping` | Restart the selected range after it ends | 0.9.4 |
| `playbackSpeed` | Speed multiplier; `1.0` means normal speed | 0.9.4 |
| `masterVolume` | Synthesizer volume from 0 to 1 | 0.9.4 |
| `metronomeVolume` | Metronome volume; zero disables it | 0.9.4 |
| `countInVolume` | Count-in metronome volume | 1.1.0 |

These documented versions are below the tutorial project's 1.8.4 lock. Recheck the API map and installed declarations when changing the dependency.

The app builds playback ranges from the loaded score's bar durations and its own route mapping. If a song route repeats a measure, the route index identifies the occurrence; a measure number alone may not identify the intended playback position.

## SoundFonts

alphaTab supports SoundFont 2 and SoundFont 3. A URL can be configured through `player.soundFont`; the API can also load bytes with `loadSoundFont`. Check `soundFontLoaded` after loading. In this project, the default soundfont is a separately licensed ukulele SF2 stored under `public/soundfonts/`; a user-selected SF2/SF3 is loaded in memory for the current player session.

Keep SoundFont provenance and redistribution rights with the asset. alphaTab's bundled default soundfont and the app's custom ukulele soundfont are separate choices with separate licensing.

## Follow the cursor and score pages

Use `playerPositionChanged` to observe playback position and map it to the currently visible page. The app keeps page selection and its task route mapping in React state while alphaTab owns audio playback. When the user changes the score or navigates away, stop playback and destroy the API instance.

## Sources

- [Web player tutorial](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/tutorial-web/player.mdx)
- [Web configuration](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/configuration-web.mdx)
- [`play`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/play.mdx), [`pause`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/pause.mdx), [`playbackRange`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackrange.mdx), [`isLooping`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/islooping.mdx), [`playbackSpeed`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackspeed.mdx)
- [`masterVolume`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/mastervolume.mdx), [`metronomeVolume`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/metronomevolume.mdx), [`countInVolume`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/countinvolume.mdx), [`loadSoundFont`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/loadsoundfont.mdx), and [`player.soundFont`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/player/soundfont.mdx)
- Tutorial project: [`ScorePlayer.tsx`](../../src/components/ScorePlayer.tsx), [`score-manifest.ts`](../../src/data/score-manifest.ts), [`score-mapping.ts`](../../src/data/score-mapping.ts)
