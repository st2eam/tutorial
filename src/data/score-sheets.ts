import type { ChordName, Song } from './course'

export type UkuleleString = 'G' | 'C' | 'E' | 'A'
export type ScoreVoice = 'melody' | 'harmony'
export type ScoreNote = {
  string: UkuleleString
  fret: number
  tick: number
  duration: number
  voice: ScoreVoice
  tieToNext?: boolean
}
export type ScoreRest = { tick: number; duration: number; voice: ScoreVoice }
export type ScoreStrum = { tick: number; direction: 'down' | 'up' }
export type ScoreMeasure = {
  id: string
  chord: ChordName
  notes: ScoreNote[]
  rests: ScoreRest[]
  strums: ScoreStrum[]
}
export type ScorePart = { id: string; label: string; measures: string[] }
export type ScoreSheet = {
  songId: string
  tuning: 'High-G'
  timeSignature: Song['timeSignature']
  bpm: number
  tempoUnit: 'quarter' | 'dotted-quarter'
  parts: ScorePart[]
  measures: Record<string, ScoreMeasure>
  playOrder: string[]
}

type ScoreDraftEvent =
  | { type: 'note'; string: UkuleleString; fret: number; tick: number; duration: number; tieToNext?: boolean }
  | { type: 'rest'; tick: number; duration: number; voice?: ScoreVoice }
type BarDraft = { chord: ChordName; events: ScoreDraftEvent[] }

const measureTicks = (meter: Song['timeSignature']) => meter === '6/8' ? 12 : Number(meter.split('/')[0]) * 4
const chordShapes: Record<ChordName, readonly [number, number, number, number]> = {
  C: [0, 0, 0, 3], Am: [2, 0, 0, 0], F: [2, 0, 1, 0], G: [0, 2, 3, 2], Em: [0, 4, 3, 2],
  E: [1, 4, 0, 2], D: [2, 2, 2, 0], Dm: [2, 2, 1, 0], Bm: [4, 2, 2, 2], G7: [0, 2, 1, 2],
  Fmaj7: [2, 0, 0, 0], Em7: [0, 2, 0, 2], Dm7: [2, 2, 1, 3], Cadd9: [0, 2, 0, 3], Gsus2: [0, 2, 3, 0], C7: [0, 0, 0, 1],
}
const courseStrings: readonly UkuleleString[] = ['G', 'C', 'E', 'A']

function makeMeasure(id: string, draft: BarDraft, meter: Song['timeSignature'], kind: Song['kind']): ScoreMeasure {
  const notes: ScoreNote[] = draft.events.flatMap((event) => event.type === 'note'
    ? [{ string: event.string, fret: event.fret, tick: event.tick, duration: event.duration, voice: 'melody' as const, ...(event.tieToNext ? { tieToNext: true } : {}) }]
    : [])
  const rests: ScoreRest[] = draft.events.flatMap((event) => event.type === 'rest'
    ? [{ tick: event.tick, duration: event.duration, voice: event.voice ?? 'melody' }]
    : [])
  if (kind === 'fingerstyle') {
    const shape = chordShapes[draft.chord]
    const pickingTicks = meter === '6/8' ? [0, 4, 8] : [0, 4, 8, 12]
    pickingTicks.forEach((tick, index) => {
      const stringIndex = [0, 2, 1, 3][index % 4]
      notes.push({ string: courseStrings[stringIndex], fret: shape[stringIndex], tick, duration: Math.min(4, measureTicks(meter) - tick), voice: 'harmony' })
    })
  }
  const strums = kind === 'singalong'
    ? (meter === '6/8'
      ? [{ tick: 0, direction: 'down' as const }, { tick: 6, direction: 'up' as const }]
      : [{ tick: 0, direction: 'down' as const }, { tick: 4, direction: 'up' as const }, { tick: 8, direction: 'down' as const }, { tick: 12, direction: 'up' as const }])
    : []
  return { id, chord: draft.chord, notes, rests, strums }
}

