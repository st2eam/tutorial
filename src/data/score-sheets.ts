import type { ChordName, Song } from './course'

export type UkuleleString = 'G' | 'C' | 'E' | 'A'
export type ScoreVoice = 'melody' | 'harmony'
export type ScoreNote = {
  string: UkuleleString
  fret: number
  tick: number
  duration: number
  voice: ScoreVoice
}
export type ScoreStrum = { tick: number; direction: 'down' | 'up' }
export type ScoreMeasure = {
  id: string
  chord: ChordName
  notes: ScoreNote[]
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

type MelodyPitch = readonly [UkuleleString, number]
type BarDraft = { chord: ChordName; melody: MelodyPitch[] }

const measureTicks = (meter: Song['timeSignature']) => meter === '6/8' ? 12 : Number(meter.split('/')[0]) * 4
const melodyTicks = (meter: Song['timeSignature']) => meter === '6/8' ? 2 : 4
const chordShapes: Record<ChordName, readonly [number, number, number, number]> = {
  C: [0, 0, 0, 3], Am: [2, 0, 0, 0], F: [2, 0, 1, 0], G: [0, 2, 3, 2], Em: [0, 4, 3, 2],
  E: [1, 4, 0, 2], D: [2, 2, 2, 0], Dm: [2, 2, 1, 0], Bm: [4, 2, 2, 2], G7: [0, 2, 1, 2],
  Fmaj7: [2, 0, 0, 0], Em7: [0, 2, 0, 2], Dm7: [2, 2, 1, 3], Cadd9: [0, 2, 0, 3], Gsus2: [0, 2, 3, 0], C7: [0, 0, 0, 1],
}
const courseStrings: readonly UkuleleString[] = ['G', 'C', 'E', 'A']

function makeMeasure(id: string, draft: BarDraft, meter: Song['timeSignature'], kind: Song['kind']): ScoreMeasure {
  const unit = melodyTicks(meter)
  const notes: ScoreNote[] = draft.melody.map(([string, fret], index) => ({
    string, fret, tick: index * unit, duration: unit, voice: 'melody',
  }))
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
  return { id, chord: draft.chord, notes, strums }
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

const bar = (chord: ChordName, ...melody: MelodyPitch[]): BarDraft => ({ chord, melody })

export const SCORE_SHEETS: Record<string, ScoreSheet> = {
  'always-with-me': makeSheet('always-with-me', 'fingerstyle', '4/4', 72, [
    { id: 'intro', label: '前奏动机', bars: [bar('C', ['E', 0], ['E', 3], ['A', 0], ['E', 3]), bar('Am', ['A', 0], ['A', 3], ['E', 0], ['E', 3])] },
    { id: 'theme-a', label: '主题 A', bars: [bar('C', ['E', 0], ['E', 3], ['E', 5], ['E', 3]), bar('G', ['A', 0], ['A', 3], ['E', 5], ['E', 3]), bar('Am', ['E', 0], ['E', 3], ['A', 3], ['A', 0]), bar('F', ['A', 3], ['E', 1], ['E', 3], ['A', 3])] },
    { id: 'theme-b', label: '主题 B', bars: [bar('C', ['A', 3], ['A', 5], ['E', 3], ['E', 0]), bar('G', ['E', 3], ['E', 5], ['A', 3], ['A', 0]), bar('Am', ['A', 0], ['A', 3], ['A', 5], ['E', 3]), bar('F', ['E', 1], ['E', 3], ['A', 3], ['A', 0])] },
    { id: 'bridge', label: '连接句', bars: [bar('Dm', ['A', 0], ['E', 1], ['E', 3], ['A', 3]), bar('G', ['E', 3], ['A', 0], ['A', 3], ['A', 0])] },
    { id: 'outro', label: '收尾', bars: [bar('F', ['A', 3], ['E', 1], ['E', 3], ['A', 3]), bar('C', ['E', 0], ['E', 3], ['A', 3], ['A', 0])] },
  ], ['intro', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  'canon-in-c': makeSheet('canon-in-c', 'fingerstyle', '4/4', 72, [
    { id: 'intro', label: '分解和弦引子', bars: [bar('C', ['E', 0], ['E', 0], ['A', 3], ['E', 0]), bar('G', ['E', 3], ['E', 3], ['A', 2], ['E', 3])] },
    { id: 'theme-a', label: '主题 A', bars: [bar('Am', ['E', 0], ['E', 0], ['A', 3], ['A', 0]), bar('Em', ['E', 0], ['E', 3], ['A', 2], ['E', 3]), bar('F', ['E', 1], ['E', 1], ['A', 0], ['E', 1]), bar('C', ['E', 0], ['E', 3], ['A', 3], ['E', 3])] },
    { id: 'theme-b', label: '主题 B', bars: [bar('F', ['A', 0], ['A', 3], ['A', 5], ['A', 3]), bar('C', ['E', 3], ['E', 0], ['A', 3], ['E', 0]), bar('F', ['A', 0], ['A', 3], ['E', 1], ['E', 3]), bar('G', ['E', 3], ['E', 5], ['A', 2], ['A', 0])] },
    { id: 'bridge', label: '连接段', bars: [bar('Am', ['E', 0], ['A', 0], ['A', 3], ['E', 0]), bar('Em', ['E', 3], ['E', 0], ['A', 2], ['E', 3])] },
    { id: 'outro', label: '尾声', bars: [bar('F', ['E', 1], ['A', 0], ['E', 3], ['A', 3]), bar('C', ['E', 0], ['A', 3], ['E', 0], ['C', 0])] },
  ], ['intro', 'theme-a', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  summer: makeSheet('summer', 'fingerstyle', '4/4', 96, [
    { id: 'intro', label: '琶音前奏', bars: [bar('Am', ['A', 0], ['E', 0], ['C', 0], ['E', 0]), bar('F', ['A', 0], ['E', 1], ['C', 0], ['E', 1])] },
    { id: 'theme-a', label: '主题 A', bars: [bar('C', ['E', 0], ['E', 3], ['A', 0], ['A', 3]), bar('G', ['A', 2], ['A', 3], ['E', 3], ['E', 2]), bar('Am', ['A', 0], ['E', 0], ['E', 3], ['A', 3]), bar('F', ['A', 0], ['E', 1], ['E', 3], ['A', 3])] },
    { id: 'theme-b', label: '主题 B', bars: [bar('C', ['A', 3], ['A', 5], ['E', 3], ['E', 0]), bar('G', ['A', 2], ['A', 3], ['E', 5], ['E', 3]), bar('Am', ['A', 0], ['A', 3], ['E', 0], ['E', 3]), bar('F', ['A', 3], ['E', 1], ['A', 5], ['E', 3])] },
    { id: 'bridge', label: '低音连接', bars: [bar('G', ['G', 0], ['C', 2], ['E', 3], ['A', 2]), bar('C', ['G', 0], ['C', 0], ['E', 0], ['A', 3])] },
    { id: 'outro', label: '尾声', bars: [bar('F', ['A', 3], ['E', 1], ['E', 3], ['A', 5]), bar('C', ['A', 3], ['E', 0], ['C', 0], ['A', 3])] },
  ], ['intro', 'theme-a', 'theme-b', 'theme-a', 'theme-b', 'bridge', 'theme-a', 'outro']),
  anheqiao: makeSheet('anheqiao', 'singalong', '4/4', 65, [
    { id: 'intro', label: '前奏', bars: [bar('C', ['E', 0], ['E', 3], ['A', 0], ['E', 3]), bar('G', ['E', 3], ['E', 2], ['A', 2], ['A', 0])] },
    { id: 'verse', label: '主歌', bars: [bar('C', ['E', 0], ['E', 3], ['A', 0], ['A', 3]), bar('G', ['A', 2], ['A', 0], ['E', 3], ['E', 2]), bar('Em', ['E', 0], ['E', 2], ['A', 2], ['A', 0]), bar('D', ['A', 0], ['A', 2], ['A', 3], ['A', 2])] },
    { id: 'chorus', label: '副歌', bars: [bar('C', ['E', 3], ['E', 5], ['A', 3], ['A', 0]), bar('G', ['A', 2], ['A', 3], ['E', 3], ['E', 2]), bar('D', ['A', 0], ['A', 2], ['A', 3], ['E', 2]), bar('Em', ['E', 0], ['E', 2], ['A', 2], ['A', 0])] },
    { id: 'bridge', label: '间奏', bars: [bar('C', ['A', 3], ['E', 3], ['A', 0], ['E', 3]), bar('D', ['A', 0], ['A', 2], ['E', 2], ['A', 2])] },
    { id: 'outro', label: '尾奏', bars: [bar('G', ['A', 2], ['E', 3], ['A', 0], ['E', 3]), bar('C', ['E', 0], ['C', 0], ['E', 0], ['A', 3])] },
  ], ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro']),
  chengdu: makeSheet('chengdu', 'singalong', '6/8', 61, [
    { id: 'intro', label: '前奏', bars: [bar('C', ['A', 3], ['A', 5], ['A', 7], ['A', 5], ['A', 3], ['E', 3]), bar('G', ['E', 3], ['E', 2], ['A', 5], ['A', 3], ['E', 2], ['E', 3])] },
    { id: 'verse-a', label: '主歌 A', bars: [bar('C', ['A', 3], ['A', 5], ['A', 7], ['A', 5], ['E', 3], ['E', 5]), bar('G', ['A', 3], ['A', 2], ['E', 3], ['E', 2], ['A', 0], ['A', 2]), bar('Em', ['E', 0], ['E', 2], ['E', 3], ['A', 2], ['A', 0], ['E', 3]), bar('Am', ['A', 0], ['A', 3], ['E', 0], ['E', 3], ['A', 3], ['A', 0])] },
    { id: 'verse-b', label: '主歌 B', bars: [bar('F', ['A', 3], ['A', 5], ['E', 1], ['E', 3], ['A', 5], ['A', 3]), bar('C', ['A', 3], ['A', 0], ['E', 3], ['E', 0], ['A', 3], ['A', 0]), bar('G', ['E', 3], ['E', 2], ['A', 2], ['A', 0], ['E', 2], ['E', 3]), bar('Em', ['E', 0], ['E', 2], ['A', 0], ['A', 2], ['E', 3], ['E', 2])] },
    { id: 'chorus', label: '副歌', bars: [bar('C', ['A', 3], ['A', 5], ['A', 7], ['A', 5], ['E', 3], ['E', 5]), bar('G', ['A', 3], ['A', 2], ['E', 3], ['E', 2], ['A', 0], ['A', 2]), bar('Am', ['A', 0], ['A', 3], ['E', 0], ['E', 3], ['A', 3], ['A', 5]), bar('F', ['A', 3], ['E', 1], ['E', 3], ['A', 5], ['A', 3], ['A', 0])] },
    { id: 'bridge', label: '间奏', bars: [bar('Dm', ['A', 0], ['A', 3], ['E', 1], ['E', 3], ['A', 3], ['A', 0]), bar('G', ['E', 3], ['E', 2], ['A', 2], ['A', 0], ['E', 2], ['E', 3])] },
    { id: 'outro', label: '尾奏', bars: [bar('F', ['A', 3], ['E', 1], ['A', 5], ['E', 3], ['A', 3], ['E', 1]), bar('C', ['A', 3], ['E', 3], ['C', 0], ['E', 0], ['A', 3], ['A', 3])] },
  ], ['intro', 'verse-a', 'verse-b', 'chorus', 'intro', 'verse-a', 'verse-b', 'chorus', 'bridge', 'chorus', 'outro']),
  nanshannan: makeSheet('nanshannan', 'singalong', '4/4', 65, [
    { id: 'intro', label: '前奏', bars: [bar('Fmaj7', ['E', 0], ['E', 3], ['A', 0], ['E', 3]), bar('G7', ['E', 1], ['E', 3], ['A', 2], ['E', 3])] },
    { id: 'verse-a', label: '主歌一', bars: [bar('Em7', ['E', 0], ['E', 2], ['A', 0], ['A', 2]), bar('Am', ['A', 0], ['A', 3], ['E', 0], ['E', 3]), bar('Dm7', ['A', 3], ['A', 5], ['E', 1], ['E', 3]), bar('G7', ['E', 1], ['E', 3], ['A', 2], ['A', 0])] },
    { id: 'verse-b', label: '主歌二', bars: [bar('C', ['E', 0], ['E', 3], ['A', 3], ['A', 0]), bar('Dm', ['A', 0], ['A', 3], ['E', 1], ['E', 3]), bar('G', ['A', 2], ['A', 3], ['E', 3], ['E', 2]), bar('Cadd9', ['E', 0], ['A', 3], ['E', 3], ['A', 0])] },
    { id: 'verse-c', label: '主歌三', bars: [bar('Gsus2', ['A', 2], ['A', 3], ['E', 3], ['E', 2]), bar('C7', ['A', 3], ['A', 5], ['E', 0], ['E', 1]), bar('F', ['A', 3], ['E', 1], ['A', 5], ['E', 3]), bar('G7', ['E', 1], ['A', 2], ['E', 3], ['A', 0])] },
    { id: 'outro', label: '尾声', bars: [bar('Fmaj7', ['A', 3], ['E', 0], ['A', 5], ['E', 3]), bar('C', ['E', 0], ['C', 0], ['E', 0], ['A', 3])] },
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
      if (note.tick < 0 || note.tick >= totalTicks || note.duration < 1 || note.tick + note.duration > totalTicks) issues.push(`${sheet.songId}: ${measure.id} 音符时值超出小节`)
    }
    for (const strum of measure.strums) if (strum.tick < 0 || strum.tick >= totalTicks) issues.push(`${sheet.songId}: ${measure.id} 扫弦拍点超出小节`)
  }
  return issues
}
