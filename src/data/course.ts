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
  scoreGuide: {
    section: string
    timeSignature: '4/4' | '6/8'
    bars: { chord: ChordName; beats: string[] }[]
  }
}

export type SongRouteStop = { label: string; repeatTo?: string }

export type Song = {
  id: string
  title: string
  artist: string
  mood: string
  key: string
  bpm: number
  timeSignature: '4/4' | '6/8'
  chords: ChordName[]
  intro: string
  fit: string
  fitLabel: string
  palette: 'plum' | 'clay' | 'blue'
  sourceUrl: string
  scoreUrl: string
  neteaseTrackId: number
  route: SongRouteStop[]
  courseNote: string
  tasks: LessonTask[]
}

export const STAGES = ['认识歌曲', '单个和弦', '和弦转换', '节奏型', '分段慢练', '完整演奏', '加入演唱', '完整弹唱']

type LessonDraft = Omit<LessonTask, 'id' | 'songId' | 'stage' | 'stageName' | 'tempoSteps' | 'scoreGuide'>

const songConfigs: Omit<Song, 'tasks'>[] = [
  { id: 'anheqiao', title: '安和桥', artist: '宋冬野', mood: '安静 · 民谣', key: 'G 调参考弹唱谱', bpm: 65, timeSignature: '4/4', chords: ['G', 'D', 'Em', 'C'], intro: '先认段落，再从四个开放和弦走进完整弹唱。', fit: '最适合从这里起步', fitLabel: '推荐起点', palette: 'plum', sourceUrl: 'https://music.163.com/#/song?id=27646205', scoreUrl: 'https://www.ukuleleba.com/22127.html', neteaseTrackId: 27646205, route: [{ label: '前奏' }, { label: 'A 段' }, { label: 'B 段' }, { label: 'A 段再现' }, { label: 'B 段再现', repeatTo: 'B 段' }, { label: '尾奏' }], courseNote: '课程参考莉莉克丝 G 调编配；所选页面标注四个和弦、两种伴奏型，速度约 65 BPM。站内示范小节用于练习动作，完整编配请看参考谱。' },
  { id: 'chengdu', title: '成都', artist: '赵雷', mood: '温柔 · 民谣', key: 'C 指法 · 夹 2 品为原调', bpm: 91, timeSignature: '6/8', chords: ['C', 'G', 'Em', 'Am', 'F', 'Dm'], intro: '先抓住六个和弦和长歌段落，再逐步连成弹唱。', fit: '适合练习和弦转换', fitLabel: '循序渐进', palette: 'clay', sourceUrl: 'https://music.163.com/#/song?id=436514312', scoreUrl: 'https://www.ukuleleba.com/22137.html', neteaseTrackId: 436514312, route: [{ label: '前奏' }, { label: '主歌 A' }, { label: '主歌 B' }, { label: '副歌 1' }, { label: '间奏' }, { label: '主歌再现' }, { label: '副歌 2', repeatTo: '副歌 1' }, { label: '尾奏' }], courseNote: '课程参考莉莉克丝 C 指法编配；谱面为 6/8 拍，唱原调建议夹 2 品，标注六个和弦、一种伴奏型，速度约 91 BPM。站内示范小节用于练习动作，完整编配请看参考谱。' },
  { id: 'nanshannan', title: '南山南', artist: '马頔', mood: '叙事 · 民谣', key: 'C 调参考编配', bpm: 65, timeSignature: '4/4', chords: ['Fmaj7', 'G7', 'Em7', 'Am', 'Dm7', 'C', 'Dm', 'G', 'Cadd9', 'Gsus2', 'C7', 'F'], intro: '先听懂段落的轻重，再挑战谱里的色彩和弦。', fit: '适合进入下一阶段', fitLabel: '稍有挑战', palette: 'blue', sourceUrl: 'https://music.163.com/#/song?id=29715551', scoreUrl: 'https://www.ukuleleba.com/915.html', neteaseTrackId: 29715551, route: [{ label: '前奏' }, { label: '主歌一' }, { label: '主歌二' }, { label: '主歌三' }, { label: '尾声' }], courseNote: '参考缘起 ukulele 教学及配套谱；该版本为 C 调、4/4 拍、约 65 BPM，并用到七和弦与挂留和弦。课程先练基础动作，完整编配请看参考谱。' },
]

