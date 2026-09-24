# Score data and formats

## Pick the source format

The tutorial project uses MusicXML as the canonical, reviewable score file. One file drives TAB display, standard notation, and synthesized playback. Keep course prose and the lesson-to-measure mapping in the app's data files; do not copy note data into a second player-specific format.

| Format | Use it for | Checks before adopting it |
| --- | --- | --- |
| MusicXML (`.musicxml`, `.mxl`) | The app's authored and maintained song scores | Check the element-level support table for the exact notation used. MusicXML can encode visual layout separately from sound semantics, and alphaTab does not promise to reproduce every print-layout instruction. |
| Guitar Pro (`.gp3`–`.gp8`) | Importing an existing editable score when the source file is licensed and the specific version is supported | Use the page for that Guitar Pro version; do not infer feature parity across versions. |
| AlphaTex | Compact text-authored examples and notation prototypes | AlphaTex covers many alphaTab features, but confirm that the feature needed for the final score is represented before making it canonical. |

MusicXML's feature table distinguishes model, reading, rendering, audio, and AlphaTex support. A feature being recognized by the importer does not guarantee it will appear identically in the rendered page or synthesized sound.

## Understand the score model

The model hierarchy is:

`Score → Track → Staff → Bar → Voice → Beat → Note`

`Score.masterBars` holds bar-wide information shared across tracks, including meter, key signature, and repeat structure. Track staves contain the notes and notation for each instrument. A `Beat` groups notes played together and can carry rhythmic, lyric, chord, and articulation data.

alphaTab expects tracks to follow a shared playback sequence. A score where one track repeats independently while another proceeds normally may not map to a single consistent route. Review repeat structure before building lesson playback ranges.

`playbackRange` uses MIDI ticks (`startTick` and `endTick`). Do not treat a measure number as a tick value. For a measure-based UI, resolve the measure boundaries from the loaded score and then set the tick range.

## Map a score into this project

1. Put the complete score at `public/scores/<song-id>.musicxml`.
2. Record the score file, meter, tempo unit, bar count, attribution, and route in `src/data/score-manifest.ts`.
3. Map each route stop to its score measure in `src/data/score-mapping.ts`; task ranges refer to route positions and resolve to measures for display.
4. Bind both normal and simplified lesson ranges to that mapping. Keep repeated musical material in the score once and reference its route occurrence in the manifest.
5. Use the same MusicXML file for score display and playback.

The app's `playOrder` and lesson mapping are project data, not alphaTab API fields. Keep source-version evidence in `docs/song-source-audit.md`.

Before authoring new song data, follow the project's [course authoring guide](../course-authoring.md) and [source audit](../song-source-audit.md): lock one reference version, check redistribution rights, and label any score details that have not been verified. The Wiki documents alphaTab behavior; those project guides govern score provenance and course policy.

## Sources

- [alphaTab introduction](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/introduction.mdx)
- [MusicXML support and feature table](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/musicxml.mdx)
- [Guitar Pro 3–5](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/guitar-pro-3-5.mdx), [6](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/guitar-pro-6.mdx), [7](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/guitar-pro-7.mdx), and [8](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/guitar-pro-8.mdx)
- [AlphaTex introduction](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/alphatex/introduction.mdx), [document structure](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/alphatex/document-structure.mdx), and [syntax](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/alphatex/syntax.mdx)
- [Score data model](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/score.mdx) and [`playbackRange`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/api/playbackrange.mdx)
