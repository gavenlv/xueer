/**
 * 整卷模拟考试（`eng-exam` 模块）：三套按广州中考结构命制的**原创仿真模拟卷**。
 *
 * ## 卷面结构（`sections` 是验卷依据，不是装饰）
 *
 * 照 **2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案**（穗教规字〔2025〕1 号
 * 附件 2）的英语科目结构命题，见 `CONTENT-SPEC.md` 第一节：
 *   语言（知识）运用 第一节 选择题 10 小题 15 分（完形填空，每小题 1.5 分）
 *   语言（知识）运用 第二节 选择题 10 小题 10 分（语法选择，每小题 1 分）
 *   阅读 第一节 选择题 15 小题 30 分（三篇短文各 5 题，每小题 2 分）
 *   阅读 第二节 选择题 5 小题 5 分（公告与安排表等多模态短文，每小题 1 分）
 *   项目情境（读写综合）第一节 选择题 5 小题 10 分（每小题 2 分）
 *   项目情境（读写综合）第二节 简答题 5 小题 10 分（每小题 2 分，带踩分点）
 *   写作 第一节 填空题 5 小题 5 分（单词拼写）
 *   写作 第二节 填空题 5 小题 5 分（完成句子）
 *   写作 第三节 书面表达 1 小题 20 分
 *   笔试合计 61 小题 110 分，100 分钟；听说 14 小题 30 分另场。
 *
 * 每套卷的 `questions` 是 60 道可作答、可判分的题（45 choice + 5 short + 10 fill），
 * 第 61 小题「书面表达」是主观写作题，由 `writing` 字段单独承载，不重复放进 `questions`
 * （否则同一题目会在练习引擎里出现两次）。sections 的 61 小题 110 分与二者相加一致。
 *
 * ## 语篇怎么放（受类型限制的取舍）
 *
 * `EnglishPaper` 类型没有 `passages` 字段（见 `src/types.ts`），所以每篇英文语篇
 * （完形填空短文、三篇阅读短文、多模态公告、项目情境材料）**整篇写在该组第一题的 `stem`
 * 里**，同组后续小题以「据上文」引用同一语篇，语篇只出现一次、不重复堆叠。
 * 语法选择第二节与写作第一、二节是句子层面的题，每题自带完整句子，不依赖上下文。
 *
 * ## 命题取向
 *
 * 1. **全是原创题**：三套卷的语篇、题目与选项均为自编，`title` 只称「模拟卷」，
 *    `basis` 写明「原创仿真卷，非历年真题」，不标注任何年份题号，避免学生误当真题刷。
 * 2. **话题按近年常见范围分布**：卷（一）校园与日常生活；卷（二）科技、环保与健康；
 *    卷（三）传统文化与中外交流。三套卷之间题目不重复。
 * 3. **答案字母有分布**：每套 45 道选择题的正确答案 A/B/C/D 各 11—12 道，
 *    选项顺序已按分布排定（`pnpm validate` 的「选择题答案分布」一项在盯这件事）。
 * 4. **听说材料适合朗读**：本应用不提供音频，听说脚本由浏览器语音朗读代替听力音频，
 *    因此脚本口语化、句子长度适中，模仿朗读另给重音、连读、语调提示。
 */

import type { EnglishPaper } from '../../../types';

/** 三套卷共用的 section 结构模板（照官方卷面逐项对齐，改数据不改代码） */
const SECTIONS: EnglishPaper['sections'] = [
  { name: '语言（知识）运用 第一节 选择题', kind: 'choice', count: 10, score: 15 },
  { name: '语言（知识）运用 第二节 选择题', kind: 'choice', count: 10, score: 10 },
  { name: '阅读 第一节 选择题', kind: 'choice', count: 15, score: 30 },
  { name: '阅读 第二节 选择题', kind: 'choice', count: 5, score: 5 },
  { name: '项目情境（读写综合）第一节 选择题', kind: 'choice', count: 5, score: 10 },
  { name: '项目情境（读写综合）第二节 简答题', kind: 'short', count: 5, score: 10 },
  { name: '写作 第一节 填空题', kind: 'blank', count: 5, score: 5 },
  { name: '写作 第二节 填空题', kind: 'blank', count: 5, score: 5 },
  { name: '写作 第三节 书面表达', kind: 'writing', count: 1, score: 20 },
];

/** 卷面依据说明：三套卷同一句，只改话题，避免各卷口径不一 */
const basisOf = (topics: string): string =>
  `按 2027—2029 年广州市中考英语结构命题：笔试 61 小题 110 分（语言知识运用 25 + 阅读 35 + 项目情境 20 + 写作 30），100 分钟；另有听说 14 小题 30 分另场。话题范围：${topics}。本卷为原创仿真卷，非历年真题。`;

