import { useCallback, useEffect, useRef, useState } from 'react'
import type { AlphaTabApi, model } from '@coderline/alphatab'
import type { InteractiveCourse, PracticeLevel, PracticeMode } from '../data/interactive-course'

export type ScoreSelection = { beat: model.Beat; note?: model.Note; beats?: model.Beat[] }

/** MIDI lookup entries are in performed order, including repeated bars and endings. */
export function playbackTicksForBars(api: AlphaTabApi, firstBar: number, lastBar: number, visit = 1) {
  const bars = api.tickCache?.masterBars ?? []
  const starts = bars.flatMap((item, index) => item.masterBar.index === firstBar - 1 ? [index] : [])
  const startIndex = starts[visit - 1] ?? starts[0]
  if (startIndex === undefined) return null
  for (let index = startIndex; index < bars.length; index += 1) {
    if (bars[index].masterBar.index === lastBar - 1) {
      return { startTick: bars[startIndex].start, endTick: bars[index].end }
    }
  }
  return null
}

export function usePracticePlayer(course: InteractiveCourse, level: PracticeLevel, mode: PracticeMode, speed: number, visible: { first: number; last: number }, follow = false) {
  const mountRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<AlphaTabApi | null>(null)
  const levelRef = useRef(level)
  levelRef.current = level
  const modeRef = useRef(mode)
  modeRef.current = mode
  const followRef = useRef(follow)
  followRef.current = follow
  const [retry, setRetry] = useState(0)
  const [scoreReady, setScoreReady] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [selection, setSelection] = useState<ScoreSelection | null>(null)
  const [error, setError] = useState('')
  const [activeBar, setActiveBar] = useState<number | null>(null)
  const [chordNames, setChordNames] = useState<string[]>([])

  const stop = useCallback(() => {
    const api = apiRef.current
    if (api) {
      api.pause()
      api.isLooping = false
      api.playbackRange = null
      api.metronomeVolume = 0
      api.countInVolume = 0
    }
    setPlaying(false)
    setActiveBar(null)
  }, [])

  useEffect(() => {
    let disposed = false
    let api: AlphaTabApi | null = null
    const target = mountRef.current
    if (!target) return
    setScoreReady(false)
    setAudioReady(false)
    setError('')
    setSelection(null)
    setChordNames([])
    const base = new URL(import.meta.env.BASE_URL, window.location.href)
    void import('@coderline/alphatab').then(({ AlphaTabApi: Api, PlayerMode, NotationElement }) => {
      if (disposed || !target) return
      api = new Api(target, {
        core: { fontDirectory: new URL('font/', base).href },
        player: {
          playerMode: PlayerMode.EnabledSynthesizer,
          enableCursor: true,
          soundFont: new URL('soundfonts/ukulele.sf2', base).href,
          scrollMode: 'off',
        },
        display: { layoutMode: 'page', staveProfile: 'Tab', barsPerRow: window.matchMedia('(max-width: 680px)').matches ? 1 : 2, scale: 1 },
      })
      apiRef.current = api
      for (const element of [NotationElement.ScoreTitle, NotationElement.ScoreSubTitle, NotationElement.ScoreArtist, NotationElement.ScoreMusic, NotationElement.ScoreWords, NotationElement.ScoreWordsAndMusic, NotationElement.ScoreCopyright, NotationElement.GuitarTuning]) {
        api.settings.notation.elements.set(element, false)
      }
      api.updateSettings()
      api.scoreLoaded.on(() => {
        setScoreReady(true)
        setChordNames(api?.score?.tracks[0]?.staves[0]?.bars.map(bar => (bar.voices[0]?.beats.find(beat => beat.chordId)?.chordId?.split('|')[0] ?? '').trim()) ?? [])
      })
      api.playerReady.on(() => setAudioReady(true))
      api.error.on((cause) => setError(cause.message || '曲谱加载失败'))
      api.playerStateChanged.on(({ state }) => setPlaying(state === 1))
      api.noteMouseDown.on((note) => {
        setSelection({ beat: note.beat, note })
        if (modeRef.current !== 'self' && apiRef.current?.playerState === 0) apiRef.current.playNote(note)
      })
      api.beatMouseDown.on((beat) => {
        setSelection((previous) => previous?.beat === beat ? previous : { beat })
      })
      api.activeBeatsChanged.on(({ activeBeats }) => {
        const visibleBeats = levelRef.current === 'melody' && course.style === 'fingerstyle'
          ? activeBeats.filter(item => item.voice.bar.staff.track.index === 0)
          : activeBeats
        const beat = visibleBeats.find(item => item.notes.length) ?? visibleBeats[0]
        if (beat) {
          setSelection({ beat, beats: visibleBeats })
          const barIndex = beat.voice.bar.masterBar.index
          setActiveBar(barIndex + 1)
          if (followRef.current && apiRef.current) {
            const surface = target.querySelector<HTMLElement>('.at-surface')
            const bounds = apiRef.current.renderer?.boundsLookup?.findMasterBarByIndex(barIndex)?.realBounds
            const width = apiRef.current.renderer?.width
            if (surface && bounds && width) {
              const y = surface.getBoundingClientRect().top + bounds.y * surface.getBoundingClientRect().width / width
              if (y < 90 || y > window.innerHeight * 0.68) window.scrollTo({ top: window.scrollY + y - window.innerHeight * 0.35, behavior: 'smooth' })
            }
          }
        }
      })
      const loaded = api.load(new URL(course.scoreFile, base).href)
      if (!loaded) setError('曲谱文件无法读取，请重试。')
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : '播放器启动失败'))
    return () => {
      disposed = true
      if (api) {
        api.pause()
        api.destroy()
      }
      apiRef.current = null
    }
  }, [course.id, course.scoreFile, retry])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 680px)')
    const resize = () => {
      const api = apiRef.current
      if (!api?.score) return
      api.settings.display.barsPerRow = query.matches ? 1 : 2
      api.updateSettings()
      api.render()
    }
    query.addEventListener('change', resize)
    return () => query.removeEventListener('change', resize)
  }, [])

  useEffect(() => {
    const api = apiRef.current
    if (!api?.score || !scoreReady) return
    stop()
    api.renderScore(api.score, level === 'melody' && course.style === 'fingerstyle' ? [0] : undefined)
  }, [course.style, level, scoreReady, stop])

  useEffect(() => {
    const api = apiRef.current
    if (!api?.score || !scoreReady) return
    api.settings.display.startBar = visible.first
    api.settings.display.barCount = visible.last - visible.first + 1
    api.updateSettings()
    api.render()
  }, [scoreReady, visible.first, visible.last])

  useEffect(() => {
    const api = apiRef.current
    if (!api?.score || !audioReady) return
    stop()
    api.playbackSpeed = speed
    const tracks = api.score.tracks
    api.changeTrackMute(tracks, mode === 'self')
    if (mode !== 'self' && tracks[1]) api.changeTrackMute([tracks[1]], level === 'melody')
  }, [audioReady, level, mode, speed, stop])

  const play = useCallback((firstBar: number, lastBar: number, looping: boolean, visit = 1) => {
    const api = apiRef.current
    if (!api || !audioReady) return false
    const range = playbackTicksForBars(api, firstBar, lastBar, visit)
    if (!range) return false
    api.pause()
    api.playbackRange = range
    api.isLooping = looping
    api.playbackSpeed = speed
    api.countInVolume = mode === 'follow' ? 0.75 : 0
    api.metronomeVolume = mode === 'self' || mode === 'follow' ? 0.6 : 0
    api.tickPosition = range.startTick
    api.play()
    return true
  }, [audioReady, mode, speed])

  const previewSelection = useCallback(() => {
    const api = apiRef.current
    if (!api || !audioReady || !selection || modeRef.current === 'self') return
    if (selection.note) api.playNote(selection.note)
    else api.playBeat(selection.beat)
  }, [audioReady, selection])

  return { mountRef, scoreReady, audioReady, playing, selection, activeBar, chordNames, error, play, stop, previewSelection, retry: () => setRetry(value => value + 1) }
}
