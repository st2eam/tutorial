export type PracticeMode = 'listen' | 'follow' | 'self'
export type PracticeLevel = 'melody' | 'full'
export type PlayingStyle = 'fingerstyle' | 'singalong'

export type PracticePhrase = {
  id: string
  title: string
  firstBar: number
  lastBar: number
  focus: string
  success: string
  slowSpeed: number
}

export type InteractiveCourse = {
  id: string
  version: string
  title: string
  description: string
  style: PlayingStyle
  scoreFile: string
  barCount: number
  composer: string
  bpm: number
  phrases: PracticePhrase[]
}

export const INTERACTIVE_COURSES: InteractiveCourse[] = [
  {
    id: 'original-fingerstyle-practice', version: '1', title: '四小节小路',
    description: '原创指弹练习。先找 A 弦的第一个音，再把旋律和简单伴奏合起来。',
    style: 'fingerstyle', scoreFile: 'scores/original-fingerstyle-practice.musicxml', barCount: 4,
    composer: '拾艺原创练习', bpm: 72,
    phrases: [
      { id: 'first-two-bars', title: '找到第一个音', firstBar: 1, lastBar: 2, focus: '先看最上方 A 弦的 0：空弦不按品，右手食指轻拨。接着依次按 A 弦第 2、3、2 品。', success: '能在慢速节拍中弹完前两小节，手不离开节拍。', slowSpeed: 0.7 },
      { id: 'last-two-bars', title: '旋律走回家', firstBar: 3, lastBar: 4, focus: 'A 弦与 E 弦轮流拨，换弦时右手先找准目标。末尾的二分音符保持两拍。', success: '能清楚地换弦并让最后一音延续两拍。', slowSpeed: 0.7 },
    ],
  },
  {
    id: 'original-singalong-practice', version: '1', title: '四和弦散步',
    description: '原创弹唱伴奏练习。每小节换一个和弦，每拍向下扫一次；可以自己哼唱任意旋律。',
    style: 'singalong', scoreFile: 'scores/original-singalong-practice.musicxml', barCount: 4,
    composer: '拾艺原创练习', bpm: 72,
    phrases: [
      { id: 'c-am', title: 'C 换到 Am', firstBar: 1, lastBar: 2, focus: '第 1 小节 C：无名指按 A 弦 3 品。第 2 小节 Am：中指按 G 弦 2 品。每小节第一拍换好和弦。', success: 'C 与 Am 各扫四拍，换位时不漏掉第一拍。', slowSpeed: 0.65 },
      { id: 'f-g', title: 'F 换到 G', firstBar: 3, lastBar: 4, focus: 'F 用食指按 E 弦 1 品、中指按 G 弦 2 品。G 用食指按 C 弦 2 品、中指按 A 弦 2 品、无名指按 E 弦 3 品。右手保持下扫。', success: '在小节交界时完成 F 到 G 的换位，四拍不断。', slowSpeed: 0.6 },
    ],
  },
]

export function findInteractiveCourse(id?: string | null) {
  return INTERACTIVE_COURSES.find(course => course.id === id)
}
