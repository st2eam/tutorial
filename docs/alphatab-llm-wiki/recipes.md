# Recipes for score development

These are patterns based on the alphaTab Web docs and the current tutorial app. Keep the score, measure mapping, and course content in their existing layers. The examples use API names whose source pages document them before 1.8.4; still verify them against the locked package when changing alphaTab.

## Load one canonical score

Create one API instance for the score container and load the same MusicXML URL used by the score view:

```ts
const api = new AlphaTabApi(container, settings)
api.error.on((error) => showScoreError(error))
api.scoreLoaded.on(() => setScoreReady(true))
api.load(scoreUrl)
```

For Web, `load()` accepts a score URL or binary score data such as an `ArrayBuffer` or `Uint8Array`; raw XML text is not listed as a supported input type. Avoid maintaining a second note source for audio playback.

## Render a page of TAB

Configure page layout and the initial `staveProfile` in constructor settings. When the page changes, update the existing instance and render it again:

```ts
api.settings.display.startBar = firstBar
api.settings.display.barCount = visibleBarCount
api.settings.display.barsPerRow = barsPerRow
api.updateSettings()
api.render()
```

The app chooses one bar per page on mobile and up to two on desktop. On a user initiated page turn, pause playback first; during auto-follow, update the rendered page without resetting the audio position.

## Play and loop a range

Resolve bar boundaries to MIDI ticks from the loaded model, then use `playbackRange`:

```ts
api.playbackRange = { startTick, endTick }
api.isLooping = true
api.play()
```

The range's end tick follows the API definition. Confirm whether the boundary should include the next bar's start or end based on the selected score, especially around repeats and pickup measures.

## Load a user supplied SoundFont

The app loads bytes from a local file and does not upload them:

```ts
const bytes = new Uint8Array(await file.arrayBuffer())
const accepted = api.loadSoundFont(bytes, false)
```

Check the return value and `soundFontLoaded` / `error` events. Keep an explicit recovery path to restore the app's default licensed SoundFont if the file cannot be read.

## Build task ranges

Keep song order and lesson progression outside alphaTab. This app resolves `songId + stage + simplified` through `score-mapping.ts`, then maps the result to bar ranges in the MusicXML score. When a route revisits a section, retain both the bar number and route occurrence index so page following and looping choose the intended visit.

## Sources

- [Web configuration and API lifecycle](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/configuration-web.mdx)
- [Display settings](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings.mdx) and [`render()`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/render.mdx)
- [`playbackRange`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackrange.mdx), [`isLooping`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/islooping.mdx), [`loadSoundFont`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/loadsoundfont.mdx)
- Tutorial project: [`ScorePlayer.tsx`](../../src/components/ScorePlayer.tsx) and [`score-mapping.ts`](../../src/data/score-mapping.ts)
