import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, AudioLines, BookOpen, Check, CheckCircle2, ChevronRight,
  CircleHelp, Clock3, Download, ExternalLink, Guitar, Home, LockKeyhole, Music2,
  Pause, Play, Plus, RotateCcw, Settings, Sparkles, Sprout, Upload, Volume2, X,
} from 'lucide-react'
import { CHORDS, findSong, findTask, SONGS, STAGES, type ChordName, type Song } from './data/course'
import {
  currentTask, emptyProgress, exportBackup, getSongProgress, loadProgress, markSongRoute,
  recordFeedback, saveProgress, startSong, validateProgressBackup, type TaskFeedback, type UserProgress,
} from './lib/progress'

type Page = 'today' | 'practice' | 'songs' | 'song' | 'growth' | 'settings'
const NAV_ITEMS: { id: Page; label: string; Icon: typeof Home }[] = [
  { id: 'today', label: '今日', Icon: Home },
  { id: 'songs', label: '歌曲', Icon: Music2 },
  { id: 'growth', label: '成长', Icon: Sprout },
  { id: 'settings', label: '设置', Icon: Settings },
]

function setPage(page: Page) {
  window.location.hash = `/${page}`
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand--compact' : ''}`}>
    <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /><i /></span>
    <span className="brand-name">拾音</span>
    {!compact && <span className="brand-tagline">今天，只练下一小步</span>}
  </div>
}

function Artwork({ song, large = false }: { song: Song; large?: boolean }) {
  return <div className={`artwork artwork--${song.palette} ${large ? 'artwork--large' : ''}`} aria-hidden="true">
    <span className="artwork-note artwork-note--one">♪</span>
    <span className="artwork-note artwork-note--two">·</span>
    <svg viewBox="0 0 180 120" focusable="false">
      <path className="art-hill art-hill--back" d="M0 94Q35 48 75 81T180 58v62H0z" />
      <path className="art-hill art-hill--front" d="M0 105Q47 77 91 97t89-20v43H0z" />
      <circle className="art-sun" cx="136" cy="30" r="14" />
      <path className="art-line" d="M27 82c17-20 37-28 64-25M107 43c11 3 21 9 29 17" />
    </svg>
    <span className="artwork-caption">{song.mood.split(' · ')[1] ?? '练习曲目'}</span>
  </div>
}

function ChordDiagram({ name }: { name: ChordName }) {
  const chord = CHORDS[name]
  const xPositions = [30, 58, 86, 114]
  const yStart = 31
  const fretGap = 22
  return <div className="chord-card">
    <div className="chord-title"><strong>{name}</strong><span>和弦图</span></div>
    <svg viewBox="0 0 144 150" role="img" aria-label={`${name} 和弦指法图：${chord.hint}`}>
      {xPositions.map((x) => <line key={`s${x}`} x1={x} x2={x} y1={yStart} y2={yStart + fretGap * 4} className="chord-string" />)}
      {[0, 1, 2, 3, 4].map((fret) => <line key={`f${fret}`} x1="30" x2="114" y1={yStart + fret * fretGap} y2={yStart + fret * fretGap} className={fret === 0 ? 'chord-nut' : 'chord-fret'} />)}
      {chord.frets.map((fret, stringIndex) => <text key={`open${stringIndex}`} x={xPositions[stringIndex]} y="22" textAnchor="middle" className="chord-open">{fret === 0 ? '○' : ''}</text>)}
      {chord.frets.map((fret, stringIndex) => fret > 0 ? <g key={`dot${stringIndex}`}>
        <circle cx={xPositions[stringIndex]} cy={yStart + (fret - 0.5) * fretGap} r="7.5" className="chord-dot" />
        <text x={xPositions[stringIndex]} y={yStart + (fret - 0.5) * fretGap + 3} textAnchor="middle" className="chord-finger">{chord.fingers[stringIndex]}</text>
      </g> : null)}
      {['G', 'C', 'E', 'A'].map((stringName, index) => <text key={stringName} x={xPositions[index]} y="139" textAnchor="middle" className="chord-string-name">{stringName}</text>)}
    </svg>
    <p>{chord.hint}</p>
  </div>
}

