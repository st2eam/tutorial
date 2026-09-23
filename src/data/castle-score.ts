export type CastleString = 'A' | 'E' | 'C' | 'G'
export type CastleNote = { string: CastleString; fret: number }
export type CastleEvent = {
  tick: number
  duration: number
  notes: CastleNote[]
  rest?: 'quarter'
  arpeggio?: boolean
  slurAfter?: CastleString
}
export type CastleMeasure = { number: number; events: CastleEvent[] }

const note = (string: CastleString, fret: number): CastleNote => ({ string, fret })
const chord = (...frets: [number, number, number, number]): CastleNote[] => [
  note('A', frets[0]), note('E', frets[1]), note('C', frets[2]), note('G', frets[3]),
]
const pitch = (string: CastleString, fret: number) => [note(string, fret)]
const rest = () => []

function measure(number: number, groups: Array<{ pitches?: CastleNote[]; duration: number; rest?: boolean; slurAfter?: CastleString }>): CastleMeasure {
  let tick = 0
  const events = groups.map((group) => {
    const event: CastleEvent = {
      tick,
      duration: group.duration,
      notes: group.pitches ?? rest(),
      ...(group.rest ? { rest: 'quarter' as const } : {}),
      ...(group.pitches && group.pitches.length > 1 ? { arpeggio: true } : {}),
      ...(group.slurAfter ? { slurAfter: group.slurAfter } : {}),
    }
    tick += group.duration
    return event
  })
  return { number, events }
}

const q = (pitches: CastleNote[], extras: { slurAfter?: CastleString } = {}) => ({ pitches, duration: 4, ...extras })
const e = (pitches: CastleNote[], extras: { slurAfter?: CastleString } = {}) => ({ pitches, duration: 2, ...extras })
const h = (pitches: CastleNote[]) => ({ pitches, duration: 8 })
const qr = { duration: 4, rest: true }

/**
 * Hand-set TAB engraving data for the 24-bar Leleex arrangement. The score is
 * rendered with native SVG text and paths; no screenshot or bitmap is used.
 * Strings follow the source from top to bottom: A, E, C, G.
 */
