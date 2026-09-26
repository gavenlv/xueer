/**
 * 英语·中考专题模块：按广州中考题型与话题横向串讲。
 *
 * 与词汇、语法、阅读、听说、写作五个知识模块的区别：那五个模块是纵向的
 * （一个知识点讲透，如「现在完成时」），本模块是横向的——它回答的是学生复习最后
 * 阶段真正会问的问题：
 *
 *   1. 这张卷子长什么样、100 分钟怎么分、我 80 分该从哪一块先抢分（eng-topic-1）；
 *   2. 语法选择那 10 题到底在考哪九类东西（eng-topic-2）；
 *   3. 完形与阅读有没有一套固定流程，能不能不靠语感（eng-topic-3）；
 *   4. 阅读填空、选词填空、项目情境读写这三块怎么互相借力（eng-topic-4）；
 *   5. 书面表达从 13 分到 20 分，差的是哪几句话（eng-topic-5）；
 *   6. 六大高频话题各背哪几句就够用（eng-topic-6）；
 *   7. 反复踩的坑、以及照中文直译出来的中式英语（eng-topic-7）。
 *
 * 卷面依据：广州市教育局《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
 * （穗教规字〔2025〕1 号）附件 2 —— 笔试 61 小题 110 分、100 分钟；听说 14 小题 30 分（另场）；
 * 英语总分 140。
 *
 * 本模块不复刻历年真题原文，也不声称某年某题考了什么；凡涉及考法分布均写作
 * 「近年常见考法」。全部语篇、范文、题目均为原创。
 */

import type { EnglishKnowledge } from '../../../types';