function Metronome({ initialBpm }: { initialBpm: number }) {
  const [bpm, setBpm] = useState(initialBpm)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(0)
  const audioRef = useRef<AudioContext | null>(null)
  const beatRef = useRef(0)
  const enabled = typeof window !== 'undefined' && 'AudioContext' in window

  useEffect(() => {
    if (!running || !enabled) return
    const context = audioRef.current ?? new AudioContext()
    audioRef.current = context
    void context.resume()
    const tick = () => {
      const currentBeat = beatRef.current % 4
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = currentBeat === 0 ? 1000 : 700
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(currentBeat === 0 ? 0.22 : 0.12, context.currentTime + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.075)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.08)
      beatRef.current += 1
      setBeat(currentBeat)
    }
    tick()
    const timer = window.setInterval(tick, 60000 / bpm)
    return () => window.clearInterval(timer)
  }, [bpm, enabled, running])

  return <section className="metronome" aria-label="节拍器">
    <div className="metronome-head"><div><span className="eyebrow">练习工具</span><h3>节拍器</h3></div><Volume2 size={19} aria-hidden="true" /></div>
    <div className="beat-dots" aria-label={`当前拍点 ${beat + 1}，四拍一循环`}>{[0, 1, 2, 3].map((item) => <span className={running && beat === item ? 'beat-dot beat-dot--active' : 'beat-dot'} key={item} />)}</div>
    <div className="tempo-control">
      <button className="icon-button" type="button" aria-label="降低每分钟拍数" onClick={() => setBpm((value) => Math.max(40, value - 2))}><span aria-hidden="true">−</span></button>
      <div className="tempo-number"><strong>{bpm}</strong><span>BPM</span></div>
      <button className="icon-button" type="button" aria-label="提高每分钟拍数" onClick={() => setBpm((value) => Math.min(180, value + 2))}><Plus size={17} /></button>
    </div>
    <button className="button button--secondary metronome-toggle" type="button" onClick={() => setRunning((value) => !value)} disabled={!enabled}>
      {running ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}{running ? '暂停节拍' : enabled ? '开始节拍' : '此浏览器不支持音频'}
    </button>
  </section>
}

function SongCard({ song, progress, onClick, featured = false }: { song: Song; progress: UserProgress; onClick: () => void; featured?: boolean }) {
  const item = getSongProgress(progress, song)
  const done = item.confirmedPlaying && item.confirmedSinging
  const percent = Math.round(item.completedTaskIds.length / song.tasks.length * 100)
  const status = done ? '已完成' : item.completedTaskIds.length ? '进行中' : '待开始'
  return <button className={`song-card ${featured ? 'song-card--featured' : ''}`} type="button" onClick={onClick}>
    <Artwork song={song} large={featured} />
    <div className="song-card-content">
      <div className="song-title-row"><div><h3>{song.title}</h3><p>{song.artist} <span>·</span> {song.mood}</p></div>{featured && <span className="pill pill--recommend">推荐起点</span>}</div>
      <p className="song-description">{song.intro}</p>
      <div className="chord-chips">{song.chords.map((chord) => <span key={chord}>{chord}</span>)}</div>
      <div className="song-card-foot"><span>{status}</span><span>{item.completedTaskIds.length ? `${percent}% 完成` : song.fit}</span><ChevronRight size={17} aria-hidden="true" /></div>
      <div className="progress-track" aria-label={`${song.title}课程进度 ${percent}%`}><span style={{ width: `${percent}%` }} /></div>
    </div>
  </button>
}

