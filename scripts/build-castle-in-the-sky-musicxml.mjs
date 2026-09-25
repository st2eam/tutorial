import { writeFileSync } from 'node:fs'

// Fret positions were transcribed from the user's 2-page TAB reference. x is
// the printed horizontal position within each system; rhythm is estimated
// from spacing because the screenshot does not expose exact event timestamps.
const systems = [
  { first: 1, bounds: [213, 550, 979, 1358], A: '431=0 482=2 587=3 740=2 792=3 894=7 995=2 1200=2', E: '689=0 843=0 1098=3', C: '638=0 1048=4 1152=4 1276=4', G: '587=2 994=0' },
  { first: 4, bounds: [78, 530, 944, 1358], A: '132=0 325=0 438=3 767=3 960=1 1098=0 1152=1 1270=3', E: '132=1 238=0 399=0 506=0 546=3 659=3 852=0 981=1 1110=3', C: '132=0 185=0 212=0 381=0 546=0 602=0 715=0 960=2 1040=2', G: '132=2 546=0 960=2' },
  { first: 7, bounds: [78, 549, 953, 1358], A: '386=3 436=3 482=3 566=2 840=2 1172=7 1244=0 1295=2', E: '132=0 334=0 566=2 688=2 738=2 970=7 1071=7 1175=4 1270=4', C: '132=0 183=0 284=0 562=3 634=3 789=3 886=3 972=4 1023=4 1124=4 1175=4', G: '132=2 234=2 566=2 972=4 1175=4' },
  { first: 10, bounds: [78, 571, 965, 1358], A: '132=3 292=2 346=3 452=7 587=2 801=2 980=0 1163=0 1270=3', E: '238=0 399=0 506=0 694=3 981=1 1110=3', C: '185=0 644=4 750=4 880=4 980=0 1056=0 1216=0', G: '132=2 587=0 981=2' },
  { first: 13, bounds: [78, 519, 954, 1358], A: '132=3 347=3 640=3 700=2 864=3 970=5 1024=5 1136=7 1190=3', E: '132=3 237=3 429=0 535=1 970=3 1190=0 1268=0', C: '132=0 187=0 296=0 590=0 809=0 972=4 1190=0', G: '132=0 536=2 970=0 1190=2' },
  { first: 16, bounds: [78, 528, 929, 1358], A: '129=3 181=2 230=0 279=0 524=0 720=0 819=3 865=5 945=7 1093=5 1146=7 1243=10', E: '130=1 328=7 430=4 524=0 622=0 945=0 1045=0', C: '132=0 331=4 380=4 524=0 573=0 672=0 770=0 945=0 995=0 1195=0 1295=0', G: '132=2 332=4 524=2 945=0' },
  { first: 19, bounds: [78, 509, 964, 1358], A: '132=5 348=5 526=3 686=2 734=3 846=7 980=7 1194=0', E: '132=3 239=3 422=3 525=0 632=0 980=3 1088=3 1194=3 1270=3', C: '132=2 186=2 292=2 525=0 578=0 792=0 899=0 980=2 1034=2 1141=2 1194=2', G: '132=0 526=2 980=0 1194=0' },
  { first: 22, bounds: [78, 519, 890, 1358], A: '132=0 188=2 242=3 320=2 372=3 427=5 532=3 1016=7 1124=5', E: '132=1 315=3 536=3 662=3 718=3 906=5 970=5', C: '132=0 320=2 535=0 613=0 800=0 906=5 961=5 1071=5 1178=5 1286=5', G: '132=2 320=0 535=0 906=5 1178=5' },
  { first: 25, bounds: [78, 595, 918, 1358], A: '132=7 916=7 1030=12 1186=10', E: '135=4 248=4 472=4 614=4 839=4 918=4 1030=12 1186=10', C: '135=4 192=4 304=4 416=4 528=4 670=4 782=4 918=4 1188=7 1266=7', G: '135=4 360=4 726=4 918=4 1188=7 1266=7' },
  { first: 28, bounds: [83, 541, 939, 1360], A: '137=7 184=5 235=3 428=3 554=5 704=3 754=5 854=10 956=7 1152=7 1250=7', E: '137=0 332=0 554=3 654=3 956=8 1154=4 1252=4', C: '137=0 284=0 382=0 479=0 556=2 606=2 806=2 955=0 1004=0 1102=0 1154=4 1203=4 1301=4', G: '137=0 557=0 955=0 1154=4' },
  { first: 31, bounds: [83, 453, 906, 1360], A: '143=12 290=10 469=7 522=5 576=3 788=3 924=5 1077=3 1134=5 1241=2', E: '143=12 290=10 468=0 681=0 924=3 1028=3 1134=3', C: '292=7 366=7 468=0 628=0 734=0 840=0 922=2 976=2 1134=2 1188=2 1294=2', G: '292=0 468=0 922=0 1134=0' },
  { first: 34, bounds: [83, 527, 934, 1360], A: '137=0 335=0 406=0 456=2 552=0 752=0 822=0 872=2 950=3 1099=2 1145=3 1248=7', E: '137=0 236=0 553=0 652=0 1049=0 1198=0 1298=0', C: '137=0 186=0 286=0 553=0 603=0 702=0 999=0', G: '137=2 553=2 950=2' },
  { first: 37, bounds: [83, 534, 947, 1360], A: '137=2 362=2 550=0 742=0 856=3 1188=3', E: '245=3 886=3 958=3 1071=3 1268=0', C: '196=4 308=4 445=4 550=0 629=0 798=0 963=0 1019=0 1132=0', G: '137=0 550=2 962=0' },
  { first: 40, bounds: [83, 544, 936, 1360], A: '244=3 296=2 456=3 560=5 611=5 720=7 774=3 952=3 1006=2 1058=0 1112=0', E: '137=0 952=1 1166=7 1274=4', C: '190=0 403=0 562=4 773=0 952=0 1168=4 1222=4', G: '137=2 560=0 774=2 952=0 1168=4' },
  { first: 43, bounds: [83, 534, 980, 1360], A: '137=0 362=0 545=3 606=2 662=0 719=0 1224=4', E: '137=0 250=0 550=1 776=7 890=4 1108=0 1222=0', C: '137=0 193=0 306=0 442=0 550=0 778=4 834=4 1050=1 1162=1 1222=1', G: '137=2 550=2 996=2 1222=2' },
]

