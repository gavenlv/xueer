/**
 * 高中语文：五册教材的「册 → 单元 → 课时」目录（数据来自 `docs/gaokao-2027/01-yuwen.md`）。
 *
 * 这份数据只放**目录性事实**：册次、单元名、学习任务群、人文主题、课时（篇名／作者／是否自读）、
 * 以及该单元「高考怎么考」的一句话。课文正文、原诗原文一概不放（版权，也放不下）。
 *
 * 为什么要有它：App 原本只有初中（7—9 年级）。高中语文的第一步不是堆题，而是先把
 * 「课本上有哪些篇目、它们归哪个任务群、高考从哪块考」这三件事摆清楚——没有这张地图，
 * 后面补讲解和练习就没有落点。
 *
 * 核实等级跟着来源走：每册的 `verified` 与文档一致（✅ 两个独立来源一致 / ⚠️ 单一来源），
 * 页面上直接显示，学生看到 ⚠️ 就知道「这册目录该拿书对一遍」。
 */

export interface HsLesson {
  /** 课号（教材里的第几课）；活动单元与古诗词诵读没有课号 */
  no?: number;
  /** 篇名（照抄教材），如「沁园春·长沙」 */
  title: string;
  /** 作者；活动单元为空 */
  author?: string;
  /** 教材标为自读（略读）的课文 */
  selfRead?: boolean;
}

export interface HsUnit {
  no: number;
  /** 单元名，如「第一单元」「古诗词诵读」 */
  name: string;
  /** 学习任务群，如「文学阅读与写作」 */
  taskGroup: string;
  /** 人文主题，如「青春激扬」 */
  theme: string;
  /** 单元任务：写作 / 活动 / 整本书阅读 等 */
  task: string;
  /** 这个单元在高考里怎么被考（一句话） */
  examNote: string;
  kind: 'text' | 'activity' | 'recite';
  lessons: HsLesson[];
}

export interface HsBook {
  id: string;
  /** 册名，如「必修上册」 */
  name: string;
  /** 短名，如「必修上」 */
  short: string;
  /** 使用年级 */
  year: string;
  publisher: string;
  /** 目录核实等级（✅ 双源 / ⚠️ 单源） */
  verified: string;
  /** 一句话说明这一册的结构 */
  summary: string;
  units: HsUnit[];
}

