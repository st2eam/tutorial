import { COURSE_SCORE_MANIFEST } from './score-manifest'

export type CourseScoreId = keyof typeof COURSE_SCORE_MANIFEST
export type CourseScore = (typeof COURSE_SCORE_MANIFEST)[CourseScoreId]
export type ScorePage = { bars: number[]; routeIndexes: number[] }

function manifestFor(songId: string) {
  return COURSE_SCORE_MANIFEST[songId as CourseScoreId]
}

function physicalBarByMeasureId(songId: string) {
  const manifest = manifestFor(songId)
  return new Map(manifest.parts.flatMap((part) => part.bars.map((bar, index) => [
    songId === 'castle-in-the-sky' ? `bar-${String(bar).padStart(2, '0')}` : `${part.id}-${index + 1}`,
    bar,
  ] as const)))
}

export function getRouteBars(songId: string): number[] {
  const manifest = manifestFor(songId)
  const barMap = physicalBarByMeasureId(songId)
  return manifest.playOrder.map((id) => barMap.get(id) ?? Number(id.replace(/^bar-/, '')))
}

const CASTLE_STAGE_BARS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: Array.from({ length: 8 }, (_, index) => index + 2),
  3: Array.from({ length: 9 }, (_, index) => index + 10),
  4: Array.from({ length: 9 }, (_, index) => index + 19),
  5: Array.from({ length: 8 }, (_, index) => index + 28),
  6: Array.from({ length: 10 }, (_, index) => index + 36),
}

const CASTLE_SIMPLIFIED_BARS: Record<number, number[]> = {
  1: [1],
  2: [2, 3],
  3: [10, 11, 12],
  4: [19, 20],
  5: [28, 29],
  6: [36, 37],
  7: Array.from({ length: 9 }, (_, index) => index + 1),
  8: [1, 2],
}

function getCastleTaskRouteIndexes(stage: number, simplified: boolean): number[] {
  const route = getRouteBars('castle-in-the-sky')
  if (stage >= 7 && !simplified) return route.map((_, index) => index)
  const selected = simplified ? CASTLE_SIMPLIFIED_BARS[stage] : CASTLE_STAGE_BARS[stage]
  return (selected ?? CASTLE_SIMPLIFIED_BARS[8]).map((bar) => route.findIndex((candidate) => candidate === bar)).filter((index) => index >= 0)
}

export function getTaskRouteIndexes(songId: string, stage: number, simplified = false): number[] {
  const route = getRouteBars(songId)
  if (songId === 'castle-in-the-sky') return getCastleTaskRouteIndexes(stage, simplified)

  let indexes: number[]
  if (stage >= 7) indexes = route.map((_, index) => index)
  else if (stage === 1) indexes = route.slice(0, 2).map((_, index) => index)
  else if (stage === 2) indexes = route.slice(0, 2).map((_, index) => index)
  else if (stage === 3) indexes = route.slice(0, 4).map((_, index) => index)
  else if (stage === 4) indexes = route.slice(2, 6).map((_, index) => index + 2)
  else if (stage === 5) indexes = route.slice(0, Math.ceil(route.length / 2)).map((_, index) => index)
  else indexes = route.slice(Math.ceil(route.length / 2)).map((_, index) => index + Math.ceil(route.length / 2))
  return simplified ? indexes.slice(0, 1) : indexes
}

export function getTaskScoreBars(songId: string, stage: number, simplified: boolean): number[] {
  const route = getRouteBars(songId)
  return getTaskRouteIndexes(songId, stage, simplified).map((index) => route[index])
}

export function makeScorePages(bars: number[], pageSize: number, keepOccurrences = false): ScorePage[] {
  const pages: ScorePage[] = []
  let current: ScorePage | null = null
  bars.forEach((bar, routeIndex) => {
    const isAdjacent = current && current.bars[current.bars.length - 1] + 1 === bar
    if (!current || current.bars.length >= pageSize || (!isAdjacent && (keepOccurrences || current.bars.length > 0))) {
      current = { bars: [], routeIndexes: [] }
      pages.push(current)
    }
    current.bars.push(bar)
    current.routeIndexes.push(routeIndex)
  })
  return pages
}
