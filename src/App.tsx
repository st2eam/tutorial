import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, AudioLines, BookOpen, Check, CheckCircle2, ChevronRight,
  Clock3, Download, ExternalLink, Guitar, Home, LockKeyhole, Music2,
  Pause, Play, Plus, RotateCcw, Settings, Shapes, Sparkles, Sprout, Upload, Volume2, X,
} from 'lucide-react'
import { CHORDS, findSong, findTask, getCastleScoreRows, SONGS, STAGES, FINGERSTYLE_STAGES, type ChordName, type Song, type SongKind } from './data/course'
import { CASTLE_SCORE, CASTLE_SCORE_MEASURE_COUNT, CASTLE_SCORE_SOURCE, CASTLE_SCORE_SYSTEMS, type CastleMeasure, type CastleNote, type CastleString } from './data/castle-score'
import { CATEGORIES, findGuidedCourse, findSkill, GUIDED_COURSES, SKILLS, type GuidedCourse } from './data/catalog'
import { getPlaybackNotes, getSimplifiedMeasureIds, getTaskMeasureIds, SCORE_SHEETS, type ScoreMeasure, type ScoreSheet, type UkuleleString } from './data/score-sheets'
import {
  currentGuidedLesson, currentTask, emptyProgress, exportBackup, getGuidedProgress, getSongProgress,
  isGuidedCourseCompleted, isSongCompleted, loadProgress, markSongRoute, recordFeedback,
  recordGuidedFeedback, saveProgress, startGuidedCourse, startSong, validateProgressBackup,
  type TaskFeedback, type UserProgress,
} from './lib/progress'

type Page = 'today' | 'practice' | 'skills' | 'skill' | 'songs' | 'song' | 'guided-course' | 'growth' | 'settings'
const NAV_ITEMS: { id: Page; label: string; Icon: typeof Home }[] = [
  { id: 'today', label: '今日', Icon: Home },
  { id: 'skills', label: '技能', Icon: Shapes },
  { id: 'growth', label: '成长', Icon: Sprout },
  { id: 'settings', label: '设置', Icon: Settings },
]

function setPage(page: Page) {
  window.location.hash = `/${page}`
  window.scrollTo(0, 0)
}

function setRoute(page: Page, id?: string) {
  window.location.hash = `/${page}${id ? `/${encodeURIComponent(id)}` : ''}`
  window.scrollTo(0, 0)
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand--compact' : ''}`}>
    <img className="brand-mark" src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" aria-hidden="true" />
    <span className="brand-name">拾艺</span>
    {!compact && <span className="brand-tagline">今天，只学下一小步</span>}
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

function ChordDiagramGraphic({ name, compact = false }: { name: ChordName; compact?: boolean }) {
  const chord = CHORDS[name]
  const xPositions = compact ? [12, 38, 64, 90] : [30, 58, 86, 114]
  const yStart = compact ? 15 : 31
  const fretGap = compact ? 17 : 22
  const left = compact ? 12 : 30
  const right = compact ? 90 : 114
  const viewBox = compact ? '0 0 102 104' : '0 0 144 150'
  return <svg className={compact ? 'chord-graphic chord-graphic--compact' : 'chord-graphic'} viewBox={viewBox} role="img" aria-label={`${name} 和弦指法图：${chord.hint}`}>
    {xPositions.map((x) => <line key={`s${x}`} x1={x} x2={x} y1={yStart} y2={yStart + fretGap * 4} className="chord-string" />)}
    {[0, 1, 2, 3, 4].map((fret) => <line key={`f${fret}`} x1={left} x2={right} y1={yStart + fret * fretGap} y2={yStart + fret * fretGap} className={fret === 0 ? 'chord-nut' : 'chord-fret'} />)}
    {chord.frets.map((fret, stringIndex) => <text key={`open${stringIndex}`} x={xPositions[stringIndex]} y={compact ? 11 : 22} textAnchor="middle" className="chord-open">{fret === 0 ? '○' : ''}</text>)}
    {chord.frets.map((fret, stringIndex) => fret > 0 ? <g key={`dot${stringIndex}`}>
      <circle cx={xPositions[stringIndex]} cy={yStart + (fret - 0.5) * fretGap} r={compact ? 7 : 7.5} className="chord-dot" />
      <text x={xPositions[stringIndex]} y={yStart + (fret - 0.5) * fretGap + 3} textAnchor="middle" className="chord-finger">{chord.fingers[stringIndex]}</text>
    </g> : null)}
    {['G', 'C', 'E', 'A'].map((stringName, index) => <text key={stringName} x={xPositions[index]} y={compact ? 101 : 139} textAnchor="middle" className="chord-string-name">{stringName}</text>)}
  </svg>
}

function ChordDiagram({ name, onClick, large = false }: { name: ChordName; onClick?: () => void; large?: boolean }) {
  const chord = CHORDS[name]
  const content = <>
    <div className="chord-title"><strong>{name}</strong><span>和弦图</span></div>
    <ChordDiagramGraphic name={name} />
    <p>{chord.hint}</p>
  </>
  if (onClick) return <button className="chord-card" type="button" onClick={onClick} aria-label={`放大查看 ${name} 和弦指法图`}>
    {content}<span className="chord-zoom-label">点按放大</span>
  </button>
  return <div className={`chord-card ${large ? 'chord-card--large' : ''}`}>{content}</div>
}

const SCORE_STRING_ORDER: UkuleleString[] = ['A', 'E', 'C', 'G']
const SCORE_OPEN_MIDI: Record<UkuleleString, number> = { G: 67, C: 60, E: 64, A: 69 }
const UKULELE_HARMONICS = [0, 1, 0.72, 0.48, 0.34, 0.24, 0.17, 0.12, 0.08, 0.05]

function createUkuleleWave(context: AudioContext) {
  return context.createPeriodicWave(new Float32Array(UKULELE_HARMONICS.length), Float32Array.from(UKULELE_HARMONICS))
}

function scheduleUkuleleNote(context: AudioContext, wave: PeriodicWave, frequency: number, start: number, duration: number, volume: number) {
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  oscillator.setPeriodicWave(wave)
  oscillator.frequency.value = frequency
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(5200, start)
  filter.frequency.exponentialRampToValueAtTime(2600, start + Math.max(0.08, Math.min(duration, 0.24)))
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.08, duration * 0.88))
  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + Math.max(0.1, duration * 0.92))
}

function ScoreMeasureGraphic({ measure, sheet, sequenceNumber, onChordClick }: { measure: ScoreMeasure; sheet: ScoreSheet; sequenceNumber: number; onChordClick: (chord: ChordName) => void }) {
  const totalTicks = sheet.timeSignature === '6/8' ? 12 : Number(sheet.timeSignature.split('/')[0]) * 4
  const xForTick = (tick: number) => 82 + (tick / totalTicks) * 500
  const rowForString = (string: UkuleleString) => SCORE_STRING_ORDER.indexOf(string)
  const beatTicks = sheet.timeSignature === '6/8' ? 2 : 4
  const beats = sheet.timeSignature === '6/8' ? 6 : Number(sheet.timeSignature.split('/')[0])
  return <div className="score-measure-card">
    <div className="score-measure-heading"><span>小节 {sequenceNumber}</span><button type="button" onClick={() => onChordClick(measure.chord)} aria-label={`查看 ${measure.chord} 和弦指法`}>{measure.chord}<small>看指法</small></button></div>
    <svg className="score-measure-svg" viewBox="0 0 620 202" role="img" aria-label={`第 ${sequenceNumber} 小节，${measure.chord} 和弦；${measure.notes.filter((note) => note.voice === 'melody').map((note) => `${note.string}弦${note.fret}品`).join('，')}`}>
      {SCORE_STRING_ORDER.map((string, row) => {
        const y = 42 + row * 29
        return <g key={string}><text x="23" y={y + 5} className="score-string-name">{string}</text><line x1="54" x2="594" y1={y} y2={y} className="score-string-line" /></g>
      })}
      {Array.from({ length: beats }, (_, index) => {
        const tick = index * beatTicks
        const x = xForTick(tick)
        return <g key={`beat-${index}`}><line x1={x} x2={x} y1="31" y2="164" className={sheet.timeSignature === '6/8' && index === 3 ? 'score-beat-line is-accent' : 'score-beat-line'} /><text x={x} y="188" textAnchor="middle" className="score-beat-label">{index + 1}</text></g>
      })}
      <line x1="594" x2="594" y1="31" y2="164" className="score-barline" />
      {measure.rests.map((rest, index) => {
        const restGlyph = sheet.timeSignature === '6/8'
          ? rest.duration >= 2 ? '𝄾' : '𝄿'
          : rest.duration >= 4 ? '𝄽' : rest.duration >= 2 ? '𝄾' : '𝄿'
        return <text key={`rest-${rest.voice}-${rest.tick}-${index}`} x={xForTick(rest.tick + rest.duration / 2)} y={rest.voice === 'melody' ? 106 : 178} textAnchor="middle" className="score-rest" aria-label={`${rest.duration} 个细分时值的休止`}>{restGlyph}</text>
      })}
      {measure.notes.map((note, index) => {
        const x = xForTick(note.tick)
        const y = 42 + rowForString(note.string) * 29
        const durationWidth = Math.max(4, xForTick(Math.min(totalTicks, note.tick + note.duration)) - x - 14)
        const tiedNote = note.tieToNext ? measure.notes.find((next) => next.voice === note.voice && next.string === note.string && next.fret === note.fret && next.tick === note.tick + note.duration) : undefined
        const tiedX = tiedNote ? xForTick(tiedNote.tick) : 0
        return <g key={`${note.string}-${note.fret}-${note.tick}-${index}`} className={`score-note score-note--${note.voice}`}>
          {note.duration > beatTicks && <line x1={x + 13} x2={x + 13 + durationWidth} y1={y + 10} y2={y + 10} className="score-note-sustain" />}
          <rect x={x - 13} y={y - 13} width="26" height="25" rx="6" className="score-note-box" />
          <text x={x} y={y + 5} textAnchor="middle" className="score-note-number">{note.fret}</text>
          {tiedNote && <path d={`M ${x + 2} ${y + 14} Q ${(x + tiedX) / 2} ${y + 28} ${tiedX - 2} ${y + 14}`} className="score-note-tie" />}
        </g>
      })}
      {measure.strums.map((strum, index) => {
        const x = xForTick(strum.tick)
        return <g key={`strum-${index}`} className="score-strum"><text x={x} y="175" textAnchor="middle">{strum.direction === 'down' ? '↓' : '↑'}</text></g>
      })}
      <text x="598" y="188" textAnchor="end" className="score-meter-label">{sheet.timeSignature}</text>
    </svg>
  </div>
}

