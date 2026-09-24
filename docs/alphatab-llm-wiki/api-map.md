# API map

The versions below are taken from the `since` metadata in the pinned alphaTabWebsite documentation. All listed versions are earlier than the tutorial project's alphaTab **1.8.4** dependency lock. A `since` marker records the documented introduction version; it is not a substitute for checking the package types when upgrading.

## Loading and lifecycle

| API | Documented since | Use in this project | Reference |
| --- | --- | --- | --- |
| `load()` | 0.9.4 | Load a score into the existing API instance. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/load.mdx) |
| `scoreLoaded` | 0.9.4 | Know when score data has loaded. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/scoreloaded.mdx) |
| `playerReady` | 0.9.4 | Enable playback controls when the synthesizer is ready. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playerready.mdx) |
| `playerPositionChanged` | 0.9.4 | Track the current tick and follow the active measure. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playerpositionchanged.mdx) |
| `playerStateChanged` | 0.9.4 | Keep play/pause controls in sync with the player. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playerstatechanged.mdx) |
| `soundFontLoaded` | 0.9.4 | Report when the selected soundfont is ready. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/soundfontloaded.mdx) |
| `error` | 0.9.4 | Surface score and player errors. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/error.mdx) |

## Display settings

| Setting | Documented since | Use in this project | Reference |
| --- | --- | --- | --- |
| `display.layoutMode` | 0.9.6 | Render a page-sized view. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/layoutmode.mdx) |
| `display.startBar` | 0.9.6 | Select the first measure in a rendered page. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/startbar.mdx) |
| `display.barCount` | 0.9.6 | Limit the rendered measure range. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/barcount.mdx) |
| `display.barsPerRow` | 0.9.6 | Control system density. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/barsperrow.mdx) |
| `display.staveProfile` | 0.9.6 | Choose the visible TAB/notation staves. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/staveprofile.mdx) |
| `core.fontDirectory` | 0.9.6 | Locate Bravura and related music font assets. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/core/fontdirectory.mdx) |
| `updateSettings()` / `render()` | 0.9.4 | Apply changed display settings and rerender the current score. | [`updateSettings`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/updatesettings.mdx) / [`render`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/render.mdx) |

## Playback and SoundFonts

| API | Documented since | Use in this project | Reference |
| --- | --- | --- | --- |
| `play()` / `pause()` | 0.9.4 | Start and pause the current score. | [`play`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/play.mdx) / [`pause`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/pause.mdx) |
| `playbackRange` | 0.9.4 | Restrict playback to a tick interval. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackrange.mdx) |
| `tickPosition` | 0.9.4 | Seek to the start tick of a selected page or range. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/tickposition.mdx) |
| `isLooping` | 0.9.4 | Repeat playback after the selected range. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/islooping.mdx) |
| `playbackSpeed` | 0.9.4 | Apply a speed multiplier (`1.0` is normal). | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackspeed.mdx) |
| `masterVolume` / `metronomeVolume` | 0.9.4 | Set synthesizer and metronome volume from 0 to 1. | [`masterVolume`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/mastervolume.mdx) / [`metronomeVolume`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/metronomevolume.mdx) |
| `countInVolume` | 1.1.0 | Set count-in tick volume. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/countinvolume.mdx) |
| `player.soundFont` | 0.9.6 | Load a SoundFont from a URL at player startup. | [API page](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/player/soundfont.mdx) |
| `loadSoundFont()` / `resetSoundFonts()` | 0.9.4 | Load local bytes or restore the default soundfont set. | [`loadSoundFont`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/loadsoundfont.mdx) / [`resetSoundFonts`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/resetsoundfonts.mdx) |

## Example used by the tutorial app

```ts
api.scoreLoaded.on(() => {
  api.settings.display.startBar = firstBar
  api.settings.display.barCount = visibleBarCount
  api.settings.display.barsPerRow = barsPerRow
  api.updateSettings()
  api.render()
})

api.playbackRange = { startTick, endTick }
api.tickPosition = startTick
api.isLooping = true
api.play()
```

For player construction, TAB staff selection, SoundFont loading, and cleanup, see [Recipes](recipes.md) and the current [`ScorePlayer.tsx`](../../src/components/ScorePlayer.tsx).

## Vite and worker settings

The Vite plugin is documented as introduced in 1.3.0, which is earlier than 1.8.4. Use its [installation guide](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/installation-vite.mdx) for plugin options and verify those options against the locked package before customizing them.

## Version check required

The topic pages above prefer APIs with a source `since` version no later than 1.8.4. The complete [source index](source-index.md) contains additional references. If a page has no `since` metadata or documents a version later than 1.8.4, treat it as **Version check required** and inspect the installed package before use.