function makeSheet(
  songId: string,
  kind: Song['kind'],
  timeSignature: Song['timeSignature'],
  bpm: number,
  parts: { id: string; label: string; bars: BarDraft[] }[],
  playOrder: string[],
): ScoreSheet {
  const measures: Record<string, ScoreMeasure> = {}
  const preparedParts = parts.map((part) => {
    const ids = part.bars.map((_, index) => `${part.id}-${index + 1}`)
    part.bars.forEach((bar, index) => { measures[ids[index]] = makeMeasure(ids[index], bar, timeSignature, kind) })
    return { id: part.id, label: part.label, measures: ids }
  })
  return {
    songId, tuning: 'High-G', timeSignature, bpm,
    tempoUnit: timeSignature === '6/8' ? 'dotted-quarter' : 'quarter',
    parts: preparedParts, measures,
    playOrder: playOrder.flatMap((partId) => preparedParts.find((part) => part.id === partId)?.measures ?? []),
  }
}

const bar = (chord: ChordName, ...events: ScoreDraftEvent[]): BarDraft => ({ chord, events })
const rhythmicBar = (chord: ChordName, ...events: ScoreDraftEvent[]): BarDraft => ({ chord, events })
const n = (string: UkuleleString, fret: number, tick: number, duration: number, tieToNext = false): ScoreDraftEvent => ({ type: 'note', string, fret, tick, duration, ...(tieToNext ? { tieToNext: true } : {}) })
const r = (tick: number, duration: number): ScoreDraftEvent => ({ type: 'rest', tick, duration, voice: 'melody' })
const noteAt = n