function PracticeScoreCard({ song, task, bpm, simplified, onChordClick }: { song: Song; task: NonNullable<ReturnType<typeof findTask>>; bpm: number; simplified: boolean; onChordClick: (chord: ChordName) => void }) {
  const sheet = SCORE_SHEETS[song.id]
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(() => window.matchMedia('(max-width: 767px)').matches ? 1 : 2)
  const [autoFlip, setAutoFlip] = useState(false)
  const [playing, setPlaying] = useState(false)
  const measureIds = simplified ? getSimplifiedMeasureIds(sheet, task.stage) : getTaskMeasureIds(sheet, task.stage)
  const pages = useMemo(() => {
    const groups: string[][] = []
    for (let index = 0; index < measureIds.length; index += pageSize) groups.push(measureIds.slice(index, index + pageSize))
    return groups.length ? groups : [[]]
  }, [measureIds.join('|'), pageSize])
  const currentPage = Math.min(pageIndex, pages.length - 1)
  const currentIds = pages[currentPage]
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setPageSize(query.matches ? 1 : 2)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => { setPageIndex(0); setAutoFlip(false) }, [task.id, simplified])
  useEffect(() => {
    if (!autoFlip || pages.length < 2) return
    const quarterNotes = sheet.timeSignature === '6/8' ? 3 : Number(sheet.timeSignature.split('/')[0]) * 4 / Number(sheet.timeSignature.split('/')[1])
    const beatsPerBar = quarterNotes / (sheet.tempoUnit === 'dotted-quarter' ? 1.5 : 1)
    const secondsPerBar = beatsPerBar * 60 / bpm
    const timer = window.setTimeout(() => {
      if (currentPage >= pages.length - 1) setAutoFlip(false)
      else setPageIndex(currentPage + 1)
    }, Math.max(700, secondsPerBar * currentIds.length * 1000))
    return () => window.clearTimeout(timer)
  }, [autoFlip, bpm, currentIds.length, currentPage, pages.length, sheet.tempoUnit, sheet.timeSignature])

  function playCurrentPage() {
    if (!('AudioContext' in window)) return
    const context = new AudioContext()
    const ukuleleWave = createUkuleleWave(context)
    void context.resume()
    const ticksPerBar = sheet.timeSignature === '6/8' ? 12 : Number(sheet.timeSignature.split('/')[0]) * 4
    const tickSeconds = 60 / bpm / (sheet.tempoUnit === 'dotted-quarter' ? 6 : 4)
    const tone = (string: UkuleleString, fret: number, tick: number, duration: number, stagger = 0) => {
      const start = context.currentTime + tick * tickSeconds + stagger
      const frequency = 440 * 2 ** ((SCORE_OPEN_MIDI[string] + fret - 69) / 12)
      scheduleUkuleleNote(context, ukuleleWave, frequency, start, duration * tickSeconds, 0.13)
    }
    currentIds.forEach((id, measureIndex) => {
      const measure = sheet.measures[id]
      const chord = CHORDS[measure.chord].frets
      measure.strums.forEach((strum) => {
        const order = strum.direction === 'down' ? [0, 1, 2, 3] : [3, 2, 1, 0]
        order.forEach((stringIndex, index) => tone(SCORE_STRING_ORDER[3 - stringIndex], chord[stringIndex], measureIndex * ticksPerBar + strum.tick, 3, index * 0.018))
      })
    })
    getPlaybackNotes(sheet, currentIds).forEach((note) => tone(note.string, note.fret, note.absoluteTick, note.duration))
    setPlaying(true)
    const totalBars = currentIds.length
    const quarterNotes = sheet.timeSignature === '6/8' ? 3 : Number(sheet.timeSignature.split('/')[0]) * 4 / Number(sheet.timeSignature.split('/')[1])
    const beatsPerBar = quarterNotes / (sheet.tempoUnit === 'dotted-quarter' ? 1.5 : 1)
    const duration = beatsPerBar * 60 / bpm * totalBars * 1000 + 300
    window.setTimeout(() => { setPlaying(false); void context.close() }, duration)
  }

  return <section className="practice-score-card" aria-label={`${song.title}站内教学谱`}>
    <div className="practice-score-head"><div><span className="eyebrow">谱卡 · 拾艺教学编配</span><h4>今天练这段</h4></div><span>{sheet.timeSignature} · {bpm} 教学 BPM{sheet.tempoUnit === 'dotted-quarter' ? '（附点四分音符）' : ''}</span></div>
    <p className="practice-score-help">TAB 从上到下是 A、E、C、G 弦；数字是品位，0 是空弦。竖线数字是拍数；同一拍的数字一起拨。右手拇指拨 G、C 弦，食指拨 E 弦，中指拨 A 弦。</p>
    <p className="score-review-note">旋律音型是拾艺教学编配，尚未逐音核实为参考谱旋律；本谱中的休止和延音用于教学节奏练习。</p>
    <div className="practice-score-pages">{currentIds.map((id, index) => <ScoreMeasureGraphic key={`${id}-${currentPage}-${index}`} measure={sheet.measures[id]} sheet={sheet} sequenceNumber={currentPage * pageSize + index + 1} onChordClick={onChordClick} />)}</div>
    <div className="practice-score-controls">
      <button className="button button--secondary" type="button" onClick={() => setPageIndex(Math.max(0, currentPage - 1))} disabled={currentPage === 0}><ArrowLeft size={15} />上一页</button>
      <span className="score-page-count" aria-live="polite">第 {currentPage + 1} / {pages.length} 段</span>
      <button className="button button--secondary" type="button" onClick={() => setPageIndex(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage >= pages.length - 1}>下一页<ArrowRight size={15} /></button>
    </div>
    {pages.length > 1 && <button className="button button--quiet score-autoflip" type="button" onClick={() => setAutoFlip((value) => !value)}>{autoFlip ? <Pause size={15} /> : <Play size={15} />}{autoFlip ? '暂停自动翻页' : '按节拍自动翻页'}</button>}
    <button className="button button--quiet score-preview" type="button" onClick={playCurrentPage} disabled={playing}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? '正在试听这段' : '试听当前谱段'}</button>
    <p className="practice-score-legend"><span><i className="score-legend-dot score-legend-dot--melody" />旋律</span><span><i className="score-legend-dot score-legend-dot--harmony" />伴奏音</span><span>↓ 下扫 · ↑ 上扫</span><span>左手 1 食指 · 2 中指 · 3 无名指 · 4 小指</span></p>
  </section>
}

type CastleScoreMode = 'practice' | 'complete' | 'symbols'

const CASTLE_STRING_Y: Record<CastleString, number> = { A: 42, E: 66, C: 90, G: 114 }