const tuningMidi = { A: 69, E: 64, C: 60, G: 67 }
const pitchClasses = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]]

function parseRow(row) {
  return row.split(/\s+/).filter(Boolean).map((pair) => pair.split('=').map(Number))
}

function pitch(midi) {
  const midiClass = ((midi % 12) + 12) % 12
  const [step, alter] = pitchClasses[midiClass]
  const octave = Math.floor(midi / 12) - 1
  return `<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`
}

function eventData(system, bar) {
  const min = system.bounds[bar - system.first]
  const max = system.bounds[bar - system.first + 1]
  const events = new Map()
  for (const string of ['A', 'E', 'C', 'G']) {
    for (const [x, fret] of parseRow(system[string])) {
      if (x < min || x >= max) continue
      let eventX = [...events.keys()].find((known) => Math.abs(known - x) <= 10)
      if (eventX === undefined) { eventX = x; events.set(eventX, {}) }
      events.get(eventX)[string] = fret
    }
  }
  const ordered = [...events].sort((a, b) => a[0] - b[0]).map(([x, frets]) => ({ x, frets }))
  if (bar === 1) return [{ x: min, frets: {}, duration: 12 }, ...ordered.map((event, index) => ({ ...event, duration: index === ordered.length - 1 ? 2 : 2, start: 12 + index * 2 }))]
  if (!ordered.length) return [{ x: min, frets: {}, duration: 16, rest: true, start: 0 }]
  const unit = (max - min) / 8
  const deltas = ordered.slice(1).map((event, index) => Math.max(1, Math.round((event.x - ordered[index].x) / unit)) * 2)
  while (deltas.reduce((sum, delta) => sum + delta, 0) > 15) {
    const largest = deltas.indexOf(Math.max(...deltas))
    if (deltas[largest] <= 1) break
    deltas[largest]--
  }
  let tick = 0
  return ordered.map((event, index) => {
    if (index > 0) tick += deltas[index - 1]
    return { ...event, start: tick }
  }).map((event, index, all) => ({ ...event, duration: (all[index + 1]?.start ?? 16) - event.start }))
}

function noteXml(string, fret, duration, voice, isChord, ties = '', beam = '') {
  const midi = tuningMidi[string] + fret
  const type = duration >= 8 ? 'half' : duration >= 4 ? 'quarter' : duration >= 2 ? 'eighth' : '16th'
  const dotted = [3, 6, 12].includes(duration) ? '<dot/>' : ''
  const noteNotation = voice === 3 ? `<notations>${ties}<technical><string>${{ A: 1, E: 2, C: 3, G: 4 }[string]}</string><fret>${fret}</fret></technical></notations>` : ties ? `<notations>${ties}</notations>` : ''
  return `<note>${isChord ? '<chord/>' : ''}${pitch(midi)}<duration>${duration}</duration><voice>${voice}</voice><type>${type}</type>${dotted}<staff>${voice === 1 ? 1 : 2}</staff>${beam}${noteNotation}</note>`
}

