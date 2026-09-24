import { describe, expect, it } from 'vitest'
import { CASTLE_SCORE_ROWS, CHORDS, getCastleScoreRows, SONGS, STAGES, FINGERSTYLE_STAGES } from '../data/course'
import { CATEGORIES, COURSES, GUIDED_COURSES, SONG_COURSES, SKILLS } from '../data/catalog'
import { getPlaybackNotes, getSimplifiedMeasureIds, getTaskMeasureIds, SCORE_SHEETS, validateScoreSheet } from '../data/score-sheets'
import { CASTLE_SCORE, CASTLE_SCORE_MEASURE_COUNT, CASTLE_SCORE_SOURCE, CASTLE_SCORE_SYSTEMS, validateCastleScore } from '../data/castle-score'
import { currentGuidedLesson, currentTask, emptyProgress, getGuidedProgress, getSongProgress, isGuidedCourseCompleted, isSongCompleted, markSongRoute, recordFeedback, recordGuidedFeedback, startGuidedCourse, startSong, validateProgressBackup } from './progress'

const song = SONGS[0]

describe('歌曲专属课程内容', () => {
  it('安和桥保留参考曲资料，同时每日练习直接使用站内谱卡', () => {
    const anheqiao = SONGS.find((course) => course.id === 'anheqiao')!
    expect(anheqiao.key).toContain('G 调')
    expect(anheqiao.timeSignature).toBe('4/4')
    expect(anheqiao.bpm).toBe(65)
    expect(anheqiao.chords).toEqual(['C', 'D', 'Em', 'G'])
    expect(anheqiao.tasks[1].chords).toEqual(['C', 'D', 'Em', 'G'])
    expect(anheqiao.tasks[0].scoreCue).toContain('拾艺教学编配')
    expect(anheqiao.tasks.every((task) => task.scoreCue.includes('不需要打开'))).toBe(true)
  })

  it('每首歌都有完整八阶段且每一步含谱面焦点、降级练习和速度阶梯', () => {
    for (const course of SONGS) {
      expect(course.tasks).toHaveLength(STAGES.length)
      expect(new Set(course.tasks.map((task) => task.title)).size).toBe(STAGES.length)

      for (const [index, task] of course.tasks.entries()) {
        expect(task.stageName).toBe(course.kind === 'fingerstyle' ? FINGERSTYLE_STAGES[index] : STAGES[index])
        expect(task.focus.length).toBeGreaterThan(0)
        expect(task.scoreCue.length).toBeGreaterThan(0)
        expect(task.steps.length).toBeGreaterThanOrEqual(2)
        expect(task.simplifiedSteps.length).toBeGreaterThan(0)
        expect(task.tempoSteps[0]).toBe(task.bpm)
        expect(task.tempoSteps[2]).toBe(course.id === 'chengdu' ? 61 : course.bpm)
        expect(task.tempoSteps[0]).toBeLessThanOrEqual(task.tempoSteps[1])
        expect(task.tempoSteps[1]).toBeLessThanOrEqual(task.tempoSteps[2])
        if (course.kind === 'fingerstyle') {
          expect(task.steps.join(' ')).toContain('谱')
        } else expect(task.scoreCue).toContain('四线谱')
        expect(`${task.steps.join(' ')} ${task.simplifiedSteps.join(' ')}`).not.toMatch(/(?:请|自己).{0,8}(?:标出|圈出|找出|挑出)|在参考谱.{0,10}(?:标出|圈出|找出|挑出)/)
      }
    }
  })

  it('每首歌都有带重复指向的路线图和网易云官方入口', () => {
    for (const course of SONGS) {
      expect(course.route.length).toBeGreaterThan(4)
      for (const stop of course.route) {
        if (stop.repeatTo) expect(course.route.some((target) => target.label === stop.repeatTo)).toBe(true)
      }
      if (course.kind === 'singalong') {
        expect(course.neteaseTrackId).toBeGreaterThan(0)
        expect(course.sourceUrl).toContain(`/song?id=${course.neteaseTrackId}`)
      } else expect(course.scoreUrl).toMatch(/^https:\/\//)
    }
    expect(SONGS.some((course) => course.route.some((stop) => stop.repeatTo))).toBe(true)
  })

  it('和弦手指说明与按弦数据一致', () => {
    expect(CHORDS.C.frets).toEqual([0, 0, 0, 3])
    expect(CHORDS.C.fingers).toEqual([0, 0, 0, 3])
    expect(CHORDS.C.hint).toContain('A 弦第 3 品')
    expect(CHORDS.Bm.hint).toContain('C、E、A 弦')
    expect(CHORDS.G.hint).toContain('无名指按 E 弦第 3 品')
    for (const chord of SONGS[2].chords) expect(CHORDS[chord]).toBeDefined()
  })

  it('成都按 6/8 编配，南山南列出所选谱中的特色和弦', () => {
    expect(SONGS[1].timeSignature).toBe('6/8')
    expect(SONGS[2].chords).toContain('Fmaj7')
    expect(SONGS[2].chords).toContain('Cadd9')
  })

  it('成都课程的练习谱卡直接呈现，六拍练习不要求离站找谱', () => {
    const chengdu = SONGS.find((course) => course.id === 'chengdu')!
    expect(chengdu.key).toContain('原调 D')
    expect(chengdu.bpm).toBe(91)
    expect(chengdu.chords).toEqual(['C', 'G', 'Em', 'Am', 'F', 'Dm'])
    expect(chengdu.courseNote).toContain('女声夹 0 品、男声夹 2 品')
    expect(chengdu.courseNote).toContain('不是原谱伴奏型')
    expect(chengdu.tasks[3].scoreCue).toContain('箭头显示扫弦方向')
    expect(SCORE_SHEETS.chengdu.tempoUnit).toBe('dotted-quarter')
    expect(chengdu.tasks[2].steps.join(' ')).not.toMatch(/找出|挑出/)
    expect(chengdu.tasks[4].steps.join(' ')).not.toMatch(/圈出|找出/)
  })

  it('三首弹唱与四首指弹均有八步专属课程', () => {
    expect(SONGS.filter((course) => course.kind === 'singalong')).toHaveLength(3)
    expect(SONGS.filter((course) => course.kind === 'fingerstyle')).toHaveLength(4)
    for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex += 1) {
      expect(new Set(SONGS.map((course) => course.tasks[stageIndex].title)).size).toBe(SONGS.length)
    }
  })

  it('天空之城课程用自绘谱面完整呈现，并按八行小节号定位练习', () => {
    const solo = SONGS.find((course) => course.id === 'castle-in-the-sky')!
    expect(solo.key).toContain('High-G')
    expect(solo.bpm).toBe(92)
    expect(solo.timeSignature).toBe('4/4')
    expect(solo.route[solo.route.length - 1]?.label).toBe('全曲 1–24 小节')
    expect(solo.courseNote).toContain('小节号分别从 1、4、7、10、13、16、19、22 开始')
    expect(solo.tasks[0].scoreCue).toContain('1、4、7、10、13、16、19、22')
    expect(solo.tasks.every((task) => !task.tab)).toBe(true)
    expect(solo.tasks[1].id).toBe('castle-in-the-sky-stage-2')
    expect(solo.tasks[6].id).toBe('castle-in-the-sky-stage-7')
    expect(solo.tasks[7].title).toContain('完整独奏')
    expect(solo.tasks[7].scoreCue).toContain('1、4、7、10、13、16、19、22')
    expect(getCastleScoreRows(2)).toEqual([{ row: 1, firstBar: 1, lastBar: 3 }])
    expect(CASTLE_SCORE_ROWS.map((row) => [row.row, row.firstBar, row.lastBar])).toEqual([
      [1, 1, 3], [2, 4, 6], [3, 7, 9], [4, 10, 12], [5, 13, 15], [6, 16, 18], [7, 19, 21], [8, 22, 24],
    ])
    expect(getCastleScoreRows(3)).toEqual([{ row: 1, firstBar: 1, lastBar: 1 }])
    expect(getCastleScoreRows(4)).toEqual([{ row: 2, firstBar: 4, lastBar: 6 }])
    expect(getCastleScoreRows(5)).toEqual([{ row: 3, firstBar: 7, lastBar: 9 }])
    expect(getCastleScoreRows(6).map(({ firstBar, lastBar }) => [firstBar, lastBar])).toEqual([[10, 12], [13, 15], [16, 18]])
    expect(getCastleScoreRows(8)).toEqual(CASTLE_SCORE_ROWS)
    expect(getCastleScoreRows(4, true)).toEqual([{ row: 2, firstBar: 4, lastBar: 4 }])
    expect(getCastleScoreRows(5, true)).toEqual([{ row: 3, firstBar: 7, lastBar: 7 }])
    expect(getCastleScoreRows(6, true)).toEqual([{ row: 4, firstBar: 10, lastBar: 12 }])
    expect(getCastleScoreRows(7, true)).toEqual(CASTLE_SCORE_ROWS.slice(0, 3))
    expect(SCORE_SHEETS[solo.id]).toBeUndefined()
    expect(CASTLE_SCORE_MEASURE_COUNT).toBe(24)
    expect(CASTLE_SCORE.map(({ number }) => number)).toEqual(Array.from({ length: 24 }, (_, index) => index + 1))
    expect(CASTLE_SCORE_SYSTEMS.map(({ firstBar, lastBar }) => [firstBar, lastBar])).toEqual([
      [1, 3], [4, 6], [7, 9], [10, 12], [13, 15], [16, 18], [19, 21], [22, 24],
    ])
    expect(validateCastleScore()).toEqual([])
    expect(CASTLE_SCORE[0].events.filter((event) => event.rest)).toHaveLength(3)
    expect(CASTLE_SCORE.some((bar) => bar.events.some((event) => event.arpeggio))).toBe(true)
    expect(CASTLE_SCORE.some((bar) => bar.events.some((event) => event.slurAfter))).toBe(true)
    expect(CASTLE_SCORE.every((bar) => bar.events.every((event) => event.notes.every((note) => note.fret >= 0)))).toBe(true)
    expect(CASTLE_SCORE_SOURCE.sourceUrl).toContain('ukuleleba.com/22389.html')
  })

  it('天空之城用独立 SVG 记谱数据，其余六份音乐谱卡仍映射到有效谱段', () => {
    expect(CASTLE_SCORE).toHaveLength(24)
    expect(CASTLE_SCORE.flatMap((bar) => bar.events).some((event) => event.rest)).toBe(true)
    expect(Object.keys(SCORE_SHEETS)).toHaveLength(6)
    for (const course of SONGS) {
      expect(course.tasks).toHaveLength(8)
      for (const task of course.tasks) expect(task.id).toBe(`${course.id}-stage-${task.stage}`)
      if (course.id === 'castle-in-the-sky') {
        expect(SCORE_SHEETS[course.id]).toBeUndefined()
        for (const task of course.tasks) {
          expect(task.scoreCue).toMatch(/网页内|参考谱|原谱/)
          expect(getCastleScoreRows(task.stage).length).toBeGreaterThan(0)
        }
        continue
      }
      const sheet = SCORE_SHEETS[course.id]
      expect(sheet).toBeDefined()
      expect(validateScoreSheet(sheet)).toEqual([])
      expect(sheet.playOrder.length).toBeGreaterThan(8)
      expect(sheet.playOrder.every((id) => sheet.measures[id]?.notes.length)).toBe(true)
      for (const measure of Object.values(sheet.measures)) {
        expect(CHORDS[measure.chord]).toBeDefined()
        for (const note of measure.notes.filter((item) => item.voice === 'harmony')) {
          const chordStringIndex = ['G', 'C', 'E', 'A'].indexOf(note.string)
          expect(note.fret).toBe(CHORDS[measure.chord].frets[chordStringIndex])
        }
      }
      for (const task of course.tasks) {
        expect(getTaskMeasureIds(sheet, task.stage).length).toBeGreaterThan(0)
        expect(getTaskMeasureIds(sheet, task.stage).every((id) => Boolean(sheet.measures[id]))).toBe(true)
        expect(getSimplifiedMeasureIds(sheet, task.stage)).toHaveLength(1)
        expect(task.scoreCue).toContain('拾艺教学编配')
        expect(task.scoreCue).not.toMatch(/打开参考曲谱|打开外部曲谱/)
      }
      expect(getTaskMeasureIds(sheet, 8)).toEqual(sheet.playOrder)
    }
  })

  it('六份教学谱以明确拍点记录休止与时值，试听合并延音且不在休止处起音', () => {
    for (const sheet of Object.values(SCORE_SHEETS)) {
      const introId = sheet.parts.find((part) => part.id === 'intro')!.measures[0]
      const intro = sheet.measures[introId]
      const barTicks = sheet.timeSignature === '6/8' ? 12 : 16
      expect(intro.rests.length).toBeGreaterThan(0)
      expect(intro.notes.some((note) => note.voice === 'melody' && note.duration > (sheet.timeSignature === '6/8' ? 2 : 4))).toBe(true)
      expect([...intro.notes, ...intro.rests].every((event) => Number.isInteger(event.tick) && Number.isInteger(event.duration) && event.tick >= 0 && event.tick + event.duration <= barTicks)).toBe(true)
    }

    const tiedSheet = structuredClone(SCORE_SHEETS['always-with-me'])
    const introId = tiedSheet.parts.find((part) => part.id === 'intro')!.measures[0]
    const intro = tiedSheet.measures[introId]
    intro.notes[0].tieToNext = true
    intro.notes[1].string = intro.notes[0].string
    intro.notes[1].fret = intro.notes[0].fret
    const playback = getPlaybackNotes(tiedSheet, [introId])
    expect(playback.find((note) => note.voice === 'melody')).toMatchObject({ tick: 0, duration: 6 })
    expect(playback.some((note) => note.voice === 'melody' && note.tick === 4)).toBe(false)
    expect(playback.some((note) => note.voice === 'melody' && note.tick === intro.rests[0].tick)).toBe(false)
    expect(validateScoreSheet(tiedSheet)).toEqual([])

    intro.rests[0].duration = 20
    expect(validateScoreSheet(tiedSheet).some((issue) => issue.includes('休止时值超出小节'))).toBe(true)
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