function CastleScoreSystem({ measures, row }: { measures: CastleMeasure[]; row: number }) {
  const measureWidth = measures.length === 1 ? 560 : 324
  const left = 38
  const width = left + measures.length * measureWidth + 8
  const lastBar = measures[measures.length - 1]?.number
  const eventPositions = measures.map((bar, barIndex) => bar.events.map((event) => ({
    event,
    barIndex,
    x: left + barIndex * measureWidth + 36 + event.tick / 16 * (measureWidth - 62),
  })))
  const allEvents = eventPositions.flat()
  const measureX = (index: number) => left + index * measureWidth
  return <figure className="castle-score-row">
    <figcaption><span>第 {row} 行</span><strong>小节 {measures[0]?.number}–{lastBar}</strong></figcaption>
    <div className="castle-score-scroll">
      <svg className="castle-score-svg" viewBox={`0 0 ${width} 176`} role="img" aria-label={`TAB 第 ${measures[0]?.number} 至 ${lastBar} 小节`}>
        {[42, 66, 90, 114].map((y) => <line key={y} className="castle-score-staff" x1={left} y1={y} x2={width - 8} y2={y} />)}
        {measures.map((bar, index) => <g key={bar.number}>
          <line className="castle-score-barline" x1={measureX(index)} y1="42" x2={measureX(index)} y2="114" />
          <text className="castle-score-bar-number" x={measureX(index) + 13} y="25">{bar.number}</text>
          {index === 0 && <g className="castle-score-tab-mark"><text x="4" y="58">T</text><text x="4" y="82">A</text><text x="4" y="106">B</text></g>}
          {index === 0 && bar.number === 1 && <g className="castle-score-meter"><text x={measureX(index) + 12} y="72">4</text><text x={measureX(index) + 12} y="96">4</text></g>}
        </g>)}
        <line className="castle-score-barline" x1={width - 8} y1="42" x2={width - 8} y2="114" />
        {allEvents.map(({ event, x, barIndex }, index) => {
          const before = allEvents[index - 1]?.event
          const after = allEvents[index + 1]?.event
          const tieTo = event.slurAfter ? allEvents.slice(index + 1).find(({ event: next }) => next.notes.some((note) => note.string === event.slurAfter)) : undefined
          const hasBeam = event.duration === 2 && after?.duration === 2 && allEvents[index + 1]?.barIndex === barIndex
          const previousBeam = event.duration === 2 && before?.duration === 2 && allEvents[index - 1]?.barIndex === barIndex
          const beamEnd = hasBeam ? allEvents[index + 1].x : x
          const topY = event.notes.length ? Math.min(...event.notes.map(({ string }) => CASTLE_STRING_Y[string])) : 62
          const bottomY = event.notes.length ? Math.max(...event.notes.map(({ string }) => CASTLE_STRING_Y[string])) : 112
          const arpPath = `M ${x - 10} ${topY - 13} C ${x - 3} ${topY - 7}, ${x - 3} ${topY - 2}, ${x - 10} ${topY + 4} C ${x - 17} ${topY + 10}, ${x - 17} ${topY + 15}, ${x - 10} ${topY + 21} C ${x - 3} ${topY + 27}, ${x - 3} ${topY + 32}, ${x - 10} ${topY + 38} C ${x - 17} ${topY + 44}, ${x - 17} ${topY + 49}, ${x - 10} ${bottomY + 12}`
          return <g key={`${x}-${index}`}>
            {event.rest && <path className="castle-score-rest" d={`M ${x} 57 q 10 -8 3 0 l -5 5 q -5 5 4 6 l 6 2 q 5 2 1 7 l -7 8 q -3 4 3 8`} />}
            {event.arpeggio && <path className="castle-score-arpeggio" d={arpPath} />}
            {event.notes.map(({ string, fret }, noteIndex) => <text key={`${string}-${noteIndex}`} className="castle-score-fret" x={x} y={CASTLE_STRING_Y[string] + 7} textAnchor="middle">{fret}</text>)}
            {!event.rest && <line className="castle-score-stem" x1={x} y1={topY + 11} x2={x} y2="150" />}
            {event.duration === 2 && !hasBeam && !previousBeam && <path className="castle-score-flag" d={`M ${x} 147 q 13 3 6 14`} />}
            {hasBeam && !previousBeam && <rect className="castle-score-beam" x={x} y="149" width={Math.max(8, beamEnd - x)} height="5" />}
            {tieTo && event.slurAfter && <path className="castle-score-slur" d={`M ${x + 3} ${CASTLE_STRING_Y[event.slurAfter] + 7} Q ${(x + tieTo.x) / 2} ${CASTLE_STRING_Y[event.slurAfter] + 24} ${tieTo.x - 3} ${CASTLE_STRING_Y[event.slurAfter] + 7}`} />}
          </g>
        })}
      </svg>
    </div>
  </figure>
}

function CastleScoreViewer({ song, task, bpm, simplified }: { song: Song; task: NonNullable<ReturnType<typeof findTask>>; bpm: number; simplified: boolean }) {
  const [mode, setMode] = useState<CastleScoreMode>('practice')
  const [pageSize, setPageSize] = useState(() => window.matchMedia('(max-width: 767px)').matches ? 1 : 2)
  const [pageIndex, setPageIndex] = useState(0)
  const [autoFlip, setAutoFlip] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)
  const stopTimerRef = useRef<number | null>(null)
  const autoFlipTransitionRef = useRef(false)
  const [flipEpoch, setFlipEpoch] = useState(0)
  const selectedRows = getCastleScoreRows(task.stage, simplified)
  const rowLabel = (firstBar: number, lastBar: number) => firstBar === lastBar ? `第 ${firstBar} 小节` : `第 ${firstBar}–${lastBar} 小节`
  const activeRange = selectedRows.map(({ firstBar, lastBar }) => rowLabel(firstBar, lastBar)).join('、')
  const scoreRows = mode === 'complete'
    ? CASTLE_SCORE_SYSTEMS.map((row) => ({ ...row, measures: CASTLE_SCORE.filter((bar) => bar.number >= row.firstBar && bar.number <= row.lastBar) }))
    : selectedRows.map((row) => ({ ...row, measures: CASTLE_SCORE.filter((bar) => bar.number >= row.firstBar && bar.number <= row.lastBar) }))
  const pages = useMemo(() => scoreRows.flatMap(({ row, measures }) => {
    const rowPages: { row: number; measures: CastleMeasure[] }[] = []
    for (let index = 0; index < measures.length; index += pageSize) rowPages.push({ row, measures: measures.slice(index, index + pageSize) })
    return rowPages
  }), [scoreRows.map(({ row, measures }) => `${row}:${measures.map((measure) => measure.number).join(',')}`).join('|'), pageSize])
  const currentPage = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const currentMeasures = pages[currentPage]?.measures ?? []
  const firstMeasure = currentMeasures[0]?.number ?? 1
  const lastMeasure = currentMeasures[currentMeasures.length - 1]?.number ?? firstMeasure
  const displayRange = mode === 'complete' ? '第 1–24 小节' : activeRange

  function stopPlayback() {
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current)
    stopTimerRef.current = null
    void audioRef.current?.close()
    audioRef.current = null
    setPlaying(false)
  }

  function previewPage() {
    if (playing) {
      stopPlayback()
      return
    }
    if (!('AudioContext' in window) || currentMeasures.length === 0) return
    const context = new AudioContext()
    const ukuleleWave = createUkuleleWave(context)
    audioRef.current = context
    void context.resume()
    const openMidi: Record<CastleString, number> = { G: 67, C: 60, E: 64, A: 69 }
    const secondsPerTick = 60 / bpm / 4
    const playbackMeasures = autoFlip
      ? pages.slice(currentPage).flatMap((page) => page.measures)
      : currentMeasures
    const events = playbackMeasures.flatMap((measure, measureIndex) => measure.events.map((event, eventIndex) => ({
      event,
      eventIndex,
      measureIndex,
      tick: measureIndex * 16 + event.tick,
    })))
    const tiedNotes = new Set<string>()
    const makeKey = (measureIndex: number, eventIndex: number, string: CastleString) => `${measureIndex}:${eventIndex}:${string}`
    const scheduleTone = (note: CastleNote, event: CastleScoreEventRef, noteIndex: number, durationTicks: number) => {
      const stagger = event.event.arpeggio ? noteIndex * 0.028 : 0
      const start = context.currentTime + event.tick * secondsPerTick + stagger
      const frequency = 440 * 2 ** ((openMidi[note.string] + note.fret - 69) / 12)
      scheduleUkuleleNote(context, ukuleleWave, frequency, start, durationTicks * secondsPerTick, 0.12)
    }
    events.forEach((entry, entryIndex) => {
      entry.event.notes.forEach((note, noteIndex) => {
        if (tiedNotes.has(makeKey(entry.measureIndex, entry.eventIndex, note.string))) return
        let durationTicks = entry.event.duration
        let tieFrom = entry
        let tieEntryIndex = entryIndex
        let tied = false
        while (tieFrom.event.slurAfter) {
          const nextIndex = events.findIndex((candidate, candidateIndex) => candidateIndex > tieEntryIndex
            && candidate.event.notes.some((candidateNote) => candidateNote.string === tieFrom.event.slurAfter
              && candidateNote.string === note.string && candidateNote.fret === note.fret))
          if (nextIndex < 0) break
          const next = events[nextIndex]
          const target = next.event.notes.find((candidateNote) => candidateNote.string === note.string && candidateNote.fret === note.fret)
          if (!target) break
          tiedNotes.add(makeKey(next.measureIndex, next.eventIndex, note.string))
          durationTicks = next.tick + next.event.duration - entry.tick
          tieFrom = next
          tieEntryIndex = nextIndex
          tied = true
          if (!next.event.slurAfter) break
        }
        scheduleTone(note, entry, noteIndex, durationTicks)
        if (tied) tiedNotes.add(makeKey(entry.measureIndex, entry.eventIndex, note.string))
      })
    })
    setPlaying(true)
    stopTimerRef.current = window.setTimeout(() => {
      setPlaying(false)
      void context.close()
      if (audioRef.current === context) audioRef.current = null
      stopTimerRef.current = null
    }, playbackMeasures.length * 4 * 60000 / bpm + 180)
    if (autoFlip) setFlipEpoch((epoch) => epoch + 1)
  }

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setPageSize(query.matches ? 1 : 2)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => { setPageIndex(0); setAutoFlip(false); stopPlayback() }, [task.id, simplified, mode, pageSize])
  useEffect(() => {
    if (!autoFlip || pages.length < 2) return
    const timer = window.setTimeout(() => {
      if (currentPage >= pages.length - 1) setAutoFlip(false)
      else {
        autoFlipTransitionRef.current = true
        setPageIndex(currentPage + 1)
      }
    }, Math.max(800, currentMeasures.length * 4 * 60000 / bpm))
    return () => window.clearTimeout(timer)
  }, [autoFlip, bpm, currentMeasures.length, currentPage, flipEpoch, pages.length])
  useEffect(() => {
    if (autoFlipTransitionRef.current) autoFlipTransitionRef.current = false
    else stopPlayback()
  }, [currentPage])
  useEffect(() => () => {
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current)
    void audioRef.current?.close()
  }, [])

  return <section className="practice-score-card castle-score-card" aria-label={`${song.title}自绘 TAB 谱`}>
    <div className="practice-score-head"><div><span className="eyebrow">网页绘制 TAB · {CASTLE_SCORE_SOURCE.attribution}</span><h4>{mode === 'complete' ? '完整 24 小节' : mode === 'symbols' ? '节奏与演奏记号' : '本步练习位置'}</h4></div><span>4/4 · {bpm} 教学 BPM（参考约 92）</span></div>
    <p className="practice-score-help">谱面由网页中的文字、线条和记号绘制。弦从上到下为 A、E、C、G；数字表示品位，0 表示空弦。当前显示：{displayRange}。</p>
    <div className="castle-score-toolbar">
      <div className="castle-score-tabs" role="tablist" aria-label="琴谱查看方式">
        <button type="button" role="tab" aria-selected={mode === 'practice'} className={mode === 'practice' ? 'is-active' : ''} onClick={() => setMode('practice')}>本步练习</button>
        <button type="button" role="tab" aria-selected={mode === 'complete'} className={mode === 'complete' ? 'is-active' : ''} onClick={() => setMode('complete')}>完整谱</button>
        <button type="button" role="tab" aria-selected={mode === 'symbols'} className={mode === 'symbols' ? 'is-active' : ''} onClick={() => setMode('symbols')}>记号说明</button>
      </div>
    </div>
    <div className="castle-score-rows">
      {currentMeasures.length > 0 && <CastleScoreSystem key={`${pages[currentPage]?.row}-${firstMeasure}`} row={pages[currentPage]?.row ?? 1} measures={currentMeasures} />}
    </div>
    <div className="practice-score-controls">
      <button className="button button--secondary" type="button" onClick={() => setPageIndex(Math.max(0, currentPage - 1))} disabled={currentPage === 0}><ArrowLeft size={15} />上一页</button>
      <span className="score-page-count" aria-live="polite">第 {firstMeasure}{firstMeasure !== lastMeasure ? `–${lastMeasure}` : ''} / 24 小节 · 第 {currentPage + 1} / {pages.length} 页</span>
      <button className="button button--secondary" type="button" onClick={() => setPageIndex(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage >= pages.length - 1}>下一页<ArrowRight size={15} /></button>
    </div>
    {pages.length > 1 && <button className="button button--quiet score-autoflip" type="button" onClick={() => { if (playing) stopPlayback(); setAutoFlip((value) => !value) }}>{autoFlip ? <Pause size={15} /> : <Play size={15} />}{autoFlip ? '暂停自动翻页' : '按节拍自动翻页'}</button>}
    <button className="button button--quiet score-preview" type="button" onClick={previewPage}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? '停止试听' : autoFlip ? '试听本页及后续页' : '试听当前页'}</button>
    {mode === 'symbols' && <div className="castle-score-symbols" aria-label="谱面记号说明">
      <span><b>0</b> 空弦；其他数字为品位</span>
      <span><i className="castle-symbol-arpeggio" aria-hidden="true" />竖向波浪线：琶音</span>
      <span><i className="castle-symbol-beam" aria-hidden="true" />粗横线：八分音符连梁</span>
      <span><i className="castle-symbol-rest" aria-hidden="true">⌁</i>休止符</span>
      <span><i className="castle-symbol-slur" aria-hidden="true" />弧线：连音线</span>
    </div>}
    <div className="castle-score-footer"><span>{CASTLE_SCORE_MEASURE_COUNT} 小节 · High-G · 全部记号为网页绘制</span><a href={song.scoreUrl} target="_blank" rel="noreferrer">查看来源与署名 <ExternalLink size={14} /></a></div>
  </section>
}

