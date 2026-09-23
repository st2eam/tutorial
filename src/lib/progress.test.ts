import { describe, expect, it } from 'vitest'
import { CHORDS, SONGS, STAGES } from '../data/course'
import { currentTask, emptyProgress, getSongProgress, markSongRoute, recordFeedback, startSong, validateProgressBackup } from './progress'

const song = SONGS[0]

describe('歌曲专属课程内容', () => {
  it('每首歌都有完整八阶段且每一步含谱面焦点、降级练习和速度阶梯', () => {
    for (const course of SONGS) {
      expect(course.tasks).toHaveLength(STAGES.length)
      expect(new Set(course.tasks.map((task) => task.title)).size).toBe(STAGES.length)

      for (const [index, task] of course.tasks.entries()) {
        expect(task.stageName).toBe(STAGES[index])
        expect(task.focus.length).toBeGreaterThan(0)
        expect(task.scoreCue.length).toBeGreaterThan(0)
        expect(task.steps.length).toBeGreaterThanOrEqual(2)
        expect(task.simplifiedSteps.length).toBeGreaterThan(0)
        expect(task.tempoSteps[0]).toBe(task.bpm)
        expect(task.tempoSteps[2]).toBe(course.bpm)
        expect(task.tempoSteps[0]).toBeLessThanOrEqual(task.tempoSteps[1])
        expect(task.tempoSteps[1]).toBeLessThanOrEqual(task.tempoSteps[2])
        expect(task.scoreGuide.bars).toHaveLength(2)
        const expectedPulses = course.timeSignature === '6/8' ? 6 : 4
        expect(task.scoreGuide.bars.every((bar) => bar.beats.length === expectedPulses)).toBe(true)
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
      expect(course.neteaseTrackId).toBeGreaterThan(0)
      expect(course.sourceUrl).toContain(`/song?id=${course.neteaseTrackId}`)
    }
    expect(SONGS.some((course) => course.route.some((stop) => stop.repeatTo))).toBe(true)
  })

  it('和弦手指说明与按弦数据一致', () => {
    expect(CHORDS.Bm.hint).toContain('C、E、A 弦')
    expect(CHORDS.G.hint).toContain('无名指按 E 弦第 3 品')
    for (const chord of SONGS[2].chords) expect(CHORDS[chord]).toBeDefined()
  })

  it('成都示范小节按 6/8 拍显示，南山南列出所选谱中的特色和弦', () => {
    expect(SONGS[1].timeSignature).toBe('6/8')
    expect(SONGS[1].tasks[0].scoreGuide.bars[0].beats).toHaveLength(6)
    expect(SONGS[2].chords).toContain('Fmaj7')
    expect(SONGS[2].chords).toContain('Cadd9')
  })

  it('三首歌每个阶段都有各自的具体练习任务', () => {
    for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex += 1) {
      expect(new Set(SONGS.map((course) => course.tasks[stageIndex].title)).size).toBe(SONGS.length)
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
  })

  it('只接受拾音 v1 格式的备份', () => {
    const data = startSong(emptyProgress(), song)
    expect(validateProgressBackup({ app: 'shiyin', exportedAt: new Date().toISOString(), data })).toEqual(data)
    expect(validateProgressBackup({ app: 'other', data })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyin', data: { ...data, version: 9 } })).toBeNull()
    expect(validateProgressBackup({ app: 'shiyin', data: { ...data, songs: { anheqiao: { currentTaskId: 'bad' } } } })).toBeNull()
  })
})
