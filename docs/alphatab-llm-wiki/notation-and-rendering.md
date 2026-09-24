# Notation and rendering

## Configure the notation view

The Web API renders into a DOM container. Give that container a measurable width; page layout can resize with its host. Use display settings to choose layout and the visible bar range.

| Setting | Purpose | Tutorial project use |
| --- | --- | --- |
| `display.layoutMode` | Selects page or other layout behavior | The player uses page layout. |
| `display.startBar` | First bar rendered | Set from the active page. |
| `display.barCount` | Number of bars rendered | Set from the active page. |
| `display.barsPerRow` | Bars per system/row | One on mobile and up to two on desktop. |
| `display.staveProfile` | Selects which staves are visible | The player switches between TAB and combined score plus TAB. |
| `core.fontDirectory` | Locates alphaTab's music font assets | Point to the deployed `font/` directory. |

The reference recommends keeping the default stave profile when possible and configuring individual `Staff` objects for per-staff behavior. This app intentionally switches the profile to provide a simple TAB / score-plus-TAB toggle. Confirm the desired profile and staff behavior with a representative score before changing it.

After changing display settings on a loaded API instance, render again using the lifecycle shown in the API reference. Avoid creating a second API instance for each page turn; update the existing instance and release it when the score component is removed.

## Music engraving checks for ukulele TAB

- Confirm each part's instrument, staff tuning, and string numbering against the intended instrument. alphaTab's score model stores instrument and staff information separately from the individual notes.
- Confirm that each note's string and fret data is represented by the imported score and that the rendered stave profile includes the TAB staff.
- Check rhythmic values, rests, ties, tuplets, simultaneous notes, barlines, and repeats in both notation and synthesized audio. MusicXML can describe displayed notation and sound separately.
- Use the MusicXML support table for uncertain elements. Do not treat a general “supported” format label as proof that every element or value is supported.

## Page a long score

For an app-controlled page, render one or more bars by updating `startBar`, `barCount`, and `barsPerRow`, then render the API. The current tutorial app shows one bar per mobile page and up to two bars per desktop page. Playback position is tracked separately so automatic page following can keep the active bar visible without interrupting audio.

## Sources

- [Web configuration](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/configuration-web.mdx)
- [Display settings reference](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings.mdx), [`layoutMode`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/layoutmode.mdx), [`startBar`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/startbar.mdx), [`barCount`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/barcount.mdx), [`barsPerRow`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/barsperrow.mdx), [`staveProfile`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/display/staveprofile.mdx), and [`fontDirectory`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/core/fontdirectory.mdx)
- [Score data model](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/score.mdx) and [MusicXML support](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/formats/musicxml.mdx)