function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress())
  const [page, setCurrentPage] = useState<Page>(() => readPage())
  const [selectedSongId, setSelectedSongId] = useState<string | null>(() => findSong(loadProgress().activeSongId)?.id ?? null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [toast, setToast] = useState('')
  const [updateReady, setUpdateReady] = useState(false)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => setCurrentPage(readPage())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const onlineChange = () => setOnline(navigator.onLine)
    let registration: ServiceWorkerRegistration | undefined
    let updateFound: (() => void) | undefined
    window.addEventListener('online', onlineChange)
    window.addEventListener('offline', onlineChange)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((result) => {
        registration = result
        if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true)
        updateFound = () => {
          const worker = registration?.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true)
          })
        }
        registration.addEventListener('updatefound', updateFound)
      }).catch(() => undefined)
    }
    return () => {
      window.removeEventListener('online', onlineChange)
      window.removeEventListener('offline', onlineChange)
      if (registration && updateFound) registration.removeEventListener('updatefound', updateFound)
    }
  }, [])

  useEffect(() => saveProgress(progress), [progress])

  const activeSong = findSong(progress.activeSongId)
  const selectedSong = findSong(selectedSongId)
  const activeSongProgress = activeSong ? getSongProgress(progress, activeSong) : null
  const task = activeSong && activeSongProgress ? currentTask(activeSong, activeSongProgress) : undefined
  const completedSongs = SONGS.filter((song) => {
    const item = getSongProgress(progress, song)
    return item.confirmedPlaying && item.confirmedSinging
  })
  const masteredChords = useMemo(() => [...new Set(progress.history.filter((entry) => entry.feedback !== 'not_mastered').flatMap((entry) => findSong(entry.songId)?.tasks.find((lesson) => lesson.id === entry.taskId)?.chords ?? []))], [progress.history])

  function update(mutator: (data: UserProgress) => UserProgress) {
    setProgress((current) => mutator(current))
  }

  function beginSong(song: Song) {
    setSelectedSongId(song.id)
    update((current) => startSong(current, song))
    setPage('today')
  }

  function submitFeedback(value: TaskFeedback) {
    if (!activeSong) return
    update((current) => recordFeedback(current, activeSong, value))
    setFeedbackOpen(false)
    setPage('today')
    const message = value === 'easy' ? '这一步，已经稳稳拿下。' : value === 'hard' ? '已记下，下次先温习这一小步。' : '没关系，我们把这一步再拆小一点。'
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function downloadProgress() {
    const blob = new Blob([JSON.stringify(exportBackup(progress), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `shiyin-progress-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function importProgress(file?: File) {
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const imported = validateProgressBackup(parsed)
      if (!imported) throw new Error('备份文件格式不正确或版本不兼容。')
      setProgress(imported)
      setImportMessage('进度已成功恢复。')
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : '无法读取这个文件。')
    }
  }

  function clearProgress() {
    if (!window.confirm('确定清空所有练习进度吗？这个操作无法撤销。建议先导出备份。')) return
    setProgress(emptyProgress())
    setSelectedSongId(null)
    setPage('today')
  }

  async function applyUpdate() {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (!registration?.waiting) return
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  const hasStarted = Boolean(activeSong && activeSongProgress)
  const onSongCard = (song: Song) => {
    setSelectedSongId(song.id)
    setPage('song')
  }

  if (!hasStarted && page !== 'settings' && page !== 'growth' && page !== 'songs' && page !== 'song') {
    return <Onboarding onChoose={beginSong} progress={progress} />
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-rule" />
      <span className="nav-caption">练习空间</span>
      <Navigation page={page} />
      <div className="sidebar-bottom">
        <div className="sidebar-note"><AudioLines size={17} /><span>慢一点，也在前进</span></div>
        <p>拾音 · 个人练习手册</p>
      </div>
    </aside>

    <div className="mobile-topbar"><Brand compact /><span className={`network-state ${online ? '' : 'network-state--offline'}`}><i />{online ? '已准备好' : '离线练习'}</span></div>

    <main className="main-layout">
      <div className="main-column">
        <header className="page-topline">
          <div><span className="eyebrow">{pageLabel(page)}</span><h1>{pageTitle(page, activeSong, selectedSong)}</h1></div>
          <div className={`network-state network-state--desktop ${online ? '' : 'network-state--offline'}`}><i />{online ? '内容已就绪' : '离线可练习'}</div>
        </header>

        {page === 'today' && activeSong && activeSongProgress && task && <TodayPage song={activeSong} item={activeSongProgress} task={task} onContinue={() => setPage(activeSongProgress.completedTaskIds.length >= activeSong.tasks.length ? 'song' : 'practice')} onSongs={() => setPage('songs')} />}
        {page === 'practice' && activeSong && activeSongProgress && task && <PracticePage song={activeSong} task={task} item={activeSongProgress} onBack={() => setPage('today')} onFinish={() => setFeedbackOpen(true)} />}
        {page === 'songs' && <SongsPage progress={progress} onSong={onSongCard} completedSongs={completedSongs.length} />}
        {page === 'song' && selectedSong && <SongPage song={selectedSong} progress={progress} onStart={() => beginSong(selectedSong)} onPractice={() => { beginSong(selectedSong); setPage('practice') }} onRoute={(route) => update((current) => markSongRoute(current, selectedSong, route))} />}
        {page === 'song' && !selectedSong && <SongsPage progress={progress} onSong={onSongCard} completedSongs={completedSongs.length} />}
        {page === 'growth' && <GrowthPage progress={progress} completedSongs={completedSongs.length} masteredChords={masteredChords} />}
        {page === 'settings' && <SettingsPage progress={progress} importInput={importInput} importMessage={importMessage} onImportMessage={setImportMessage} onExport={downloadProgress} onImport={importProgress} onClear={clearProgress} />}
      </div>
      <aside className="right-rail">
        <ProgressCard song={activeSong} progress={activeSongProgress} completedSongs={completedSongs.length} />
        <div className="rail-quote"><span className="quote-mark">“</span><p>音乐不是赶路，是慢慢走进一段旋律。</p><span>给今天的你</span></div>
        <a className="rail-link" href={activeSong?.sourceUrl ?? 'https://music.163.com/'} target="_blank" rel="noreferrer">去官方平台听听这首歌 <ExternalLink size={14} /></a>
      </aside>
    </main>

    <nav className="bottom-nav" aria-label="主导航">{NAV_ITEMS.map(({ id, label, Icon }) => <button key={id} type="button" className={page === id || (id === 'songs' && page === 'song') ? 'bottom-nav-item is-active' : 'bottom-nav-item'} onClick={() => setPage(id)}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></button>)}</nav>

    {feedbackOpen && activeSong && <FeedbackDialog onSelect={submitFeedback} onClose={() => setFeedbackOpen(false)} taskTitle={task?.title ?? ''} />}
    {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    {updateReady && <div className="update-toast" role="status"><span>拾音有一个小更新，准备好了。</span><button type="button" onClick={() => void applyUpdate()}>现在更新</button></div>}
  </div>
}

function readPage(): Page {
  const value = window.location.hash.replace('#/', '')
  return (['today', 'practice', 'songs', 'song', 'growth', 'settings'] as string[]).includes(value) ? value as Page : 'today'
}

function pageLabel(page: Page) {
  return ({ today: '你的练习节奏', practice: '专注练习', songs: '曲目收藏', song: '歌曲学习地图', growth: '慢慢积累', settings: '练习空间' })[page]
}
function pageTitle(page: Page, active?: Song, selected?: Song) {
  return ({ today: active ? '今天，继续一点点' : '今天，想弹哪一首？', practice: '把这一小步练熟', songs: '想学的歌，都在这里', song: selected?.title ?? active?.title ?? '歌曲学习地图', growth: '每一次练习都算数', settings: '让练习更顺手' })[page]
}

function Navigation({ page }: { page: Page }) {
  return <nav className="side-nav" aria-label="主导航">{NAV_ITEMS.map(({ id, label, Icon }) => <button key={id} className={page === id || (id === 'songs' && page === 'song') ? 'side-nav-item is-active' : 'side-nav-item'} type="button" onClick={() => setPage(id)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{page === id && <span className="nav-active-dot" />}</button>)}</nav>
}

function Onboarding({ onChoose, progress }: { onChoose: (song: Song) => void; progress: UserProgress }) {
  return <div className="onboarding-screen">
    <div className="onboarding-shell">
      <header className="onboarding-header"><Brand /><span className="edition-mark">个人练习手册 <span>—</span> 01</span></header>
      <section className="welcome-block"><div className="welcome-copy"><span className="eyebrow"><span className="eyebrow-line" />从一首喜欢的歌开始</span><h1>给旋律一点时间，<br /><em>也给自己一点。</em></h1><p>不用一次学会很多。今天，先从你想弹的那首歌，走出一小步。</p></div><div className="welcome-illustration" aria-hidden="true"><svg viewBox="0 0 300 250"><circle cx="150" cy="124" r="93" fill="#e9e1d3"/><ellipse cx="146" cy="140" rx="48" ry="66" fill="#c68b62" transform="rotate(-28 146 140)"/><ellipse cx="146" cy="140" rx="24" ry="31" fill="#f6f0e5" transform="rotate(-28 146 140)"/><path d="M150 22v171M167 22v165M184 29v151M201 43v129" stroke="#5e4838" strokeWidth="4" strokeLinecap="round"/><path d="M36 164c27-39 47 38 74 0s45-34 71 4 50 38 86-4" fill="none" stroke="#275a48" strokeWidth="4" strokeLinecap="round"/><path d="M69 202c37 20 119 30 164 0" fill="none" stroke="#bc8967" strokeWidth="2" strokeDasharray="3 7"/></svg><span>慢慢来，<br />会弹出来的。</span></div></section>
      <div className="selection-heading"><div><span className="eyebrow">三首熟悉的民谣</span><h2>你想先走进哪段旋律？</h2></div><span className="selection-count">01 <i /> 03</span></div>
      <div className="song-grid song-grid--onboarding">{SONGS.map((song, index) => <SongCard key={song.id} song={song} progress={progress} featured={index === 0} onClick={() => onChoose(song)} />)}</div>
      <footer className="onboarding-foot"><span><CircleHelp size={15} /> 每首歌都会从慢速、分段开始</span><span>不需要基础 · 进度只保存在这台设备</span></footer>
    </div>
  </div>
}

function TodayPage({ song, item, task, onContinue, onSongs }: { song: Song; item: ReturnType<typeof getSongProgress>; task: NonNullable<ReturnType<typeof findTask>>; onContinue: () => void; onSongs: () => void }) {
  const percent = Math.round(item.completedTaskIds.length / song.tasks.length * 100)
  const isReview = item.reviewTaskId === task.id
  const simplified = item.simplifiedTaskId === task.id
  return <div className="page-content today-page">
    <section className="today-hero">
      <div className="today-hero-top"><div className="tiny-date"><span className="tiny-sun" /> 给今天留一点旋律</div><span className="session-count"><Clock3 size={14} /> 一小步就好</span></div>
      <div className="continue-card">
        <Artwork song={song} />
        <div className="continue-info"><div className="continue-kicker">{isReview ? '温习一下' : simplified ? '慢一点，再试试' : '正在学'}</div><h2>{song.title}</h2><p>{task.stageName}<span> / </span>{task.title}</p></div>
        <div className="continue-step"><strong>{Math.min(item.completedTaskIds.length + 1, song.tasks.length).toString().padStart(2, '0')}</strong><span>/ {song.tasks.length.toString().padStart(2, '0')} 步</span></div>
      </div>
      <div className="today-action"><div className="today-action-copy"><span className="eyebrow">今天，只练这一件事</span><h3>{task.title}</h3><p>{task.success}</p></div><button className="button button--primary" type="button" onClick={onContinue}>继续练习 <ArrowRight size={17} /></button></div>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">正在靠近</span><h2>把《{song.title}》弹出来</h2></div><button className="text-button" type="button" onClick={onSongs}>换一首 <ArrowRight size={15} /></button></div>
      <div className="song-progress-panel"><div className="song-progress-main"><div className="song-progress-title"><span>学习进度</span><strong>{percent}%</strong></div><div className="progress-track progress-track--large"><span style={{ width: `${percent}%` }} /></div><div className="song-progress-meta"><span>{item.completedTaskIds.length} 个练习步骤完成</span><span>目标：完整弹唱</span></div></div><div className="stage-mini-list">{STAGES.slice(0, 4).map((stage, index) => <span key={stage} className={index < item.completedTaskIds.length ? 'stage-mini is-done' : index === task.stage - 1 ? 'stage-mini is-current' : 'stage-mini'}><i>{index < item.completedTaskIds.length ? <Check size={10} /> : index + 1}</i>{stage}</span>)}</div></div>
    </section>

    <section className="section-block quick-note"><div className="note-icon"><Sparkles size={17} /></div><div><h3>{item.lastFeedback === 'hard' ? '下次先把刚才那段温习一遍' : item.lastFeedback === 'not_mastered' ? '已经为你把练习拆得更小' : '不用赶进度，手指会慢慢记住'}</h3><p>按自己的节奏练习。每一次拿起琴，都已经让旋律更近了一点。</p></div></section>
  </div>
}

function PracticePage({ song, task, item, onBack, onFinish }: { song: Song; task: NonNullable<ReturnType<typeof findTask>>; item: ReturnType<typeof getSongProgress>; onBack: () => void; onFinish: () => void }) {
  const simplified = item.simplifiedTaskId === task.id
  const isReview = item.reviewTaskId === task.id
  const bpm = simplified ? Math.max(44, Math.round(task.bpm * 0.7)) : task.bpm
  const visibleSteps = simplified ? ['只练这一个和弦或动作，放慢速度，重复四次。'] : task.steps
  const visibleChords = simplified ? task.chords.slice(0, 1) : task.chords
  const successText = simplified ? '慢速重复四次，找到这个动作的手感即可。' : task.success
  return <div className="practice-page">
    <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={16} /> 返回今日</button>
    <div className="practice-heading"><div><span className="eyebrow">{song.title} <span className="eyebrow-separator">/</span> {task.stageName}</span><h2>{task.title}</h2></div><span className="lesson-number">{String(task.stage).padStart(2, '0')} <i /> 08</span></div>
    {(isReview || simplified) && <div className="gentle-banner"><Sparkles size={17} /><span>{isReview ? '今天先温习刚才的内容，稳稳地来。' : '已为你降慢速度并缩小练习范围。先练一个动作就好。'}</span></div>}
    <article className="lesson-card">
      <div className="lesson-card-top"><span className="lesson-label"><span className="lesson-label-dot" />今天学什么</span><span className="lesson-tag">{task.section}</span></div>
      <h3>{task.title}</h3><p className="lesson-why">{task.why}</p>
      <div className="lesson-divider" />
      <div className="lesson-label"><span className="lesson-label-dot lesson-label-dot--clay" />跟着做</div>
      <ol className="practice-steps">{visibleSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
      {visibleChords.length > 0 && <div className="lesson-resource"><div className="resource-head"><div><span className="eyebrow">今天会用到</span><h4>和弦指法</h4></div><span className="resource-meta">琴弦从上到下：G · C · E · A</span></div><div className="chord-grid">{visibleChords.map((chord) => <ChordDiagram name={chord} key={chord} />)}</div></div>}
      {task.pattern && <div className="rhythm-panel"><div><span className="eyebrow">四拍一小节</span><h4>轻轻扫过弦</h4></div><div className="rhythm-row">{task.pattern.map((mark, index) => <div className="rhythm-beat" key={`${mark}${index}`}><span className="rhythm-arrow">{mark === '↓' ? <ArrowDown size={20} /> : mark}</span><small>{index + 1}</small></div>)}</div><p>先用手掌拍出节奏，再拿起琴试一次。</p></div>}
      <div className="lesson-success"><CheckCircle2 size={18} /><div><strong>完成标准</strong><p>{successText}</p></div></div>
    </article>
    <Metronome initialBpm={bpm} />
    <div className="practice-footer"><span><LockKeyhole size={14} /> 完成情况由你自己确认</span><button className="button button--primary button--wide" type="button" onClick={onFinish}>完成本次练习 <Check size={17} /></button></div>
  </div>
}

function SongsPage({ progress, onSong, completedSongs }: { progress: UserProgress; onSong: (song: Song) => void; completedSongs: number }) {
  const sorted = [...SONGS].sort((a, b) => {
    const ap = getSongProgress(progress, a); const bp = getSongProgress(progress, b)
    const aRank = ap.completedTaskIds.length ? 0 : 1; const bRank = bp.completedTaskIds.length ? 0 : 1
    return aRank - bRank
  })
  return <div className="page-content">
    <div className="library-intro"><p>挑一首熟悉的歌，慢慢练到能从头弹完。</p><div className="long-goal"><div className="goal-orbit"><Music2 size={18} /></div><div><strong>长远一点的目标</strong><span>完整演奏并弹唱 5 首歌曲</span></div><div className="goal-count"><strong>{completedSongs}</strong><span>/ 5</span></div></div></div>
    <div className="library-heading"><div><span className="eyebrow">现有完整课程</span><h2>从你喜欢的民谣开始</h2></div><span className="library-total">{SONGS.length} 首 <i /> 可学习</span></div>
    <div className="library-list">{sorted.map((song, index) => <SongCard key={song.id} song={song} progress={progress} onClick={() => onSong(song)} featured={index === 0 && !completedSongs} />)}</div>
    <p className="library-footnote"><BookOpen size={15} /> 首版提供 3 首完整课程，之后可以继续添加你喜欢的歌。</p>
  </div>
}

function SongPage({ song, progress, onStart, onPractice, onRoute }: { song: Song; progress: UserProgress; onStart: () => void; onPractice: () => void; onRoute: (route: 'playing' | 'singing') => void }) {
  const item = getSongProgress(progress, song)
  const current = currentTask(song, item)
  const started = Boolean(progress.songs[song.id])
  const lessonsComplete = song.tasks.every((lesson) => item.completedTaskIds.includes(lesson.id))
  return <div className="page-content song-detail-page">
    <div className="detail-hero"><Artwork song={song} large /><div className="detail-meta"><span className="pill">{song.mood}</span><h2>{song.title}</h2><p>{song.artist} <span>·</span> {song.key} <span>·</span> 参考速度 {song.bpm} BPM</p><p className="detail-intro">{song.intro}</p><div className="detail-links"><a href={song.sourceUrl} target="_blank" rel="noreferrer" className="listen-link">去官方平台听原曲 <ExternalLink size={14} /></a><a href={song.scoreUrl} target="_blank" rel="noreferrer" className="listen-link">查看参考曲谱 <ExternalLink size={14} /></a></div></div></div>
    <div className="detail-progress"><div className="detail-progress-head"><div><span className="eyebrow">学习路径</span><h3>从一个和弦，到完整弹唱</h3></div><span>{item.completedTaskIds.length} / {song.tasks.length} 步</span></div><div className="progress-track progress-track--large"><span style={{ width: `${Math.round(item.completedTaskIds.length / song.tasks.length * 100)}%` }} /></div>
      <div className="journey-list">{STAGES.map((stage, index) => {
        const done = item.completedTaskIds.includes(song.tasks[index].id)
        const active = current.stage === index + 1 && !done
        const locked = !done && !active && index > current.stage - 1
        return <div key={stage} className={`journey-item ${done ? 'is-done' : ''} ${active ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`}><span className="journey-icon">{done ? <Check size={15} /> : locked ? <LockKeyhole size={14} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span><div><strong>{stage}</strong><p>{done ? '已经完成' : active ? song.tasks[index].title : locked ? '完成前一步后解锁' : song.tasks[index].title}</p></div>{active && <span className="journey-now">正在这里</span>}</div>
      })}</div>
    </div>
    <div className="route-confirmations"><div className="section-heading"><div><span className="eyebrow">完成后自己确认</span><h3>你已经能从头到尾完成了吗？</h3></div></div>{!lessonsComplete && <p className="route-lock-note"><LockKeyhole size={13} /> 完成八个学习步骤后，这里就可以确认你的完整演奏和弹唱。</p>}<div className="route-checks"><button type="button" disabled={!lessonsComplete && !item.confirmedPlaying} className={item.confirmedPlaying ? 'route-check is-checked' : 'route-check'} onClick={() => onRoute('playing')}><span className="route-check-icon">{item.confirmedPlaying ? <Check size={16} /> : <Guitar size={16} />}</span><span><strong>完整演奏</strong><small>{item.confirmedPlaying ? '已由你确认完成 · 点击可撤销' : '不间断弹完整首器乐部分'}</small></span></button><button type="button" disabled={!lessonsComplete && !item.confirmedSinging} className={item.confirmedSinging ? 'route-check is-checked' : 'route-check'} onClick={() => onRoute('singing')}><span className="route-check-icon">{item.confirmedSinging ? <Check size={16} /> : <AudioLines size={16} />}</span><span><strong>完整弹唱</strong><small>{item.confirmedSinging ? '已由你确认完成 · 点击可撤销' : '边弹伴奏，边唱完整首歌曲'}</small></span></button></div>{item.confirmedPlaying && item.confirmedSinging && <div className="song-done-note"><Sparkles size={16} /> 太好了，《{song.title}》已经完整收进你的曲目里。</div>}</div>
    <div className="detail-actions"><button className="button button--primary" type="button" onClick={started ? onPractice : onStart}>{started ? '继续这一小步' : '从第一步开始'} <ArrowRight size={16} /></button><span>课程以慢速和分段练习，最后回到完整原曲。</span></div>
  </div>
}

function GrowthPage({ progress, completedSongs, masteredChords }: { progress: UserProgress; completedSongs: number; masteredChords: string[] }) {
  const totalCompleted = Object.values(progress.songs).reduce((sum, item) => sum + item.completedTaskIds.length, 0)
  const records = progress.history.slice(0, 8)
  return <div className="page-content growth-page">
    <section className="growth-summary"><div className="growth-summary-copy"><span className="eyebrow">你的练习手记</span><h2>不是一下子变厉害，<br /><em>是每次都多一点。</em></h2><p>这里收着你已经走过的每一步。</p></div><div className="growth-illustration" aria-hidden="true"><Sprout size={48} strokeWidth={1.2} /><span>慢慢生长</span></div></section>
    <div className="stat-grid"><StatCard label="完成的歌曲" value={`${completedSongs}`} unit="首" detail="目标是 5 首" icon={<Music2 size={17} />} /><StatCard label="练习小步" value={`${totalCompleted}`} unit="步" detail="每一步都算数" icon={<CheckCircle2 size={17} />} /><StatCard label="遇见的和弦" value={`${masteredChords.length}`} unit="个" detail={masteredChords.length ? masteredChords.join(' · ') : '从第一个开始'} icon={<Guitar size={17} />} /></div>
    <section className="section-block growth-song-progress"><div className="section-heading"><div><span className="eyebrow">当前曲目</span><h2>三首歌，慢慢来</h2></div></div>{SONGS.map((song) => { const item = getSongProgress(progress, song); const percent = Math.round(item.completedTaskIds.length / song.tasks.length * 100); return <div className="growth-song-row" key={song.id}><Artwork song={song} /><div className="growth-song-info"><div><strong>{song.title}</strong><span>{item.completedTaskIds.length} / {song.tasks.length} 步</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div><span className="growth-percent">{percent}%</span></div> })}</section>
    <section className="section-block timeline"><div className="section-heading"><div><span className="eyebrow">最近练习</span><h2>{records.length ? '每一次都留下了痕迹' : '你的第一条练习记录还在等你'}</h2></div></div>{records.length ? <div className="timeline-list">{records.map((entry) => <div className="timeline-item" key={entry.id}><span className="timeline-dot" /><div className="timeline-body"><div><strong>{entry.taskTitle}</strong><time>{new Date(entry.at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</time></div><p>{findSong(entry.songId)?.title} · {feedbackLabel(entry.feedback)}</p></div></div>)}</div> : <div className="empty-state"><span className="empty-state-icon"><AudioLines size={21} /></span><p>练完第一小步，这里就会出现你的练习手记。</p></div>}</section>
  </div>
}

function StatCard({ label, value, unit, detail, icon }: { label: string; value: string; unit: string; detail: string; icon: ReactNode }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{unit}</small></div><span className="stat-detail">{detail}</span></div>
}

function SettingsPage({ progress, importInput, importMessage, onImportMessage, onExport, onImport, onClear }: { progress: UserProgress; importInput: React.RefObject<HTMLInputElement>; importMessage: string; onImportMessage: (message: string) => void; onExport: () => void; onImport: (file?: File) => void; onClear: () => void }) {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  useEffect(() => {
    const listener = (event: Event) => { event.preventDefault(); setInstallPrompt(event) }
    window.addEventListener('beforeinstallprompt', listener)
    return () => window.removeEventListener('beforeinstallprompt', listener)
  }, [])
  async function install() {
    const promptEvent = installPrompt as (Event & { prompt?: () => Promise<void> }) | null
    await promptEvent?.prompt?.()
    setInstallPrompt(null)
  }
  return <div className="page-content settings-page">
    <section className="settings-intro"><span className="eyebrow">你的数据，只留在你的设备</span><h2>让练习一直<br /><em>保持舒服的样子。</em></h2><p>当前记录约 {progress.history.length} 次练习。导出一份备份，就可以带去另一台设备。</p></section>
    <div className="settings-group"><span className="settings-group-title">数据与备份</span>
      <button className="settings-row" type="button" onClick={onExport}><span className="settings-row-icon"><Download size={18} /></span><span className="settings-row-copy"><strong>导出练习进度</strong><small>保存为 JSON 备份文件</small></span><ChevronRight size={17} /></button>
      <button className="settings-row" type="button" onClick={() => importInput.current?.click()}><span className="settings-row-icon"><Upload size={18} /></span><span className="settings-row-copy"><strong>导入练习进度</strong><small>从另一台设备恢复备份</small></span><ChevronRight size={17} /></button>
      <input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" aria-label="选择拾音进度备份文件" onChange={(event) => { void onImport(event.target.files?.[0]); event.currentTarget.value = '' }} />
      {importMessage && <p className="import-message" role="status">{importMessage}</p>}
      <button className="settings-row settings-row--danger" type="button" onClick={onClear}><span className="settings-row-icon"><RotateCcw size={18} /></span><span className="settings-row-copy"><strong>清空所有练习进度</strong><small>操作无法撤销，建议先导出备份</small></span><ChevronRight size={17} /></button>
    </div>
    <div className="settings-group"><span className="settings-group-title">使用体验</span>
      <div className="settings-row settings-row--static"><span className="settings-row-icon"><Volume2 size={18} /></span><span className="settings-row-copy"><strong>离线练习</strong><small>课程和节拍器可在首次打开后离线使用</small></span><span className="settings-value-pill">已开启</span></div>
      <button className="settings-row" type="button" onClick={() => { if (installPrompt) void install(); else onImportMessage('在浏览器菜单中选择“添加到主屏幕”，即可像 App 一样打开。') }}><span className="settings-row-icon"><Download size={18} /></span><span className="settings-row-copy"><strong>添加到主屏幕</strong><small>把拾音放到桌面，练习时更方便</small></span><ChevronRight size={17} /></button>
    </div>
    <div className="settings-about"><Brand compact /><p>课程中的图示和练习说明为拾音自制，未收录完整歌词或原唱录音。听歌请前往官方音乐平台。</p><span>拾音 v0.1 · 个人练习手册</span></div>
  </div>
}

function ProgressCard({ song, progress, completedSongs }: { song?: Song; progress: ReturnType<typeof getSongProgress> | null; completedSongs: number }) {
  const percent = song && progress ? Math.round(progress.completedTaskIds.length / song.tasks.length * 100) : 0
  return <section className="rail-card rail-progress"><div className="rail-card-head"><span>这段时间</span><span className="rail-leaf"><Sprout size={16} /></span></div><div className="rail-big-stat">{completedSongs}<small> / 5 首</small></div><p>完整演奏并弹唱</p><div className="rail-goal-track"><span style={{ width: `${completedSongs / 5 * 100}%` }} /></div><div className="rail-divider" /><div className="rail-current"><span className="rail-current-kicker">正在靠近</span><strong>{song ? `《${song.title}》` : '第一首歌'}</strong><div className="rail-current-meta"><span>{progress?.completedTaskIds.length ?? 0} 个小步骤</span><span>{percent}%</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div><span className="rail-encouragement">{completedSongs === 0 ? '每一次拿起琴都算开始。' : `你已经完整收下 ${completedSongs} 首歌。`}</span></section>
}

function FeedbackDialog({ onSelect, onClose, taskTitle }: { onSelect: (feedback: TaskFeedback) => void; onClose: () => void; taskTitle: string }) {
  const choices: { feedback: TaskFeedback; title: string; detail: string; Icon: typeof Check }[] = [
    { feedback: 'easy', title: '很顺利', detail: '我可以继续下一步', Icon: Check },
    { feedback: 'hard', title: '有点困难', detail: '下次先温习一下', Icon: RotateCcw },
    { feedback: 'not_mastered', title: '还没掌握', detail: '帮我把练习再拆小', Icon: Sprout },
  ]
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title"><button className="modal-close icon-button" type="button" aria-label="关闭" onClick={onClose}><X size={18} /></button><span className="feedback-spark"><Sparkles size={20} /></span><span className="eyebrow">刚刚完成</span><h2 id="feedback-title">{taskTitle}</h2><p>今天练起来感觉怎么样？</p><div className="feedback-options">{choices.map(({ feedback, title, detail, Icon }) => <button className="feedback-choice" key={feedback} type="button" onClick={() => onSelect(feedback)}><span><Icon size={18} /></span><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={16} /></button>)}</div></section></div>
}

function feedbackLabel(value: TaskFeedback) {
  return value === 'easy' ? '很顺利' : value === 'hard' ? '有点困难' : '还没掌握'
}

export default App