export const CASTLE_SCORE: CastleMeasure[] = [
  measure(1, [qr, qr, qr, e(pitch('A', 0)), e(pitch('A', 2))]),
  measure(2, [q(chord(3, 0, 0, 2)), q(pitch('C', 0)), q(chord(3, 0, 0, 2)), q(pitch('A', 7))]),
  measure(3, [q(chord(2, 0, 2, 0), { slurAfter: 'E' }), h(chord(2, 0, 2, 0)), q(pitch('A', 0))]),
  measure(4, [e(chord(0, 1, 0, 2)), e(pitch('C', 0)), q(chord(3, 1, 0, 2)), q(chord(0, 1, 0, 2)), q(pitch('A', 3))]),
  measure(5, [q(chord(3, 0, 0, 0), { slurAfter: 'A' }), q(chord(3, 0, 0, 0)), h(pitch('A', 0))]),
  measure(6, [e(chord(1, 2, 0, 2)), e(pitch('C', 2)), q(chord(0, 2, 0, 2)), q(chord(1, 2, 0, 2)), q(pitch('A', 3))]),
  measure(7, [q(chord(0, 0, 0, 2), { slurAfter: 'E' }), q(chord(0, 0, 0, 2)), q(pitch('A', 3)), e(pitch('A', 3)), e(pitch('A', 3))]),
  measure(8, [q(chord(2, 2, 3, 2)), q(pitch('C', 3)), q(pitch('C', 3)), q(chord(2, 2, 2, 1))]),
  measure(9, [q(chord(2, 0, 2, 1), { slurAfter: 'E' }), q(chord(2, 0, 2, 1)), q(chord(0, 0, 2, 1)), q(chord(2, 0, 2, 1))]),
  measure(10, [q(chord(3, 0, 0, 2)), q(pitch('C', 0)), q(chord(3, 0, 0, 2)), q(pitch('A', 7))]),
  measure(11, [q(chord(2, 0, 2, 0), { slurAfter: 'E' }), q(pitch('A', 2)), q(chord(2, 0, 2, 0)), q(pitch('A', 0))]),
  measure(12, [e(chord(0, 1, 0, 2)), e(pitch('C', 0)), q(chord(0, 1, 3, 2)), q(chord(0, 1, 0, 2)), q(pitch('A', 3))]),
  measure(13, [q(chord(3, 0, 0, 0), { slurAfter: 'E' }), q(chord(3, 0, 0, 0)), h(pitch('A', 0))]),
  measure(14, [q(chord(1, 2, 2, 2)), q(pitch('C', 3)), q(pitch('C', 0)), q(chord(2, 0, 0, 2))]),
  measure(15, [q(chord(5, 0, 0, 2), { slurAfter: 'A' }), q(chord(5, 0, 0, 2), { slurAfter: 'A' }), q(chord(7, 0, 0, 2)), q(chord(3, 0, 0, 2), { slurAfter: 'A' })]),
  measure(16, [e(chord(3, 1, 0, 0)), e(pitch('A', 2)), q(pitch('A', 0)), q(chord(2, 0, 2, 1)), q(pitch('G', 1))]),
  measure(17, [q(chord(0, 0, 0, 2), { slurAfter: 'E' }), q(chord(0, 0, 0, 2)), q(pitch('A', 3)), q(pitch('A', 5))]),
  measure(18, [e(chord(7, 0, 0, 0), { slurAfter: 'E' }), e(pitch('C', 0)), q(pitch('A', 0)), q(pitch('A', 5)), q(chord(7, 0, 0, 0))]),
  measure(19, [e(chord(5, 3, 2, 0)), e(pitch('C', 2)), q(pitch('C', 3)), q(chord(5, 3, 2, 0)), q(pitch('C', 2))]),
  measure(20, [e(chord(3, 0, 0, 2)), e(pitch('C', 0)), q(pitch('C', 0)), q(pitch('A', 2)), q(pitch('A', 3))]),
  measure(21, [q(chord(7, 7, 7, 0), { slurAfter: 'E' }), q(chord(7, 7, 7, 0)), q(pitch('A', 7)), q(chord(7, 7, 7, 0))]),
  measure(22, [e(chord(0, 1, 0, 2)), e(pitch('A', 2)), e(pitch('A', 3)), e(chord(2, 3, 2, 0)), q(pitch('A', 3)), q(pitch('A', 5))]),
  measure(23, [q(chord(3, 0, 0, 0), { slurAfter: 'E' }), q(pitch('C', 0)), q(pitch('A', 3)), q(chord(3, 0, 0, 0), { slurAfter: 'E' })]),
  measure(24, [q(chord(8, 10, 0, 0)), q(chord(7, 8, 0, 0)), q(chord(5, 7, 0, 0)), q(chord(3, 5, 0, 0), { slurAfter: 'E' })]),
]

export const CASTLE_SCORE_MEASURE_COUNT = CASTLE_SCORE.length
export const CASTLE_SCORE_SOURCE = {
  sourceUrl: 'https://www.ukuleleba.com/22389.html',
  attribution: '莉莉克丝 Leleex · 曲：久石让',
} as const

export const CASTLE_SCORE_SYSTEMS = Array.from({ length: 8 }, (_, index) => ({
  row: index + 1,
  firstBar: index * 3 + 1,
  lastBar: index * 3 + 3,
}))

export function validateCastleScore(): string[] {
  const errors: string[] = []
  if (CASTLE_SCORE.map((bar) => bar.number).join(',') !== Array.from({ length: 24 }, (_, index) => index + 1).join(',')) {
    errors.push('Measures must be numbered 1 through 24.')
  }
  for (const bar of CASTLE_SCORE) {
    const total = bar.events.reduce((sum, event) => sum + event.duration, 0)
    if (total !== 16) errors.push(`Measure ${bar.number} has ${total} sixteenth ticks, expected 16.`)
    if (bar.events.some((event) => event.duration <= 0 || event.tick < 0)) errors.push(`Measure ${bar.number} has an invalid event.`)
  }
  return errors
}
