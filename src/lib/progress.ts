import { GUIDED_COURSES, type GuidedCourse, type GuidedLesson } from '../data/catalog'
import { SONGS, type LessonTask, type Song } from '../data/course'

export type TaskFeedback = 'easy' | 'hard' | 'not_mastered'
export type HistoryEntry = {
  id: string
  courseId: string
  taskId: string
  taskTitle: string
  feedback: TaskFeedback
  at: string
}
export type CourseProgress = {
  currentTaskId: string
  completedTaskIds: string[]
  reviewTaskId: string | null
  simplifiedTaskId: string | null
  completionChecks: string[]
  lastFeedback: TaskFeedback | null
  lastStudiedAt: string
  scoreRevision?: string
}
export type UserProgress = {
  version: 2
  activeCourseId: string | null
  courses: Record<string, CourseProgress>
  history: HistoryEntry[]
}
export type ProgressBackup = { app: 'shiyi'; version: 2; exportedAt: string; data: UserProgress }

export const STORAGE_KEY = 'shiyi-learning-progress-v1'
export const LEGACY_STORAGE_KEY = 'shiyin-progress-v1'
export const CASTLE_SCORE_REVISION = 'castle-high-g-45-bars-v1'
export const emptyProgress = (): UserProgress => ({ version: 2, activeCourseId: null, courses: {}, history: [] })

export function loadProgress(): UserProgress {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed: unknown = JSON.parse(raw)
    return validateProgress(parsed) ? migrateCastleScore(parsed.data) : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(data: UserProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ data })) } catch { /* storage can be disabled or full */ }
}

export function getCourseProgress(data: UserProgress, courseId: string, firstTaskId: string): CourseProgress {
  return data.courses[courseId] ?? {
    currentTaskId: firstTaskId,
    completedTaskIds: [],
    reviewTaskId: null,
    simplifiedTaskId: null,
    completionChecks: [],
    lastFeedback: null,
    lastStudiedAt: '',
    ...(courseId === 'castle-in-the-sky' ? { scoreRevision: CASTLE_SCORE_REVISION } : {}),
  }
}

export function getSongProgress(data: UserProgress, song: Song): CourseProgress {
  return getCourseProgress(data, song.id, song.tasks[0].id)
}

export function getGuidedProgress(data: UserProgress, course: GuidedCourse): CourseProgress {
  return getCourseProgress(data, course.id, course.lessons[0].id)
}

export function isSongCompleted(song: Song, item: CourseProgress): boolean {
  return song.kind === 'fingerstyle'
    ? item.completionChecks.includes('playing')
    : item.completionChecks.includes('playing') && item.completionChecks.includes('singing')
}

export function isGuidedCourseCompleted(course: GuidedCourse, item: CourseProgress): boolean {
  return course.lessons.every((lesson) => item.completedTaskIds.includes(lesson.id))
}

export function currentTask(song: Song, item: CourseProgress): LessonTask {
  return song.tasks.find((task) => task.id === item.reviewTaskId)
    ?? song.tasks.find((task) => task.id === item.currentTaskId)
    ?? song.tasks[song.tasks.length - 1]
}

export function currentGuidedLesson(course: GuidedCourse, item: CourseProgress): GuidedLesson {
  return course.lessons.find((lesson) => lesson.id === item.reviewTaskId)
    ?? course.lessons.find((lesson) => lesson.id === item.currentTaskId)
    ?? course.lessons[course.lessons.length - 1]
}

export function startSong(data: UserProgress, song: Song): UserProgress {
  return startCourse(data, song.id, song.tasks[0].id)
}

export function startGuidedCourse(data: UserProgress, course: GuidedCourse): UserProgress {
  return startCourse(data, course.id, course.lessons[0].id)
}

function startCourse(data: UserProgress, courseId: string, firstTaskId: string): UserProgress {
  const item = getCourseProgress(data, courseId, firstTaskId)
  return {
    ...data,
    activeCourseId: courseId,
    courses: { ...data.courses, [courseId]: { ...item, lastStudiedAt: new Date().toISOString() } },
  }
}

export function recordFeedback(data: UserProgress, song: Song, feedback: TaskFeedback): UserProgress {
  return recordCourseFeedback(data, song.id, song.tasks, feedback)
}

export function recordGuidedFeedback(data: UserProgress, course: GuidedCourse, feedback: TaskFeedback): UserProgress {
  return recordCourseFeedback(data, course.id, course.lessons, feedback)
}