type CastleScoreEventRef = { event: CastleMeasure['events'][number]; eventIndex: number; measureIndex: number; tick: number }

function Metronome({ initialBpm, timeSignature, tempoUnit = 'quarter' }: { initialBpm: number; timeSignature: Song['timeSignature']; tempoUnit?: ScoreSheet['tempoUnit'] }) {
  const [bpm, setBpm] = useState(initialBpm)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(0)
  const audioRef = useRef<AudioContext | null>(null)
  const beatRef = useRef(0)
  const enabled = typeof window !== 'undefined' && 'AudioContext' in window
  const compoundMeter = timeSignature === '6/8' && tempoUnit === 'dotted-quarter'
  const clickCount = compoundMeter ? 2 : timeSignature === '6/8' ? 6 : Number(timeSignature.split('/')[0])
  const beatCount = timeSignature === '6/8' ? 6 : Number(timeSignature.split('/')[0])
  const accents = compoundMeter ? [0] : timeSignature === '6/8' ? [0, 3] : [0]

  useEffect(() => {
    if (!running || !enabled) return
    const context = audioRef.current ?? new AudioContext()
    audioRef.current = context
    void context.resume()
    const tick = () => {
      const currentBeat = beatRef.current % clickCount
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = accents.includes(currentBeat) ? 1000 : 700
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(accents.includes(currentBeat) ? 0.22 : 0.12, context.currentTime + 0.008)
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
  }, [bpm, beatCount, clickCount, compoundMeter, enabled, running])

  return <section className="metronome" aria-label="节拍器">
    <div className="metronome-head"><div><span className="eyebrow">练习工具</span><h3>节拍器</h3>{compoundMeter && <small>6/8 · 每小节 2 个附点四分拍</small>}</div><Volume2 size={19} aria-hidden="true" /></div>
    <div className="beat-dots" aria-label={compoundMeter ? `当前第 ${beat + 1} 个附点四分音符强拍，6/8 每小节两拍` : `当前拍点 ${beat + 1}，${timeSignature}循环`}>{Array.from({ length: beatCount }, (_, item) => <span className={`${running && beat === (compoundMeter ? item / 3 : item) && (!compoundMeter || item % 3 === 0) ? 'beat-dot beat-dot--active' : 'beat-dot'} ${accents.includes(item) || (compoundMeter && item % 3 === 0) ? 'beat-dot--accent' : ''}`} key={item} />)}</div>
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
  const done = isSongCompleted(song, item)
  const percent = Math.round(item.completedTaskIds.length / song.tasks.length * 100)
  const status = done ? '已完成' : item.completedTaskIds.length ? '进行中' : '待开始'
  return <button className={`song-card ${featured ? 'song-card--featured' : ''}`} type="button" onClick={onClick}>
    <Artwork song={song} large={featured} />
    <div className="song-card-content">
      <div className="song-title-row"><div><h3>{song.title}</h3><p>{song.artist} <span>·</span> {song.mood}</p></div>{featured && <span className="pill pill--recommend">推荐起点</span>}</div>
      <p className="song-description">{song.intro}</p>
      <div className="chord-chips">{song.kind === 'fingerstyle' ? <span>High-G · 指弹独奏</span> : song.chords.slice(0, 6).map((chord) => <span key={chord}>{chord}</span>)}</div>
      <div className="song-card-foot"><span>{status}</span><span>{item.completedTaskIds.length ? `${percent}% 完成` : song.fit}</span><ChevronRight size={17} aria-hidden="true" /></div>
      <div className="progress-track" aria-label={`${song.title}课程进度 ${percent}%`}><span style={{ width: `${percent}%` }} /></div>
    </div>
  </button>
}

function App() {
  const initialRoute = readRoute()
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress())
  const [page, setCurrentPage] = useState<Page>(initialRoute.page)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(() => initialRoute.page === 'song' ? initialRoute.id ?? null : findSong(loadProgress().activeCourseId)?.id ?? null)
  const [selectedSkillId, setSelectedSkillId] = useState(initialRoute.page === 'skill' ? initialRoute.id ?? 'ukulele' : 'ukulele')
  const [selectedGuidedCourseId, setSelectedGuidedCourseId] = useState<string | null>(() => initialRoute.page === 'guided-course' ? initialRoute.id ?? null : null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [toast, setToast] = useState('')
  const [updateReady, setUpdateReady] = useState(false)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => {
      const route = readRoute()
      setCurrentPage(route.page)
      window.scrollTo(0, 0)
      if (route.page === 'song') setSelectedSongId(route.id ?? null)
      if (route.page === 'skill') setSelectedSkillId(route.id ?? 'ukulele')
      if (route.page === 'guided-course') setSelectedGuidedCourseId(route.id ?? null)
    }
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

  const activeSong = findSong(progress.activeCourseId)
  const activeGuidedCourse = findGuidedCourse(progress.activeCourseId)
  const selectedSong = findSong(selectedSongId)
  const activeSongProgress = activeSong ? getSongProgress(progress, activeSong) : null
  const activeGuidedProgress = activeGuidedCourse ? getGuidedProgress(progress, activeGuidedCourse) : null
  const task = activeSong && activeSongProgress ? currentTask(activeSong, activeSongProgress) : undefined
  const guidedLesson = activeGuidedCourse && activeGuidedProgress ? currentGuidedLesson(activeGuidedCourse, activeGuidedProgress) : undefined
  const selectedGuidedCourse = findGuidedCourse(selectedGuidedCourseId)
  const completedSongs = SONGS.filter((song) => {
    const item = getSongProgress(progress, song)
    return isSongCompleted(song, item)
  })
  const masteredChords = useMemo(() => [...new Set(progress.history.filter((entry) => entry.feedback !== 'not_mastered').flatMap((entry) => findSong(entry.courseId)?.tasks.find((lesson) => lesson.id === entry.taskId)?.chords ?? []))], [progress.history])

  function update(mutator: (data: UserProgress) => UserProgress) {
    setProgress((current) => mutator(current))
  }

  function beginSong(song: Song) {
    setSelectedSongId(song.id)
    update((current) => startSong(current, song))
    setPage('today')
  }

  function beginGuidedCourse(course: GuidedCourse) {
    setSelectedGuidedCourseId(course.id)
    update((current) => startGuidedCourse(current, course))
    setPage('today')
  }

  function submitFeedback(value: TaskFeedback) {
    if (activeSong) update((current) => recordFeedback(current, activeSong, value))
    else if (activeGuidedCourse) update((current) => recordGuidedFeedback(current, activeGuidedCourse, value))
    else return
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
    anchor.download = `shiyi-progress-${new Date().toISOString().slice(0, 10)}.json`
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
    if (!window.confirm('确定清空所有学习进度吗？这个操作无法撤销。建议先导出备份。')) return
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

  const hasStarted = Boolean(activeSong || activeGuidedCourse)
  const onSongCard = (song: Song) => {
    setSelectedSongId(song.id)
    setRoute('song', song.id)
  }
  const onSkill = (skillId: string) => {
    setSelectedSkillId(skillId)
    setRoute('skill', skillId)
  }
  const onGuidedCourse = (course: GuidedCourse) => {
    setSelectedGuidedCourseId(course.id)
    setRoute('guided-course', course.id)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-rule" />
      <span className="nav-caption">我的学习</span>
      <Navigation page={page} onSkills={() => setPage('skills')} />
      <div className="sidebar-bottom">
        <div className="sidebar-note"><AudioLines size={17} /><span>慢一点，也在前进</span></div>
        <p>拾艺 · 技能学习手册</p>
      </div>
    </aside>

    <div className="mobile-topbar"><Brand compact /><span className={`network-state ${online ? '' : 'network-state--offline'}`}><i />{online ? '已准备好' : '离线练习'}</span></div>

    <main className="main-layout">
      <div className="main-column">
        <header className="page-topline">
          <div><span className="eyebrow">{pageLabel(page)}</span><h1>{pageTitle(page, activeSong, selectedSong, selectedGuidedCourse, activeGuidedCourse)}</h1></div>
          <div className={`network-state network-state--desktop ${online ? '' : 'network-state--offline'}`}><i />{online ? '内容已就绪' : '离线可练习'}</div>
        </header>

        {page === 'today' && activeSong && activeSongProgress && task && <><TodayPage song={activeSong} item={activeSongProgress} task={task} onContinue={() => setPage(activeSongProgress.completedTaskIds.length >= activeSong.tasks.length ? 'song' : 'practice')} onSongs={() => setPage('skills')} /><InProgressList progress={progress} activeCourseId={activeSong.id} onSong={onSongCard} onGuided={onGuidedCourse} /></>}
        {page === 'today' && activeGuidedCourse && activeGuidedProgress && guidedLesson && <><GuidedTodayPage course={activeGuidedCourse} item={activeGuidedProgress} lesson={guidedLesson} onContinue={() => setPage('practice')} onSkills={() => setPage('skills')} /><InProgressList progress={progress} activeCourseId={activeGuidedCourse.id} onSong={onSongCard} onGuided={onGuidedCourse} /></>}
        {page === 'today' && !hasStarted && <><TodayEmptyPage onSkills={() => setPage('skills')} /><InProgressList progress={progress} activeCourseId={null} onSong={onSongCard} onGuided={onGuidedCourse} /></>}
        {page === 'practice' && activeSong && activeSongProgress && task && <PracticePage song={activeSong} task={task} item={activeSongProgress} onBack={() => setPage('today')} onFinish={() => setFeedbackOpen(true)} />}
        {page === 'practice' && activeGuidedCourse && activeGuidedProgress && guidedLesson && <GuidedLessonPage course={activeGuidedCourse} item={activeGuidedProgress} lesson={guidedLesson} onBack={() => setPage('today')} onFinish={() => setFeedbackOpen(true)} />}
        {page === 'practice' && !hasStarted && <TodayEmptyPage onSkills={() => setPage('skills')} />}
        {page === 'skills' && <SkillsPage onSkill={onSkill} />}
        {page === 'skill' && selectedSkillId === 'ukulele' && <><SkillIntro onSongs={() => setPage('songs')} /><SongsPage progress={progress} onSong={onSongCard} completedSongs={completedSongs.length} /></>}
        {page === 'skill' && selectedSkillId !== 'ukulele' && <GuidedCoursesPage skill={findSkill(selectedSkillId)} onCourse={onGuidedCourse} />}
        {page === 'songs' && <SongsPage progress={progress} onSong={onSongCard} completedSongs={completedSongs.length} />}
        {page === 'song' && selectedSong && <SongPage song={selectedSong} progress={progress} onStart={() => beginSong(selectedSong)} onPractice={() => { beginSong(selectedSong); setPage('practice') }} onRoute={(route) => update((current) => markSongRoute(current, selectedSong, route))} />}
        {page === 'song' && !selectedSong && <SongsPage progress={progress} onSong={onSongCard} completedSongs={completedSongs.length} />}
        {page === 'guided-course' && selectedGuidedCourse && <GuidedCoursePage course={selectedGuidedCourse} progress={progress} onStart={() => beginGuidedCourse(selectedGuidedCourse)} onPractice={() => { beginGuidedCourse(selectedGuidedCourse); setPage('practice') }} />}
        {page === 'guided-course' && !selectedGuidedCourse && <GuidedCoursesPage skill={findSkill(selectedSkillId)} onCourse={onGuidedCourse} />}
        {page === 'growth' && <GrowthPage progress={progress} completedSongs={completedSongs.length} masteredChords={masteredChords} />}
        {page === 'settings' && <SettingsPage progress={progress} importInput={importInput} importMessage={importMessage} onImportMessage={setImportMessage} onExport={downloadProgress} onImport={importProgress} onClear={clearProgress} />}
      </div>
      <aside className="right-rail">
        {activeSong && activeSongProgress && <ProgressCard song={activeSong} progress={activeSongProgress} completedSongs={completedSongs.length} />}
        {!activeSong && <LearningSummaryCard progress={progress} />}
        <div className="rail-quote"><span className="quote-mark">“</span><p>{activeSong ? '音乐不是赶路，是慢慢走进一段旋律。' : '今天学会的一点点，会慢慢变成你的本领。'}</p><span>给今天的你</span></div>
        {page !== 'practice' && activeSong && <a className="rail-link" href={activeSong.sourceUrl ?? activeSong.scoreUrl} target="_blank" rel="noreferrer">{activeSong.neteaseTrackId ? '去网易云听原曲' : '查看参考来源'} <ExternalLink size={14} /></a>}
      </aside>
    </main>

    <nav className="bottom-nav" aria-label="主导航">{NAV_ITEMS.map(({ id, label, Icon }) => <button key={id} type="button" className={page === id || (id === 'skills' && ['skill', 'songs', 'song', 'guided-course'].includes(page)) ? 'bottom-nav-item is-active' : 'bottom-nav-item'} onClick={() => setPage(id)}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></button>)}</nav>

    {feedbackOpen && (activeSong || activeGuidedCourse) && <FeedbackDialog onSelect={submitFeedback} onClose={() => setFeedbackOpen(false)} taskTitle={task?.title ?? guidedLesson?.title ?? ''} />}
    {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    {updateReady && <div className="update-toast" role="status"><span>拾艺有一个小更新，准备好了。</span><button type="button" onClick={() => void applyUpdate()}>现在更新</button></div>}
  </div>
}

function readRoute(): { page: Page; id?: string } {
  const [rawPage, rawId] = window.location.hash.replace('#/', '').split('/')
  if (rawPage === 'songs') return { page: 'skill', id: 'ukulele' }
  const page = (['today', 'practice', 'skills', 'skill', 'songs', 'song', 'guided-course', 'growth', 'settings'] as string[]).includes(rawPage) ? rawPage as Page : 'today'
  return { page, id: rawId ? decodeURIComponent(rawId) : undefined }
}

function pageLabel(page: Page) {
  return ({ today: '你的学习节奏', practice: '专注学习', skills: '技能合集', skill: '技能课程', songs: '尤克里里课程', song: '歌曲学习地图', 'guided-course': '学习课程', growth: '慢慢积累', settings: '学习空间' })[page]
}
function pageTitle(page: Page, active?: Song, selected?: Song, guided?: GuidedCourse, activeGuided?: GuidedCourse) {
  return ({ today: active || activeGuided ? '今天，继续一点点' : '今天，学一点什么？', practice: '把这一小步练熟', skills: '从一项感兴趣的技能开始', skill: '从基础开始，慢慢深入', songs: '想学的歌，都在这里', song: selected?.title ?? active?.title ?? '歌曲学习地图', 'guided-course': guided?.title ?? '开始一门新课程', growth: '每一次练习都算数', settings: '让学习更顺手' })[page]
}

function Navigation({ page, onSkills }: { page: Page; onSkills: () => void }) {
  return <nav className="side-nav" aria-label="主导航">{NAV_ITEMS.map(({ id, label, Icon }) => <button key={id} className={page === id || (id === 'skills' && ['skill', 'songs', 'song', 'guided-course'].includes(page)) ? 'side-nav-item is-active' : 'side-nav-item'} type="button" onClick={id === 'skills' ? onSkills : () => setPage(id)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{(page === id || (id === 'skills' && ['skill', 'songs', 'song', 'guided-course'].includes(page))) && <span className="nav-active-dot" />}</button>)}</nav>
}

function SkillsPage({ onSkill }: { onSkill: (skillId: string) => void }) {
  return <div className="page-content skills-page">
    <section className="skills-welcome"><span className="eyebrow">慢慢学，也可以学很多</span><h2>每一项技能，<br /><em>都从下一小步开始。</em></h2><p>从一门课程开始，按自己的节奏继续探索。</p></section>
    {CATEGORIES.map((category) => {
      const categorySkills = SKILLS.filter((skill) => skill.categoryId === category.id)
      return <section className="section-block skill-category" key={category.id}>
        <div className="section-heading"><div><span className="eyebrow">技能分类</span><h2>{category.title}</h2></div><span className="library-total">{categorySkills.length} 项技能</span></div>
        <p>{category.description}</p>
        <div className="skill-grid">{categorySkills.map((skill) => {
          const count = skill.id === 'ukulele' ? SONGS.length : GUIDED_COURSES.filter((course) => course.skill.id === skill.id).length
          return <button className="skill-card" type="button" key={skill.id} onClick={() => onSkill(skill.id)}>
            <span className="skill-card-icon">{skill.id === 'ukulele' ? <Music2 size={22} /> : <Sparkles size={22} />}</span>
            <span className="skill-card-copy"><strong>{skill.title}</strong><small>{skill.description}</small></span>
            <span className="skill-card-count">{count} 门课程</span><ChevronRight size={18} />
          </button>
        })}</div>
      </section>
    })}
  </div>
}

function SkillIntro({ onSongs }: { onSongs: () => void }) {
  return <section className="skill-intro">
    <div><span className="eyebrow">音乐 · 技能</span><h2>尤克里里</h2><p>七门弹唱与指弹课程，从认识指法到完整演奏。</p></div>
    <button className="button button--secondary" type="button" onClick={onSongs}>浏览课程 <ArrowRight size={15} /></button>
  </section>
}

function GuidedCoursesPage({ skill, onCourse }: { skill?: ReturnType<typeof findSkill>; onCourse: (course: GuidedCourse) => void }) {
  const courses = GUIDED_COURSES.filter((course) => course.skill.id === skill?.id)
  return <div className="page-content"><section className="library-intro"><p>{skill?.description ?? '探索这项技能的入门课程。'}</p></section>
    <div className="guided-course-grid">{courses.map((course) => <button className="guided-course-card" type="button" key={course.id} onClick={() => onCourse(course)}><span className="eyebrow">{course.lessons.length} 个学习步骤</span><strong>{course.title}</strong><span>{course.description}</span><span className="guided-course-link">查看课程 <ArrowRight size={15} /></span></button>)}</div>
    {!courses.length && <div className="empty-course-note"><Sparkles size={18} /><span>这项技能的课程还在准备中。</span></div>}
  </div>
}

function GuidedCoursePage({ course, progress, onStart, onPractice }: { course: GuidedCourse; progress: UserProgress; onStart: () => void; onPractice: () => void }) {
  const item = getGuidedProgress(progress, course)
  const lesson = currentGuidedLesson(course, item)
  const started = Boolean(progress.courses[course.id])
  const done = isGuidedCourseCompleted(course, item)
  return <div className="page-content guided-detail-page">
    <section className="guided-detail-hero"><span className="eyebrow">{course.category.title} · {course.skill.title}</span><h2>{course.title}</h2><p>{course.description}</p><span className="pill">{course.lessons.length} 个学习步骤</span></section>
    <section className="detail-progress"><div className="detail-progress-head"><div><span className="eyebrow">学习路径</span><h3>从基础开始，逐步完成</h3></div><span>{item.completedTaskIds.length} / {course.lessons.length} 步</span></div><div className="progress-track progress-track--large"><span style={{ width: `${Math.round(item.completedTaskIds.length / course.lessons.length * 100)}%` }} /></div>
      <div className="journey-list">{course.lessons.map((step, index) => { const complete = item.completedTaskIds.includes(step.id); const active = lesson.id === step.id && !complete; return <div key={step.id} className={`journey-item ${complete ? 'is-done' : ''} ${active ? 'is-current' : ''}`}><span className="journey-icon">{complete ? <Check size={15} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span><div><strong>{step.title}</strong><p>{complete ? '已经完成' : active ? '正在这里' : '接下来学习'}</p></div></div> })}</div>
    </section>
    <div className="detail-actions"><button className="button button--primary" type="button" onClick={started && !done ? onPractice : onStart}>{done ? '再看一遍当前内容' : started ? '继续这一小步' : '从第一步开始'} <ArrowRight size={16} /></button><span>学完一步后，可以记录感受并安排复习。</span></div>
  </div>
}

function GuidedTodayPage({ course, item, lesson, onContinue, onSkills }: { course: GuidedCourse; item: ReturnType<typeof getGuidedProgress>; lesson: ReturnType<typeof currentGuidedLesson>; onContinue: () => void; onSkills: () => void }) {
  const percent = Math.round(item.completedTaskIds.length / course.lessons.length * 100)
  return <div className="page-content today-page">
    <section className="today-hero guided-today-hero"><div className="today-hero-top"><span><Sparkles size={15} /> 正在学习</span><span>{percent}% 完成</span></div><div className="guided-continue-copy"><span className="eyebrow">{course.skill.title} · {course.title}</span><h2>{lesson.title}</h2><p>{lesson.why}</p></div><div className="progress-track progress-track--large"><span style={{ width: `${percent}%` }} /></div><div className="today-action"><div className="today-action-copy"><h3>今天只学这一小步</h3><p>{lesson.success}</p></div><button className="button button--primary" type="button" onClick={onContinue}>继续学习 <ArrowRight size={16} /></button></div></section>
    <section className="quick-note"><div className="quick-note-icon"><BookOpen size={18} /></div><div><h3>换一项技能</h3><p>每门课程会分别保存学习进度。</p></div><button className="button button--quiet" type="button" onClick={onSkills}>浏览技能</button></section>
  </div>
}

function GuidedLessonPage({ course, item, lesson, onBack, onFinish }: { course: GuidedCourse; item: ReturnType<typeof getGuidedProgress>; lesson: ReturnType<typeof currentGuidedLesson>; onBack: () => void; onFinish: () => void }) {
  const simplified = item.simplifiedTaskId === lesson.id
  const steps = simplified ? lesson.simplifiedSteps : lesson.steps
  return <div className="page-content practice-page">
    <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={16} /> 返回今日</button>
    <div className="practice-heading"><span className="eyebrow">{course.skill.title} · 第 {course.lessons.findIndex((step) => step.id === lesson.id) + 1} 步</span><h2>{lesson.title}</h2><p>{lesson.why}</p></div>
    <section className="lesson-card guided-lesson-card"><h3>现在这样做</h3><ol className="practice-steps">{steps.map((step, index) => <li key={`${index}-${step}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol><div className="lesson-success"><CheckCircle2 size={17} /><span><strong>完成标准</strong>{simplified ? lesson.simplifiedSuccess : lesson.success}</span></div></section>
    <div className="practice-footer"><span>完成后记录你的感觉</span><button className="button button--primary" type="button" onClick={onFinish}>记录这一步 <ArrowRight size={16} /></button></div>
  </div>
}

function TodayEmptyPage({ onSkills }: { onSkills: () => void }) {
  return <div className="page-content today-page"><section className="today-empty"><span className="today-empty-icon"><Shapes size={27} /></span><span className="eyebrow">拾艺 · 技能学习手册</span><h2>今天，学一点什么？</h2><p>挑一项感兴趣的技能，从适合自己的第一小步开始。</p><button className="button button--primary" type="button" onClick={onSkills}>浏览技能 <ArrowRight size={16} /></button></section></div>
}

function InProgressList({ progress, activeCourseId, onSong, onGuided }: { progress: UserProgress; activeCourseId: string | null; onSong: (song: Song) => void; onGuided: (course: GuidedCourse) => void }) {
  const startedSongs = SONGS.filter((song) => song.id !== activeCourseId && Boolean(progress.courses[song.id]))
  const startedGuided = GUIDED_COURSES.filter((course) => course.id !== activeCourseId && Boolean(progress.courses[course.id]))
  const items = [
    ...startedSongs.map((song) => ({ id: song.id, title: song.title, date: progress.courses[song.id].lastStudiedAt, onClick: () => onSong(song) })),
    ...startedGuided.map((course) => ({ id: course.id, title: course.title, date: progress.courses[course.id].lastStudiedAt, onClick: () => onGuided(course) })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  if (!items.length) return null
  return <section className="section-block in-progress-section"><div className="section-heading"><div><span className="eyebrow">继续探索</span><h2>其他进行中的课程</h2></div></div><div className="in-progress-list">{items.map((item) => <button type="button" key={item.id} onClick={item.onClick}><span><BookOpen size={17} /></span><strong>{item.title}</strong><ChevronRight size={17} /></button>)}</div></section>
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
      <div className="today-action"><div className="today-action-copy"><span className="eyebrow">今天，只学这一小步</span><h3>{task.title}</h3><p>{task.success}</p></div><button className="button button--primary" type="button" onClick={onContinue}>继续学习 <ArrowRight size={17} /></button></div>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">正在靠近</span><h2>把《{song.title}》弹出来</h2></div><button className="text-button" type="button" onClick={onSongs}>换一首 <ArrowRight size={15} /></button></div>
      <div className="song-progress-panel"><div className="song-progress-main"><div className="song-progress-title"><span>学习进度</span><strong>{percent}%</strong></div><div className="progress-track progress-track--large"><span style={{ width: `${percent}%` }} /></div><div className="song-progress-meta"><span>{item.completedTaskIds.length} 个练习步骤完成</span><span>目标：{song.kind === 'fingerstyle' ? '完整独奏' : '完整弹唱'}</span></div></div><div className="stage-mini-list">{(song.kind === 'fingerstyle' ? FINGERSTYLE_STAGES : STAGES).slice(0, 4).map((stage, index) => <span key={stage} className={index < item.completedTaskIds.length ? 'stage-mini is-done' : index === task.stage - 1 ? 'stage-mini is-current' : 'stage-mini'}><i>{index < item.completedTaskIds.length ? <Check size={10} /> : index + 1}</i>{stage}</span>)}</div></div>
    </section>

    <section className="section-block quick-note"><div className="note-icon"><Sparkles size={17} /></div><div><h3>{item.lastFeedback === 'hard' ? '下次先把刚才那段温习一遍' : item.lastFeedback === 'not_mastered' ? '已经为你把练习拆得更小' : '不用赶进度，手指会慢慢记住'}</h3><p>按自己的节奏练习。每一次拿起琴，都已经让旋律更近了一点。</p></div></section>
  </div>
}

function PracticePage({ song, task, item, onBack, onFinish }: { song: Song; task: NonNullable<ReturnType<typeof findTask>>; item: ReturnType<typeof getSongProgress>; onBack: () => void; onFinish: () => void }) {
  const [openChord, setOpenChord] = useState<ChordName | null>(null)
  const simplified = item.simplifiedTaskId === task.id
  const isReview = item.reviewTaskId === task.id
  const bpm = simplified ? task.tempoSteps[0] : task.bpm
  const visibleSteps = simplified ? task.simplifiedSteps : task.steps
  const visibleChords = simplified ? task.chords.slice(0, 1) : task.chords
  const scoreSheet = SCORE_SHEETS[song.id]
  const successText = simplified ? task.simplifiedSuccess : task.success
  useEffect(() => {
    if (!openChord) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenChord(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openChord])
  return <div className="practice-page">
    <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={16} /> 返回今日</button>
    <div className="practice-heading"><div><span className="eyebrow">{song.title} <span className="eyebrow-separator">/</span> {task.stageName}</span><h2>{task.title}</h2></div><span className="lesson-number">{String(task.stage).padStart(2, '0')} <i /> 08</span></div>
    {(isReview || simplified) && <div className="gentle-banner"><Sparkles size={17} /><span>{isReview ? '今天先温习刚才的内容，稳稳地来。' : '已为你降慢速度并缩小练习范围。先练一个动作就好。'}</span></div>}
    <article className="lesson-card">
      <div className="lesson-card-top"><span className="lesson-label"><span className="lesson-label-dot" />今天学什么</span><span className="lesson-tag">{task.section}</span></div>
      <h3>{task.title}</h3><p className="lesson-why">{task.why}</p>
      <div className="lesson-map"><div className="lesson-map-focus"><span className="eyebrow">练习焦点</span><strong>{task.focus}</strong></div><p>{task.scoreCue}</p><div className="tempo-ladder"><span>速度阶梯</span>{task.tempoSteps.map((step, index) => <span className={step === bpm ? 'tempo-step is-current' : 'tempo-step'} key={`${step}-${index}`}>{step} BPM</span>)}</div></div>
      <div className="lesson-divider" />
      <div className="lesson-label"><span className="lesson-label-dot lesson-label-dot--clay" />跟着做</div>
      <ol className="practice-steps">{visibleSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
      {song.id === 'castle-in-the-sky'
        ? <CastleScoreViewer song={song} task={task} bpm={bpm} simplified={simplified} />
        : <PracticeScoreCard song={song} task={task} bpm={bpm} simplified={simplified} onChordClick={setOpenChord} />}
      {visibleChords.length > 0 && <div className="lesson-resource"><div className="resource-head"><div><span className="eyebrow">今天会用到</span><h4>和弦指法</h4></div><span className="resource-meta">正对指板，从左到右：G · C · E · A</span></div><div className="chord-grid">{visibleChords.map((chord) => <ChordDiagram name={chord} onClick={() => setOpenChord(chord)} key={chord} />)}</div><p className="chord-legend">圆点数字表示按弦手指：1 食指 · 2 中指 · 3 无名指 · 4 小指；○ 表示空弦。</p></div>}
      <div className="lesson-success"><CheckCircle2 size={18} /><div><strong>完成标准</strong><p>{successText}</p></div></div>
    </article>
    <Metronome initialBpm={bpm} timeSignature={song.timeSignature} tempoUnit={scoreSheet?.tempoUnit ?? 'quarter'} />
    <div className="practice-footer"><span><LockKeyhole size={14} /> 完成情况由你自己确认</span><button className="button button--primary button--wide" type="button" onClick={onFinish}>完成本次练习 <Check size={17} /></button></div>
    {openChord && <div className="chord-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenChord(null) }}><section className="chord-modal" role="dialog" aria-modal="true" aria-labelledby="chord-modal-title" tabIndex={-1}>
      <button className="modal-close icon-button" type="button" aria-label="关闭和弦图" onClick={() => setOpenChord(null)}><X size={18} /></button>
      <span className="eyebrow">和弦指法参考</span><h3 id="chord-modal-title">{openChord} 怎么按</h3>
      <ChordDiagram name={openChord} large />
      <p className="chord-modal-directions">{CHORDS[openChord].hint}。图中四条竖线从左到右是 G、C、E、A；最靠地面的弦是 A 弦。横格是品，从琴头开始数第 1 品。图上圆点里的数字是左手手指：1 食指、2 中指、3 无名指、4 小指；○ 表示这根弦不用按。按弦时用指尖压在品丝靠琴头的一侧，再逐根拨响四根弦。</p>
      <div className="chord-modal-legend"><span><b>1</b> 食指</span><span><b>2</b> 中指</span><span><b>3</b> 无名指</span><span><b>4</b> 小指</span><span><b>○</b> 空弦</span></div>
    </section></div>}
  </div>
}

function SongsPage({ progress, onSong, completedSongs }: { progress: UserProgress; onSong: (song: Song) => void; completedSongs: number }) {
  const [kind, setKind] = useState<SongKind>('singalong')
  const sorted = SONGS.filter((song) => song.kind === kind).sort((a, b) => {
    const ap = getSongProgress(progress, a); const bp = getSongProgress(progress, b)
    const aRank = ap.completedTaskIds.length ? 0 : 1; const bRank = bp.completedTaskIds.length ? 0 : 1
    return aRank - bRank
  })
  return <div className="page-content">
    <div className="library-intro"><p>挑一首喜欢的曲目，今天只学下一小步。</p><div className="long-goal"><div className="goal-orbit"><Music2 size={18} /></div><div><strong>尤克里里的阶段目标</strong><span>完整学会 5 首曲目（弹唱或独奏）</span></div><div className="goal-count"><strong>{completedSongs}</strong><span>/ 5</span></div></div></div>
    <div className="library-heading"><div><span className="eyebrow">现有完整课程</span><h2>{kind === 'singalong' ? '弹唱曲目' : '指弹独奏'}</h2></div><span className="library-total">{sorted.length} 首 <i /> 可学习</span></div>
    <div className="song-kind-tabs" role="tablist" aria-label="筛选曲目类型"><button type="button" role="tab" aria-selected={kind === 'singalong'} className={kind === 'singalong' ? 'is-active' : ''} onClick={() => setKind('singalong')}>弹唱 · 3 首</button><button type="button" role="tab" aria-selected={kind === 'fingerstyle'} className={kind === 'fingerstyle' ? 'is-active' : ''} onClick={() => setKind('fingerstyle')}>指弹 · 4 首</button></div>
    <div className="library-list">{sorted.map((song, index) => <SongCard key={song.id} song={song} progress={progress} onClick={() => onSong(song)} featured={index === 0 && !completedSongs} />)}</div>
    <p className="library-footnote"><BookOpen size={15} /> 弹唱 3 首 · 指弹 4 首。完整歌曲由你按原曲参考版本确认。</p>
  </div>
}

function SongPage({ song, progress, onStart, onPractice, onRoute }: { song: Song; progress: UserProgress; onStart: () => void; onPractice: () => void; onRoute: (route: 'playing' | 'singing') => void }) {
  const item = getSongProgress(progress, song)
  const current = currentTask(song, item)
  const started = Boolean(progress.courses[song.id])
  const lessonsComplete = song.tasks.every((lesson) => item.completedTaskIds.includes(lesson.id))
  const stages = song.kind === 'fingerstyle' ? FINGERSTYLE_STAGES : STAGES
  return <div className="page-content song-detail-page">
    <div className="detail-hero"><Artwork song={song} large /><div className="detail-meta"><span className="pill">音乐 · 尤克里里 · {song.mood}</span><h2>{song.title}</h2><p>{song.artist} <span>·</span> {song.key} <span>·</span> {song.kind === 'fingerstyle' ? 'High-G 标准调弦' : `课程目标 ${song.bpm} BPM`}</p><p className="detail-intro">{song.intro}</p><div className="detail-links">{song.sourceUrl && <a href={song.sourceUrl} target="_blank" rel="noreferrer" className="listen-link">{song.neteaseTrackId ? '去网易云听原曲' : '打开参考示范'} <ExternalLink size={14} /></a>}<a href={song.scoreUrl} target="_blank" rel="noreferrer" className="listen-link">查看参考曲谱 <ExternalLink size={14} /></a></div><p className="detail-course-note">{song.courseNote}</p></div></div>
    <div className="detail-progress"><div className="detail-progress-head"><div><span className="eyebrow">学习路径</span><h3>{song.kind === 'fingerstyle' ? '从看懂 TAB，到完整独奏' : '从一个和弦，到完整弹唱'}</h3></div><span>{item.completedTaskIds.length} / {song.tasks.length} 步</span></div><div className="progress-track progress-track--large"><span style={{ width: `${Math.round(item.completedTaskIds.length / song.tasks.length * 100)}%` }} /></div>
      <div className="journey-list">{stages.map((stage, index) => {
        const done = item.completedTaskIds.includes(song.tasks[index].id)
        const active = current.stage === index + 1 && !done
        const locked = !done && !active && index > current.stage - 1
        return <div key={stage} className={`journey-item ${done ? 'is-done' : ''} ${active ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`}><span className="journey-icon">{done ? <Check size={15} /> : locked ? <LockKeyhole size={14} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span><div><strong>{stage}</strong><p>{done ? '已经完成' : active ? song.tasks[index].title : locked ? '完成前一步后解锁' : song.tasks[index].title}</p></div>{active && <span className="journey-now">正在这里</span>}</div>
      })}</div>
    </div>
    <div className="route-confirmations"><div className="section-heading"><div><span className="eyebrow">完成后自己确认</span><h3>你已经能从头到尾完成了吗？</h3></div></div>{!lessonsComplete && <p className="route-lock-note"><LockKeyhole size={13} /> 完成八个学习步骤后，这里就可以确认你的{song.kind === 'fingerstyle' ? '完整独奏' : '完整演奏和弹唱'}。</p>}<div className="route-checks"><button type="button" disabled={!lessonsComplete && !item.completionChecks.includes('playing')} className={item.completionChecks.includes('playing') ? 'route-check is-checked' : 'route-check'} onClick={() => onRoute('playing')}><span className="route-check-icon">{item.completionChecks.includes('playing') ? <Check size={16} /> : <Guitar size={16} />}</span><span><strong>{song.kind === 'fingerstyle' ? '完整独奏' : '完整演奏'}</strong><small>{item.completionChecks.includes('playing') ? '已由你确认完成 · 点击可撤销' : song.kind === 'fingerstyle' ? '按参考编配从头到尾弹完独奏' : '不间断弹完整首器乐部分'}</small></span></button>{song.kind === 'singalong' && <button type="button" disabled={!lessonsComplete && !item.completionChecks.includes('singing')} className={item.completionChecks.includes('singing') ? 'route-check is-checked' : 'route-check'} onClick={() => onRoute('singing')}><span className="route-check-icon">{item.completionChecks.includes('singing') ? <Check size={16} /> : <AudioLines size={16} />}</span><span><strong>完整弹唱</strong><small>{item.completionChecks.includes('singing') ? '已由你确认完成 · 点击可撤销' : '边弹伴奏，边唱完整首歌曲'}</small></span></button>}</div>{isSongCompleted(song, item) && <div className="song-done-note"><Sparkles size={16} /> 太好了，《{song.title}》已经完整收进你的曲目里。</div>}</div>
    <div className="detail-actions"><button className="button button--primary" type="button" onClick={started ? onPractice : onStart}>{started ? '继续这一小步' : '从第一步开始'} <ArrowRight size={16} /></button><span>课程以慢速和分段练习，最后回到完整原曲。</span></div>
  </div>
}

function GrowthPage({ progress, completedSongs, masteredChords }: { progress: UserProgress; completedSongs: number; masteredChords: string[] }) {
  const totalCompleted = Object.values(progress.courses).reduce((sum, item) => sum + item.completedTaskIds.length, 0)
  const finishedSingalongs = SONGS.filter((song) => song.kind === 'singalong' && isSongCompleted(song, getSongProgress(progress, song))).length
  const finishedFingerstyles = SONGS.filter((song) => song.kind === 'fingerstyle' && isSongCompleted(song, getSongProgress(progress, song))).length
  const guidedRows = GUIDED_COURSES.map((course) => ({
    id: course.id,
    title: course.title,
    kind: `${course.skill.title} · ${course.lessons.length} 步`,
    completed: getGuidedProgress(progress, course).completedTaskIds.length,
    total: course.lessons.length,
  }))
  const records = progress.history.slice(0, 8)
  return <div className="page-content growth-page">
    <section className="growth-summary"><div className="growth-summary-copy"><span className="eyebrow">你的学习手记</span><h2>不是一下子变厉害，<br /><em>是每次都多一点。</em></h2><p>这里收着你已经走过的每一步。</p></div><div className="growth-illustration" aria-hidden="true"><Sprout size={48} strokeWidth={1.2} /><span>慢慢生长</span></div></section>
    <div className="stat-grid"><StatCard label="完成的曲目" value={`${completedSongs}`} unit="首" detail={`弹唱 ${finishedSingalongs} · 指弹 ${finishedFingerstyles}，目标 5 首`} icon={<Music2 size={17} />} /><StatCard label="学习小步" value={`${totalCompleted}`} unit="步" detail="每一步都算数" icon={<CheckCircle2 size={17} />} /><StatCard label="遇见的和弦" value={`${masteredChords.length}`} unit="个" detail={masteredChords.length ? masteredChords.join(' · ') : '从第一个开始'} icon={<Guitar size={17} />} /></div>
    <section className="section-block growth-song-progress"><div className="section-heading"><div><span className="eyebrow">音乐 · 尤克里里</span><h2>课程进度</h2></div></div>{SONGS.map((song) => { const item = getSongProgress(progress, song); const percent = Math.round(item.completedTaskIds.length / song.tasks.length * 100); return <div className="growth-song-row" key={song.id}><Artwork song={song} /><div className="growth-song-info"><div><strong>{song.title}</strong><span>{item.completedTaskIds.length} / {song.tasks.length} 步 · {song.kind === 'fingerstyle' ? '指弹' : '弹唱'}</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div><span className="growth-percent">{percent}%</span></div> })}{guidedRows.map((course) => { const percent = Math.round(course.completed / course.total * 100); return <div className="growth-course-row" key={course.id}><span className="skill-card-icon"><BookOpen size={20} /></span><div className="growth-song-info"><div><strong>{course.title}</strong><span>{course.completed} / {course.total} 步 · {course.kind}</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div><span className="growth-percent">{percent}%</span></div> })}</section>
    <section className="section-block timeline"><div className="section-heading"><div><span className="eyebrow">最近练习</span><h2>{records.length ? '每一次都留下了痕迹' : '你的第一条学习记录还在等你'}</h2></div></div>{records.length ? <div className="timeline-list">{records.map((entry) => <div className="timeline-item" key={entry.id}><span className="timeline-dot" /><div className="timeline-body"><div><strong>{entry.taskTitle}</strong><time>{new Date(entry.at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</time></div><p>{findSong(entry.courseId)?.title ?? findGuidedCourse(entry.courseId)?.title ?? '已移除的课程'} · {feedbackLabel(entry.feedback)}</p></div></div>)}</div> : <div className="empty-state"><span className="empty-state-icon"><AudioLines size={21} /></span><p>完成第一小步，这里就会出现你的学习手记。</p></div>}</section>
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
    <section className="settings-intro"><span className="eyebrow">你的数据，只留在你的设备</span><h2>让学习一直<br /><em>保持舒服的样子。</em></h2><p>当前记录约 {progress.history.length} 次学习。导出一份备份，就可以带去另一台设备。</p></section>
    <div className="settings-group"><span className="settings-group-title">数据与备份</span>
      <button className="settings-row" type="button" onClick={onExport}><span className="settings-row-icon"><Download size={18} /></span><span className="settings-row-copy"><strong>导出学习进度</strong><small>保存为 JSON 备份文件</small></span><ChevronRight size={17} /></button>
      <button className="settings-row" type="button" onClick={() => importInput.current?.click()}><span className="settings-row-icon"><Upload size={18} /></span><span className="settings-row-copy"><strong>导入学习进度</strong><small>从另一台设备恢复备份</small></span><ChevronRight size={17} /></button>
      <input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" aria-label="选择拾艺学习进度备份文件" onChange={(event) => { void onImport(event.target.files?.[0]); event.currentTarget.value = '' }} />
      {importMessage && <p className="import-message" role="status">{importMessage}</p>}
      <button className="settings-row settings-row--danger" type="button" onClick={onClear}><span className="settings-row-icon"><RotateCcw size={18} /></span><span className="settings-row-copy"><strong>清空所有学习进度</strong><small>操作无法撤销，建议先导出备份</small></span><ChevronRight size={17} /></button>
    </div>
    <div className="settings-group"><span className="settings-group-title">使用体验</span>
      <div className="settings-row settings-row--static"><span className="settings-row-icon"><Volume2 size={18} /></span><span className="settings-row-copy"><strong>离线学习</strong><small>课程和节拍器可在首次打开后离线使用</small></span><span className="settings-value-pill">已开启</span></div>
      <button className="settings-row" type="button" onClick={() => { if (installPrompt) void install(); else onImportMessage('在浏览器菜单中选择“添加到主屏幕”，即可像 App 一样打开。') }}><span className="settings-row-icon"><Download size={18} /></span><span className="settings-row-copy"><strong>添加到主屏幕</strong><small>把拾艺放到桌面，学习时更方便</small></span><ChevronRight size={17} /></button>
    </div>
    <div className="settings-about"><Brand compact /><p>课程中的图示和练习说明为拾艺自制，未收录完整歌词或原唱录音。听歌请前往官方音乐平台。</p><span>拾艺 v0.2 · 技能学习手册</span></div>
  </div>
}

function ProgressCard({ song, progress, completedSongs }: { song: Song; progress: ReturnType<typeof getSongProgress>; completedSongs: number }) {
  const percent = Math.round(progress.completedTaskIds.length / song.tasks.length * 100)
  return <section className="rail-card rail-progress"><div className="rail-card-head"><span>音乐 · 尤克里里</span><span className="rail-leaf"><Sprout size={16} /></span></div><div className="rail-big-stat">{completedSongs}<small> / 5 首</small></div><p>完整学会曲目（弹唱或独奏）</p><div className="rail-goal-track"><span style={{ width: `${completedSongs / 5 * 100}%` }} /></div><div className="rail-divider" /><div className="rail-current"><span className="rail-current-kicker">正在学习</span><strong>《{song.title}》</strong><div className="rail-current-meta"><span>{progress.completedTaskIds.length} 个小步骤</span><span>{percent}%</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div><span className="rail-encouragement">{completedSongs === 0 ? '每一次拿起琴都算开始。' : `你已经完整收下 ${completedSongs} 首歌。`}</span></section>
}

function LearningSummaryCard({ progress }: { progress: UserProgress }) {
  const activeCount = Object.keys(progress.courses).length
  const completeCount = GUIDED_COURSES.filter((course) => isGuidedCourseCompleted(course, getGuidedProgress(progress, course))).length
  return <section className="rail-card learning-summary-card"><div className="rail-card-head"><span>技能学习</span><span className="rail-leaf"><Sprout size={16} /></span></div><div className="rail-big-stat">{activeCount}<small> 门进行中</small></div><p>每门课程都独立保存进度。</p><div className="rail-divider" /><div className="rail-current"><span className="rail-current-kicker">已完成</span><strong>{completeCount} 门课程</strong></div><span className="rail-encouragement">今天学会的一点点，也算数。</span></section>
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
