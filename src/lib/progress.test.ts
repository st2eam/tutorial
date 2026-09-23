import { describe, expect, it } from 'vitest'
import { SONGS, STAGES } from '../data/course'
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
      }
    }
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