export const SCORE_SHEETS: Record<string, ScoreSheet> = {
  'always-with-me': makeSheet('always-with-me', 'fingerstyle', '4/4', 72, [
    { id: 'intro', label: '前奏动机', bars: [rhythmicBar('C', n('E', 0, 0, 4), n('E', 3, 4, 2), r(6, 2), n('A', 0, 8, 2), n('E', 3, 10, 6)), bar('Am', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 0, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'theme-a', label: '主题 A', bars: [bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('E', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('G', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('Am', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4)), bar('F', noteAt('A', 3, 0, 4), noteAt('E', 1, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4))] },
    { id: 'theme-b', label: '主题 B', bars: [bar('C', noteAt('A', 3, 0, 4), noteAt('A', 5, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 0, 12, 4)), bar('G', noteAt('E', 3, 0, 4), noteAt('E', 5, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4)), bar('Am', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('A', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('F', noteAt('E', 1, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'bridge', label: '连接句', bars: [bar('Dm', noteAt('A', 0, 0, 4), noteAt('E', 1, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4)), bar('G', noteAt('E', 3, 0, 4), noteAt('A', 0, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'outro', label: '收尾', bars: [bar('F', noteAt('A', 3, 0, 4), noteAt('E', 1, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4)), bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4))] },
  ], ['intro', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  'canon-in-c': makeSheet('canon-in-c', 'fingerstyle', '4/4', 72, [
    { id: 'intro', label: '分解和弦引子', bars: [rhythmicBar('C', n('E', 0, 0, 4), n('E', 0, 4, 2), r(6, 2), n('A', 3, 8, 2), n('E', 0, 10, 6)), bar('G', noteAt('E', 3, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 2, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'theme-a', label: '主题 A', bars: [bar('Am', noteAt('E', 0, 0, 4), noteAt('E', 0, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4)), bar('Em', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 2, 8, 4), noteAt('E', 3, 12, 4)), bar('F', noteAt('E', 1, 0, 4), noteAt('E', 1, 4, 4), noteAt('A', 0, 8, 4), noteAt('E', 1, 12, 4)), bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 3, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'theme-b', label: '主题 B', bars: [bar('F', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('A', 5, 8, 4), noteAt('A', 3, 12, 4)), bar('C', noteAt('E', 3, 0, 4), noteAt('E', 0, 4, 4), noteAt('A', 3, 8, 4), noteAt('E', 0, 12, 4)), bar('F', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 1, 8, 4), noteAt('E', 3, 12, 4)), bar('G', noteAt('E', 3, 0, 4), noteAt('E', 5, 4, 4), noteAt('A', 2, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'bridge', label: '连接段', bars: [bar('Am', noteAt('E', 0, 0, 4), noteAt('A', 0, 4, 4), noteAt('A', 3, 8, 4), noteAt('E', 0, 12, 4)), bar('Em', noteAt('E', 3, 0, 4), noteAt('E', 0, 4, 4), noteAt('A', 2, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'outro', label: '尾声', bars: [bar('F', noteAt('E', 1, 0, 4), noteAt('A', 0, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4)), bar('C', noteAt('E', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 0, 8, 4), noteAt('C', 0, 12, 4))] },
  ], ['intro', 'theme-a', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  summer: makeSheet('summer', 'fingerstyle', '4/4', 96, [
    { id: 'intro', label: '琶音前奏', bars: [rhythmicBar('Am', n('A', 0, 0, 4), n('E', 0, 4, 2), r(6, 2), n('C', 0, 8, 2), n('E', 0, 10, 6)), bar('F', noteAt('A', 0, 0, 4), noteAt('E', 1, 4, 4), noteAt('C', 0, 8, 4), noteAt('E', 1, 12, 4))] },
    { id: 'theme-a', label: '主题 A', bars: [bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 0, 8, 4), noteAt('A', 3, 12, 4)), bar('G', noteAt('A', 2, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('Am', noteAt('A', 0, 0, 4), noteAt('E', 0, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4)), bar('F', noteAt('A', 0, 0, 4), noteAt('E', 1, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 3, 12, 4))] },
    { id: 'theme-b', label: '主题 B', bars: [bar('C', noteAt('A', 3, 0, 4), noteAt('A', 5, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 0, 12, 4)), bar('G', noteAt('A', 2, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('Am', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 0, 8, 4), noteAt('E', 3, 12, 4)), bar('F', noteAt('A', 3, 0, 4), noteAt('E', 1, 4, 4), noteAt('A', 5, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'bridge', label: '低音连接', bars: [bar('G', noteAt('G', 0, 0, 4), noteAt('C', 2, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 2, 12, 4)), bar('C', noteAt('G', 0, 0, 4), noteAt('C', 0, 4, 4), noteAt('E', 0, 8, 4), noteAt('A', 3, 12, 4))] },
    { id: 'outro', label: '尾声', bars: [bar('F', noteAt('A', 3, 0, 4), noteAt('E', 1, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 5, 12, 4)), bar('C', noteAt('A', 3, 0, 4), noteAt('E', 0, 4, 4), noteAt('C', 0, 8, 4), noteAt('A', 3, 12, 4))] },
  ], ['intro', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  anheqiao: makeSheet('anheqiao', 'singalong', '4/4', 65, [
    { id: 'intro', label: '前奏', bars: [rhythmicBar('C', n('E', 0, 0, 4), n('E', 3, 4, 2), r(6, 2), n('A', 0, 8, 2), n('E', 3, 10, 6)), bar('G', noteAt('E', 3, 0, 4), noteAt('E', 2, 4, 4), noteAt('A', 2, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'verse', label: '主歌', bars: [bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 0, 8, 4), noteAt('A', 3, 12, 4)), bar('G', noteAt('A', 2, 0, 4), noteAt('A', 0, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('Em', noteAt('E', 0, 0, 4), noteAt('E', 2, 4, 4), noteAt('A', 2, 8, 4), noteAt('A', 0, 12, 4)), bar('D', noteAt('A', 0, 0, 4), noteAt('A', 2, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 2, 12, 4))] },
    { id: 'chorus', label: '副歌', bars: [bar('C', noteAt('E', 3, 0, 4), noteAt('E', 5, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4)), bar('G', noteAt('A', 2, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('D', noteAt('A', 0, 0, 4), noteAt('A', 2, 4, 4), noteAt('A', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('Em', noteAt('E', 0, 0, 4), noteAt('E', 2, 4, 4), noteAt('A', 2, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'bridge', label: '间奏', bars: [bar('C', noteAt('A', 3, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 0, 8, 4), noteAt('E', 3, 12, 4)), bar('D', noteAt('A', 0, 0, 4), noteAt('A', 2, 4, 4), noteAt('E', 2, 8, 4), noteAt('A', 2, 12, 4))] },
    { id: 'outro', label: '尾奏', bars: [bar('G', noteAt('A', 2, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 0, 8, 4), noteAt('E', 3, 12, 4)), bar('C', noteAt('E', 0, 0, 4), noteAt('C', 0, 4, 4), noteAt('E', 0, 8, 4), noteAt('A', 3, 12, 4))] },
  ], ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro']),
  chengdu: makeSheet('chengdu', 'singalong', '6/8', 61, [
    { id: 'intro', label: '前奏', bars: [rhythmicBar('C', n('A', 3, 0, 1), r(1, 1), n('A', 5, 2, 2), n('A', 7, 4, 2), n('A', 5, 6, 2), n('A', 3, 8, 1), n('E', 3, 9, 3)), bar('G', noteAt('E', 3, 0, 2), noteAt('E', 2, 2, 2), noteAt('A', 5, 4, 2), noteAt('A', 3, 6, 2), noteAt('E', 2, 8, 2), noteAt('E', 3, 10, 2))] },
    { id: 'verse-a', label: '主歌 A', bars: [bar('C', noteAt('A', 3, 0, 2), noteAt('A', 5, 2, 2), noteAt('A', 7, 4, 2), noteAt('A', 5, 6, 2), noteAt('E', 3, 8, 2), noteAt('E', 5, 10, 2)), bar('G', noteAt('A', 3, 0, 2), noteAt('A', 2, 2, 2), noteAt('E', 3, 4, 2), noteAt('E', 2, 6, 2), noteAt('A', 0, 8, 2), noteAt('A', 2, 10, 2)), bar('Em', noteAt('E', 0, 0, 2), noteAt('E', 2, 2, 2), noteAt('E', 3, 4, 2), noteAt('A', 2, 6, 2), noteAt('A', 0, 8, 2), noteAt('E', 3, 10, 2)), bar('Am', noteAt('A', 0, 0, 2), noteAt('A', 3, 2, 2), noteAt('E', 0, 4, 2), noteAt('E', 3, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 0, 10, 2))] },
    { id: 'verse-b', label: '主歌 B', bars: [bar('F', noteAt('A', 3, 0, 2), noteAt('A', 5, 2, 2), noteAt('E', 1, 4, 2), noteAt('E', 3, 6, 2), noteAt('A', 5, 8, 2), noteAt('A', 3, 10, 2)), bar('C', noteAt('A', 3, 0, 2), noteAt('A', 0, 2, 2), noteAt('E', 3, 4, 2), noteAt('E', 0, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 0, 10, 2)), bar('G', noteAt('E', 3, 0, 2), noteAt('E', 2, 2, 2), noteAt('A', 2, 4, 2), noteAt('A', 0, 6, 2), noteAt('E', 2, 8, 2), noteAt('E', 3, 10, 2)), bar('Em', noteAt('E', 0, 0, 2), noteAt('E', 2, 2, 2), noteAt('A', 0, 4, 2), noteAt('A', 2, 6, 2), noteAt('E', 3, 8, 2), noteAt('E', 2, 10, 2))] },
    { id: 'chorus', label: '副歌', bars: [bar('C', noteAt('A', 3, 0, 2), noteAt('A', 5, 2, 2), noteAt('A', 7, 4, 2), noteAt('A', 5, 6, 2), noteAt('E', 3, 8, 2), noteAt('E', 5, 10, 2)), bar('G', noteAt('A', 3, 0, 2), noteAt('A', 2, 2, 2), noteAt('E', 3, 4, 2), noteAt('E', 2, 6, 2), noteAt('A', 0, 8, 2), noteAt('A', 2, 10, 2)), bar('Am', noteAt('A', 0, 0, 2), noteAt('A', 3, 2, 2), noteAt('E', 0, 4, 2), noteAt('E', 3, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 5, 10, 2)), bar('F', noteAt('A', 3, 0, 2), noteAt('E', 1, 2, 2), noteAt('E', 3, 4, 2), noteAt('A', 5, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 0, 10, 2))] },
    { id: 'bridge', label: '间奏', bars: [bar('Dm', noteAt('A', 0, 0, 2), noteAt('A', 3, 2, 2), noteAt('E', 1, 4, 2), noteAt('E', 3, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 0, 10, 2)), bar('G', noteAt('E', 3, 0, 2), noteAt('E', 2, 2, 2), noteAt('A', 2, 4, 2), noteAt('A', 0, 6, 2), noteAt('E', 2, 8, 2), noteAt('E', 3, 10, 2))] },
    { id: 'outro', label: '尾奏', bars: [bar('F', noteAt('A', 3, 0, 2), noteAt('E', 1, 2, 2), noteAt('A', 5, 4, 2), noteAt('E', 3, 6, 2), noteAt('A', 3, 8, 2), noteAt('E', 1, 10, 2)), bar('C', noteAt('A', 3, 0, 2), noteAt('E', 3, 2, 2), noteAt('C', 0, 4, 2), noteAt('E', 0, 6, 2), noteAt('A', 3, 8, 2), noteAt('A', 3, 10, 2))] },
  ], ['intro', 'verse-a', 'verse-b', 'chorus', 'intro', 'verse-a', 'verse-b', 'chorus', 'bridge', 'chorus', 'outro']),
  nanshannan: makeSheet('nanshannan', 'singalong', '4/4', 65, [
    { id: 'intro', label: '前奏', bars: [rhythmicBar('Fmaj7', n('E', 0, 0, 4), n('E', 3, 4, 2), r(6, 2), n('A', 0, 8, 2), n('E', 3, 10, 6)), bar('G7', noteAt('E', 1, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 2, 8, 4), noteAt('E', 3, 12, 4))] },
    { id: 'verse-a', label: '主歌一', bars: [bar('Em7', noteAt('E', 0, 0, 4), noteAt('E', 2, 4, 4), noteAt('A', 0, 8, 4), noteAt('A', 2, 12, 4)), bar('Am', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 0, 8, 4), noteAt('E', 3, 12, 4)), bar('Dm7', noteAt('A', 3, 0, 4), noteAt('A', 5, 4, 4), noteAt('E', 1, 8, 4), noteAt('E', 3, 12, 4)), bar('G7', noteAt('E', 1, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 2, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'verse-b', label: '主歌二', bars: [bar('C', noteAt('E', 0, 0, 4), noteAt('E', 3, 4, 4), noteAt('A', 3, 8, 4), noteAt('A', 0, 12, 4)), bar('Dm', noteAt('A', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 1, 8, 4), noteAt('E', 3, 12, 4)), bar('G', noteAt('A', 2, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('Cadd9', noteAt('E', 0, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'verse-c', label: '主歌三', bars: [bar('Gsus2', noteAt('A', 2, 0, 4), noteAt('A', 3, 4, 4), noteAt('E', 3, 8, 4), noteAt('E', 2, 12, 4)), bar('C7', noteAt('A', 3, 0, 4), noteAt('A', 5, 4, 4), noteAt('E', 0, 8, 4), noteAt('E', 1, 12, 4)), bar('F', noteAt('A', 3, 0, 4), noteAt('E', 1, 4, 4), noteAt('A', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('G7', noteAt('E', 1, 0, 4), noteAt('A', 2, 4, 4), noteAt('E', 3, 8, 4), noteAt('A', 0, 12, 4))] },
    { id: 'outro', label: '尾声', bars: [bar('Fmaj7', noteAt('A', 3, 0, 4), noteAt('E', 0, 4, 4), noteAt('A', 5, 8, 4), noteAt('E', 3, 12, 4)), bar('C', noteAt('E', 0, 0, 4), noteAt('C', 0, 4, 4), noteAt('E', 0, 8, 4), noteAt('A', 3, 12, 4))] },
  ], ['intro', 'verse-a', 'verse-b', 'verse-c', 'verse-a', 'verse-b', 'verse-c', 'outro']),
}

export function getTaskMeasureIds(sheet: ScoreSheet, stage: number): string[] {
  const order = sheet.playOrder
  if (stage >= 7) return order
  if (stage === 1) return order.slice(0, 1)
  if (stage === 2) return order.slice(0, 2)
  if (stage === 3) return order.slice(0, 4)
  if (stage === 4) return order.slice(2, 6)
  if (stage === 5) return order.slice(0, Math.ceil(order.length / 2))
  return order.slice(Math.ceil(order.length / 2))
}

export function getSimplifiedMeasureIds(sheet: ScoreSheet, stage: number): string[] {
  return getTaskMeasureIds(sheet, stage).slice(0, 1)
}

export function validateScoreSheet(sheet: ScoreSheet): string[] {
  const issues: string[] = []
  const totalTicks = measureTicks(sheet.timeSignature)
  const validIds = new Set(Object.keys(sheet.measures))
  if (!sheet.parts.length || !sheet.playOrder.length) issues.push(`${sheet.songId}: 缺少段落或演奏顺序`)
  for (const part of sheet.parts) {
    for (const id of part.measures) if (!validIds.has(id)) issues.push(`${sheet.songId}: 段落 ${part.id} 引用了不存在的小节 ${id}`)
  }
  for (const id of sheet.playOrder) if (!validIds.has(id)) issues.push(`${sheet.songId}: 演奏顺序引用了不存在的小节 ${id}`)
  for (const measure of Object.values(sheet.measures)) {
    if (!chordShapes[measure.chord]) issues.push(`${sheet.songId}: ${measure.id} 和弦无指法数据`)
    for (const note of measure.notes) {
      if (note.fret < 0 || note.fret > 12) issues.push(`${sheet.songId}: ${measure.id} 品位越界`)
      if (!Number.isInteger(note.tick) || !Number.isInteger(note.duration) || note.tick < 0 || note.tick >= totalTicks || note.duration < 1 || note.tick + note.duration > totalTicks) issues.push(`${sheet.songId}: ${measure.id} 音符时值超出小节`)
      if (measure.notes.some((next) => next !== note && next.voice === note.voice && next.tick < note.tick + note.duration && note.tick < next.tick + next.duration)) {
        issues.push(`${sheet.songId}: ${measure.id} 同声部音符重叠`)
      }
      if (note.tieToNext && !measure.notes.some((next) => next.voice === note.voice && next.string === note.string && next.fret === note.fret && next.tick === note.tick + note.duration)) {
        issues.push(`${sheet.songId}: ${measure.id} 延音没有连接到同弦同品的后续音符`)
      }
    }
    for (const rest of measure.rests) {
      if (!Number.isInteger(rest.tick) || !Number.isInteger(rest.duration) || rest.tick < 0 || rest.tick >= totalTicks || rest.duration < 1 || rest.tick + rest.duration > totalTicks) issues.push(`${sheet.songId}: ${measure.id} 休止时值超出小节`)
      if (measure.notes.some((note) => note.voice === rest.voice && note.tick < rest.tick + rest.duration && rest.tick < note.tick + note.duration)) {
        issues.push(`${sheet.songId}: ${measure.id} 休止与同声部音符重叠`)
      }
    }
    for (const strum of measure.strums) if (strum.tick < 0 || strum.tick >= totalTicks) issues.push(`${sheet.songId}: ${measure.id} 扫弦拍点超出小节`)
  }
  return issues
}

export function getPlaybackNotes(sheet: ScoreSheet, measureIds: string[]) {
  const notes = measureIds.flatMap((id, measureIndex) => {
    const measure = sheet.measures[id]
    return measure.notes.map((note) => ({ ...note, measureId: id, absoluteTick: measureIndex * measureTicks(sheet.timeSignature) + note.tick }))
  })
  const tiedNotes = new Set<number>()
  const scheduled = notes.flatMap((note, index) => {
    if (tiedNotes.has(index)) return []
    let duration = note.duration
    let current = note
    while (current.tieToNext) {
      const nextIndex = notes.findIndex((candidate, candidateIndex) => candidateIndex > index
        && candidate.voice === current.voice && candidate.string === current.string && candidate.fret === current.fret
        && candidate.absoluteTick === current.absoluteTick + current.duration)
      if (nextIndex < 0) break
      tiedNotes.add(nextIndex)
      current = notes[nextIndex]
      duration += current.duration
    }
    return [{ ...note, duration }]
  })
  return scheduled
}
