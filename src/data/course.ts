export type ChordName = 'C' | 'Am' | 'F' | 'G' | 'Em' | 'E' | 'D' | 'Dm' | 'Bm' | 'G7'

export type LessonTask = {
  id: string
  songId: string
  stage: number
  stageName: string
  title: string
  why: string
  steps: string[]
  success: string
  chords: ChordName[]
  bpm: number
  section: string
  pattern?: string[]
}

export type Song = {
  id: string
  title: string
  artist: string
  mood: string
  key: string
  bpm: number
  chords: ChordName[]
  intro: string
  fit: string
  fitLabel: string
  palette: 'green' | 'clay' | 'blue'
  sourceUrl: string
  scoreUrl: string
  tasks: LessonTask[]
}

export const STAGES = ['认识歌曲', '单个和弦', '和弦转换', '节奏型', '分段慢练', '完整演奏', '加入演唱', '完整弹唱']

const lessonSeeds = [
  { title: '先听见歌曲的起伏', why: '先熟悉段落之间的变化，之后练习时更容易知道自己正在弹哪里。', steps: ['听一遍你熟悉的版本，留意主歌和副歌的情绪差别。', '跟着节拍轻轻数四拍，不需要拿起琴。', '找到你最想先学的一小段。'], success: '能说出一段想先练的部分。', section: '歌曲结构' },
  { title: '把常用和弦按稳', why: '先让手指找到位置，换和弦时就不用每次重新寻找。', steps: ['看和弦图，把手指放到对应品格。', '一根一根轻拨四条弦，听听每根是否清楚。', '放松手指，再按一次。'], success: '连续三次拨弦，每根弦都能清楚发声。', section: '和弦练习' },
  { title: '让两个和弦接上', why: '歌曲的流动感来自顺畅的转换，不需要一开始追求速度。', steps: ['先摆好第一个和弦，默数四拍。', '慢慢换到下一个和弦，暂时不扫弦。', '重复几次，留意哪些手指可以少移动。'], success: '慢速完成四次转换，中间不停下来。', section: '转换练习' },
  { title: '给和弦加上稳定节奏', why: '稳定的扫弦会让和弦听起来像一首歌，而不是一组单独的声音。', steps: ['先用手掌轻拍四拍。', '跟着节奏图做下扫和上扫。', '用最舒服的速度重复，不必追求响亮。'], success: '连续数四小节，扫弦方向没有乱。', section: '节奏练习' },
  { title: '慢慢弹一小段', why: '慢速分段能让手和节奏先记住路线，之后再逐渐接近原曲速度。', steps: ['从标记的小节开始，先用目标速度的一半。', '每两小节停一下，检查手指位置。', '熟悉后把速度提高一点点。'], success: '慢速弹完标记片段，能够从头接到尾。', section: '分段练习' },
  { title: '把段落连成完整演奏', why: '把已经练过的小段串起来，形成第一次完整的器乐演奏。', steps: ['先弹熟悉的段落，再接上下一段。', '如果出错，继续保持节拍，不用从头开始。', '最后尝试从头到尾弹一遍。'], success: '不暂停地完成整首歌的器乐部分。', section: '完整演奏' },
  { title: '加入熟悉的旋律', why: '先让声音和节奏并行，找到适合自己的舒适音区。', steps: ['先单独轻声哼唱熟悉的旋律。', '边哼边用很慢的速度弹伴奏。', '觉得紧张时，回到只弹伴奏。'], success: '能在伴奏中自然哼唱一段，不需要唱高音。', section: '弹唱练习' },
  { title: '完成一遍自己的弹唱', why: '音乐不必一次完美，能从头到尾表达出来就是很好的阶段成果。', steps: ['先选舒服的音量和速度。', '从开头开始，保持伴奏和演唱往前走。', '结束后给自己一个简单反馈。'], success: '从头到尾完成弹唱；以自己的确认作为完成标准。', section: '阶段完成' },
]