export const papers: EnglishPaper[] = [
  /* ================================================================== */
  /* 模拟卷（一）校园与日常生活                                          */
  /* ================================================================== */
  {
    id: 'eng-paper-01',
    grade: 'all',
    title: '广州中考英语模拟卷（一）· 校园与日常生活',
    basis: basisOf('校园生活、师生同学、日常作息、家庭生活、身边小事'),
    duration: 100,
    totalScore: 110,
    speakingScore: 30,
    sections: SECTIONS,

    questions: [
      /* ---------------- 语言知识运用 第一节：完形填空（10 小题 15 分） ---------------- */
      {
        id: 'eng-paper-01-q1',
        type: 'choice',
        stem:
          '阅读下面短文，掌握其大意，然后从各题所给的 A、B、C、D 四个选项中选出能填入相应空白处的最佳选项。\n\n' +
          "Kevin's New Start\n\n" +
          'When Kevin moved to Guangzhou with his family last September, he felt worried about his new school. Everything seemed (1) ____ to him: the classrooms, the teachers, and even the food in the school canteen. On his first morning, he could not find the science lab, so he arrived ten minutes (2) ____ for his first class.\n\n' +
          "Things changed on Wednesday. A boy called Ming sat down beside him at lunch and asked whether he would like to join the school's (3) ____ club. Kevin had loved taking photos since he was eight, so he said yes at once. In the club, older students showed him how to take pictures of birds in the school garden. They also taught him to be (4) ____, because a good photo often means half an hour of waiting without moving.\n\n" +
          "Two months later, Kevin's picture of a white heron won the second (5) ____ in a city competition. (6) ____ joining the club, he has made more friends than he did in his old school. 'A new school is not the (7) ____ of your old life,' he says. 'It is a chance to start something new.'\n\n" +
          "(8) ____ students feel nervous about a new place at first. Kevin's advice is simple: (9) ____ one small thing you enjoy, and do it with others. You may be surprised at how quickly that small thing (10) ____ a big part of your new life.\n\n" +
          '第 (1) 空的最佳选项是：',
        options: ['strange', 'heavy', 'quiet', 'cheap'],
        answer: 'A',
        explanation:
          '下文说教室、老师、食堂的饭菜都让他觉得不习惯，说明「一切对他都很陌生」，用 strange（陌生的）。heavy（重的）、quiet（安静的）、cheap（便宜的）都与语境无关。',
        difficulty: 1,
        tags: ['完形填空', '形容词辨析', '校园生活'],
      },
      {
        id: 'eng-paper-01-q2',
        type: 'choice',
        stem:
          '据上文完形填空短文——On his first morning, he could not find the science lab, so he arrived ten minutes (2) ____ for his first class. 第 (2) 空的最佳选项是：',
        options: ['early', 'late', 'away', 'again'],
        answer: 'B',
        explanation:
          '因为找不到实验室，结果「上课迟到了十分钟」，用 late。early 与「找不到教室」的结果矛盾；away 表示「离开」，again 表示「再一次」，都不能表示迟到。',
        difficulty: 1,
        tags: ['完形填空', '副词辨析'],
      },
      {
        id: 'eng-paper-01-q3',
        type: 'choice',
        stem:
          "据上文完形填空短文——A boy called Ming sat down beside him at lunch and asked whether he would like to join the school's (3) ____ club. 第 (3) 空的最佳选项是：",
        options: ['music', 'chess', 'photography', 'cooking'],
        answer: 'C',
        explanation:
          '后文说他从小就喜欢拍照片、在俱乐部学拍校园里的鸟，可见这是摄影俱乐部，故选 photography。其余三项与拍照片无关。',
        difficulty: 1,
        tags: ['完形填空', '名词辨析'],
      },
      {
        id: 'eng-paper-01-q4',
        type: 'choice',
        stem:
          '据上文完形填空短文——They also taught him to be (4) ____, because a good photo often means half an hour of waiting without moving. 第 (4) 空的最佳选项是：',
        options: ['busy', 'proud', 'brave', 'patient'],
        answer: 'D',
        explanation:
          '「等上半小时不能动」需要的是耐心，故用 patient。busy（忙的）、proud（自豪的）、brave（勇敢的）都不能说明「等待」这一点。',
        difficulty: 1,
        tags: ['完形填空', '形容词辨析', '上下文线索'],
      },
      {
        id: 'eng-paper-01-q5',
        type: 'choice',
        stem:
          "据上文完形填空短文——Two months later, Kevin's picture of a white heron won the second (5) ____ in a city competition. 第 (5) 空的最佳选项是：",
        options: ['prize', 'chance', 'lesson', 'reason'],
        answer: 'A',
        explanation:
          '在比赛中获奖说 win the second prize（获得二等奖）。chance 是「机会」，lesson 是「课」，reason 是「原因」，都不能与 win 搭配。',
        difficulty: 1,
        tags: ['完形填空', '名词辨析', '固定搭配'],
      },
      {
        id: 'eng-paper-01-q6',
        type: 'choice',
        stem:
          '据上文完形填空短文——(6) ____ joining the club, he has made more friends than he did in his old school. 第 (6) 空的最佳选项是：',
        options: ['Until', 'Since', 'Without', 'Except'],
        answer: 'B',
        explanation:
          '主句用现在完成时 has made，表示「自从加入俱乐部以来」，用 Since + 动名词。Until 与现在完成时连用时要接否定的延续动作；Without、Except 与句意不符。',
        difficulty: 2,
        tags: ['完形填空', '连词', '现在完成时'],
      },
      {
        id: 'eng-paper-01-q7',
        type: 'choice',
        stem:
          "据上文完形填空短文——'A new school is not the (7) ____ of your old life,' he says. 第 (7) 空的最佳选项是：",
        options: ['rule', 'sign', 'end', 'part'],
        answer: 'C',
        explanation:
          '下一句说 It is a chance to start something new（这是重新开始的机会），与之呼应的应是「新学校不是旧生活的结束」，故选 end。',
        difficulty: 2,
        tags: ['完形填空', '名词辨析', '句间呼应'],
      },
      {
        id: 'eng-paper-01-q8',
        type: 'choice',
        stem:
          '据上文完形填空短文——(8) ____ students feel nervous about a new place at first. 第 (8) 空的最佳选项是：',
        options: ['No', 'Few', 'Every', 'Many'],
        answer: 'D',
        explanation:
          '本句是总起句，与首段 Kevin 的经历相印证，表示「许多学生」都会紧张，用 Many。Every 后接单数名词；No、Few 与下文随即给建议的语气矛盾。',
        difficulty: 2,
        tags: ['完形填空', '限定词', '语篇逻辑'],
      },
      {
        id: 'eng-paper-01-q9',
        type: 'choice',
        stem:
          "据上文完形填空短文——Kevin's advice is simple: (9) ____ one small thing you enjoy, and do it with others. 第 (9) 空的最佳选项是：",
        options: ['Choose', 'Borrow', 'Hide', 'Forget'],
        answer: 'A',
        explanation:
          '与后半句 and do it with others 呼应，先「选择」一件自己喜欢的小事去做，用 Choose。Borrow、Hide、Forget 都不能与 do it with others 构成连贯的做法。',
        difficulty: 1,
        tags: ['完形填空', '动词辨析'],
      },
      {
        id: 'eng-paper-01-q10',
        type: 'choice',
        stem:
          '据上文完形填空短文——You may be surprised at how quickly that small thing (10) ____ a big part of your new life. 第 (10) 空的最佳选项是：',
        options: ['takes', 'becomes', 'leaves', 'keeps'],
        answer: 'B',
        explanation:
          'become a big part of ... 意为「成为……的重要部分」，与 how quickly（多快）搭配自然。take、leave、keep 都不能接「a big part of」表示「成为」。',
        difficulty: 2,
        tags: ['完形填空', '动词辨析', '固定搭配'],
      },

      /* ---------------- 语言知识运用 第二节：语法选择（10 小题 10 分） ---------------- */
      {
        id: 'eng-paper-01-q11',
        type: 'choice',
        stem:
          '语法选择：从各题所给的 A、B、C、D 四个选项中选出最佳选项，使句子完整、通顺。\n\nLook! My sister (11) ____ her bike in the playground.',
        options: ['rides', 'rode', 'is riding', 'has ridden'],
        answer: 'C',
        explanation:
          'Look! 提示此刻正在发生的动作，用现在进行时 is riding。一般现在时表示习惯；rode 是过去时；现在完成时不能与 Look! 这种即时提示连用。',
        difficulty: 1,
        tags: ['语法选择', '现在进行时'],
      },
      {
        id: 'eng-paper-01-q12',
        type: 'choice',
        stem:
          "My father usually gets up at six, but yesterday morning he (12) ____ until seven.",
        options: ["doesn't get up", "hasn't got up", "wasn't getting up", "didn't get up"],
        answer: 'D',
        explanation:
          'yesterday morning 是过去时间状语，表示过去某天没有做某事，用一般过去时的否定式 didn\'t get up。现在完成时不能与 yesterday 连用。',
        difficulty: 1,
        tags: ['语法选择', '一般过去时', '否定式'],
      },
      {
        id: 'eng-paper-01-q13',
        type: 'choice',
        stem: 'I have (13) ____ interesting book about space. Would you like to read it?',
        options: ['an', 'a', 'the', '不填'],
        answer: 'A',
        explanation:
          'interesting 以元音音素开头，且这里是泛指「一本有趣的书」，用不定冠词 an。a 用于辅音音素前；the 表示特指；book 是可数名词单数，不能不加冠词。',
        difficulty: 1,
        tags: ['语法选择', '冠词'],
      },
      {
        id: 'eng-paper-01-q14',
        type: 'choice',
        stem:
          'The reading room is (14) ____ the teaching building and the playground, so it is easy to find.',
        options: ['among', 'between', 'across', 'behind'],
        answer: 'B',
        explanation:
          'between ... and ... 表示「在两者之间」，句中出现 and 连接的两个地点，故选 between。among 用于三者或三者以上；across 表示「穿过」；behind 只表示「在……后面」，都不能与 and 搭配。',
        difficulty: 1,
        tags: ['语法选择', '介词', '方位'],
      },
      {
        id: 'eng-paper-01-q15',
        type: 'choice',
        stem:
          "It's raining hard. You'd better (15) ____ your umbrella with you.",
        options: ['taking', 'to take', 'take', 'took'],
        answer: 'C',
        explanation:
          "had better 后接动词原形，表示「最好做某事」，其否定式是 had better not do。故用 take，不能加 to 或 -ing。",
        difficulty: 1,
        tags: ['语法选择', '情态动词', 'had better'],
      },
      {
        id: 'eng-paper-01-q16',
        type: 'choice',
        stem:
          'The boy (16) ____ won the first prize in the English speech contest is my cousin.',
        options: ['which', 'whom', 'whose', 'who'],
        answer: 'D',
        explanation:
          '先行词 the boy 指人，关系词在定语从句中作主语，用 who。which 指物；whom 只能在从句中作宾语；whose 后面必须再接名词。',
        difficulty: 2,
        tags: ['语法选择', '定语从句', '关系代词'],
      },
      {
        id: 'eng-paper-01-q17',
        type: 'choice',
        stem: 'Our teacher asked us (17) ____ our homework on time.',
        options: ['to hand in', 'handing in', 'hand in', 'handed in'],
        answer: 'A',
        explanation:
          'ask sb to do sth 是固定搭配，故用不定式 to hand in（上交）。handing in 不能作 ask 的宾语补足语；hand in 缺 to；handed in 是过去式，时态不符。',
        difficulty: 1,
        tags: ['语法选择', '非谓语动词', '固定搭配'],
      },
      {
        id: 'eng-paper-01-q18',
        type: 'choice',
        stem: 'Nobody knows (18) ____ the new library will open.',
        options: ['that', 'when', 'what', 'which'],
        answer: 'B',
        explanation:
          '宾语从句中缺少时间状语，用连接副词 when（什么时候开放）。that 不充当成分且与句意不合；what、which 是连接代词，不能表示时间。',
        difficulty: 2,
        tags: ['语法选择', '宾语从句', '连接词'],
      },
      {
        id: 'eng-paper-01-q19',
        type: 'choice',
        stem: 'Keep the windows open, (19) ____ the classroom will be too hot.',
        options: ['and', 'so', 'or', 'but'],
        answer: 'C',
        explanation:
          '「祈使句 + or + 陈述句」表示「做……，否则就会……」；这里后半句是不好的结果（教室太热），故用 or。and 通常表示顺承的好结果；so、but 不能这样连接祈使句。',
        difficulty: 2,
        tags: ['语法选择', '并列连词', '祈使句'],
      },
      {
        id: 'eng-paper-01-q20',
        type: 'choice',
        stem: 'The more carefully you read, the (20) ____ mistakes you will make.',
        options: ['few', 'little', 'less', 'fewer'],
        answer: 'D',
        explanation:
          '「the + 比较级 ... , the + 比较级 ...」表示「越……越……」。mistakes 是可数名词复数，要用 few 的比较级 fewer，不能用 less（修饰不可数名词）或 few、little 的原级。',
        difficulty: 3,
        tags: ['语法选择', '比较级', 'the more ... the more'],
      },

      /* ---------------- 阅读 第一节：短文理解（15 小题 30 分） ---------------- */
      {
        id: 'eng-paper-01-q21',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'The Boy Who Fixed Bikes\n\n' +
          'Last spring, an old blue bike with a broken chain stood outside Class 3 for almost two weeks. Nobody knew who it belonged to, and nobody touched it. Then, one Monday morning, Zhang Lei brought a small toolbox to school.\n\n' +
          "During the lunch break, he turned the bike upside down and began to work. 'It is not mine,' he told the curious classmates around him. 'But somebody needs it.' He spent the whole break cleaning the chain and putting it back. When the bell rang, his hands were black with oil.\n\n" +
          'The owner appeared the next day. It was Li Na, a quiet girl from another class. Her mother had been ill for a month, so Li Na had stopped riding to school: she had no time to get the bike repaired. She thought she would have to walk every day from then on.\n\n' +
          "Zhang Lei did not tell the teacher what he had done, and he refused the money Li Na offered him. 'If you want to thank me, help someone else one day,' he said. Two months later, Li Na began to stay after school on Fridays, teaching younger students to read English aloud. The old blue bike is still parked outside Class 3, but it is no longer a question mark to anyone.\n\n" +
          '21. What was the situation of the old blue bike at the beginning of the story?',
        options: [
          'It had stood outside Class 3 with a broken chain for about two weeks.',
          'It had been moved to the school gate by a teacher.',
          'It had been taken away by its owner.',
          'It had been painted blue by Zhang Lei.',
        ],
        answer: 'A',
        explanation:
          '第一段说明：一辆链条坏了的旧蓝色自行车在 3 班外停了将近两周，没人知道是谁的，故选 A。B、C、D 在文中都没有依据。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '记叙文'],
      },
      {
        id: 'eng-paper-01-q22',
        type: 'choice',
        stem: '（据上文短文 The Boy Who Fixed Bikes）22. How did Zhang Lei help the owner of the bike?',
        options: [
          'He told the teacher about the broken bike.',
          'He repaired the bike during the lunch break.',
          'He lent the owner his own bike.',
          'He bought a new chain for the owner.',
        ],
        answer: 'B',
        explanation:
          '第二段说他在午休时把车倒过来，利用整个午休把链条清洗装回，即自己动手修好了车，故选 B。文中明确说他没告诉老师（A 错），也没有借车或买车链（C、D 无依据）。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '记叙文'],
      },
      {
        id: 'eng-paper-01-q23',
        type: 'choice',
        stem: '（据上文短文 The Boy Who Fixed Bikes）23. Why had Li Na stopped riding to school?',
        options: [
          'Her mother needed the bike every day.',
          'She had lost the key to the bike.',
          'She had no time to get the bike repaired.',
          'She lived too far away from the school.',
        ],
        answer: 'C',
        explanation:
          '第三段说明：她母亲病了一个月，她没有时间去修车，只好不再骑车上学，故选 C。文中没提母亲要用车、钥匙丢失或住得远。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '因果关系'],
      },
      {
        id: 'eng-paper-01-q24',
        type: 'choice',
        stem:
          "（据上文短文 The Boy Who Fixed Bikes）24. What does the underlined word 'curious' in Paragraph 2 probably mean?",
        options: [
          'feeling angry about something',
          'feeling tired after work',
          'feeling proud of themselves',
          'wanting to know more about something',
        ],
        answer: 'D',
        explanation:
          '同学们围在旁边，是因为「想知道这辆车是怎么回事、他想干什么」，故 curious 意为「好奇的」，即 wanting to know more。用上下文（围观的同学们）即可判断，与生气、疲惫、自豪无关。',
        difficulty: 2,
        tags: ['阅读理解', '词义猜测', '记叙文'],
      },
      {
        id: 'eng-paper-01-q25',
        type: 'choice',
        stem: '（据上文短文 The Boy Who Fixed Bikes）25. What does the last paragraph mainly tell us?',
        options: [
          'Kindness can be passed on to more people.',
          'Li Na became a teacher two months later.',
          'Zhang Lei was given money by the school.',
          'The old blue bike was finally thrown away.',
        ],
        answer: 'A',
        explanation:
          '最后一段写李娜开始留下来教低年级同学朗读英语，正是把张磊的善意传下去，故选 A。她只是辅导同学朗读，不是当了老师（B 错）；张磊拒绝了钱（C 错）；车还停在 3 班外（D 错）。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '情感态度'],
      },
      {
        id: 'eng-paper-01-q26',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Walk to School, Wake Up Your Brain\n\n' +
          'Most students in our city travel to school by bus, by car or by underground. Only about one in five of them walks. A survey of 600 students at a local middle school suggests that the way you travel in the morning may affect the way you learn in the classroom.\n\n' +
          'Students who walked to school for twenty minutes or more were more likely to say that they felt awake in the first lesson. They also found it easier to remember new words. The reason is simple: walking makes the heart beat faster, so more oxygen reaches the brain. When the brain gets more oxygen, it works better.\n\n' +
          'There are other benefits, too. Students who walk with a friend often talk about what they will do at school that day, and this helps them feel ready for the lessons. A twenty-minute walk in the morning is also a good way to get the exercise young people need: doctors suggest at least one hour a day, but many students get less than half of it.\n\n' +
          'Of course, walking is not possible for everyone. Some students live too far away. Others have to carry heavy bags or musical instruments. But if your home is within a twenty-minute walk of the school, the school suggests trying it at least twice a week.\n\n' +
          '26. What does the survey of 600 students mainly show?',
        options: [
          'Walking to school is more popular than taking a bus.',
          'How students travel to school may affect their learning.',
          'Students who walk to school always get better grades.',
          'Most students get enough exercise every day.',
        ],
        answer: 'B',
        explanation:
          '第一段最后一句点明调查结论：早晨上学的方式可能影响课堂学习，故选 B。文中说只有约五分之一的学生步行（A 错）；文中只说更容易记单词，未提成绩一定更好（C 过于绝对）；文中说许多学生运动量不到建议量的一半（D 错）。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '说明文'],
      },
      {
        id: 'eng-paper-01-q27',
        type: 'choice',
        stem: '（据上文短文 Walk to School, Wake Up Your Brain）27. Why can walking help students learn better?',
        options: [
          'It helps them sleep longer at night.',
          'It gives them more time to finish their homework.',
          'More oxygen reaches the brain when the heart beats faster.',
          'It makes the school day shorter than before.',
        ],
        answer: 'C',
        explanation:
          '第二段给出原因：走路让心跳加快，更多氧气到达大脑，大脑工作得更好，故选 C。A、B、D 在文中都没有依据。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '科学说明'],
      },
      {
        id: 'eng-paper-01-q28',
        type: 'choice',
        stem:
          '（据上文短文 Walk to School, Wake Up Your Brain）28. What do doctors suggest about exercise for young people?',
        options: [
          'Twenty minutes a day.',
          'Thirty minutes a day.',
          'Half an hour a week.',
          'At least one hour a day.',
        ],
        answer: 'D',
        explanation:
          '第三段说 doctors suggest at least one hour a day（医生建议每天至少一小时），故选 D。二十分钟是步行上学的时间，不是医生的建议量。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '数字信息'],
      },
      {
        id: 'eng-paper-01-q29',
        type: 'choice',
        stem:
          '（据上文短文 Walk to School, Wake Up Your Brain）29. Who may NOT be able to walk to school?',
        options: [
          'Students who live far away from the school.',
          'Students whose friends live nearby.',
          'Students who get up early in the morning.',
          'Students who are interested in music.',
        ],
        answer: 'A',
        explanation:
          '最后一段明确说 walking is not possible for everyone，并列举住得太远、要背很重的书包或乐器等情况，故选 A。与朋友同住附近、早起、喜欢音乐都不是「不能走路上学」的理由。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '推理判断'],
      },
      {
        id: 'eng-paper-01-q30',
        type: 'choice',
        stem: '（据上文短文 Walk to School, Wake Up Your Brain）30. What is the writer\'s suggestion?',
        options: [
          'Stopping the school bus service in the city.',
          'Walking to school at least twice a week if possible.',
          'Carrying lighter bags to school every day.',
          'Doing exercise only at the weekend.',
        ],
        answer: 'B',
        explanation:
          '末句给出建议：如果家离学校步行二十分钟以内，建议每周至少试两次，故选 B。文中没有说要取消校车（A 无依据）、换成更轻的书包（C 无依据）或只在周末运动（D 无依据）。',
        difficulty: 2,
        tags: ['阅读理解', '作者意图', '说明文'],
      },
      {
        id: 'eng-paper-01-q31',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Pocket Money: A Lesson or a Danger?\n\n' +
          'Every month, thousands of parents ask themselves the same question: should I give my child pocket money? Some say yes; others are afraid that money will make their children lazy or careless. Both sides have a point, and the answer may depend on how the money is given.\n\n' +
          'Those who support pocket money argue that it is the cheapest way to learn about money. A thirteen-year-old who gets fifty yuan a month and spends it all in the first week will feel the result immediately. Next month, she may plan more carefully. Learning by making small mistakes at thirteen is much safer than making big ones at thirty.\n\n' +
          'Those who are against it point to a different danger. If children can buy whatever they want, they may spend more time and money on snacks, games and online gifts than on books. A survey in one class found that students with more than one hundred yuan a month spent twice as much time on mobile games as those with twenty yuan.\n\n' +
          'Perhaps the best answer is to give money and a plan at the same time. Parents and children can agree on what the money is for and what is not allowed. In this way, pocket money stops being a gift and becomes a small lesson that lasts a lifetime.\n\n' +
          '31. What is the passage mainly about?',
        options: [
          'How to save money as a middle school student.',
          'Why parents should not give children any money.',
          'Whether students should get pocket money and how to give it.',
          'How much pocket money students in China usually get.',
        ],
        answer: 'C',
        explanation:
          '全文先摆出正反两方观点，最后提出「给钱的同时给计划」的办法，讨论的正是「该不该给零花钱、怎么给」，故选 C。A 只涉及其中一个细节；B、D 都只是文中的一部分或未提及。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '议论文'],
      },
      {
        id: 'eng-paper-01-q32',
        type: 'choice',
        stem: '（据上文短文 Pocket Money: A Lesson or a Danger?）32. What do the supporters of pocket money believe?',
        options: [
          'Children should never make mistakes with money.',
          'Pocket money makes children work harder at school.',
          'Money given once a month is better than money given every week.',
          'Learning to manage small amounts early is safer than learning late.',
        ],
        answer: 'D',
        explanation:
          '第二段末句说：十三岁犯小错，比三十岁犯大错安全得多，这正是支持者的理由，故选 D。A 与文意相反；B、C 文中都没有提到。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '议论文'],
      },
      {
        id: 'eng-paper-01-q33',
        type: 'choice',
        stem: '（据上文短文 Pocket Money: A Lesson or a Danger?）33. What did the survey in one class find?',
        options: [
          'Students with more pocket money spent more time on mobile games.',
          'Most students spent their pocket money on books.',
          'Students with twenty yuan a month saved the most money.',
          'Few students in the class got pocket money from their parents.',
        ],
        answer: 'A',
        explanation:
          '第三段说：每月零花钱超过一百元的学生花在手机游戏上的时间是每月二十元学生的两倍，故选 A。B、C、D 都与这一调查结果不符。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '数据信息'],
      },
      {
        id: 'eng-paper-01-q34',
        type: 'choice',
        stem: '（据上文短文 Pocket Money: A Lesson or a Danger?）34. What does the writer suggest in the last paragraph?',
        options: [
          'Giving children money without any rules.',
          'Giving money together with a clear plan.',
          'Stopping pocket money until high school.',
          'Letting children decide everything by themselves.',
        ],
        answer: 'B',
        explanation:
          '末段提出「给钱的同时给计划」，家长和孩子约定钱的用途与禁止事项，故选 B。A、D 恰恰是作者担心的做法；C 文中没有提出。',
        difficulty: 1,
        tags: ['阅读理解', '作者观点', '议论文'],
      },
      {
        id: 'eng-paper-01-q35',
        type: 'choice',
        stem:
          "（据上文短文 Pocket Money: A Lesson or a Danger?）35. What does 'Both sides have a point' mean in Paragraph 1?",
        options: [
          'Both sides get a score in the game.',
          'Both sides have a place to stand.',
          'Both sides have something reasonable to say.',
          'Both sides made a small mistake.',
        ],
        answer: 'C',
        explanation:
          '下文分别介绍了支持与反对两方「都讲得通的道理」，故 have a point 意为「有道理、说得在理」，选 C。point 在这里不是「分数」「地点」或「小错误」。',
        difficulty: 3,
        tags: ['阅读理解', '词义猜测', '议论文'],
      },

      /* ---------------- 阅读 第二节：多模态短文（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-01-q36',
        type: 'choice',
        stem:
          '阅读下面的公告与活动安排表，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Sunshine Community Library — Weekend Programme (March)\n\n' +
          'Notice: The weekend programme is free for all middle school students. Please bring your student card. You may sign up at the front desk or by phone before Friday 6 p.m. Each student can join at most two activities in one month. If you cannot come, please call us at least one day earlier, or your place will be given to a student on the waiting list.\n\n' +
          'Activity | Day | Time | Place | For whom\n' +
          'Story Time in English | Saturday | 9:30—11:00 | Room 201 | Grades 7—9\n' +
          'Robotics Workshop | Saturday | 14:00—16:30 | Room 305 | Grades 8—9 (10 places)\n' +
          'Chinese Paper Cutting | Sunday | 9:00—10:30 | Room 108 | All students\n' +
          'Book Swap Corner | Sunday | 14:00—17:00 | Hall 1 | All students\n\n' +
          "Note: Bring your own books to the Book Swap Corner — one book for one book. The Robotics Workshop needs a parent's signature on the form.\n\n" +
          '36. What should a student bring when taking part in the weekend programme?',
        options: [
          'A library card and twenty yuan.',
          'A book and a pen.',
          'A form signed by a friend.',
          'A student card.',
        ],
        answer: 'D',
        explanation:
          '公告第二句说 Please bring your student card（请带学生证），故选 D。活动 free（免费），A 中的二十元与公告矛盾；只有机器人工作坊需要家长签名，且不是朋友签名或带书带笔，B、C 错。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '细节理解'],
      },
      {
        id: 'eng-paper-01-q37',
        type: 'choice',
        stem: '（据上文公告与活动安排表）37. What time does the Robotics Workshop finish?',
        options: ['16:30', '11:00', '10:30', '17:00'],
        answer: 'A',
        explanation:
          '表格中 Robotics Workshop 的时间为 14:00—16:30，故结束时间是 16:30。11:00 是英语故事会结束时间，10:30 是剪纸结束时间，17:00 是换书角结束时间，都属干扰项。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '表格信息'],
      },
      {
        id: 'eng-paper-01-q38',
        type: 'choice',
        stem:
          '（据上文公告与活动安排表）38. Li Hua is a Grade 7 student. Which two activities can he choose?',
        options: [
          'Story Time in English and Robotics Workshop.',
          'Story Time in English and Chinese Paper Cutting.',
          'Chinese Paper Cutting and Robotics Workshop.',
          'Robotics Workshop and Book Swap Corner.',
        ],
        answer: 'B',
        explanation:
          '表格中 Robotics Workshop 一栏写明 For whom: Grades 8—9，七年级学生不能参加；其余三项都面向 All students 或 Grades 7—9，故只有 B 的组合可行。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '信息匹配'],
      },
      {
        id: 'eng-paper-01-q39',
        type: 'choice',
        stem: '（据上文公告与活动安排表）39. What will happen if a student cannot come and does not call the library?',
        options: [
          'He will have to pay for the activity.',
          'He can come one week later instead.',
          'His place will be given to a student on the waiting list.',
          'He can join three activities next month.',
        ],
        answer: 'C',
        explanation:
          '公告末句说：如果不能来，请至少提前一天打电话，否则名额将让给等候名单上的同学，故选 C。A、B 公告未提及；D 与「每人每月最多两项」矛盾。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '条件推理'],
      },
      {
        id: 'eng-paper-01-q40',
        type: 'choice',
        stem: '（据上文公告与活动安排表）40. Which of the following is TRUE according to the notice and the table?',
        options: [
          'Each activity costs twenty yuan.',
          'Students can sign up at the front desk on Sunday morning.',
          'A student can join as many activities as he likes.',
          'The Book Swap Corner is open on Sunday afternoon.',
        ],
        answer: 'D',
        explanation:
          '表格显示换书角在周日 14:00—17:00 开放，即周日下午，D 正确。活动免费（A 错）；报名须在周五下午 6 点前完成（B 错）；每人每月最多两项（C 错）。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '综合判断'],
      },

      /* ---------------- 项目情境第一节：项目语篇（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-01-q41',
        type: 'choice',
        stem:
          '阅读下面的项目活动报告，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'The Buddy Reading Project — A Report by Class 9A\n\n' +
          'Last October, our English teacher told us that many students in Grade 7 were afraid of reading English aloud. They knew the words, but they felt shy. So Class 9A started a project called Buddy Reading.\n\n' +
          'First, we did a survey. Of the 120 Grade 7 students, 68 said they had never read an English story aloud to anyone. Fifty-two said they would like to try if a friendly older student sat beside them.\n\n' +
          "Next, we made pairs. Each of us took care of two Grade 7 students. We met every Wednesday after school in the reading room for twenty minutes. We did not teach grammar. Instead, we chose short and funny stories, and we took turns to read one sentence at a time. When the younger students made mistakes, we only said, 'Try once more' or 'That part is difficult. Let us read it together.'\n\n" +
          'After eight weeks, we asked the same questions again. Only nine students said they had never read aloud. More importantly, 31 students said they had started to read English stories at home. Their teacher also found that they put up their hands more often in class.\n\n' +
          'The project taught us something, too. To explain a difficult sentence to a younger student, we had to understand it first. Our own reading improved as much as theirs, and the reading room has never been so full on Wednesday afternoons.\n\n' +
          '41. Why did Class 9A start the Buddy Reading Project?',
        options: [
          'Many Grade 7 students were afraid of reading English aloud.',
          'The reading room was too small for the whole class.',
          'Their teacher asked them to prepare for a reading exam.',
          'They wanted to write a new English story by themselves.',
        ],
        answer: 'A',
        explanation:
          '第一段说明：老师告诉他们许多七年级学生害怕大声朗读英语，所以 9A 班发起了这个项目，故选 A。B、C、D 在文中都没有依据。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '校园项目'],
      },
      {
        id: 'eng-paper-01-q42',
        type: 'choice',
        stem: '（据上文项目报告 The Buddy Reading Project）42. What did the older students do when the younger ones made mistakes?',
        options: [
          'They corrected every mistake at once.',
          'They encouraged them and read the difficult part together.',
          "They asked them to read the same sentence again and again alone.",
          'They wrote the mistakes down and gave them to the teacher.',
        ],
        answer: 'B',
        explanation:
          '第三段说明：只有「再试一次」或「这部分有点难，我们一起读」这类回应，即鼓励并与他们一起读难句，故选 B。A、C、D 都与原文做法不符。',
        difficulty: 2,
        tags: ['项目情境', '细节理解', '做法归纳'],
      },
      {
        id: 'eng-paper-01-q43',
        type: 'choice',
        stem: '（据上文项目报告 The Buddy Reading Project）43. What was the result after eight weeks?',
        options: [
          'All Grade 7 students read English stories every day.',
          'The Grade 7 students stopped making mistakes in reading.',
          'Fewer students had never read aloud, and more read at home.',
          'The project was stopped by the school for some reason.',
        ],
        answer: 'C',
        explanation:
          '第四段说明：说「从没朗读过」的学生从 68 人降到 9 人，且有 31 人开始在家读英语故事，故选 C。A、B 说法过于绝对，文中没有；D 与文中「周三下午阅读室从没这么满过」矛盾。',
        difficulty: 2,
        tags: ['项目情境', '数据理解', '结果分析'],
      },
      {
        id: 'eng-paper-01-q44',
        type: 'choice',
        stem: '（据上文项目报告 The Buddy Reading Project）44. What does the last paragraph tell us?',
        options: [
          'The older students got money for taking part in the project.',
          'Grade 7 students became better teachers than Grade 9 students.',
          'The reading room was closed on Wednesday afternoons.',
          'Helping others also helped the older students themselves.',
        ],
        answer: 'D',
        explanation:
          '末段说：要讲清难句，自己得先弄懂，所以自己的阅读也提高了——帮助别人同时提升了自己，故选 D。A、B、C 都与原文不符。',
        difficulty: 2,
        tags: ['项目情境', '主旨理解', '推理判断'],
      },
      {
        id: 'eng-paper-01-q45',
        type: 'choice',
        stem: '（据上文项目报告 The Buddy Reading Project）45. What is the best title for the report?',
        options: [
          'Reading Together, Growing Together',
          'How to Win a Reading Competition',
          'Why English Is Difficult for Grade 7',
          'A New Reading Room in Our School',
        ],
        answer: 'A',
        explanation:
          '报告写的是高年级与低年级同学结对朗读、双方都有收获，A「一起读，一起成长」最能概括全文。B 与文中没有竞赛这一事实不符；C、D 只截取了文中的某个细节。',
        difficulty: 2,
        tags: ['项目情境', '标题归纳', '主旨理解'],
      },

      /* ---------------- 项目情境第二节：简答题（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-01-q46',
        type: 'short',
        stem:
          '阅读下面的调查结果与学校通知，然后回答问题（每小题 2 分，请用完整句子作答）。\n\n' +
          'After-school Clubs Survey (200 students in Grade 8)\n' +
          'Favourite club: sports 62, music 48, art 34, science 30, reading 26\n' +
          'Reason for not joining any club: too much homework 71, all clubs are full 43, no friends in the club 38, too far from home 27, other reasons 21\n\n' +
          'Notice: From next term, our school will open two new clubs — a Science Club on Tuesdays and a Reading Club on Thursdays. Each club has thirty places and is free for all students. Sign up in the school office from 1 to 10 March.\n\n' +
          '46. Which club do the 200 Grade 8 students like best, and how many students chose it?',
        answer: 'They like the sports club best, and sixty-two (62) students chose it.',
        rubric: [
          '答出最受欢迎的是 sports（运动）俱乐部',
          '答出人数 62',
          '用完整句子作答、时态与主谓一致基本正确',
        ],
        explanation:
          '表格第一行 Favourite club 中 sports 62 数字最大，故运动俱乐部最受欢迎，共 62 人选择。作答时注意「最」要体现出来（best / most popular）。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-01-q47',
        type: 'short',
        stem: '（材料见第 46 题）47. What is the most common reason for not joining a club, and how many students gave it?',
        answer: 'The most common reason is having too much homework, and seventy-one (71) students gave it.',
        rubric: [
          '答出原因 too much homework（作业太多）',
          '答出人数 71',
          '句子结构完整、表达清楚',
        ],
        explanation:
          'Reason for not joining any club 一栏中 too much homework 的人数最多（71 人），故为最常见原因。注意问的是「原因」而不是「人数最多的俱乐部」。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-01-q48',
        type: 'short',
        stem:
          '（材料见第 46 题）48. A Grade 8 student says he wants to join the Reading Club, but all the clubs are full now. Will the notice help him? Why? Give two points.',
        answer:
          'Yes, it will help him. The notice says two new clubs will open next term, and the new Reading Club has thirty places. He can sign up in the school office from 1 to 10 March.',
        rubric: [
          '明确回答 Yes（通知对他有帮助）',
          '答出新学期将新开两个社团、其中就有阅读社',
          '答出阅读社有 30 个名额（或说明 3 月 1—10 日在学校办公室报名）',
        ],
        explanation:
          '通知正是针对「社团名额已满」这类情况推出的：下学期新开科学社与阅读社，各有 30 个名额，3 月 1—10 日在学校办公室报名。要「表态 + 依据」两件事都答到。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '信息整合'],
      },
      {
        id: 'eng-paper-01-q49',
        type: 'short',
        stem:
          '（材料见第 46 题）49. The survey shows that 43 students did not join a club because all the clubs are full. What does this tell the school?',
        answer:
          'It tells the school that many students want to join clubs, but there are not enough places, so the school should open more clubs or offer more places.',
        rubric: [
          '答出社团名额不足或学校应增设社团、增加名额',
          '联系调查数据说明依据（有 43 名同学因名额已满未能参加）',
        ],
        explanation:
          '43 名学生因「名额已满」未能参加，说明需求大于供给，学校应增加社团数量或名额。答题要点是「结论 + 数据依据」，不要只抄数据。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '信息推断'],
      },
      {
        id: 'eng-paper-01-q50',
        type: 'short',
        stem:
          '（材料见第 46 题）50. Thirty-eight students say they do not join a club because they have no friends in it. What can the school do to help them? Write one suggestion.',
        answer:
          'The school can hold a club open day, or let students sign up together with a classmate, so that they can try the activities with someone they know before they join.',
        rubric: [
          '提出一条具体可行的建议（如社团开放日、与同学一起报名、安排老社员接待新同学等）',
          '建议与「没有朋友一起参加」这一原因对应',
          '句子完整、表达清楚（用 can / could / should 给出建议均可）',
        ],
        explanation:
          '建议要针对「没有朋友一起参加」这一点，如允许与同学结伴报名、举办社团开放日先体验再报名、让老社员带新同学等。只写 join a club is good 这类空话不得分。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '开放性表达'],
      },

      /* ---------------- 写作 第一节：单词拼写（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-01-q51',
        type: 'fill',
        stem:
          '根据下列句子及所给的首字母提示，写出单词的适当形式，使句子完整、通顺。\n\n51. My brother usually does morning e____ in the park before breakfast.',
        answer: 'exercise',
        explanation:
          'morning exercise 意为「早锻炼」，exercise 作「锻炼」讲时不可数，用单数形式，首字母已给出 e。',
        difficulty: 1,
        tags: ['单词拼写', '日常生活', '固定短语'],
      },
      {
        id: 'eng-paper-01-q52',
        type: 'fill',
        stem: "52. Don't forget to take your u____ with you. It may rain this afternoon.",
        answer: 'umbrella',
        explanation:
          '由后句「今天下午可能下雨」可知要带的是雨伞 umbrella。注意拼写中 m 双写、结尾是 -lla。',
        difficulty: 1,
        tags: ['单词拼写', '天气', '生活常识'],
      },
      {
        id: 'eng-paper-01-q53',
        type: 'fill',
        stem: '53. It is not p____ to talk loudly in the reading room.',
        answer: 'polite',
        explanation:
          '在阅览室大声说话是不礼貌的，故填 polite（有礼貌的）。It is not polite to do sth 是常用句型。',
        difficulty: 2,
        tags: ['单词拼写', '形容词', '校园规则'],
      },
      {
        id: 'eng-paper-01-q54',
        type: 'fill',
        stem:
          '54. 根据句意及括号内的中文提示写出单词：The film was so ____（无聊的）that I fell asleep in the first ten minutes.',
        answer: 'boring',
        explanation:
          '修饰 the film 这类「令人无聊的事物」要用 -ing 形式的 boring；bored 表示「（人）感到无聊的」，用在此处不当。',
        difficulty: 2,
        tags: ['单词拼写', '-ing/-ed 形容词', '易错点'],
      },
      {
        id: 'eng-paper-01-q55',
        type: 'fill',
        stem: '55. 根据句意及括号内的中文提示写出单词：He is an ____（诚实的）boy and never tells a lie.',
        answer: 'honest',
        explanation:
          '「诚实的」是 honest，注意 h 不发音，前面要用不定冠词 an。never tells a lie 正是「诚实」的具体表现。',
        difficulty: 2,
        tags: ['单词拼写', '形容词', '发音易错'],
      },

      /* ---------------- 写作 第二节：完成句子（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-01-q56',
        type: 'fill',
        stem:
          '根据所给的中文，在横线上填入合适的词语，使英文句子完整、通顺（每空一词组）。\n\n56. 我姐姐每天步行上学。\nMy sister ____ school every day.',
        answer: 'walks to|goes to',
        explanation:
          '主语 My sister 是第三人称单数，every day 用一般现在时，故 walk 要加 -s；「步行上学」说 walk to school。若用 goes to，则须在句末已有 school 的前提下才通顺，本句 school 已给出，故 walks to 最合适。',
        difficulty: 2,
        tags: ['完成句子', '一般现在时', '主谓一致'],
      },
      {
        id: 'eng-paper-01-q57',
        type: 'fill',
        stem: '57. 你最好现在就去医院。\nYou ____ to the hospital right now.',
        answer: "had better go|'d better go|had better start for",
        explanation:
          "had better 后接动词原形，表示「最好做某事」，缩写形式为 'd better。注意不能说 had better to go 或 had better going。",
        difficulty: 1,
        tags: ['完成句子', 'had better', '情态动词'],
      },
      {
        id: 'eng-paper-01-q58',
        type: 'fill',
        stem: '58. 这本书比那本更有趣。\nThis book is ____ than that one.',
        answer: 'more interesting|much more interesting|far more interesting',
        explanation:
          'interesting 是多音节形容词，比较级要用 more interesting；than 前面必须是比较级形式，不能写 interestinger。',
        difficulty: 1,
        tags: ['完成句子', '比较级', '多音节形容词'],
      },
      {
        id: 'eng-paper-01-q59',
        type: 'fill',
        stem: '59. 他年纪够大了，可以自己坐公交车。\nHe is ____ to take the bus by himself.',
        answer: 'old enough',
        explanation:
          'enough 修饰形容词时要后置，构成「形容词 + enough + to do sth」，故填 old enough。不能写成 enough old。',
        difficulty: 3,
        tags: ['完成句子', 'enough 的用法', '语序'],
      },
      {
        id: 'eng-paper-01-q60',
        type: 'fill',
        stem:
          '60. 我们到达电影院时，电影已经开始了。\nThe film ____ when we got to the cinema.',
        answer:
          'had already begun|had already started|had begun|had started|had already been on',
        explanation:
          '「电影开始」发生在 got to 之前，是「过去的过去」，用过去完成时 had + 过去分词；already 放在 had 之后。begin 的过去分词是 begun。',
        difficulty: 3,
        tags: ['完成句子', '过去完成时', '不规则动词'],
      },
    ],

    /* ------------------------------ 写作第三节 ------------------------------ */
    writing: {
      topic:
        '假设你是李华，你的英国笔友 Peter 下个月要来你校交流一周。请你给他写一封英文邮件，介绍你的校园生活，并给他两三条建议。内容包括：（1）你一天的作息与主要课程；（2）你最喜欢的一项校园活动及理由；（3）给 Peter 的建议（如交通方式、午餐、课堂表现、交朋友等）。请直接写邮件正文，称呼与落款已给出。',
      requirements: [
        '邮件正文须包含上面三个要点，可以适当发挥，但不要逐条翻译要点。',
        '正文 80—120 词（称呼与落款不计入词数）。',
        '文中不得出现真实姓名、校名等个人信息。',
        '行文连贯，时态一致，正确使用标点与大小写，书写规范。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Dear Peter,\n\n' +
            'I am glad to hear you will visit our school next month. Let me tell you about our school life.\n\n' +
            'We start at eight and have four lessons in the morning and three in the afternoon. My favourite subject is English, because our teacher asks us to talk in pairs. After class I play table tennis with my classmates. It is the best way to relax after a long day.\n\n' +
            'Here is some advice for you. You can take the underground to our school; it is fast and cheap. Also, do not be shy in class — our teachers and classmates are always ready to help.\n\n' +
            'I am sure you will have a wonderful week.\n\n' +
            'Yours,\nLi Hua',
          cn:
            '亲爱的 Peter：\n\n' +
            '很高兴听说你下个月要来我校。让我给你讲讲我们的校园生活。\n\n' +
            '我们八点开始上课，上午四节课、下午三节课。我最喜欢的科目是英语，因为老师让我们两两对话。下课后我和同学打乒乓球，那是漫长一天后最好的放松方式。\n\n' +
            '给你几条建议：你可以乘地铁来学校，又快又便宜。另外，上课别害羞——老师和同学随时都愿意帮忙。\n\n' +
            '我相信你会度过愉快的一周。\n\n' +
            '你的朋友，\n李华',
          comment:
            '三个要点齐全（作息与课程、最喜欢的活动及理由、给笔友的建议），并在建议后补了一句鼓励，内容充实。结构上按「介绍—活动—建议—祝愿」四段推进，每段一个中心，段落之间用 Let me tell you / Here is some advice 这类过渡语衔接。语言上句长错落：既有 We start at eight 这样的短句，也有 because 引导的原因状语从句和分号连接的并列句；the best way to relax after a long day 让理由具体可感。结尾句与前文呼应，格式（称呼、落款）规范。若想再上一个层次，可在活动段补一句具体的画面，如 It is always noisy and full of laughs there。',
          highlights: [
            {
              sentence: 'It is the best way to relax after a long day.',
              why: '用 it 指代上句的打球，一句给出评价，比 I like it very much 更有分量；after a long day 让「放松」有了具体情境。',
            },
            {
              sentence: 'You can take the underground to our school; it is fast and cheap.',
              why: '分号连接两个分句，一句话同时交代方式与理由，避免写成三个零散短句。',
            },
            {
              sentence: 'Also, do not be shy in class — our teachers and classmates are always ready to help.',
              why: '建议用祈使句直接给出，破折号后补充原因，语气友好不生硬，破折号也是提分句式。',
            },
          ],
        },
        {
          level: '二类文（14—16 分）',
          text:
            'Dear Peter,\n\n' +
            'I am very happy that you will come to our school next month. Now I want to tell you our school life.\n\n' +
            'We have four classes in the morning and three in the afternoon. The first class begins at eight. I like English best. After school I often play basketball with my friends, because it is interesting.\n\n' +
            'For you, I have some advice. You can come to school by underground. It is very fast. And you should be friendly to others, so you can make many friends.\n\n' +
            'I hope you will have a good time.\n\nYours,\nLi Hua',
          cn:
            '亲爱的 Peter：\n\n' +
            '很高兴你下个月要来我校。现在我想给你讲讲我们的校园生活。\n\n' +
            '我们上午四节课、下午三节课，第一节课八点开始。我最喜欢英语。放学后我常和朋友打篮球，因为它有趣。\n\n' +
            '我给你一些建议：你可以坐地铁来学校，它很快。而且你应该对别人友好，这样你能交到很多朋友。\n\n' +
            '希望你玩得开心。\n\n你的朋友，\n李华',
          comment:
            '要点齐全、语法基本正确、格式规范，属于二类文（14—16 分）。扣分点主要有三处：一是句式几乎全是简单句，没有从句与连接词的层次（because it is interesting 的理由过于笼统）；二是「一天的作息」只写了课时，缺少起床、午餐、放学后等具体信息，内容显得单薄；三是 play basketball with my friends 没有说明感受或效果，活动与理由之间只是「有趣」二字。升格办法：把第三、四句合并为 After school I often play basketball with my friends, which helps me forget the tiredness of the day.，并把 interesting 换成具体感受。',
          highlights: [
            {
              sentence: 'You can come to school by underground. It is very fast.',
              why: '建议明确、可操作，这类句子最容易写对，先保证「给建议」这一要点的分数。',
            },
            {
              sentence: 'I hope you will have a good time.',
              why: '结尾祝愿得体，符合邮件文体；升级写法可加 here in our school 使内容更具体。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'I am glad to hear that ... —— 听说……我很高兴（邮件开头万能句）',
        'Let me tell you something about our school life. —— 让我给你讲讲我们的校园生活。',
        'Our first class begins at eight, and we have ... lessons a day. —— 我们第一节课八点开始，每天有……节课。',
        'My favourite subject is ..., because ... —— 我最喜欢的科目是……，因为……',
        'It is the best way to relax after a long day. —— 那是漫长一天后最好的放松方式。',
        'Here is some advice for you. —— 给你几条建议。',
        'You can take the underground / the No. 5 bus to our school. —— 你可以乘地铁／5 路公交车来我们学校。',
        'Do not be shy in class; our teachers are always ready to help. —— 上课别害羞，老师们随时愿意帮忙。',
        'I am sure you will have a wonderful week here. —— 我相信你在这里会度过愉快的一周。',
      ],
    },

    /* ------------------------------ 听说材料（30 分另场） ------------------------------ */
    listening: [
      {
        title: '模仿朗读：My Favourite Corner of the School（8 分）',
        text:
          'My favourite corner of the school is not the playground or the canteen. It is a small reading room on the third floor of the teaching building. There are only eight tables, but the window is wide and the light is soft.\n\n' +
          'After lunch, I usually go there for twenty minutes. I read a few pages of a story, or I just look out of the window at the tall trees. The birds in them are busy all year round.\n\n' +
          'Some of my classmates think the reading room is boring. I do not agree. When you read in a quiet place, words stay in your mind longer. When you look up, you are ready for the afternoon classes. That small room has taught me to enjoy slow time, and that is a lesson no exam can measure.',
        cn:
          '我学校里最喜欢的角落不是操场，也不是食堂，而是教学楼三楼上一间小小的阅览室。那里只有八张桌子，但窗户很宽，光线柔和。\n\n' +
          '午饭后我常去那里待二十分钟。我读上几页故事，或者就看看窗外的大树——树上的鸟一年到头都忙着。\n\n' +
          '有些同学觉得阅览室很无聊，我不同意。在安静的地方读书，词语在脑海里留得更久；抬起头时，你已经准备好上下午的课了。那间小屋子教会我享受慢下来的时间，而这是任何考试都考不出的一课。',
        cues: [
          '重音：favourite、reading room、quiet、slow time 等实词要重读；第一句 not the playground or the canteen 中的 not 也要重读，突出对比。',
          '连读与弱读：read a few pages of a story 中 read a、pages of 连读；a、the、of 弱读，避免每个词读成重音。',
          '语调：The birds in them are busy all year round. 用降调收尾，语气轻松；末句 That small room has taught me ... 读得稍慢，句末降调表示肯定。',
          '停顿：After lunch, / I usually go there for twenty minutes. 逗号处短停；三个并列的短句之间停顿一致，不要越读越快。',
        ],
        tasks: [
          {
            id: 'eng-paper-01-l1-t1',
            type: 'choice',
            stem: 'What is the speaker\'s favourite corner of the school?',
            options: [
              'The playground.',
              'The canteen.',
              'The small reading room.',
              'The teaching building gate.',
            ],
            answer: 'C',
            explanation:
              '演讲者开头就说最喜欢的角落不是操场也不是食堂，而是教学楼三楼的小阅览室，故选 C。',
            difficulty: 1,
            tags: ['听说·模仿朗读', '细节听取'],
          },
          {
            id: 'eng-paper-01-l1-t2',
            type: 'choice',
            stem: 'How long does the speaker usually stay in the reading room after lunch?',
            options: ['Ten minutes.', 'Twenty minutes.', 'Half an hour.', 'An hour.'],
            answer: 'B',
            explanation:
              '第二段说 I usually go there for twenty minutes（通常待二十分钟），故选 B。',
            difficulty: 1,
            tags: ['听说·模仿朗读', '时间信息'],
          },
          {
            id: 'eng-paper-01-l1-t3',
            type: 'choice',
            stem: 'What does the speaker think of the reading room?',
            options: [
              'It is a boring place for students.',
              'It helps words stay in the mind longer.',
              'It is too noisy for reading.',
              'It is only useful before exams.',
            ],
            answer: 'B',
            explanation:
              '第三段说 When you read in a quiet place, words stay in your mind longer，故选 B；有些同学觉得无聊，但演讲者不同意（A 错）。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '观点态度'],
          },
        ],
      },
      {
        title: '信息获取：A Talk About the School Sports Meeting（14 分）',
        text:
          'Amy: Hi, Ben. Have you heard about the school sports meeting?\n' +
          'Ben: Yes. It will be held on Friday, the eighteenth of October, on the school playground.\n' +
          'Amy: Are you going to take part in any event?\n' +
          'Ben: I will run in the boys\' 800 metres. I have been practising every morning for three weeks.\n' +
          'Amy: That is great. What time does it start?\n' +
          'Ben: The whole meeting starts at eight thirty in the morning, but my race is at ten.\n' +
          'Amy: Then I will come and cheer for you. Do you need any help?\n' +
          'Ben: Could you bring me a bottle of water? The office says each runner should bring his own water.\n' +
          'Amy: No problem. I will also take some photos for our class newspaper.\n' +
          'Ben: Thank you, Amy. Remember to wear your sports shoes, or you cannot enter the playground.\n' +
          'Amy: I will. See you on Friday.',
        cn:
          'Amy：你好，Ben。你听说校运会的事了吗？\n' +
          'Ben：听说了。这个运动会将在 10 月 18 日星期五在学校操场上举行。\n' +
          'Amy：你打算参加什么项目吗？\n' +
          'Ben：我要跑男子 800 米。我已经每天早上练习三个星期了。\n' +
          'Amy：太好了。几点开始？\n' +
          'Ben：整个运动会早上八点半开始，不过我的比赛在十点。\n' +
          'Amy：那我来为你加油。需要帮忙吗？\n' +
          'Ben：你能帮我带一瓶水吗？学校说每位选手都要自己带水。\n' +
          'Amy：没问题。我还会给我们班的班报拍些照片。\n' +
          'Ben：谢谢你，Amy。记得穿运动鞋，否则不能进操场。\n' +
          'Amy：我会的。星期五见。',
        cues: [
          '连读与弱读：What time does it start? 中 does it 连读；at ten、on Friday 的介词弱读。',
          '语调：一般疑问句（Are you going to take part in any event?）用升调；特殊疑问句（What time does it start?）用降调。',
          '重音：男生 800 米 the boys\' 800 metres 中 boys 与 800 都要读清楚，注意 800 读作 eight hundred。',
          '连读提醒：No problem. / That is great. 这些短句要读得干脆，cheer for you 中 cheer for 连读。',
        ],
        tasks: [
          {
            id: 'eng-paper-01-l2-t1',
            type: 'choice',
            stem: 'When will the school sports meeting be held?',
            options: [
              'On the eighteenth of October, Friday.',
              'On the eighth of October, Friday.',
              'On the eighteenth of November, Monday.',
              'On the twenty-eighth of October, Sunday.',
            ],
            answer: 'A',
            explanation:
              '对话中明确说 It will be held on Friday, the eighteenth of October，故选 A。注意 eighteenth 与 eighth 的读音区别。',
            difficulty: 2,
            tags: ['听说·信息获取', '时间信息'],
          },
          {
            id: 'eng-paper-01-l2-t2',
            type: 'choice',
            stem: 'What event will Ben take part in?',
            options: [
              'The boys\' 100 metres.',
              'The boys\' 800 metres.',
              'The long jump.',
              'The high jump.',
            ],
            answer: 'B',
            explanation:
              'Ben 说自己会跑男子 800 米（the boys\' 800 metres），并为此每天早上练习三个星期，故选 B。',
            difficulty: 1,
            tags: ['听说·信息获取', '细节听取'],
          },
          {
            id: 'eng-paper-01-l2-t3',
            type: 'choice',
            stem: 'What time does Ben\'s race start?',
            options: ['At eight thirty.', 'At nine.', 'At ten.', 'At ten thirty.'],
            answer: 'C',
            explanation:
              '对话中 Ben 说运动会八点半开始，但他的比赛在十点，故选 C。八点半是整场运动会开始的时间，属干扰项。',
            difficulty: 2,
            tags: ['听说·信息获取', '时间辨析'],
          },
          {
            id: 'eng-paper-01-l2-t4',
            type: 'choice',
            stem: 'What will Amy do for Ben?',
            options: [
              'She will run with him in the race.',
              'She will bring him a bottle of water.',
              'She will buy him a pair of sports shoes.',
              'She will write his report for the class.',
            ],
            answer: 'B',
            explanation:
              'Ben 请 Amy 带一瓶水，Amy 说 No problem，还打算帮班报拍照，故选 B。运动鞋是她自己要穿的（C 错）；她只是拍照，不是替 Ben 写报告（D 错）。',
            difficulty: 2,
            tags: ['听说·信息获取', '细节听取'],
          },
        ],
      },
      {
        title: '角色扮演：At the School Lost and Found Office（8 分）',
        text:
          'Woman: Good morning. This is the Lost and Found office of Sunshine Middle School. How can I help you?\n' +
          'Boy: Good morning. I lost my schoolbag yesterday afternoon. I think I left it on the school bus.\n' +
          'Woman: What colour is it, and what is inside?\n' +
          'Boy: It is a black bag with a blue football on it. There is a maths book, a water bottle and my keys inside. The keys are important, because they are the keys of my flat.\n' +
          'Woman: Do not worry. Two black schoolbags were handed in this morning. One was found in the school library, and the other was found on Bus No. 12.\n' +
          'Boy: Mine must be the one on the bus. I take Bus No. 12 every day.\n' +
          'Woman: Then come to Room 105 before five o\'clock this afternoon and bring your student card.\n' +
          'Boy: Thank you very much. I will be there at four.',
        cn:
          '女士：早上好。这里是阳光中学失物招领处，有什么能帮你的吗？\n' +
          '男孩：早上好。我昨天下午丢了书包，我想是落在校车上了。\n' +
          '女士：什么颜色？里面有什么？\n' +
          '男孩：黑色，上面有一个蓝色的足球图案。里面有一本数学书、一个水瓶和我的钥匙。钥匙很重要，因为是我家房门钥匙。\n' +
          '女士：别担心。今天早上有两个黑色书包被送来。一个在图书馆找到的，另一个是在 12 路公交车上找到的。\n' +
          '男孩：那一定是公交车上的那个。我每天都坐 12 路。\n' +
          '女士：那请你今天下午五点前到 105 室来，带上你的学生证。\n' +
          '男孩：非常感谢。我四点就到。',
        cues: [
          '语调：服务员的开场句用升调询问（How can I help you?）；确认信息时用降调（Then come to Room 105 before five o\'clock this afternoon.）。',
          '重音：black bag、blue football、maths book、water bottle、keys 这些关键词要重读，方便对方核对信息。',
          '连读：There is a maths book 中 There is a 连读成 /ðeərɪzə/；left it on 中 left it 连读。',
          '复述提示：复述时按「丢了什么—什么样子—里面有什么—在哪里找到—下一步怎么办」的顺序说，抓关键词而不是逐字背。',
        ],
        tasks: [
          {
            id: 'eng-paper-01-l3-t1',
            type: 'choice',
            stem: '复述题：Which of the following is the best retelling of the talk at the school Lost and Found office?',
            options: [
              'A boy lost his keys in the library and went to Room 105 to get them back.',
              'A boy lost his schoolbag on the school bus and was told to come to Room 105 with his student card.',
              'A girl left her black bag on Bus No. 12 and the office found it in the library.',
              'A boy handed in a black schoolbag with a blue football on it.',
            ],
            answer: 'B',
            explanation:
              '对话要点是：男孩昨天丢了书包（认为落在校车上），招领处让他下午五点前带学生证去 105 室领取，故选 B。A 混淆了钥匙与书包；C 人物与地点错；D 男孩是丢失者，不是上交者。',
            difficulty: 2,
            tags: ['听说·角色扮演', '复述', '信息整合'],
          },
          {
            id: 'eng-paper-01-l3-t2',
            type: 'choice',
            stem:
              'You want to know the opening hours of the Lost and Found office. Which question is the most suitable?',
            options: [
              'When do you open and close every day?',
              'Where is Room 105?',
              'How many bags were handed in this morning?',
              'Whose keys are these on the desk?',
            ],
            answer: 'A',
            explanation:
              '要询问「开放时间」应当用 When 提问；B 问地点、C 问数量、D 问物品归属，都不能得到时间信息，属答非所问。',
            difficulty: 2,
            tags: ['听说·角色扮演', '询问', '功能句'],
          },
          {
            id: 'eng-paper-01-l3-t3',
            type: 'choice',
            stem: 'If the boy goes to the office at six o\'clock this afternoon, what will probably happen?',
            options: [
              'The office will still be open for him.',
              'He will get his bag on the school bus.',
              'The office will be closed and he cannot get his bag.',
              'He will have to pay some money for the bag.',
            ],
            answer: 'C',
            explanation:
              '工作人员要求他「今天下午五点前」到 105 室，六点已过时间，办公室很可能已经关门，故选 C。',
            difficulty: 2,
            tags: ['听说·角色扮演', '回答', '推理判断'],
          },
        ],
      },
    ],
  },

  /* ================================================================== */
  /* 模拟卷（二）科技、环保与健康                                        */
  /* ================================================================== */
  {
    id: 'eng-paper-02',
    grade: 'all',
    title: '广州中考英语模拟卷（二）· 科技、环保与健康',
    basis: basisOf('科技与生活、环境保护与垃圾分类、健康与运动、饮食与作息'),
    duration: 100,
    totalScore: 110,
    speakingScore: 30,
    sections: SECTIONS,

    questions: [
      /* ---------------- 语言知识运用 第一节：完形填空（10 小题 15 分） ---------------- */
      {
        id: 'eng-paper-02-q1',
        type: 'choice',
        stem:
          '阅读下面短文，掌握其大意，然后从各题所给的 A、B、C、D 四个选项中选出能填入相应空白处的最佳选项。\n\n' +
          "Grandma's First Video Call\n\n" +
          'Grandma Wang is seventy-eight years old. She has lived in the same small flat for forty years, and she likes her old radio, her old chair and her old ways. When her grandson gave her a smartphone last winter, she put it in a drawer. For two months she did not (1) ____ it at all.\n\n' +
          "The change came on a rainy Sunday. Her son was working in another city, and her granddaughter was studying abroad. Both of them wanted to see her face. 'Just try it, Grandma,' said the daughter of her neighbour. 'I will (2) ____ you.'\n\n" +
          'Teaching Grandma was not (3) ____. She wore her glasses, but she still could not find the camera. She pressed the wrong button three times and the screen went black. However, she did not (4) ____.\n\n' +
          'After forty minutes, the phone rang, and a small face appeared on the screen: her granddaughter, in a winter coat. Grandma was so (5) ____ that she held the phone up to the window and showed the girl the rain, the street and the old tree in the garden.\n\n' +
          '(6) ____ that evening, Grandma has called her family every Sunday. She still keeps the radio, but she no longer thinks (7) ____ her phone is a useless toy. \'I cannot cook for them any more,\' she says. \'But I can (8) ____ them every week, and that is enough.\'\n\n' +
          'New things are not always (9) ____ for old people; they are only difficult at the beginning. With a little (10) ____, a small screen can bring a big family together.\n\n' +
          '第 (1) 空的最佳选项是：',
        options: ['open', 'touch', 'sell', 'carry'],
        answer: 'B',
        explanation:
          '她把手机放进抽屉，两个月里「碰都没碰过」，用 not touch ... at all。open、sell、carry 都不能与 put it in a drawer 构成「一直没用」的意思。',
        difficulty: 1,
        tags: ['完形填空', '动词辨析', '科技与生活'],
      },
      {
        id: 'eng-paper-02-q2',
        type: 'choice',
        stem:
          '据上文完形填空短文——\'Just try it, Grandma,\' said the daughter of her neighbour. \'I will (2) ____ you.\' 第 (2) 空的最佳选项是：',
        options: ['thank', 'leave', 'help', 'watch'],
        answer: 'C',
        explanation:
          '下文接着写「教外婆并不容易」，说明邻居的女儿是来「帮她」的，用 help。thank（感谢）、leave（离开）、watch（观看）都与后文的教学过程不符。',
        difficulty: 1,
        tags: ['完形填空', '动词辨析'],
      },
      {
        id: 'eng-paper-02-q3',
        type: 'choice',
        stem:
          '据上文完形填空短文——Teaching Grandma was not (3) ____. She wore her glasses, but she still could not find the camera. 第 (3) 空的最佳选项是：',
        options: ['boring', 'cheap', 'safe', 'easy'],
        answer: 'D',
        explanation:
          '后文列举了找不到相机、按错按钮等困难，说明「教外婆用手机并不容易」，用 not easy。三个干扰项都不能由下文推出。',
        difficulty: 1,
        tags: ['完形填空', '形容词辨析', '上下文线索'],
      },
      {
        id: 'eng-paper-02-q4',
        type: 'choice',
        stem:
          '据上文完形填空短文——She pressed the wrong button three times and the screen went black. However, she did not (4) ____. 第 (4) 空的最佳选项是：',
        options: ['give up', 'wake up', 'stand up', 'hurry up'],
        answer: 'A',
        explanation:
          'However 表示转折：虽然按错了三次，但她没有「放弃」，故用 give up。wake up（醒来）、stand up（站起）、hurry up（赶快）与语境无关。',
        difficulty: 1,
        tags: ['完形填空', '动词短语', '转折关系'],
      },
      {
        id: 'eng-paper-02-q5',
        type: 'choice',
        stem:
          '据上文完形填空短文——Grandma was so (5) ____ that she held the phone up to the window and showed the girl the rain, the street and the old tree in the garden. 第 (5) 空的最佳选项是：',
        options: ['tired', 'excited', 'afraid', 'angry'],
        answer: 'B',
        explanation:
          '视频接通后，外婆兴奋地把手机举到窗边给孙女看雨、看街和树，可见她非常激动，用 excited。so ... that ... 结构表示「如此……以至于……」。',
        difficulty: 1,
        tags: ['完形填空', '形容词辨析', '情感推断'],
      },
      {
        id: 'eng-paper-02-q6',
        type: 'choice',
        stem:
          '据上文完形填空短文——(6) ____ that evening, Grandma has called her family every Sunday. 第 (6) 空的最佳选项是：',
        options: ['Before', 'Until', 'Since', 'Except'],
        answer: 'C',
        explanation:
          '主句用现在完成时 has called，表示「自那天晚上以来一直如此」，用 Since + 名词短语。Until 要与否定式连用；Before、Except 与句意不符。',
        difficulty: 2,
        tags: ['完形填空', '连词', '现在完成时'],
      },
      {
        id: 'eng-paper-02-q7',
        type: 'choice',
        stem:
          "据上文完形填空短文——She still keeps the radio, but she no longer thinks (7) ____ her phone is a useless toy. 第 (7) 空的最佳选项是：",
        options: ['which', 'what', 'whether', 'that'],
        answer: 'D',
        explanation:
          'thinks 后是完整的陈述（her phone is a useless toy），用连接词 that 引导宾语从句；which、what 不能引导不缺成分的从句，whether 表示「是否」，与 no longer 的语义不合。',
        difficulty: 2,
        tags: ['完形填空', '宾语从句', '连接词'],
      },
      {
        id: 'eng-paper-02-q8',
        type: 'choice',
        stem:
          "据上文完形填空短文——'I cannot cook for them any more,' she says. 'But I can (8) ____ them every week, and that is enough.' 第 (8) 空的最佳选项是：",
        options: ['see', 'teach', 'thank', 'cook'],
        answer: 'A',
        explanation:
          '与前句「不能再给他们做饭了」形成对比，她现在能做的是每周通过视频「看见」家人，用 see。teach、thank、cook 都与「每周一次」的视频通话无关。',
        difficulty: 2,
        tags: ['完形填空', '动词辨析', '对比关系'],
      },
      {
        id: 'eng-paper-02-q9',
        type: 'choice',
        stem:
          '据上文完形填空短文——New things are not always (9) ____ for old people; they are only difficult at the beginning. 第 (9) 空的最佳选项是：',
        options: ['useless', 'easy', 'cheap', 'safe'],
        answer: 'B',
        explanation:
          '分号后的 they are only difficult at the beginning（只是一开始难）与空白处呼应，说明新事物对老年人并不总是「容易」，用 easy。useless 是「无用的」，与后文的转折关系不合。',
        difficulty: 2,
        tags: ['完形填空', '形容词辨析', '句内呼应'],
      },
      {
        id: 'eng-paper-02-q10',
        type: 'choice',
        stem:
          '据上文完形填空短文——With a little (10) ____, a small screen can bring a big family together. 第 (10) 空的最佳选项是：',
        options: ['money', 'luck', 'patience', 'space'],
        answer: 'C',
        explanation:
          '全文讲的是「耐心教，老人就能学会」，故用 patience。small screen（小屏幕）与 a little 搭配，强调需要的是耐心而不是钱、运气或空间。',
        difficulty: 2,
        tags: ['完形填空', '名词辨析', '主旨呼应'],
      },

      /* ---------------- 语言知识运用 第二节：语法选择（10 小题 10 分） ---------------- */
      {
        id: 'eng-paper-02-q11',
        type: 'choice',
        stem:
          '语法选择：从各题所给的 A、B、C、D 四个选项中选出最佳选项，使句子完整、通顺。\n\nIf it (11) ____ tomorrow, we will visit the science museum instead of the park.',
        options: ['is raining', 'rained', 'will rain', 'rains'],
        answer: 'D',
        explanation:
          'if 引导的条件状语从句中，主句用一般将来时，从句要用一般现在时表示将来（主将从现），故用 rains。',
        difficulty: 2,
        tags: ['语法选择', '条件状语从句', '主将从现'],
      },
      {
        id: 'eng-paper-02-q12',
        type: 'choice',
        stem:
          'A lot of rubbish (12) ____ every day in our city, so we should use fewer plastic bags.',
        options: ['is thrown away', 'throws away', 'has thrown away', 'is throwing away'],
        answer: 'A',
        explanation:
          'rubbish 是被丢弃的对象，与 throw away 是被动关系，且 every day 表示一般现在时，故用 is thrown away。',
        difficulty: 2,
        tags: ['语法选择', '被动语态', '一般现在时'],
      },
      {
        id: 'eng-paper-02-q13',
        type: 'choice',
        stem: 'My father has (13) ____ in this hospital since 2015.',
        options: ['work', 'worked', 'working', 'works'],
        answer: 'B',
        explanation:
          'since 2015 与现在完成时连用，构成 has worked（一直工作），表示从 2015 年持续到现在。has 后不能接动词原形或 -ing 形式。',
        difficulty: 1,
        tags: ['语法选择', '现在完成时', 'since'],
      },
      {
        id: 'eng-paper-02-q14',
        type: 'choice',
        stem: 'You look tired. (14) ____ go to bed earlier tonight?',
        options: ['Why not you', 'Why you do not', "Why don't you", 'Why do you'],
        answer: 'C',
        explanation:
          '提建议用 Why don\'t you do sth?（为什么不做……呢？）或 Why not do sth?。其余三项语序或结构错误。',
        difficulty: 1,
        tags: ['语法选择', '提建议句型', '语序'],
      },
      {
        id: 'eng-paper-02-q15',
        type: 'choice',
        stem: 'The water in this lake is much (15) ____ than it was ten years ago.',
        options: ['clean', 'cleanest', 'more cleaner', 'cleaner'],
        answer: 'D',
        explanation:
          'than 提示比较级，clean 是单音节形容词，比较级为 cleaner；much 用来修饰比较级表示程度。more cleaner 双重比较，属典型错误。',
        difficulty: 1,
        tags: ['语法选择', '比较级', '形容词'],
      },
      {
        id: 'eng-paper-02-q16',
        type: 'choice',
        stem: 'Remember (16) ____ the lights when you leave the classroom.',
        options: ['to turn off', 'turning off', 'turn off', 'turned off'],
        answer: 'A',
        explanation:
          'remember to do sth 表示「记得去做某事」（事情还没做），remember doing sth 表示「记得做过某事」。此处指离开时要做的事，用 to turn off。',
        difficulty: 2,
        tags: ['语法选择', '非谓语动词', 'remember 用法'],
      },
      {
        id: 'eng-paper-02-q17',
        type: 'choice',
        stem: 'We should not use too many plastic bags (17) ____ they are bad for the environment.',
        options: ['so', 'because', 'and', 'or'],
        answer: 'B',
        explanation:
          '后半句是前半句的原因，用 because 引导原因状语从句。so 引导结果，语意相反；and、or 不能表示因果关系。',
        difficulty: 1,
        tags: ['语法选择', '原因状语从句', '连词'],
      },
      {
        id: 'eng-paper-02-q18',
        type: 'choice',
        stem:
          'The doctor said that (18) ____ important to drink more water and take more exercise every day.',
        options: ['that is', 'this is', 'it is', 'there is'],
        answer: 'C',
        explanation:
          'It is important to do sth 中 it 是形式主语，真正的主语是后面的不定式，故用 it is。that、this 不能充当形式主语。',
        difficulty: 3,
        tags: ['语法选择', '形式主语 it', '宾语从句'],
      },
      {
        id: 'eng-paper-02-q19',
        type: 'choice',
        stem: "It is the third time that our class (19) ____ the school's paper-recycling programme.",
        options: ['joins', 'joined', 'is joining', 'has joined'],
        answer: 'D',
        explanation:
          'It is the first/second/third time that ... 句型中，that 从句要用现在完成时，故用 has joined。这是中考高频的固定句式。',
        difficulty: 3,
        tags: ['语法选择', '固定句式', '现在完成时'],
      },
      {
        id: 'eng-paper-02-q20',
        type: 'choice',
        stem: '— How long have you had this smart watch?\n— (20) ____ last summer.',
        options: ['Since', 'For', 'In', 'About'],
        answer: 'A',
        explanation:
          '答句中 last summer 是一个时间点，与现在完成时连用要用 since（自从）；for 后接时间段（如 for a year），in 用于过去时间点，不能与现在完成时这样搭配。',
        difficulty: 2,
        tags: ['语法选择', 'since 与 for', '现在完成时'],
      },

      /* ---------------- 阅读 第一节：短文理解（15 小题 30 分） ---------------- */
      {
        id: 'eng-paper-02-q21',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'A Week Without Screens\n\n' +
          'Last month, our teacher gave Class 8B a strange challenge: spend seven days without screens. No phones, no tablets, no computer games. We could still use the computer for homework if our parents watched us.\n\n' +
          'On the first evening I felt terrible. I kept touching my pocket, and my homework took twice as long as usual, because I stopped every few minutes to look for messages. At nine o\'clock I found myself standing in front of the fridge with nothing to do. So I called my cousin, and we talked for nearly an hour — the longest talk we had had for years.\n\n' +
          'By the third day, things got easier. I finished my homework before dinner and went out to play badminton with my neighbour. My father taught me to make dumplings, which was messy but fun. I also finished a paper book, the first one this year.\n\n' +
          'On Sunday night, the seven days were over. I did not rush to my phone as I had expected. I picked it up at eight o\'clock the next morning and found only forty-two messages — most of them from group chats. Nobody had really needed me at all.\n\n' +
          'The challenge did not make me give up my phone. It made me understand something better: a screen is a tool, and I should decide when to use it.\n\n' +
          '21. What was the challenge given to Class 8B?',
        options: [
          'To do more homework without using computers.',
          'To spend seven days without using screens.',
          'To write a report about computer games.',
          'To talk with their parents for an hour a day.',
        ],
        answer: 'B',
        explanation:
          '第一段说老师给 8B 班一个「奇怪的挑战」：七天不用屏幕（手机、平板、电脑游戏），故选 B。A 与原文相反（做作业时可在父母监督下用电脑）；C、D 都不是挑战内容。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '记叙文'],
      },
      {
        id: 'eng-paper-02-q22',
        type: 'choice',
        stem: '（据上文短文 A Week Without Screens）22. Why did the writer\'s homework take twice as long on the first evening?',
        options: [
          'The homework was much harder than usual.',
          'He had left his books at school that day.',
          'He stopped every few minutes to look for messages.',
          'He was helping his cousin with her homework.',
        ],
        answer: 'C',
        explanation:
          '第二段明确说明原因：他每隔几分钟就停下来看有没有消息，所以作业花了平时两倍的时间，故选 C。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '因果关系'],
      },
      {
        id: 'eng-paper-02-q23',
        type: 'choice',
        stem: '（据上文短文 A Week Without Screens）23. What did the writer do during the week?',
        options: [
          'He played computer games at his neighbour\'s home.',
          'He bought a new paper book online.',
          'He studied English with his cousin every evening.',
          'He learned to make dumplings with his father.',
        ],
        answer: 'D',
        explanation:
          '第三段说他爸爸教他包饺子（messy but fun），故选 D。他完成了一本书，但文中没说是在网上买的（B 错）；cousin 只出现一次电话（C 错）；这一周不能玩电脑游戏（A 错）。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '记叙文'],
      },
      {
        id: 'eng-paper-02-q24',
        type: 'choice',
        stem: '（据上文短文 A Week Without Screens）24. What did the writer find on his phone on Monday morning?',
        options: [
          'Only forty-two messages, most of which were not important.',
          'Hundreds of messages from his teachers.',
          'No messages at all from anyone.',
          'Messages from his cousin asking for help.',
        ],
        answer: 'A',
        explanation:
          '第四段说早上八点拿起手机只看到 42 条消息，且大多来自群聊（并不重要），故选 A。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '数字信息'],
      },
      {
        id: 'eng-paper-02-q25',
        type: 'choice',
        stem: '（据上文短文 A Week Without Screens）25. What does the writer want to tell us?',
        options: [
          'Screens should be given up completely.',
          'Screens are tools and we should decide when to use them.',
          'Students should never join group chats.',
          'Homework is always easier without a phone.',
        ],
        answer: 'B',
        explanation:
          '末段点明主旨：这次挑战并没有让他放弃手机，而是让他明白「屏幕是工具，应当由自己决定什么时候用」，故选 B。A 与原文相反；C、D 说法绝对，文中也没有这样说。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '作者观点'],
      },
      {
        id: 'eng-paper-02-q26',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Where Does Your Rubbish Go?\n\n' +
          'Every day, the average person in a Chinese city produces about one kilogram of rubbish. Have you ever wondered where it all goes?\n\n' +
          'In many cities, the journey starts in a bin with two or three colours. Paper, glass, metal and plastic go into one bin; food waste goes into another; everything else goes into a third. If people put things in the wrong bin, the whole bag may have to be sorted again by workers — a slow and expensive job.\n\n' +
          'Next, the rubbish is taken to a sorting centre. There, machines and workers separate useful materials. Plastic bottles are washed, cut into small pieces and turned into new bottles, clothes or even park benches. Food waste can become fertilizer for farms and gardens. Metals are melted and used again.\n\n' +
          'The rest is burned or buried. Burning can produce electricity, but it also produces smoke, so modern plants have to clean the smoke carefully. Burying rubbish takes up land, and that land cannot be used for many years.\n\n' +
          "Nothing is free. Sorting rubbish at home takes only a few seconds, but it saves hours of work later and keeps useful materials in use. As one worker at the centre said, 'The best rubbish is the rubbish we never produce.'\n\n" +
          '26. What is the passage mainly about?',
        options: [
          'How to burn rubbish to produce electricity.',
          'Why cities produce too much food waste.',
          'What happens to rubbish after we throw it away.',
          'How to build a modern sorting centre.',
        ],
        answer: 'C',
        explanation:
          '全文按「投放—分类运输—分拣利用—焚烧或填埋」讲述垃圾被丢掉之后去哪儿了，故选 C。A、B、D 都只是文中某一小部分内容。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '环保说明文'],
      },
      {
        id: 'eng-paper-02-q27',
        type: 'choice',
        stem: '（据上文短文 Where Does Your Rubbish Go?）27. Why is it a problem if people put things in the wrong bin?',
        options: [
          'The rubbish will be sent back to their homes.',
          'All the machines in the centre will stop working.',
          'Workers will refuse to collect the rubbish.',
          'The whole bag may have to be sorted again, which is slow and expensive.',
        ],
        answer: 'D',
        explanation:
          '第二段说：如果投错桶，整袋垃圾可能得由工人重新分拣，既慢又贵，故选 D。A、B、C 在文中都没有依据。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '因果关系'],
      },
      {
        id: 'eng-paper-02-q28',
        type: 'choice',
        stem: '（据上文短文 Where Does Your Rubbish Go?）28. What can food waste become?',
        options: [
          'Fertilizer for farms and gardens.',
          'New plastic bottles and clothes.',
          'Park benches in the city.',
          'Nothing useful at all.',
        ],
        answer: 'A',
        explanation:
          '第三段说 Food waste can become fertilizer for farms and gardens，故选 A。塑料瓶才会变成新瓶子、衣服甚至公园长椅（B、C 对应的是塑料），D 与文意相反。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '信息对应'],
      },
      {
        id: 'eng-paper-02-q29',
        type: 'choice',
        stem: '（据上文短文 Where Does Your Rubbish Go?）29. What does the writer say about burying rubbish?',
        options: [
          'It is the cheapest way to deal with rubbish.',
          'It takes up land that cannot be used for many years.',
          'It produces clean energy for the whole city.',
          'It is no longer used in Chinese cities.',
        ],
        answer: 'B',
        explanation:
          '第四段说填埋会占用土地，而这些土地很多年都不能再用，故选 B。产生电能的是焚烧而不是填埋（C 错）；A、D 文中没有提到。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '环保说明文'],
      },
      {
        id: 'eng-paper-02-q30',
        type: 'choice',
        stem:
          "（据上文短文 Where Does Your Rubbish Go?）30. What does the worker's words 'The best rubbish is the rubbish we never produce' mean?",
        options: [
          'Workers prefer to collect less rubbish.',
          'Rubbish should be burned as soon as possible.',
          'Producing less rubbish is better than dealing with it.',
          'We should never buy anything in bottles.',
        ],
        answer: 'C',
        explanation:
          '这句话的意思是「最好的垃圾是不产生的垃圾」，即减少产生比事后处理更重要，故选 C。它并不是说工人偷懒（A）、要多烧垃圾（B）或不买瓶装东西（D 过于绝对）。',
        difficulty: 3,
        tags: ['阅读理解', '句意理解', '环保理念'],
      },
      {
        id: 'eng-paper-02-q31',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Should Students Use AI to Do Their Homework?\n\n' +
          'A new app can now write a book report, solve a maths problem and even correct your English essay. Not surprisingly, some students love it: homework that used to take an hour can be finished in ten minutes. Teachers, however, are not so sure.\n\n' +
          'Supporters say that AI is simply a new kind of tool, like a calculator or a dictionary. Nobody says a student is cheating when he uses a calculator to check a difficult sum. If AI can explain why a maths answer is wrong, it may even teach better than a tired teacher at nine o\'clock in the evening. Used in the right way, it saves time for things that matter more, such as reading and sports.\n\n' +
          'Critics point out that learning and finishing are two different things. A student who copies an AI-written essay learns nothing except how to copy. Worse, AI sometimes gives wrong information with great confidence, and a student who has not learned the subject cannot tell the difference.\n\n' +
          'Perhaps the rule should be simple: AI can help you understand, but it should not do the work for you. Before you use it, ask yourself a question — after this, can I explain the answer to someone else? If not, the homework has not been done yet, whatever the paper says.\n\n' +
          '31. What is the passage mainly about?',
        options: [
          'How to write a book report with a new app.',
          'Why teachers give students too much homework.',
          'How a maths problem is solved by a computer.',
          'Whether students should use AI to do their homework.',
        ],
        answer: 'D',
        explanation:
          '文章先摆出支持与反对两种看法，最后给出「AI 可以帮你理解，但不应替你完成」的判断，讨论的正是「学生该不该用 AI 做作业」，故选 D。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '议论文'],
      },
      {
        id: 'eng-paper-02-q32',
        type: 'choice',
        stem: '（据上文短文 Should Students Use AI to Do Their Homework?）32. What do supporters compare AI to?',
        options: [
          'A tool like a calculator or a dictionary.',
          'A teacher who never makes any mistakes.',
          'A game that students play after school.',
          'A book that contains all the correct answers.',
        ],
        answer: 'A',
        explanation:
          '第二段说支持者认为 AI 只是「一种新工具，像计算器或词典一样」，故选 A。文中还提到 AI 有时会给出错误信息，故 B 错。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '比喻理解'],
      },
      {
        id: 'eng-paper-02-q33',
        type: 'choice',
        stem: '（据上文短文 Should Students Use AI to Do Their Homework?）33. What do the critics worry about?',
        options: [
          'AI takes too much time for students to use.',
          'Students may copy without learning, and AI may give wrong information.',
          'AI can only help students with English essays.',
          'AI makes homework more expensive than before.',
        ],
        answer: 'B',
        explanation:
          '第三段提出两点担心：抄 AI 写的作文学不到东西，以及 AI 常以极大自信给出错误信息而学生无法辨别，故选 B。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '观点归纳'],
      },
      {
        id: 'eng-paper-02-q34',
        type: 'choice',
        stem:
          '（据上文短文 Should Students Use AI to Do Their Homework?）34. What does the writer suggest students ask themselves before using AI?',
        options: [
          'How much does this app cost?',
          'Did my teacher also use AI to prepare the lesson?',
          'After this, can I explain the answer to someone else?',
          'Is this homework interesting enough for me?',
        ],
        answer: 'C',
        explanation:
          '末段提出自问：「这之后，我能把答案讲给别人听吗？」能讲明白才算真正做完作业，故选 C。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '作者建议'],
      },
      {
        id: 'eng-paper-02-q35',
        type: 'choice',
        stem:
          '（据上文短文 Should Students Use AI to Do Their Homework?）35. What does the last sentence mean: "the homework has not been done yet, whatever the paper says"?',
        options: [
          'The homework paper is too short to hand in.',
          'The teacher will not accept the paper at all.',
          'The paper must be written by hand, not by a computer.',
          'Copying an answer without understanding does not count as doing the homework.',
        ],
        answer: 'D',
        explanation:
          '这句话是说：如果不理解、讲不出答案，即使纸上写满了也不等于做完了作业，故选 D。文中讨论的不是纸张长短、老师收不收或手写与否。',
        difficulty: 3,
        tags: ['阅读理解', '句意理解', '深层含义'],
      },

      /* ---------------- 阅读 第二节：多模态短文（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-02-q36',
        type: 'choice',
        stem:
          '阅读下面的通知与分类说明，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Green Club Notice — Recycling at Sunshine Middle School\n\n' +
          'From this term, there are three bins in every classroom: a blue bin for paper and card, a yellow bin for bottles and cans, and a green bin for food waste. Batteries and old pens must not go into any of these. Please bring them to the Green Club room on Friday afternoons.\n\n' +
          'Which bin? paper and card → blue | plastic bottles, drink cans, glass → yellow | fruit, bread, rice → green\n\n' +
          'Water-saving Challenge: Last term, 240 students joined and the school saved 310 tonnes of water. This term we hope to reach 400 students. Sign your name on the poster outside the school hall before next Friday. The class that saves the most water will win a free trip to the city water plant.\n\n' +
          '36. Where should a student put an empty drink can?',
        options: ['In the yellow bin.', 'In the blue bin.', 'In the green bin.', 'In the Green Club room.'],
        answer: 'A',
        explanation:
          '分类说明写明 drink cans（饮料罐）属于 yellow bin（黄桶），故选 A。蓝桶放纸和纸板，绿桶放食物垃圾，Green Club room 只收电池与旧笔。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '信息匹配'],
      },
      {
        id: 'eng-paper-02-q37',
        type: 'choice',
        stem: '（据上文 Green Club 通知）37. What should students do with old batteries?',
        options: [
          'Put them in the blue bin with paper.',
          'Bring them to the Green Club room on Friday afternoons.',
          'Throw them into the green bin with food waste.',
          'Keep them at home until the end of the term.',
        ],
        answer: 'B',
        explanation:
          '通知明确说电池与旧笔不能放进任何一类垃圾桶，请在周五下午送到 Green Club 活动室，故选 B。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '细节理解'],
      },
      {
        id: 'eng-paper-02-q38',
        type: 'choice',
        stem: '（据上文 Green Club 通知）38. What is the goal of this term\'s Water-saving Challenge?',
        options: [
          'To save 240 tonnes of water.',
          'To build a new water plant in the city.',
          'To reach 400 students taking part.',
          'To give every class a free trip.',
        ],
        answer: 'C',
        explanation:
          '通知说上学期有 240 名学生参加、节水 310 吨，这学期希望达到 400 名学生参加，故选 C。240 是上学期参加人数（A 是干扰），免费参观只有节水最多的班级获得（D 错）。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '数字辨析'],
      },
      {
        id: 'eng-paper-02-q39',
        type: 'choice',
        stem: '（据上文 Green Club 通知）39. How will the winning class be decided?',
        options: [
          'By the number of bins in the classroom.',
          'By the number of names on the poster.',
          'By the amount of food waste collected.',
          'By the amount of water the class saves.',
        ],
        answer: 'D',
        explanation:
          '通知最后一句说 The class that saves the most water will win，即按节约用水量决定，故选 D。签名只是报名方式，不是评奖依据。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '条件理解'],
      },
      {
        id: 'eng-paper-02-q40',
        type: 'choice',
        stem: '（据上文 Green Club 通知）40. Which of the following is TRUE?',
        options: [
          'The green bin is for food waste such as fruit and rice.',
          'Glass bottles should be put into the blue bin.',
          'Students should sign their names in the school hall.',
          'Every class will win a free trip to the water plant.',
        ],
        answer: 'A',
        explanation:
          '绿桶放 fruit、bread、rice 等食物垃圾，A 正确。玻璃瓶应放黄桶（B 错）；签名写在「学校礼堂外的海报上」，不是在礼堂里面（C 错）；只有节水最多的班级获得免费参观（D 错）。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '综合判断'],
      },

      /* ---------------- 项目情境第一节：项目语篇（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-02-q41',
        type: 'choice',
        stem:
          '阅读下面的项目活动报告，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Report: Our Plastic-Free Month — by the Green Club\n\n' +
          'In March, our club asked the whole school to join a Plastic-Free Month. The rule was simple: for thirty days, try not to use single-use plastic — no plastic bags, no plastic cups, no plastic bottles.\n\n' +
          'Before we started, we weighed the rubbish from the school canteen for one week. On average, the canteen threw away twelve kilograms of plastic every day. Most of it was cups and food boxes.\n\n' +
          "During the month, we did three things. First, we put a poster beside every bin. Second, we asked the canteen to sell drinks in paper cups. Third, we started a 'bring your own bottle' corner, where students could fill their bottles with cold water for free.\n\n" +
          'The result was better than we had expected. Plastic rubbish from the canteen fell to four kilograms a day. Nearly three hundred students brought their own bottles, and the water corner was so popular that we had to open a second one.\n\n' +
          'There were problems, too. Some students forgot their bottles after two weeks, and paper cups are not free. Next term we plan to sell reusable bottles with the school name on them, so that fewer students forget.\n\n' +
          'One month of small changes cannot save the sea. But when six hundred students change one habit, the habit may last a lifetime.\n\n' +
          '41. What was the rule of the Plastic-Free Month?',
        options: [
          'To eat no food from the school canteen.',
          'To try not to use single-use plastic for thirty days.',
          'To bring paper cups to school every day.',
          'To weigh the school rubbish once a week.',
        ],
        answer: 'B',
        explanation:
          '报告第一段说明规则：三十天内尽量不使用一次性塑料（塑料袋、塑料杯、塑料瓶），故选 B。称重是项目开始前的调查（D 是调查做法，不是规则）；报告只建议食堂用纸杯，并未要求学生带纸杯（C 错）。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '环保项目'],
      },
      {
        id: 'eng-paper-02-q42',
        type: 'choice',
        stem: '（据上文项目报告 Our Plastic-Free Month）42. How much plastic did the canteen throw away every day before the project?',
        options: ['Four kilograms.', 'Six kilograms.', 'Twelve kilograms.', 'Thirty kilograms.'],
        answer: 'C',
        explanation:
          '第二段说项目开始前食堂平均每天扔掉 12 公斤塑料，故选 C。4 公斤是活动后的数字，属干扰项。',
        difficulty: 1,
        tags: ['项目情境', '数据理解', '前后对比'],
      },
      {
        id: 'eng-paper-02-q43',
        type: 'choice',
        stem: '（据上文项目报告 Our Plastic-Free Month）43. What happened to the water corner?',
        options: [
          'It was closed after two weeks.',
          'It was moved to the school gate.',
          'It sold drinks in paper cups.',
          'It was so popular that a second one was opened.',
        ],
        answer: 'D',
        explanation:
          '第四段说免费打水角太受欢迎，只好再开一个，故选 D。忘记带水瓶的是学生，不是打水角关闭（A 错）。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '结果分析'],
      },
      {
        id: 'eng-paper-02-q44',
        type: 'choice',
        stem: '（据上文项目报告 Our Plastic-Free Month）44. What problem did the club meet during the month?',
        options: [
          'Some students forgot their bottles, and paper cups cost money.',
          'The canteen refused to join the project.',
          'The posters beside the bins were taken away.',
          'Nobody was willing to bring their own bottles.',
        ],
        answer: 'A',
        explanation:
          '第五段列出两个问题：两周后有学生忘记带水瓶，纸杯也不是免费的，故选 A。食堂配合卖纸杯、近三百名学生自带水瓶，可见 B、D 与原文相反；海报被拿走文中未提（C 错）。',
        difficulty: 2,
        tags: ['项目情境', '细节理解', '问题归纳'],
      },
      {
        id: 'eng-paper-02-q45',
        type: 'choice',
        stem: '（据上文项目报告 Our Plastic-Free Month）45. What is the writer\'s opinion in the last paragraph?',
        options: [
          'One month is enough to save the sea.',
          'Small changes made by many students can become lasting habits.',
          'The project failed because of the problems above.',
          'Students should stop buying drinks at school.',
        ],
        answer: 'B',
        explanation:
          '末段说「一个月的小改变救不了大海，但当六百名学生改变一个习惯，这个习惯可能陪伴一生」，即众人的小改变能成为持久习惯，故选 B。',
        difficulty: 2,
        tags: ['项目情境', '作者态度', '主旨理解'],
      },

      /* ---------------- 项目情境第二节：简答题（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-02-q46',
        type: 'short',
        stem:
          '阅读下面的调查结果与学校通知，然后回答问题（每小题 2 分，请用完整句子作答）。\n\n' +
          'Sleep and Exercise Survey (300 students in Grade 9)\n' +
          'Hours of sleep a night: less than 6 — 54; 6 to 7 — 132; 7 to 8 — 96; more than 8 — 18\n' +
          'How often they exercise: every day — 87; three or four times a week — 121; once a week — 62; never — 30\n' +
          'Reason for not exercising: no time — 143; no place — 68; no interest — 52; other reasons — 37\n\n' +
          "Notice: Next month is Health Month. Our school gym will open at 7:00 a.m., half an hour earlier than before, and the Sports Club will hold a 'Run Before Breakfast' activity every Tuesday and Thursday. Students who join ten times will receive a free T-shirt.\n\n" +
          '46. How many students in Grade 9 sleep less than six hours a night?',
        answer: 'Fifty-four (54) students in Grade 9 sleep less than six hours a night.',
        rubric: [
          '答出人数 54',
          '明确对象是「每晚睡眠不足六小时」的学生',
          '用完整句子作答，数字表达正确（写作 fifty-four 或 54 均可）',
        ],
        explanation:
          '表格第一行 less than 6 对应 54 人。作答时注意问的是人数，不要错抄成 6 或 132。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-02-q47',
        type: 'short',
        stem: '（材料见第 46 题）47. What is the most common reason for not exercising, and how many students gave it?',
        answer: 'The most common reason is having no time, and one hundred and forty-three (143) students gave it.',
        rubric: [
          '答出原因 no time（没有时间）',
          '答出人数 143',
          '句子结构完整，原因与人数都答到',
        ],
        explanation:
          'Reason for not exercising 一栏中 no time 人数最多（143 人），故为最常见原因。注意与「锻炼频率」那一栏区分开。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-02-q48',
        type: 'short',
        stem:
          '（材料见第 46 题）48. Most Grade 9 students sleep only six to seven hours a night. Is that enough for a middle school student? Why? Give two points.',
        answer:
          'No, it is not enough. Doctors suggest that middle school students should sleep about nine hours a night, and students who sleep too little find it hard to concentrate in class and may get ill more easily.',
        rubric: [
          '明确回答 No（不够）',
          '答出中学生每天应睡九小时左右这一常识性依据',
          '答出睡眠不足的影响（上课注意力不集中、容易生病、影响长身体等，答一点即可）',
        ],
        explanation:
          '这是一道「表态 + 说理」的简答题：先否定，再给出依据（中学生每天宜睡 9 小时左右）与影响（注意力、健康、长身体），两点评分点都要写到。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '健康常识', '表达观点'],
      },
      {
        id: 'eng-paper-02-q49',
        type: 'short',
        stem:
          '（材料见第 46 题）49. The school gym will open at 7:00 a.m. from next month. How can this help the students who say they have no time to exercise?',
        answer:
          'It can help them a lot. They can exercise before their morning classes instead of finding time after school. The gym opens half an hour earlier than before, and they can also join the Run Before Breakfast activity on Tuesdays and Thursdays.',
        rubric: [
          '答出「早上课前锻炼」可以解决「放学后没时间」的问题',
          '答出依据（体育馆提前半小时、7:00 开门；或周二、周四有晨跑活动）',
          '句子完整、逻辑与调查结果对应',
        ],
        explanation:
          '调查显示「没有时间」是最主要原因，而体育馆提前到 7 点开门、周二周四有晨跑，正是把锻炼时间挪到上课前，故对这类学生有帮助。答题要写清「怎么解决」而不只是抄通知。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '信息整合'],
      },
      {
        id: 'eng-paper-02-q50',
        type: 'short',
        stem:
          '（材料见第 46 题）50. Thirty students say they never exercise. Write one suggestion to help them start.',
        answer:
          'They can start with something easy and short, such as walking or running for ten minutes with a friend after school, and then join the Run Before Breakfast activity once a week.',
        rubric: [
          '提出一条具体可行的建议（从少量、简单的运动开始，或与同学结伴、参加学校的晨跑活动等）',
          '建议针对「从不运动」的学生，体现「由易到难、容易坚持」',
          '语言清楚、句子完整（用 can / should / why not 等给出建议均可）',
        ],
        explanation:
          '对从不运动的学生，建议要「门槛低、能坚持」：从十分钟的快走或慢跑开始、找同伴一起、参加学校晨跑。只写 Exercise is good for you 这类空话不得分。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '开放性表达'],
      },

      /* ---------------- 写作 第一节：单词拼写（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-02-q51',
        type: 'fill',
        stem:
          '根据下列句子及所给的首字母提示，写出单词的适当形式，使句子完整、通顺。\n\n51. Air p____ has become a serious problem in many big cities.',
        answer: 'pollution',
        explanation:
          '「空气污染」是 air pollution，pollute 是动词，这里需要用名词 pollution 作主语。注意词尾是 -tion。',
        difficulty: 2,
        tags: ['单词拼写', '词性转换', '环保'],
      },
      {
        id: 'eng-paper-02-q52',
        type: 'fill',
        stem: '52. Remember to r____ the bottles and paper so that they can be used again.',
        answer: 'recycle',
        explanation:
          '由「以便再次使用」可知是「回收」recycle。remember to do sth 后接动词原形 recycle。',
        difficulty: 1,
        tags: ['单词拼写', '环保', '动词'],
      },
      {
        id: 'eng-paper-02-q53',
        type: 'fill',
        stem: '53. Eating too much sugar is bad for your h____.',
        answer: 'health',
        explanation:
          '「对健康有害」是 be bad for your health，此处要用名词 health；healthy 是形容词，不能作介词 for 的宾语。',
        difficulty: 2,
        tags: ['单词拼写', '词性转换', '健康'],
      },
      {
        id: 'eng-paper-02-q54',
        type: 'fill',
        stem:
          '54. 根据句意及括号内的中文提示写出单词：Washing our hands often can ____（防止）many illnesses.',
        answer: 'prevent',
        explanation:
          'can 后接动词原形，故填 prevent（预防、防止）。prevent sth 表示「预防某事」，与 illnesses 搭配自然。',
        difficulty: 2,
        tags: ['单词拼写', '动词', '健康'],
      },
      {
        id: 'eng-paper-02-q55',
        type: 'fill',
        stem:
          '55. 根据句意及括号内的中文提示写出单词：We should ____（保护）the wild animals in the forest.',
        answer: 'protect',
        explanation:
          'should 后接动词原形，故填 protect（保护）。注意与 project（项目）拼写区分，不要写错。',
        difficulty: 1,
        tags: ['单词拼写', '动词', '易混拼写'],
      },

      /* ---------------- 写作 第二节：完成句子（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-02-q56',
        type: 'fill',
        stem:
          '根据所给的中文，在横线上填入合适的词语，使英文句子完整、通顺。\n\n56. 我妹妹加入环保俱乐部已经三个月了。\nMy sister ____ the Green Club for three months.',
        answer: 'has been in|has been a member of',
        explanation:
          'for three months 是一段时间，must 用延续性动词：be in / be a member of。join 是瞬间动词，不能与 for 引导的一段时间连用，故不能填 has joined。',
        difficulty: 3,
        tags: ['完成句子', '现在完成时', '延续性动词'],
      },
      {
        id: 'eng-paper-02-q57',
        type: 'fill',
        stem: '57. 这些纸箱被用来做椅子。\nThese paper boxes ____ chairs.',
        answer: 'are used to make|are made into',
        explanation:
          'be used to do sth 表示「被用来做某事」，故填 are used to make；也可用 be made into（被做成）表达，即 are made into chairs。注意 used 后是 to make（不定式），不是 making。',
        difficulty: 3,
        tags: ['完成句子', '被动语态', 'be used to 辨析'],
      },
      {
        id: 'eng-paper-02-q58',
        type: 'fill',
        stem:
          '58. 如果明天不下雨，我们将去公园捡垃圾。\nIf it ____ tomorrow, we will pick up rubbish in the park.',
        answer: "doesn't rain|does not rain",
        explanation:
          'if 条件状语从句中「主将从现」：主句用 will pick up，从句用一般现在时；it 是第三人称单数，故填 doesn\'t rain。',
        difficulty: 2,
        tags: ['完成句子', '条件状语从句', '主将从现'],
      },
      {
        id: 'eng-paper-02-q59',
        type: 'fill',
        stem: '59. 你每天花多长时间锻炼？\n____ does it take you to exercise every day?',
        answer: 'How long',
        explanation:
          '问「多长时间」用 How long；句型是 It takes sb some time to do sth，所以划线部分是 How long does it take you ...。How often 问频率，How soon 问「多久以后」。',
        difficulty: 2,
        tags: ['完成句子', '疑问词', 'It takes 句型'],
      },
      {
        id: 'eng-paper-02-q60',
        type: 'fill',
        stem:
          '60. 我认为保护环境是我们的责任。\nI think ____ our duty to protect the environment.',
        answer: 'it is',
        explanation:
          'think 后的宾语从句用 it 作形式主语，真正的主语是后面的不定式 to protect the environment，故填 it is。',
        difficulty: 3,
        tags: ['完成句子', '形式主语 it', '宾语从句'],
      },
    ],

    /* ------------------------------ 写作第三节 ------------------------------ */
    writing: {
      topic:
        '你校英文报正在开展「Less Plastic, Better Life（少用塑料，生活更好）」征文活动。请你写一篇短文投稿，内容包括：（1）塑料垃圾给环境带来的问题（至少一点）；（2）你在日常生活中减少使用塑料的两三个做法；（3）你的呼吁。请自拟标题。',
      requirements: [
        '短文须包含上面三个要点，可以适当发挥，但不要逐条翻译要点。',
        '正文 80—120 词（标题不计入词数）。',
        '至少使用一处复合句（because / if / when 等），至少两处连接词（first / second / also 等）。',
        '文中不得出现真实姓名、校名等个人信息；书写规范，标点与大小写正确。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Less Plastic, Better Life\n\n' +
            'Plastic is everywhere in our life. It is cheap and useful, but it also brings a big problem: plastic bags and bottles can stay in the sea for hundreds of years, and sea animals may eat them and get ill.\n\n' +
            'In my family, we have made three changes. First, we take cloth bags when we go shopping. Second, I carry a water bottle to school instead of buying drinks in plastic bottles. Third, we keep food in boxes rather than in plastic wrap.\n\n' +
            'These changes are easy and cost almost nothing. If every student in our school does the same, the rubbish we produce will fall quickly. Let us start today, with one small choice.',
          cn:
            '少用塑料，生活更好\n\n' +
            '塑料在我们的生活中无处不在。它便宜又实用，但也带来一个大问题：塑料袋和塑料瓶会在海里留存数百年，海洋动物可能误食它们而生病。\n\n' +
            '在我家，我们做了三个改变。第一，购物时带布袋。第二，我自带水壶上学，不买瓶装饮料。第三，我们用盒子而不是保鲜膜存放食物。\n\n' +
            '这些改变不难，也几乎不花钱。如果我校每位同学都这样做，我们产生的垃圾会迅速减少。让我们从今天开始，做出一个小选择。',
          comment:
            '三个要点齐全、层次清楚：问题（塑料留存数百年、海洋动物误食）—做法（布袋、水壶、盒子三例）—呼吁，一段一个功能。语言上有三处明显的得分点：冒号后列举问题使论证具体；instead of buying / rather than in plastic wrap 用「替代」结构体现对比；结尾用 If every student ... does the same 的条件句把个人做法推向全体。句式长短搭配，与题目「至少一处复合句、两处连接词」的要求完全吻合。可再提升之处：可加一个具体数字（如 one family can use more than a thousand plastic bags a year）让问题更有冲击力。',
          highlights: [
            {
              sentence: 'It is cheap and useful, but it also brings a big problem: plastic bags and bottles can stay in the sea for hundreds of years, and sea animals may eat them and get ill.',
              why: '先承认塑料的优点再说问题，观点更公允；冒号后给出具体后果，避免空喊口号。',
            },
            {
              sentence: 'Second, I carry a water bottle to school instead of buying drinks in plastic bottles.',
              why: '用 instead of 把「做什么」和「不做什么」放在一起，做法一目了然，也自然增加句式变化。',
            },
            {
              sentence: 'If every student in our school does the same, the rubbish we produce will fall quickly.',
              why: '条件句 + 主将从现，把个人做法扩展到全校，呼吁显得有力；the rubbish we produce 用定语从句修饰，句式更加地道。',
            },
          ],
        },
        {
          level: '二类文（14—16 分）',
          text:
            'Less Plastic, Better Life\n\n' +
            'Plastic is very common in our life. We use plastic bags, bottles and boxes every day. But plastic is bad for the environment. It is hard to break down, and it makes the sea dirty.\n\n' +
            'So we should do something. In my home, my mother uses cloth bags when she buys food. I bring my own bottle to school. We also use glass boxes to keep food.\n\n' +
            'I think if everyone does a little, the world will be better. Let us protect our earth together.',
          cn:
            '少用塑料，生活更好\n\n' +
            '塑料在我们生活中很常见，我们每天用塑料袋、塑料瓶和塑料盒。但塑料对环境有害：它很难降解，还会把海弄脏。\n\n' +
            '所以我们应该做点什么。在我家，妈妈买食物时用布袋；我自带水瓶上学；我们也用玻璃盒保存食物。\n\n' +
            '我认为如果每个人都做一点，世界会更好。让我们一起保护地球。',
          comment:
            '要点齐全、语句基本正确、有标题，属于二类文（14—16 分）。扣分点主要有三处：一是语言过于平直，几乎全是「主谓宾」简单句，It is hard to break down 这类句子没有展开；二是「问题」只用了 bad / dirty 两个笼统的词，没有说明后果（如海洋动物误食）；三是做法写得像清单，缺少 First / Second 这类连接词与理由。升格办法：给每个做法补一句理由（I carry my own bottle so that I use fewer plastic ones.），并把结尾的空洞呼吁改为带条件句的具体呼吁。',
          highlights: [
            {
              sentence: 'It is hard to break down, and it makes the sea dirty.',
              why: '用两个并列的短句说明问题，是保证「要点得分」的稳妥写法，第二句还点出了具体对象（the sea）。',
            },
            {
              sentence: 'In my home, my mother uses cloth bags when she buys food.',
              why: '用 when 引导时间状语从句把做法写得具体，比单独一句 We use cloth bags 更有画面感。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'Plastic is everywhere in our daily life. —— 塑料在我们的日常生活中无处不在。',
        'It brings a big problem: ... —— 它带来一个大问题：……',
        'It is hard to break down, so it stays in the soil for years. —— 它很难降解，因此在土壤里留存多年。',
        'In my family, we have made some small changes. —— 在我家，我们做了一些小改变。',
        'I carry my own bottle instead of buying drinks in plastic bottles. —— 我自带水壶，不买瓶装饮料。',
        'We use boxes rather than plastic wrap to keep food. —— 我们用盒子而不是保鲜膜保存食物。',
        'These changes are easy, and they cost almost nothing. —— 这些改变不难，而且几乎不花钱。',
        'If everyone does a little, the rubbish we produce will fall quickly. —— 如果每个人都做一点，我们产生的垃圾就会迅速减少。',
        'Let us start today, with one small choice. —— 让我们从今天开始，做出一个小选择。',
      ],
    },

    /* ------------------------------ 听说材料（30 分另场） ------------------------------ */
    listening: [
      {
        title: '模仿朗读：Saving Water at Home（8 分）',
        text:
          'Water is everywhere, but clean water is not endless. In many parts of the world, people walk for hours just to carry a bucket of water home. In our city, water comes out of the tap whenever we turn it on, so it is easy to forget how precious it is.\n\n' +
          'Saving water at home is not difficult, though. Turn off the tap while you are brushing your teeth. Take a shorter shower — five minutes is enough. Wash vegetables in a bowl instead of under running water, and then use the water for your plants. If a tap drips, tell an adult at once: one dripping tap can waste more than twenty litres a day.\n\n' +
          'These are small habits, but they add up. My family saved six tonnes of water last year, and we did not feel uncomfortable at all.',
        cn:
          '水到处都是，但干净的水并非取之不尽。在世界许多地方，人们要走几个小时才能把一桶水背回家。在我们这座城市，一拧开水龙头就有水，所以很容易忘记水有多珍贵。\n\n' +
          '不过，在家里省水并不难：刷牙时关掉水龙头；洗澡时间短一点——五分钟就够了；用盆洗菜而不是开着水冲，洗完的水用来浇花。如果水龙头一直滴水，马上告诉大人：一个滴水的水龙头一天能浪费二十多升水。\n\n' +
          '这些都是小事，但积少成多。我家去年省了六吨水，而我们一点也没觉得不方便。',
        cues: [
          '重音：clean water、precious、dripping tap、six tonnes 等关键词要重读，突出「水很珍贵」这一中心。',
          '连读与弱读：comes out of the tap 中 comes out of 连读；whenever we turn it on 中 turn it on 连读成一体。',
          '语调：祈使句（Turn off the tap ... / Take a shorter shower ...）用降调，表示明确的要求；末句 and we did not feel uncomfortable at all 读得轻快、句末降调。',
          '停顿与节奏：三个祈使句之间停顿一致，不要越读越快；破折号前后稍停，读出补充说明的语气。',
        ],
        tasks: [
          {
            id: 'eng-paper-02-l1-t1',
            type: 'choice',
            stem: 'What does the speaker say about people in many parts of the world?',
            options: [
              'They walk for hours to carry water home.',
              'They have taps in every room of the house.',
              'They only drink bottled water.',
              'They never try to save water.',
            ],
            answer: 'A',
            explanation:
              '第一段说在世界许多地方，人们要走几个小时才能把一桶水背回家，故选 A。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '细节听取'],
          },
          {
            id: 'eng-paper-02-l1-t2',
            type: 'choice',
            stem: 'How long does the speaker say a shower should be?',
            options: ['Two minutes.', 'Five minutes.', 'Ten minutes.', 'Twenty minutes.'],
            answer: 'B',
            explanation:
              '第二段说 Take a shorter shower — five minutes is enough（五分钟就够了），故选 B。',
            difficulty: 1,
            tags: ['听说·模仿朗读', '数字信息'],
          },
          {
            id: 'eng-paper-02-l1-t3',
            type: 'choice',
            stem: 'How much water can a dripping tap waste in a day?',
            options: ['More than six litres.', 'About twenty litres.', 'More than fifty litres.', 'More than twenty litres.'],
            answer: 'D',
            explanation:
              '第二段末尾说 one dripping tap can waste more than twenty litres a day（一天浪费二十多升），故选 D。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '数字信息'],
          },
          {
            id: 'eng-paper-02-l1-t4',
            type: 'choice',
            stem: 'How much water did the speaker\'s family save last year?',
            options: [
              'Six tonnes.',
              'Sixteen tonnes.',
              'Sixty litres.',
              'Twenty litres.',
            ],
            answer: 'A',
            explanation:
              '末段说 My family saved six tonnes of water last year（去年省了六吨水），故选 A。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '数字信息'],
          },
        ],
      },
      {
        title: '信息获取：A Talk About the Run Before Breakfast Activity（14 分）',
        text:
          'Amy: Hi, Ben. You look great! Have you started running?\n' +
          'Ben: Yes. I joined the Run Before Breakfast activity. We meet at the school gate at seven every Tuesday and Thursday.\n' +
          'Amy: Seven in the morning? That is early! How far do you run?\n' +
          'Ben: About two kilometres. My smart watch shows that I sleep better now. I used to sleep only six hours a night.\n' +
          'Amy: Really? How many hours do you sleep now?\n' +
          'Ben: About seven and a half. And I feel awake in the first class.\n' +
          'Amy: I want to join, too. What should I bring?\n' +
          'Ben: Just sports shoes and a bottle of water. The club gives each new member a free T-shirt after ten runs.\n' +
          'Amy: Nice. Can I start this Thursday?\n' +
          'Ben: Sure. But you need to write your name on the list in the school office before Wednesday afternoon.\n' +
          'Amy: I will do it today. Thank you!',
        cn:
          'Amy：你好，Ben。你看起来状态很好！你开始跑步了吗？\n' +
          'Ben：是的。我参加了「早餐前跑一跑」活动。我们每周二、四早上七点在校门口集合。\n' +
          'Amy：早上七点？好早啊！你们跑多远？\n' +
          'Ben：大约两公里。我的智能手表显示我现在睡得更好了——我以前每晚只睡六个小时。\n' +
          'Amy：真的吗？你现在睡几个小时？\n' +
          'Ben：大约七个半小时，而且第一节课很清醒。\n' +
          'Amy：我也想参加。要带什么？\n' +
          'Ben：只要运动鞋和一瓶水。参加满十次，社团会送新成员一件免费 T 恤。\n' +
          'Amy：太好了。我周四能开始吗？\n' +
          'Ben：当然。但你得在周三下午之前把名字写到学校办公室的名单上。\n' +
          'Amy：我今天就去。谢谢！',
        cues: [
          '语调：一般疑问句（Have you started running? / Can I start this Thursday?）用升调；特殊疑问句（How far do you run?）用降调。',
          '重音：seven、two kilometres、seven and a half、ten runs 这些数字信息要重读，听力题常考这些地方。',
          '连读：What should I bring? 中 should I 连读；write your name on the list 中 name on 连读。',
          '弱读：at seven every Tuesday and Thursday 中 at、and 弱读，注意 and 在快速口语中读成 /ən/。',
        ],
        tasks: [
          {
            id: 'eng-paper-02-l2-t1',
            type: 'choice',
            stem: 'When does the Run Before Breakfast activity meet?',
            options: [
              'Every Monday and Wednesday.',
              'Every Tuesday and Thursday.',
              'Every Friday morning.',
              'Every day at seven.',
            ],
            answer: 'B',
            explanation:
              'Ben 说 We meet at the school gate at seven every Tuesday and Thursday，故选 B。注意区分 Tuesday 与 Thursday 的读音。',
            difficulty: 1,
            tags: ['听说·信息获取', '时间信息'],
          },
          {
            id: 'eng-paper-02-l2-t2',
            type: 'choice',
            stem: 'How far does Ben run each time?',
            options: [
              'About half a kilometre.',
              'About one kilometre.',
              'About two kilometres.',
              'About five kilometres.',
            ],
            answer: 'C',
            explanation:
              'Ben 说 About two kilometres，故选 C。',
            difficulty: 1,
            tags: ['听说·信息获取', '数字信息'],
          },
          {
            id: 'eng-paper-02-l2-t3',
            type: 'choice',
            stem: 'How many hours does Ben sleep now?',
            options: [
              'About seven and a half hours.',
              'About six hours.',
              'About eight hours.',
              'About nine hours.',
            ],
            answer: 'A',
            explanation:
              'Ben 现在每晚睡七个半小时左右，六个小时是他以前的睡眠时间，故选 A。',
            difficulty: 2,
            tags: ['听说·信息获取', '数字辨析'],
          },
          {
            id: 'eng-paper-02-l2-t4',
            type: 'choice',
            stem: 'What must Amy do before Wednesday afternoon?',
            options: [
              'Buy a T-shirt from the club.',
              'Bring a bottle of water to the school office.',
              'Write her name on the list in the school office.',
              'Run two kilometres by herself.',
            ],
            answer: 'C',
            explanation:
              'Ben 提醒她在周三下午之前把名字写到学校办公室的名单上，故选 C。运动鞋和水是参加活动时要带的，不是要去办公室交的东西（B 错）。',
            difficulty: 2,
            tags: ['听说·信息获取', '细节听取'],
          },
        ],
      },
      {
        title: '角色扮演：At the Doctor\'s（8 分）',
        text:
          'Doctor: Good morning. What is the trouble?\n' +
          'Boy: I have a headache and a sore throat. I have felt like this since Monday.\n' +
          'Doctor: Let me have a look. Open your mouth, please. Yes, your throat is red. Have you taken any medicine?\n' +
          'Boy: I took some pills my mother gave me, but they did not help.\n' +
          'Doctor: You have a bad cold. I will give you some medicine — take it three times a day after meals. Drink more warm water, and stay away from cold drinks.\n' +
          'Boy: Can I go to school tomorrow? We have a basketball match.\n' +
          'Doctor: I am afraid not. You need two days of rest at home. Go back to school when you have no fever.\n' +
          'Boy: All right. Thank you, doctor.',
        cn:
          '医生：早上好，哪里不舒服？\n' +
          '男孩：我头疼，嗓子疼。从星期一开始就这样了。\n' +
          '医生：我看看。请张开嘴——嗯，嗓子红了。吃过药吗？\n' +
          '男孩：我吃了妈妈给的药片，但没什么用。\n' +
          '医生：你得了重感冒。我给你开点药，一天三次，饭后吃。多喝温水，别喝冷饮。\n' +
          '男孩：我明天能上学吗？我们有篮球赛。\n' +
          '医生：恐怕不行。你需要在家休息两天，不发烧了再回学校。\n' +
          '男孩：好的。谢谢医生。',
        cues: [
          '语调：医生询问病情用升调（Have you taken any medicine?）；给出诊断与建议时用降调，语气肯定（Take it three times a day after meals.）。',
          '重音：a headache、a sore throat、since Monday、three times a day、two days 这些信息要重读，复述与回答题都靠这些词。',
          '连读：What is the trouble? 中 What is 连读成 /wɒts/；felt like this 中 felt like 连读。',
          '复述提示：按「症状—持续多久—吃过什么药—医生诊断—用药与休息建议」的顺序复述，用 he said / the doctor told him 转述人称与时态。',
        ],
        tasks: [
          {
            id: 'eng-paper-02-l3-t1',
            type: 'choice',
            stem: '复述题：Which of the following is the best retelling of the talk with the doctor?',
            options: [
              'The boy had a headache and a sore throat, and the doctor told him to take medicine three times a day and rest at home for two days.',
              'The boy had a fever, and the doctor told him to play basketball after taking some pills.',
              'The doctor said the boy could go to school tomorrow if he drank cold drinks.',
              'The boy felt ill since Sunday, and the doctor gave him a T-shirt and some warm water.',
            ],
            answer: 'A',
            explanation:
              '对话要点是：男孩头疼、嗓子疼（从周一开始），吃药无效，医生诊断为重感冒，让他一天三次饭后服药、多喝温水，并在家休息两天，故选 A。B 与「不能打篮球」矛盾；C 中说可以喝冷饮恰恰相反；D 的时间与所给东西都错。',
            difficulty: 2,
            tags: ['听说·角色扮演', '复述', '信息整合'],
          },
          {
            id: 'eng-paper-02-l3-t2',
            type: 'choice',
            stem:
              'You want to know when to take the medicine. Which question is the most suitable?',
            options: [
              'How often should I take the medicine?',
              'Where can I buy the medicine?',
              'How much does the medicine cost?',
              'Who gave you the medicine?',
            ],
            answer: 'A',
            explanation:
              '问「多久吃一次／一天吃几次」用 How often，故选 A。B 问地点、C 问价钱、D 问是谁给的药，都不能得到服药时间。',
            difficulty: 2,
            tags: ['听说·角色扮演', '询问', '功能句'],
          },
          {
            id: 'eng-paper-02-l3-t3',
            type: 'choice',
            stem: 'What must the boy do before he goes back to school?',
            options: [
              'He must play in the basketball match first.',
              'He must rest at home for two days and have no fever.',
              'He must drink cold drinks every morning.',
              'He must take the medicine for a month.',
            ],
            answer: 'B',
            explanation:
              '医生说他需要在家休息两天，不发烧了再回学校，故选 B。医生明确不让他打篮球、不要喝冷饮（A、C 错）；用药次数是一天三次，没有说吃一个月（D 错）。',
            difficulty: 2,
            tags: ['听说·角色扮演', '回答', '细节听取'],
          },
        ],
      },
    ],
  },

  /* ================================================================== */
  /* 模拟卷（三）传统文化与中外交流                                      */
  /* ================================================================== */
  {
    id: 'eng-paper-03',
    grade: 'all',
    title: '广州中考英语模拟卷（三）· 传统文化与中外交流',
    basis: basisOf('中国传统节日、民间艺术（剪纸、书法、京剧）、茶文化、中外学生交流与跨文化理解'),
    duration: 100,
    totalScore: 110,
    speakingScore: 30,
    sections: SECTIONS,

    questions: [
      /* ---------------- 语言知识运用 第一节：完形填空（10 小题 15 分） ---------------- */
      {
        id: 'eng-paper-03-q1',
        type: 'choice',
        stem:
          '阅读下面短文，掌握其大意，然后从各题所给的 A、B、C、D 四个选项中选出能填入相应空白处的最佳选项。\n\n' +
          'A Spring Festival with a Chinese Family\n\n' +
          "When Daniel, a fifteen-year-old student from London, was invited to spend the Spring Festival with his Chinese classmate's family, he did not know what to (1) ____.\n\n" +
          "The first surprise came on the day before the festival. The whole family cleaned the flat from morning to night. Daniel could not understand why they were so (2) ____ about a little dust. His friend's mother laughed: 'We sweep the old year out of the house.'\n\n" +
          "(3) ____, the family sat down to make dumplings together. Daniel's first dumpling looked like a small stone. Everyone laughed, but the laughter was (4) ____, not unkind. His friend's grandmother said, 'Never mind. My first one was worse.' By the second plate, his dumplings were (5) ____ enough to stand up by themselves.\n\n" +
          'At midnight, the streets were louder than Daniel had ever heard. Fireworks (6) ____ the sky, and the air smelled of smoke and happiness. He stood at the window and took photo after photo. For the first time he understood why people here say that the festival is not just a holiday but a reunion.\n\n' +
          "On the last evening, the grandmother gave him a red envelope. He tried to (7) ____ it, but she put it into his hand and closed his fingers. 'Next year you come (8) ____,' she said.\n\n" +
          "Daniel flew home with a small paper cut in his bag. His classmates asked him what China was like. 'It is not the food or the buildings that I remember most,' he said. 'It is the way the family (9) ____ each other. That is the part I want to (10) ____ with my own family.'\n\n" +
          '第 (1) 空的最佳选项是：',
        options: ['bring', 'wear', 'expect', 'write'],
        answer: 'C',
        explanation:
          '被邀请去同学家过春节时，他还不知道会遇到什么，用 not know what to expect（不知道会是什么样）。bring、wear、write 都不能与 what to 构成这个固定表达。',
        difficulty: 1,
        tags: ['完形填空', '动词辨析', '中外交流'],
      },
      {
        id: 'eng-paper-03-q2',
        type: 'choice',
        stem:
          '据上文完形填空短文——Daniel could not understand why they were so (2) ____ about a little dust. 第 (2) 空的最佳选项是：',
        options: ['angry', 'lazy', 'proud', 'careful'],
        answer: 'D',
        explanation:
          '全家人从早到晚打扫，连一点灰尘都不放过，说明他们非常「仔细」，用 careful about。angry、lazy（懒惰的）、proud 都与打扫这件事无关。',
        difficulty: 1,
        tags: ['完形填空', '形容词辨析', '上下文线索'],
      },
      {
        id: 'eng-paper-03-q3',
        type: 'choice',
        stem:
          '据上文完形填空短文——(3) ____, the family sat down to make dumplings together. 第 (3) 空的最佳选项是：',
        options: ['Later that evening', 'Two weeks before', 'At the same time', 'Since that morning'],
        answer: 'A',
        explanation:
          '上文写的是「节日前一天从早到晚打扫」，接着写晚上一家人坐下来包饺子，故用 Later that evening 表示时间顺承。Two weeks before 时间颠倒；At the same time 与「先打扫、后包饺子」矛盾；Since 不能单独引导一个句子。',
        difficulty: 2,
        tags: ['完形填空', '时间状语', '语篇衔接'],
      },
      {
        id: 'eng-paper-03-q4',
        type: 'choice',
        stem:
          '据上文完形填空短文——Everyone laughed, but the laughter was (4) ____, not unkind. 第 (4) 空的最佳选项是：',
        options: ['cold', 'warm', 'loud', 'short'],
        answer: 'B',
        explanation:
          'not unkind（并非不友善）提示这种笑声是善意的，用 warm（温暖的、亲切的）。cold（冷淡的）与 not unkind 语义矛盾。',
        difficulty: 2,
        tags: ['完形填空', '形容词辨析', '情感态度'],
      },
      {
        id: 'eng-paper-03-q5',
        type: 'choice',
        stem:
          '据上文完形填空短文——By the second plate, his dumplings were (5) ____ enough to stand up by themselves. 第 (5) 空的最佳选项是：',
        options: ['small', 'soft', 'good', 'sweet'],
        answer: 'C',
        explanation:
          '包到第二盘时，他包的饺子已经「好」到能立起来了，用 good enough to do sth。small、soft、sweet 都无法与「能立起来」构成合理的搭配。',
        difficulty: 2,
        tags: ['完形填空', '形容词辨析', 'enough 的用法'],
      },
      {
        id: 'eng-paper-03-q6',
        type: 'choice',
        stem:
          '据上文完形填空短文——Fireworks (6) ____ the sky, and the air smelled of smoke and happiness. 第 (6) 空的最佳选项是：',
        options: ['covered', 'cleaned', 'left', 'lit up'],
        answer: 'D',
        explanation:
          '烟花「照亮」了夜空，用 lit up（light up 的过去式）。covered（覆盖）、cleaned（打扫）、left（离开）都不能描写烟花的景象。',
        difficulty: 2,
        tags: ['完形填空', '动词短语', '场景描写'],
      },
      {
        id: 'eng-paper-03-q7',
        type: 'choice',
        stem:
          '据上文完形填空短文——On the last evening, the grandmother gave him a red envelope. He tried to (7) ____ it, but she put it into his hand and closed his fingers. 第 (7) 空的最佳选项是：',
        options: ['refuse', 'open', 'eat', 'count'],
        answer: 'A',
        explanation:
          'but 表示转折：他想「推辞」（refuse），而奶奶把红包塞进他手里，可见先是推让、后是收下。open、eat、count 都不能与 but 构成这一转折。',
        difficulty: 2,
        tags: ['完形填空', '动词辨析', '转折关系'],
      },
      {
        id: 'eng-paper-03-q8',
        type: 'choice',
        stem:
          "据上文完形填空短文——'Next year you come (8) ____,' she said. 第 (8) 空的最佳选项是：",
        options: ['alone', 'earlier', 'later', 'quietly'],
        answer: 'B',
        explanation:
          '奶奶舍不得他走，说「明年你早点来」，用 earlier。alone（一个人来）与她欢迎他来的语气矛盾；later（晚点来）与不舍的心情不符；quietly 与时间无关。',
        difficulty: 2,
        tags: ['完形填空', '副词辨析', '情感推断'],
      },
      {
        id: 'eng-paper-03-q9',
        type: 'choice',
        stem:
          "据上文完形填空短文——'It is not the food or the buildings that I remember most,' he said. 'It is the way the family (9) ____ each other.' 第 (9) 空的最佳选项是：",
        options: ['teach', 'help', 'treat', 'call'],
        answer: 'C',
        explanation:
          'the way the family treat each other 意为「这家人彼此相待的方式」，与后文「要把这一点带回自己家」呼应。teach、help、call 都不能表达「相待、相处」。',
        difficulty: 3,
        tags: ['完形填空', '动词辨析', '主旨呼应'],
      },
      {
        id: 'eng-paper-03-q10',
        type: 'choice',
        stem:
          '据上文完形填空短文——That is the part I want to (10) ____ with my own family. 第 (10) 空的最佳选项是：',
        options: ['write', 'cook', 'travel', 'share'],
        answer: 'D',
        explanation:
          'share sth with sb 表示「与某人分享、一起拥有」，即把这种相处方式带回自己家，用 share。write、cook、travel 都不能与 the way the family treat each other 搭配。',
        difficulty: 2,
        tags: ['完形填空', '动词辨析', '固定搭配'],
      },

      /* ---------------- 语言知识运用 第二节：语法选择（10 小题 10 分） ---------------- */
      {
        id: 'eng-paper-03-q11',
        type: 'choice',
        stem:
          '语法选择：从各题所给的 A、B、C、D 四个选项中选出最佳选项，使句子完整、通顺。\n\nPaper cutting (11) ____ as a traditional art in China for hundreds of years.',
        options: ['has been known', 'knows', 'is knowing', 'knew'],
        answer: 'A',
        explanation:
          'for hundreds of years 与现在完成时连用，且 paper cutting 是「被人们所知」的对象，要用被动语态，故为 has been known。',
        difficulty: 3,
        tags: ['语法选择', '现在完成时的被动语态', '时态与语态'],
      },
      {
        id: 'eng-paper-03-q12',
        type: 'choice',
        stem:
          'The old man told us the story of the Dragon Boat Festival, (12) ____ we found very interesting.',
        options: ['who', 'which', 'what', 'whose'],
        answer: 'B',
        explanation:
          '逗号后是非限制性定语从句，指代前面整件事（那个故事），用 which。who 指人；what 不能引导定语从句；whose 后必须接名词。',
        difficulty: 3,
        tags: ['语法选择', '非限制性定语从句', '关系代词'],
      },
      {
        id: 'eng-paper-03-q13',
        type: 'choice',
        stem: 'Could you tell me (13) ____ the Chinese painting class begins?',
        options: ['that', 'what', 'when', 'which'],
        answer: 'C',
        explanation:
          '宾语从句中缺时间状语，用连接副词 when（什么时候开始）。that 不充当成分；what、which 是连接代词，不能表示时间。注意宾语从句要用陈述语序。',
        difficulty: 1,
        tags: ['语法选择', '宾语从句', '连接词'],
      },
      {
        id: 'eng-paper-03-q14',
        type: 'choice',
        stem: 'The tea (14) ____ in this small village is famous all over the country.',
        options: ['grows', 'growing', 'to grow', 'grown'],
        answer: 'D',
        explanation:
          'tea 与 grow 是被动关系，「在这个小村子里种植的茶」用过去分词 grown 作后置定语，相当于 which is grown。growing 表示主动、正在生长，与句意不符。',
        difficulty: 3,
        tags: ['语法选择', '过去分词作定语', '非谓语动词'],
      },
      {
        id: 'eng-paper-03-q15',
        type: 'choice',
        stem: 'It is (15) ____ interesting film that I have seen it three times.',
        options: ['such an', 'so an', 'such a', 'so'],
        answer: 'A',
        explanation:
          '「such + a/an + 形容词 + 可数名词单数 + that 从句」表示「如此……以至于……」。interesting 以元音音素开头，故用 such an；so 后面一般直接跟形容词或副词，不接 a/an + 名词。',
        difficulty: 3,
        tags: ['语法选择', 'such 与 so', '结果状语从句'],
      },
      {
        id: 'eng-paper-03-q16',
        type: 'choice',
        stem: '(16) ____ he is only fourteen, he has already learned to perform Beijing Opera.',
        options: ['Because', 'Although', 'If', 'Since'],
        answer: 'B',
        explanation:
          '「只有十四岁」与「已经会演京剧」是让步关系，用 Although（虽然）。Because、Since 表示原因，If 表示条件，都不能表达这一转折。',
        difficulty: 2,
        tags: ['语法选择', '让步状语从句', '连词'],
      },
      {
        id: 'eng-paper-03-q17',
        type: 'choice',
        stem: 'The visitors asked (17) ____ they could take photos in the museum.',
        options: ['that', 'what', 'whether', 'which'],
        answer: 'C',
        explanation:
          '从句意思是「是否可以拍照」，用 whether（是否）引导宾语从句。that 不能用于疑问含义；what、which 与「是否」无关。',
        difficulty: 2,
        tags: ['语法选择', '宾语从句', 'whether'],
      },
      {
        id: 'eng-paper-03-q18',
        type: 'choice',
        stem: 'My grandpa keeps (18) ____ Chinese calligraphy every morning.',
        options: ['practise', 'to practise', 'practised', 'practising'],
        answer: 'D',
        explanation:
          'keep doing sth 表示「一直做某事」，故用 practising。keep 后不能接动词原形或不定式。',
        difficulty: 2,
        tags: ['语法选择', '非谓语动词', 'keep doing'],
      },
      {
        id: 'eng-paper-03-q19',
        type: 'choice',
        stem: 'This kind of Chinese knot (19) ____ to bring good luck.',
        options: ['is believed', 'believes', 'has believed', 'is believing'],
        answer: 'A',
        explanation:
          '「人们认为中国结能带来好运」，主语是「被人相信」的对象，用被动语态 is believed；It is believed that ... 也是同一结构。',
        difficulty: 3,
        tags: ['语法选择', '被动语态', '固定表达'],
      },
      {
        id: 'eng-paper-03-q20',
        type: 'choice',
        stem: 'The students were so excited (20) ____ they forgot the time.',
        options: ['as', 'that', 'which', 'when'],
        answer: 'B',
        explanation:
          'so + 形容词 + that 从句表示「如此……以至于……」，故用 that。这一结构要与 such ... that ... 区分：so 后跟形容词或副词。',
        difficulty: 2,
        tags: ['语法选择', '结果状语从句', 'so ... that'],
      },

      /* ---------------- 阅读 第一节：短文理解（15 小题 30 分） ---------------- */
      {
        id: 'eng-paper-03-q21',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Two Weeks in Guangzhou\n\n' +
          'When Mia arrived in Guangzhou from Australia in July, she thought she knew a lot about China. She had studied Chinese for three years and could write a hundred characters. Her first week at the summer school, however, taught her how little she really knew.\n\n' +
          'On the first morning, her host sister Lin took her to a dim sum restaurant. Mia looked at the table and felt lost: there were more than twenty small dishes, and everybody was sharing them. In Australia she always had her own plate. Lin showed her how to pick up a dumpling with chopsticks without breaking it. It took Mia four tries.\n\n' +
          "In the afternoon, they joined a paper-cutting class. The teacher, Mrs Chen, held a pair of scissors and turned a piece of red paper into a rabbit in two minutes. Mia's rabbit looked more like a dog. But when she had finished, Mrs Chen put her work on the wall of the classroom and said, 'Every pair of hands is different. That is why the art is still alive.'\n\n" +
          "On her last day, Mia wrote a card in Chinese to thank the family. She made nine mistakes in ten characters, and everyone laughed kindly. 'Your handwriting is not beautiful,' Lin said, 'but we can read your heart.' Mia decided to keep practising after she went home.\n\n" +
          '21. What did Mia think before she came to Guangzhou?',
        options: [
          'She thought Chinese food would be too hot for her.',
          'She thought she could already use chopsticks well.',
          'She thought she already knew a lot about China.',
          'She thought the summer school would be boring.',
        ],
        answer: 'C',
        explanation:
          '第一段说她来广州之前「以为自己对中国了解很多」（学了三年中文、能写一百个汉字），故选 C。她的筷子用不好、也没提食物太辣或夏令营无聊。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '中外交流'],
      },
      {
        id: 'eng-paper-03-q22',
        type: 'choice',
        stem: '（据上文短文 Two Weeks in Guangzhou）22. Why did Mia feel lost at the dim sum restaurant?',
        options: [
          'She could not understand the menu at all.',
          'There were no dishes she liked on the table.',
          'She had to pay for the food by herself.',
          'People were sharing dishes instead of having their own plates.',
        ],
        answer: 'D',
        explanation:
          '第二段说桌上有二十多道菜，大家都分着吃，而在澳大利亚她总是自己一份，这让她不知所措，故选 D。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '文化差异'],
      },
      {
        id: 'eng-paper-03-q23',
        type: 'choice',
        stem: '（据上文短文 Two Weeks in Guangzhou）23. What happened in the paper-cutting class?',
        options: [
          'Mia tried to cut a rabbit, but her work looked like a dog.',
          'Mia cut a rabbit better than the teacher did.',
          'Mia refused to take part in the class.',
          'Mia taught the other students how to cut paper.',
        ],
        answer: 'A',
        explanation:
          '第三段说 Mia 剪出的兔子更像一只狗，故选 A。老师的兔子两分钟就剪好了，她远不如老师（B 错）；她参加了课程，也没有教别人（C、D 错）。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '记叙文'],
      },
      {
        id: 'eng-paper-03-q24',
        type: 'choice',
        stem:
          "（据上文短文 Two Weeks in Guangzhou）24. Why did Mrs Chen put Mia's paper cutting on the wall?",
        options: [
          'Because it was the best one in the class.',
          'Because she believed every pair of hands is different, and that keeps the art alive.',
          'Because Mia asked her to do so.',
          'Because there was no other place to put it.',
        ],
        answer: 'B',
        explanation:
          '老师的话「每双手都不一样，这正是这门艺术还活着的原因」说明她看重的是不同的人带来的新意，故选 B。她并没有说那是全班最好的作品（A 错）。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '引语理解'],
      },
      {
        id: 'eng-paper-03-q25',
        type: 'choice',
        stem:
          '（据上文短文 Two Weeks in Guangzhou）25. What do Lin\'s words "we can read your heart" mean?',
        options: [
          'Mia wrote her card in English.',
          'Mia\'s handwriting was very beautiful.',
          'Mia\'s card showed her true thanks even though there were mistakes.',
          'Lin could not understand the card at all.',
        ],
        answer: 'C',
        explanation:
          '虽然 Mia 写错了九个字，但心意能被读懂，故选 C。Lin 恰恰理解了卡片的内容（D 错）；她也明确说字写得不算漂亮（B 错）。',
        difficulty: 2,
        tags: ['阅读理解', '句意理解', '情感态度'],
      },
      {
        id: 'eng-paper-03-q26',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'A Festival on the Water\n\n' +
          'On the fifth day of the fifth month of the Chinese lunar calendar, people across China celebrate the Dragon Boat Festival. Its best-known part is the dragon boat race, but the day means much more than a competition.\n\n' +
          'The story behind it goes back more than two thousand years. Qu Yuan was a poet and an official who loved his country deeply. When he saw that his country was in danger, he wrote poems to warn people, but nobody listened. In the end, he jumped into the Miluo River. Local people rowed out in their boats to look for him, and when they could not find him, they threw rice into the water so that the fish would not eat his body.\n\n' +
          'Today, the two old customs remain. Teams of twenty or more people row long boats shaped like dragons, while drums beat fast to keep everyone moving together. And in almost every family, people eat zongzi — rice with meat or beans, wrapped in bamboo leaves.\n\n' +
          'The festival has changed with the times. In some cities the races are now international events, and teams from other countries come to take part. But the meaning stays the same: to remember a man who put his country before himself, and to be together with the people we love.\n\n' +
          '26. What is the passage mainly about?',
        options: [
          'How to make zongzi at home.',
          'Why drums are used in the boat race.',
          'The life and poems of Qu Yuan.',
          'The Dragon Boat Festival and what it means.',
        ],
        answer: 'D',
        explanation:
          '全文介绍了端午节的来历（屈原的故事）、两个传统习俗以及节日含义的延续，故选 D。A、B、C 都只是文中某一处细节。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '传统文化'],
      },
      {
        id: 'eng-paper-03-q27',
        type: 'choice',
        stem:
          '（据上文短文 A Festival on the Water）27. What did local people do when they could not find Qu Yuan?',
        options: [
          'They threw rice into the water so that the fish would not eat his body.',
          'They built a bigger boat to look for him again.',
          'They stopped celebrating the festival that year.',
          'They wrote more poems about his country.',
        ],
        answer: 'A',
        explanation:
          '第二段说人们划船寻找未果后，把米投进江里，希望鱼不要吃他的身体，这正是吃粽子习俗的由来，故选 A。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '文化习俗'],
      },
      {
        id: 'eng-paper-03-q28',
        type: 'choice',
        stem:
          '（据上文短文 A Festival on the Water）28. How many people are there in a dragon boat team, according to the passage?',
        options: ['Ten or more.', 'Twenty or more.', 'Fifty or more.', 'About a hundred.'],
        answer: 'B',
        explanation:
          '第三段说 Teams of twenty or more people（二十人或以上），故选 B。',
        difficulty: 1,
        tags: ['阅读理解', '数字信息', '细节理解'],
      },
      {
        id: 'eng-paper-03-q29',
        type: 'choice',
        stem: '（据上文短文 A Festival on the Water）29. Why do the drummers beat the drums?',
        options: [
          'To tell people that the race is over.',
          'To show which team is winning.',
          'To keep the team members rowing together.',
          'To welcome visitors from other countries.',
        ],
        answer: 'C',
        explanation:
          '第三段说 drums beat fast to keep everyone moving together（鼓点让所有人动作一致），故选 C。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '因果关系'],
      },
      {
        id: 'eng-paper-03-q30',
        type: 'choice',
        stem: '（据上文短文 A Festival on the Water）30. What can we learn from the last paragraph?',
        options: [
          'The festival is no longer celebrated in big cities.',
          'Foreign teams do not enjoy the dragon boat race.',
          'Zongzi is now eaten only at international events.',
          'The festival keeps its meaning although it changes with the times.',
        ],
        answer: 'D',
        explanation:
          '末段说比赛如今成了国际赛事、有外国队伍参加，但节日的意义没有变：纪念把国家置于个人之上的屈原，与所爱的人团聚，故选 D。',
        difficulty: 2,
        tags: ['阅读理解', '主旨理解', '文化传承'],
      },
      {
        id: 'eng-paper-03-q31',
        type: 'choice',
        stem:
          '阅读下面短文，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'More Than Words\n\n' +
          'More than thirty million people around the world are learning Chinese. Some of them do it for their work, but a growing number do it because they are interested in the culture. This is good news, not only for China but also for the learners themselves.\n\n' +
          'First, a language opens a door to a way of thinking. When a student learns the character 家, he learns that it means both "home" and "family". In Chinese, the two ideas live in one single character. Such small discoveries help learners understand why Chinese people take family life so seriously.\n\n' +
          'Second, learning a language teaches patience and respect. Nobody can learn two thousand characters in a month. Learners must be ready to make mistakes, to be corrected and to laugh at themselves. In a world where people often judge each other too quickly, this habit is worth more than a good accent.\n\n' +
          'There is also a practical reason: people who can use two languages find more chances in study and work. But the best reason is still the simplest one. When you greet someone in his own language, you are saying, "I want to know you." That is what language learning really is — a way of making friends, not a test to pass.\n\n' +
          '31. Why are more and more people learning Chinese, according to the passage?',
        options: [
          'Because they are interested in Chinese culture.',
          'Because Chinese is the easiest language to learn.',
          'Because they all plan to move to China.',
          'Because their schools make them do it.',
        ],
        answer: 'A',
        explanation:
          '第一段说除了一部分人为了工作之外，越来越多的人是「对中国文化感兴趣」才学中文，故选 A。文中没有说中文最容易学（B 错），也没有说大家都打算搬到中国（C 错）。',
        difficulty: 2,
        tags: ['阅读理解', '细节理解', '语言学习'],
      },
      {
        id: 'eng-paper-03-q32',
        type: 'choice',
        stem: '（据上文短文 More Than Words）32. What does the example of the character 家 show?',
        options: [
          'Chinese characters are difficult to write.',
          'One character can carry two ideas and help learners understand a culture.',
          'Chinese people always live with their parents.',
          'Home and family mean the same in every language.',
        ],
        answer: 'B',
        explanation:
          '作者用「家」同时表示 home 与 family 这一例子说明：从语言细节可以看出一个民族为什么重视家庭，即语言帮助理解文化，故选 B。',
        difficulty: 2,
        tags: ['阅读理解', '例证理解', '推理判断'],
      },
      {
        id: 'eng-paper-03-q33',
        type: 'choice',
        stem:
          '（据上文短文 More Than Words）33. Besides words, what can learning a language teach a learner?',
        options: [
          'How to pass exams more easily.',
          'How to speak with a beautiful accent.',
          'Patience and respect for others.',
          'How to travel around the world cheaply.',
        ],
        answer: 'C',
        explanation:
          '第三段开头明确说 learning a language teaches patience and respect，并解释学语言必然要经历犯错与被纠正，故选 C。',
        difficulty: 1,
        tags: ['阅读理解', '细节理解', '观点归纳'],
      },
      {
        id: 'eng-paper-03-q34',
        type: 'choice',
        stem:
          '（据上文短文 More Than Words）34. What is the writer\'s own favourite reason for learning a language?',
        options: [
          'It helps people find better jobs.',
          'It makes travelling much easier.',
          'It is needed for studying abroad.',
          'It is a way of making friends.',
        ],
        answer: 'D',
        explanation:
          '末段说最好的理由也是最简单的：用对方的语言问候，就是在说「我想认识你」——学语言是一种交友方式，故选 D。工作机会是文中提到的「实际理由」，不是作者心中最好的理由（A 错）。',
        difficulty: 2,
        tags: ['阅读理解', '作者观点', '主旨理解'],
      },
      {
        id: 'eng-paper-03-q35',
        type: 'choice',
        stem: '（据上文短文 More Than Words）35. What is the best title for the passage?',
        options: [
          'More Than Words: Learning a Language, Learning a Culture',
          'How to Remember Two Thousand Characters',
          'Why Chinese Is the Most Difficult Language',
          'A Good Accent Is the Most Important Thing',
        ],
        answer: 'A',
        explanation:
          '全文讲的是「学语言不只是学词句，更是了解一种文化、学会与人相处」，A「不只是语言：学一种语言，懂一种文化」最能概括。B、C、D 只涉及文中局部或与文意相反。',
        difficulty: 2,
        tags: ['阅读理解', '标题归纳', '主旨理解'],
      },

      /* ---------------- 阅读 第二节：多模态短文（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-03-q36',
        type: 'choice',
        stem:
          '阅读下面的通知与活动安排表，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Culture Week Programme\n\n' +
          "Our school will hold a Culture Week from 12 to 16 May. All the activities are free. Please sign up at the Students' Union office before 9 May. Each student may join at most three activities.\n\n" +
          'Activity | Day | Time | Place | For\n' +
          'Chinese Calligraphy | Monday | 16:00—17:30 | Room 302 | Grades 7—9\n' +
          'Paper Cutting | Tuesday | 16:00—17:30 | Art Room | Grades 7—8\n' +
          'Shadow Puppet Show | Wednesday | 19:00—20:00 | School Hall | All students and parents\n' +
          'Tea Ceremony | Thursday | 15:30—17:00 | Room 105 | Grades 8—9\n' +
          'Chinese Songs in English | Friday | 16:00—17:00 | Music Room | All students\n\n' +
          'Note: For the Tea Ceremony, please bring your own cup. Guests from a partner school in Singapore will visit us on Wednesday evening and take part in the Shadow Puppet Show.\n\n' +
          '36. What must a student do to join the Culture Week activities?',
        options: [
          'Pay for the activities at the school gate.',
          "Sign up at the Students' Union office before 9 May.",
          'Ask the guest students from Singapore first.',
          'Bring a cup to every activity.',
        ],
        answer: 'B',
        explanation:
          '通知说所有活动免费（A 错），请在 5 月 9 日前到学生会办公室报名，故选 B。带杯子只是茶艺活动的要求（D 错）。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '细节理解'],
      },
      {
        id: 'eng-paper-03-q37',
        type: 'choice',
        stem: '（据上文 Culture Week 安排表）37. Which activity is open to all students and their parents?',
        options: [
          'Chinese Calligraphy.',
          'Tea Ceremony.',
          'Shadow Puppet Show.',
          'Chinese Songs in English.',
        ],
        answer: 'C',
        explanation:
          '表格中只有 Shadow Puppet Show 一栏的 For 是 All students and parents（面向全体学生与家长），故选 C。其余活动只面向学生且分年级。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '表格信息'],
      },
      {
        id: 'eng-paper-03-q38',
        type: 'choice',
        stem: '（据上文 Culture Week 安排表）38. What should students bring to the Tea Ceremony?',
        options: ['A pair of scissors.', 'A music book.', 'A Chinese song.', 'Their own cup.'],
        answer: 'D',
        explanation:
          '表格下方的 Note 写明：参加茶艺活动请自带杯子，故选 D。剪刀是剪纸要用的，与茶艺无关（A 错）。',
        difficulty: 1,
        tags: ['阅读理解', '多模态阅读', '细节理解'],
      },
      {
        id: 'eng-paper-03-q39',
        type: 'choice',
        stem:
          '（据上文 Culture Week 安排表）39. Li Ming is in Grade 7. Which of the following activities can he NOT join?',
        options: [
          'The Tea Ceremony.',
          'Paper Cutting.',
          'Chinese Calligraphy.',
          'Chinese Songs in English.',
        ],
        answer: 'A',
        explanation:
          '茶艺活动的对象是 Grades 8—9，七年级学生不能参加，故选 A。剪纸面向 7—8 年级、书法面向 7—9 年级、中英文歌曲面向所有学生，他都可以参加。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '信息匹配'],
      },
      {
        id: 'eng-paper-03-q40',
        type: 'choice',
        stem: '（据上文 Culture Week 安排表）40. Which of the following is TRUE?',
        options: [
          'Every student may join as many activities as he likes.',
          'Guests from a Singapore school will take part in the Shadow Puppet Show.',
          'The Shadow Puppet Show will be held in the afternoon.',
          'Students must pay for the paper-cutting class.',
        ],
        answer: 'B',
        explanation:
          '通知说新加坡伙伴学校的客人将在周三晚上参加皮影戏活动，B 正确。每人最多参加三项（A 错）；皮影戏在 19:00—20:00，是晚上（C 错）；所有活动免费（D 错）。',
        difficulty: 2,
        tags: ['阅读理解', '多模态阅读', '综合判断'],
      },

      /* ---------------- 项目情境第一节：项目语篇（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-03-q41',
        type: 'choice',
        stem:
          '阅读下面的项目活动报告，从每题所给的 A、B、C、D 四个选项中选出最佳选项。\n\n' +
          'Report: Telling Chinese Stories in English — by Class 9C\n\n' +
          'Last term, our class took part in an exchange programme with a school in Singapore. In the first video meeting, we found a problem: we could talk about our homework and our favourite games, but when the Singapore students asked about our festivals, we were silent. We knew the stories in Chinese, but not in English.\n\n' +
          'So we started a project called Telling Chinese Stories in English. We divided the class into six groups, and each group chose one story: the Spring Festival, the Mid-Autumn Festival, the Dragon Boat Festival, the story of Yu Gong, the story of the Monkey King, and the legend of the magpie bridge.\n\n' +
          'Our rule was: tell the story in three minutes, with no more than five new words for the listeners. That was the hardest part. We had to cut long sentences and look for simple words. For example, "the Jade Emperor" became "the king of heaven".\n\n' +
          'In December, we recorded our stories and sent the videos to Singapore. Their teacher wrote back: "Our students watched every video twice. Now they want to know why Chinese people give red envelopes."\n\n' +
          'The project taught us two things. First, to explain your culture well, you must really understand it. Second, simple English is not poor English — it is English that works.\n\n' +
          '41. What problem did Class 9C find in the first video meeting?',
        options: [
          'The Singapore students spoke much too fast.',
          'The video connection was too poor to hear.',
          'They could not tell Chinese festival stories in English.',
          'They had no time to prepare any questions.',
        ],
        answer: 'C',
        explanation:
          '第一段说明问题：能聊作业和游戏，但对方问起节日时全班沉默了——中文故事会讲，英文讲不出来，故选 C。A、B、D 在文中都没有依据。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '中外交流'],
      },
      {
        id: 'eng-paper-03-q42',
        type: 'choice',
        stem: '（据上文项目报告 Telling Chinese Stories in English）42. What was the rule of the project?',
        options: [
          'Everyone had to tell a story in English for five minutes.',
          'Each group had to choose two Chinese stories.',
          'The listeners had to learn five new words by heart.',
          'A story had to be told in three minutes with no more than five new words.',
        ],
        answer: 'D',
        explanation:
          '第三段说明规则：三分钟内讲完，给听众的新词不超过五个，故选 D。「五分钟」「两个故事」「听众背五个新词」都与原文不符。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '信息对应'],
      },
      {
        id: 'eng-paper-03-q43',
        type: 'choice',
        stem: '（据上文项目报告 Telling Chinese Stories in English）43. Why was this rule the hardest part?',
        options: [
          'Because they had to use short sentences and simple words.',
          'Because three minutes was too long for them.',
          'Because the teacher gave them too many stories to choose from.',
          'Because they had to write the story in Chinese first.',
        ],
        answer: 'A',
        explanation:
          '第三段紧接着说明：他们必须把长句改短、另找简单词（如把 the Jade Emperor 换成 the king of heaven），故选 A。',
        difficulty: 2,
        tags: ['项目情境', '细节理解', '因果关系'],
      },
      {
        id: 'eng-paper-03-q44',
        type: 'choice',
        stem: '（据上文项目报告 Telling Chinese Stories in English）44. What did the Singapore teacher say about the videos?',
        options: [
          'They were too difficult for the students to understand.',
          'Their students watched every video twice and wanted to know more.',
          'Their students liked the story of the Monkey King best.',
          'They would send their own videos the next year.',
        ],
        answer: 'B',
        explanation:
          '第四段引用对方老师的回信：学生把每个视频看了两遍，还想知道中国人为什么发红包，故选 B。',
        difficulty: 1,
        tags: ['项目情境', '细节理解', '引语理解'],
      },
      {
        id: 'eng-paper-03-q45',
        type: 'choice',
        stem: '（据上文项目报告 Telling Chinese Stories in English）45. What did the project teach Class 9C?',
        options: [
          'Culture is not important for language learning.',
          'Long sentences are always better than short ones.',
          'You must understand your culture well to explain it, and simple English works.',
          'Only teachers can tell Chinese stories in English.',
        ],
        answer: 'C',
        explanation:
          '末段总结两点收获：要讲清自己的文化，先要真正理解它；简单英语不是糟糕的英语，而是「管用的英语」，故选 C。',
        difficulty: 2,
        tags: ['项目情境', '主旨理解', '收获归纳'],
      },

      /* ---------------- 项目情境第二节：简答题（5 小题 10 分） ---------------- */
      {
        id: 'eng-paper-03-q46',
        type: 'short',
        stem:
          '阅读下面的调查结果与文化中心通知，然后回答问题（每小题 2 分，请用完整句子作答）。\n\n' +
          'Survey: Which Chinese tradition would you like to learn? (120 exchange students from six countries)\n' +
          'Chinese calligraphy 41 | Chinese cooking 36 | Beijing Opera 19 | Paper cutting 14 | Tai chi 10\n' +
          'Reason for choosing a tradition: interest in the art itself 62 | want to make friends 28 | need it for study 18 | other reasons 12\n\n' +
          'Workshop Notice: Every Saturday afternoon from 2:00 to 4:00, the City Culture Centre offers free workshops. This month: Chinese calligraphy (with Mr Zhao, twenty places) and Chinese cooking (with Ms Huang, twenty-five places). Please bring your student card. Sign up by phone before Thursday.\n\n' +
          '46. Which tradition do the exchange students most want to learn, and how many students chose it?',
        answer: 'They most want to learn Chinese calligraphy, and forty-one (41) students chose it.',
        rubric: [
          '答出最想学的是 Chinese calligraphy（中国书法）',
          '答出人数 41',
          '用完整句子作答，主谓与时态基本正确',
        ],
        explanation:
          '调查第一行中 Chinese calligraphy 41 的数字最大，故书法最受欢迎，共 41 人选择。注意不要把 41 与 36 弄混。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-03-q47',
        type: 'short',
        stem: '（材料见第 46 题）47. What is the most common reason for choosing a tradition?',
        answer: 'The most common reason is that they are interested in the art itself (sixty-two students).',
        rubric: [
          '答出原因 interest in the art itself（对这门艺术本身感兴趣）',
          '答出人数 62',
          '句子完整，原因表达清楚',
        ],
        explanation:
          'Reason for choosing a tradition 一栏中 interest in the art itself 人数最多（62 人），故为最主要原因。',
        difficulty: 1,
        tags: ['项目情境', '简答题', '数据读取'],
      },
      {
        id: 'eng-paper-03-q48',
        type: 'short',
        stem:
          '（材料见第 46 题）48. An exchange student wants to learn Chinese cooking but says he is only free on Saturday. Will the notice help him? Why? Give two points.',
        answer:
          'Yes, it will help him. The workshops are held every Saturday afternoon from 2:00 to 4:00, and this month there is a Chinese cooking workshop with twenty-five places. He can sign up by phone before Thursday.',
        rubric: [
          '明确回答 Yes（通知对他有帮助）',
          '答出工作坊在每周六下午 2:00—4:00 举行',
          '答出本月有中式烹饪工作坊（或补充 25 个名额、周四前电话报名等依据）',
        ],
        explanation:
          '通知正好满足他的两个条件：时间是周六下午，内容里有中式烹饪课。答题要「表态 + 依据」，并写清具体时间或名额，不能只答 Yes。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '信息整合'],
      },
      {
        id: 'eng-paper-03-q49',
        type: 'short',
        stem:
          '（材料见第 46 题）49. Nineteen students want to learn Beijing Opera, but this month\'s workshops do not include it. What does this tell the culture centre?',
        answer:
          'It tells the centre that some exchange students are also interested in Beijing Opera, so it could add a Beijing Opera workshop, or offer one in the coming months.',
        rubric: [
          '答出「中心应增设京剧工作坊（或在以后开设）」这一结论',
          '联系数据或事实说明依据（有 19 名同学想学京剧；本月工作坊只有书法与烹饪）',
        ],
        explanation:
          '有 19 人想学京剧，却不在本月课程中，说明需求未被满足，中心可增设京剧课程。答题要点是「结论 + 依据」，不要只抄数字。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '信息推断'],
      },
      {
        id: 'eng-paper-03-q50',
        type: 'short',
        stem:
          '（材料见第 46 题）50. Only ten students chose tai chi. Write one suggestion to make more students interested in it.',
        answer:
          'The centre can give a short tai chi show at the school gate, or make a short video showing how tai chi helps people relax, so that students can see how interesting it is before they sign up.',
        rubric: [
          '提出一条具体可行的建议（如先办一场表演、拍短视频介绍、与体育课或课外活动结合等）',
          '建议针对「学生了解少、兴趣不高」这一问题',
          '语言清楚、句子完整（用 can / could / why not 等给出建议均可）',
        ],
        explanation:
          '选太极拳的人少，多半是因为不了解，所以建议要落在「先让学生看见、体验」上，如表演、短视频、体验课。只写 Tai chi is good 不得分。',
        difficulty: 2,
        tags: ['项目情境', '简答题', '开放性表达'],
      },

      /* ---------------- 写作 第一节：单词拼写（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-03-q51',
        type: 'fill',
        stem:
          '根据下列句子及所给的首字母提示，写出单词的适当形式，使句子完整、通顺。\n\n51. Chinese paper cutting is a kind of traditional a____ that is popular all over the world.',
        answer: 'art',
        explanation:
          '剪纸是一门传统「艺术」，traditional 是形容词，后面接名词，故填 art。注意不要写成 artist（艺术家）——那指的是人。',
        difficulty: 1,
        tags: ['单词拼写', '名词', '传统文化'],
      },
      {
        id: 'eng-paper-03-q52',
        type: 'fill',
        stem:
          '52. The Mid-Autumn F____ is a time for families to get together and eat mooncakes.',
        answer: 'Festival|festival',
        explanation:
          '中秋节是 the Mid-Autumn Festival。节日名称属专有名词，两个词一般都要大写，注意首字母 F 已给出。',
        difficulty: 1,
        tags: ['单词拼写', '节日名称', '大小写'],
      },
      {
        id: 'eng-paper-03-q53',
        type: 'fill',
        stem:
          '53. Many foreign students come to China to learn Chinese c____, such as calligraphy and Beijing Opera.',
        answer: 'culture',
        explanation:
          '由 such as calligraphy and Beijing Opera 可知要填「文化」culture。注意不要写成 cultural（形容词）。',
        difficulty: 2,
        tags: ['单词拼写', '词性转换', '中外交流'],
      },
      {
        id: 'eng-paper-03-q54',
        type: 'fill',
        stem:
          '54. 根据句意及括号内的中文提示写出单词：The dragon boat race is a famous ____（传统）in China.',
        answer: 'tradition',
        explanation:
          'a famous 后面要接名词，故填 tradition（传统）。traditional 是形容词，不能说 a famous traditional。',
        difficulty: 2,
        tags: ['单词拼写', '词性转换', '传统文化'],
      },
      {
        id: 'eng-paper-03-q55',
        type: 'fill',
        stem:
          '55. 根据句意及括号内的中文提示写出单词：Our school will ____（邀请）two foreign students to the Culture Week.',
        answer: 'invite',
        explanation:
          'will 后接动词原形，故填 invite。「邀请某人做某事」用 invite sb to do sth。',
        difficulty: 1,
        tags: ['单词拼写', '动词', '中外交流'],
      },

      /* ---------------- 写作 第二节：完成句子（5 小题 5 分） ---------------- */
      {
        id: 'eng-paper-03-q56',
        type: 'fill',
        stem:
          '根据所给的中文，在横线上填入合适的词语，使英文句子完整、通顺。\n\n56. 越来越多的外国人对中国文化感兴趣。\n____ foreigners are interested in Chinese culture.',
        answer: 'More and more',
        explanation:
          '「越来越多的」用 More and more（比较级 and 比较级结构），修饰可数名词复数 foreigners。注意句首首字母大写。',
        difficulty: 2,
        tags: ['完成句子', '比较级结构', '固定表达'],
      },
      {
        id: 'eng-paper-03-q57',
        type: 'fill',
        stem:
          '57. 这就是我上个月买的那本关于中国节日的书。\nThis is the book about Chinese festivals ____ I bought last month.',
        answer: 'that|which',
        explanation:
          '先行词 the book 指物，关系词在定语从句中作 bought 的宾语，用 that 或 which 均可。关系代词作宾语时口语中可省略，但填空题需要写出关系词。',
        difficulty: 2,
        tags: ['完成句子', '定语从句', '关系代词'],
      },
      {
        id: 'eng-paper-03-q58',
        type: 'fill',
        stem: '58. 中国的茶在几百年前被传到了欧洲。\nChinese tea ____ to Europe hundreds of years ago.',
        answer: 'was taken|was brought|was carried',
        explanation:
          '茶是「被带到」欧洲的，用被动语态；hundreds of years ago 是过去时间，故用一般过去时的被动语态 was + 过去分词。',
        difficulty: 3,
        tags: ['完成句子', '一般过去时的被动语态', '时态与语态'],
      },
      {
        id: 'eng-paper-03-q59',
        type: 'fill',
        stem:
          '59. 学习一门外语有助于了解另一种文化。\n____ a foreign language helps you understand another culture.',
        answer: 'Learning|To learn',
        explanation:
          '动名词或不定式都可以作主语，因为谓语是 helps（第三人称单数），用 Learning 最自然；位于句首时首字母大写。不能写 Learn a foreign language helps ... 这样的两个谓语结构。',
        difficulty: 3,
        tags: ['完成句子', '动名词作主语', '非谓语动词'],
      },
      {
        id: 'eng-paper-03-q60',
        type: 'fill',
        stem: '60. 你能告诉我这个博物馆什么时候开门吗？\nCould you tell me ____ this museum opens?',
        answer: 'when',
        explanation:
          '宾语从句中缺时间状语，用连接副词 when 引导；注意从句要用陈述语序（this museum opens，而不是 does this museum open）。',
        difficulty: 2,
        tags: ['完成句子', '宾语从句', '连接词'],
      },
    ],

    /* ------------------------------ 写作第三节 ------------------------------ */
    writing: {
      topic:
        '你校与美国友好学校开展交流活动，对方学生 Mike 将在本学期到一个中国家庭度过一个中国传统节日。请你给他写一封英文邮件，介绍你最喜欢的一个中国传统节日（如春节、中秋节、端午节等），内容包括：（1）这个节日的时间和主要活动；（2）你最喜欢它的原因；（3）邀请他一起过节，并给出一两条安排建议。请直接写邮件正文，称呼与落款已给出。',
      requirements: [
        '邮件正文须包含上面三个要点，可以适当发挥，但不要逐条翻译要点。',
        '正文 80—120 词（称呼与落款不计入词数）。',
        '至少使用一处定语从句或状语从句，并正确使用与该节日有关的一两个英文表达。',
        '文中不得出现真实姓名、校名等个人信息；书写规范，标点与大小写正确。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Dear Mike,\n\n' +
            'I am glad to hear that you will spend a Chinese festival with us. Let me tell you about my favourite one — the Mid-Autumn Festival.\n\n' +
            'It comes on the fifteenth day of the eighth lunar month, usually in September or October. On that evening, families have dinner together and eat mooncakes. After dinner, we go outside to look at the full moon, which is said to be the brightest of the year.\n\n' +
            'I like it best because it is a festival about being together. No matter how busy we are, we come home that evening.\n\n' +
            'Would you like to join us? We can make mooncakes together and watch the moon from my balcony.\n\n' +
            'Yours,\nLi Hua',
          cn:
            '亲爱的 Mike：\n\n' +
            '很高兴听说你要和我们一起过一个中国节日。让我给你介绍我最喜欢的一个——中秋节。\n\n' +
            '它在农历八月十五，通常在公历九月或十月。那天晚上，一家人一起吃晚饭、吃月饼。晚饭后我们到屋外赏月，据说这是一年中月亮最亮的时候。\n\n' +
            '我最喜欢它，因为这是一个关于「团聚」的节日。无论多忙，那天晚上我们都会回家。\n\n' +
            '你愿意来和我们一起过吗？我们可以一起做月饼，在我家阳台赏月。\n\n' +
            '你的朋友，\n李华',
          comment:
            '三个要点齐全（时间与活动、最喜欢的理由、邀请与安排），结构按「点题—介绍—理由—邀请」推进，层次清楚。语言上有三处突出得分点：which is said to be the brightest of the year 用非限制性定语从句补充说明，句式含量高；No matter how busy we are 让步状语从句把「团聚」的理由说得动人；结尾用 Would you like to join us? 提出邀请，再补一句具体安排，交际功能完整。节日专有名词（the Mid-Autumn Festival、the fifteenth day of the eighth lunar month、mooncakes、the full moon）都用得准确。若想更出色，可加一句对月饼味道或月亮景象的具体描写。',
          highlights: [
            {
              sentence: 'After dinner, we go outside to look at the full moon, which is said to be the brightest of the year.',
              why: '非限制性定语从句补充说明「满月」的含义，避免写成 After dinner, we look at the moon. It is bright. 这类零散短句。',
            },
            {
              sentence: 'I like it best because it is a festival about being together.',
              why: '用 because 给出理由，并抽象出节日的核心——团聚，比 It is very interesting 高出一个层次。',
            },
            {
              sentence: 'No matter how busy we are, we come home that evening.',
              why: '让步状语从句强化了「团聚」的分量，句式更难、也更有感染力，是升格的有效手段。',
            },
          ],
        },
        {
          level: '二类文（14—16 分）',
          text:
            'Dear Mike,\n\n' +
            'I am very happy that you will come to China and spend a festival with us. I want to tell you my favourite festival.\n\n' +
            'My favourite festival is the Spring Festival. It is in January or February. On that day, we wear new clothes, have a big dinner and watch TV. Children can get red envelopes. It is very happy.\n\n' +
            'I like it because all my family come home. We are together and we talk a lot.\n\n' +
            'Do you want to come to my home? We can eat dumplings together.\n\n' +
            'Yours,\nLi Hua',
          cn:
            '亲爱的 Mike：\n\n' +
            '很高兴你要来中国和我们一起过节。我想告诉你我最喜欢的节日。\n\n' +
            '我最喜欢的节日是春节，它在 1 月或 2 月。那天我们穿新衣服、吃大餐、看电视，孩子们能拿到红包。非常开心。\n\n' +
            '我喜欢它，因为全家人都回来。我们在一起，聊很多。\n\n' +
            '你想来我家吗？我们可以一起吃饺子。\n\n' +
            '你的朋友，\n李华',
          comment:
            '要点齐全、句子基本正确、格式规范，属于二类文（14—16 分）。扣分点主要有三处：一是句式几乎全是简单句，没有从句与连接词的层次，It is very happy 这类中式表达应改为 It is a happy time for everyone；二是活动只是罗列，缺少一处具体细节（如饺子里包硬币、贴春联的寓意）；三是理由写得单薄，可以补充一句为什么「在一起」对你重要。升格办法：把 We are together and we talk a lot 改为 At that time we do not look at our phones — we talk, laugh and tell stories.，并给节日加上一个定语从句。',
          highlights: [
            {
              sentence: 'Do you want to come to my home? We can eat dumplings together.',
              why: '邀请明确、安排具体，一句「邀请 + 一件具体活动」就能把第三个要点答满。',
            },
            {
              sentence: 'I like it because all my family come home.',
              why: '用 because 直接回答「为什么喜欢」，理由落在家庭团聚上，方向正确；若再补一个细节会更有说服力。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'I am glad to hear that you will spend a Chinese festival with us. —— 很高兴听说你要和我们一起过一个中国节日。',
        'Let me tell you about my favourite one — the Spring Festival / the Mid-Autumn Festival. —— 让我介绍我最喜欢的一个——春节／中秋节。',
        'It comes on the fifteenth day of the eighth lunar month. —— 它在农历八月十五。',
        'On that evening, families get together to have dinner and eat mooncakes. —— 那天晚上，一家人聚在一起吃晚饭、吃月饼。',
        'It is a festival about being together. —— 这是一个关于团聚的节日。',
        'No matter how busy we are, we come home that evening. —— 无论多忙，那天晚上我们都会回家。',
        'Would you like to join us this year? —— 今年你愿意和我们一起过吗？',
        'We can make mooncakes together and watch the moon from my balcony. —— 我们可以一起做月饼，在我家阳台赏月。',
        'I am sure you will love the taste and the story behind it. —— 我相信你会喜欢它的味道和它背后的故事。',
      ],
    },

    /* ------------------------------ 听说材料（30 分另场） ------------------------------ */
    listening: [
      {
        title: '模仿朗读：The Spring Festival in My Family（8 分）',
        text:
          'In my family, the Spring Festival starts a week before the first day of the new year. My mother cleans every corner of the flat, and my father puts up red paper on the windows. I am the one who writes the spring couplets — badly, but my grandmother says that is the point.\n\n' +
          "On New Year's Eve, we have the biggest dinner of the year. Everybody helps: my uncle cooks the fish, my aunt makes the soup, and I make dumplings with my cousins. We hide a coin in one dumpling. Whoever finds it is said to have good luck for the whole year.\n\n" +
          'At midnight, we open the windows and listen to the fireworks. The whole city sounds like one big drum. Then we call our relatives and wish them a happy new year — even those we have not seen for years.',
        cn:
          '在我家，春节从大年初一前一周就开始了。妈妈把屋里每个角落都打扫干净，爸爸在窗户上贴红纸。春联是我写的——写得不好，但奶奶说，这正是意义所在。\n\n' +
          '除夕那天，我们吃一年中最丰盛的一顿饭。每个人都动手：叔叔做鱼，姑姑做汤，我和表兄妹们包饺子。我们在一个饺子里藏一枚硬币，谁吃到它，据说一整年都会好运。\n\n' +
          '午夜，我们打开窗户听烟花，整座城市像一面大鼓。然后我们给亲戚打电话，祝他们新年快乐——连多年没见的亲戚也不例外。',
        cues: [
          '重音：the Spring Festival、New Year\'s Eve、the biggest dinner、a coin、good luck 等关键词要重读，突出节日的时间与习俗。',
          '连读与弱读：in my family 中 in my 连读；one of them、listen to the 中的 to 与 the 弱读。',
          '语调：列举三项时（my uncle cooks the fish, my aunt makes the soup, and I make dumplings）前两项用升调、最后一项用降调；末句破折号后语速放慢、句末降调。',
          '停顿：每到时间转换处（On New Year\'s Eve, / At midnight,）稍作停顿，让听众听出顺序。',
        ],
        tasks: [
          {
            id: 'eng-paper-03-l1-t1',
            type: 'choice',
            stem: 'Who writes the spring couplets in the speaker\'s family?',
            options: [
              'The speaker.',
              "The speaker's mother.",
              "The speaker's father.",
              "The speaker's grandmother.",
            ],
            answer: 'A',
            explanation:
              '第一段说 I am the one who writes the spring couplets，故写春联的是说话者本人，选 A；妈妈负责打扫，爸爸负责贴红纸。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '细节听取'],
          },
          {
            id: 'eng-paper-03-l1-t2',
            type: 'choice',
            stem: 'Why is a coin hidden in one dumpling?',
            options: [
              'To make the dumpling heavier than the others.',
              'Because whoever finds it is said to have good luck for the year.',
              'Because the family wants to keep the coin safe.',
              'Because the children like the taste of coins.',
            ],
            answer: 'B',
            explanation:
              '第二段说谁吃到藏了硬币的饺子，据说一整年都会走好运，故选 B。',
            difficulty: 2,
            tags: ['听说·模仿朗读', '因果关系'],
          },
          {
            id: 'eng-paper-03-l1-t3',
            type: 'choice',
            stem: 'What do they do at midnight?',
            options: [
              'They go to bed early after the big dinner.',
              'They clean the flat again for the new year.',
              'They open the windows, listen to the fireworks and call their relatives.',
              'They write more spring couplets for their neighbours.',
            ],
            answer: 'C',
            explanation:
              '第三段说午夜时他们打开窗户听烟花，然后给亲戚打电话拜年，故选 C。',
            difficulty: 1,
            tags: ['听说·模仿朗读', '细节听取'],
          },
        ],
      },
      {
        title: '信息获取：A Talk About the Museum Trip（14 分）',
        text:
          'Lily: Hi, Jack. Are you going on the school trip to the Guangdong Museum this Saturday?\n' +
          'Jack: Yes, I have signed up. The notice says we will meet at the school gate at half past eight.\n' +
          'Lily: How long will it take to get there by underground?\n' +
          'Jack: About forty minutes. We will arrive before nine thirty.\n' +
          'Lily: What are we going to see?\n' +
          'Jack: There is a special show about Chinese paper cutting, and a guided tour of the tea room. Our teacher says we should bring a notebook.\n' +
          'Lily: Do we need to pay for the tickets?\n' +
          'Jack: No. The museum is free for students, but you must show your student card at the door.\n' +
          'Lily: That is great. What time do we come back?\n' +
          'Jack: The bus leaves at three in the afternoon, and we will be back at school at about four.\n' +
          'Lily: Perfect. See you on Saturday!',
        cn:
          'Lily：你好，Jack。这周六学校组织去广东博物馆，你去吗？\n' +
          'Jack：去，我已经报名了。通知说我们八点半在校门口集合。\n' +
          'Lily：坐地铁到那儿要多久？\n' +
          'Jack：大约四十分钟，九点半前能到。\n' +
          'Lily：我们要看什么？\n' +
          'Jack：有一个关于中国剪纸的特展，还有茶室的讲解参观。老师说我们要带笔记本。\n' +
          'Lily：要买票吗？\n' +
          'Jack：不用。学生免费，但进门时要出示学生证。\n' +
          'Lily：太好了。我们什么时候回来？\n' +
          'Jack：大巴下午三点出发，大约四点回到学校。\n' +
          'Lily：太好了。周六见！',
        cues: [
          '语调：一般疑问句（Are you going on the school trip this Saturday?）用升调；特殊疑问句（What time do we come back?）用降调。',
          '重音：half past eight、forty minutes、three in the afternoon、free for students 等信息要重读。',
          '连读：get there 与 arrive before nine 都要连读，注意 not 与 no 的区分。',
          '弱读与缩略：we will 在口语中读成 we\'ll；the bus leaves at three 中 at 弱读。',
        ],
        tasks: [
          {
            id: 'eng-paper-03-l2-t1',
            type: 'choice',
            stem: 'When and where will the students meet?',
            options: [
              'At the school gate at eight thirty.',
              'At the museum gate at nine thirty.',
              'At the underground station at eight.',
              'At the school gate at nine.',
            ],
            answer: 'A',
            explanation:
              'Jack 说 we will meet at the school gate at half past eight（八点半在校门口集合），故选 A。九点半是到达博物馆的时间，属干扰项。',
            difficulty: 2,
            tags: ['听说·信息获取', '时间地点信息'],
          },
          {
            id: 'eng-paper-03-l2-t2',
            type: 'choice',
            stem: 'How long does it take to get to the museum by underground?',
            options: ['About fourteen minutes.', 'About thirty minutes.', 'About forty minutes.', 'About an hour.'],
            answer: 'C',
            explanation:
              'Jack 说 About forty minutes（大约四十分钟），故选 C。',
            difficulty: 1,
            tags: ['听说·信息获取', '数字信息'],
          },
          {
            id: 'eng-paper-03-l2-t3',
            type: 'choice',
            stem: 'What will the students see in the museum?',
            options: [
              'A show about Chinese paper cutting and a guided tour of the tea room.',
              'A show about modern robots and a film about the city.',
              'A concert of Chinese songs and a cooking class.',
              'A dragon boat race and a shadow puppet show.',
            ],
            answer: 'A',
            explanation:
              'Jack 说有一个关于中国剪纸的特展，还有茶室的讲解参观，故选 A。',
            difficulty: 1,
            tags: ['听说·信息获取', '细节听取'],
          },
          {
            id: 'eng-paper-03-l2-t4',
            type: 'choice',
            stem: 'What must students do when they enter the museum?',
            options: [
              'Pay forty yuan for the ticket.',
              'Show their student card at the door.',
              'Leave their notebooks at the gate.',
              'Wait for the teacher outside the tea room.',
            ],
            answer: 'B',
            explanation:
              'Jack 说学生免费，但进门时必须出示学生证，故选 B。带笔记本是老师对全组的要求，不是进馆时的检查（C 错）。',
            difficulty: 2,
            tags: ['听说·信息获取', '细节听取'],
          },
        ],
      },
      {
        title: '角色扮演：Booking a Calligraphy Class（8 分）',
        text:
          'Clerk: Good afternoon. This is the City Culture Centre. How can I help you?\n' +
          'Girl: Good afternoon. I would like to join the Chinese calligraphy class. Can you tell me when it starts?\n' +
          'Clerk: Certainly. The class is on Saturday mornings, from nine to eleven. It begins on the sixth of March.\n' +
          'Girl: How many students are there in one class?\n' +
          'Clerk: Twelve. Each student gets a brush, paper and ink, but you should bring your own notebook.\n' +
          'Girl: Is it free for middle school students?\n' +
          'Clerk: Yes, it is free, but you need to show your student card on the first day.\n' +
          'Girl: Great. One more question: do I have to write well to join?\n' +
          'Clerk: Not at all. Our teacher, Mr Zhao, always says that the first hundred characters are for practice, not for showing.',
        cn:
          '工作人员：下午好，这里是市文化中心，有什么能帮你的吗？\n' +
          '女孩：下午好。我想报名中国书法班，能告诉我什么时候开课吗？\n' +
          '工作人员：当然。课程在每周六上午九点到十一点，三月六日开课。\n' +
          '女孩：一个班有多少人？\n' +
          '工作人员：十二人。每位学员都能领到毛笔、纸和墨，但你需要自己带笔记本。\n' +
          '女孩：中学生免费吗？\n' +
          '工作人员：免费，不过第一天要出示学生证。\n' +
          '女孩：太好了。还有一个问题：一定要写得好才能参加吗？\n' +
          '工作人员：完全不用。我们的赵老师常说，前一百个字是用来练的，不是用来展示的。',
        cues: [
          '语调：打电话询问时用升调（Can you tell me when it starts?）；确认信息时用降调（It begins on the sixth of March.）。',
          '重音：Saturday mornings、nine to eleven、twelve、free、student card 这些信息要重读。',
          '连读：would like to 中 like to 连读；not at all 三词连读成一个整体。',
          '复述提示：按「报名什么课—上课时间—开课日期—班级人数—要带什么—是否免费—零基础能否参加」的顺序复述。',
        ],
        tasks: [
          {
            id: 'eng-paper-03-l3-t1',
            type: 'choice',
            stem: '复述题：Which of the following is the best retelling of the phone call to the City Culture Centre?',
            options: [
              'A girl asked about a free calligraphy class on Saturday mornings; it begins on 6 March, and each student should bring a notebook.',
              'A girl booked a cooking class on Sunday afternoon and was told to pay forty yuan.',
              'A clerk told the girl that she could not join the class unless she wrote well.',
              'A girl asked about a paper-cutting class beginning on 16 March with twenty places.',
            ],
            answer: 'A',
            explanation:
              '对话要点是：女孩打电话咨询免费的书法班，时间是周六上午九点到十一点、3 月 6 日开课，每班 12 人，需自带笔记本，故选 A。B 的科目、时间与费用都错；C 与「零基础也能参加」相反；D 的日期与人数都错。',
            difficulty: 2,
            tags: ['听说·角色扮演', '复述', '信息整合'],
          },
          {
            id: 'eng-paper-03-l3-t2',
            type: 'choice',
            stem:
              'You want to know how many students there are in one class. Which question is the most suitable?',
            options: [
              'How much does the class cost?',
              'How many students are there in one class?',
              'How long does each class last?',
              'Who is the teacher of the class?',
            ],
            answer: 'B',
            explanation:
              '问人数要用 How many students are there ...；A 问费用、C 问时长、D 问授课老师，都不能得到人数信息。',
            difficulty: 1,
            tags: ['听说·角色扮演', '询问', '功能句'],
          },
          {
            id: 'eng-paper-03-l3-t3',
            type: 'choice',
            stem: 'What should the girl bring and what should she show on the first day?',
            options: [
              'She should bring a brush and pay for the ink.',
              'She should bring her notebook and show her student card.',
              'She should bring her own teacher and a chair.',
              'She should show a letter from her school first.',
            ],
            answer: 'B',
            explanation:
              '工作人员说毛笔、纸、墨由中心提供，但学员要自备笔记本，且第一天要出示学生证，故选 B。',
            difficulty: 2,
            tags: ['听说·角色扮演', '回答', '细节听取'],
          },
        ],
      },
    ],
  },
];
