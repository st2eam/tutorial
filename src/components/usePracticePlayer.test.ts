import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { importer, midi, type AlphaTabApi } from '@coderline/alphatab'
import { playbackTicksForBars } from './usePracticePlayer'

describe('按演奏顺序定位练习片段', () => {
  it('同一印刷小节的第一次与第二次反复定位到不同播放时间', () => {
    const score = importer.ScoreLoader.loadScoreFromBytes(readFileSync(resolve(process.cwd(), 'public/scores/castle-in-the-sky.musicxml')))
    const generator = new midi.MidiFileGenerator(score, null, new midi.AlphaSynthMidiFileHandler(new midi.MidiFile()))
    generator.generate()
    const api = { tickCache: generator.tickLookup } as AlphaTabApi
    const first = playbackTicksForBars(api, 2, 3, 1)!
    const second = playbackTicksForBars(api, 2, 3, 2)!
    expect(second.startTick).toBeGreaterThan(first.endTick)
    expect(second.endTick - second.startTick).toBe(first.endTick - first.startTick)
    const ending = playbackTicksForBars(api, 33, 35, 2)!
    expect(ending.startTick).toBeGreaterThan(second.startTick)
    expect(ending.endTick).toBeGreaterThan(ending.startTick)
  })
})
