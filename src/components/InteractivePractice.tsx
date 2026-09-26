import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, Music2, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import type { model } from '@coderline/alphatab'
import { CHORDS, type ChordName } from '../data/course'
import type { InteractiveCourse, PracticeMode } from '../data/interactive-course'
import type { InteractiveProgress } from '../lib/progress'
import { usePracticePlayer } from './usePracticePlayer'

// alphaTab model string numbers are bottom-to-top, opposite MusicXML technical/string.
const stringNames: Record<number, string> = { 1: 'G', 2: 'C', 3: 'E', 4: 'A' }
const fingerNames: Record<number, string> = { 0: '空弦', 1: '食指', 2: '中指', 3: '无名指', 4: '小指' }

function actionForNote(note: model.Note) {
  const string = stringNames[note.string] ?? `${note.string}`
  const finger = note.fret === 0 ? '左手不按' : `左手${fingerNames[Math.min(note.fret, 4)] ?? '合适手指'}按第 ${note.fret} 品`
  const right = note.string >= 3 ? '右手食指轻拨' : '右手拇指轻拨'
  return `${string} 弦 · ${note.fret} 品 · ${finger} · ${right}`
}

export function InteractivePractice({ course, progress, onProgress, onBack }: {
  course: InteractiveCourse
  progress: InteractiveProgress
  onProgress: (patch: Partial<InteractiveProgress>) => void
  onBack: () => void
}) {
  const [entered, setEntered] = useState(false)
  const [mode, setMode] = useState<PracticeMode>('listen')
  const [loop, setLoop] = useState(false)
  const [easier, setEasier] = useState(false)
  const [fullScore, setFullScore] = useState(false)
  const phrase = course.phrases.find(item => item.id === progress.currentPhraseId) ?? course.phrases[0]
  const firstBar = entered && !fullScore ? phrase.firstBar : 1
  const lastBar = entered && !fullScore ? easier ? phrase.firstBar : phrase.lastBar : course.barCount
  const player = usePracticePlayer(course, progress.level, mode, progress.speed, { first: firstBar, last: lastBar }, fullScore)
  const currentNotes = useMemo(() => {
    if (!player.selection) return []
    const beats = player.selection.beats ?? [player.selection.beat]
    return beats.flatMap(beat => beat.notes)
  }, [player.selection])
  const selectedBar = player.selection?.beat.voice.bar.masterBar.index !== undefined
    ? player.selection.beat.voice.bar.masterBar.index + 1 : player.activeBar
  const chordName = player.chordNames[(selectedBar ?? firstBar) - 1]
  const mastered = progress.masteredPhraseIds.includes(phrase.id)

  useEffect(() => { player.stop() }, [course.id, phrase.id, mode, progress.level, easier])

  function choosePhrase(id: string) {
    player.stop()
    setEntered(true)
    setEasier(false)
    setFullScore(false)
    const selected = course.phrases.find(item => item.id === id) ?? course.phrases[0]
    onProgress({ currentPhraseId: id, ...(id !== progress.currentPhraseId || !progress.lastStudiedAt ? { speed: selected.slowSpeed } : {}) })
  }

  function play() {
    if (player.playing) { player.stop(); return }
    const range = entered && !fullScore ? { first: firstBar, last: lastBar } : { first: 1, last: course.barCount }
    player.play(range.first, range.last, entered && loop)
  }

  return <div className="page-content interactive-page">
    <button className="button button--secondary" type="button" onClick={onBack}><ArrowLeft size={15} />返回尤克里里</button>
    <section className="interactive-hero">
      <span className="eyebrow">互动练习 · {course.style === 'fingerstyle' ? '指弹' : '弹唱'} · 原创</span>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <small>High-G 标准调弦 · 右手演奏 · {course.bpm} BPM · {course.composer}</small>
    </section>

    {!entered && <section className="interactive-intro">
      <h3>先听目标，再选起点</h3>
      <p>先听四小节的目标效果。准备好后，从第一个音开始，也可以直接选一个乐句；无需解锁。</p>
      <div className="interactive-actions">
        <button className="button button--primary" type="button" disabled={!player.audioReady} onClick={play}>{player.playing ? <Pause size={16} /> : <Volume2 size={16} />}{player.playing ? '暂停目标示范' : '听完整示范'}</button>
        <button className="button button--secondary" type="button" onClick={() => choosePhrase(course.phrases[0].id)}>从基础开始 <ChevronRight size={16} /></button>
        {progress.lastStudiedAt && <button className="button button--secondary" type="button" onClick={() => choosePhrase(phrase.id)}>继续「{phrase.title}」 <ChevronRight size={16} /></button>}
      </div>
      <div className="interactive-phrase-picks">{course.phrases.map(item => <button type="button" key={item.id} onClick={() => choosePhrase(item.id)}>{item.title} · 第 {item.firstBar}–{item.lastBar} 小节 <ChevronRight size={15} /></button>)}</div>
    </section>}

    {entered && <section className="interactive-lesson-head">
      <div><span className="eyebrow">第 {firstBar}–{lastBar} 小节</span><h3>{phrase.title}</h3><p>{phrase.focus}</p></div>
      <button className="button button--secondary" type="button" onClick={() => setFullScore(value => !value)}>{fullScore ? '返回当前乐句' : '查看完整谱'}</button>
    </section>}

    <section className="interactive-score" aria-label="可点击的尤克里里曲谱">
      <div className="interactive-score-label"><Music2 size={17} /><span>{progress.level === 'melody' && course.style === 'fingerstyle' ? '单旋律' : course.style === 'singalong' ? '和弦伴奏' : '旋律与伴奏'} · 点击谱上的音符查看动作</span></div>
      {!player.scoreReady && !player.error && <p>正在准备曲谱……</p>}
      {player.error && <div role="alert"><p>{player.error}</p><button className="button button--secondary" type="button" onClick={player.retry}>重新加载</button></div>}
      <div ref={player.mountRef} className="interactive-score-canvas" />
      {!player.audioReady && player.scoreReady && <small>曲谱可阅读；声音还在准备中。</small>}
    </section>

    {entered && <section className="interactive-controls" aria-label="练习控制">
      <div className="interactive-mode-tabs" role="group" aria-label="练习方式">
        {([['listen', '听示范'], ['follow', '跟着练'], ['self', '自己弹']] as const).map(([id, label]) => <button key={id} type="button" className={mode === id ? 'is-active' : ''} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}
      </div>
      <p>{mode === 'listen' ? '先听清楚音与节奏。' : mode === 'follow' ? '先听一小节预备拍，再随慢速示范弹；可循环。' : '只保留节拍和跟谱光标，乐音示范关闭。'}</p>
      <div className="interactive-actions">
        <button className="button button--primary" type="button" disabled={!player.audioReady} onClick={play}>{player.playing ? <Pause size={16} /> : <Play size={16} />}{player.playing ? '暂停' : mode === 'listen' ? '听这一段' : '开始练习'}</button>
        <label className="interactive-switch"><input type="checkbox" checked={loop} onChange={event => { player.stop(); setLoop(event.target.checked) }} />循环本段</label>
        <label className="interactive-speed">速度 {Math.round(progress.speed * 100)}%<input aria-label="播放速度" type="range" min="40" max="125" step="5" value={Math.round(progress.speed * 100)} onChange={event => onProgress({ speed: Number(event.target.value) / 100 })} /></label>
      </div>
      {course.style === 'fingerstyle' && <div className="interactive-level" role="group" aria-label="练习层级"><button type="button" className={progress.level === 'melody' ? 'is-active' : ''} onClick={() => onProgress({ level: 'melody' })}>① 单旋律</button><button type="button" className={progress.level === 'full' ? 'is-active' : ''} onClick={() => onProgress({ level: 'full' })}>② 加入伴奏</button></div>}
    </section>}

    {entered && <section className="interactive-action-card" aria-live="polite">
      <span className="eyebrow">当前动作</span>
      {course.style === 'singalong' ? <><h3>{chordName ?? '点一个和弦'} {chordName ? '· 向下扫 ↓' : ''}</h3><p>{chordName ? `第 ${selectedBar ?? firstBar} 小节：先摆好 ${chordName} 指型，第一拍向下扫，保持每拍一次。` : '点谱上的音，查看这一拍的完整指型。'}</p></> : <><h3>{currentNotes.length ? `第 ${selectedBar} 小节 · ${currentNotes.length > 1 ? '同时拨奏' : '单音'}` : '点一个音，找到第一步'}</h3><p>{currentNotes.length ? currentNotes.map(actionForNote).join('；') : '四线谱从上到下是 A、E、C、G 弦。0 表示空弦，不用左手按。'}</p></>}
      {currentNotes.length > 0 && <div className="interactive-fingering" aria-label="当前指型">{[1, 2, 3, 4].map(string => {
        const note = currentNotes.find(item => item.string === string)
        const chordFinger = chordName ? CHORDS[chordName as ChordName]?.fingers[string - 1] : undefined
        const finger = chordFinger ?? Math.min(note?.fret ?? 0, 4)
        return <div key={string}><b>{stringNames[string]}</b><span>{note ? note.fret === 0 ? '○ 空弦' : `${note.fret} 品 · ${fingerNames[finger]}` : '—'}</span></div>
      })}</div>}
      <button className="button button--secondary" type="button" disabled={!player.audioReady || !player.selection || mode === 'self'} onClick={player.previewSelection}><Volume2 size={15} />试听当前音</button>
    </section>}

    {entered && <section className="interactive-finish">
      <p><strong>练熟的标准：</strong>{phrase.success}</p>
      <div className="interactive-actions"><button className="button button--secondary" type="button" onClick={() => { player.stop(); setEasier(true); onProgress({ speed: Math.min(progress.speed, 0.55) }) }}><RotateCcw size={15} />太难了，缩短并放慢</button><button className="button button--primary" type="button" onClick={() => onProgress({ masteredPhraseIds: mastered ? progress.masteredPhraseIds.filter(id => id !== phrase.id) : [...progress.masteredPhraseIds, phrase.id] })}><Check size={16} />{mastered ? '已练熟 · 撤销' : '我已练熟'}</button></div>
      {easier && <small>现在只练第 {phrase.firstBar} 小节；稳定后可切换乐句恢复两小节。</small>}
    </section>}

    <details className="interactive-reading"><summary>读谱基础与调弦提示</summary><p>标准 High-G 调弦：四弦 G、三弦 C、二弦 E、一弦 A。四线谱最上方是一弦 A。数字表示品位；0 是空弦。四分音符数一拍，二分音符数两拍。右手拨弦时让手腕放松，指尖轻轻通过琴弦。</p></details>
    {entered && <section className="interactive-phrase-list"><h3>自由选择乐句</h3>{course.phrases.map(item => <button type="button" key={item.id} className={phrase.id === item.id ? 'is-active' : ''} onClick={() => choosePhrase(item.id)}><span>{item.title}<small>第 {item.firstBar}–{item.lastBar} 小节</small></span>{progress.masteredPhraseIds.includes(item.id) ? <Check size={16} /> : <ChevronRight size={16} />}</button>)}</section>}
  </div>
}
