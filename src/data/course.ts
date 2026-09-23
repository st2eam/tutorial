export type ChordName = 'C' | 'Am' | 'F' | 'G' | 'Em' | 'E' | 'D' | 'Dm' | 'Bm' | 'G7' | 'Fmaj7' | 'Em7' | 'Dm7' | 'Cadd9' | 'Gsus2' | 'C7'

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
  focus: string
  scoreCue: string
  tempoSteps: [number, number, number]
  simplifiedSteps: string[]
  simplifiedSuccess: string
  tab?: { string: 'G' | 'C' | 'E' | 'A'; fret: number; finger?: string; beat?: number }[]
  scoreGuide: {
    section: string
    timeSignature: '2/4' | '3/4' | '4/4' | '6/8'
    bars: { chord: ChordName; beats: string[] }[]
  }
}

export type SongRouteStop = { label: string; repeatTo?: string }

export type Song = {
  id: string
  kind: 'singalong' | 'fingerstyle'
  title: string
  artist: string
  mood: string
  key: string
  bpm: number
  timeSignature: '2/4' | '3/4' | '4/4' | '6/8'
  chords: ChordName[]
  intro: string
  fit: string
  fitLabel: string
  palette: 'plum' | 'clay' | 'blue'
  sourceUrl?: string
  scoreUrl: string
  neteaseTrackId?: number
  route: SongRouteStop[]
  courseNote: string
  tasks: LessonTask[]
}

export const STAGES = ['认识歌曲', '单个和弦', '和弦转换', '节奏型', '分段慢练', '完整演奏', '加入演唱', '完整弹唱']
export const FINGERSTYLE_STAGES = ['认识四线谱', '右手拨弦', '单音旋律', '加入和声音', '前段慢练', '后段慢练', '连接全曲', '完整独奏']
export type SongKind = Song['kind']

export type CastleScoreRow = { row: number; firstBar: number; lastBar: number }
export const CASTLE_SCORE_ROWS: CastleScoreRow[] = [1, 4, 7, 10, 13, 16, 19, 22].map((firstBar, index) => ({
  row: index + 1,
  firstBar,
  lastBar: firstBar + 2,
}))

export function getCastleScoreRows(stage: number, simplified = false): CastleScoreRow[] {
  const rows = CASTLE_SCORE_ROWS
  if (simplified) {
    if (stage === 1 || stage === 2 || stage === 3) return [{ ...rows[0], lastBar: rows[0].firstBar }]
    if (stage === 4) return [{ ...rows[1], lastBar: rows[1].firstBar }]
    if (stage === 5) return [{ ...rows[2], lastBar: rows[2].firstBar }]
    if (stage === 6) return rows.slice(3, 4)
    if (stage === 7) return rows.slice(0, 3)
  }
  if (stage === 1) return rows
  if (stage === 2) return rows.slice(0, 1)
  if (stage === 3) return [{ ...rows[0], lastBar: rows[0].firstBar }]
  if (stage === 4) return rows.slice(1, 2)
  if (stage === 5) return rows.slice(2, 3)
  if (stage === 6) return rows.slice(3, 6)
  return rows
}

type LessonDraft = Omit<LessonTask, 'id' | 'songId' | 'stage' | 'stageName' | 'tempoSteps' | 'scoreGuide'>

const songConfigs: Omit<Song, 'tasks'>[] = [
  { kind: 'singalong', id: 'anheqiao', title: '安和桥', artist: '宋冬野', mood: '安静 · 民谣', key: 'G 调参考弹唱谱', bpm: 65, timeSignature: '4/4', chords: ['C', 'D', 'Em', 'G'], intro: '先认段落，再从四个开放和弦走进完整弹唱。', fit: '最适合从这里起步', fitLabel: '推荐起点', palette: 'plum', sourceUrl: 'https://music.163.com/#/song?id=27646205', scoreUrl: 'https://www.ukuleleba.com/22127.html', neteaseTrackId: 27646205, route: [{ label: '前奏' }, { label: 'A 段' }, { label: 'B 段' }, { label: 'A 段再现' }, { label: 'B 段再现', repeatTo: 'B 段' }, { label: '尾奏' }], courseNote: '已按所选 G 调参考谱核对：谱头列出的和弦为 C、D、Em、G，4/4 拍，约 65 BPM，并有伴奏型 A、B 两种。本站的均匀下扫是零基础拆手练习，不是原谱 A/B；实际和弦落点与节奏以参考谱为准。' },
  { kind: 'singalong', id: 'chengdu', title: '成都', artist: '赵雷', mood: '温柔 · 民谣', key: 'C 指法 · 原调 D（夹品按音域选）', bpm: 91, timeSignature: '6/8', chords: ['C', 'G', 'Em', 'Am', 'F', 'Dm'], intro: '先抓住六个和弦和长歌段落，再逐步连成弹唱。', fit: '适合练习和弦转换', fitLabel: '循序渐进', palette: 'clay', sourceUrl: 'https://music.163.com/#/song?id=436514312', scoreUrl: 'https://www.ukuleleba.com/22137.html', neteaseTrackId: 436514312, route: [{ label: '前奏' }, { label: '主歌 A' }, { label: '主歌 B' }, { label: '副歌 1' }, { label: '间奏' }, { label: '主歌再现' }, { label: '副歌 2', repeatTo: '副歌 1' }, { label: '尾奏' }], courseNote: '已按所选参考谱核对：C 指法、原调 D、6/8 拍、约 91 BPM；谱面列出 C、G、Em、Am、F、Dm 六个和弦及一种伴奏型。谱头给出女声夹 0 品、男声夹 2 品两个参考，实际夹品按个人音域选择。本站六拍下扫只是入门节拍练习，不是原谱伴奏型；原谱伴奏含拨弦动作。' },
  { kind: 'singalong', id: 'nanshannan', title: '南山南', artist: '马頔', mood: '叙事 · 民谣', key: 'C 调参考编配', bpm: 65, timeSignature: '4/4', chords: ['Fmaj7', 'G7', 'Em7', 'Am', 'Dm7', 'C', 'Dm', 'G', 'Cadd9', 'Gsus2', 'C7', 'F'], intro: '先听懂段落的轻重，再挑战谱里的色彩和弦。', fit: '适合进入下一阶段', fitLabel: '稍有挑战', palette: 'blue', sourceUrl: 'https://music.163.com/#/song?id=29715551', scoreUrl: 'https://www.ukuleleba.com/915.html', neteaseTrackId: 29715551, route: [{ label: '前奏' }, { label: '主歌一' }, { label: '主歌二' }, { label: '主歌三' }, { label: '尾声' }], courseNote: '参考缘起 ukulele 教学及配套谱；该版本为 C 调、4/4 拍、约 65 BPM，并用到七和弦与挂留和弦。课程先练基础动作，完整编配请看参考谱。' },
  ...[
    { id: 'castle-in-the-sky', title: '天空之城（君をのせて）', artist: '久石让', mood: '纯音乐 · 动画配乐', key: '标准调 · High-G', bpm: 92, scoreUrl: 'https://www.ukuleleba.com/22389.html', sourceUrl: 'https://www.ukuleleba.com/22389.html', difficulty: '指弹入门', route: ['总谱说明', '第 1–3 小节', '第 1 小节慢练', '第 4–6 小节', '第 7–9 小节', '第 10–18 小节', '全曲慢速连接', '全曲 1–24 小节'] },
    { id: 'always-with-me', title: 'Always with Me', artist: '木村弓', mood: '电影主题 · 器乐独奏', key: 'High-G · 简易独奏参考', bpm: 72, scoreUrl: 'https://www.ukuleleba.com/14714.html', sourceUrl: 'https://www.ukuleleba.com/14714.html', difficulty: '指弹入门', route: ['前奏动机', '主题 A', '主题 A 延展', '连接句', '主题 B', '主题回归', '收尾', '完整独奏'] },
    { id: 'canon-in-c', title: '卡农（C 调改编）', artist: 'Johann Pachelbel', mood: '古典 · 分解和弦', key: 'C 调改编 · High-G', bpm: 72, scoreUrl: 'https://ukulele-pdf.com/canon-in-c-mr-pook/', sourceUrl: 'https://ukulele-pdf.com/canon-in-c-mr-pook/', difficulty: '循序渐进', route: ['低音型', '主题 A', '主题 A 重复', '主题 B', '连接句', '主题再现', '尾奏', '完整独奏'] },
    { id: 'summer', title: 'Summer（菊次郎的夏天）', artist: '久石让', mood: '纯音乐 · 电影配乐', key: 'High-G · 指弹进阶', bpm: 96, scoreUrl: 'https://ukulelehunt.com/2022/05/05/joe-hisaishi-summer-from-kikujiro-tabs/', sourceUrl: 'https://ukulelehunt.com/2022/05/05/joe-hisaishi-summer-from-kikujiro-tabs/', difficulty: '进阶', route: ['主题动机', '琶音型', '主题 A', '主题 A 变化', '低音连接', '主题 B', '段落衔接', '完整独奏'] },
  ].map((item, index) => ({
    kind: 'fingerstyle' as const, ...item, fit: item.difficulty, fitLabel: index === 0 ? '指弹推荐' : item.difficulty,
    timeSignature: '4/4' as const, chords: [], intro: `按 High-G 调弦学习${item.title}，从单音开始，逐步加入和声。`,
    palette: (['plum', 'blue', 'clay', 'plum'] as const)[index], neteaseTrackId: undefined,
    route: item.route.map((label) => ({ label })),
    courseNote: item.id === 'castle-in-the-sky'
      ? '本课程按你提供的莉莉克丝版本录入：标准调、4/4 拍、约 92 BPM；练习页用 HTML 与 SVG 自行绘制完整 TAB，不显示原图。谱面共 8 行，每行 3 小节，小节号分别从 1、4、7、10、13、16、19、22 开始。'
      : `参考版本：${item.scoreUrl}。课程按 High-G 标准调弦设计；站内 TAB 练习为自制技巧练习，不冒充或复制参考谱中的原曲小节。站内节拍器速度和 4/4 仅为练习设置，不代表参考谱标注；原曲拍号与速度请以该参考谱为准。曲目署名：${item.artist}。`,
  })),
]