const songConfigs: Omit<Song, 'tasks'>[] = [
  { id: 'anheqiao', title: '安和桥', artist: '宋冬野', mood: '安静 · 民谣', key: 'G 调参考谱', bpm: 65, chords: ['G', 'D', 'Em', 'C'], intro: '从熟悉的旋律开始，慢一点也没关系。', fit: '最适合从这里起步', fitLabel: '推荐起点', palette: 'green', sourceUrl: 'https://music.163.com/#/search/m/?s=%E5%AE%89%E5%92%8C%E6%A1%A5&type=1', scoreUrl: 'https://www.ukuleleba.com/37804.html' },
  { id: 'chengdu', title: '成都', artist: '赵雷', mood: '温柔 · 民谣', key: 'C 指法 · 夹 2 品为原调', bpm: 91, chords: ['C', 'Em', 'F', 'G', 'Am', 'Dm'], intro: '用稳定的节奏，慢慢走进这座熟悉的城。', fit: '适合练习和弦转换', fitLabel: '循序渐进', palette: 'clay', sourceUrl: 'https://music.163.com/#/search/m/?s=%E6%88%90%E9%83%BD&type=1', scoreUrl: 'https://www.ukuleleba.com/22137.html' },
  { id: 'nanshannan', title: '南山南', artist: '马頔', mood: '叙事 · 民谣', key: '参考弹唱谱', bpm: 72, chords: ['C', 'D', 'Bm', 'Em', 'Am', 'G', 'G7'], intro: '把每段旋律弹得松弛，让故事慢慢展开。', fit: '适合进入下一阶段', fitLabel: '稍有挑战', palette: 'blue', sourceUrl: 'https://music.163.com/#/search/m/?s=%E5%8D%97%E5%B1%B1%E5%8D%97&type=1', scoreUrl: 'https://www.ukuleleba.com/915.html' },
]

export const SONGS: Song[] = songConfigs.map((song) => ({
  ...song,
  tasks: lessonSeeds.map((seed, index) => ({
    id: `${song.id}-stage-${index + 1}`,
    songId: song.id,
    stage: index + 1,
    stageName: STAGES[index],
    title: seed.title,
    why: seed.why,
    steps: seed.steps,
    success: seed.success,
    chords: index === 0 ? [] : song.chords.slice(0, Math.min(song.chords.length, index < 2 ? 1 : index < 5 ? 2 : song.chords.length)),
    bpm: Math.max(48, song.bpm - (index < 4 ? 10 : 0)),
    section: seed.section,
    ...(index === 3 ? { pattern: ['↓', '↓↑', '↓', '↓↑'] } : {}),
  })),
}))

export const CHORDS: Record<ChordName, { frets: number[]; fingers: number[]; hint: string }> = {
  C: { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], hint: '无名指按住 A 弦第 3 品' },
  Am: { frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0], hint: '中指按住 G 弦第 2 品' },
  F: { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], hint: '食指按 E 弦第 1 品，中指按 G 弦第 2 品' },
  G: { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], hint: '食指、中指、无名指分别按住 C、E、A 弦' },
  Em: { frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], hint: '三根手指按住 C、E、A 弦的第 4、3、2 品' },
  E: { frets: [1, 4, 0, 2], fingers: [1, 4, 0, 2], hint: '先放慢速度，依次找到 G、C、A 弦上的手指位置' },
  D: { frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0], hint: '食指、中指、无名指并排按住前三根弦第 2 品' },
  Dm: { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], hint: '食指按 E 弦第 1 品，另外两指按 G、C 弦第 2 品' },
  Bm: { frets: [4, 2, 2, 2], fingers: [3, 1, 1, 1], hint: '食指横按前三根弦第 2 品，无名指按 G 弦第 4 品' },
  G7: { frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], hint: '中指按 C 弦第 2 品，食指按 E 弦第 1 品，无名指按 A 弦第 2 品' },
}

export function findSong(songId: string | null | undefined) {
  return SONGS.find((song) => song.id === songId)
}

export function findTask(song: Song | undefined, taskId: string | undefined) {
  return song?.tasks.find((task) => task.id === taskId)
}