function recordCourseFeedback(
  data: UserProgress,
  courseId: string,
  tasks: Array<Pick<LessonTask | GuidedLesson, 'id' | 'title'>>,
  feedback: TaskFeedback,
): UserProgress {
  const item = getCourseProgress(data, courseId, tasks[0].id)
  const task = tasks.find((candidate) => candidate.id === item.reviewTaskId)
    ?? tasks.find((candidate) => candidate.id === item.currentTaskId)
    ?? tasks[tasks.length - 1]
  const taskIndex = tasks.findIndex((candidate) => candidate.id === task.id)
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
    currentTaskId = tasks[taskIndex + 1]?.id ?? task.id
    simplifiedTaskId = null
    if (feedback === 'hard') reviewTaskId = task.id
  }

  const at = new Date().toISOString()
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    courseId,
    taskId: task.id,
    taskTitle: task.title,
    feedback,
    at,
  }
  const nextItem: CourseProgress = { ...item, currentTaskId, completedTaskIds, reviewTaskId, simplifiedTaskId, lastFeedback: feedback, lastStudiedAt: at }

  return {
    ...data,
    activeCourseId: courseId,
    courses: { ...data.courses, [courseId]: nextItem },
    history: [entry, ...data.history].slice(0, 120),
  }
}

export function markSongRoute(data: UserProgress, song: Song, route: 'playing' | 'singing'): UserProgress {
  const item = getSongProgress(data, song)
  const checks = new Set(item.completionChecks)
  if (checks.has(route)) checks.delete(route)
  else checks.add(route)
  return {
    ...data,
    courses: { ...data.courses, [song.id]: { ...item, completionChecks: [...checks], lastStudiedAt: new Date().toISOString() } },
  }
}

export function exportBackup(data: UserProgress): ProgressBackup {
  return { app: 'shiyi', version: 2, exportedAt: new Date().toISOString(), data }
}

export function validateProgressBackup(value: unknown): UserProgress | null {
  if (!value || typeof value !== 'object') return null
  const backup = value as Partial<ProgressBackup>
  if (backup.app !== 'shiyi' || backup.version !== 2 || !validateProgress({ data: backup.data })) return null
  return backup.data ? migrateCastleScore(backup.data) : null
}

function migrateCastleScore(data: UserProgress): UserProgress {
  const previous = data.courses['castle-in-the-sky']
  if (!previous || previous.scoreRevision === CASTLE_SCORE_REVISION) return data
  const firstTaskId = SONGS.find((song) => song.id === 'castle-in-the-sky')?.tasks[0]?.id
  if (!firstTaskId) return data
  return {
    ...data,
    courses: {
      ...data.courses,
      'castle-in-the-sky': {
        currentTaskId: firstTaskId,
        completedTaskIds: [],
        reviewTaskId: null,
        simplifiedTaskId: null,
        completionChecks: [],
        lastFeedback: null,
        lastStudiedAt: '',
        scoreRevision: CASTLE_SCORE_REVISION,
      },
    },
  }
}

function validateProgress(value: unknown): value is { data: UserProgress } {
  if (!value || typeof value !== 'object') return false
  const data = (value as { data?: Partial<UserProgress> }).data
  const validCourseIds = new Set([...SONGS.map((song) => song.id), ...GUIDED_COURSES.map((course) => course.id)])
  if (!data || data.version !== 2 || !(data.activeCourseId === null || (typeof data.activeCourseId === 'string' && validCourseIds.has(data.activeCourseId))) || !data.courses || typeof data.courses !== 'object' || !Array.isArray(data.history)) return false

  for (const [courseId, rawItem] of Object.entries(data.courses)) {
    if (!validCourseIds.has(courseId) || !rawItem || typeof rawItem !== 'object') return false
    const item = rawItem as Partial<CourseProgress>
    const validTaskIds = getTaskIds(courseId)
    const validTaskId = (taskId: unknown) => typeof taskId === 'string' && validTaskIds.includes(taskId)
    if (!validTaskId(item.currentTaskId) || !Array.isArray(item.completedTaskIds) || !item.completedTaskIds.every(validTaskId)) return false
    if (!(item.reviewTaskId === null || validTaskId(item.reviewTaskId)) || !(item.simplifiedTaskId === null || validTaskId(item.simplifiedTaskId))) return false
    if (!Array.isArray(item.completionChecks) || !item.completionChecks.every((check) => typeof check === 'string')) return false
    if (!(item.lastFeedback === null || isFeedback(item.lastFeedback)) || typeof item.lastStudiedAt !== 'string') return false
    if (item.scoreRevision !== undefined && typeof item.scoreRevision !== 'string') return false
  }

  return data.history.every((rawEntry) => {
    if (!rawEntry || typeof rawEntry !== 'object') return false
    const entry = rawEntry as Partial<HistoryEntry>
    return typeof entry.id === 'string' && typeof entry.courseId === 'string' && validCourseIds.has(entry.courseId)
      && typeof entry.taskId === 'string' && getTaskIds(entry.courseId).includes(entry.taskId) && typeof entry.taskTitle === 'string'
      && typeof entry.at === 'string' && isFeedback(entry.feedback)
  })
}

function getTaskIds(courseId: string): string[] {
  const song = SONGS.find((candidate) => candidate.id === courseId)
  if (song) return song.tasks.map((task) => task.id)
  return GUIDED_COURSES.find((course) => course.id === courseId)?.lessons.map((lesson) => lesson.id) ?? []
}

function isFeedback(value: unknown): value is TaskFeedback {
  return value === 'easy' || value === 'hard' || value === 'not_mastered'
}