export const HS_CHINESE_BOOKS: HsBook[] = [
  {
    id: 'bx-1',
    name: '必修上册',
    short: '必修上',
    year: '高一上',
    publisher: '统编版（人教社）2019 年第 1 版',
    verified: '⚠️',
    summary: '8 个单元 + 古诗词诵读；课文 37 篇（含古诗词诵读 4 首）。',
    units: [
      {
        no: 1,
        name: '第一单元',
        taskGroup: '文学阅读与写作',
        theme: '青春激扬',
        task: '写作任务',
        examNote: '现代诗的意象与抒情主人公；小说用细节写人，常作文学类文本选择题',
        kind: 'text',
        lessons: [
          { title: '沁园春·长沙', author: '毛泽东', no: 1 },
          { title: '立在地球边上放号', author: '郭沫若', no: 2 },
          { title: '红烛', author: '闻一多', no: 2 },
          { title: '峨日朵雪峰之侧', author: '昌耀', no: 2, selfRead: true },
          { title: '致云雀', author: '雪莱', no: 2, selfRead: true },
          { title: '百合花', author: '茹志鹃', no: 3 },
          { title: '哦，香雪', author: '铁凝', no: 3, selfRead: true },
        ],
      },
      {
        no: 2,
        name: '第二单元',
        taskGroup: '实用性阅读与交流',
        theme: '劳动光荣',
        task: '',
        examNote: '人物通讯的事实与观点、新闻语言；第 6 课三首劳动诗均不在 72 篇背诵名单内，重手法与情感',
        kind: 'text',
        lessons: [
          { title: '喜看稻菽千重浪——记首届国家最高科技奖获得者袁隆平', author: '沈英甲', no: 4 },
          { title: '心有一团火，温暖众人心', author: '林为民', no: 4, selfRead: true },
          { title: '“探界者”钟扬', author: '叶雨婷', no: 4, selfRead: true },
          { title: '以工匠精神雕琢时代品质', author: '李斌', no: 5 },
          { title: '芣苢', author: '《诗经·周南》', no: 6 },
          { title: '文氏外孙入村收麦', author: '苏辙', no: 6 },
          { title: '插秧歌', author: '杨万里', no: 6 },
        ],
      },
      {
        no: 3,
        name: '第三单元',
        taskGroup: '文学阅读与写作',
        theme: '诗意人生',
        task: '写作任务',
        examNote: '8 首全在课标 72 篇内，是默写与古诗鉴赏的主题库',
        kind: 'text',
        lessons: [
          { title: '短歌行', author: '曹操', no: 7 },
          { title: '归园田居（其一）', author: '陶渊明', no: 7, selfRead: true },
          { title: '梦游天姥吟留别', author: '李白', no: 8 },
          { title: '登高', author: '杜甫', no: 8 },
          { title: '琵琶行并序', author: '白居易', no: 8, selfRead: true },
          { title: '念奴娇·赤壁怀古', author: '苏轼', no: 9 },
          { title: '永遇乐·京口北固亭怀古', author: '辛弃疾', no: 9, selfRead: true },
          { title: '声声慢（寻寻觅觅）', author: '李清照', no: 9, selfRead: true },
        ],
      },
      {
        no: 4,
        name: '第四单元',
        taskGroup: '当代文化参与',
        theme: '我们的家园',
        task: '活动',
        examNote: '非连续性文本、调查报告类语料，对应语言文字运用的情境题',
        kind: 'activity',
        lessons: [
          { title: '记录家乡的人和物' },
          { title: '家乡文化生活现状调查' },
          { title: '参与家乡文化建设' },
        ],
      },
      {
        no: 5,
        name: '第五单元',
        taskGroup: '整本书阅读',
        theme: '乡土的中国',
        task: '整本书阅读',
        examNote: '学术著作读法：核心概念（差序格局、礼治秩序）与论证思路',
        kind: 'activity',
        lessons: [
          { title: '《乡土中国》／费孝通' },
        ],
      },
      {
        no: 6,
        name: '第六单元',
        taskGroup: '思辨性阅读与表达',
        theme: '学习之道',
        task: '写作任务',
        examNote: '文言实词与比喻论证；《劝学》《师说》为默写高频',
        kind: 'text',
        lessons: [
          { title: '劝学', author: '《荀子》', no: 10 },
          { title: '师说', author: '韩愈', no: 10, selfRead: true },
          { title: '反对党八股（节选）', author: '毛泽东', no: 11 },
          { title: '拿来主义', author: '鲁迅', no: 12 },
          { title: '读书：目的和前提', author: '黑塞', no: 13, selfRead: true },
          { title: '上图书馆', author: '王佐良', no: 13, selfRead: true },
        ],
      },
      {
        no: 7,
        name: '第七单元',
        taskGroup: '文学阅读与写作',
        theme: '自然情怀',
        task: '写作任务',
        examNote: '写景抒情散文的景物—情感对应；《赤壁赋》《登泰山记》为文言＋默写',
        kind: 'text',
        lessons: [
          { title: '故都的秋', author: '郁达夫', no: 14 },
          { title: '荷塘月色', author: '朱自清', no: 14, selfRead: true },
          { title: '我与地坛（节选）', author: '史铁生', no: 15 },
          { title: '赤壁赋', author: '苏轼', no: 16 },
          { title: '登泰山记', author: '姚鼐', no: 16, selfRead: true },
        ],
      },
      {
        no: 8,
        name: '第八单元',
        taskGroup: '语言积累、梳理与探究',
        theme: '语言家园',
        task: '活动',
        examNote: '成语、古今异义、词语辨析，直接对应语用题',
        kind: 'activity',
        lessons: [
          { title: '丰富词语积累' },
          { title: '把握古今词义的联系与区别' },
          { title: '词义的辨析和词语的使用' },
        ],
      },
      {
        no: 9,
        name: '古诗词诵读',
        taskGroup: '古诗词诵读（课外）',
        theme: '—',
        task: '',
        examNote: '4 首均在 72 篇内，属课外诵读、默写范围',
        kind: 'recite',
        lessons: [
          { title: '静女', author: '《诗经·邶风》' },
          { title: '涉江采芙蓉', author: '《古诗十九首》' },
          { title: '虞美人（春花秋月何时了）', author: '李煜' },
          { title: '鹊桥仙（纤云弄巧）', author: '秦观' },
        ],
      },
    ],
  },
  {
    id: 'bx-2',
    name: '必修下册',
    short: '必修下',
    year: '高一下',
    publisher: '统编版（人教社）2019 年第 1 版',
    verified: '✅',
    summary: '8 个单元 + 古诗词诵读；课文 29 篇（含古诗词诵读 4 首）。',
    units: [
      {
        no: 1,
        name: '第一单元',
        taskGroup: '思辨性阅读与表达',
        theme: '文明之光',
        task: '',
        examNote: '先秦诸子与史传：文言实词、句式、人物说理；《侍坐》为 72 篇内',
        kind: 'text',
        lessons: [
          { title: '子路', no: 1 },
          { title: '曾皙', no: 1 },
          { title: '冉有', no: 1 },
          { title: '公西华侍坐', author: '《论语》', no: 1 },
          { title: '齐桓晋文之事', author: '《孟子》', no: 1, selfRead: true },
          { title: '庖丁解牛', author: '《庄子》', no: 1 },
          { title: '烛之武退秦师', author: '《左传》', no: 2 },
          { title: '鸿门宴', author: '司马迁', no: 3, selfRead: true },
        ],
      },
      {
        no: 2,
        name: '第二单元',
        taskGroup: '文学阅读与写作',
        theme: '良知与悲悯',
        task: '',
        examNote: '戏剧冲突与潜台词，文学类文本可选戏剧片段',
        kind: 'text',
        lessons: [
          { title: '窦娥冤（节选）', author: '关汉卿', no: 4 },
          { title: '雷雨（节选）', author: '曹禺', no: 5 },
          { title: '哈姆莱特（节选）', author: '莎士比亚', no: 6, selfRead: true },
        ],
      },
      {
        no: 3,
        name: '第三单元',
        taskGroup: '实用性阅读与交流',
        theme: '探索与创新',
        task: '',
        examNote: '科普与学术随笔：概念界定、说明顺序，信息类文本常考',
        kind: 'text',
        lessons: [
          { title: '青蒿素：人类征服疾病的一小步', author: '屠呦呦', no: 7 },
          { title: '一名物理学家的教育历程', author: '加来道雄', no: 7, selfRead: true },
          { title: '中国建筑的特征', author: '梁思成', no: 8, selfRead: true },
          { title: '说“木叶”', author: '林庚', no: 9 },
        ],
      },
      {
        no: 4,
        name: '第四单元',
        taskGroup: '当代文化参与',
        theme: '媒介素养',
        task: '活动',
        examNote: '跨媒介信息甄别，对应语用题的情境材料',
        kind: 'activity',
        lessons: [
          { title: '认识多媒介' },
          { title: '善用多媒介' },
          { title: '辨识媒介信息' },
        ],
      },
      {
        no: 5,
        name: '第五单元',
        taskGroup: '思辨性阅读与表达',
        theme: '使命与抱负',
        task: '',
        examNote: '演讲词与书信的针对性；《谏逐客书》在 72 篇内（选修组）',
        kind: 'text',
        lessons: [
          { title: '在《人民报》创刊纪念会上的演说', author: '马克思', no: 10 },
          { title: '在马克思墓前的讲话', author: '恩格斯', no: 10 },
          { title: '谏逐客书', author: '李斯', no: 11 },
          { title: '与妻书', author: '林觉民', no: 11, selfRead: true },
        ],
      },
      {
        no: 6,
        name: '第六单元',
        taskGroup: '文学阅读与写作',
        theme: '观察与批判',
        task: '',
        examNote: '小说叙事视角与环境；《促织》为文言小说，考实词与情节',
        kind: 'text',
        lessons: [
          { title: '祝福', author: '鲁迅', no: 12 },
          { title: '林教头风雪山神庙', author: '施耐庵', no: 13 },
          { title: '装在套子里的人', author: '契诃夫', no: 13, selfRead: true },
          { title: '促织', author: '蒲松龄', no: 14 },
          { title: '变形记（节选）', author: '卡夫卡', no: 14, selfRead: true },
        ],
      },
      {
        no: 7,
        name: '第七单元',
        taskGroup: '整本书阅读',
        theme: '不朽的红楼',
        task: '整本书阅读',
        examNote: '长篇阅读：人物关系、回目与主题，常与文学类文本互证',
        kind: 'activity',
        lessons: [
          { title: '《红楼梦》／曹雪芹' },
        ],
      },
      {
        no: 8,
        name: '第八单元',
        taskGroup: '思辨性阅读与表达',
        theme: '责任与担当',
        task: '',
        examNote: '四篇全在 72 篇内，默写与文言并重，论证结构常考',
        kind: 'text',
        lessons: [
          { title: '谏太宗十思疏', author: '魏征', no: 15 },
          { title: '答司马谏议书', author: '王安石', no: 15, selfRead: true },
          { title: '阿房宫赋', author: '杜牧', no: 16 },
          { title: '六国论', author: '苏洵', no: 16, selfRead: true },
        ],
      },
      {
        no: 9,
        name: '古诗词诵读',
        taskGroup: '古诗词诵读（课外）',
        theme: '—',
        task: '',
        examNote: '前 3 首在 72 篇内；《游园》考曲词赏析',
        kind: 'recite',
        lessons: [
          { title: '登岳阳楼', author: '杜甫' },
          { title: '桂枝香·金陵怀古', author: '王安石' },
          { title: '念奴娇·过洞庭', author: '张孝祥' },
          { title: '游园（【皂罗袍】）', author: '汤显祖' },
        ],
      },
    ],
  },
  {
    id: 'xx-1',
    name: '选择性必修上册',
    short: '选必上',
    year: '高二上',
    publisher: '统编版（人教社）2020 年第 1 版',
    verified: '✅',
    summary: '4 个单元 + 古诗词诵读；课文 20 篇（含古诗词诵读 4 首；第四单元为学习活动）。',
    units: [
      {
        no: 1,
        name: '第一单元',
        taskGroup: '中国革命传统作品研习',
        theme: '伟大的复兴',
        task: '材料的积累与运用',
        examNote: '新闻、通讯、演讲的事实与立场；信息类文本的“材料支撑观点”',
        kind: 'text',
        lessons: [
          { title: '中国人民站起来了', author: '毛泽东', no: 1 },
          { title: '长征胜利万岁', author: '杨成武', no: 2 },
          { title: '大战中的插曲', author: '聂荣臻', no: 2, selfRead: true },
          { title: '别了，“不列颠尼亚”', author: '周婷', no: 3 },
          { title: '杨兴', no: 3 },
          { title: '县委书记的榜样——焦裕禄', author: '穆青', no: 3, selfRead: true },
          { title: '冯健', no: 3 },
          { title: '周原', no: 3 },
          { title: '在民族复兴的历史丰碑上——2020 中国抗疫记', author: '新华社', no: 4 },
        ],
      },
      {
        no: 2,
        name: '第二单元',
        taskGroup: '中华传统文化经典研习',
        theme: '百家争鸣',
        task: '审题与立意',
        examNote: '先秦诸子：文言实词、观点比较；《论语》十二章、《大学》在 72 篇内',
        kind: 'text',
        lessons: [
          { title: '《论语》十二章', no: 5 },
          { title: '《礼记》大学之道', no: 5 },
          { title: '《孟子》人皆有不忍人之心', no: 5, selfRead: true },
          { title: '《老子》四章', no: 6 },
          { title: '五石之瓠', author: '《庄子》', no: 6, selfRead: true },
          { title: '兼爱', author: '《墨子》', no: 7, selfRead: true },
        ],
      },
      {
        no: 3,
        name: '第三单元',
        taskGroup: '外国作家作品研习',
        theme: '多样的文化',
        task: '学写小小说',
        examNote: '外国小说的人物与叙事；文学类文本选材常取长篇节选',
        kind: 'text',
        lessons: [
          { title: '大卫·科波菲尔（节选）', author: '狄更斯', no: 8 },
          { title: '复活（节选）', author: '列夫·托尔斯泰', no: 9 },
          { title: '老人与海（节选）', author: '海明威', no: 10 },
          { title: '百年孤独（节选）', author: '加西亚·马尔克斯', no: 11, selfRead: true },
        ],
      },
      {
        no: 4,
        name: '第四单元',
        taskGroup: '语言积累、梳理与探究',
        theme: '逻辑思维',
        task: '尝试写驳论文',
        examNote: '逻辑谬误识别、论证有效性，直接对应语用与写作',
        kind: 'activity',
        lessons: [
          { title: '发现潜藏的逻辑谬误' },
          { title: '运用有效的推理形式' },
          { title: '采用合理的论证方法' },
        ],
      },
      {
        no: 5,
        name: '古诗词诵读',
        taskGroup: '古诗词诵读（课外）',
        theme: '—',
        task: '',
        examNote: '4 首均在 72 篇内',
        kind: 'recite',
        lessons: [
          { title: '无衣', author: '《诗经·秦风》' },
          { title: '春江花月夜', author: '张若虚' },
          { title: '将进酒', author: '李白' },
          { title: '江城子·乙卯正月二十日夜记梦', author: '苏轼' },
        ],
      },
    ],
  },
  {
    id: 'xx-2',
    name: '选择性必修中册',
    short: '选必中',
    year: '高二下',
    publisher: '统编版（人教社）2020 年第 1 版',
    verified: '✅',
    summary: '4 个单元 + 古诗词诵读；课文 26 篇（含古诗词诵读 4 首）。',
    units: [
      {
        no: 1,
        name: '第一单元',
        taskGroup: '科学与文化论著研习',
        theme: '理论的价值',
        task: '深化理性思考',
        examNote: '社科论著：核心概念、论证层次，信息类文本的主力单元',
        kind: 'text',
        lessons: [
          { title: '社会历史的决定性基础', author: '恩格斯', no: 1 },
          { title: '改造我们的学习', author: '毛泽东', no: 2 },
          { title: '人的正确思想是从哪里来的？', author: '毛泽东', no: 2 },
          { title: '实践是检验真理的唯一标准', author: '《光明日报》特约评论员', no: 3 },
          { title: '修辞立其诚', author: '张岱年', no: 4, selfRead: true },
          { title: '怜悯是人的天性', author: '卢梭', no: 4, selfRead: true },
          { title: '人应当坚持正义', author: '柏拉图', no: 5, selfRead: true },
        ],
      },
      {
        no: 2,
        name: '第二单元',
        taskGroup: '中国革命传统作品研习',
        theme: '苦难与新生',
        task: '（教材未单列写作）',
        examNote: '纪实与虚构的差别；报告文学的典型细节',
        kind: 'text',
        lessons: [
          { title: '记念刘和珍君', author: '鲁迅', no: 6 },
          { title: '为了忘却的记念', author: '鲁迅', no: 6, selfRead: true },
          { title: '包身工', author: '夏衍', no: 7 },
          { title: '荷花淀', author: '孙犁', no: 8 },
          { title: '小二黑结婚（节选）', author: '赵树理', no: 8, selfRead: true },
          { title: '党费', author: '王愿坚', no: 8, selfRead: true },
        ],
      },
      {
        no: 3,
        name: '第三单元',
        taskGroup: '中华传统文化经典研习',
        theme: '历史的现场',
        task: '（教材未单列写作）',
        examNote: '史传与史论：文言断句、概括、评价；《屈原列传》《过秦论》《伶官传序》在 72 篇内',
        kind: 'text',
        lessons: [
          { title: '屈原列传', author: '司马迁', no: 9 },
          { title: '苏武传', author: '班固', no: 10, selfRead: true },
          { title: '过秦论', author: '贾谊', no: 11 },
          { title: '五代史伶官传序', author: '欧阳修', no: 11, selfRead: true },
        ],
      },
      {
        no: 4,
        name: '第四单元',
        taskGroup: '外国作家作品研习',
        theme: '丰富的心灵',
        task: '学写申论',
        examNote: '戏剧冲突与诗歌意象；申论＝观点＋对策，对应写作任务',
        kind: 'text',
        lessons: [
          { title: '玩偶之家（节选）', author: '易卜生', no: 12 },
          { title: '迷娘（之一）', author: '歌德', no: 13 },
          { title: '致大海', author: '普希金', no: 13 },
          { title: '自己之歌（节选）', author: '惠特曼', no: 13, selfRead: true },
          { title: '树和天空', author: '特朗斯特罗姆', no: 13, selfRead: true },
        ],
      },
      {
        no: 5,
        name: '古诗词诵读',
        taskGroup: '古诗词诵读（课外）',
        theme: '—',
        task: '',
        examNote: '4 首均在 72 篇内',
        kind: 'recite',
        lessons: [
          { title: '燕歌行并序', author: '高适' },
          { title: '李凭箜篌引', author: '李贺' },
          { title: '锦瑟', author: '李商隐' },
          { title: '书愤', author: '陆游' },
        ],
      },
    ],
  },
  {
    id: 'xx-3',
    name: '选择性必修下册',
    short: '选必下',
    year: '高三',
    publisher: '统编版（人教社）2021 年第 1 版',
    verified: '⚠️',
    summary: '4 个单元 + 古诗词诵读；课文 27 篇（含古诗词诵读 4 首）。',
    units: [
      {
        no: 1,
        name: '第一单元',
        taskGroup: '中华传统文化经典研习',
        theme: '诗的国度',
        task: '（教材未单列写作）',
        examNote: '古典诗歌体裁流变；《氓》《孔雀东南飞》不在 72 篇名单内，其余 5 篇在，是默写重仓',
        kind: 'text',
        lessons: [
          { title: '氓', author: '《诗经·卫风》', no: 1 },
          { title: '离骚（节选）', author: '屈原', no: 1 },
          { title: '孔雀东南飞并序', no: 2, selfRead: true },
          { title: '蜀道难', author: '李白', no: 3 },
          { title: '蜀相', author: '杜甫', no: 3, selfRead: true },
          { title: '望海潮（东南形胜）', author: '柳永', no: 4, selfRead: true },
          { title: '扬州慢（淮左名都）', author: '姜夔', no: 4, selfRead: true },
        ],
      },
      {
        no: 2,
        name: '第二单元',
        taskGroup: '中国现当代作家作品研习',
        theme: '时代镜像',
        task: '语言的锤炼',
        examNote: '现当代小说、诗歌、散文、话剧四体的鉴赏术语与答题路径',
        kind: 'text',
        lessons: [
          { title: '阿Q正传（节选）', author: '鲁迅', no: 5 },
          { title: '边城（节选）', author: '沈从文', no: 5, selfRead: true },
          { title: '大堰河——我的保姆', author: '艾青', no: 6 },
          { title: '再别康桥', author: '徐志摩', no: 6, selfRead: true },
          { title: '风景谈', author: '茅盾', no: 7 },
          { title: '秦腔', author: '贾平凹', no: 7, selfRead: true },
          { title: '茶馆（节选）', author: '老舍', no: 8 },
        ],
      },
      {
        no: 3,
        name: '第三单元',
        taskGroup: '中华传统文化经典研习',
        theme: '至情至性',
        task: '说真话，抒真情',
        examNote: '6 篇全在 72 篇内；文言虚词、情感线索、说理方式',
        kind: 'text',
        lessons: [
          { title: '陈情表', author: '李密', no: 9 },
          { title: '项脊轩志', author: '归有光', no: 9, selfRead: true },
          { title: '兰亭集序', author: '王羲之', no: 10 },
          { title: '归去来兮辞并序', author: '陶渊明', no: 10 },
          { title: '种树郭橐驼传', author: '柳宗元', no: 11, selfRead: true },
          { title: '石钟山记', author: '苏轼', no: 12, selfRead: true },
        ],
      },
      {
        no: 4,
        name: '第四单元',
        taskGroup: '科学与文化论著研习',
        theme: '求真求实',
        task: '文章修改',
        examNote: '自然科学论著：概念、推理与语言准确性，信息类文本选材',
        kind: 'text',
        lessons: [
          { title: '自然选择的证明', author: '达尔文', no: 13 },
          { title: '宇宙的边疆', author: '卡尔·萨根', no: 13, selfRead: true },
          { title: '天文学上的旷世之争', author: '关增建', no: 14, selfRead: true },
        ],
      },
      {
        no: 5,
        name: '古诗词诵读',
        taskGroup: '古诗词诵读（课外）',
        theme: '—',
        task: '',
        examNote: '4 首均在 72 篇内',
        kind: 'recite',
        lessons: [
          { title: '拟行路难（其四）', author: '鲍照' },
          { title: '客至', author: '杜甫' },
          { title: '登快阁', author: '黄庭坚' },
          { title: '临安春雨初霁', author: '陆游' },
        ],
      },
    ],
  },
];

/** 五册合计 */
export const HS_CHINESE_TOTALS = (() => {
  const units = HS_CHINESE_BOOKS.reduce((n, b) => n + b.units.length, 0);
  const lessons = HS_CHINESE_BOOKS.reduce(
    (n, b) => n + b.units.reduce((m, u) => m + u.lessons.length, 0),
    0,
  );
  return { books: HS_CHINESE_BOOKS.length, units, lessons };
})();

/** 按 id 取一册 */
export function hsBookOf(id: string): HsBook | undefined {
  return HS_CHINESE_BOOKS.find((b) => b.id === id);
}
