import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { importer } from '@coderline/alphatab'
import { CHORDS, SONGS, STAGES, FINGERSTYLE_STAGES } from '../data/course'
import { CATEGORIES, COURSES, GUIDED_COURSES, SONG_COURSES, SKILLS } from '../data/catalog'
import { COURSE_SCORE_MANIFEST } from '../data/score-manifest'
import { getRouteBars, getTaskRouteIndexes, getTaskScoreBars, makeScorePages } from '../data/score-mapping'
import { currentGuidedLesson, currentTask, emptyProgress, getGuidedProgress, getSongProgress, isGuidedCourseCompleted, isSongCompleted, markSongRoute, recordFeedback, recordGuidedFeedback, startGuidedCourse, startSong, validateProgressBackup } from './progress'

const song = SONGS[0]

describe('歌曲专属课程内容', () => {
  it('七首歌均保留稳定的八阶段任务与可选参考来源', () => {
    for (const course of SONGS) {
      expect(course.tasks).toHaveLength(STAGES.length)
      expect(new Set(course.tasks.map((task) => task.title)).size).toBe(STAGES.length)
      expect(course.scoreUrl).toMatch(/^https:\/\//)
      for (const [index, task] of course.tasks.entries()) {
        expect(task.id).toBe(`${course.id}-stage-${task.stage}`)
        expect(task.stageName).toBe(course.kind === 'fingerstyle' ? FINGERSTYLE_STAGES[index] : STAGES[index])
        expect(task.focus.length).toBeGreaterThan(0)
        expect(task.steps.length).toBeGreaterThanOrEqual(2)
        expect(task.simplifiedSteps.length).toBeGreaterThan(0)
        expect(task.tempoSteps[0]).toBe(task.bpm)
        expect(task.tempoSteps[0]).toBeLessThanOrEqual(task.tempoSteps[1])
        expect(task.tempoSteps[1]).toBeLessThanOrEqual(task.tempoSteps[2])
        expect(`${task.steps.join(' ')} ${task.simplifiedSteps.join(' ')}`).not.toMatch(/(?:请|自己).{0,8}(?:标出|圈出|找出|挑出)|在参考谱.{0,10}(?:标出|圈出|找出|挑出)/)
      }
    }
  })

  it('歌曲和弦与已确认来源的课程备注保持分离', () => {
    const anheqiao = SONGS.find((course) => course.id === 'anheqiao')!
    expect(anheqiao.key).toContain('G 调')
    expect(anheqiao.timeSignature).toBe('4/4')
    expect(anheqiao.bpm).toBe(65)
    expect(anheqiao.chords).toEqual(['C', 'D', 'Em', 'G'])
    expect(anheqiao.tasks[0].scoreCue).toContain('拾艺教学编配')
    expect(anheqiao.tasks.every((task) => task.scoreCue.includes('不需要打开'))).toBe(true)
    const chengdu = SONGS.find((course) => course.id === 'chengdu')!
    expect(chengdu.timeSignature).toBe('6/8')
    expect(chengdu.bpm).toBe(91)
    expect(chengdu.chords).toEqual(['C', 'G', 'Em', 'Am', 'F', 'Dm'])
    expect(chengdu.courseNote).toContain('女声夹 0 品、男声夹 2 品')
    expect(chengdu.courseNote).toContain('不是原谱伴奏型')
    expect(CHORDS.C.frets).toEqual([0, 0, 0, 3])
  })

  it('七首数字谱均可由 alphaTab 解析并包含四弦 TAB 与五线谱', () => {
    expect(Object.keys(COURSE_SCORE_MANIFEST)).toHaveLength(7)
    for (const course of SONGS) {
      const manifest = COURSE_SCORE_MANIFEST[course.id as keyof typeof COURSE_SCORE_MANIFEST]
      const scorePath = resolve(process.cwd(), 'public', manifest.file.replace(/^\//, ''))
      const score = importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(readFileSync(scorePath)))
      expect(score.tracks).toHaveLength(1)
      expect(score.tracks[0].staves).toHaveLength(2)
      expect(score.masterBars).toHaveLength(manifest.barCount)
      expect(score.tracks[0].staves[1].bars).toHaveLength(manifest.barCount)
      expect(score.tracks[0].staves[1].tuning).toEqual([67, 60, 64, 69])
      const musicXml = readFileSync(scorePath, 'utf8')
      expect(musicXml).toContain('<staff-lines>5</staff-lines>')
      expect(musicXml).toContain('<staff-lines>4</staff-lines>')
      expect(musicXml).toContain('<staff-tuning')
      expect(musicXml).toContain('<string>')
      expect(musicXml).toContain('<fret>')
      const tabNotes = score.tracks[0].staves[1].bars.flatMap((bar) => bar.voices.flatMap((voice) => voice.beats.flatMap((beat) => beat.notes)))
      expect(tabNotes.length).toBeGreaterThan(0)
      expect(tabNotes.every((note) => note.fret >= 0 && note.string >= 1 && note.string <= 4)).toBe(true)
    }
  })

  it('56 个任务映射到有效小节，简化范围均短于正常范围，完整路线保留重复段落', () => {
    let mappedTasks = 0
    for (const course of SONGS) {
      const manifest = COURSE_SCORE_MANIFEST[course.id as keyof typeof COURSE_SCORE_MANIFEST]
      const route = getRouteBars(course.id)
      expect(route.length).toBe(manifest.playOrder.length)
      expect(route.every((bar) => bar >= 1 && bar <= manifest.barCount)).toBe(true)
      for (const task of course.tasks) {
        const normal = getTaskScoreBars(course.id, task.stage, false)
        const simplified = getTaskScoreBars(course.id, task.stage, true)
        const routeIndexes = getTaskRouteIndexes(course.id, task.stage, true)
        expect(normal.length).toBeGreaterThan(0)
        expect(simplified.length).toBeGreaterThan(0)
        expect(simplified.length).toBeLessThan(normal.length)
        expect(normal.every((bar) => bar >= 1 && bar <= manifest.barCount)).toBe(true)
        expect(routeIndexes.every((index) => index >= 0 && index < route.length)).toBe(true)
        mappedTasks += 1
      }
      expect(getTaskScoreBars(course.id, 8, false)).toEqual(route)
      expect(makeScorePages(route, 1, true).flatMap((page) => page.routeIndexes)).toEqual(route.map((_, index) => index))
      expect(makeScorePages(route, 2, true).every((page) => page.bars.length <= 2)).toBe(true)
    }
    expect(mappedTasks).toBe(56)
    expect(getRouteBars('always-with-me').length).toBeGreaterThan(COURSE_SCORE_MANIFEST['always-with-me'].barCount)
    expect(COURSE_SCORE_MANIFEST['castle-in-the-sky'].barCount).toBe(24)
  })

  it('天空之城详情完整谱覆盖 24 小节，最后一步的简化范围和文字一致', () => {
    const sky = SONGS.find((course) => course.id === 'castle-in-the-sky')!
    expect(getTaskScoreBars(sky.id, 8, false)).toEqual(Array.from({ length: 24 }, (_, index) => index + 1))
    expect(getTaskScoreBars(sky.id, 8, true)).toEqual([1, 2])
    expect(sky.courseNote).toContain('完整曲目 TAB 已放在本详情页')
    expect(sky.tasks[0].scoreCue).toContain('每页 1–2 小节')
    expect(sky.tasks[0].simplifiedSteps.join(' ')).toContain('第 1 小节')
    expect(sky.tasks.slice(1).flatMap((task) => [task.scoreCue, ...task.steps, ...task.simplifiedSteps]).join(' ')).not.toMatch(/第一行|第二行|第三行|每行先|换行/)
    expect(sky.tasks[7].simplifiedSteps.join(' ')).toContain('第 1–2 小节')
    expect(sky.tasks[7].simplifiedSuccess).toContain('第 1–2 小节')
  })

  it('休止、延音和 6/8 拍时长都保存在可解析的 MusicXML 中', () => {
    for (const course of SONGS) {
      const manifest = COURSE_SCORE_MANIFEST[course.id as keyof typeof COURSE_SCORE_MANIFEST]
      const source = readFileSync(resolve(process.cwd(), 'public', manifest.file.replace(/^\//, '')), 'utf8')
      const score = importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(new TextEncoder().encode(source)))
      const tabBeats = score.tracks[0].staves[1].bars.flatMap((bar) => bar.voices.flatMap((voice) => voice.beats))
      expect(tabBeats.some((beat) => beat.isRest)).toBe(true)
      expect(tabBeats.some((beat) => beat.duration > 4)).toBe(true)
    }
    const castle = readFileSync(resolve(process.cwd(), 'public/scores/castle-in-the-sky.musicxml'), 'utf8')
    expect(castle).toContain('<tie type="start"/>')
    expect(castle).toContain('<tie type="stop"/>')
    const chengdu = importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(readFileSync(resolve(process.cwd(), 'public/scores/chengdu.musicxml'))))
    const fourFour = importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(readFileSync(resolve(process.cwd(), 'public/scores/anheqiao.musicxml'))))
    expect(chengdu.masterBars[0].calculateDuration()).toBeLessThan(fourFour.masterBars[0].calculateDuration())
  })
})

describe('学习进度规则', () => {
  it('顺利完成后解锁下一步', () => {
    const started = startSong(emptyProgress(), song)
    const next = recordFeedback(started, song, 'easy')
    const item = getSongProgress(next, song)

    expect(item.completedTaskIds).toEqual([song.tasks[0].id])
    expect(item.currentTaskId).toBe(song.tasks[1].id)
    expect(currentTask(song, item).id).toBe(song.tasks[1].id)
  })

  it('觉得困难时保留下一步，并将刚才内容安排为复习', () => {
    const started = startSong(emptyProgress(), song)
    const afterHard = recordFeedback(started, song, 'hard')
    const item = getSongProgress(afterHard, song)

    expect(item.completedTaskIds).toContain(song.tasks[0].id)
    expect(item.currentTaskId).toBe(song.tasks[1].id)
    expect(currentTask(song, item).id).toBe(song.tasks[0].id)

    const afterReview = recordFeedback(afterHard, song, 'easy')
    expect(getSongProgress(afterReview, song).reviewTaskId).toBeNull()
    expect(currentTask(song, getSongProgress(afterReview, song)).id).toBe(song.tasks[1].id)
  })

  it('还没掌握时保留当前任务并标记降级版本', () => {
    const started = startSong(emptyProgress(), song)
    const afterFeedback = recordFeedback(started, song, 'not_mastered')
    const item = getSongProgress(afterFeedback, song)

    expect(item.completedTaskIds).toHaveLength(0)
    expect(item.simplifiedTaskId).toBe(song.tasks[0].id)
    expect(currentTask(song, item).id).toBe(song.tasks[0].id)
  })

  it('分别保存演奏与弹唱确认', () => {
    const started = startSong(emptyProgress(), song)
    const playing = markSongRoute(started, song, 'playing')
    const both = markSongRoute(playing, song, 'singing')
    const item = getSongProgress(both, song)

    expect(item.completionChecks).toEqual(['playing', 'singing'])
    expect(isSongCompleted(song, item)).toBe(true)
  })

  it('指弹课程只需确认完整独奏即可计入五首目标', () => {
    const solo = SONGS.find((course) => course.kind === 'fingerstyle')!
    const progress = startSong(emptyProgress(), solo)
    expect(isSongCompleted(solo, getSongProgress(progress, solo))).toBe(false)
    const completed = markSongRoute(progress, solo, 'playing')
    expect(getSongProgress(completed, solo).completionChecks).toEqual(['playing'])
    expect(isSongCompleted(solo, getSongProgress(completed, solo))).toBe(true)
  })

  it('新品牌备份可校验，拒绝拾音旧备份和错误课程数据', () => {
    const data = startSong(emptyProgress(), song)
    expect(validateProgressBackup({ app: 'shiyi', version: 2, exportedAt: new Date().toISOString(), data })).toEqual(data)
    expect(validateProgressBackup({ app: 'other', data })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyin', version: 1, data })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyi', version: 2, data: { ...data, version: 9 } })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyi', version: 2, data: { ...data, courses: { anheqiao: { currentTaskId: 'bad' } } } })).toBeNull()
  })

  it('多门课程各自保存当前步骤和最近学习状态', () => {
    const otherSong = SONGS[1]
    const first = startSong(emptyProgress(), song)
    const second = startSong(recordFeedback(first, song, 'easy'), otherSong)
    expect(second.activeCourseId).toBe(otherSong.id)
    expect(getSongProgress(second, song).completedTaskIds).toEqual([song.tasks[0].id])
    expect(getSongProgress(second, otherSong).completedTaskIds).toEqual([])
    expect(getSongProgress(second, song).lastStudiedAt).not.toBe('')
  })
})

describe('技能目录与通用步骤课程', () => {
  it('现有歌曲归在音乐分类的尤克里里技能下', () => {
    expect(CATEGORIES.map((category) => category.id)).toContain('music')
    expect(SKILLS.find((skill) => skill.id === 'ukulele')?.categoryId).toBe('music')
    expect(SONG_COURSES).toHaveLength(7)
    expect(COURSES).toHaveLength(7)
    expect(SONG_COURSES.every((course) => course.skillId === 'ukulele' && course.categoryId === 'music')).toBe(true)
    expect(GUIDED_COURSES).toHaveLength(0)
  })

  it('通用课程步骤可独立记录、降级、复习和完成', () => {
    const course = {
      type: 'guided' as const,
      id: 'test-course',
      category: { id: 'test-category', title: '测试分类', description: '测试用。' },
      skill: { id: 'test-skill', categoryId: 'test-category', title: '测试技能', description: '测试用。' },
      title: '测试课程',
      description: '测试通用步骤。',
      lessons: [
        { id: 'test-01', title: '第一步', why: '原因。', steps: ['做第一件事。'], success: '完成第一件事。', simplifiedSteps: ['做更简单的事。'], simplifiedSuccess: '完成替代动作。' },
        { id: 'test-02', title: '第二步', why: '原因。', steps: ['做第二件事。'], success: '完成第二件事。', simplifiedSteps: ['做更简单的事。'], simplifiedSuccess: '完成替代动作。' },
      ],
    }
    const started = startGuidedCourse(emptyProgress(), course)
    expect(currentGuidedLesson(course, getGuidedProgress(started, course)).id).toBe('test-01')
    const simplified = recordGuidedFeedback(started, course, 'not_mastered')
    expect(getGuidedProgress(simplified, course).simplifiedTaskId).toBe('test-01')
    const afterHard = recordGuidedFeedback(started, course, 'hard')
    expect(getGuidedProgress(afterHard, course).reviewTaskId).toBe('test-01')
    const afterReview = recordGuidedFeedback(afterHard, course, 'easy')
    const afterSecond = recordGuidedFeedback(afterReview, course, 'easy')
    expect(isGuidedCourseCompleted(course, getGuidedProgress(afterSecond, course))).toBe(true)
    expect(afterSecond.activeCourseId).toBe('test-course')
    expect(afterSecond.courses['test-course'].completedTaskIds).toEqual(['test-01', 'test-02'])
    expect(afterSecond.courses.anheqiao).toBeUndefined()
  })
})
