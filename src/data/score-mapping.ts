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

function getCastleBars(stage: number, simplified: boolean): number[] {
  const rows = Array.from({ length: 8 }, (_, index) => [index * 3 + 1, index * 3 + 2, index * 3 + 3])
  if (simplified) {
    if (stage <= 3) return [1]
    if (stage === 4) return [4]
    if (stage === 5) return [7]
    if (stage === 6) return [10, 11, 12]
    if (stage === 7) return rows.slice(0, 3).flat()
    if (stage >= 8) return rows[0].slice(0, 2)
  }
  if (stage === 1 || stage >= 7) return rows.flat()
  if (stage === 2) return rows[0]
  if (stage === 3) return rows[0]
  if (stage === 4) return rows[1]
  if (stage === 5) return rows[2]
  return rows.slice(3, 6).flat()
}

export function getTaskRouteIndexes(songId: string, stage: number, simplified = false): number[] {
  const route = getRouteBars(songId)
  if (songId === 'castle-in-the-sky') {
    const selected = getCastleBars(stage, simplified)
    return selected.map((bar) => Math.max(0, route.indexOf(bar)))
  }
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
  if (songId === 'castle-in-the-sky') return simplified ? getCastleBars(stage, true) : getCastleBars(stage, false)
  const route = getRouteBars(songId)
  const indexes = getTaskRouteIndexes(songId, stage, false)
  const bars = indexes.map((index) => route[index])
  return simplified ? bars.slice(0, 1) : bars
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
