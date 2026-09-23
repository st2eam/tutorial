import { SONGS, type Song } from './course'

export type CatalogCategory = { id: string; title: string; description: string }
export type CatalogSkill = { id: string; categoryId: string; title: string; description: string }
export type GuidedLesson = {
  id: string
  title: string
  why: string
  steps: string[]
  success: string
  simplifiedSteps: string[]
  simplifiedSuccess: string
}
export type GuidedCourse = {
  type: 'guided'
  id: string
  category: CatalogCategory
  skill: CatalogSkill
  title: string
  description: string
  lessons: GuidedLesson[]
}
export type CatalogCourse = {
  type: 'ukulele-song'
  id: string
  categoryId: string
  skillId: string
  title: string
  description: string
  song: Song
}
export type LearningCourse = CatalogCourse | GuidedCourse

const guidedModules = import.meta.glob<{ default: GuidedCourse }>('./guided-courses/*.ts', {
  eager: true,
})
export const GUIDED_COURSES = Object.values(guidedModules).map((module) => module.default)

export const CATEGORIES: CatalogCategory[] = [
  { id: 'music', title: '音乐', description: '从一件乐器、一段旋律开始练习。' },
  ...GUIDED_COURSES.map((course) => course.category).filter((category, index, all) => all.findIndex((item) => item.id === category.id) === index),
]

export const SKILLS: CatalogSkill[] = [
  { id: 'ukulele', categoryId: 'music', title: '尤克里里', description: '弹唱与指弹，从慢速和分段开始。' },
  ...GUIDED_COURSES.map((course) => course.skill).filter((skill, index, all) => all.findIndex((item) => item.id === skill.id) === index),
]

export const SONG_COURSES: CatalogCourse[] = SONGS.map((song) => ({
  type: 'ukulele-song',
  id: song.id,
  categoryId: 'music',
  skillId: 'ukulele',
  title: song.title,
  description: song.intro,
  song,
}))

export const COURSES: LearningCourse[] = [...SONG_COURSES, ...GUIDED_COURSES]

export function findGuidedCourse(courseId: string | null | undefined) {
  return GUIDED_COURSES.find((course) => course.id === courseId)
}

export function findSkill(skillId: string | null | undefined) {
  return SKILLS.find((skill) => skill.id === skillId)
}