export const topics: EnglishKnowledge[] = [
  /* ------------------------------------------------------------------ */
  /* 1. 卷面结构与得分策略                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-1',
    grade: 'all',
    unit: '应试策略',
    title: '广州中考英语试卷结构与得分策略',
    enTitle: 'Paper Structure and Scoring Strategy',
    summary:
      '把 61 小题 110 分的笔试切成一节一节的时间块，算出自己每一节现在拿多少分、还能拿多少分，再决定先做哪一块、哪一块必须拿满——这是从 80 分走到 95 分最省力的一条路。',
    points: [
      {
        level: '重点',
        text:
          '语言知识运用第一节（语法选择）10 题 15 分，每题 1.5 分，是全卷单题分值最高的选择题区。',
        explain:
          '错 4 题就是 6 分，比书面表达低一个档次还狠。近年常见考法是把一篇 150—200 词的短文设 10 个空，时态、非谓语、连词混在同一段里。快速判断：先读第一句定全文时态基调，再逐空看「空格前后缺什么成分」，不要一上来就读选项。',
      },
      {
        level: '重点',
        text: '阅读第一节 15 题 30 分，占笔试 27%，是全卷分值最大的板块，每题 2 分。',
        explain:
          '四篇左右语篇、每篇三到四题。这一块从 22 分提到 25 分，比书面表达从 15 分提到 18 分容易得多：细节题占多数，靠「读题干定关键词、回原文定位、比对同义替换」三步就能稳拿。',
      },
      {
        level: '重点',
        text:
          '项目情境（读写综合）两节 10 题 20 分：第一节选择 5 题 10 分，第二节简答 5 题 10 分。',
        explain:
          '这是全卷唯一把「读」与「写」放在同一个情境里的区。第二节每题 2 分，答案几乎都能在原文定位到原句——先划出原句关键词，再改写成主谓齐全的完整句，是这一节最稳的拿分方式。',
      },
      {
        level: '重点',
        text: '写作第三节书面表达 1 题 20 分，是单题分值最大的一题，占笔试 18%。',
        explain:
          '13 分与 19 分的差距通常不在词汇量，而在三件事：要点齐、连接词有 3 个、升级句型有 2—3 个。用 18 分钟写完、留时间回读检查，比多写 20 个词更值钱。',
      },
      {
        level: '次重点',
        text: '写作第一节与第二节填空题共 10 题 10 分，每题 1 分，考词形变化与固定搭配。',
        explain:
          '题量小、单题分值低，却最容易全对：名词单复数、动词时态与语态、形容词副词比较级、词性转换各占一两题，属于「两分钟内不该丢的分」。快速判断：先定词性，再看搭配，最后才变形式。',
      },
      {
        level: '次重点',
        text: '阅读第二节 5 题 5 分，每题 1 分，考篇章逻辑与句子衔接（近年常见为阅读填空）。',
        explain:
          '单题分值低，但错一题常连带错第二题：选错一句，后面的代词指代与逻辑关系就对不上。做法是先读选项，找出代词、逻辑连词、与文中重复的名词这三类线索，再回到空前空后找呼应。',
      },
      {
        level: '次重点',
        text:
          '听说考试 14 小题 30 分（另场）：模仿朗读 8 分、信息获取 13 分（听选 9 + 回答 4）、角色扮演 9 分（复述 7 + 询问 1 + 回答 1）。',
        explain:
          '听说没有「不会做」，只有「没听清」和「没说完」。模仿朗读 8 分拼的是语音、语调与停顿，每天跟读 5 分钟就能稳住；角色扮演复述 7 分里，要点齐比句子漂亮重要得多。',
      },
      {
        level: '了解',
        text:
          '笔试 100 分钟的时间预算（含检查）：语法选择 8 分钟、完形填空 10、阅读第一节 28、阅读第二节 6、项目情境选择 8、项目情境简答 10、写作填空 8、书面表达 18，机动与总检查 4 分钟。',
        explain:
          '这一串数字加起来正好 100。它的用处不是让你掐秒表，而是让你在某一篇阅读上卡住时知道「我超了多久、该不该放」。建议把检查拆散：每做完一块花 30 秒查涂卡与拼写，最后 4 分钟只回看书面表达与标记过的题。',
      },
    ],
    rules: [
      {
        rule: '先做分值与时间比最高的板块，把「拿得到的分」先装进口袋',
        form: '阅读 28 分钟换 30 分',
        example: 'According to the second paragraph, the club meets every Friday afternoon.',
        cn: '阅读第一节 15 题 30 分，平均不到两分钟一题；书面表达 18 分钟换 20 分，在同一水平。这两块优先做，剩下的时间再分配给语法与填空。',
        tip: '若某篇阅读超过 8 分钟还没做完，先把能定位的两题做完，剩下的标记后跳走——回头看往往一眼就懂。',
      },
      {
        rule: '语法选择整节以「一篇短文 10 个空」出现，先定基调再逐空判断',
        form: '读首句 → 定时态与人物 → 逐空看成分',
        example: 'When I first joined the school team, I could hardly catch the ball.',
        cn: '第一句就把时间定在过去，后面 10 个空的动词形式就有了统一标准，不用每空重新猜。',
        tip: '空格前是介词就想动名词，空格后是名词就想形容词或限定词，这是最快的一刀。',
      },
      {
        rule: '完形填空第一遍不填，读完整篇再回填',
        form: '通读 60 秒 → 回填 8 分钟',
        example: 'The test was difficult. However, most of us passed it.',
        cn: 'however 一出现，后面的意思必然是转折；只读空格那一句，很容易选成与前文同向的词。',
        tip: '通读时把表示转折、因果、递进的词圈出来，这些词决定了至少两个空的答案。',
      },
      {
        rule: '阅读细节题必须回原文找依据，不凭印象作答',
        form: '读题干 → 定关键词 → 回原文比对',
        example: 'The notice says the trip has been put off, so it will take place next month.',
        cn: '把题干里的 next month 与原文的 put off 对上，就是「同义替换」的典型，四个选项中重复原文原词最多的那个往往是干扰项。',
        tip: '选项里出现 always、never、all、only 这类绝对词时，先怀疑它。',
      },
      {
        rule: '项目情境第二节简答题用完整句作答，不写单词或短语',
        form: '主语 + 谓语 + 必要成分',
        example: 'The library opens at nine on Saturday morning.',
        cn: '每题 2 分，只写 nine 或 Saturday 一般只能拿到 1 分左右；把题干关键词串成一个完整句才拿满。',
        tip: '不需要展开自己的看法，把原文信息改写清楚就够。',
      },
      {
        rule: '最后 4 分钟只查三类错：涂卡错位、拼写、时态一致',
        form: '涂卡 → 拼写 → 时态',
        example: 'She has lived in Guangzhou since 2019.',
        cn: '这三类错占了检查能挽回的分数的大部分，反复通读全文反而容易改错本来对的题。',
        tip: '除非确知错了，否则不要改动第一次的答案。',
      },
    ],
    mistakes: [
      {
        wrong: '一进考场先花 20 分钟写书面表达，再回头做阅读',
        right: '先做阅读第一节 30 分，书面表达留在最后 18 分钟',
        why: '作文写到一半最容易停不下来，后面的阅读会被压到只剩十几分钟；而阅读一旦没时间，丢的是双倍分值的题。',
      },
      {
        wrong: '完形填空读一句、填一空，见空就填',
        right: '先通读全文，抓住主线后再回填',
        why: '完形的空有一半靠后文解释，只看空格那一句必然选成「语法对但意思偏」的选项。',
      },
      {
        wrong: '项目情境简答题只写一个词或短语',
        right: '写成主谓齐全的完整句',
        why: '简答题按要点与语言给分，残缺句通常只能拿到一半；改写成完整句几乎不花额外时间。',
      },
      {
        wrong: '来不及的题目空着不涂卡',
        right: '四选一也要涂上一个，先排除最不可能的再猜',
        why: '选择题不设倒扣，空着等于保证零分；排除两个后猜，正确率就有一半。',
      },
    ],
    examTips: [
      '进考场先在心里过一遍卷面：61 小题、110 分、100 分钟，八个小节各有各的节拍，心里有谱才不会被某一篇阅读拖住。',
      '大块顺序推荐：阅读两节 34 分钟 → 项目情境两节 18 分钟 → 写作三节 26 分钟 → 语言知识运用两节 18 分钟，机动 4 分钟。先做阅读是因为它分值最大且最不吃状态。',
      '把检查时间拆散而不是集中：每做完一节立刻花 30 秒回看涂卡与拼写，最后再留 4 分钟只查作文与标记题。',
      '80 分到 95 分这 15 分，建议这样拆：语法选择 11→14、完形 7→9、阅读第一节 22→25、阅读第二节 3→4、项目情境选择 7→8、项目情境简答 7→8、写作填空 8→10、书面表达 15→17。',
      '上面这张表里最划算的三块是语法选择（每题 1.5 分）、写作填空（最容易全对）与书面表达（每涨一档就是 2 分），优先练这三块。',
      '书面表达务必留出「审题列要点」的 5 分钟：把题目要求编号写在草稿纸上，写完逐条打勾，漏要点是这一题最惨的失分方式，一次就是 3—5 分。',
      '阅读第二节与项目情境的选择题单题分值低，千万别在这里反复纠结：一道题超过 90 秒还定不下来，先选一个最通顺的继续走。',
      '听说虽然另场考，但每天跟读 5 分钟的收益很稳定：模仿朗读 8 分主要看语音语调、停顿与完整度，读得慢一点、每个词读清楚，比读得快拿分高。',
      '考前一周不要刷新题，把错题本按题型归类看一遍：语法选择看时态与搭配、阅读看定位失误、写作看中式英语，这三处就是你最后的提分空间。',
      '考试当天的读题速度要比平时慢一点：语法选择的空、简答题的设问、写作的要点编号，这三处看漏一个就是白丢分。',
    ],
    questions: [
      {
        id: 'eng-topic-1-q1',
        type: 'choice',
        stem: '广州中考英语笔试的题量与总分是：',
        options: ['61 小题，110 分', '61 小题，100 分', '56 小题，110 分', '60 小题，120 分'],
        answer: 'A',
        explanation:
          '按 2027—2029 年广州中考英语方案，笔试为 61 小题、110 分、100 分钟；另有听说 14 小题 30 分，英语总分 140。记牢「61 题 110 分 100 分钟」这一组数字，是分配时间的前提。',
        difficulty: 1,
        tags: ['卷面结构', '时间分配'],
      },
      {
        id: 'eng-topic-1-q2',
        type: 'choice',
        stem: '全卷单题分值最高的选择题区是：',
        options: [
          '语言知识运用第一节（10 题 15 分）',
          '阅读第一节（15 题 30 分）',
          '阅读第二节（5 题 5 分）',
          '写作第一节（5 题 5 分）',
        ],
        answer: 'B',
        explanation:
          '阅读第一节每题 2 分，比语法选择的 1.5 分更高，也是全卷分值最大的板块。这道题考的是「先做哪一块」的判断依据：单位时间得分高的先做。',
        difficulty: 2,
        tags: ['卷面结构', '分值分布'],
      },
      {
        id: 'eng-topic-1-q3',
        type: 'choice',
        stem: '书面表达（写作第三节）占多少分？',
        options: ['10 分', '15 分', '20 分', '25 分'],
        answer: 'C',
        explanation:
          '书面表达 1 题 20 分，是单题分值最大的一题。它通常能在 18 分钟内写完，因此是「性价比很高」的一块：一档之差就是 2 分。',
        difficulty: 1,
        tags: ['卷面结构', '书面表达'],
      },
      {
        id: 'eng-topic-1-q4',
        type: 'fill',
        stem: '按本条的推荐，笔试 100 分钟里留给书面表达（写作第三节）的时间约为 ____ 分钟（填阿拉伯数字）。',
        answer: '18|18 分钟|18分钟|十八|十八分钟',
        explanation:
          '推荐预算为：语法选择 8 + 完形 10 + 阅读第一 28 + 阅读第二 6 + 项目情境选择 8 + 项目情境简答 10 + 写作填空 8 + 书面表达 18 + 机动检查 4 = 100 分钟。',
        difficulty: 2,
        tags: ['时间分配', '书面表达'],
      },
      {
        id: 'eng-topic-1-q5',
        type: 'choice',
        stem: '阅读第二节只有 5 题 5 分，为什么错一题常会连带错第二题？',
        options: [
          '因为这一节按连错扣分',
          '因为选错一句后，后面选项的代词指代与逻辑关系就对不上了',
          '因为这一节只给一次修改机会',
          '因为答案必须按字母顺序排列',
        ],
        answer: 'B',
        explanation:
          '阅读填空（从选项中还原句子）是一张「互相咬合」的网：代词 it、they、this，逻辑词 however、also，以及重复出现的名词，都要与上下句对上。一句错位，后面的呼应就跟着错。',
        difficulty: 2,
        tags: ['阅读第二节', '阅读填空'],
      },
      {
        id: 'eng-topic-1-q6',
        type: 'choice',
        stem: '听说考试共多少分？',
        options: ['20 分', '25 分', '30 分', '40 分'],
        answer: 'C',
        explanation:
          '听说共 14 小题 30 分：模仿朗读 8 分、信息获取 13 分、角色扮演 9 分，与笔试 110 分合计 140 分。',
        difficulty: 1,
        tags: ['听说', '卷面结构'],
      },
      {
        id: 'eng-topic-1-q7',
        type: 'choice',
        stem: '语法选择题常见的满分策略，下面哪一条最不可取？',
        options: [
          '先读首句，定下全文时态基调',
          '先看四个选项，直接判断哪个「读起来顺」',
          '回原文看空格前后各一个词，判断要什么词性',
          '填完后把整句连起来读一遍，检查意思是否通顺',
        ],
        answer: 'B',
        explanation:
          '只凭语感读选项，遇到两个都「顺」的选项就无从判断，而干扰项恰恰是照着语感设的。正确顺序是「先看空、后看选项」：先判断空格缺什么成分、什么词性，再用选项验证。',
        difficulty: 2,
        tags: ['语法选择', '解题顺序'],
      },
      {
        id: 'eng-topic-1-q8',
        type: 'short',
        stem:
          '请写出笔试 100 分钟的一种时间分配方案（按小节写清分钟数），并说明为什么把阅读放在最前面做。',
        answer:
          '示例：语法选择 8 分钟，完形填空 10 分钟，阅读第一节 28 分钟，阅读第二节 6 分钟，项目情境第一节 8 分钟，项目情境第二节 10 分钟，写作第一、二节 8 分钟，写作第三节 18 分钟，机动与总检查 4 分钟。把阅读放最前面，是因为它分值最大（阅读两节共 35 分）、需要清醒的头脑，而且做完之后心里有底，后面的题型不会被压时间。',
        explanation:
          '这一题练的是「总—分」规划能力：方案必须凑够 100 分钟，且要说出理由（分值大、吃状态、能定心）。',
        difficulty: 2,
        tags: ['时间分配', '应试策略'],
        rubric: [
          '写出至少 6 个小节的分钟数',
          '各小节合计为 100 分钟（允许 95—100）',
          '说明阅读分值最大或最需要清醒状态',
          '说明做完阅读后心态与后面题型的节奏更稳',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 2. 语法选择九类高频考法                                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-2',
    grade: 'all',
    unit: '题型串讲',
    title: '语法选择题的九类高频考法',
    enTitle: 'Nine Hot Points in the Grammar Section',
    summary:
      '语法选择那 10 道题看起来千变万化，其实只在九个地方设错：时态、语态、非谓语、从句语序、代词、介词、连词、情态动词、主谓一致。每一类只要记一句判断口诀，就能在两分钟内解决。',
    points: [
      {
        level: '重点',
        text: '时态与语态是最常考的两类，合起来通常占 3—4 个空。',
        explain:
          '考法：给一个时间状语或前后两个动作，让你选动词形式。快速判断：先找时间标志词（yesterday、so far、while、since），再判断主语是「做动作的」还是「被动作的」。两者都确定了，四个选项里只剩一个。',
      },
      {
        level: '重点',
        text: '非谓语（to do / doing / done）几乎每篇必有一个空。',
        explain:
          '考法：一句里出现第二个动词。判断顺序只有三步：① 前面是介词吗（介词后必须用 doing）；② 前面是固定搭配吗（want to do、enjoy doing、be used to doing）；③ 这个动作是主语同时做的，还是目的/结果。',
      },
      {
        level: '重点',
        text: '从句题九成只需答两件事：连接词选对、语序用陈述。',
        explain:
          '宾语从句一律用「连接词 + 主语 + 谓语」的陈述语序，句末用句号；「主将从现」只适用于时间和条件状语从句（if、when、as soon as、until），不要套到宾语从句上。',
      },
      {
        level: '重点',
        text: '代词题先还原它指代的名词，再定单复数与人称。',
        explain:
          '考法：空格前后出现两个名词，让你选 it、them、its、theirs 之类。快速判断：把空格换成「前文那个名词」读一遍，单复数一对不上就排除。',
      },
      {
        level: '次重点',
        text: '介词与连词各 1—2 个空，考的是搭配与逻辑，不是词义。',
        explain:
          '介词几乎全是固定搭配（be good at、be interested in、be proud of、depend on）；连词看两句之间的关系：并列用 and，转折用 but，因果用 so / because，让步用 although / though。',
      },
      {
        level: '次重点',
        text: '情态动词题考语气强弱：must 必须、mustn\u2019t 禁止、needn\u2019t 不必。',
        explain:
          '这四个词的差别常常是同一个空里唯一的考点。另外情态动词后一律接动词原形，看到 to 或 -ing 就可以直接排除。',
      },
      {
        level: '了解',
        text: '主谓一致一般只出 1 个空，但常与 there be、neither ... nor ...、each 捆绑。',
        explain:
          '近年常见考法是「副词短语插在主语和谓语之间」制造距离，如 The number of visitors to the museum ___ growing。这时只要划出真正的主语（the number），答案就出来了。',
      },
    ],
    rules: [
      {
        rule: '时态先看时间标志词，再与上下文保持一致',
        form: '时间状语 → 时态',
        example: 'My brother was watching TV when I got home last night.',
        cn: 'when 引导的从句用一般过去时，主句表示「当时正在进行」，所以用过去进行时。',
        tip: 'already、yet、since、so far、so far 常配现在完成时；while 常配进行时；by the end of last year 配过去完成时。',
      },
      {
        rule: '语态先问一句：主语是自己做，还是被别人做',
        form: 'be + 过去分词',
        example: 'The old library was pulled down last year.',
        cn: 'the old library 不会拆自己，所以用被动；last year 决定是过去时。',
        tip: 'happen、take place、belong to、appear 这类动词没有被动语态，见到 be + 这些词的过去分词一律排除。',
      },
      {
        rule: '一个简单句只有一个谓语，第二个动词要变非谓语',
        form: 'to do / doing / done',
        example: 'I heard someone singing in the next room.',
        cn: 'hear sb doing 指听到正在进行的动作；hear sb do 指听到整个过程。考点往往就在这两个之间。',
        tip: '介词后面一律用 doing；want、decide、hope、plan、agree 后面用 to do；enjoy、finish、mind、keep、suggest、practise 后面用 doing。',
      },
      {
        rule: '宾语从句用陈述语序，连接词后面的语序就是「主语 + 谓语」',
        form: '连接词 + 主语 + 谓语',
        example: 'Could you tell me where the bus stop is?',
        cn: '不能写成 where is the bus stop。疑问语序只保留在连接词前面的主句里：Could you tell me ...',
        tip: '从句内部用陈述语序，但句末仍用问号（主句是疑问句）；若主句是 I wonder、I do not know，句末才用句号。',
      },
      {
        rule: '代词题先找它指代的名词，再决定单复数与人称',
        form: 'it / they / them / their / theirs',
        example: 'These photos are mine. Hers are on the wall.',
        cn: '形容词性物主代词后面必须跟名词，名词性物主代词后面不能再跟名词——这是这一题的唯一分界线。',
        tip: '反身代词（myself、herself）只在主语与宾语是同一人时使用，如 She taught herself English。',
      },
      {
        rule: '介词不考意思，考搭配：动词或形容词与介词的固定组合',
        form: 'be + adj. + prep.',
        example: 'She is interested in science and good at maths.',
        cn: 'interested in、good at 都是固定搭配，背过就是送分题，没背过就只能靠印象。',
        tip: '时间介词：in + 年/月/季节，on + 具体某天，at + 钟点。地点介词：at 小地点，in 大地点。',
      },
      {
        rule: '连词看两句之间的逻辑：并列、转折、因果、让步',
        form: 'and / but / so / because / although',
        example: 'Although it was raining hard, the match went on.',
        cn: 'although 引导让步，主句不能再出现 but。',
        tip: 'because 与 so 同理，二者只能留一个，这是中文「因为……所以……」最容易带出来的错。',
      },
      {
        rule: '情态动词后接动词原形，考的是语气强弱',
        form: 'must / can / may / need / should + 动词原形',
        example: 'You need not finish it today, but you must hand it in by Friday.',
        cn: 'need not 表示不必，must not 表示禁止——同一个空，差别只在这一个字。',
        tip: 'must 开头的疑问句，否定回答用 need not 或 do not have to，不用 must not。',
      },
      {
        rule: '主谓一致：先划出真正的主语，再看单复数',
        form: '主语 + 谓语（数一致）',
        example: 'Neither the students nor the teacher was late this morning.',
        cn: 'neither ... nor ... 用就近一致：靠近谓语的 the teacher 是单数，所以用 was。',
        tip: 'each、every、one of、the number of 后接单数谓语；a number of、a lot of 后接复数谓语。',
      },
    ],
    mistakes: [
      {
        wrong: 'I have finished my homework yesterday.',
        right: 'I finished my homework yesterday.',
        why: '现在完成时表示「到现在的状态」，不能与 yesterday、last week、in 2020 这类明确的过去时间连用。',
      },
      {
        wrong: 'Could you tell me where is the museum?',
        right: 'Could you tell me where the museum is?',
        why: '宾语从句必须用陈述语序。把疑问语序塞进从句，是语法选择里最稳定的干扰项。',
      },
      {
        wrong: 'Although he was tired, but he kept working.',
        right: 'Although he was tired, he kept working.',
        why: '中文的「虽然……但是……」可以同时说，英语里 although 与 but 只能留一个。',
      },
      {
        wrong: 'This dictionary is belonged to my sister.',
        right: 'This dictionary belongs to my sister.',
        why: 'belong to 是不及物动词短语，没有被动语态，也不能加 be。',
      },
      {
        wrong: 'He suggested to go home early.',
        right: 'He suggested going home early.',
        why: 'suggest 后面接动名词或 that 从句，不接 to do。同类动词还有 enjoy、finish、mind、practise。',
      },
    ],
    questions: [
      {
        id: 'eng-topic-2-q1',
        type: 'choice',
        stem: 'I ____ in Guangzhou since 2015, and I know every corner of it.',
        options: ['live', 'lived', 'have lived', 'am living'],
        answer: 'C',
        explanation:
          'since 2015 表示从过去持续到现在，用现在完成时。A 是一般现在时（不能与 since 连用）、B 只说明过去、D 只表示此刻正在做，都不合。',
        difficulty: 1,
        tags: ['时态', '现在完成时'],
      },
      {
        id: 'eng-topic-2-q2',
        type: 'choice',
        stem: 'The new bridge ____ two years ago, and it is still in good condition.',
        options: ['builds', 'built', 'was built', 'is built'],
        answer: 'C',
        explanation:
          '桥是被建造的，用被动语态；two years ago 说明是过去，所以用一般过去时的被动 was built。B 少了 be，是典型的「漏被动」干扰项。',
        difficulty: 1,
        tags: ['语态', '被动语态'],
      },
      {
        id: 'eng-topic-2-q3',
        type: 'choice',
        stem: 'My father asked me ____ the windows before leaving the house.',
        options: ['to close', 'closing', 'close', 'closed'],
        answer: 'A',
        explanation:
          'ask sb to do sth 是固定搭配，所以用不定式 to close。C 少了 to、B 用了动名词、D 是过去分词，都不符合搭配。',
        difficulty: 1,
        tags: ['非谓语', '固定搭配'],
      },
      {
        id: 'eng-topic-2-q4',
        type: 'choice',
        stem: 'Could you tell me ____?',
        options: [
          'when will the meeting start',
          'when the meeting will start',
          'when does the meeting start',
          'when the meeting start',
        ],
        answer: 'B',
        explanation:
          '宾语从句用陈述语序，即「连接词 + 主语 + 谓语」，所以是 when the meeting will start。A、C 保留了疑问语序，D 谓语缺助动词。',
        difficulty: 2,
        tags: ['从句', '宾语从句语序'],
      },
      {
        id: 'eng-topic-2-q5',
        type: 'choice',
        stem: 'The little girl is only five, but she can already dress ____.',
        options: ['her', 'hers', 'herself', 'she'],
        answer: 'C',
        explanation:
          '主语 the little girl 与宾语是同一个人，用反身代词 herself。dress oneself 是「自己穿衣服」的固定说法。',
        difficulty: 2,
        tags: ['代词', '反身代词'],
      },
      {
        id: 'eng-topic-2-q6',
        type: 'choice',
        stem: 'We are all proud ____ what our class has done this term.',
        options: ['of', 'for', 'with', 'at'],
        answer: 'A',
        explanation:
          'be proud of 是固定搭配。介词题考的是搭配记忆，四个选项中只有 of 能与 proud 组成固定短语。',
        difficulty: 1,
        tags: ['介词', '固定搭配'],
      },
      {
        id: 'eng-topic-2-q7',
        type: 'choice',
        stem: '____ it was raining heavily, the workers finished the work on time.',
        options: ['Although', 'Because', 'So', 'But'],
        answer: 'A',
        explanation:
          '前后是让步关系：下着大雨，还是按时完工了，所以用 Although。Because 表因果、So 与 But 都不能放在这个位置与后面的主句搭配。',
        difficulty: 2,
        tags: ['连词', '让步状语从句'],
      },
      {
        id: 'eng-topic-2-q8',
        type: 'choice',
        stem: 'You ____ smoke here. Look at the sign: it is a children\u2019s hospital.',
        options: ['need not', 'must not', 'may not', 'would not'],
        answer: 'B',
        explanation:
          '医院的禁烟标志表示「禁止」，语气最强的是 must not。need not 是「不必」，语气太弱；may not 是「可能不」；would not 表示意愿，都不合语境。',
        difficulty: 2,
        tags: ['情态动词', '语气'],
      },
      {
        id: 'eng-topic-2-q9',
        type: 'choice',
        stem: 'Neither Tom nor his parents ____ at home now. They have all gone to the fair.',
        options: ['is', 'are', 'was', 'has been'],
        answer: 'B',
        explanation:
          'neither ... nor ... 连接两个主语时用就近一致：靠近谓语的 his parents 是复数，所以用 are。now 也说明用现在时。',
        difficulty: 3,
        tags: ['主谓一致', '就近一致'],
      },
      {
        id: 'eng-topic-2-q10',
        type: 'fill',
        stem: '用括号中动词的适当形式填空：If it ____ (rain) tomorrow, we will stay at home.',
        answer: 'rains|Rains',
        explanation:
          'if 引导条件状语从句时用「主将从现」：主句用一般将来时，从句用一般现在时，主语 it 是第三人称单数，所以填 rains。',
        difficulty: 2,
        tags: ['时态', '主将从现'],
      },
    ],
    examTips: [
      '语法选择整节 10 题 15 分，建议 8 分钟做完：前 6 题单空、判断快，后 4 题常连成一段，多留一点时间读句意。',
      '每道题的判断顺序固定为「看空 → 定词性 → 排除形式错 → 再看句意」，这三步能解决八成题目，剩下两成才是真正的语感题。',
      '四个选项里如果出现「be + 动词过去分词」与「动词过去式」并列，先判断主被动，这是这一节最高频的设错点。',
      '凡空格前面是介词，先在选项里找 -ing 形式；凡空格后面是名词，先找形容词或限定词。这两条几乎不需要读完整句。',
      '做完把整篇短文连着读一遍，检查时态是否前后一致：多数「明明会却错了」的题，都是前后时态没对齐。',
      '错题本上不要只抄题，要写下「我当时被哪个干扰项骗了」，例如「把 need not 当成 must not」，复习时看这一句最有用。',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 3. 完形填空与阅读的通用解题流程                                    */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-3',
    grade: 'all',
    unit: '题型串讲',
    title: '完形填空与阅读的通用解题流程',
    enTitle: 'A Fixed Routine for Cloze and Reading',
    summary:
      '完形与阅读加起来 40 分，是笔试里最大的一块，也是最不靠天赋的一块：通读抓主线、上下文找线索、固定搭配、逻辑连词、排除法，这五步按顺序走，分数会稳定下来。',
    points: [
      {
        level: '重点',
        text: '第一遍通读不看选项，先抓住「谁、做了什么、结果怎样」。',
        explain:
          '完形填空与阅读都适用。第一句往往就交代了时间、人物与基调，把它读懂，后面每个空的方向（褒义还是贬义、过去还是现在）就定了。通读时看选项，等于让出题人替你读文章。',
      },
      {
        level: '重点',
        text: '线索分三类：往前找同义重复、往后找解释举例、句中找固定搭配。',
        explain:
          '完形的每个空都能在这三类里找到依据。冒号、破折号、that is 后面是解释；this means、so 后面是结果；and、or 连接的是同类信息。找不到线索就先跳过，后面往往会给。',
      },
      {
        level: '重点',
        text: '逻辑连词决定方向：but / however 转折，so / therefore 结果，besides / also 递进。',
        explain:
          '阅读的推断题与完形的语义空都吃这一条。看到 however，要选的词必然与前文相反；看到 besides，要选的必然是同向补充。这类空常常一眼可定，属于必须先拿的分。',
      },
      {
        level: '重点',
        text: '阅读细节题三步走：读题干定关键词 → 回原文定位 → 比对同义替换。',
        explain:
          '细节题占阅读第一节的多数，每题 2 分。定位靠专有名词、数字与大写词；比对时注意原文与选项往往是同义替换（put off → next month），而选项里照抄原文原词最多的那个常常是陷阱。',
      },
      {
        level: '次重点',
        text: '排除法三刀：形式不对的排除、不合逻辑的排除、与原文矛盾或范围过大的排除。',
        explain:
          '四选一永远有两条明显不对。先用形式（时态、语态、单复数）砍掉一两个，再用「太绝对」砍掉 always、never、all、only 这类选项，剩下的再比句意。',
      },
      {
        level: '次重点',
        text: '主旨题看首段、末段与各段首句，不要陷进细节。',
        explain:
          '主旨题的答案要能盖住全文，范围太小的选项（只讲某一个例子）与范围太大的选项（扩大到整个社会）都是错的。写完用一句话自问「全文在讲什么」，能对上就是它。',
      },
      {
        level: '了解',
        text: '推断题只推一步，答案必须能在原文找到依据。',
        explain:
          '推两步就是「凭常识」，最容易错。判断方法：把选项拿回原文，看有没有一处句子支持它；只要有一处支持且不必补充额外信息，它就是对的。',
      },
    ],
    rules: [
      {
        rule: '第一步通读：不看选项，把整篇读完，弄清人物、经过与结果',
        form: '先通读，后回填',
        example: 'When I first joined the school team, I could hardly catch the ball.',
        cn: '第一句交代了时间与处境，后面的空一律按「过去、并且是初学阶段的困难」这个方向判断。',
        tip: '通读 60 秒即可，不要逐词翻译，只要抓住每段在讲什么。',
      },
      {
        rule: '第二遍先做「看得见线索」的空：固定搭配、时态标志词、逻辑连词',
        form: '搭配 → 语法 → 逻辑',
        example: 'She is good at maths and often helps others with it.',
        cn: 'good at 是固定搭配，一眼可定；and 提示后一句是同向信息。先把这类空填掉，剩下的空靠上下文，难度会明显下降。',
        tip: '人称、时间、褒贬三类信息在通读时就要记住，回填时全靠它们筛选项。',
      },
      {
        rule: '逻辑连词一出现，就往它后面找「相反或同向」的信息',
        form: '转折 / 因果 / 递进',
        example: 'The test was difficult. However, most of us passed it.',
        cn: 'however 要求后文与前文相反：前文说难，后文说大部分人都过了，这就是转折关系。',
        tip: 'however 通常用句号或分号与前句隔开，后面加逗号；but 连接两个并列分句。',
      },
      {
        rule: '阅读细节题不凭印象作答，一定回原文找那一句',
        form: '定位 → 比对',
        example: 'The notice says the trip has been put off, so it will take place next month.',
        cn: '题干里的 next month 与原文的 put off 是同义替换，这正是正确选项的常见写法。',
        tip: '选项与原文「逐词相同」时尤其要小心，出题人常常改一个词就把意思写反。',
      },
      {
        rule: '推断题只推一步，推两步就成了凭常识',
        form: '原文依据 + 一步推理',
        example: 'Since the students watered the seeds every day, the soil became too wet for them to grow.',
        cn: '这句推断的每一部分都能在原文找到根据：浇水太勤、土壤太湿、种子没发芽。多补一句「所以学生不会种地」就超出原文了。',
        tip: '选项里出现 must、never、the best、all 这类绝对表述时，多半是错的。',
      },
      {
        rule: '主旨题看标题与首末段的重复词，重复出现的就是主题词',
        form: '重复词 → 主旨',
        example: 'A garden does not grow in a hurry.',
        cn: '这句话在文中作为引语出现，也点明了全文想说的道理，主旨题的答案常与它同义。',
        tip: '最佳标题题要能同时盖住「事件」与「道理」，只写事件的选项通常不对。',
      },
      {
        rule: '时间不够时先放弃最耗时的那一篇，把能定位的题做完',
        form: '标记 → 跳走 → 回头',
        example: 'I marked Question 12 and went back to it after finishing the last passage.',
        cn: '一篇阅读超过 8 分钟还不顺，就先把带专有名词、数字的题做完（好定位），剩下的标记后跳走，回头常常一眼就懂。',
        tip: '哪怕最后只剩 1 分钟，也要把跳过的题涂上一个答案。',
      },
    ],
    passages: [
      {
        title: 'The Corner That Turned Green',
        kind: '记叙文',
        text:
          'Last spring, our science teacher gave us an unusual task: turn a dusty corner of the school yard into a garden. Most of us thought it would be easy. We bought seeds, borrowed tools and planted them in a hurry. Two weeks later, almost nothing came up.\nInstead of handing out new seeds, Miss Lin asked us to find out why. We measured the soil, checked the sunlight and read the seed packets again. The answer was simple: we had planted the seeds far too deep, and we had watered them every day, which made the soil too wet.\nThe second time, everything changed. We dug small holes, put each seed in gently and wrote the date on a wooden stick. We took turns to water the garden twice a week. By June, rows of green leaves covered the corner that used to be grey and dusty.\nThe best part came later. Miss Lin put a photo of our first tomato on the classroom wall. Under the photo she wrote: "A garden does not grow in a hurry." None of us will forget those words, because we learned them with our own hands.',
        cn:
          '去年春天，我们的科学老师给我们布置了一个不寻常的任务：把校园角落里一块满是灰尘的空地变成花园。我们大多数人觉得这很容易。我们买了种子、借了工具，匆匆忙忙地种下去。两周以后，几乎什么都没长出来。\n林老师没有发新种子，而是让我们自己找出原因。我们测量了土壤，检查了光照，又把种子包装上的说明读了一遍。答案很简单：我们把种子埋得太深，而且每天浇水，土壤太湿了。\n第二次，一切都变了。我们挖出小坑，轻轻把每一粒种子放进去，还在木牌上写下日期。我们轮流每周浇两次水。到了六月，一排排绿叶盖满了那块曾经灰扑扑的角落。\n最精彩的部分来得更晚。林老师把我们结出的第一个番茄的照片贴在教室墙上，照片下面写着一句话：「花园不会在一夜之间长成。」我们谁也不会忘记这句话，因为这是我们用自己的双手学到的。',
        questions: [
          {
            id: 'eng-topic-3-p1-q1',
            type: 'choice',
            stem: 'Why did almost nothing come up two weeks after the first planting?',
            options: [
              'The students planted the seeds too deep and watered them too often.',
              'The corner was too dusty for anything to grow.',
              'The school did not give the students enough seeds.',
              'The students had no tools to dig holes with.',
            ],
            answer: 'A',
            explanation:
              '原文第二段明确指出：we had planted the seeds far too deep, and we had watered them every day, which made the soil too wet。B、C、D 在文中都没有依据——工具是借到的、种子也够，所以都是「看着合理但没出处」的选项。',
            difficulty: 2,
            tags: ['细节题', '因果关系'],
          },
          {
            id: 'eng-topic-3-p1-q2',
            type: 'choice',
            stem: 'What did the students do to find out the reason?',
            options: [
              'They asked Miss Lin for new seeds at once.',
              'They measured the soil and checked the sunlight.',
              'They moved the garden to a sunny place.',
              'They gave up and planted flowers instead.',
            ],
            answer: 'B',
            explanation:
              '第二段写得很清楚：We measured the soil, checked the sunlight and read the seed packets again。A 与原文相反（Miss Lin 没有立刻发新种子），C、D 文中都没有出现。',
            difficulty: 1,
            tags: ['细节题'],
          },
          {
            id: 'eng-topic-3-p1-q3',
            type: 'choice',
            stem: 'Which of the following is TRUE according to the passage?',
            options: [
              'The class planted the garden only once.',
              'The students wrote the planting date on a wooden stick.',
              'Miss Lin handed out new seeds and tools the next day.',
              'The corner was still grey by the end of June.',
            ],
            answer: 'B',
            explanation:
              '第三段说 wrote the date on a wooden stick，B 正确。A 与「The second time」矛盾；C 文中没有提到立刻发新种子；D 与 By June, rows of green leaves covered the corner 相反。',
            difficulty: 2,
            tags: ['细节题', '正误判断'],
          },
          {
            id: 'eng-topic-3-p1-q4',
            type: 'choice',
            stem: 'What does Miss Lin\u2019s sentence want to tell the students?',
            options: [
              'Gardens need expensive tools.',
              'Good results take time and patience.',
              'Students should not plant vegetables at school.',
              'Tomatoes are hard to grow in Guangzhou.',
            ],
            answer: 'B',
            explanation:
              'A garden does not grow in a hurry 说的是「花园不会一夜长成」，对应全文的主线：匆忙种下失败，耐心重种成功，所以答案是「好事需要时间与耐心」。D 把范围缩小到番茄，属于典型的「范围太小」干扰项。',
            difficulty: 2,
            tags: ['句意理解', '主旨'],
          },
          {
            id: 'eng-topic-3-p1-q5',
            type: 'choice',
            stem: 'What is the best title for the passage?',
            options: [
              'How to Grow Tomatoes at School',
              'A Garden Does Not Grow in a Hurry',
              'Our Busy Science Teacher',
              'The Dustiest Corner of the School',
            ],
            answer: 'B',
            explanation:
              '标题要同时盖住「种花园这件事」与「文中要讲的道理」。B 是文中的关键句，既指事件也指道理。A 只写了结尾的番茄，C 只写老师，D 只写了开头的地，范围都太窄。',
            difficulty: 3,
            tags: ['最佳标题', '主旨'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-topic-3-q1',
        type: 'choice',
        stem: '做一篇完形填空，第一遍最应该做的是：',
        options: [
          '逐空边读边填，先把有把握的填掉',
          '跳过所有空格通读全文，抓住人物、经过与结果',
          '先读四个选项，按排除法猜一遍',
          '从最后一个空往前做',
        ],
        answer: 'B',
        explanation:
          '第一遍通读的目的是建立「全局方向」：时间、人物、褒贬。带着方向回填时，很多空是两秒钟就能定的。A 会把整篇切碎、D 更是无从判断，C 会被干扰项牵着走。',
        difficulty: 1,
        tags: ['完形填空', '解题流程'],
      },
      {
        id: 'eng-topic-3-q2',
        type: 'choice',
        stem: '完形填空的四个选项都认识时，最可靠的判断依据是：',
        options: [
          '哪个词更长、看起来更高级',
          '固定搭配与上下文逻辑',
          '哪个词更简单',
          '选项在 A、B、C、D 中的位置',
        ],
        answer: 'B',
        explanation:
          '完形的空几乎都能由「固定搭配」或「上下文逻辑（转折、因果、递进、同义重复）」定位。凭词形长短或位置猜，是没有依据的随机作答。',
        difficulty: 2,
        tags: ['完形填空', '逻辑连词'],
      },
      {
        id: 'eng-topic-3-q3',
        type: 'choice',
        stem: '阅读细节题定位不到原文时，最稳的做法是：',
        options: [
          '选最长的那个选项',
          '凭常识判断哪个更合理',
          '换关键词再定位一次，注意同义替换',
          '选文中出现过次数最多的那个词组',
        ],
        answer: 'C',
        explanation:
          '定位失败一般是关键词选错了：题干用的是 politely refused，原文可能写 turned down。换成原文可能使用的说法再找，或用数字、专有名词定位。凭常识作答是阅读失分的主要原因。',
        difficulty: 2,
        tags: ['阅读理解', '细节题'],
      },
      {
        id: 'eng-topic-3-q4',
        type: 'choice',
        stem: '看到 however 这类词，正确的做法是：',
        options: [
          '把它当成 and 一样，后面接同向信息',
          '判断前后是相反关系，所选词要与前文形成对照',
          '把它删掉再看句子',
          '只要出现 however，答案一定在下一段',
        ],
        answer: 'B',
        explanation:
          'however 表示转折，它前面的信息与后面的信息方向相反。完形的语义空与阅读的推断题都吃这一条，抓住它常常能一眼定答案。',
        difficulty: 1,
        tags: ['逻辑连词', '转折'],
      },
      {
        id: 'eng-topic-3-q5',
        type: 'choice',
        stem: '做推断题时，下面哪种选项最需要怀疑？',
        options: [
          '与原文某一句意思相近的选项',
          '含 must、never、the best、all 等绝对表述的选项',
          '句式比较简单的选项',
          '含有原文中出现过的词的选项',
        ],
        answer: 'B',
        explanation:
          '推断题的答案必须是「原文能支持的一步推理」，而绝对化表述把结论推到极致，通常超出原文信息。含原文原词的选项也要小心，那可能是出题人改写过的陷阱。',
        difficulty: 2,
        tags: ['阅读理解', '推断题'],
      },
      {
        id: 'eng-topic-3-q6',
        type: 'fill',
        stem: '用两个字概括完形填空的解题顺序：先 ____ 全文，再回填每个空。',
        answer: '通读|通读一遍|读通',
        explanation:
          '先通读、后回填，是完形填空唯一稳定的顺序。通读建立的方向感，决定了后面每个空的判断标准。',
        difficulty: 1,
        tags: ['完形填空', '解题流程'],
      },
    ],
    examTips: [
      '完形填空 10 题 10 分建议 10 分钟：通读 1 分钟，回填 7 分钟，回读检查 2 分钟。第一遍就把整篇读完的人，通常比见空就填的人少错 2 题。',
      '阅读第一节 15 题 30 分建议 28 分钟，四篇平均每篇 7 分钟。每篇先读第一段与每段首句，再按题定位，不必逐词精读。',
      '把「线索来源」写在做题笔记里：前文同义、后文解释、句中搭配。练上十篇，你会发现完形的空 90% 属于这三类。',
      '阅读题遇到两个选项都「像」，回原文看哪一个有原句支持；不能指出支持句的选项一律放掉。',
      '错题本按「定位错、同义替换没看出来、逻辑关系判断反」三类归类，比按篇目抄题有用得多。',
      '时间不够时的放弃顺序：先放弃最长最难的那篇文章里的主旨题，保住带专有名词与数字的细节题。',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 4. 阅读填空 / 选词填空与项目情境读写                               */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-4',
    grade: 'all',
    unit: '题型串讲',
    title: '阅读填空、选词填空与项目情境读写的解题法',
    enTitle: 'Gapped Text, Word Filling and Project-based Reading & Writing',
    summary:
      '阅读第二节、写作前两节填空、项目情境两节，加起来 35 分，全部围绕「读懂一篇材料，然后用正确形式把信息写出来」。它们的解法是同一条：定位、改写、检查形式。',
    points: [
      {
        level: '重点',
        text: '阅读第二节（5 题 5 分）近年常见为阅读填空：从选项里选句子还原到短文中。',
        explain:
          '判断依据只有一句话：「空前空后的代词、逻辑词与重复名词，能不能与这句话接上」。先读选项做标记（这句里有 it / they 说明前面必须出现过复数名词），再回文中定位，比逐句试读快得多。',
      },
      {
        level: '重点',
        text: '项目情境第二节简答题 5 题 10 分，答案绝大多数能在原文定位。',
        explain:
          '答题四步：读设问定关键词 → 回原文划出那句话 → 把原句改写成主谓齐全的答案 → 检查时态与人称。注意人称转换：原文用 I，设问问你为什么，答案常常要改成 he 或 she。',
      },
      {
        level: '重点',
        text: '写作第一、二节填空题共 10 题 10 分，考词形变化与固定搭配，最容易拿满。',
        explain:
          '常见设空：给首字母要你补全单词、给词根要你变形式、给中文要你写英文。判断顺序固定为「先定词性 → 再看搭配 → 最后变形式」；填完必须回读整句，检查主谓一致与单复数。',
      },
      {
        level: '重点',
        text: '选词填空（选项框中选词填空）必须先划掉已用的词，并注意「多给一个」。',
        explain:
          '词库通常多给一到两个词，多出来的那个不是「最难的」，而是与任何空都对不上的。先用最确定的空把词划掉，剩下的空候选范围就会缩小。填完检查：每个词是否只用了一次、形式是否已改。',
      },
      {
        level: '次重点',
        text: '项目情境第一节选择题 5 题 10 分，题目围绕同一情境，前面读懂了后面就快。',
        explain:
          '这一节与第二节往往共用一段材料。推荐顺序是先做选择再做简答：选择题帮你把材料读细，简答时定位几乎不花时间。',
      },
      {
        level: '次重点',
        text: '项目情境的「情境」题信息量大，先看题目要求再读材料。',
        explain:
          '情境题常以通知、报名表、时间表、邮件的形式出现，先看设问问什么，再带着问题读，能省一半时间。表格类材料注意「行与列各代表什么」，别把时间与地点看串。',
      },
      {
        level: '了解',
        text: '把这四块当成一条链来练：同一篇材料先做选择、再做简答、最后写一小段。',
        explain:
          '四块的技能是同一套（定位 + 改写 + 形式正确），分开刷题效率低。每两天用一篇 200 词的材料走完这条链，比各刷十道题有效。',
      },
    ],
    rules: [
      {
        rule: '阅读填空先读选项，给每个选项做「前后需要什么」的标记',
        form: '读选项 → 标代词与逻辑词 → 回文定位',
        example: 'Most of them say they learn as much as the children do.',
        cn: 'them 说明前文必须出现过复数名词（志愿者的复数），they 也是同一指代。带着这个条件回文中找，空的位置就唯一了。',
        tip: '选项里以 However、Besides、For example 开头的句子，去找文中相应位置的空；这类逻辑词是最快的线索。',
      },
      {
        rule: '简答题先在原文划出依据句，再改写成完整句，不凭记忆作答',
        form: '定位原句 → 改写 → 检查人称与时态',
        example: 'The library holds a training class on the first Friday of every month.',
        cn: '原文可能只在表格里写着 every first Friday，改写时补上主语与谓语，就是标准答案。',
        tip: '答案句不必长，主谓齐全、信息正确就能拿满 2 分。',
      },
      {
        rule: '选词填空按「先确定、后排除」的顺序做，选定一个就划掉一个',
        form: '定词性 → 定词义 → 定形式',
        example: 'Volunteers are always welcome, and new ones can join the programme at any time.',
        cn: '空格前是 can，后面必然是动词原形；再从词库里挑出符合句意的 join，而不是 joining。',
        tip: '填完数一遍：每个词只能用一次，多出来的那个要留在词库里。',
      },
      {
        rule: '给词根变形式的空，按「词性 → 时态语态 → 单复数 → 比较级」四步检查',
        form: '词性 → 形式',
        example: 'The results were surprising, and the children read more books than before.',
        cn: 'surprised 与 surprising 是同一个词根的两个形容词：前者说人的感受，后者说事物本身，这一题问的是 results，所以用 surprising。',
        tip: '看到 by 短语先想被动，看到 than 先想比较级，看到 a few 先想复数。',
      },
      {
        rule: '项目情境题先看设问、再看材料，把问题带进材料里读',
        form: '读题 → 读材料 → 定位',
        example: 'According to the notice, visitors should book a seat online before Friday.',
        cn: '知道要问「怎么预约」以后，读通知时自然会把目光放在 book online 这一行，比通读全文快得多。',
        tip: '表格类材料先看清表头，行与列不能读反。',
      },
      {
        rule: '同一篇材料的多道题一次读透，能省下重读的时间',
        form: '一次读透 → 多题共用',
        example: 'The same passage is used for both the multiple-choice questions and the short answers.',
        cn: '项目情境的选择题与简答题常共用材料，先做选择把材料读细，再做简答，等于免费读了两遍。',
        tip: '位置题、数字题在第几段，读的时候顺手在题号旁写下来。',
      },
    ],
    passages: [
      {
        title: 'Reading Buddies at the City Library',
        kind: '阅读填空（从选项中还原句子）',
        text:
          "Every Saturday morning, the children's room of our city library is full of voices, but not the kind you expect in a library.\nTwo years ago, the library started a programme called Reading Buddy. ___1___ Each child is paired with a teenage volunteer, and the two of them read one story aloud together. The older student does not correct every mistake. Instead, the volunteer waits and gives the child time to work the word out.\n___2___ They are not asked to teach reading. What they do is listen carefully, ask easy questions and wait patiently when a child gets stuck on a long word.\nThe results were surprising. ___3___ \"Before, my son would only look at picture books,\" one mother said. \"Now he borrows two chapter books every week.\"\n___4___ A short training class is held on the first Friday of every month, and new volunteers are always welcome. ___5___\nSo if you are in Grade 8 or above and can spare one hour a week, come to the children's room and ask for Miss Chen.",
        cn:
          '每到星期六上午，我们市图书馆的儿童室里满是说话声，却不是你在图书馆里期待的那一种。\n两年前，图书馆启动了一个叫「阅读伙伴」的项目。___1___ 每个孩子配一名青少年志愿者，两个人一起大声读一个故事。大一点的学生不会纠正每一个错误，而是耐心等着，让孩子自己把单词拼出来。\n___2___ 他们不需要教阅读，要做的是认真听、问一些简单的问题，在孩子卡在一个长单词上时耐心等待。\n结果出人意料。___3___ 「以前，我儿子只看图画书，」一位妈妈说，「现在他每周借两本章节书。」\n___4___ 每月第一个星期五有一节短培训课，新志愿者随时欢迎。___5___\n所以，如果你在八年级或以上，每周能空出一小时，就到儿童室来找陈老师。',
        questions: [
          {
            id: 'eng-topic-4-p1-q1',
            type: 'choice',
            stem: 'Which sentence fits in blank 1?',
            options: [
              'It pairs children aged six to nine with volunteers from local middle schools.',
              'It was closed for two years because of a lack of money.',
              'Parents are asked to pay for every story their children read.',
              'The volunteers must pass a difficult exam before they start.',
            ],
            answer: 'A',
            explanation:
              '后面一句解释项目怎么运作：Each child is paired with a teenage volunteer。A 中的 pairs ... with volunteers 正好接上这个信息。B 与「两年前启动」矛盾，C 与「图书馆的公益项目」不符，D 与后文「短培训课、随时欢迎」矛盾。',
            difficulty: 2,
            tags: ['阅读填空', '句子衔接'],
          },
          {
            id: 'eng-topic-4-p1-q2',
            type: 'choice',
            stem: 'Which sentence fits in blank 2?',
            options: [
              'These volunteers are all experienced primary school teachers.',
              'The volunteers are ordinary middle school students, not teachers.',
              'The children are told to read as fast as they can.',
              'The programme is only open to children who read well.',
            ],
            answer: 'B',
            explanation:
              '紧跟着的一句是 They are not asked to teach reading，主语 they 指志愿者，所以前一句必须先把「志愿者」带出来并说明他们不是老师。A 与 not teachers 矛盾，C、D 与「耐心等孩子读完」的语境相反。',
            difficulty: 2,
            tags: ['阅读填空', '指代线索'],
          },
          {
            id: 'eng-topic-4-p1-q3',
            type: 'choice',
            stem: 'Which sentence fits in blank 3?',
            options: [
              'Some children gave up after the first month.',
              'Most children soon lost interest in reading.',
              'One boy finished twelve books in a single term.',
              'The library had to buy fewer books than before.',
            ],
            answer: 'C',
            explanation:
              '空前是 The results were surprising，空后是一位妈妈夸自己儿子的变化，中间放一个「进步很大」的具体例子最顺。A、B 说的是负面结果，与 surprising 和后文相反；D 与「孩子每周借两本书」矛盾。',
            difficulty: 2,
            tags: ['阅读填空', '语篇逻辑'],
          },
          {
            id: 'eng-topic-4-p1-q4',
            type: 'choice',
            stem: 'Which sentence fits in blank 4?',
            options: [
              'Volunteers must work every day of the week.',
              'Becoming a Reading Buddy is easier than you may think.',
              'The library has stopped taking new volunteers.',
              'Only university students can join the programme.',
            ],
            answer: 'B',
            explanation:
              '空后说「每月一节短培训课，新志愿者随时欢迎」，这是在打消「我怕做不好」的顾虑，所以 B 最接。A、C、D 都与后文矛盾（每周都要来、停止招募、只招大学生）。',
            difficulty: 2,
            tags: ['阅读填空', '句子衔接'],
          },
          {
            id: 'eng-topic-4-p1-q5',
            type: 'choice',
            stem: 'Which sentence fits in blank 5?',
            options: [
              'They are too busy to talk about the programme.',
              'The children never speak to their buddies.',
              'Visitors are not allowed to enter the room.',
              'Many of them say they learn as much as the children do.',
            ],
            answer: 'D',
            explanation:
              '这一段讲志愿者，them 指志愿者，D 说「他们中的很多人说自己学到的东西和孩子一样多」，是对志愿者体验的总结，也为最后一段的招募做铺垫。A、B、C 都是负面信息，与「欢迎加入」的语气冲突。',
            difficulty: 3,
            tags: ['阅读填空', '段落收尾'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-topic-4-q1',
        type: 'choice',
        stem: '做阅读填空（从选项中还原句子）时，最可靠的线索是：',
        options: [
          '选项的长短',
          '空前空后的代词、逻辑连词与重复出现的名词',
          '选项在词库中排列的先后顺序',
          '哪个选项里的生词最少',
        ],
        answer: 'B',
        explanation:
          '这类题考的是语篇衔接：代词（it、they、this）要求前文出现过对应名词；逻辑词（however、besides、for example）要求前文有相应的关系；重复名词说明话题连着。选项长短与生词数量都不能作为依据。',
        difficulty: 2,
        tags: ['阅读填空', '语篇衔接'],
      },
      {
        id: 'eng-topic-4-q2',
        type: 'choice',
        stem: '项目情境第二节的简答题，最稳的拿分方式是：',
        options: [
          '用自己的话自由概括，写得多一点',
          '先定位原文依据句，再改写成主谓齐全的完整句',
          '只写关键词或短语，节省时间',
          '把相关的一整段抄下来',
        ],
        answer: 'B',
        explanation:
          '每题 2 分，按要点与语言给分。改写完整句能同时满足两点；只写关键词容易语言分不足，整段照抄既费时间又可能答非所问。',
        difficulty: 1,
        tags: ['项目情境', '简答题'],
      },
      {
        id: 'eng-topic-4-q3',
        type: 'choice',
        stem: '选词填空填完最后一个空后，必须做的一件事是：',
        options: [
          '数一遍每个词是否只用了一次',
          '把答案按字母顺序重排',
          '把词库里的词全部填进空里',
          '把多出来的词也填到一个空里',
        ],
        answer: 'A',
        explanation:
          '词库里通常多给一到两个词，每个词只能用一次。做完数一遍「用了几次、还剩几个」，是检查这类题最快也最有效的方法。',
        difficulty: 2,
        tags: ['选词填空', '检查'],
      },
      {
        id: 'eng-topic-4-q4',
        type: 'choice',
        stem: '写作第一节的填空题给首字母提示时，判断答案的正确顺序是：',
        options: [
          '先变形式再猜词义',
          '先定词性，再看搭配，最后变形式',
          '只按首字母选一个认识的词',
          '选字母最少的那个词',
        ],
        answer: 'B',
        explanation:
          '先看空格要什么词性（名词、动词、形容词），再看搭配（与前后哪个词连用），最后才依据时态、单复数变形式。顺序反了就常出现「词对了、形式错了」。',
        difficulty: 2,
        tags: ['写作填空', '词形变化'],
      },
      {
        id: 'eng-topic-4-q5',
        type: 'choice',
        stem: '给词根变形式的题中，The results were ____ (surprise). 应填：',
        options: ['surprised', 'surprising', 'surprise', 'surprisingly'],
        answer: 'B',
        explanation:
          '-ing 形容词描述「让人产生这种感受的事物」（results 让人吃惊），-ed 形容词描述「人的感受」（人感到吃惊）。主语是 results，所以用 surprising。D 是副词，不能作表语。',
        difficulty: 2,
        tags: ['词形变化', '形容词'],
      },
      {
        id: 'eng-topic-4-q6',
        type: 'fill',
        stem: '做阅读填空时，第一步应该先读 ____（填「选项」或「原文」）。',
        answer: '选项|Options|options',
        explanation:
          '先读选项并标出每句里的代词与逻辑词，相当于先知道「要找什么样的句子」，再回文中定位就快得多。先读原文容易读完就忘，反复来回。',
        difficulty: 1,
        tags: ['阅读填空', '解题顺序'],
      },
      {
        id: 'eng-topic-4-q7',
        type: 'short',
        stem: '项目情境第二节简答题每题 2 分，请写出你的作答流程（四步）。',
        answer:
          '第一步读设问，圈出关键词（问什么、问谁、问哪一段）；第二步回原文用关键词定位，划出依据句；第三步把依据句改写成主谓齐全的完整句，必要时转换人称与时态；第四步回读答案，检查拼写、单复数与时态是否正确。',
        explanation:
          '这一题考的是流程化作答。写出四步并能说出每一步做什么，比背答案有用：换一段材料同样适用。',
        difficulty: 2,
        tags: ['项目情境', '答题方法'],
        rubric: [
          '写出读设问并圈关键词',
          '写出回原文定位、划出依据句',
          '写出改写成完整句并说明人称或时态转换',
          '写出回读检查拼写、单复数与时态',
        ],
      },
    ],
    examTips: [
      '阅读第二节 5 题 5 分，建议 6 分钟：先读选项 2 分钟做标记，再回文定位 3 分钟，最后回读 1 分钟。',
      '项目情境两节 18 分钟：先做选择题（帮自己读懂材料），再做简答题；两节共用材料时，这个顺序能省一半时间。',
      '简答题答案越简洁越安全：主谓齐全、信息正确就够，多写反而容易带出语法错误。',
      '写作填空虽然只有 10 分，却是全卷最容易拿满的一块：做完立刻回读整句，检查主谓一致、单复数与时态，通常能捡回 2 分。',
      '选词填空的词库多给一到两个词，先做最有把握的空并划掉用掉的词，剩下的空候选范围自然缩小。',
      '平时练这四块时不要分开刷：用同一篇 200 词的材料，先做选择、再做简答、最后写三句话，一条链走完，提分最快。',
    ],
    mistakes: [
      {
        wrong: 'The results were surprised us.',
        right: 'The results surprised us.',
        why: 'surprise 本身是动词，直接用过去式 surprised；如果要用形容词，则是 The results were surprising。把 be 与动词过去式堆在一起，是这一题最常见的错。',
      },
      {
        wrong: 'Each child are paired with a volunteer.',
        right: 'Each child is paired with a volunteer.',
        why: 'each 后接单数名词，谓语用单数；此外被动语态是 be + 过去分词，配对关系要用被动。',
      },
      {
        wrong: 'New volunteers are always welcome, they can join the programme at any time.',
        right: 'New volunteers are always welcome. They can join the programme at any time.',
        why: '英语里逗号不能连接两个完整的句子（逗号粘连），要用句号或 and 等连词。这是写作填空与简答题最容易被扣的语言分。',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 5. 书面表达：从 13 分到 20 分                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-5',
    grade: 'all',
    unit: '题型串讲',
    title: '写作高分路径：从 13 分到 20 分',
    enTitle: 'From 13 to 20: How to Raise Your Writing Score',
    summary:
      '书面表达 20 分，多数学生停在 13—15 分，卡住的不是词汇量，而是三件事：要点没落齐、句子太单调、全是中式英语。这一条用同一题目的两篇范文，让你看清这 7 分差在哪里。',
    points: [
      {
        level: '重点',
        text: '审题 5 分钟：把题目要求的要点逐条编号写下来，写完逐条打勾。',
        explain:
          '漏一个要点通常扣 3—5 分，比任何语法错误都贵。题目里的「1）…… 2）…… 3）……」就是评分点，一条都不许少。写完回读时拿笔逐条划勾，两分钟就能确认。',
      },
      {
        level: '重点',
        text: '三段式结构：第一段回应情境、第二段铺开要点、第三段表达期待或建议。',
        explain:
          '每段 2—4 句最稳。第一段用一句 I am glad to hear that ... 或 I am writing to ... 把情境接上；第二段按要点顺序展开，一段一个层次；第三段用一句期待或邀请收尾，阅卷老师一眼就能看到结构。',
      },
      {
        level: '重点',
        text: '至少 3 个连接词 + 2 个升级句型，这是语言分上一档的关键。',
        explain:
          '连接词（First、Besides、What is more、Since、However）负责连贯，升级句型（not only ... but also、so ... that、定语从句、It is + adj. + to do）负责语言质量。13 分与 18 分的差距，通常就是这两样凑不出来。',
      },
      {
        level: '重点',
        text: '全文时态要统一：写习惯用一般现在时，写计划用一般将来时，写已完成的事用现在完成时。',
        explain:
          '近年常见的情况是题目同时要求「介绍活动」与「表达期待」，于是前一半该用现在时、后一半该用将来时。写之前先在草稿纸角上写「现在 / 将来」，写完逐句核对。',
      },
      {
        level: '次重点',
        text: '常见扣分点：漏要点、时态混用、中式英语、字数不足、书写潦草。',
        explain:
          '前三个是内容与语言分，后面是硬性扣分。字迹清楚、行距均匀不需要任何英语能力，却能实实在在保住分。',
      },
      {
        level: '次重点',
        text: '字数控制在 80—120 词：少写内容单薄，多写容易带出语法错误。',
        explain:
          '多写 20 个词的风险大于收益：每个多余的句子都可能是错误的来源。把要点写清楚，再补一句感受，一般正好落在 100 词左右。',
      },
      {
        level: '了解',
        text: '结尾一句要用得上「期待、邀请、建议」的功能句。',
        explain:
          'Looking forward to your reply. / I hope you can join us. / Why not have a try? 这类句子是「篇末点题」的位置，阅卷时最容易被看到，性价比很高。',
      },
    ],
    writing: {
      topic:
        '假设你是李华，你的英国朋友 Peter 下个月要来广州。他发来邮件说想学一样「最有广州味道」的东西，请你回信：1）推荐一项活动（如粤剧、广彩、醒狮或早茶点心课）；2）说明活动的时间、地点和内容；3）欢迎他来并约定见面时间。词数 80—120。',
      requirements: [
        '三段式：第一段回应并提出推荐，第二段写清时间、地点与内容，第三段表达欢迎并约定见面时间。',
        '至少用 3 个连接词或过渡语（如 First、Besides、What is more、Since、After that）。',
        '至少写 2 个升级句型（如 If 条件句、定语从句、not only ... but also、Since 引导的原因状语从句）。',
        '不要出现中式英语：I very like it、I will very happy、I with my friend go 这类说法一律改掉。',
        '词数 80—120，卷面清楚，不必写标题。',
      ],
      samples: [
        {
          level: '中档（13—15 分）',
          text:
            "Dear Peter,\nI am very happy to hear that you will come to Guangzhou next month. I want to recommend a Cantonese opera lesson to you.\nThe lesson is at a culture centre in Liwan District. It starts at two o'clock on Saturday afternoon. In the class, a teacher will teach us how to sing and how to move our hands. I think it is very interesting. I went there last year and I liked it very much.\nI will meet you at the gate at half past one. Then we can go in together.\nYours,\nLi Hua",
          cn:
            '亲爱的 Peter：\n听说你下个月要来广州，我非常高兴。我想向你推荐一节粤剧课。\n这节课在荔湾区的一个文化中心上，星期六下午两点开始。课上老师会教我们怎么唱、怎么做手势。我觉得很有意思。我去年去过，非常喜欢。\n我一点半在门口等你，然后我们一起进去。\n你的朋友，李华',
          comment:
            '要点齐全、时态正确，属于中档（13—15 分）。问题在语言：全篇 9 句里有 4 句是「主语 + 简单谓语」的平铺结构，very 出现两次，连接词只有 Then，没有一处升级句型。想再上一档，把 I think it is very interesting 换成 What interests me most is the singing，把 Then we can go in together 换成 Since we arrive early, we can look around the hall first，语言分立刻能抬起来。',
          highlights: [
            {
              sentence: 'I am very happy to hear that you will come to Guangzhou next month.',
              why: '回信第一句的标准结构：I am happy to hear that + 从句，时态用一般将来时写对方的行程，可以直接套用。',
            },
            {
              sentence: 'I will meet you at the gate at half past one.',
              why: '把「约定见面」写成了具体时间与地点，第三个要点落到实处；但只写 at the gate 略显笼统，加上地点名称会更好。',
            },
          ],
        },
        {
          level: '高档（19—20 分）',
          text:
            "Dear Peter,\nGlad to hear you are coming to Guangzhou next month! If you want something truly local, I would recommend a Cantonese opera class in Liwan District.\nThe class runs from two to four on Saturday afternoon. First, a teacher will show you how to sing a short piece in Cantonese. Besides, you will learn the hand movements which are used to tell a story on stage. What is more, you can try on a real costume.\nSince the class is popular, I have booked a seat for you. Shall we meet at the centre gate at half past one? After that, we can have dim sum in a teahouse nearby.\nLooking forward to seeing you soon.\nYours,\nLi Hua",
          cn:
            '亲爱的 Peter：\n听说你下个月要来广州，真高兴！如果你想体验点真正本地的东西，我会推荐荔湾区的粤剧课。\n课程安排在星期六下午两点到四点。首先，老师会教你用粤语唱一小段。此外，你还会学那些在台上讲故事用的手势。更有意思的是，你还能试穿真正的戏服。\n因为这门课很受欢迎，我已经替你订好了一个位置。我们一点半在中心门口见好吗？之后我们可以去附近的茶楼喝早茶。\n期待很快见到你。\n你的朋友，李华',
          comment:
            '三个要点全部落实且都带细节，结构清晰（推荐—内容—约定），语言上用了 If 条件句、which 引导的定语从句、Since 引导的原因状语从句与 I have booked 的现在完成时；连接词 First、Besides、What is more、After that 齐备，词数约 120，属于高档（19—20 分）。唯一要小心的是别为凑句型写长句：本段每个长句都只讲一件事，读起来不绕。',
          highlights: [
            {
              sentence: 'If you want something truly local, I would recommend a Cantonese opera class in Liwan District.',
              why: '条件句 + I would recommend 的语气比 I recommend 更委婉，符合写信给朋友的分寸；truly local 一词把「最有广州味道」的意思一句说净。',
            },
            {
              sentence: 'Besides, you will learn the hand movements which are used to tell a story on stage.',
              why: '用定语从句把「手势」与「在台上讲故事」连起来，一句话既写了活动内容又解释了这个动作的意义，是加分句式。',
            },
            {
              sentence: 'Since the class is popular, I have booked a seat for you.',
              why: 'Since 引出原因、have booked 表示「已经订好」，比 I book a seat for you 更地道，也顺势带出「帮你安排好」的贴心感。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'I am writing to invite you to ...',
        'Glad to hear that you are coming to ...',
        'If you are interested in ..., I would recommend ...',
        'The activity will take place at ... from ... to ...',
        'It is a good chance for you to experience ...',
        'Not only can you ... but you can also ...',
        'Since it is very popular, I have booked ... for you.',
        'Shall we meet at ... at ...?',
        'After that, we can ... together.',
        'I am sure you will have a wonderful time.',
        'Looking forward to seeing you soon.',
        'Why not join us and have a try?',
      ],
    },
    mistakes: [
      {
        wrong: 'I very like Guangzhou.',
        right: 'I like Guangzhou very much.',
        why: 'very 不能直接修饰动词，只能修饰形容词或副词。「很喜欢」要说 like ... very much，或直接用 really like。这是中式英语里出现次数最多的一句。',
      },
      {
        wrong: 'I will very happy to see you.',
        right: 'I will be very happy to see you.',
        why: 'happy 是形容词，前面必须有系动词 be。中文「我会很开心」里没有动词，直译过来就会漏掉 be。',
      },
      {
        wrong: 'I with my friends went to the museum.',
        right: 'I went to the museum with my friends.',
        why: '中文把「和朋友一起」放在主语后面，英语的 with 短语要放到句末（或提到句首）。放在主语与谓语之间是不合英语语序的。',
      },
      {
        wrong: 'Although I was tired, but I finished my homework.',
        right: 'Although I was tired, I finished my homework.',
        why: '中文「虽然……但是……」可以同时出现，英语的 although 与 but 只能留一个。',
      },
      {
        wrong: 'I am interesting in Cantonese opera.',
        right: 'I am interested in Cantonese opera.',
        why: '-ing 形容词描述让人产生感受的事物，-ed 形容词描述人的感受。主语是 I，说的是自己的感受，所以用 interested。',
      },
      {
        wrong: 'There have many people in the park.',
        right: 'There are many people in the park.',
        why: '中文的「有」在英语里分成两类：have 表示「拥有」，there be 表示「存在」。说「公园里有很多人」要用 There are ...。',
      },
    ],
    questions: [
      {
        id: 'eng-topic-5-q1',
        type: 'choice',
        stem: '书面表达 20 分，最容易造成大额失分的原因是：',
        options: [
          '连接词用得多',
          '漏掉题目要求的要点',
          '用了定语从句',
          '词数刚好 100',
        ],
        answer: 'B',
        explanation:
          '漏一个要点通常扣 3—5 分，远超单个语法错误。题目里的编号要求就是评分点，审题时应逐条抄到草稿纸上，写完逐条打勾。',
        difficulty: 1,
        tags: ['书面表达', '审题'],
      },
      {
        id: 'eng-topic-5-q2',
        type: 'choice',
        stem: '下列句子没有中式英语的一项是：',
        options: [
          'I very like Cantonese opera.',
          'I will very happy to meet you.',
          'I am very interested in Cantonese opera.',
          'I with my parents went there.',
        ],
        answer: 'C',
        explanation:
          'C 用的是 be interested in 这一固定搭配，正确。A 的 very 不能修饰动词，B 漏了 be，D 的 with 短语放错位置。',
        difficulty: 2,
        tags: ['中式英语', '书面表达'],
      },
      {
        id: 'eng-topic-5-q3',
        type: 'choice',
        stem: '写「下个月要参加的活动安排」，全文主要时态应选：',
        options: ['一般过去时', '一般将来时', '过去进行时', '过去完成时'],
        answer: 'B',
        explanation:
          'next month 与「安排」都指向将来，主句用一般将来时。若中间要写「已经订好了座位」，那部分用现在完成时，这也是常用的时态搭配。',
        difficulty: 1,
        tags: ['时态', '书面表达'],
      },
      {
        id: 'eng-topic-5-q4',
        type: 'fill',
        stem: '下面这个句子有一处多余，请写出应该删掉的词（只填一个词）：Although he was ill, but he went to school.',
        answer: 'but|But',
        explanation:
          'although 已经表示让步，主句不能再出现 but。中文可以说「虽然……但是……」，英语只能留一个。',
        difficulty: 2,
        tags: ['连词', '中式英语'],
      },
      {
        id: 'eng-topic-5-q5',
        type: 'choice',
        stem: '三段式书面表达，中间一段最应该写：',
        options: [
          '把题目的要求再抄一遍',
          '逐条落实要点，并为每条补一点细节',
          '只表达感谢',
          '写自己的心情，越详细越好',
        ],
        answer: 'B',
        explanation:
          '中间段是得分主体：要点逐条落实，每条补一句细节（时间、地点、原因、感受），内容分就稳了。首段负责接情境，末段负责收尾。',
        difficulty: 2,
        tags: ['书面表达', '结构'],
      },
      {
        id: 'eng-topic-5-q6',
        type: 'short',
        stem: '把下面这句平淡的句子改写成含 not only ... but also 的升级句：I like Guangzhou very much.',
        answer:
          '参考：I not only like Guangzhou but also want to live here one day. 也可以把 not only 提到句首用倒装：Not only do I like Guangzhou, but I also want to live here one day.',
        explanation:
          '这一题练「句型升级」：同一意思换成并列递进结构，语言分就上去了。注意 not only 与 but also 后面接的成分要对称（都是动词短语或都是名词）。',
        difficulty: 3,
        tags: ['句型升级', '书面表达'],
        rubric: [
          '使用了 not only ... but also 结构',
          'not only 与 but also 后面的成分对称',
          '句意与原因一致，没有改变原意',
          '时态与人称正确（若用倒装，do/does 使用正确）',
        ],
      },
    ],
    examTips: [
      '书面表达 18 分钟分成三段用：5 分钟审题列要点，10 分钟写，3 分钟回读检查，一分钟都不要省在审题上。',
      '审题时把要点抄在草稿纸上并编号，写完逐条打勾；这一步能把「漏要点」这一类失分彻底堵死。',
      '准备 6 个万能升级句型（If 条件句、定语从句、not only ... but also、so ... that、It is + adj. + to do、Since 原因状语从句），考前默写熟练，考场上直接套。',
      '连接词不要重复用同一个：First、Besides、What is more、After that、As a result 轮着用，全篇 3—4 个就够，堆多了反而显得碎。',
      '写完的 3 分钟只查四样：要点是否齐、时态是否一致、有没有漏 be、名词单复数与拼写。',
      '宁可写短句也不要写长错句：一个语法错误扣的分，比少一个从句多得多。',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 6. 高频话题与必备表达                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-6',
    grade: 'all',
    unit: '话题串讲',
    title: '中考高频话题与必备表达（校园生活/环保/健康/科技/传统文化/安全）',
    enTitle: 'Six Hot Topics and Ready-to-use Expressions',
    summary:
      '中考书面表达与项目情境题翻来覆去就考六个话题。每个话题背熟六句能直接用的句型，考场上看清题目属于哪一类，换主语、换细节，就能在十分钟内搭出一篇像样的文章。',
    points: [
      {
        level: '重点',
        text: '校园生活是出现频率最高的话题：社团、研学、运动会、志愿服务、校园活动。',
        explain:
          '常见设问是「介绍你参加的一项活动」或「给学校提一条建议」。快速应对：用 take an active part in 描述参与，用 not only ... but also 说明收获，用 What impresses me most is ... 点出印象最深的细节。',
      },
      {
        level: '重点',
        text: '环保话题常与「我做了什么」结合，考建议与倡议。',
        explain:
          '必备三句：It is our duty to protect the environment.（点题）We can save water by turning off the tap in time.（做法）If everyone plays a part, our city will become cleaner and greener.（展望）。这三句能撑起一段完整的倡议书。',
      },
      {
        level: '重点',
        text: '传统文化是广州卷的地方特色话题：粤剧、广彩、醒狮、早茶、龙舟、书法。',
        explain:
          '考法常是「向外国朋友介绍并邀请」。句式用 It is said that ... 说历史，用 which 引导的定语从句解释特点，用 I am proud of ... and I want to pass it on 表达态度。地方文化词不必追求生僻，写对更重要。',
      },
      {
        level: '次重点',
        text: '健康话题考「好习惯 + 建议」，句式偏说明与劝告。',
        explain:
          '常用结构：A healthy diet means eating more vegetables and less junk food.（定义式说明）Getting enough sleep is as important as taking exercise.（比较）When we feel stressed, talking to our friends helps a lot.（情境建议）。',
      },
      {
        level: '次重点',
        text: '科技话题近年上升较快，多写成「好处 + 问题 + 我的建议」。',
        explain:
          '好处用 With the help of the Internet, we can ...；问题用 but they also take up too much of our time；建议用 It is important to use electronic products in a proper way。三段各一句，结构就完整了。',
      },
      {
        level: '次重点',
        text: '安全话题多以「安全提示、注意事项」的形式出现，句子短、动词用祈使句。',
        explain:
          '常用祈使句：Remember to switch off the gas before you leave the kitchen. Never cross the road when the light is red. 写安全类文章时，祈使句比长句更贴切，也更容易写对。',
      },
      {
        level: '了解',
        text: '话题词要成块背：一个话题 5—6 句，考试时只需换主语与细节。',
        explain:
          '背单词是低效的（一个词用不上就废了），背「整句」是高效的：句子自带搭配、时态与句型，考场上改几个词就能用。这也是本条把表达写成完整句而不是词表的原因。',
      },
    ],
    collocations: [
      {
        phrase: 'Our school offers a wide range of after-class activities, such as ...',
        cn: '校园生活：我们学校开设了各种各样的课外活动，比如……',
        note: 'such as 后面接名词或动名词，不接完整句子。',
      },
      {
        phrase: 'I take an active part in ... because it helps me ...',
        cn: '校园生活：我积极参加……，因为它帮我……',
        note: 'take an active part in 是「积极参加」的标准搭配，冠词 an 不能漏。',
      },
      {
        phrase: 'The activity not only broadens my horizons but also teaches me teamwork.',
        cn: '校园生活：这项活动不仅开阔了我的眼界，还教会我团队合作。',
        note: 'not only ... but also 连接两个并列的动词短语，前后形式要一致。',
      },
      {
        phrase: 'What impresses me most is the school sports meeting.',
        cn: '校园生活：最让我印象深刻的是校运会。',
        note: 'What 引导的主语从句作主语时，谓语用单数 is。',
      },
      {
        phrase: 'Thanks to my teacher\u2019s encouragement, I have made great progress in English.',
        cn: '校园生活：多亏老师的鼓励，我在英语上取得了很大进步。',
        note: 'thanks to 是「多亏、由于」，与 thank you 无关；make progress 是不可数，不能加 s。',
      },
      {
        phrase: 'I have learned to manage my time better since I joined the club.',
        cn: '校园生活：自从加入社团，我学会了更好地安排时间。',
        note: 'since 引导的从句用一般过去时，主句用现在完成时。',
      },
      {
        phrase: 'It is our duty to protect the environment.',
        cn: '环保：保护环境是我们的责任。',
        note: 'It 是形式主语，真正的主语是后面的 to do 短语；不能写成 Protect the environment is our duty。',
      },
      {
        phrase: 'We can save water by turning off the tap in time.',
        cn: '环保：我们可以通过及时关水龙头来节约用水。',
        note: 'by 表示方式，后面必须用动名词。',
      },
      {
        phrase: 'Instead of using plastic bags, we should carry our own cloth bags.',
        cn: '环保：我们应该自带布袋，而不是使用塑料袋。',
        note: 'instead of 后面接名词或动名词，不接句子。',
      },
      {
        phrase: 'Sorting rubbish is a small step that makes a big difference.',
        cn: '环保：垃圾分类是一小步，却能带来很大的不同。',
        note: '动名词作主语用单数谓语；rubbish 在英式英语里是不可数名词。',
      },
      {
        phrase: 'If everyone plays a part, our city will become cleaner and greener.',
        cn: '环保：如果每个人都出一份力，我们的城市会变得更干净、更绿。',
        note: 'if 条件状语从句用「主将从现」：从句用一般现在时 plays。',
      },
      {
        phrase: 'The river used to be dirty, but now it is much clearer than before.',
        cn: '环保：这条河过去很脏，但现在比以前清澈多了。',
        note: 'used to do 表示「过去常常」，注意与 be used to doing（习惯于）区分。',
      },
      {
        phrase: 'A healthy diet means eating more vegetables and less junk food.',
        cn: '健康：健康的饮食意味着多吃蔬菜、少吃垃圾食品。',
        note: 'mean doing 表示「意味着」，mean to do 表示「打算做」，两者不可混用。',
      },
      {
        phrase: 'I spend at least an hour a day on sports, which keeps me energetic.',
        cn: '健康：我每天至少花一小时运动，这让我精力充沛。',
        note: 'spend time on sth / (in) doing sth；which 引导非限制性定语从句，指代前面整件事。',
      },
      {
        phrase: 'Getting enough sleep is as important as taking exercise.',
        cn: '健康：睡够觉和做运动一样重要。',
        note: 'as ... as 中间用形容词或副词原级，不能用比较级。',
      },
      {
        phrase: 'When we feel stressed, talking to our friends helps a lot.',
        cn: '健康：当我们感到有压力时，和朋友聊一聊很有帮助。',
        note: '动名词短语 talking to our friends 作主语，谓语用 helps。',
      },
      {
        phrase: 'Doctors suggest having a check-up once a year.',
        cn: '健康：医生建议每年做一次体检。',
        note: 'suggest 后接动名词或 that 从句，不接 to do。',
      },
      {
        phrase: 'Remember to warm up before you start running.',
        cn: '健康：开始跑步前记得热身。',
        note: 'remember to do 表示「记得去做」，remember doing 表示「记得做过」。',
      },
      {
        phrase: 'With the help of the Internet, we can learn almost anything at home.',
        cn: '科技：有了互联网的帮助，我们几乎可以在家学到任何东西。',
        note: 'with the help of 是「在……的帮助下」，也可换成 with one\u2019s help。',
      },
      {
        phrase: 'Smartphones make our life more convenient, but they also take up too much of our time.',
        cn: '科技：智能手机让我们的生活更方便，但也占用了我们太多时间。',
        note: '用 make + 宾语 + 形容词；take up 表示「占用（时间、空间）」。',
      },
      {
        phrase: 'It is important to use electronic products in a proper way.',
        cn: '科技：以适当的方式使用电子产品很重要。',
        note: 'It is + adj. + to do 是最高频的升级句型之一，写作中用一次就能提语言分。',
      },
      {
        phrase: 'We should not spend too much time playing games on the phone.',
        cn: '科技：我们不应该花太多时间在手机上玩游戏。',
        note: 'spend time doing sth；too much 修饰不可数名词，too many 修饰可数名词复数。',
      },
      {
        phrase: 'I often use an app to look up new words when I read.',
        cn: '科技：我读书时常用一款手机应用查生词。',
        note: 'use sth to do sth 表示用途；look up 是「查阅」，代词作宾语时要放在中间，如 look it up。',
      },
      {
        phrase: 'Although the Internet brings us convenience, we should use it wisely.',
        cn: '科技：虽然互联网给我们带来便利，我们也应该明智地使用它。',
        note: 'although 引导让步状语从句，主句不再用 but。',
      },
      {
        phrase: 'Cantonese opera is one of the most traditional art forms in Guangdong.',
        cn: '传统文化：粤剧是广东最传统的艺术形式之一。',
        note: 'one of the + 最高级 + 复数名词，后面的名词必须用复数。',
      },
      {
        phrase: 'It is said that Cantonese opera has a history of more than three hundred years.',
        cn: '传统文化：据说粤剧有三百多年的历史。',
        note: 'It is said that ... 是介绍历史的万能句式，也可以写成 Cantonese opera is said to have a long history。',
      },
      {
        phrase: 'The lion dance is performed at festivals to bring good luck.',
        cn: '传统文化：每逢节日人们都会舞狮，以带来好运。',
        note: '不定式 to bring good luck 表示目的；被动语态 be performed 说明「被人们表演」。',
      },
      {
        phrase: 'Learning calligraphy helps me understand the beauty of Chinese characters.',
        cn: '传统文化：学书法帮助我理解汉字之美。',
        note: '动名词作主语；help sb do sth 中 do 前不加 to。',
      },
      {
        phrase: 'I am proud of our traditional culture and I want to pass it on.',
        cn: '传统文化：我为我们的传统文化感到自豪，我想把它传承下去。',
        note: 'pass sth on 是「传承、传递」，代词 it 要放在 pass 与 on 之间。',
      },
      {
        phrase: 'More and more young people are becoming interested in traditional Chinese culture.',
        cn: '传统文化：越来越多的年轻人开始对中国传统文化感兴趣。',
        note: 'more and more 修饰可数名词复数；becoming interested in 用进行时表示「正在变得」。',
      },
      {
        phrase: 'Safety comes first, whether we are at school or on the road.',
        cn: '安全：无论在学校还是在路上，安全都是第一位的。',
        note: 'whether ... or ... 引导让步状语从句，前后结构对称。',
      },
      {
        phrase: 'We must obey the traffic rules and never cross the road when the light is red.',
        cn: '安全：我们必须遵守交通规则，绝不在红灯时过马路。',
        note: 'obey the rules 是固定搭配；never 放在实义动词前。',
      },
      {
        phrase: 'If you are in danger, call 110 at once and stay calm.',
        cn: '安全：如果你遇到危险，立刻拨打 110 并保持冷静。',
        note: '祈使句是安全类文章的常用句式，短而有力，也不容易写错。',
      },
      {
        phrase: 'Remember to switch off the gas before you leave the kitchen.',
        cn: '安全：离开厨房前记得关掉煤气。',
        note: 'switch off 用于电器与燃气，不用 open；before 引导时间状语从句时用一般现在时表将来。',
      },
      {
        phrase: 'It is dangerous to swim in the river alone.',
        cn: '安全：独自在河里游泳很危险。',
        note: 'It is + adj. + to do 结构；alone 是「独自」，lonely 是「孤独的」，不要混用。',
      },
      {
        phrase: 'When a fire breaks out, cover your mouth with a wet towel and leave quickly.',
        cn: '安全：发生火灾时，用湿毛巾捂住口鼻，迅速离开。',
        note: 'break out 表示战争、火灾等「爆发」，不能用被动语态。',
      },
    ],
    questions: [
      {
        id: 'eng-topic-6-q1',
        type: 'choice',
        stem: 'not only ... but also 连接两个主语时，谓语动词与谁保持一致？',
        options: ['与靠近谓语的那个主语一致', '与前面的那个主语一致', '一律用复数', '一律用单数'],
        answer: 'A',
        explanation:
          'not only A but also B 连接主语时采用就近一致：Not only the students but also the teacher was excited. 与 neither ... nor ...、either ... or ... 的规则相同。',
        difficulty: 3,
        tags: ['主谓一致', '句型'],
      },
      {
        id: 'eng-topic-6-q2',
        type: 'choice',
        stem: '「积极参加课外活动」的固定搭配是：',
        options: [
          'take active part in after-class activities',
          'take an active part in after-class activities',
          'join in an active part of after-class activities',
          'take part of after-class activities',
        ],
        answer: 'B',
        explanation:
          'take an active part in 是「积极参加」的标准搭配，active 前要有 an。take part in 是「参加」，join 后面直接接组织或人群。',
        difficulty: 2,
        tags: ['固定搭配', '校园生活'],
      },
      {
        id: 'eng-topic-6-q3',
        type: 'fill',
        stem: '根据中文提示填空（每空一词）：多亏老师的帮助，我进步很大。____ to my teacher\u2019s help, I have made great progress.',
        answer: 'Thanks|thanks',
        explanation:
          'thanks to 是固定短语，表示「多亏、由于」，句首首字母大写。注意它与 thank you 无关，也不能只写 Thank。',
        difficulty: 2,
        tags: ['固定搭配', '介词短语'],
      },
      {
        id: 'eng-topic-6-q4',
        type: 'choice',
        stem: '「垃圾分类」的地道表达是：',
        options: ['sort the rubbish', 'make the rubbish in order', 'put the rubbish class', 'rubbish sorting box'],
        answer: 'A',
        explanation:
          'sort 作动词意为「分类」，sort the rubbish 就是「把垃圾分好类」；也可说 sort the waste。B、C 是照中文逐字拼出来的，D 是名词短语，都不能作「分类」这个动作。',
        difficulty: 2,
        tags: ['环保', '表达'],
      },
      {
        id: 'eng-topic-6-q5',
        type: 'choice',
        stem: '「保护环境是我们的责任」最地道的英文是：',
        options: [
          'Protect the environment is our duty.',
          'It is our duty to protect the environment.',
          'It is our duty protect the environment.',
          'Our duty is protect the environment.',
        ],
        answer: 'B',
        explanation:
          '动词原形不能直接作主语，要用形式主语 It 代替，真正的主语放在后面：It is our duty to do sth。C、D 都漏了 to；A 是典型的中式英语。',
        difficulty: 2,
        tags: ['句型', '环保'],
      },
      {
        id: 'eng-topic-6-q6',
        type: 'short',
        stem: '用「环保」话题写三句关于节约用水的建议，至少使用两个不同的句型。',
        answer:
          '参考：First, we should turn off the tap in time after washing our hands. Besides, it is a good idea to reuse the water for cleaning the floor. If everyone saves a little water every day, we will save a lot in a year.',
        explanation:
          '这一题练「一个话题写一段」：三句分别用 should 提建议、it is a good idea to do 换句型、if 条件句作展望。三个句型不同、逻辑递进，就是一段完整的建议文。',
        difficulty: 3,
        tags: ['环保', '写作句型'],
        rubric: [
          '写出三句完整的英文句子，且都与节约用水相关',
          '至少使用两个不同的句型（如 should、it is a good idea to、if 从句）',
          '使用连接词使三句之间有逻辑关系',
          '语法与拼写基本正确，搭配地道',
        ],
      },
    ],
    examTips: [
      '考前每个话题背 5—6 句完整句，不要只背单词：句子自带搭配与句型，考场上换主语就能用。',
      '看题目先判断话题类别（校园、环保、健康、科技、传统文化、安全），再决定用哪一组句式，这一步只需 30 秒。',
      '同一个话题的句子要能互换：把 Our school 换成 Our class、把 Guangzhou 换成 my hometown，一篇新文章就出来了。',
      '传统文化类题目最容易写出生硬直译，凡是不确定的译法就换个简单说法，例如用 a traditional art form 代替拿不准的专有名词。',
      '安全类文章多用祈使句（Remember to ... / Never ...），短句既符合语体，也不容易出错。',
      '写完后至少留一句「展望或号召」收尾（If everyone plays a part, ...），这是段落完整的标志，也常常是评分点。',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 7. 易错点大盘点（含文化差异与中式英语）                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-topic-7',
    grade: 'all',
    unit: '易错盘点',
    title: '中考易错点大盘点（含中西文化差异与常见中式英语）',
    enTitle: 'Common Errors, Cultural Differences and Chinglish',
    summary:
      '分数上不去的最后一道坎，往往不是不会，而是「明明会却反复错」和「照中文直译」。这一条把中考最常见的十几处坑一次排清，并专门列出中西文化差异带来的说法差异。',
    points: [
      {
        level: '重点',
        text: '中式英语的核心是「照中文语序逐字翻译」。',
        explain:
          'I very like it、I will very happy、There have many people 这三句，都是把中文一个字一个字换过去的产物。快速自检：写完一句话，心里默念它的中文，如果这句话的中文和你的原意完全逐字对应，往往就有问题。',
      },
      {
        level: '重点',
        text: '动词搭配与形式错误：suggest to do、enjoy to do、be interested in doing。',
        explain:
          '近年在语法选择、写作填空与书面表达里都会考。判断方法：只记三类——接 to do 的（want、decide、hope、plan、agree）、接 doing 的（enjoy、finish、mind、keep、suggest、practise）、两者意思不同的（remember、forget、stop、try）。',
      },
      {
        level: '重点',
        text: '名词与冠词：advice、information、news 不可数；play the piano 要加 the；go to school 不加 the。',
        explain:
          '写作填空题常考「给词变形式」，把 advice 写成 advices 是最常见的失分。规则可以记成一句：抽象名词多不可数，乐器前加 the，日常场所（school、bed、hospital 表用途时）不加。',
      },
      {
        level: '次重点',
        text: '形容词、副词的位置与顺序常常是设错点：enough 后置、very 不修饰动词。',
        explain:
          'old enough to do、big enough for sb 是固定顺序；very 只能修饰形容词或副词。这两条一出错，句子读起来就有明显的「翻译腔」。',
      },
      {
        level: '次重点',
        text: '文化差异带来的失误：称呼、回应赞美、隐私话题、书信格式。',
        explain:
          '称呼用 Mr / Mrs / Miss / Ms + 姓，不能把 teacher 当称呼；面对赞美先说 Thank you；年龄、收入、婚姻属于隐私，正式场合不宜直接询问。这些不是语法问题，但在交际情境题里会直接影响得分。',
      },
      {
        level: '次重点',
        text: '标点与书写：英文的句号是「.」，逗号不能连接两个完整句子。',
        explain:
          '中文用「。」，英文用「.」；两个完整句子之间用句号、分号或 and/but 等连词，只用一个逗号就是「逗号粘连」，在写作里会被明确扣分。',
      },
      {
        level: '了解',
        text: '把错题本按三类归档：中式英语、语法形式、固定搭配。',
        explain:
          '按时间顺序抄题，复习时看不出规律；按这三类归档，你会发现自己一年里反复错的其实就那么七八条，考前十分钟就能看完。',
      },
      {
        level: '了解',
        text: '「不会的题猜一个」在选择题里永远是对的。',
        explain:
          '四选一没有倒扣分，空着等于保证零分。先排除最不可能的，再从剩下的里选一个你能读通的。',
      },
    ],
    mistakes: [
      {
        wrong: 'I very like it.',
        right: 'I like it very much.',
        why: 'very 不能直接修饰动词，只能修饰形容词或副词。「很喜欢」用 like ... very much，或直接用 really like。这是最典型的中式英语。',
      },
      {
        wrong: 'I will very happy to see you.',
        right: 'I will be very happy to see you.',
        why: 'happy 是形容词，前面必须有系动词 be。中文「我会很开心」里没有动词，直译就会漏掉 be。',
      },
      {
        wrong: 'There have many students in the playground.',
        right: 'There are many students in the playground.',
        why: '中文的「有」在英语里分两类：have 表示拥有，there be 表示存在。说「操场上有许多学生」要用 There are ...。',
      },
      {
        wrong: 'I with my friends went to the museum.',
        right: 'I went to the museum with my friends.',
        why: 'with 短语不能夹在主语与谓语之间，要放到句末或句首。这是中文「我和朋友一起……」最常带出来的语序错误。',
      },
      {
        wrong: 'Although he was tired, but he kept running.',
        right: 'Although he was tired, he kept running.',
        why: '中文「虽然……但是……」可以同时出现，英语里的 although 与 but 只能留一个；because 与 so 同理。',
      },
      {
        wrong: 'My English is poor, please give me some advices.',
        right: 'My English is poor. Could you give me some advice?',
        why: 'advice 是不可数名词，没有复数形式；另外两个完整句子之间要用句号或连词，只用一个逗号是逗号粘连。',
      },
      {
        wrong: 'He suggested to have a picnic this Sunday.',
        right: 'He suggested having a picnic this Sunday.',
        why: 'suggest 后面接动名词或 that 从句，不接不定式。同类动词还有 enjoy、finish、mind、practise、keep。',
      },
      {
        wrong: 'I am interesting in Chinese history.',
        right: 'I am interested in Chinese history.',
        why: '-ing 形容词描述让人产生这种感受的事物，-ed 形容词描述人的感受。主语是 I，说的是自己的感受，用 interested。',
      },
      {
        wrong: 'The price of the ticket is very expensive.',
        right: 'The ticket is very expensive. / The price of the ticket is very high.',
        why: '英语里 price 与 high、low 搭配，商品本身才用 expensive、cheap。中文「价格很贵」直译过来就错了。',
      },
      {
        wrong: 'He is enough old to go to school.',
        right: 'He is old enough to go to school.',
        why: 'enough 修饰形容词或副词时必须后置。中文的「足够大」是「足够」在前，照搬语序就会错。',
      },
      {
        wrong: 'Great changes have been taken place in my hometown.',
        right: 'Great changes have taken place in my hometown.',
        why: 'take place 是不及物动词短语，没有被动语态，也不能带宾语，所以不能写成 have been taken place。',
      },
      {
        wrong: 'Please open the light; it is too dark here.',
        right: 'Please turn on the light; it is too dark here.',
        why: '中文的「开」不能一律译成 open。门窗、书本用 open；电器、燃气用 turn on / switch on，关掉用 turn off / switch off。',
      },
      {
        wrong: 'Teacher Wang, could you help me with this word?',
        right: 'Mr Wang, could you help me with this word?',
        why: '文化差异：英语里 teacher 不是称呼语，不能像中文「王老师」那样直接加姓。称呼老师用 Mr / Mrs / Miss / Ms + 姓，或直接说 Sir / Madam。',
      },
      {
        wrong: 'No, no. My English is very poor.',
        right: 'Thank you. I am still learning.',
        why: '文化差异：面对赞美，英语的习惯是先道谢再谦虚；连说两个 no 会让对方以为你在否认他的判断，显得不礼貌。',
      },
      {
        wrong: 'I will go to your home and play with you this weekend.',
        right: 'I would like to visit your home and spend some time with you this weekend.',
        why: 'play with you 在英语里多用于对小孩说话，用在同龄朋友身上很不自然；「去你家玩」可以说 visit your home / come over to your place。',
      },
    ],
    questions: [
      {
        id: 'eng-topic-7-q1',
        type: 'choice',
        stem: '下列句子正确的是：',
        options: [
          'I very like this song.',
          'I like this song very much.',
          'I like very much this song.',
          'I am very like this song.',
        ],
        answer: 'B',
        explanation:
          'very much 修饰动词时要放在句末（或宾语之后）；very 不能直接修饰动词，所以 A 错；C 语序不对；D 多了 be，是漏 be 与多 be 的反面错误。',
        difficulty: 1,
        tags: ['中式英语', '副词位置'],
      },
      {
        id: 'eng-topic-7-q2',
        type: 'choice',
        stem: '「图书馆里有很多书」的正确说法是：',
        options: [
          'There have a lot of books in the library.',
          'There are a lot of books in the library.',
          'There has a lot of books in the library.',
          'It has a lot of books in the library.',
        ],
        answer: 'B',
        explanation:
          'there be 表示「存在」，不能与 have 混用；主语 books 是复数，be 用 are。D 的 it has 表示「它拥有」，意思不对。',
        difficulty: 1,
        tags: ['中式英语', 'there be'],
      },
      {
        id: 'eng-topic-7-q3',
        type: 'choice',
        stem: 'The price of the house is ____, so few people can afford it.',
        options: ['very expensive', 'very cheap', 'very high', 'very dear'],
        answer: 'C',
        explanation:
          'price 与 high、low 搭配，房子本身才用 expensive、cheap。中文「价格很贵」直译成 The price is expensive 是典型的中式英语，也因此是高频干扰项。',
        difficulty: 2,
        tags: ['搭配', '中式英语'],
      },
      {
        id: 'eng-topic-7-q4',
        type: 'fill',
        stem: '根据中文提示填空（每空一词）：他已经够大了，可以照顾自己。He is old ____ to look after himself.',
        answer: 'enough|Enough',
        explanation:
          'enough 修饰形容词时必须放在形容词后面，构成 adj. + enough + to do。写成 enough old 是中文「足够大」的语序照搬。',
        difficulty: 2,
        tags: ['形容词', '词序'],
      },
      {
        id: 'eng-topic-7-q5',
        type: 'choice',
        stem: '在英语里当面称呼一位姓王的男老师，正确的是：',
        options: ['Teacher Wang', 'Mr Wang', 'Wang Teacher', 'Teacher Mr Wang'],
        answer: 'B',
        explanation:
          '文化差异：teacher 是职业名词，不是称呼语。称呼用 Mr / Mrs / Miss / Ms + 姓；不知姓名时用 Sir 或 Madam。',
        difficulty: 1,
        tags: ['文化差异', '称呼'],
      },
      {
        id: 'eng-topic-7-q6',
        type: 'choice',
        stem: '老师表扬你的英语进步很大，比较得体的回答是：',
        options: [
          'No, no, my English is very poor.',
          'Thank you. I am still learning.',
          'You are wrong. I am not good at it.',
          'I do not think so.',
        ],
        answer: 'B',
        explanation:
          '面对赞美，英语的习惯是先道谢，再表达继续努力的态度。连着说 no 或直接否认对方的判断，在英语文化里显得不礼貌。',
        difficulty: 2,
        tags: ['文化差异', '交际'],
      },
      {
        id: 'eng-topic-7-q7',
        type: 'fill',
        stem: '用括号中动词的适当形式填空：He suggested ____ (go) home before the rain came.',
        answer: 'going|Going',
        explanation:
          'suggest 后面接动名词，不接不定式，所以填 going。同类动词还有 enjoy、finish、mind、practise、keep。',
        difficulty: 2,
        tags: ['非谓语', '固定搭配'],
      },
      {
        id: 'eng-topic-7-q8',
        type: 'short',
        stem: '下面这句话有一处错误，请改正并说明理由：Although I was tired, but I finished my homework.',
        answer:
          '改正：Although I was tired, I finished my homework. 理由：although 已经表示让步关系，主句不能再出现并列连词 but。中文的「虽然……但是……」可以同时出现，英语里两者只能留一个；如果保留 but，就要去掉 although，写成 I was tired, but I finished my homework.',
        explanation:
          '这一题考的是「中文可以、英语不可以」的典型差异。改法有两种，任选其一，关键是不能同时保留 although 与 but。',
        difficulty: 2,
        tags: ['连词', '中式英语'],
        rubric: [
          '正确删去 but（或正确改写为只保留 but 的版本）',
          '说明 although 与 but 不能同时使用',
          '修改后句子结构完整、标点正确',
        ],
      },
    ],
    examTips: [
      '考前只复习一份「中式英语清单」：very like、will very happy、There have、I with my friend、although ... but ... 这五条最好一天看一遍。',
      '写完作文后逐句自问「这句中文我是怎么想的」，凡是照中文语序写下来的句子都要重写成英语语序。',
      '语法选择遇到四个选项里混着 be 与动词原形时，先判断句子缺不缺谓语——这是漏 be 与多 be 的分水岭，也是高频设错点。',
      '不确定的搭配宁可用你见过的简单表达，也不要照中文造一个新短语：阅卷时正确的简单句比错误的高级句得分高。',
      '把交际情境题里的文化习惯单独记一页：称呼用 Mr / Mrs / Miss / Ms + 姓，被赞美先说 Thank you，不主动问年龄与收入。',
      '错题本按「中式英语 / 语法形式 / 固定搭配」三栏分，考前只看第一栏，因为它是重复率最高的。',
    ],
  },
];