const lessonPlans: Record<string, LessonDraft[]> = {
  anheqiao: [
    { title: '先把整首歌听成一张路线图', why: '叙事感来自段落推进。先认路，练到中途就不容易迷失。', section: '原曲结构', focus: '前奏 → 主歌 → 副歌 → 间奏 → 尾奏', scoreCue: '下面已准备好段落路线。按顺序读一遍名称，再沿回环箭头找到重复段回到的位置。', steps: ['完整听一遍原曲，不拿琴，轻拍稳定的四拍。', '看下方路线图，依次读出段落名称。', '沿路线图的回环标记再走一遍，找到回到哪一段。'], success: '能跟着路线图说出段落顺序，并指出结束位置。', chords: [], bpm: 48, simplifiedSteps: ['只听一遍，跟着数四拍。', '看路线图找到开头和结束位置。'], simplifiedSuccess: '能找到这首歌的开头和结尾。' },
    { title: '把 C、D、Em、G 按清楚', why: '先按准参考谱列出的四个和弦；按弦顺序只是认指法，不代表歌曲的和弦进行顺序。', section: '和弦准备', focus: 'C · D · Em · G：按参考谱和弦表逐个练', scoreCue: '已核对参考谱和弦表为 C、D、Em、G。此处练的是四个指法，不代表它们在歌曲中按这个顺序连续出现。', steps: ['先练 C：无名指按 A 弦第 3 品，轻拨四根弦确认发声。', '再练 D、Em、G；每个和弦都对照旁边指法图逐弦检查。', '每次换和弦前先松开手指，再按图重新落指三次。'], success: 'C、D、Em、G 每个和弦都能连续两次清楚发声。', chords: ['C', 'D', 'Em', 'G'], bpm: 48, simplifiedSteps: ['只练 C 和弦，按住 A 弦第 3 品。', '逐弦拨响，松开后再按一次。'], simplifiedSuccess: 'C 和弦能连续两次清楚发声。' },
    { title: '练四组换位，不追求快', why: '换和弦最容易让节拍停下来。把手指移动单独拆出来，之后套回谱面会轻松很多。', section: '和弦转换', focus: 'C↔D · D↔Em · Em↔G · G↔C（换位练习，不代表歌曲顺序）', scoreCue: '这四组是按参考谱和弦表设计的指法练习，不是歌曲和弦进行；真实相邻和弦请看参考谱。', steps: ['先无声摆 C 和 D，各停四拍，来回切换四次。', '再练 D↔Em、Em↔G、G↔C；每次先落最容易定位的手指。', '每组先不扫弦，换好后轻拨四根弦检查，再逐步加拍子。'], success: '四组换位都能慢速往返，落指清楚、拍子不中断。', chords: ['C', 'D', 'Em', 'G'], bpm: 48, simplifiedSteps: ['只练 C↔D，不扫弦。', '先停稳再换，左右各做三次。'], simplifiedSuccess: 'C↔D 慢速来回三次，至少两次声音清楚。' },
    { title: '先稳住四拍，再认原谱节奏', why: '参考谱有 A、B 两种伴奏型；先把拍子数稳，再逐个学习真实伴奏动作，不把入门练习误当成原曲节奏。', section: '右手节奏', focus: '基础四拍下扫（练习底盘，不是原谱 A/B）', scoreCue: '这里的均匀下扫只用于建立稳定拍点。原谱节奏 A、B 的拨弦与扫弦组合不同，请看参考谱上的对应图示。', steps: ['左手轻碰琴弦让它不发音，随节拍器做四拍均匀下扫。', '数拍保持稳定后，打开参考谱找到节奏 A，只练右手动作。', 'A 型稳定后，再单独看节奏 B；不要把两种型混在一起。'], success: '基础四拍能稳定重复，再能在参考谱上找到并区分节奏 A、B。', chords: ['C', 'D'], bpm: 48, pattern: ['↓', '↓', '↓', '↓'], simplifiedSteps: ['消音琴弦，只做四拍下扫。', '每做四拍停一下，重新从第一拍开始。'], simplifiedSuccess: '连续两小节四拍均匀，不抢拍。' },
    { title: '拆练主歌开头两小节', why: '两小节是适合零基础的最小歌曲片段：既能听出音乐，又不必记整段。', section: '主歌 · 开头小句', focus: '参考谱主歌开头连续 2 小节', scoreCue: '从参考谱圈出主歌开头两小节；跟着外部谱上的和弦与节奏走，不在网站复刻谱面。', steps: ['先按谱面和弦，每小节扫一下，确认换位位置。', '用 48 BPM 弹两小节；手忙时回到单独换位练习。', '连续成功两次后升到 56 BPM，再把前奏接到这两小节前面。'], success: '两小节连续弹三遍，和弦顺序照谱、节拍不中断。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只弹第一个和弦所在的一小节。', '每拍一次轻下扫，先不做和弦转换。'], simplifiedSuccess: '能稳定弹完这一小节四拍。' },
    { title: '把主歌、副歌和间奏接起来', why: '器乐演奏的难点常常是段落交界处的进入时机。', section: '主歌 → 副歌 → 间奏', focus: '段尾最后 1 小节 + 下一段开头 1 小节', scoreCue: '用参考谱的段落标记连接，不省略重复段；先慢练，熟悉后接近谱面目标速度。', steps: ['先弹每段最后一小节，确认结束和弦。', '每次只连接相邻两段：段尾一小节接下一段开头一小节。', '连接顺后按参考谱路线弹完整首伴奏，失误时继续数拍。'], success: '照参考谱从前奏到尾奏弹完，不因小错停下或回头重来。', chords: ['G', 'D', 'Em', 'C'], bpm: 56, simplifiedSteps: ['只连接主歌末尾与副歌开头各一小节。', '慢速弹三次，先保证拍子继续。'], simplifiedSuccess: '两小节连接三次，能在拍子上进入副歌。' },
    { title: '在不断拍时轻声加入旋律', why: '先练熟悉的一小句，比第一遍就唱全曲更能保护节奏和嗓子。', section: '主歌 · 弹唱接入', focus: '主歌中选一个舒适音区的小句', scoreCue: '保留参考谱原调；若对嗓音偏高，可轻声低八度唱，不改变伴奏和弦。歌词请使用你自己的合法来源。', steps: ['把主歌伴奏连续弹两遍，确认换和弦不需要盯手。', '不出声，用哼鸣跟一小句旋律；保持右手继续数拍。', '轻声唱这小句，再把前后各一小节伴奏接上。'], success: '能唱完自己选的小句，同时右手节奏不中断；不挤压高音。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只弹主歌第一个和弦，轻声哼一小句。', '暂时不唱词，让呼吸放松。'], simplifiedSuccess: '哼唱时能保持稳定的四拍伴奏。' },
    { title: '完成一遍原调弹唱', why: '最后一步是把技能连成一次完整表达，不是追求没有任何小失误。', section: '全曲 · 完整弹唱', focus: '原曲段落顺序 + 参考谱重复记号 + 尾奏', scoreCue: '按你选定的 G 调弹唱谱演奏，包含重复段、间奏和结尾；站内不复刻整谱或歌词。', steps: ['先用 56 BPM 弹完整首伴奏一次，确认段落和结尾。', '第二遍加入演唱；忘词时继续伴奏，不停下来。', '最后按参考谱目标速度尝试完整弹唱，记下最顺和最卡的一处。'], success: '从前奏开始，按原曲段落完整弹完并唱完，整体连贯度达到约 80%，且不中断。', chords: ['G', 'D', 'Em', 'C'], bpm: 56, simplifiedSteps: ['先只弹完整伴奏，不唱。', '若太长，按参考谱划成两段，分段完成后再连接。'], simplifiedSuccess: '完整伴奏能从头到尾不中断；唱段可以下次再加。' },
  ],
  chengdu: [
    { title: '先认出段落和回环', why: '这首歌段落较长，先搞清重复与连接位置，练习就不必靠死记。', section: '原曲结构', focus: '前奏 · 主歌 · 副歌 · 间奏 · 尾奏', scoreCue: '参考弹唱谱为 6/8 拍；先跟着原曲数成两组三拍：1、2、3 / 4、5、6。段落名称以路线卡为准。', steps: ['听原曲一遍，轻轻数：1、2、3 / 4、5、6。', '看下方路线卡，依次读出段落名称。', '沿着路线卡走一遍，确认重复段回到哪里。'], success: '能跟着原曲保持 6/8 拍点，并说出路线卡上的段落顺序。', chords: [], bpm: 54, simplifiedSteps: ['只听开头，跟着数两组三拍。', '看路线卡找到开头和结尾。'], simplifiedSuccess: '能稳定数完 1、2、3 / 4、5、6。' },
    { title: '把六个和弦分组练熟', why: '一次记六个形状负担太大。先掌握开放和弦，再单独攻克容易卡手的 F 与 Dm。', section: '和弦准备', focus: 'C · G · Em · Am · F · Dm：按参考谱和弦表练', scoreCue: '参考谱和弦清单为 C、G、Em、Am、F、Dm。C 指法夹 2 品对应原调 D；谱头另标女声 0 品、男声 2 品，可按个人音域选择。', steps: ['先练 C、G、Em、Am：逐弦轻拨，确认没有闷音。', '再单练 F 和 Dm：指尖立起、拇指放琴颈后，逐弦检查。', '每个形状按下与放松各三次；手腕累了就停一下。'], success: '六个和弦各至少两次清楚发声；F、Dm 不靠过度用力。', chords: ['C', 'G', 'Em', 'Am', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['今天只练 C 和弦。', '轻拨四弦，确认声音清楚后放松手指。'], simplifiedSuccess: 'C 和弦连续两次四弦都清楚。' },
    { title: '先把常用换位练顺', why: '六个和弦先练熟形状，再逐步放回歌曲；今天先练手指移动，不要求你自己从谱里找答案。', section: '和弦转换', focus: 'C ↔ Am · Am ↔ F（基础换位练习）', scoreCue: '这是为初学设计的换位练习，不声称是原曲连续和弦。真实和弦落点请看完整参考谱；本站尚未把每小节顺序核验为可展示谱例。', steps: ['先按 C，轻拨四根弦；把无名指抬起，按 Am，再轻拨检查。', '练 Am↔F：保持 Am 的手型基础，按图加入 F 所需手指。', '每组慢慢来回五次，手指落稳后再加入轻下扫。'], success: '两组换位都能慢速来回，至少四次声音清楚且不明显停顿。', chords: ['C', 'Am', 'F'], bpm: 54, simplifiedSteps: ['只练 C↔Am，不扫弦。', '每次换完轻拨四弦，再换回来。'], simplifiedSuccess: 'C↔Am 来回三次，至少两次声音清楚。' },
    { title: '先数稳 6/8，再看原谱伴奏型', why: '参考谱是 6/8 拍且只标一种伴奏型。先感受每小节两组三拍，再回到谱面学习原来的拨弦动作。', section: '右手节奏', focus: '1、2、3 / 4、5、6；第 1、4 拍轻下扫（基础练习）', scoreCue: '下方两次下扫只是帮助感受 6/8 两个重拍的入门底盘，不是参考谱唯一的伴奏型。原谱伴奏型含拨弦动作，请按外链谱学习。', steps: ['左手轻碰琴弦消音，慢数 1、2、3 / 4、5、6。', '只在第 1 和第 4 拍轻下扫，其余拍位让声音延续，不加扫弦。', '稳定后打开参考谱的唯一伴奏型，按谱面顺序练拨弦与扫弦。'], success: '连续四小节能数稳两组三拍，并能辨认参考谱中的原伴奏型与本站基础练习不同。', chords: ['C', 'G'], bpm: 54, pattern: ['↓', '·', '·', '↓', '·', '·'], simplifiedSteps: ['只数 1、2、3 / 4、5、6，不拿琴。', '数稳后只在 1 和 4 做轻下扫。'], simplifiedSuccess: '连续两小节数稳六个八分拍位，重拍落在 1 和 4。' },
    { title: '跟参考谱慢练主歌开头', why: '短片段容易专注，也能把今天的和弦练习放回音乐里。', section: '主歌 · 开头', focus: '主歌开头 2 小节 · 跟随你打开的参考谱', scoreCue: '参考谱页面可查看主歌开头。本课程不虚构小节和弦顺序：先按外部谱上标出的和弦名称，本站只提供慢速练法。', steps: ['打开下方完整参考谱链接，进入标注为主歌的开头位置；不需要自行圈谱。', '照着谱上现成的和弦名称，每小节先只在第 1 拍轻扫一次。', '弹顺后再按六拍数法轻扫；换和弦不清楚时，停在当前和弦单独练。'], success: '跟随参考谱弹过主歌开头两小节，拍点不中断；和弦顺序以谱面为准。', chords: ['C', 'G', 'Em', 'Am', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['只选主歌开头第一个和弦，按住并轻扫一次。', '边听节拍边数满 1、2、3 / 4、5、6。'], simplifiedSuccess: '能在一个六拍小节里保持稳定，不必换和弦。' },
    { title: '练习段落之间不停拍', why: '长歌容易在段落切换时停下来；先练“继续数”，再把原曲路线接起来。', section: '主歌 → 副歌 → 间奏', focus: '先不换和弦的六拍连续练习', scoreCue: '路线卡已列出段落顺序和重复位置。完整曲谱中的转段小节仍以链接页面为准；这里不把未经核对的小节写成原谱。', steps: ['跟着节拍器数两小节：1、2、3 / 4、5、6；第 1、4 拍轻下扫。', '看路线卡，从主歌读到副歌、间奏，再读回主歌；不用自己找重复符号。', '打开参考谱跟弹这些段落的连接处，错过和弦也继续数，不停下来重来。'], success: '能按路线卡说出转段顺序，并在慢速跟弹时保持拍子连续。', chords: ['C', 'G', 'Am', 'F'], bpm: 54, simplifiedSteps: ['只数两小节六拍，不拿琴。', '路线卡上依次读“主歌—副歌—间奏”。'], simplifiedSuccess: '能数拍并说出下一段，不因切段停住。' },
    { title: '让人声落在稳定伴奏上', why: '边弹边唱前先让右手形成稳定节拍，注意力才可以留给旋律。', section: '主歌 · 弹唱接入', focus: '选一句舒适音区的旋律：先哼，再轻声唱', scoreCue: '参考谱给出女声 0 品、男声 2 品两种示例；夹弦不是性别规定，按自己的音域调整。练习时可先不夹，必要时轻声低八度唱。', steps: ['用慢速下扫练习弹一个熟悉和弦两小节，按 1、2、3 / 4、5、6 数拍。', '保持右手继续数拍，先用哼鸣唱一句自己熟悉的旋律。', '哼顺后轻声唱；如觉得高或紧，降低八度或调整夹品，不勉强发声。'], success: '完成一句舒适音区的哼唱或弹唱，右手不断拍、不挤嗓。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['边弹一个 C 和弦的六拍，边轻哼。', '先不唱歌词，身体放松。'], simplifiedSuccess: '六拍伴奏和轻哼可以同时保持。' },
    { title: '沿路线完成一遍弹唱', why: '把前面练过的和弦、节奏和段落连起来，目标是完整完成，而不是一次不出错。', section: '全曲 · 完整弹唱', focus: '路线卡中的全部段落、重复与尾奏', scoreCue: '夹弦按音域选择：参考谱标注女声 0 品、男声 2 品。按完整参考谱走原曲结构；网站不复制整份谱或歌词。', steps: ['跟着路线卡从前奏到尾奏走一遍；参考谱用于确认每段真实和弦与伴奏。', '先完整弹伴奏；熟悉后再加入自己选定的演唱段落。', '逐步把速度从舒适慢速提高到参考谱标注速度；夹品以适合自己音域为准。'], success: '按原曲路线从头到尾完成伴奏与弹唱；少量失误后仍继续，整体连贯度达到约 80%。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 68, simplifiedSteps: ['先跟路线卡完整弹伴奏，不唱。', '只在最熟悉的一段加入轻声哼唱。'], simplifiedSuccess: '整首伴奏路线走完，至少一段可以同时哼唱。' },
  ],
  nanshannan: [
    { title: '听出叙事段落与情绪转折', why: '叙事和动态变化比单纯循环更重要，先听懂结构再安排手上动作。', section: '原曲结构', focus: '前奏 · 叙事段 · 情绪展开 · 间奏 · 收尾', scoreCue: '参考教学谱与原曲对照，标注重复、间奏和动态变化。不同编配可能有段落差异，以你选定版本为准。', steps: ['完整听一遍，留意哪段增强、哪段回到安静。', '沿参考谱标出重复记号、间奏与最后收束处。', '轻拍四拍再听一次，只在段落变化时做标记。'], success: '能按所选谱面说出段落路线，并指出一个需要收弱或增强的位置。', chords: [], bpm: 48, simplifiedSteps: ['只听一遍，找到情绪变化最明显的一处。', '在参考谱对应段落做个记号。'], simplifiedSuccess: '能指出一处段落或力度变化。' },
    { title: '先把基础和弦按清楚', why: '这份编配有多个七和弦和挂留和弦。先用熟悉的 C、Am、F、G 建立手感，再试一个特色和弦。', section: '和弦准备', focus: 'C · Am · F · G；认识 Fmaj7', scoreCue: '基础和弦图与 Fmaj7 指法图都在下面；先按熟悉的形状，再看一个新形状。', steps: ['先按 C 和弦，逐根拨响四弦。', '再练 Am、F、G，每次只换一个手指位置。', '看 Fmaj7 图，试着按一次；今天认识它就可以。'], success: 'C、Am、F、G 能各自清楚发声，并认出 Fmaj7 的手指位置。', chords: ['C', 'Am', 'F', 'G', 'Fmaj7'], bpm: 48, simplifiedSteps: ['只练 C 和弦，逐弦拨清楚。', '今天先不处理特色和弦。'], simplifiedSuccess: 'C 和弦连续两次四弦都清楚。' },
    { title: '练一组简单和弦转换', why: '先把熟悉的和弦换顺，再把特色和弦逐步放进歌曲。', section: '和弦转换', focus: 'C ↔ G · Am ↔ F', scoreCue: '下面的小节卡把每个和弦放在小节开头，先不急着套入整首歌。', steps: ['先按 C，数四拍后换到 G。', '练 Am ↔ F，每次换完轻拨四弦。', '稳定后把每个和弦保持一小节，再按图中顺序切换。'], success: 'C↔G 与 Am↔F 各慢速往返三次，节拍不中断。', chords: ['C', 'G', 'Am', 'F'], bpm: 48, simplifiedSteps: ['只练 C↔G，不扫弦。', '每次换好后轻拨四根弦。'], simplifiedSuccess: 'C↔G 往返三次，至少两次声音清楚。' },
    { title: '用轻重变化托住叙事节奏', why: '先稳定拍点再做强弱变化，避免右手越弹越快。', section: '右手节奏与力度', focus: '均匀四拍 + 段落强弱：弱 → 稍强 → 回弱', scoreCue: '这里是拆手用的基础练习，不是原曲节奏转录。最终按所选教学谱和原曲还原。', steps: ['消音练四拍下扫，保持 48 BPM 不变化。', '每小节第一拍稍清楚、其余轻一点；不要靠加快制造情绪。', '选参考谱一个段落，把强弱分成轻、适中两档。'], success: '连续四小节拍点稳定，并做出一次清楚但克制的强弱变化。', chords: ['C', 'Em', 'G'], bpm: 48, pattern: ['↓', '↓', '↓', '↓'], simplifiedSteps: ['只做四拍均匀下扫。', '每小节第一拍听得清楚。'], simplifiedSuccess: '两小节速度均匀，没有越弹越快。' },
    { title: '把主歌开头拆成两小节', why: '把和弦放进短片段里练，能听见变化，也不用一下记完整首歌。', section: '主歌 · 两小节片段', focus: 'C · Em · F · G 基础和弦片段', scoreCue: '按下方两小节示范练手；原曲的逐小节和弦仍以外部参考谱为准。', steps: ['先看每小节上方的和弦名称，跟着数拍。', '48 BPM 每小节轻扫一次，按小节卡换和弦。', '稳定两遍后加上均匀下扫，仍只练这两小节。'], success: '两小节连续弹三遍，换和弦时拍子不中断。', chords: ['C', 'Em', 'F', 'G'], bpm: 48, simplifiedSteps: ['只练第一小节的 C 和弦。', '每拍轻下扫一次，数满四拍。'], simplifiedSuccess: '能稳定弹完这一小节四拍。' },
    { title: '连起段落并保留力度变化', why: '先解决段落连接，再加回动态，完整演奏才会既不断线又不平。', section: '主歌 → 连接段 → 收尾', focus: '转段前后各 1 小节；特色和弦逐步加回', scoreCue: '先用熟悉的和弦走顺路线，再按示范卡加入谱里的特色和弦。', steps: ['跟路线图依次弹主歌、连接段和收尾。', '每次只连接相邻两段；连顺后再加轻、适中两档力度。', '失误后继续数拍，不从头重来。'], success: '能照路线图从前奏弹到尾声，段落顺序正确且不中途重来。', chords: ['C', 'Am', 'F', 'G', 'Fmaj7', 'G7'], bpm: 60, simplifiedSteps: ['只连接一处相邻段落。', '段落边界前数满四拍，再进入下一段。'], simplifiedSuccess: '能准确进入下一段，不把节拍停掉。' },
    { title: '先哼唱，再加入一小句歌词', why: '先确认伴奏和呼吸协调，再加歌词；自然表达比勉强追高音重要。', section: '主歌 · 弹唱接入', focus: '先哼旋律，再轻声唱熟悉的一句', scoreCue: '按自己的舒适音区轻声唱；伴奏继续跟拍，嗓音不舒服就回到哼唱。', steps: ['弹主歌伴奏两遍，注意换和弦前留出自然呼吸。', '第三遍只哼旋律；右手继续稳定数拍。', '哼顺后试唱同一小句，再扩到相邻小节。'], success: '完成一小句弹唱，换气自然，右手不断拍且不挤嗓。', chords: ['C', 'Am', 'F', 'G', 'Fmaj7', 'G7'], bpm: 48, simplifiedSteps: ['只弹一个和弦并哼四拍。', '音量放轻，先不唱歌词。'], simplifiedSuccess: '可以边保持四拍边轻哼。' },
    { title: '从头到尾完成自己的原曲版本', why: '目标是完整讲完这首歌：段落准确、伴奏持续、演唱舒服。', section: '全曲 · 完整弹唱', focus: '路线图中的全部段落与收尾', scoreCue: '按路线图从头到尾完成，再对照外部参考谱补回原编配中的特色和弦。', steps: ['先用 60 BPM 走一遍全曲伴奏，确认每段入口和结尾。', '第二遍加入熟悉段落的演唱，间奏和转段继续弹、不停表。', '稳定后逐步提高到参考谱目标速度，记下最难的一处。'], success: '按参考谱从头到尾完成器乐伴奏和弹唱，整体连贯度达到约 80%；错音后仍继续。', chords: ['Fmaj7', 'G7', 'Em7', 'Am', 'Dm7', 'C', 'Dm', 'G', 'Cadd9', 'Gsus2', 'C7', 'F'], bpm: 60, simplifiedSteps: ['完整弹伴奏但暂不唱。', '只在最熟悉的一段加入轻声哼唱。'], simplifiedSuccess: '整首伴奏线路能走完，至少一段可以同时哼唱。' },
  ],
}

const fingerstyleGoals = [
  ['认识四线谱和调弦', '看懂 TAB 上每一行代表哪根弦，以及数字代表品位。', 'G、C、E、A 四根弦由上到下；0 是空弦，不按左手。', [{ string: 'G', fret: 0 }, { string: 'C', fret: 0 }, { string: 'E', fret: 0 }, { string: 'A', fret: 0 }]],
  ['右手逐弦拨奏', '拇指负责 G/C 弦，食指拨 E 弦，中指拨 A 弦；动作小而放松。', '先拨 G、再 C、E、A；每音听清后再拨下一个。', [{ string: 'G', fret: 0, finger: '拇指' }, { string: 'C', fret: 0, finger: '拇指' }, { string: 'E', fret: 0, finger: '食指' }, { string: 'A', fret: 0, finger: '中指' }]],
  ['单音旋律与左手落指', '先把一根弦的音弹清楚，再加入左手按品，避免同时顾太多动作。', '本卡是自制指法练习，不是原曲旋律；数字是品位，先逐音弹。', [{ string: 'A', fret: 0, finger: '空弦' }, { string: 'A', fret: 1, finger: '食指' }, { string: 'A', fret: 3, finger: '无名指' }, { string: 'E', fret: 0, finger: '空弦' }]],
  ['加入一个和声音', '同时拨两根弦，练习让旋律音和低音一起发声。', '同一拍的两个点要同时拨；先慢慢数拍，不追求原曲速度。', [{ string: 'G', fret: 0 }, { string: 'A', fret: 0 }, { string: 'C', fret: 0 }, { string: 'E', fret: 1 }]],
  ['前段分小句慢练', '把参考版本的前段拆成短句；本站练习卡先练同类拨弦动作。', '先练下面的自制两小节手型，再打开参考谱对照前段，不需要自行圈段。', [{ string: 'A', fret: 0 }, { string: 'E', fret: 0 }, { string: 'C', fret: 0 }, { string: 'E', fret: 1 }]],
  ['后段分小句慢练', '后段常有音型变化；先逐拍拨清楚，再按参考谱接回原曲。', '这仍是自制技巧练习，不是原曲逐音谱；按顺序弹完四个音即可。', [{ string: 'G', fret: 0 }, { string: 'C', fret: 2 }, { string: 'E', fret: 3 }, { string: 'A', fret: 2 }]],
  ['连接两段并保持拍点', '演奏连贯的关键是段落交界处不停拍。', '先弹自制练习两遍，再按参考谱的段落顺序连接，不确定的小节以参考谱为准。', [{ string: 'A', fret: 0 }, { string: 'E', fret: 1 }, { string: 'C', fret: 0 }, { string: 'G', fret: 0 }]],
  ['完整独奏回到原曲', '把学过的拨弦动作放回所选参考编配，完成一遍完整独奏。', '先以舒适慢速分段完成，之后逐步回到参考版本速度和结构。', [{ string: 'G', fret: 0 }, { string: 'C', fret: 0 }, { string: 'E', fret: 0 }, { string: 'A', fret: 0 }]],
] as const

const skyScoreLessons: Partial<LessonDraft>[] = [
  { title: '先认识这份参考谱', why: '先认清这张谱的调弦、读谱方向和小节编号，后面每一步都能直接找到位置。', section: '整页原谱', focus: '8 行 · 每行 3 小节 · 4/4 · 约 92 BPM', scoreCue: '网页内原谱的八行分别从小节号 1、4、7、10、13、16、19、22 开始。本页谱卡会显示完整原谱，可按这些编号找到练习位置。', steps: ['查看下方网页内原谱，确认从上到下的弦名是 A、E、C、G。', '每行左上角的小节号依次是 1、4、7、10、13、16、19、22；每行包含 3 小节。', '数字表示品位，0 表示空弦；上下对齐的数字同时拨，横向从左到右读。'], success: '能找到第 1 行和第 22 小节，并说出 0 代表空弦。', simplifiedSteps: ['只看第 1 行，找到小节号 1。', '指出 TAB 最上面的 A 弦和最下面的 G 弦。'], simplifiedSuccess: '能找到第 1 小节，并认出 A 弦与 G 弦。' },
  { title: '跟弹原谱第 1–3 小节', why: '先沿网页内原谱第一行从头练一遍，熟悉按弦与拨弦的配合。', section: '原谱第 1–3 小节', focus: '第 1 行 · 小节号 1、2、3', scoreCue: '网页内原谱第一行左上角标着 1，依次练完这一行的三个小节。本步直接对照网页内原谱练习。', steps: ['找到第一行左上方的印刷小节号“1”。', '从左到右逐个看 TAB 数字；先确认所在弦，再按对应品位，0 不用按。', '一拍一拍跟原谱拨完第 1、2、3 小节；上下对齐的数字同时拨。'], success: '能跟原谱弹完第 1–3 小节，弦和品位对应正确，慢速不中断。', simplifiedSteps: ['只练第 1 小节第一组音。', '先指出每个数字所在的弦和品位，再慢慢拨响。'], simplifiedSuccess: '第 1 小节开头一组音能按谱弹对。' },
  { title: '单独读弹第 1 小节', why: '缩小到一小节，集中练会读弦、认品位和辨认同时拨奏。', section: '原谱第 1 小节', focus: '第 1 行 · 只练小节号 1', scoreCue: '网页内原谱第一行包含第 1–3 小节；今天只看左侧的第 1 小节。', steps: ['在第一行找到第一个小节，从最左侧的音开始。', '确认数字所在弦：上到下 A、E、C、G；0 是空弦，其他数字是品位。', '按原谱节奏拨完第 1 小节；上下对齐的数字同时拨。'], success: '能按原谱弹完第 1 小节，弦、品位和同时拨奏都读对。', simplifiedSteps: ['只弹第 1 小节开头第一组数字。', '先指出每个数字对应的弦和品位，再拨弦。'], simplifiedSuccess: '能正确读出并弹响第 1 小节开头。' },
  { title: '照原谱练第 4–6 小节', why: '第二行从第 4 小节开始；按这一行的印刷编号继续，不会和第一行错位。', section: '原谱第 4–6 小节', focus: '第 2 行 · 小节号 4、5、6', scoreCue: '参考谱第二行左上角标号“4”，练完这一行三个小节。', steps: ['在网页内谱卡第二行找到小节号“4”，依次练第 4、5、6 小节。', '数字对应所在弦的品位；空弦 0 不按，左手指尖靠近品丝按下。', '先逐小节弹对，再连弹三小节；同一拍上下对齐的数字一起拨。'], success: '能按谱完成第 4–6 小节，按弦不闷音，节拍不中断。', simplifiedSteps: ['只练第 4 小节第一拍的音。', '逐根确认弦和品位，再继续下一音。'], simplifiedSuccess: '第 4 小节开头一拍的音能弹清楚。' },
  { title: '慢练原谱第 7–9 小节', why: '继续按网页内原谱第三行练习，把新一行的指法放进稳定拍点里。', section: '原谱第 7–9 小节', focus: '第 3 行 · 小节号 7、8、9', scoreCue: '网页内原谱第三行左上角标号为“7”；这一步对应完整一行，共三个小节。', steps: ['找到第三行标号“7”，先单独弹第 7 小节。', '再按谱弹第 8、9 小节；相邻音之间放松手指，不要抢拍。', '把第 7–9 小节连弹两遍，错音后继续跟拍，结束后再回看错处。'], success: '第 7–9 小节能从头连到尾，错音时不丢失拍点。', simplifiedSteps: ['今天只弹第 7 小节。', '每一拍先读弦和品位，再慢慢拨弦。'], simplifiedSuccess: '第 7 小节可以慢速弹完。' },
  { title: '慢练原谱第 10–18 小节', why: '这一步覆盖网页内原谱中间连续三行，按每行左侧的小节号分组练习。', section: '原谱第 10–18 小节', focus: '第 4–6 行 · 小节号 10、13、16', scoreCue: '网页内原谱中标号 10、13、16 的三行，每行三个小节；不要把行号当成需要跳过的小节。', steps: ['按参考谱先练第 10–12 小节，再练第 13–15 小节。', '接着练第 16–18 小节；每次上下对齐的数字一起拨。', '把第 10–18 小节连起来，节拍器先用 48 BPM。'], success: '第 10–18 小节按网页内原谱分行练完并能慢速连弹。', simplifiedSteps: ['只练第 10–12 小节。', '读准弦和品位后再逐音弹。'], simplifiedSuccess: '第 10–12 小节能慢速弹完。' },
  { title: '慢速连接原谱全曲', why: '把已经分行练过的内容按网页内原谱顺序连起来，先保持拍子不断。', section: '原谱第 1–24 小节', focus: '第 1–8 行 · 小节号 1–24', scoreCue: '按网页内原谱的起始号依次换行：1、4、7、10、13、16、19、22，完整走到第 24 小节。', steps: ['每行先单独弹一遍，再按谱面顺序连接相邻两行。', '第 19–24 小节也要弹到；遇到卡点仍继续数拍，不要求马上达到原速。', '从第 1 小节慢速连到第 24 小节，最后一个音按谱面收住。'], success: '能以慢速按谱从第 1 小节连续弹到第 24 小节。', simplifiedSteps: ['只连接第 1–3 行（第 1–9 小节）。', '熟悉后再连接剩下的行。'], simplifiedSuccess: '第 1–9 小节可以连续慢弹。' },
  { title: '按原谱 92 BPM 完整独奏', why: '最后一遍沿用同一张谱，从第 1 小节走到第 24 小节，逐步回到标注速度。', section: '原谱第 1–24 小节', focus: '第 1–8 行 · 4/4 · 约 92 BPM', scoreCue: '参考谱的速度标注为约 92 BPM。仍按每行起始小节号 1、4、7、10、13、16、19、22 顺序演奏。', steps: ['先用已经稳定的速度弹完整首，确认八行都弹到。', '每次把节拍器提高少量，逐步接近 92 BPM，不删音也不改节奏。', '最后按谱从头到尾完成一遍；错音后继续，不从头重来。'], success: '按参考谱从第 1–24 小节完整独奏，整体连贯度达到约 80%。', simplifiedSteps: ['回到能稳定弹完的慢速完成全曲。', '只在全曲稳定后再尝试提高 BPM。'], simplifiedSuccess: '可以按原谱从头到尾完成，不因失误停下。' },
]

export const SONGS: Song[] = songConfigs.map((song) => ({
  ...song,
  tasks: (song.kind === 'fingerstyle' ? fingerstyleGoals.map(([title, why, cue, notes], index) => ({
    title: `${song.title} · ${title}`, why, section: song.route[Math.min(index, song.route.length - 1)].label,
    focus: index < 2 ? 'High-G 调弦 · G、C、E、A 弦' : `参考段落：${song.route[Math.min(index, song.route.length - 1)].label}`,
    scoreCue: `${cue} 当前 TAB 是拾艺自制技巧练习，不是原曲谱；完整编配请打开固定参考版本。`,
    steps: index === 0
      ? ['把琴拿成演奏姿势，确认从上到下四根弦是 G、C、E、A（High-G）。', '看 TAB：一条横线是一根弦；0 表示空弦，数字 1、2、3 表示左手按第几品。', '按图从左到右弹四个空弦音，每个音听清再继续。']
      : index === 1
        ? ['右手拇指轻拨 G 弦和 C 弦，食指拨 E 弦，中指拨 A 弦。', '照 TAB 从左到右每次只拨一个音，左手先不按弦。', '每个音留一点时间自然延长，不要用力勾弦。']
        : index === 2
          ? ['左手食指按 A 弦第 1 品，指尖靠近品丝但不要压在品丝上。', '无名指按 A 弦第 3 品；松开后先拨空弦，再依次弹 1 品、3 品。', '最后弹 E 空弦，确认每个音清楚、不碰到旁边的弦。']
          : index === 3
            ? ['先单独弹 TAB 的第一个音，再找到第二个音对应的弦。', '在同一个拍点同时拨 G 弦和 A 弦；若困难，先分开弹再合起来。', '照图完成两组音，检查两个音都能听见。']
            : index < 6
              ? ['打开参考谱，按课程已标出的段落名进入今天这一段，不用自己找段落。', '先看本站自制 TAB，慢速弹清楚每个音；每次只练一小句。', '熟悉后回到参考谱，跟着该段落的原曲音符练；不确定的音以谱面为准。']
              : ['先把前段和后段各自慢速弹一遍。', '按照参考谱的段落顺序连接；连接处继续数拍，不停下来重来。', '最后尝试从头到尾完成完整独奏；速度以清晰、稳定为先，再向参考版本靠近。'],
    success: index < 2 ? '能按顺序清楚弹完图上的四个音，手腕放松。' : index === 3 ? '能慢速完成两个同时拨奏的拍点，两个音都清楚。' : index === 7 ? '能按所选参考版本从头到尾独奏一遍，整体连贯度达到约 80%。' : '能按参考谱完成今天这一个段落练习，音符顺序清楚，拍点不中断。',
    chords: [], bpm: index < 2 ? 48 : Math.max(48, Math.round(song.bpm * 0.55)), tab: notes.map((note, noteIndex) => ({ ...note, beat: index === 3 ? Math.floor(noteIndex / 2) : noteIndex })), simplifiedSteps: ['只弹 TAB 的前两个音，一次专注一个音。', '左手按住图上标出的品位，再轻拨对应弦；两个音之间停一下。'], simplifiedSuccess: '能慢慢弹清楚前两个音，弦和品位正确。',
  })) : lessonPlans[song.id]).map((draft, index) => {
    const isCastleReferenceCourse = song.id === 'castle-in-the-sky'
    const skyLesson = isCastleReferenceCourse ? skyScoreLessons[index] : undefined
    const lesson = skyLesson ? { ...draft, ...skyLesson, tab: undefined, bpm: index === 7 ? 92 : 48 } : draft
    const focusChords = song.chords.filter((chord) => lesson.focus.includes(chord))
    const chords = song.kind === 'fingerstyle' ? [] : focusChords.length > 0 ? focusChords : lesson.chords.length > 0 ? lesson.chords : [song.chords[0]]
    const pattern = 'pattern' in lesson ? lesson.pattern : undefined
    const rhythm = pattern?.length === 4 ? pattern : ['↓', '↓', '↓', '↓']
    const scoreTitles = song.kind === 'fingerstyle'
      ? ['从第一个音开始', '练右手拨弦', '跟着旋律 TAB 弹', '把旋律和伴奏合起来', '慢练前半段', '慢练后半段', '连接完整段落', '从头到尾完整独奏']
      : ['先弹出歌曲开头', '认识今天用到的和弦', '练和弦与旋律的配合', '跟着谱面节奏弹', '慢练前半段', '慢练后半段', '完整弹一遍伴奏', '从头到尾完成弹唱']
    const scoreSteps = song.kind === 'fingerstyle'
      ? [
          ['看今天显示的第 1 小节，从左到右找到第一个数字。', 'TAB 从上到下是 A、E、C、G 弦；数字是品位，0 就是不用按的空弦。', '按谱拨出这一小节的音，先听清楚再继续。'],
          ['先按谱面数字找到对应弦和品位，再拨对应的弦。', '右手拇指拨 G、C 弦，食指拨 E 弦，中指拨 A 弦。', '跟着下方谱面逐音弹；同一拍对齐的数字要一起拨。'],
          ['先只弹标成“旋律”的音符，按谱面从左到右读。', '数字 0 不按弦；其他数字按对应品位，左手指尖靠近品丝。', '每个音都听清楚后，再连着弹完当前谱段。'],
          ['先按小节上方的和弦提示摆好左手；点“看指法”可放大图。', '只弹谱面标成“伴奏音”的数字，留意同一拍一起拨的音。', '最后把旋律音和伴奏音按谱面合起来慢弹。'],
          ['今天谱面已定位在歌曲前半段，先看每小节上方的段落和弦。', '每次只弹一小节；弹稳后点“下一段”继续，不用跳出网页找谱。', '卡住时选“还没掌握”，谱面会缩到一个小节。'],
          ['今天谱面已定位在歌曲后半段，先试听当前谱段。', '跟着 TAB 逐小节弹；对齐的数字同时拨，延长线表示让声音继续。', '弹完后用“下一段”走到结尾，暂时不追求原速。'],
          ['点“按节拍自动翻页”，让谱面按当前速度前进；需要时可暂停。', '跟着段落顺序从开头弹到结尾，翻页时继续数拍。', '再慢速完整走一遍，重点练顺段落连接。'],
          ['按“按节拍自动翻页”开始完整独奏；任何时候都可以暂停。', '按屏幕上的完整段落顺序演奏，旋律与伴奏都以谱卡为准。', '失误后继续跟拍，最后一个小节结束后再停。'],
        ][index]
      : [
          ['看谱面上方的和弦字母，再看下面 TAB 的第一个音。', 'TAB 从上到下是 A、E、C、G 弦；0 是空弦，数字是品位。', '先照谱弹完这个小节：可以先只弹旋律 TAB，再按提示扫弦。'],
          ['点谱面小节上方的和弦按钮，打开大图看每根弦按几品。', '按好和弦后逐根拨 G、C、E、A 弦；有杂音就调整手指。', '今天只要把谱面出现的和弦按清楚，不需要背和弦名称。'],
          ['先弹谱面 TAB 上的旋律音，留意小节上方何时换和弦。', '单独练和弦转换：换好后轻拨四根弦确认没有闷音。', '把旋律和和弦变化放在一起慢弹一遍。'],
          ['看四线谱下方的箭头：↓ 是下扫，↑ 是上扫。', '小节数字是拍点；同一位置的旋律音与扫弦按谱面一起演奏。', '先只做右手节奏，再加上左手和弦与 TAB 旋律。'],
          ['谱面已定位在歌曲前半段；按“上一段 / 下一段”逐页学习。', '先按和弦、再弹 TAB，最后加上箭头所示的扫弦。', '稳定后连接前半段；遇到困难就切到单小节降级练习。'],
          ['谱面已定位在歌曲后半段；先试听当前这一页。', '看小节上方的和弦提示，在对应位置换和弦。', '逐页弹到尾奏；当前目标是顺下来，不要求原速。'],
          ['点“按节拍自动翻页”，跟着完整谱面走一遍伴奏。', '先只弹和弦与扫弦，页面会按拍点切换，不用腾手翻页。', '伴奏稳定后轻声哼唱熟悉旋律，继续保持节拍。'],
          ['从谱卡第一个小节开始，按段落顺序完整弹到最后。', '边弹边唱舒适音区里的旋律；不舒服时可先哼唱。', '错音后继续跟拍，整首结束后再确认是否完成。'],
        ][index]
    const reducedScoreSteps = song.kind === 'fingerstyle'
      ? ['已把谱面缩到当前练习的第一个小节。', '一次只拨一个音；看清弦和品位后再弹，不用同时顾整段。']
      : ['已把谱面缩到当前练习的第一个小节。', '先只按住小节上方的和弦，轻扫或拨响一次；稳定后再加入 TAB。']
    const scoreSection = index === 4 ? '歌曲前半段' : index === 5 ? '歌曲后半段' : index >= 6 ? '完整歌曲路线' : song.route[Math.min(index, song.route.length - 1)].label
    const targetBpm = song.id === 'chengdu' ? 61 : song.bpm
    const taskBpm = song.id === 'chengdu' && index === 7 ? targetBpm : lesson.bpm
    return {
      ...lesson,
      title: isCastleReferenceCourse ? lesson.title : `${song.title} · ${scoreTitles[index]}`,
      section: isCastleReferenceCourse ? lesson.section : scoreSection,
      bpm: taskBpm,
      why: isCastleReferenceCourse ? lesson.why : index === 0
        ? '第一天就从这首歌的实际教学谱音符开始；今天只需要弹出眼前这一小节。'
        : song.kind === 'fingerstyle'
          ? '把旋律拆成小段、逐步加入伴奏音，既能听见曲子，也不会一次练太多。'
          : '和弦、旋律和节奏都直接标在下方谱卡里；分层练熟后再合起来。',
      focus: isCastleReferenceCourse ? lesson.focus : `${lesson.section} · ${song.kind === 'fingerstyle' ? '旋律 TAB 与伴奏音' : '和弦、旋律 TAB 与扫弦'}`,
      scoreCue: isCastleReferenceCourse ? lesson.scoreCue : `下方谱卡是“拾艺教学编配”，已直接绘出今天要弹的小节。${song.kind === 'fingerstyle' ? '先看旋律音，再逐步加入伴奏音。' : '小节上方显示和弦，四线谱显示旋律 TAB，箭头显示扫弦方向。'}不需要打开或另找外部曲谱。`,
      steps: isCastleReferenceCourse ? lesson.steps : scoreSteps,
      simplifiedSteps: isCastleReferenceCourse ? lesson.simplifiedSteps : reducedScoreSteps,
      success: isCastleReferenceCourse ? lesson.success : index === 7
        ? song.kind === 'fingerstyle' ? '能跟着站内谱卡从头到尾完成独奏，整首连贯度达到约 80%。' : '能跟着站内谱卡从头到尾完成伴奏与弹唱，整首连贯度达到约 80%。'
        : `能跟着今天显示的谱段完成练习；遇到错音仍能继续保持拍点。`,
      simplifiedSuccess: isCastleReferenceCourse ? lesson.simplifiedSuccess : '能慢速完成当前缩小后的谱段；手指放松，音符清楚即可。',
      scoreGuide: {
        section: lesson.section,
        timeSignature: song.timeSignature,
        bars: song.kind === 'fingerstyle' ? [] : [
          { chord: chords[0] ?? 'C', beats: song.timeSignature === '6/8' ? ['↓', '·', '·', '↓', '·', '·'] : rhythm },
          { chord: chords[1] ?? chords[0] ?? 'C', beats: song.timeSignature === '6/8' ? ['↓', '·', '·', '↓', '·', '·'] : rhythm },
        ],
      },
      id: `${song.id}-stage-${index + 1}`,
      songId: song.id,
      stage: index + 1,
      stageName: song.kind === 'fingerstyle' ? FINGERSTYLE_STAGES[index] : STAGES[index],
      tempoSteps: [taskBpm, Math.round((taskBpm + targetBpm) / 2), targetBpm],
    }
  }),
}))

export const CHORDS: Record<ChordName, { frets: number[]; fingers: number[]; hint: string }> = {
  C: { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], hint: '无名指按住 A 弦第 3 品' },
  Am: { frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0], hint: '中指按住 G 弦第 2 品' },
  F: { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], hint: '食指按 E 弦第 1 品，中指按 G 弦第 2 品' },
  G: { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], hint: '食指按 C 弦第 2 品，无名指按 E 弦第 3 品，中指按 A 弦第 2 品' },
  Em: { frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], hint: '三根手指按住 C、E、A 弦的第 4、3、2 品' },
  E: { frets: [1, 4, 0, 2], fingers: [1, 4, 0, 2], hint: '先放慢速度，依次找到 G、C、A 弦上的手指位置' },
  D: { frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0], hint: '食指、中指、无名指并排按住前三根弦第 2 品' },
  Dm: { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], hint: '食指按 E 弦第 1 品，另外两指按 G、C 弦第 2 品' },
  Bm: { frets: [4, 2, 2, 2], fingers: [3, 1, 1, 1], hint: '食指横按 C、E、A 弦第 2 品，无名指按 G 弦第 4 品' },
  G7: { frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], hint: '中指按 C 弦第 2 品，食指按 E 弦第 1 品，无名指按 A 弦第 2 品' },
  Fmaj7: { frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0], hint: '中指按 G 弦第 2 品，其余三根弦空弦弹奏' },
  Em7: { frets: [0, 2, 0, 2], fingers: [0, 2, 0, 3], hint: '中指按 C 弦第 2 品，无名指按 A 弦第 2 品' },
  Dm7: { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4], hint: '食指按 E 弦第 1 品；中指、无名指、小指分别按 G、C、A 弦' },
  Cadd9: { frets: [0, 2, 0, 3], fingers: [0, 1, 0, 3], hint: '食指按 C 弦第 2 品，无名指按 A 弦第 3 品' },
  Gsus2: { frets: [0, 2, 3, 0], fingers: [0, 1, 3, 0], hint: '食指按 C 弦第 2 品，无名指按 E 弦第 3 品' },
  C7: { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1], hint: '食指按 A 弦第 1 品，其余三根弦空弦弹奏' },
}

export function findSong(songId: string | null | undefined) {
  return SONGS.find((song) => song.id === songId)
}

export function findTask(song: Song | undefined, taskId: string | undefined) {
  return song?.tasks.find((task) => task.id === taskId)
}
