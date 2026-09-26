import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { importer } from '@coderline/alphatab'
import { INTERACTIVE_COURSES } from './interactive-course'
import { emptyProgress, exportBackup, getInteractiveProgress, updateInteractiveProgress, validateProgressBackup } from '../lib/progress'

describe('新版原创互动练习', () => {
  it('MusicXML 导入后仍是 High-G、四个完整小节，乐句边界可定位', () => {
    for (const course of INTERACTIVE_COURSES) {
      const bytes = readFileSync(resolve(process.cwd(), 'public', course.scoreFile))
      const score = importer.ScoreLoader.loadScoreFromBytes(bytes)
      expect(score.masterBars).toHaveLength(course.barCount)
      expect(score.tracks[0].staves[0].tuning).toEqual([69, 64, 60, 67])
      for (const phrase of course.phrases) {
        expect(phrase.firstBar).toBeGreaterThanOrEqual(1)
        expect(phrase.lastBar).toBeLessThanOrEqual(score.masterBars.length)
        expect(phrase.firstBar).toBeLessThanOrEqual(phrase.lastBar)
      }
      for (const track of score.tracks) {
        expect(track.staves[0].bars).toHaveLength(course.barCount)
        for (const bar of track.staves[0].bars) {
          const duration = bar.voices[0].beats.reduce((sum, beat) => sum + beat.playbackDuration, 0)
          expect(duration).toBe(3840)
        }
      }
    }
  })

  it('音符位置与实际发声音高一致，和弦四根弦同时奏响', () => {
    const fingerstyle = importer.ScoreLoader.loadScoreFromBytes(readFileSync(resolve(process.cwd(), 'public/scores/original-fingerstyle-practice.musicxml')))
    const melody = fingerstyle.tracks[0].staves[0].bars[0].voices[0].beats
    expect(melody.map(beat => beat.notes[0].realValue)).toEqual([69, 71, 72, 71])
    expect(melody.map(beat => [beat.notes[0].string, beat.notes[0].fret])).toEqual([[4, 0], [4, 2], [4, 3], [4, 2]])
    const singalong = importer.ScoreLoader.loadScoreFromBytes(readFileSync(resolve(process.cwd(), 'public/scores/original-singalong-practice.musicxml')))
    expect(singalong.tracks[0].staves[0].bars[0].voices[0].beats[0].notes).toHaveLength(4)
    expect(singalong.tracks[0].staves[0].bars.map(bar => bar.voices[0].beats[0].chordId?.split('|')[0].trim())).toEqual(['C', 'Am', 'F', 'G'])
  })

  it('新版进度带课程版本，旧版备份与历史进度互不覆盖', () => {
    const course = INTERACTIVE_COURSES[0]
    const old = emptyProgress()
    const updated = updateInteractiveProgress(old, course, { currentPhraseId: course.phrases[1].id, level: 'full', speed: 0.55, masteredPhraseIds: [course.phrases[0].id] })
    const backup = exportBackup(updated)
    expect(backup.version).toBe(3)
    expect(validateProgressBackup(backup)).toEqual(updated)
    expect(getInteractiveProgress(updated, course).courseVersion).toBe(course.version)
    expect(validateProgressBackup({ ...backup, version: 2, data: old })).toEqual(old)
    expect(getInteractiveProgress({ ...updated, interactive: { [course.id]: { ...getInteractiveProgress(updated, course), courseVersion: 'old' } } }, course).masteredPhraseIds).toEqual([])
  })
})
