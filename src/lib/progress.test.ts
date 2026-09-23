import { describe, expect, it } from 'vitest'
import { CHORDS, SONGS, STAGES, FINGERSTYLE_STAGES } from '../data/course'
import { getSimplifiedMeasureIds, getTaskMeasureIds, SCORE_SHEETS, validateScoreSheet } from '../data/score-sheets'
import { currentTask, emptyProgress, getSongProgress, isSongCompleted, markSongRoute, recordFeedback, startSong, validateProgressBackup } from './progress'

const song = SONGS[0]

describe('歌曲专属课程内容', () => {
  it('安和桥保留参考曲资料，同时每日练习直接使用站内谱卡', () => {
    const anheqiao = SONGS.find((course) => course.id === 'anheqiao')!
    expect(anheqiao.key).toContain('G 调')
    expect(anheqiao.timeSignature).toBe('4/4')
    expect(anheqiao.bpm).toBe(65)
    expect(anheqiao.chords).toEqual(['C', 'D', 'Em', 'G'])
    expect(anheqiao.tasks[1].chords).toEqual(['C', 'D', 'Em', 'G'])
    expect(anheqiao.tasks[0].scoreCue).toContain('拾音教学编配')
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

  it('天空之城课程有站内绘制的谱卡，并且保留八阶段 ID', () => {
    const solo = SONGS.find((course) => course.id === 'castle-in-the-sky')!
    expect(solo.key).toContain('High-G')
    expect(solo.bpm).toBe(92)
    expect(solo.timeSignature).toBe('4/4')
    expect(solo.route[solo.route.length - 1]?.label).toBe('全曲 1–24 小节')
    expect(solo.courseNote).toContain('编号从 1 到 24')
    expect(solo.tasks[0].scoreCue).toContain('拾音教学编配')
    expect(solo.tasks.every((task) => !task.tab)).toBe(true)
    expect(solo.tasks[1].id).toBe('castle-in-the-sky-stage-2')
    expect(solo.tasks[6].id).toBe('castle-in-the-sky-stage-7')
    expect(solo.tasks[7].title).toContain('完整独奏')
    expect(solo.tasks[7].scoreCue).toContain('不需要打开')
    expect(SCORE_SHEETS[solo.id].playOrder).toHaveLength(24)
  })

  it('七份谱面均可按演奏顺序走完，56 个任务都有有效谱段', () => {
    expect(Object.keys(SCORE_SHEETS)).toHaveLength(7)
    for (const course of SONGS) {
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
      expect(course.tasks).toHaveLength(8)
      for (const task of course.tasks) {
        expect(getTaskMeasureIds(sheet, task.stage).length).toBeGreaterThan(0)
        expect(getTaskMeasureIds(sheet, task.stage).every((id) => Boolean(sheet.measures[id]))).toBe(true)
        expect(getSimplifiedMeasureIds(sheet, task.stage)).toHaveLength(1)
        expect(task.id).toBe(`${course.id}-stage-${task.stage}`)
        expect(task.scoreCue).toContain('拾音教学编配')
        expect(task.scoreCue).not.toMatch(/打开参考曲谱|打开外部曲谱/)
      }
      expect(getTaskMeasureIds(sheet, 8)).toEqual(sheet.playOrder)
    }
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

    expect(item.confirmedPlaying).toBe(true)
    expect(item.confirmedSinging).toBe(true)
    expect(isSongCompleted(song, item)).toBe(true)
  })

  it('指弹课程只需确认完整独奏即可计入五首目标', () => {
    const solo = SONGS.find((course) => course.kind === 'fingerstyle')!
    const progress = startSong(emptyProgress(), solo)
    expect(isSongCompleted(solo, getSongProgress(progress, solo))).toBe(false)
    const completed = markSongRoute(progress, solo, 'playing')
    expect(getSongProgress(completed, solo).confirmedSinging).toBe(false)
    expect(isSongCompleted(solo, getSongProgress(completed, solo))).toBe(true)
  })

  it('只接受拾音 v1 格式的备份', () => {
    const data = startSong(emptyProgress(), song)
    expect(validateProgressBackup({ app: 'shiyin', exportedAt: new Date().toISOString(), data })).toEqual(data)
    expect(validateProgressBackup({ app: 'other', data })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyin', data: { ...data, version: 9 } })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyin', data: { ...data, songs: { anheqiao: { currentTaskId: 'bad' } } } })).toBeNull()
  })
})
