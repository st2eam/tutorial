// Original practice music. This table is the only pitch and rhythm source.
import { mkdirSync, writeFileSync } from 'node:fs'

const output = new URL('../public/scores/', import.meta.url)
const base = [0, 69, 64, 60, 67]
const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// MusicXML staff lines run bottom to top: G, C, E, A.
const tuning = [['G', 4], ['C', 4], ['E', 4], ['A', 4]]

function note(string, fret, duration, chord = false) {
  const pitch = base[string] + fret
  const name = names[pitch % 12]
  return `<note>${chord ? '<chord/>' : ''}<pitch><step>${name[0]}</step>${name.length > 1 ? '<alter>1</alter>' : ''}<octave>${Math.floor(pitch / 12) - 1}</octave></pitch><duration>${duration}</duration><type>${{ 4: 'quarter', 8: 'half' }[duration]}</type><notations><technical><string>${string}</string><fret>${fret}</fret></technical></notations></note>`
}

function part(id, title, bars, channel, harmonies = []) {
  const details = tuning.map(([step, octave], index) => `<staff-tuning line="${index + 1}"><tuning-step>${step}</tuning-step><tuning-octave>${octave}</tuning-octave></staff-tuning>`).join('')
  const measures = bars.map((events, index) => {
    const duration = events.reduce((sum, event) => sum + event[1], 0)
    if (duration !== 16) throw new Error(`${title} bar ${index + 1}: ${duration} divisions`)
    const attributes = index === 0 ? `<attributes><divisions>4</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>TAB</sign><line>5</line></clef><staff-details><staff-lines>4</staff-lines>${details}</staff-details></attributes>${id === 'P1' ? '<direction><sound tempo="72"/></direction>' : ''}` : ''
    const harmony = harmonies[index]
      ? `<harmony><root><root-step>${harmonies[index][0]}</root-step></root><kind text="${harmonies[index].endsWith('m') ? 'm' : ' '}">${harmonies[index].endsWith('m') ? 'minor' : 'major'}</kind></harmony>`
      : ''
    const body = events.map(([strings, length]) => strings.map(([string, fret], noteIndex) => note(string, fret, length, noteIndex > 0)).join('')).join('')
    return `<measure number="${index + 1}">${attributes}${harmony}${body}</measure>`
  }).join('')
  return {
    header: `<score-part id="${id}"><part-name>${title}</part-name><score-instrument id="${id}-I"><instrument-name>Ukulele</instrument-name></score-instrument><midi-instrument id="${id}-I"><midi-channel>${channel}</midi-channel><midi-program>25</midi-program></midi-instrument></score-part>`,
    body: `<part id="${id}">${measures}</part>`,
  }
}

function save(file, title, entries) {
  const parts = entries.map(([id, label, bars, harmonies], index) => part(id, label, bars, index + 1, harmonies))
  const xml = `<?xml version="1.0" encoding="utf-8"?><score-partwise version="4.0"><work><work-title>${title}</work-title></work><movement-title>${title}</movement-title><identification><creator type="composer">拾艺原创练习</creator><rights>原创教学练习；不包含《天空之城》旋律</rights></identification><part-list>${parts.map(item => item.header).join('')}</part-list>${parts.map(item => item.body).join('')}</score-partwise>`
  writeFileSync(new URL(file, output), xml)
}

const melody = [
  [[[1, 0], [1, 2], [1, 3], [1, 2]]],
  [[[2, 0], [1, 0], [2, 3], [2, 0]]],
  [[[1, 0], [1, 2], [1, 0], [2, 1]]],
]
const melodicBars = melody.map(([[...notes]]) => notes.map(note => [[note], 4]))
melodicBars.push([[[[2, 0]], 4], [[[2, 3]], 4], [[[1, 0]], 8]])
const accompaniment = [
  [[[3, 0]], [[2, 0]]],
  [[[3, 0]], [[4, 0]]],
  [[[3, 0]], [[2, 1]]],
  [[[3, 0]], [[2, 0]]],
].map(bar => bar.map(strings => [strings, 8]))
const chords = [
  [[4, 0], [3, 0], [2, 0], [1, 3]],
  [[4, 2], [3, 0], [2, 0], [1, 0]],
  [[4, 2], [3, 0], [2, 1], [1, 0]],
  [[4, 0], [3, 2], [2, 3], [1, 2]],
]
mkdirSync(output, { recursive: true })
save('original-fingerstyle-practice.musicxml', '四小节小路：原创指弹练习', [['P1', '旋律', melodicBars], ['P2', '伴奏', accompaniment]])
save('original-singalong-practice.musicxml', '四和弦散步：原创弹唱伴奏练习', [['P1', '和弦与下扫', chords.map(chord => Array.from({ length: 4 }, () => [chord, 4])), ['C', 'Am', 'F', 'G']]])