function eventXml(event, voice, slur = '', beam = '') {
  if (event.rest || !Object.keys(event.frets).length) return `<note><rest/><duration>${event.duration}</duration><voice>${voice}</voice><type>${event.duration >= 8 ? 'half' : event.duration >= 4 ? 'quarter' : 'eighth'}</type>${[3, 6, 12].includes(event.duration) ? '<dot/>' : ''}<staff>${voice === 1 ? 1 : 2}</staff></note>`
  const strings = ['A', 'E', 'C', 'G'].filter((string) => event.frets[string] !== undefined)
  return strings.map((string, index) => noteXml(string, event.frets[string], event.duration, voice, index > 0, index === 0 ? slur : '', index === 0 ? beam : '')).join('')
}

const measures = Array.from({ length: 45 }, (_, index) => {
  const number = index + 1
  const system = systems.find((candidate) => number >= candidate.first && number < candidate.first + 3)
  const events = system ? eventData(system, number) : [{ rest: true, duration: 16, start: 0, frets: {} }]
  let xml = `<measure number="${number}">`
  if (number === 1) {
    xml += '<attributes><divisions>4</divisions><key><fifths>0</fifths><mode>major</mode></key><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>TAB</sign><line>5</line></clef><staff-details number="1"><staff-lines>5</staff-lines></staff-details><staff-details number="2"><staff-lines>4</staff-lines><staff-tuning line="1"><tuning-step>A</tuning-step><tuning-octave>4</tuning-octave></staff-tuning><staff-tuning line="2"><tuning-step>E</tuning-step><tuning-octave>4</tuning-octave></staff-tuning><staff-tuning line="3"><tuning-step>C</tuning-step><tuning-octave>4</tuning-octave></staff-tuning><staff-tuning line="4"><tuning-step>G</tuning-step><tuning-octave>4</tuning-octave></staff-tuning></staff-details></attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>90</per-minute></metronome></direction-type><sound tempo="90"/></direction>'
  }
  if (number === 2) xml += '<barline location="left"><repeat direction="forward"/></barline>'
  if (number === 34) xml += '<barline location="left"><ending number="1" type="start"/></barline>'
  if (number === 35) xml += '<barline location="left"><ending number="2" type="start"/></barline>'

  const activeEvents = events.map((event, eventIndex) => ({ event, eventIndex })).filter(({ event }) => !event.rest && Object.keys(event.frets).length > 0)
  const slurBars = new Set([14, 15, 40, 41])
  const slurEvents = new Map()
  if (slurBars.has(number) && activeEvents.length > 1) {
    slurEvents.set(activeEvents[0].eventIndex, '<slur type="start" number="1"/>')
    slurEvents.set(activeEvents[1].eventIndex, '<slur type="stop" number="1"/>')
  }
  const beamMarks = new Map()
  for (let i = 0; i < events.length;) {
    if (events[i].duration !== 2) { i++; continue }
    let end = i
    while (end + 1 < events.length && events[end + 1].duration === 2) end++
    if (end > i) {
      beamMarks.set(i, '<beam number="1">begin</beam>')
      for (let j = i + 1; j < end; j++) beamMarks.set(j, '<beam number="1">continue</beam>')
      beamMarks.set(end, '<beam number="1">end</beam>')
    }
    i = end + 1
  }
  const melody = events.map((event, i) => eventXml(event, 1, slurEvents.get(i) ?? '', beamMarks.get(i) ?? '')).join('')
  const playback = events.map((event, i) => eventXml(event, 3, slurEvents.get(i) ?? '', beamMarks.get(i) ?? '')).join('')
  xml += melody + `<backup><duration>16</duration></backup>` + playback
  if (number === 34) xml += '<barline location="right"><ending number="1" type="stop"/><repeat direction="backward" times="2"/></barline>'
  if (number === 35) xml += '<barline location="right"><ending number="2" type="stop"/></barline>'
  if (number === 45) xml += '<barline location="right"><bar-style>light-heavy</bar-style></barline>'
  xml += '</measure>'
  return xml
}).join('')

const musicXml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><work><work-title>天空之城（君をのせて）</work-title></work><identification><creator type="composer">久石让</creator><creator type="arranger">薇小咩</creator><rights>依据用户提供的谱面截图录入</rights><encoding><software>拾艺 · 手工录入 MusicXML</software></encoding></identification><part-list><score-part id="P1"><part-name>尤克里里</part-name><score-instrument id="P1-I1"><instrument-name>Ukulele</instrument-name></score-instrument><midi-instrument id="P1-I1"><midi-channel>1</midi-channel><midi-program>1</midi-program></midi-instrument></score-part></part-list><part id="P1">${measures}</part></score-partwise>`

writeFileSync('public/scores/castle-in-the-sky.musicxml', musicXml)
