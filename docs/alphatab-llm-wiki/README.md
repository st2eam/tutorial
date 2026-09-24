# alphaTab LLM Wiki

An English field guide for developing, rendering, and playing sheet music in the 拾艺 tutorial project. It summarizes the alphaTab website documentation snapshot recorded below and links each topic to its source.

## Start with the task

| If you need to… | Read |
| --- | --- |
| Choose a score format, understand timing, or map measures to a lesson | [Score data and formats](score-data-and-formats.md) |
| Render TAB, standard notation, or a selected measure range | [Notation and rendering](notation-and-rendering.md) |
| Play a score, loop a range, or load a SoundFont | [Playback and audio](playback-and-audio.md) |
| Configure Vite, workers, fonts, or offline score assets | [Web integration](web-integration.md) |
| Adapt a known pattern to this app | [Recipes](recipes.md) |
| Diagnose import, display, timing, or audio problems | [Troubleshooting](troubleshooting.md) |
| Find an API or setting and its documented version | [API map](api-map.md) |
| Browse all upstream documents | [Source index](source-index.md) |

## Source and compatibility

- Documentation source: the alphaTabWebsite `docs/` snapshot at commit [`72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45`](https://github.com/CoderLine/alphaTabWebsite/tree/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs).
- The tutorial project locks `@coderline/alphatab` and `@coderline/alphatab-vite` to **1.8.4** in `package-lock.json`.
- Each API map entry records the alphaTab documentation's `since` version where the source page provides one. A version at or below 1.8.4 establishes the documentation's minimum version; it does not replace checking the installed package when changing the dependency.
- Pages marked **Version check required** have no usable `since` marker or describe behavior that has not been confirmed for 1.8.4. Check the locked package's types and runtime before adopting those details.
- The source index includes every Markdown and MDX file present in the source checkout, including MDX fragments used to build the website. Generated reference pages that are not present as files in that checkout are not fabricated here.

alphaTab is a library for building music notation experiences ([upstream introduction](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/introduction.mdx)). The app remains responsible for course flow, source provenance, and mapping lesson steps to score measures.

## How this project uses alphaTab

- Complete song scores live in `public/scores/<song-id>.musicxml` and provide the notes for both notation and synthesized playback.
- [`score-manifest.ts`](../../src/data/score-manifest.ts) records score file metadata and the song route; [`score-mapping.ts`](../../src/data/score-mapping.ts) maps task and simplified-practice ranges onto that route.
- [`ScorePlayer.tsx`](../../src/components/ScorePlayer.tsx) creates the alphaTab player, renders the selected bars, and controls playback, pagination, and SoundFonts.
- [`vite.config.ts`](../../vite.config.ts) configures the alphaTab Vite plugin. [`sw.js`](../../public/sw.js) precaches the built app and score assets for offline use.

Treat these as project integration patterns, not alphaTab APIs. The [course authoring guide](../course-authoring.md) and [song source audit](../song-source-audit.md) define the app's content and evidence rules.

## Manual refresh procedure

1. Review a new alphaTabWebsite revision and record its full commit hash.
2. Rebuild the source index from the Markdown and MDX files actually present in `docs/` at that revision.
3. Recheck each curated API or setting against its source page and the tutorial project's locked alphaTab version. Mark unverified behavior **Version check required**.
4. Update affected topic pages and source links, then check that every index path resolves and every cited claim still matches the source.

The upstream website source is distributed under the repository's MPL-2.0 license. This Wiki provides concise summaries and attribution links; consult the original page for complete documentation and current details.
