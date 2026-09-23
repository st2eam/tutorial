import { SONGS, type LessonTask, type Song } from '../data/course'

export type TaskFeedback = 'easy' | 'hard' | 'not_mastered'
export type HistoryEntry = {
  id: string
  songId: string
  taskId: string
  taskTitle: string
  feedback: TaskFeedback
  at: string
}
export type SongProgress = {
  currentTaskId: string
  completedTaskIds: string[]
  reviewTaskId: string | null
  simplifiedTaskId: string | null
  confirmedPlaying: boolean
  confirmedSinging: boolean
  lastFeedback: TaskFeedback | null
}
export type UserProgress = {
  version: 1
  activeSongId: string | null
  songs: Record<string, SongProgress>
  history: HistoryEntry[]
}
export type ProgressBackup = { app: 'shiyin'; exportedAt: string; data: UserProgress }

export const STORAGE_KEY = 'shiyin-progress-v1'
export const emptyProgress = (): UserProgress => ({ version: 1, activeSongId: null, songs: {}, history: [] })

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed: unknown = JSON.parse(raw)
    return validateProgress(parsed) ? parsed.data : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(data: UserProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ data })) } catch { /* storage can be disabled or full */ }
}

export function getSongProgress(data: UserProgress, song: Song): SongProgress {
  return data.songs[song.id] ?? {
    currentTaskId: song.tasks[0].id,
    completedTaskIds: [],
    reviewTaskId: null,
    simplifiedTaskId: null,
    confirmedPlaying: false,
    confirmedSinging: false,
    lastFeedback: null,
  }
}

export function isSongCompleted(song: Song, item: SongProgress): boolean {
  return song.kind === 'fingerstyle' ? item.confirmedPlaying : item.confirmedPlaying && item.confirmedSinging
}

export function currentTask(song: Song, item: SongProgress): LessonTask {
  return song.tasks.find((task) => task.id === item.reviewTaskId)
    ?? song.tasks.find((task) => task.id === item.currentTaskId)
    ?? song.tasks[song.tasks.length - 1]
}

export function startSong(data: UserProgress, song: Song): UserProgress {
  return {
    ...data,
    activeSongId: song.id,
    songs: { ...data.songs, [song.id]: getSongProgress(data, song) },
  }
}

export function recordFeedback(data: UserProgress, song: Song, feedback: TaskFeedback): UserProgress {
  const item = getSongProgress(data, song)
  const task = currentTask(song, item)
  const isReview = item.reviewTaskId === task.id
  let completedTaskIds = item.completedTaskIds
  let currentTaskId = item.currentTaskId
  let reviewTaskId = item.reviewTaskId
  let simplifiedTaskId = item.simplifiedTaskId

  if (feedback === 'not_mastered') {
    simplifiedTaskId = task.id
    reviewTaskId = null
  } else if (isReview) {
    reviewTaskId = null
    simplifiedTaskId = null
  } else {
    if (!completedTaskIds.includes(task.id)) completedTaskIds = [...completedTaskIds, task.id]
    const next = song.tasks[task.stage]
    if (next) currentTaskId = next.id
    simplifiedTaskId = null
    if (feedback === 'hard') reviewTaskId = task.id
  }

  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    songId: song.id,
    taskId: task.id,
    taskTitle: task.title,
    feedback,
    at: new Date().toISOString(),
  }

  return {
    ...data,
    activeSongId: song.id,
    songs: { ...data.songs, [song.id]: { ...item, currentTaskId, completedTaskIds, reviewTaskId, simplifiedTaskId, lastFeedback: feedback } },
    history: [entry, ...data.history].slice(0, 120),
  }
}

export function markSongRoute(data: UserProgress, song: Song, route: 'playing' | 'singing'): UserProgress {
  const item = getSongProgress(data, song)
  const update = route === 'playing' ? { confirmedPlaying: !item.confirmedPlaying } : { confirmedSinging: !item.confirmedSinging }
  return { ...data, songs: { ...data.songs, [song.id]: { ...item, ...update } } }
}

export function exportBackup(data: UserProgress): ProgressBackup {
  return { app: 'shiyin', exportedAt: new Date().toISOString(), data }
}

export function validateProgressBackup(value: unknown): UserProgress | null {
  if (!value || typeof value !== 'object') return null
  const backup = value as Partial<ProgressBackup>
  if (backup.app !== 'shiyin' || !validateProgress({ data: backup.data })) return null
  return backup.data ?? null
}

function validateProgress(value: unknown): value is { data: UserProgress } {
  if (!value || typeof value !== 'object') return false
  const data = (value as { data?: Partial<UserProgress> }).data
  if (!data || data.version !== 1 || !(data.activeSongId === null || SONGS.some((song) => song.id === data.activeSongId)) || !data.songs || typeof data.songs !== 'object' || !Array.isArray(data.history)) return false

  for (const [songId, rawItem] of Object.entries(data.songs)) {
    const song = SONGS.find((candidate) => candidate.id === songId)
    if (!song || !rawItem || typeof rawItem !== 'object') return false
    const item = rawItem as Partial<SongProgress>
    const validTaskId = (taskId: unknown) => typeof taskId === 'string' && song.tasks.some((task) => task.id === taskId)
    if (!validTaskId(item.currentTaskId) || !Array.isArray(item.completedTaskIds) || !item.completedTaskIds.every(validTaskId)) return false
    if (!(item.reviewTaskId === null || validTaskId(item.reviewTaskId)) || !(item.simplifiedTaskId === null || validTaskId(item.simplifiedTaskId))) return false
    if (typeof item.confirmedPlaying !== 'boolean' || typeof item.confirmedSinging !== 'boolean') return false
    if (!(item.lastFeedback === null || isFeedback(item.lastFeedback))) return false
  }

  return data.history.every((rawEntry) => {
    if (!rawEntry || typeof rawEntry !== 'object') return false
    const entry = rawEntry as Partial<HistoryEntry>
    const song = SONGS.find((candidate) => candidate.id === entry.songId)
    return typeof entry.id === 'string' && Boolean(song?.tasks.some((task) => task.id === entry.taskId)) && typeof entry.taskTitle === 'string' && typeof entry.at === 'string' && isFeedback(entry.feedback)
  })
}

function isFeedback(value: unknown): value is TaskFeedback {
  return value === 'easy' || value === 'hard' || value === 'not_mastered'
}
