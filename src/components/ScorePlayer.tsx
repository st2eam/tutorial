import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, AudioLines, BookOpen, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import type { AlphaTabApi as AlphaTabApiType } from '@coderline/alphatab'
import type { LessonTask, Song } from '../data/course'
import { COURSE_SCORE_MANIFEST } from '../data/score-manifest'
import { getRouteBars, getTaskRouteIndexes, getTaskScoreBars, makeScorePages } from '../data/score-mapping'

type ScoreMode = 'task' | 'complete'
const MOBILE_QUERY = '(max-width: 767px)'

function tickSequence(api: AlphaTabApiType, bars: number[]) {
  const score = api.score
  if (!score) return []
  let tick = 0
  return bars.map((bar) => {
    const start = tick
    const masterBar = score.masterBars[bar - 1]
    const duration = masterBar?.calculateDuration() ?? score.masterBars[0]?.calculateDuration() ?? 0
    tick += duration
    return { bar, start, end: tick }
  })
}

export function ScorePlayer({ song, task, bpm, simplified, standalone = false }: { song: Song; task?: LessonTask; bpm?: number; simplified?: boolean; standalone?: boolean }) {
  const manifest = COURSE_SCORE_MANIFEST[song.id as keyof typeof COURSE_SCORE_MANIFEST]
  const stage = task?.stage ?? 8
  const isSimplified = simplified ?? false
  const playbackBpm = bpm ?? manifest.bpm
  const mountRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<AlphaTabApiType | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [pageSize, setPageSize] = useState(() => window.matchMedia(MOBILE_QUERY).matches ? 1 : 2)
  const [pageIndex, setPageIndex] = useState(0)
  const [mode, setMode] = useState<ScoreMode>(() => standalone ? 'complete' : 'task')
  const [staffMode, setStaffMode] = useState<'tab' | 'scoreTab'>('tab')
  const [autoFollow, setAutoFollow] = useState(false)
  const [loopRangeEnabled, setLoopRangeEnabled] = useState(false)
  const [loopStartIndex, setLoopStartIndex] = useState(0)
  const [loopEndIndex, setLoopEndIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(0.82)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [countInEnabled, setCountInEnabled] = useState(false)
  const [customSoundFontName, setCustomSoundFontName] = useState<string | null>(null)
  const [soundFontMessage, setSoundFontMessage] = useState('使用内置尤克里里音色')
  const [soundFontError, setSoundFontError] = useState('')
  const [soundFontLoading, setSoundFontLoading] = useState(false)
  const soundFontNameRef = useRef<string | null>(null)
  const customSoundFontPendingRef = useRef(false)
  const [followBar, setFollowBar] = useState<number | null>(null)
  const displayRef = useRef({ pageFirst: 1, barCount: 1, pageSize: 1, staffMode: 'tab' as 'tab' | 'scoreTab' })
  const followRef = useRef({ autoFollow: false, mode: 'task' as ScoreMode, pages: [] as ReturnType<typeof makeScorePages>, taskRouteIndexes: [] as number[] })
  const renderKey = `${song.id}:${task?.id ?? 'standalone'}:${isSimplified}:${mode}:${staffMode}:${pageSize}:${pageIndex}`

  const routeBars = useMemo(() => getRouteBars(song.id), [song.id])
  const taskRouteIndexes = useMemo(() => getTaskRouteIndexes(song.id, stage, isSimplified), [song.id, stage, isSimplified])
  const taskBars = useMemo(() => getTaskScoreBars(song.id, stage, isSimplified), [song.id, stage, isSimplified])
  const visibleBars = mode === 'complete' ? Array.from({ length: manifest.barCount }, (_, index) => index + 1) : taskBars
  const lastVisibleIndex = Math.max(0, visibleBars.length - 1)
  const pages = useMemo(() => makeScorePages(visibleBars, pageSize, mode === 'task'), [visibleBars.join(','), pageSize, mode])
  const activePage = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const page = pages[activePage] ?? { bars: [], routeIndexes: [] }
  const pageFirst = page.bars[0] ?? 1
  const pageLast = page.bars[page.bars.length - 1] ?? pageFirst
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href)
  const scoreUrl = new URL(manifest.file.replace(/^\//, ''), baseUrl).href
  const soundFontUrl = new URL('soundfonts/ukulele.sf2', baseUrl).href
  const fontDirectory = new URL('font/', baseUrl).href
  displayRef.current = { pageFirst, barCount: page.bars.length || 1, pageSize, staffMode }
  followRef.current = { autoFollow, mode, pages, taskRouteIndexes }

  const stopPlayback = useCallback(() => {
    const api = apiRef.current
    if (!api) return
    api.pause()
    api.playbackRange = null
    api.isLooping = false
    setPlaying(false)
    setFollowBar(null)
  }, [])

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const update = () => setPageSize(query.matches ? 1 : 2)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setPageIndex(0)
    setAutoFollow(false)
    setLoopRangeEnabled(false)
    setLoopStartIndex(0)
    setLoopEndIndex(Math.max(0, visibleBars.length - 1))
    setSpeed(1)
    stopPlayback()
  }, [task?.id, isSimplified, mode, pageSize, song.id, visibleBars.length, stopPlayback])

  useEffect(() => {
    let disposed = false
    let api: AlphaTabApiType | null = null
    const target = mountRef.current
    if (!target) return
    setReady(false)
    setError('')
    void import('@coderline/alphatab').then(({ AlphaTabApi, PlayerMode }) => {
      if (disposed || !target) return
      api = new AlphaTabApi(target, {
        core: { fontDirectory },
        player: {
          playerMode: PlayerMode.EnabledSynthesizer,
          enableCursor: true,
          soundFont: soundFontUrl,
          scrollElement: viewportRef.current ?? target,
        },
        display: {
          layoutMode: 'page',
          staveProfile: displayRef.current.staffMode === 'tab' ? 'Tab' : 'ScoreTab',
          barsPerRow: displayRef.current.pageSize,
          startBar: displayRef.current.pageFirst,
          barCount: displayRef.current.barCount,
          scale: 1,
        },
      })
      apiRef.current = api
      api.error.on((issue) => {
        if (disposed) return
        if (customSoundFontPendingRef.current) {
          customSoundFontPendingRef.current = false
          soundFontNameRef.current = null
          setCustomSoundFontName(null)
          setSoundFontLoading(false)
          setSoundFontError('这个音色文件无法读取，已恢复内置音色。')
          setSoundFontMessage('使用内置尤克里里音色')
          api!.resetSoundFonts()
          api!.loadSoundFont(soundFontUrl, false)
        } else setError(issue.message || '曲谱加载失败')
      })
      api.soundFontLoaded.on(() => {
        if (disposed) return
        customSoundFontPendingRef.current = false
        setSoundFontLoading(false)
        setSoundFontError('')
        setSoundFontMessage(soundFontNameRef.current ? `已载入：${soundFontNameRef.current}` : '使用内置尤克里里音色')
      })
      api.playerReady.on(() => { if (!disposed) setReady(true) })
      api.playerStateChanged.on((state) => {
        if (disposed) return
        setPlaying(state.state === 1)
        if (state.stopped) setFollowBar(null)
      })
      api.playerPositionChanged.on((position) => {
        if (disposed) return
        const durations = tickSequence(api!, routeBars)
        const entry = [...durations].reverse().find((candidate) => position.currentTick >= candidate.start) ?? durations[0]
        if (!entry) return
        setFollowBar(entry.bar)
        const currentFollow = followRef.current
        if (!currentFollow.autoFollow) return
        const globalIndex = durations.indexOf(entry)
        const localIndex = currentFollow.mode === 'task' ? currentFollow.taskRouteIndexes.indexOf(globalIndex) : -1
        const nextPage = currentFollow.pages.findIndex((candidate) => currentFollow.mode === 'task'
          ? candidate.routeIndexes.includes(localIndex)
          : candidate.bars.includes(entry.bar))
        if (nextPage >= 0) setPageIndex(nextPage)
      })
      api.scoreLoaded.on(() => {
        if (disposed) return
        api!.settings.display.startBar = displayRef.current.pageFirst
        api!.settings.display.barCount = displayRef.current.barCount
        api!.settings.display.barsPerRow = displayRef.current.pageSize
        api!.settings.display.staveProfile = displayRef.current.staffMode === 'tab' ? 3 : 1
        api!.updateSettings()
        api!.render()
      })
      api.load(scoreUrl)
    }).catch((issue: unknown) => {
      if (!disposed) setError(issue instanceof Error ? issue.message : '曲谱播放器加载失败')
    })
    return () => {
      disposed = true
      api?.destroy()
      if (apiRef.current === api) apiRef.current = null
    }
  // The API instance is bound to the selected score. Pagination updates it separately below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id])

  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    api.masterVolume = volume
    api.metronomeVolume = metronomeEnabled ? 0.48 : 0
    api.countInVolume = countInEnabled ? 0.58 : 0
  }, [volume, metronomeEnabled, countInEnabled, ready])

  useEffect(() => {
    const api = apiRef.current
    if (!api?.score) return
    api.settings.display.startBar = pageFirst
    api.settings.display.barCount = page.bars.length || 1
    api.settings.display.barsPerRow = pageSize
    api.settings.display.staveProfile = staffMode === 'tab' ? 3 : 1
    api.updateSettings()
    api.render()
  }, [renderKey, pageFirst, page.bars.length, pageSize, staffMode])

  useEffect(() => {
    const api = apiRef.current
    if (api) api.playbackSpeed = (playbackBpm / manifest.bpm) * speed
  }, [playbackBpm, manifest.bpm, speed, ready])

  function setPage(next: number) {
    stopPlayback()
    setPageIndex(Math.max(0, Math.min(pages.length - 1, next)))
  }

  function playbackTickRange() {
    const api = apiRef.current
    if (!api?.score) return null
    const ticks = tickSequence(api, routeBars)
    let routeIndexes: number[]
    if (mode === 'task' && !standalone) {
      routeIndexes = getTaskRouteIndexes(song.id, stage, isSimplified)
    } else routeIndexes = routeBars.map((_, index) => index)
    let occurrenceStart = routeIndexes[page.routeIndexes[0] ?? 0] ?? 0
    let occurrenceEnd = routeIndexes[page.routeIndexes[page.routeIndexes.length - 1] ?? 0] ?? occurrenceStart
    if (loopRangeEnabled && mode === 'task') {
      occurrenceStart = routeIndexes[Math.min(loopStartIndex, routeIndexes.length - 1)] ?? occurrenceStart
      occurrenceEnd = routeIndexes[Math.min(loopEndIndex, routeIndexes.length - 1)] ?? occurrenceStart
    } else if (mode === 'complete') {
      const pageRouteIndex = routeBars.findIndex((_, index) => page.bars.every((bar, offset) => routeBars[index + offset] === bar))
      occurrenceStart = Math.max(0, pageRouteIndex)
      occurrenceEnd = Math.max(occurrenceStart, occurrenceStart + page.bars.length - 1)
      if (loopRangeEnabled) {
        const firstBar = visibleBars[Math.min(loopStartIndex, lastVisibleIndex)]
        const lastBar = visibleBars[Math.min(loopEndIndex, lastVisibleIndex)]
        const selectedStart = routeBars.indexOf(firstBar)
        const selectedEnd = routeBars.findIndex((bar, index) => index >= selectedStart && bar === lastBar)
        if (selectedStart >= 0 && selectedEnd >= selectedStart) {
          occurrenceStart = selectedStart
          occurrenceEnd = selectedEnd
        }
      }
    }
    const endIndex = loopRangeEnabled
      ? Math.max(occurrenceStart, occurrenceEnd)
      : autoFollow ? routeIndexes[routeIndexes.length - 1] ?? routeBars.length - 1 : Math.max(occurrenceStart, occurrenceEnd)
    const start = ticks[occurrenceStart]?.start ?? 0
    const end = ticks[endIndex]?.end ?? api.score.masterBars[api.score.masterBars.length - 1]?.start ?? 0
    return { startTick: start, endTick: end }
  }

  function togglePlayback() {
    const api = apiRef.current
    if (!api || !ready) return
    if (playing) {
      api.pause()
      setPlaying(false)
      return
    }
    const range = playbackTickRange()
    if (!range) return
    api.playbackRange = range
    api.isLooping = loopRangeEnabled
    api.tickPosition = range.startTick
    api.play()
  }

  function toggleLoopRange() {
    stopPlayback()
    setLoopRangeEnabled((current) => !current)
  }

  function updateLoopStart(value: number) {
    stopPlayback()
    const next = Math.max(0, Math.min(lastVisibleIndex, value))
    setLoopStartIndex(next)
    setLoopEndIndex((current) => Math.max(current, next))
  }

  function updateLoopEnd(value: number) {
    stopPlayback()
    setLoopEndIndex(Math.max(loopStartIndex, Math.min(lastVisibleIndex, value)))
  }

  function setLoopToCurrentPage() {
    stopPlayback()
    const start = page.routeIndexes[0] ?? visibleBars.indexOf(pageFirst)
    const end = page.routeIndexes[page.routeIndexes.length - 1] ?? visibleBars.lastIndexOf(pageLast)
    setLoopStartIndex(Math.max(0, start))
    setLoopEndIndex(Math.max(start, end))
    setLoopRangeEnabled(true)
  }

  async function loadCustomSoundFont(file?: File) {
    if (!file) return
    const api = apiRef.current
    if (!api || !ready) return
    if (!/\.(sf2|sf3)$/i.test(file.name)) {
      setSoundFontError('请选择 .sf2 或 .sf3 音色文件。')
      return
    }
    if (file.size > 32 * 1024 * 1024) {
      setSoundFontError('音色文件需小于 32 MB。')
      return
    }
    stopPlayback()
    setSoundFontError('')
    setSoundFontLoading(true)
    setSoundFontMessage('正在载入本机音色…')
    soundFontNameRef.current = file.name
    customSoundFontPendingRef.current = true
    setCustomSoundFontName(file.name)
    try {
      const accepted = api.loadSoundFont(new Uint8Array(await file.arrayBuffer()), false)
      if (!accepted) throw new Error('alphaTab 无法识别该音色文件。')
    } catch {
      soundFontNameRef.current = null
      customSoundFontPendingRef.current = false
      setCustomSoundFontName(null)
      setSoundFontLoading(false)
      setSoundFontError('音色文件无法读取，已恢复内置音色。')
      setSoundFontMessage('使用内置尤克里里音色')
      api.resetSoundFonts()
      api.loadSoundFont(soundFontUrl, false)
    }
  }

  function restoreDefaultSoundFont() {
    const api = apiRef.current
    if (!api) return
    stopPlayback()
    soundFontNameRef.current = null
    customSoundFontPendingRef.current = false
    setCustomSoundFontName(null)
    setSoundFontError('')
    setSoundFontLoading(true)
    setSoundFontMessage('正在恢复内置尤克里里音色…')
    api.resetSoundFonts()
    api.loadSoundFont(soundFontUrl, false)
  }

  function toggleAutoFollow() {
    stopPlayback()
    setAutoFollow((current) => !current)
  }

  const label = mode === 'complete' ? `完整曲谱，共 ${manifest.barCount} 小节` : `练习范围，第 ${pageFirst}${pageFirst === pageLast ? '' : ` 到 ${pageLast}`} 小节`

  return <section className="practice-score-card score-player-card" aria-label={`${song.title}数字曲谱与试听`}>
    <div className="practice-score-head"><div><h4>{standalone ? '完整曲目 TAB' : mode === 'complete' ? '完整课程曲谱' : '今天练这段'}</h4><p>{manifest.attribution} · {manifest.timeSignature} · {playbackBpm}{standalone ? '' : ' 教学'} BPM{manifest.tempoUnit === 'dotted-quarter' ? '（附点四分音符）' : ''}</p></div><span>{label}</span></div>
    <p className="practice-score-help">四线 TAB 从上到下是 A、E、C、G 弦；数字代表品位，0 是空弦。同一拍对齐的音一起弹。{playing && followBar ? ` 当前播放第 ${followBar} 小节。` : ''}</p>
    <p className="score-review-note">{manifest.sourceStatus}。谱面来源只用于核对与署名，练习可在本站完成。</p>
    <div className="score-player-toolbar" role="group" aria-label="曲谱显示方式">
      {!standalone && <>
        <button className={mode === 'task' ? 'is-active' : ''} type="button" onClick={() => { stopPlayback(); setMode('task') }}><BookOpen size={15} />本步练习</button>
        <button className={mode === 'complete' ? 'is-active' : ''} type="button" onClick={() => { stopPlayback(); setMode('complete') }}>完整谱</button>
      </>}
      <label className="score-staff-toggle"><input type="checkbox" checked={staffMode === 'scoreTab'} onChange={(event) => setStaffMode(event.target.checked ? 'scoreTab' : 'tab')} />同时显示五线谱</label>
    </div>
    <div className="score-player-viewport" ref={viewportRef}>
      <div className="score-player-notation" ref={mountRef} aria-label={`当前页曲谱：${page.bars.map((bar) => `第 ${bar} 小节`).join('、')}`} />
      {!ready && !error && <p className="score-player-status" role="status">正在加载曲谱和尤克里里音色…</p>}
      {error && <p className="score-player-status score-player-error" role="alert">曲谱加载失败：{error}</p>}
    </div>
    <div className="practice-score-controls">
      <button className="button button--secondary" type="button" onClick={() => setPage(activePage - 1)} disabled={activePage === 0}><ArrowLeft size={15} />上一页</button>
      <span className="score-page-count" aria-live="polite">{mode === 'complete' ? `第 ${pageFirst}${pageFirst === pageLast ? '' : `–${pageLast}`} 小节 · ` : ''}第 ${activePage + 1} / ${pages.length} 页</span>
      <button className="button button--secondary" type="button" onClick={() => setPage(activePage + 1)} disabled={activePage >= pages.length - 1}>下一页<ArrowRight size={15} /></button>
    </div>
    <div className="score-player-controls">
      <button className="button button--quiet" type="button" onClick={togglePlayback} disabled={!ready} aria-label={playing ? '暂停试听' : autoFollow ? '试听当前页并自动跟谱' : '试听当前页'}>
        {playing ? <Pause size={16} /> : <Play size={16} />}{playing ? '暂停试听' : '试听'}
      </button>
      <label className="score-auto-follow"><input type="checkbox" checked={autoFollow} onChange={toggleAutoFollow} />播放时自动翻页</label>
      <label className="score-speed-control">速度
        <select aria-label="试听速度" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.25, 1.5].map((value) => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}
        </select>
      </label>
      {playing && followBar && <span className="score-follow-position" aria-live="polite">正在播放第 {followBar} 小节</span>}
    </div>
    <details className="score-player-settings">
      <summary><AudioLines size={16} />练习设置</summary>
      <div className="score-settings-grid">
        <label className="score-setting-volume"><span><Volume2 size={15} />音量 <b>{Math.round(volume * 100)}%</b></span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="试听音量" /></label>
        <label className="score-setting-check"><input type="checkbox" checked={metronomeEnabled} onChange={(event) => setMetronomeEnabled(event.target.checked)} />节拍器</label>
        <label className="score-setting-check"><input type="checkbox" checked={countInEnabled} onChange={(event) => setCountInEnabled(event.target.checked)} />开始前预备拍</label>
        <label className="score-setting-check score-setting-loop"><input type="checkbox" checked={loopRangeEnabled} onChange={toggleLoopRange} />循环小节区间</label>
        <label className="score-range-select">从小节
          <select value={Math.min(loopStartIndex, lastVisibleIndex)} onChange={(event) => updateLoopStart(Number(event.target.value))} aria-label="循环起始小节">
            {visibleBars.map((bar, index) => <option key={`${bar}-${index}`} value={index}>第 {bar} 小节{visibleBars.slice(0, index).includes(bar) ? ` · 第 ${visibleBars.slice(0, index + 1).filter((item) => item === bar).length} 次` : ''}</option>)}
          </select>
        </label>
        <label className="score-range-select">到小节
          <select value={Math.max(loopStartIndex, Math.min(loopEndIndex, lastVisibleIndex))} onChange={(event) => updateLoopEnd(Number(event.target.value))} aria-label="循环结束小节">
            {visibleBars.slice(Math.min(loopStartIndex, lastVisibleIndex)).map((bar, offset) => {
              const index = Math.min(loopStartIndex, lastVisibleIndex) + offset
              return <option key={`${bar}-${index}`} value={index}>第 {bar} 小节{visibleBars.slice(0, index).includes(bar) ? ` · 第 ${visibleBars.slice(0, index + 1).filter((item) => item === bar).length} 次` : ''}</option>
            })}
          </select>
        </label>
        <button className="score-range-current" type="button" onClick={setLoopToCurrentPage}>循环本页</button>
        <div className="score-setting-soundfont">
          <div><strong>弹奏音色</strong><span role="status">{soundFontLoading ? '正在载入音色…' : soundFontMessage}</span></div>
          <label className="score-font-import">导入 SF2/SF3
            <input type="file" accept=".sf2,.sf3,audio/x-soundfont" disabled={!ready || soundFontLoading} onChange={(event) => { void loadCustomSoundFont(event.target.files?.[0]); event.currentTarget.value = '' }} />
          </label>
          {customSoundFontName && <button className="score-font-reset" type="button" disabled={soundFontLoading} onClick={restoreDefaultSoundFont}><RotateCcw size={14} />恢复内置音色</button>}
          {soundFontError && <span className="score-font-error" role="alert">{soundFontError}</span>}
        </div>
      </div>
    </details>
    {loopRangeEnabled && <p className="score-player-loop-status" role="status">试听循环第 {visibleBars[Math.min(loopStartIndex, lastVisibleIndex)]}–{visibleBars[Math.min(loopEndIndex, lastVisibleIndex)]} 小节。</p>}
    <div className="score-player-legend"><span>左手 1 食指 · 2 中指 · 3 无名指 · 4 小指</span><span>自选音色只在本机内存中载入</span></div>
    <div className="castle-score-footer"><span>{manifest.barCount} 小节 · High-G · MusicXML</span><a href={manifest.sourceUrl} target="_blank" rel="noreferrer">查看来源与署名 <ArrowRight size={14} /></a></div>
  </section>
}