const lessonPlans: Record<string, LessonDraft[]> = {
  anheqiao: [
    { title: '先把整首歌听成一张路线图', why: '叙事感来自段落推进。先认路，练到中途就不容易迷失。', section: '原曲结构', focus: '前奏 → 主歌 → 副歌 → 间奏 → 尾奏', scoreCue: '下面已准备好段落路线。按顺序读一遍名称，再沿回环箭头找到重复段回到的位置。', steps: ['完整听一遍原曲，不拿琴，轻拍稳定的四拍。', '看下方路线图，依次读出段落名称。', '沿路线图的回环标记再走一遍，找到回到哪一段。'], success: '能跟着路线图说出段落顺序，并指出结束位置。', chords: [], bpm: 48, simplifiedSteps: ['只听一遍，跟着数四拍。', '看路线图找到开头和结束位置。'], simplifiedSuccess: '能找到这首歌的开头和结尾。' },
    { title: '把 G、D、Em、C 按清楚', why: '这组开放和弦构成本课的主要指法词汇；单个和弦清楚，后面才有余力顾节奏。', section: '和弦准备', focus: 'G · D · Em · C：先按、再逐弦检查', scoreCue: '参考谱采用 G 调指法。和弦列表是练习准备，不代表它们按同一顺序出现；以你打开的谱面为准。', steps: ['先练 G：手指贴近品丝，轻拨 G、C、E、A 四弦。', '依次检查 D、Em、C；有闷音就一根手指一根手指调整。', '每个和弦放松手掌后重新按三次，记住手指落点。'], success: 'G、D、Em、C 各连续三次清楚发声，且手腕没有明显紧绷。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只练 G 和弦，逐弦拨响四根弦。', '放松后再按一次，检查有没有闷音。'], simplifiedSuccess: 'G 和弦能连续两次清楚发声。' },
    { title: '练四组换位，不追求快', why: '换和弦最容易让节拍停下来。把手指移动单独拆出来，之后套回谱面会轻松很多。', section: '和弦转换', focus: 'G↔D · D↔Em · Em↔C · C↔G', scoreCue: '这是换位练习组，不是原曲顺序转录。用参考谱确认每次真实换和弦的位置。', steps: ['先无声摆 G 和 D，各停四拍，来回切换四次。', '同样练 D↔Em、Em↔C、C↔G；每次先落最容易定位的手指。', '打开参考谱，只挑实际相邻的两组和弦，各做四次慢速转换。'], success: '谱中实际出现的两组转换，各连续四次不中断；允许慢，但不能漏拍。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只练 G↔D，不扫弦。', '先停稳再换，左右各做三次。'], simplifiedSuccess: 'G↔D 慢速来回三次，至少两次没有停顿。' },
    { title: '让右手保持民谣律动', why: '先把右手变成稳定的钟摆，再让左手在谱面标记处换和弦。', section: '右手节奏', focus: '四拍下扫打底；再按参考谱加入轻扫或空拍', scoreCue: '基础节奏只是拆手训练；最终请照参考谱的节奏记号和原曲律动演奏。', steps: ['左手消音，右手连续做四拍轻下扫，每拍都匀。', '保持右手不停，用嘴数拍；在谱上标记的换和弦拍点换左手。', '若参考谱有上扫或空拍，再一次只加入一个变化。'], success: '连续四小节保持同一拍速，换和弦时右手不停；原曲细节逐项加回。', chords: ['G', 'D'], bpm: 48, pattern: ['↓', '↓', '↓', '↓'], simplifiedSteps: ['消音琴弦，只做四拍下扫。', '每做四拍停一下，重新从第一拍开始。'], simplifiedSuccess: '连续两小节四拍均匀，不抢拍。' },
    { title: '拆练主歌开头两小节', why: '两小节是适合零基础的最小歌曲片段：既能听出音乐，又不必记整段。', section: '主歌 · 开头小句', focus: '参考谱主歌开头连续 2 小节', scoreCue: '从参考谱圈出主歌开头两小节；跟着外部谱上的和弦与节奏走，不在网站复刻谱面。', steps: ['先按谱面和弦，每小节扫一下，确认换位位置。', '用 48 BPM 弹两小节；手忙时回到单独换位练习。', '连续成功两次后升到 56 BPM，再把前奏接到这两小节前面。'], success: '两小节连续弹三遍，和弦顺序照谱、节拍不中断。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只弹第一个和弦所在的一小节。', '每拍一次轻下扫，先不做和弦转换。'], simplifiedSuccess: '能稳定弹完这一小节四拍。' },
    { title: '把主歌、副歌和间奏接起来', why: '器乐演奏的难点常常是段落交界处的进入时机。', section: '主歌 → 副歌 → 间奏', focus: '段尾最后 1 小节 + 下一段开头 1 小节', scoreCue: '用参考谱的段落标记连接，不省略重复段；先慢练，熟悉后接近谱面目标速度。', steps: ['先弹每段最后一小节，确认结束和弦。', '每次只连接相邻两段：段尾一小节接下一段开头一小节。', '连接顺后按参考谱路线弹完整首伴奏，失误时继续数拍。'], success: '照参考谱从前奏到尾奏弹完，不因小错停下或回头重来。', chords: ['G', 'D', 'Em', 'C'], bpm: 56, simplifiedSteps: ['只连接主歌末尾与副歌开头各一小节。', '慢速弹三次，先保证拍子继续。'], simplifiedSuccess: '两小节连接三次，能在拍子上进入副歌。' },
    { title: '在不断拍时轻声加入旋律', why: '先练熟悉的一小句，比第一遍就唱全曲更能保护节奏和嗓子。', section: '主歌 · 弹唱接入', focus: '主歌中选一个舒适音区的小句', scoreCue: '保留参考谱原调；若对嗓音偏高，可轻声低八度唱，不改变伴奏和弦。歌词请使用你自己的合法来源。', steps: ['把主歌伴奏连续弹两遍，确认换和弦不需要盯手。', '不出声，用哼鸣跟一小句旋律；保持右手继续数拍。', '轻声唱这小句，再把前后各一小节伴奏接上。'], success: '能唱完自己选的小句，同时右手节奏不中断；不挤压高音。', chords: ['G', 'D', 'Em', 'C'], bpm: 48, simplifiedSteps: ['只弹主歌第一个和弦，轻声哼一小句。', '暂时不唱词，让呼吸放松。'], simplifiedSuccess: '哼唱时能保持稳定的四拍伴奏。' },
    { title: '完成一遍原调弹唱', why: '最后一步是把技能连成一次完整表达，不是追求没有任何小失误。', section: '全曲 · 完整弹唱', focus: '原曲段落顺序 + 参考谱重复记号 + 尾奏', scoreCue: '按你选定的 G 调弹唱谱演奏，包含重复段、间奏和结尾；站内不复刻整谱或歌词。', steps: ['先用 56 BPM 弹完整首伴奏一次，确认段落和结尾。', '第二遍加入演唱；忘词时继续伴奏，不停下来。', '最后按参考谱目标速度尝试完整弹唱，记下最顺和最卡的一处。'], success: '从前奏开始，按原曲段落完整弹完并唱完，整体连贯度达到约 80%，且不中断。', chords: ['G', 'D', 'Em', 'C'], bpm: 56, simplifiedSteps: ['先只弹完整伴奏，不唱。', '若太长，按参考谱划成两段，分段完成后再连接。'], simplifiedSuccess: '完整伴奏能从头到尾不中断；唱段可以下次再加。' },
  ],
  chengdu: [
    { title: '先认出段落和回环', why: '这首歌段落较长，先搞清重复与连接位置，练习就不必靠死记。', section: '原曲结构', focus: '前奏 · 主歌 · 副歌 · 间奏 · 尾奏', scoreCue: '用参考弹唱谱标出重复记号和段落边界；只做自己的结构标注，不抄录歌词。', steps: ['听原曲一遍，跟着稳定拍点轻敲四拍。', '圈出前奏结束、主副歌转换和最后收尾的位置。', '沿着谱面走一遍完整路线，确认重复记号回到哪里。'], success: '能不看提示指出段落顺序及至少两个连接位置。', chords: [], bpm: 54, simplifiedSteps: ['只听开头和结尾，确认开始与结束。', '在参考谱圈出一个重复记号。'], simplifiedSuccess: '能指出一个重复记号要回到的位置。' },
    { title: '把六个和弦分组练熟', why: '一次记六个形状负担太大。先掌握开放和弦，再单独攻克容易卡手的 F 与 Dm。', section: '和弦准备', focus: 'C · Em · Am · G / F · Dm', scoreCue: '参考编配标有六个和弦；具体出现顺序以谱面为准。原调演唱使用 C 指法并夹 2 品，练手时可先不夹。', steps: ['先练 C、Em、Am、G：逐弦轻拨，确认没有闷音。', '再单练 F 和 Dm：指尖立起、拇指放琴颈后，逐弦检查。', '每个形状按下与放松各三次；手腕累了就停一下。'], success: '六个和弦各至少两次清楚发声；F、Dm 不靠过度用力。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['今天只练 C 和弦。', '轻拨四弦，确认声音清楚后放松手指。'], simplifiedSuccess: 'C 和弦连续两次四弦都清楚。' },
    { title: '逐组练会谱面里的换位', why: '和弦数量多时，先把读谱中遇到的相邻两和弦拆开，能减少整段停顿。', section: '和弦转换', focus: '从参考谱挑两组最常卡住的相邻和弦', scoreCue: '练习组合不是完整原曲和弦顺序。拿参考谱逐小节核对真实相邻和弦，再选最卡的两组。', steps: ['先不扫弦：摆好第一个和弦，四拍后换第二个。', '观察哪些手指可以留在原位或只移动一格。', '在参考谱找出真实出现的两组相邻组合，各做五次慢换。'], success: '挑出的两组谱面转换，连续五次不漏拍，声音清楚即可。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['只练 C↔Am，不扫弦。', '每次换完轻拨四弦，再换回来。'], simplifiedSuccess: 'C↔Am 来回三次，至少两次声音清楚。' },
    { title: '建立稳定的四拍扫弦底盘', why: '先把右手稳定下来，之后跟谱加入伴奏音型时，整首歌的律动不会散。', section: '右手节奏', focus: '均匀四拍下扫 → 参考谱中的伴奏型', scoreCue: '参考编配标有一个伴奏音型；先用基础拍点练协调，再对照曲谱学习实际方向与空拍。', steps: ['左手消音，先做均匀四拍下扫。', '把谱上的伴奏型拆成一小节，只念节奏、不按和弦。', '右手稳定后加 C 和弦，再换到谱面下一和弦。'], success: '连续四小节按谱完成伴奏型，右手不因左手换位停下来。', chords: ['C', 'Em'], bpm: 54, pattern: ['↓', '↓', '↓', '↓'], simplifiedSteps: ['只做四拍均匀下扫，不加上扫。', '每两小节停一次，重新对准第一拍。'], simplifiedSuccess: '八拍均匀，第一拍没有抢先。' },
    { title: '把主歌前两小节弹顺', why: '在短片段中练准和弦落点，是处理长歌的有效办法。', section: '主歌 · 开头', focus: '参考谱主歌前 2 小节的和弦落点', scoreCue: '圈出主歌开头两小节；对照小节线确认每个和弦何时换，不靠记忆猜顺序。', steps: ['先按小节线读出这两小节里和弦变化的次数。', '54 BPM 每小节扫一次，确认后改为每拍轻扫。', '稳定两遍后升至 68 BPM；错了只回到出错的小节练。'], success: '两小节按谱准确弹三遍，换和弦落在正确拍点。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['只练这两小节中的第一个和弦。', '先每小节一次下扫，确认小节长度。'], simplifiedSuccess: '能数完两小节且每小节起点清楚。' },
    { title: '连接副歌入口和间奏返回', why: '长歌最常卡在主歌转副歌以及间奏回到人声的地方。', section: '主歌 → 副歌 → 间奏', focus: '转段前 1 小节 + 转段后 1 小节', scoreCue: '对照重复标记和间奏位置练连接；先两小节一组，最后再串全曲。', steps: ['圈出主歌进副歌、间奏回主歌的连接小节。', '每次只弹连接前后各一小节，先 54 BPM 再到 68 BPM。', '按谱面顺序连接片段，漏拍时继续数到下一小节。'], success: '主歌、副歌、间奏按谱连接，并完成一遍不中断的器乐伴奏。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 68, simplifiedSteps: ['只连接主歌尾和副歌头各一小节。', '每小节先扫一下，保证进入准确。'], simplifiedSuccess: '能在正确小节进入副歌，不从头重来。' },
    { title: '让人声落在稳定伴奏上', why: '段落长，边弹边唱前先让右手形成自动节拍，注意力才可以留给旋律。', section: '主歌 · 弹唱接入', focus: '选一小句：先哼，再轻声唱', scoreCue: '原调参考为 C 指法夹 2 品。练琴可先不夹；加入演唱时按原调谱面，必要时低八度轻唱，不硬顶高音。', steps: ['以 68 BPM 单独弹熟主歌开头伴奏两遍。', '第三遍只用哼鸣唱一小句，换和弦处保持呼吸。', '小句稳定后把前后一小节接上，再试谱面原调。'], success: '能完成一小句弹唱，和弦变化处不中断、不挤嗓。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 54, simplifiedSteps: ['边弹一个 C 和弦的四拍，边轻哼。', '先不唱歌词，身体放松。'], simplifiedSuccess: '四拍伴奏和哼鸣可以同时保持。' },
    { title: '沿谱完成一遍原调弹唱', why: '把长歌拆过再合起来，目标是完整完成和跟住结构，而不是每个音一次弹准。', section: '全曲 · 完整弹唱', focus: '前奏 → 全部段落与重复 → 尾奏', scoreCue: '跟随所选 C 指法、夹 2 品的参考谱和原曲段落，不省略间奏或重复；网站不复制歌词与整份谱。', steps: ['先按谱从头到尾弹伴奏，确认重复和结尾。', '第二遍加入熟悉段落的演唱，间奏继续弹，不停表。', '稳定后把速度从 68 BPM 逐步提到参考谱目标，记录最难的转段。'], success: '从头到尾完成原调弹唱，结构无遗漏；少量失误后仍继续，整体达到约 80% 连贯度。', chords: ['C', 'Em', 'Am', 'G', 'F', 'Dm'], bpm: 68, simplifiedSteps: ['先完整弹伴奏，不唱。', '只在最熟悉的一段加入轻声哼唱。'], simplifiedSuccess: '整首伴奏路线走完，至少一段能同时哼唱。' },
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

export const SONGS: Song[] = songConfigs.map((song) => ({
  ...song,
  tasks: lessonPlans[song.id].map((draft, index) => {
    const focusChords = song.chords.filter((chord) => draft.focus.includes(chord))
    const chords = focusChords.length > 0 ? focusChords : draft.chords.length > 0 ? draft.chords : [song.chords[0]]
    const rhythm = draft.pattern?.length === 4 ? draft.pattern : ['↓', '↓', '↓', '↓']
    const guidedSteps = [...draft.steps, ...draft.simplifiedSteps].map((step) =>
      /标出|圈出|找出|挑出|标记/.test(step) && /谱|小节|段落|和弦|重复/.test(step)
        ? '跟着下方已经标好的路线图或小节示范练习，不需要自己找标记。'
        : step,
    )
    return {
      ...draft,
      scoreCue: '下面的小节卡已标好和弦与四拍扫弦。它是动作练习示范，不是原曲逐小节转录；完整编配请看参考曲谱。',
      steps: guidedSteps.slice(0, draft.steps.length),
      simplifiedSteps: guidedSteps.slice(draft.steps.length),
      scoreGuide: {
        section: draft.section,
        timeSignature: song.timeSignature,
        bars: [
          { chord: chords[0], beats: song.timeSignature === '6/8' ? ['↓', '·', '↓', '·', '↓', '·'] : rhythm },
          { chord: chords[1] ?? chords[0], beats: song.timeSignature === '6/8' ? ['↓', '·', '↓', '·', '↓', '·'] : rhythm },
        ],
      },
      id: `${song.id}-stage-${index + 1}`,
      songId: song.id,
      stage: index + 1,
      stageName: STAGES[index],
      tempoSteps: [draft.bpm, Math.round((draft.bpm + song.bpm) / 2), song.bpm],
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
