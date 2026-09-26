import type { EnglishKnowledge } from '../../../types';

/**
 * 英语 · 语法模块（按广州中考知识模块组织，不按教材单元）。
 *
 * 卷面依据：2027—2029 年广州中考英语「语言（知识）运用 第一节 选择题」
 * （10 小题 15 分）主要考时态、语态、非谓语、三大从句、情态动词、代词冠词、
 * 介词连词与主谓一致，故本模块按这 11 个考点成条。
 *
 * 每条都按「规则 + 形式 + 例句 + 怎么判断」写：中考语法题不是考「知不知道」，
 * 而是考「能不能在 20 秒内从标志词锁定考点」，所以 rules[].tip 与
 * points[].explain 一律写判断路径，例句全部原创。
 */

export const topics: EnglishKnowledge[] = [
  /* ------------------------------------------------------------------ */
  /* 1. 时态（一）：一般现在 / 一般过去 / 一般将来                        */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-1',
    grade: 'all',
    unit: '时态',
    title: '时态（一）一般现在时·一般过去时·一般将来时',
    enTitle: 'Simple Present, Simple Past and Simple Future',
    summary: '用时间状语和主语人称两把钥匙，锁定三种最基础的时态，解决选择题中「动词形式」的第一大类失分。',
    points: [
      {
        level: '重点',
        text: '一般现在时：习惯动作、客观真理、时刻表',
        explain:
          '看到 always, usually, often, sometimes, every day, once a week, on Sundays 这类词，基本确定用一般现在时。另外要盯主语：主语是 he/she/it 或单数名词时，动词必须加 -s/-es；主语是 I/you/we/they 时用原形。选择题最常见的失分点就是「主语是第三人称单数却给动词原形」。',
      },
      {
        level: '重点',
        text: '一般过去时：明确过去时间状语 + 动词过去式',
        explain:
          '题干出现 yesterday, last week, two days ago, in 2015, just now, then, at that time 等明确过去时间，动词一律用过去式，绝不能用现在完成时。判断顺序是：先找时间状语，再看动词；找不到时间状语才考虑语境。否定和疑问用 did，后面动词回原形。',
      },
      {
        level: '重点',
        text: '一般将来时：will do 与 be going to do 的分工',
        explain:
          '看到 tomorrow, next week, in two days, this evening, soon 就用将来时。选择 will 还是 be going to，看有没有「计划」和「迹象」：临时决定、单纯的预测、承诺用 will；事先想好的计划，或有明显迹象（Look at the dark clouds.）用 be going to。两者都不接动词原形以外的形式。',
      },
      {
        level: '次重点',
        text: '主将从现：if / when / as soon as 引导的从句用现在时表将来',
        explain:
          '这是广州中考的固定考法：主句是将来时，if（如果）、when（当……时）、as soon as（一……就）、until、before 引导的从句要用一般现在时代替一般将来时。看到选项里从句出现 will，先怀疑它是错的。',
      },
      {
        level: '次重点',
        text: '一般现在时表客观真理',
        explain:
          '宾语从句里陈述的是客观真理、自然规律、谚语时，从句不受主句过去时影响，仍用一般现在时。典型题干是 The teacher told us that the earth moves around the sun.；只要从句内容是「永远成立」的事实，就不要跟着主句变过去。',
      },
      {
        level: '了解',
        text: '三种时态的否定式与疑问式',
        explain:
          '一般现在时第三人称单数用 does not（doesn\'t）+ 原形，其余用 do not；一般过去时用 did not + 原形；一般将来时用 will not + 原形。填词题里最容易错的是把 did not 后的动词又写成过去式。',
      },
    ],
    rules: [
      {
        rule: '一般现在时：主语 + 动词原形／第三人称单数形式，表示习惯与经常发生的事',
        form: '主语 + do/does；否定 do not/does not + 动词原形；疑问 Do/Does + 主语 + 动词原形',
        example: 'My brother goes to school by bike every day.',
        cn: '我弟弟每天骑自行车上学。',
        tip: '先圈出 every day 这类频度时间，再看主语是不是第三人称单数——两个条件都满足就一定加 -s/-es。',
      },
      {
        rule: '一般现在时表客观真理、自然规律与时刻表',
        form: '主语 + do/does（不随时间改变的事实）',
        example: 'Water boils at 100 degrees Celsius.',
        cn: '水在 100 摄氏度沸腾。',
        tip: '宾语从句里出现自然规律、科学事实，即使主句是 told us，从句也用一般现在时。',
      },
      {
        rule: '一般过去时：过去某个时间发生并已结束的动作',
        form: '主语 + 动词过去式；否定 did not + 动词原形；疑问 Did + 主语 + 动词原形',
        example: 'We visited the Science Museum last Sunday.',
        cn: '上周日我们参观了科学博物馆。',
        tip: '有 yesterday / last … / … ago / in 2015 就选过去式；一旦用了 did，后面动词必须回原形。',
      },
      {
        rule: '一般将来时 will：临时决定、预测、承诺、请求',
        form: '主语 + will + 动词原形；否定 will not（won\'t）+ 动词原形',
        example: 'I will call you as soon as I get home.',
        cn: '我一到家就给你打电话。',
        tip: '这个句子里既有将来时又有主将从现：主句用 will，as soon as 从句用 get，是广州中考最常见的组合考点。',
      },
      {
        rule: 'be going to do：事先的计划，或有迹象的预测',
        form: '主语 + am/is/are going to + 动词原形',
        example: 'Look at the dark clouds. It is going to rain.',
        cn: '看那些乌云，快要下雨了。',
        tip: '题干里有 Look! / Listen! 加上明显迹象，就用 be going to 而不是 will。',
      },
      {
        rule: '主将从现：时间、条件状语从句中不用将来时',
        form: '主句（一般将来时）+ if/when/as soon as/until/before + 从句（一般现在时）',
        example: 'If it rains tomorrow, we will stay at home.',
        cn: '如果明天下雨，我们就待在家里。',
        tip: '在 if 和 when 引导的从句里找 will——只要出现就基本可以判定为错误选项。',
      },
      {
        rule: '时刻表、日程用一般现在时表将来',
        form: '主语（车次、航班、会议等）+ do/does + 将来时间状语',
        example: 'The plane leaves at nine tomorrow morning.',
        cn: '飞机明天早上九点起飞。',
        tip: '主语是 the train / the flight / the film 这类按时刻表运行的词，即使时间是 tomorrow，也用一般现在时。',
      },
    ],
    mistakes: [
      {
        wrong: 'He go to school by bike every day.',
        right: 'He goes to school by bike every day.',
        why: '主语 He 是第三人称单数，一般现在时动词要加 -es。这是选择题里最常见的「动词形式」送分题，也最容易看漏。',
      },
      {
        wrong: 'I did not went to the park yesterday.',
        right: 'I did not go to the park yesterday.',
        why: '助动词 did 已经承担了「过去」的含义，后面的动词必须用原形。看到 did/did not/Does 之后，动词一定回原形。',
      },
      {
        wrong: 'If it will rain tomorrow, we will stay at home.',
        right: 'If it rains tomorrow, we will stay at home.',
        why: 'if 引导条件状语从句时用一般现在时表将来（主将从现）。一个句子里只允许主句出现 will。',
      },
      {
        wrong: 'The teacher told us that the earth went around the sun.',
        right: 'The teacher told us that the earth goes around the sun.',
        why: '从句讲的是客观真理，不随主句时态改变，仍用一般现在时。主句是过去时也不能把客观事实改成过去时。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-1-q1',
        type: 'choice',
        stem: 'My sister ______ TV for half an hour every evening.',
        options: ['watch', 'watches', 'watched', 'is watching'],
        answer: 'B',
        explanation:
          'every evening 说明是经常性动作，用一般现在时；主语 My sister 是第三人称单数，动词加 -es。watched 是被 every evening 排除的过去式，is watching 表示此刻正在做。',
        difficulty: 1,
        tags: ['一般现在时', '第三人称单数'],
      },
      {
        id: 'eng-grammar-1-q2',
        type: 'choice',
        stem: '— ______ you ______ the science film last night?\n— Yes, it was wonderful.',
        options: ['Did / see', 'Did / saw', 'Do / see', 'Have / saw'],
        answer: 'A',
        explanation:
          'last night 是明确过去时间，用一般过去时的一般疑问句：Did + 主语 + 动词原形。B 项 saw 没有回原形，C 项时态不对，D 项 have 不能与 last night 连用。',
        difficulty: 1,
        tags: ['一般过去时', '疑问句'],
      },
      {
        id: 'eng-grammar-1-q3',
        type: 'choice',
        stem: '— What is your plan for the summer holiday?\n— I ______ a trip to Guangzhou Zoo with my cousin.',
        options: ['take', 'took', 'am going to take', 'have taken'],
        answer: 'C',
        explanation:
          '问句问的是「计划」，答句谈的是打算要做的事，用 be going to do 表示事先的计划；主语是 I，所以是 am going to take。take 是一般现在时，不能表示一次性的将来计划；took 是过去时，have taken 是现在完成时，都与暑假的计划不符。',
        difficulty: 1,
        tags: ['一般将来时', 'be going to'],
      },
      {
        id: 'eng-grammar-1-q4',
        type: 'choice',
        stem: 'If it ______ tomorrow, we will not go to the park.',
        options: ['rains', 'will rain', 'rained', 'is raining'],
        answer: 'A',
        explanation:
          'if 引导条件状语从句，主句已经用了 will not go，从句要用一般现在时表将来，这就是主将从现。B 项是典型的 will 滥用错误。',
        difficulty: 2,
        tags: ['主将从现', '条件状语从句'],
      },
      {
        id: 'eng-grammar-1-q5',
        type: 'choice',
        stem: 'My father ______ back from Beijing three days ago.',
        options: ['comes', 'came', 'will come', 'has come'],
        answer: 'B',
        explanation:
          'three days ago 是明确的过去时间点，只能用一般过去时 came。D 项现在完成时不能与 ago 连用，这是「现在完成时 vs 一般过去时」最常设的陷阱。',
        difficulty: 2,
        tags: ['一般过去时', '现在完成时辨析'],
      },
      {
        id: 'eng-grammar-1-q6',
        type: 'choice',
        stem: 'Our geography teacher told us that the earth ______ around the sun.',
        options: ['went', 'goes', 'will go', 'is going'],
        answer: 'B',
        explanation:
          'that 从句陈述的是客观真理，主句虽为过去时，从句仍用一般现在时 goes。这是宾语从句时态一致规则中唯一的例外，广州中考多次考查。',
        difficulty: 2,
        tags: ['一般现在时', '客观真理', '宾语从句'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 2. 时态（二）：现在进行 / 过去进行 / 现在完成                        */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-2',
    grade: 'all',
    unit: '时态',
    title: '时态（二）现在进行时·过去进行时·现在完成时',
    enTitle: 'Present Continuous, Past Continuous and Present Perfect',
    summary: '抓住「正在做」与「已经做完且影响现在」的分界，重点攻克广州中考最高频的现在完成时与一般过去时的辨析。',
    points: [
      {
        level: '重点',
        text: '现在进行时：now / Look! / Listen! + be + doing',
        explain:
          '题干出现 now, at the moment, Look!, Listen! 或 Where is …? 这类问「此刻在哪」的句子，就用 be + 动词 -ing。注意 -ing 的拼写（run→running, write→writing）和状态动词（know, like, have 表示「有」时）不用进行时。',
      },
      {
        level: '重点',
        text: '过去进行时：过去某一时刻正在发生',
        explain:
          '找 at eight o\'clock last night, at that time, this time yesterday 这类「过去的时间点」，用 was/were + doing。另一种考法是与一般过去时搭配：when + 短暂动作（一般过去时），while + 持续动作（过去进行时）。',
      },
      {
        level: '重点',
        text: '现在完成时：already / yet / ever / never / just / since / for',
        explain:
          '只要出现 already, yet, ever, never, just, twice, since 2019, for three years, so far, in the last few years，优先选 have/has + 过去分词。它的核心含义是「过去发生、和现在有关」，因此强调对现在的影响，不关心发生的时间。',
      },
      {
        level: '重点',
        text: '现在完成时与一般过去时的分界（广州高频）',
        explain:
          '判断只看一个标准：句中有没有明确过去时间状语。有 yesterday, last week, in 2019, two days ago，只能用一般过去时；没有时间状语、只谈到现在的结果或经历，用现在完成时。同一个中文意思「我丢了我的钥匙」在两种语境下要选不同时态。',
      },
      {
        level: '次重点',
        text: '瞬间动词与延续性动词：for / since 只能跟延续性表达',
        explain:
          'for three years, since 2020 要求动词能延续。join, buy, borrow, begin, come, leave, die 这类瞬间动词要换成 be in / be a member of, have, keep, be on, be away, be dead 等。看到 for + 一段时间与瞬间动词同现，就找「换词」的选项。',
      },
      {
        level: '次重点',
        text: 'have been to 与 have gone to 的区别',
        explain:
          'have been to 表示「去过（已经回来）」，have gone to 表示「去了（人不在这里）」。题干里出现 Where is Tom? 或 He is not here.，就说明人不在，用 has gone to；出现 twice, before, ever 这类经历词，用 have been to。',
      },
      {
        level: '了解',
        text: '进行时与现在完成时的否定、疑问形式',
        explain: '否定在第一个助动词后加 not：is not doing, have not done；疑问把 is/was/has 提前：Is he reading? Have you finished? 填词题注意 Already 在疑问句里要换成 yet。',
      },
    ],
    rules: [
      {
        rule: '现在进行时：说话此刻正在进行的动作',
        form: '主语 + am/is/are + 动词 -ing',
        example: 'Listen! Someone is singing in the next room.',
        cn: '听！有人在隔壁房间唱歌。',
        tip: '看到 Listen! / Look! / now / at the moment，直接锁定 be + doing，不必再读完整句。',
      },
      {
        rule: '过去进行时：过去某一时刻或某段时间正在进行的动作',
        form: '主语 + was/were + 动词 -ing',
        example: 'I was doing my homework at eight o\'clock last night.',
        cn: '昨晚八点我正在做作业。',
        tip: 'at + 过去的具体时刻是最典型的标志；主语是 I/he/she/it 或单数名词用 was。',
      },
      {
        rule: 'when 与 while 的分工：短暂动作用 when，持续动作用 while',
        form: 'when + 一般过去时（突然发生）；while + 过去进行时（一直在进行）',
        example: 'While I was walking home, I met an old friend.',
        cn: '我走路回家时，遇到了一位老朋友。',
        tip: '把句子倒过来说也对：I was walking home when I met an old friend. 从句里用 while 时，后面几乎总是进行时。',
      },
      {
        rule: '现在完成时：过去发生的动作对现在造成的影响，或到现在的经历',
        form: '主语 + have/has + 过去分词',
        example: 'I have already finished my homework, so I can watch TV now.',
        cn: '我已经做完作业了，所以现在可以看电视。',
        tip: 'already 用在肯定句，yet 用在否定句和疑问句，两个词都是现在完成时的强信号。',
      },
      {
        rule: 'since 与 for 的区别',
        form: 'since + 时间点（2019, last year, he came here）；for + 一段时间（three years, two months）',
        example: 'He has lived in Guangzhou since 2019.',
        cn: '他从 2019 年起就住在广州。',
        tip: 'since 后面是「起点」，for 后面是「长度」。看到 since，主句的动词要用现在完成时。',
      },
      {
        rule: '现在完成时与一般过去时的分界：有无明确过去时间状语',
        form: '有 yesterday/last…/…ago/in 2019 → 一般过去时；无明确时间、强调现在结果 → 现在完成时',
        example: 'I have lost my key, so I cannot open the door. / I lost my key yesterday.',
        cn: '我把钥匙丢了，所以开不了门。／我昨天把钥匙丢了。',
        tip: '同一件事，加了 yesterday 就必须改成一般过去时；这是选择题最爱的「换一个时间状语换一个选项」。',
      },
      {
        rule: '瞬间动词在现在完成时中要换成延续性表达',
        form: 'join → be in / be a member of；buy → have；borrow → keep；begin → be on；leave → be away；die → be dead',
        example: 'He has been in the army for two years.',
        cn: '他参军两年了。',
        tip: '只要句中出现 for + 一段时间，而动词是 join/buy/begin 这类不能延续的词，正确答案一定是把动词换掉的那个选项。',
      },
      {
        rule: 'have been to 与 have gone to',
        form: 'have/has been to + 地点（去过，已回来）；have/has gone to + 地点（去了，人不在此）',
        example: '— Where is Kate? — She has gone to the library.',
        cn: '——凯特在哪里？——她去图书馆了。',
        tip: '题干问 Where is …? 或说她不在场，就用 has gone to；出现 twice/before/ever 这类经历词，用 has been to。',
      },
    ],
    mistakes: [
      {
        wrong: 'I have seen him yesterday.',
        right: 'I saw him yesterday.',
        why: '现在完成时不能与 yesterday, last week, ago 等明确过去时间状语连用。这类错误在选择题中往往以「已经给出过去时间，选项里放现在完成时」的形式出现。',
      },
      {
        wrong: 'He has joined the club for three years.',
        right: 'He has been in the club for three years.',
        why: 'join 是瞬间动词，不能与 for three years 连用；表示状态延续要用 be in（或 be a member of）。',
      },
      {
        wrong: 'I am knowing the answer to this question.',
        right: 'I know the answer to this question.',
        why: 'know, like, want, belong to 等表示状态、心理的动词一般不用进行时，即使中文说「正在知道」也要用一般现在时。',
      },
      {
        wrong: 'When I was watching TV, the telephone was ringing.',
        right: 'When I was watching TV, the telephone rang.',
        why: '电话铃响是瞬间动作，用一般过去时；只有持续的背景动作用过去进行时，两个动作不宜都用进行时。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-2-q1',
        type: 'choice',
        stem: '— Where is your mother?\n— She ______ in the kitchen.',
        options: ['cooks', 'is cooking', 'cooked', 'has cooked'],
        answer: 'B',
        explanation:
          '问的是「现在在哪里」，答句说明此刻正在进行的动作，用现在进行时 is cooking。cooks 表示经常做饭，与「她在哪」对不上。',
        difficulty: 1,
        tags: ['现在进行时', '语境判断'],
      },
      {
        id: 'eng-grammar-2-q2',
        type: 'choice',
        stem: 'I ______ my homework when the telephone rang.',
        options: ['do', 'did', 'was doing', 'have done'],
        answer: 'C',
        explanation:
          '电话铃响（rang）是过去突然发生的短暂动作，当时「做作业」这个动作正在进行，用过去进行时 was doing。这是 when + 一般过去时／主句过去进行时的经典搭配。',
        difficulty: 2,
        tags: ['过去进行时', 'when'],
      },
      {
        id: 'eng-grammar-2-q3',
        type: 'choice',
        stem: '— Have you ever ______ to Shanghai?\n— Yes, I ______ there last summer.',
        options: ['been / went', 'gone / went', 'been / have been', 'gone / was'],
        answer: 'A',
        explanation:
          'ever 问的是经历，用 have been to；答句有 last summer 这一明确过去时间，必须改用一般过去时 went。这是现在完成时与一般过去时在同一组对话中并存的最典型考法。',
        difficulty: 3,
        tags: ['现在完成时', '一般过去时', '时态辨析'],
      },
      {
        id: 'eng-grammar-2-q4',
        type: 'choice',
        stem: 'My uncle ______ in this city since he left school.',
        options: ['works', 'worked', 'has worked', 'is working'],
        answer: 'C',
        explanation:
          'since 引导的时间状语从句说明起点，主句要用现在完成时 has worked，表示从过去持续到现在。works 只讲现在，worked 只讲过去，都不能表达「一直持续到现在」。',
        difficulty: 2,
        tags: ['现在完成时', 'since'],
      },
      {
        id: 'eng-grammar-2-q5',
        type: 'choice',
        stem: '— ______ you ______ your homework yet?\n— Not yet. I will finish it in ten minutes.',
        options: ['Did / finish', 'Have / finished', 'Do / finish', 'Are / finishing'],
        answer: 'B',
        explanation:
          'yet 用在疑问句和否定句中，是现在完成时的标志词；答句 Not yet（还没有）也提示动作尚未完成但对现在有影响。故选 Have / finished。',
        difficulty: 2,
        tags: ['现在完成时', 'yet'],
      },
      {
        id: 'eng-grammar-2-q6',
        type: 'choice',
        stem: 'My grandfather ______ for three years, but we still miss him very much.',
        options: ['has died', 'has been dead', 'died', 'is dying'],
        answer: 'B',
        explanation:
          'for three years 要求动词能延续，且状态从过去持续到现在，用现在完成时；die 是瞬间动词，不能与 for three years 连用，必须换成 be dead，所以是 has been dead。died 是一般过去时，不能与 for three years 连用；is dying 表示「快要死了」，与句意不符。',
        difficulty: 3,
        tags: ['现在完成时', '瞬间动词', '延续性'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 3. 被动语态                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-3',
    grade: 'all',
    unit: '语态',
    title: '被动语态：各时态的被动与感官动词·使役动词',
    enTitle: 'The Passive Voice',
    summary: '用「主语是动作的承受者」一条标准判断该不该用被动，再按时间状语搭出 be + 过去分词的正确形式。',
    points: [
      {
        level: '重点',
        text: '一般现在时与一般过去时的被动',
        explain:
          '先判断主语是「做」还是「被做」：主语是物、或动作的执行者由 by 引出，就用被动。一般现在时被动是 am/is/are + 过去分词，一般过去时被动是 was/were + 过去分词。选择题常把过去分词的时态和 be 的时态拆开考查。',
      },
      {
        level: '重点',
        text: '含情态动词与一般将来时的被动',
        explain:
          '情态动词后面接 be + 过去分词：can/must/should/may be done；一般将来时被动是 will be done。只要选项里出现情态动词后直接跟过去分词、或 will + 过去分词（漏 be），即可排除。',
      },
      {
        level: '重点',
        text: '现在完成时的被动',
        explain:
          '形式是 have/has been + 过去分词。标志词与现在完成时相同：already, yet, since, for, so far。看到 has 后面只有过去分词、没有 been，说明被动漏了 be，是常见错项。',
      },
      {
        level: '次重点',
        text: '使役动词与感官动词的被动：补 to',
        explain:
          '主动句 make/let/have sb do、see/hear/watch sb do 省略 to，改成被动后 to 必须还原：be made to do, be seen to do。这是广州中考被动语态里失分最多的一条。',
      },
      {
        level: '次重点',
        text: '主动形式表被动意义的动词',
        explain:
          'look, sound, smell, taste, feel 后接形容词时用主动：The soup tastes good.；sell, write, read, open, close 说明事物自身特性时也用主动：The book sells well. 这类题一旦按「翻译成中文是被动」去选 be + 过去分词，必错。',
      },
      {
        level: '了解',
        text: '不及物动词没有被动语态',
        explain: 'happen, take place, appear, rise, come true, belong to 等不及物动词或短语没有被动语态，看到 was happened, was taken place 一律排除。',
      },
      {
        level: '了解',
        text: '短语动词的被动与双宾语动词的两种被动',
        explain:
          '短语动词要整体变被动，介词、副词不能丢：look after → be looked after, put off → be put off。带双宾语的动词有两种被动：He was given a book. / A book was given to him.。',
      },
    ],
    rules: [
      {
        rule: '一般现在时的被动语态',
        form: '主语 + am/is/are + 过去分词（+ by …）',
        example: 'The classrooms are cleaned by the students every day.',
        cn: '教室每天由学生打扫。',
        tip: '主语 classrooms 不能自己打扫，只能被打扫；every day 决定 be 用一般现在时。',
      },
      {
        rule: '一般过去时的被动语态',
        form: '主语 + was/were + 过去分词（+ by …）',
        example: 'The bridge was built in 1998.',
        cn: '这座桥建于 1998 年。',
        tip: 'in 1998 是过去时间点，be 用 was/were，动词用过去分词 build→built。',
      },
      {
        rule: '情态动词的被动语态',
        form: '主语 + 情态动词 + be + 过去分词',
        example: 'Waste paper must be put into the right bin.',
        cn: '废纸必须放进正确的垃圾桶。',
        tip: '情态动词后面永远是动词原形，所以被动只能是「情态动词 + be + 过去分词」，中间不能少 be。',
      },
      {
        rule: '一般将来时的被动语态',
        form: '主语 + will be + 过去分词',
        example: 'A new library will be built in our school next year.',
        cn: '明年我们学校将建成一座新图书馆。',
        tip: '看到 next year 就选将来时，看到主语是物就加 be——两件事同时满足，答案是 will be + 过去分词。',
      },
      {
        rule: '现在完成时的被动语态',
        form: '主语 + have/has been + 过去分词',
        example: 'The work has been finished already.',
        cn: '这项工作已经完成了。',
        tip: 'already/since/so far 提示现在完成时，主语是物提示被动，两者合一就是 has been + 过去分词。',
      },
      {
        rule: '使役动词 make 的被动要还原 to',
        form: '主动：make sb do sth → 被动：sb be made to do sth',
        example: 'The boy was made to clean the classroom after school.',
        cn: '那个男孩被要求放学后打扫教室。',
        tip: '只要题干是被动语态且动词是 make/let/have，就找带 to 的选项——不带 to 的一定错。',
      },
      {
        rule: '感官动词主动省略 to，被动还原 to',
        form: '主动：see/hear/watch sb do sth → 被动：sb be seen/heard/watched to do sth（to 必须出现）',
        example: 'He was often seen to help others in the neighbourhood.',
        cn: '人们常常看到他在小区里帮助别人。',
        tip: '主动句里没有 to，被动句里必须有 to，这是出题人最爱设的「补 to」考点。',
      },
      {
        rule: '感官系动词与部分实义动词用主动表被动',
        form: 'look/sound/smell/taste/feel + 形容词；sell/read/write/open + 副词',
        example: 'The soup tastes delicious, and the book sells well.',
        cn: '这汤尝起来很美味，这本书很畅销。',
        tip: '中文里的「被尝」「被卖」在英语里都写主动；只要后面跟的是形容词或 well 这类副词，就不要用被动。',
      },
      {
        rule: '不及物动词与短语动词的被动处理',
        form: '不及物动词无被动；短语动词整体变被动，介词、副词不能省略',
        example: 'The old man is looked after by his neighbours.',
        cn: '这位老人由邻居们照顾。',
        tip: 'happen/take place 没有被动；look after 这类短语动词变被动时，after 不能丢，选项里少了介词的直接排除。',
      },
    ],
    mistakes: [
      {
        wrong: 'The accident was happened last night.',
        right: 'The accident happened last night.',
        why: 'happen 是不及物动词，没有被动语态。类似还有 take place, appear, belong to，都是中考选择题的固定错项。',
      },
      {
        wrong: 'The little boy was made clean the room.',
        right: 'The little boy was made to clean the room.',
        why: 'make sb do 的主动句省略 to，变被动后必须还原：be made to do。这是被动语态题里丢分最多的一条。',
      },
      {
        wrong: 'The homework must finish before Friday.',
        right: 'The homework must be finished before Friday.',
        why: '作业是被完成的，必须用被动；情态动词后要接「be + 过去分词」，漏掉 be 是情态动词被动最典型的错误。',
      },
      {
        wrong: 'This kind of book is sold well in our school.',
        right: 'This kind of book sells well in our school.',
        why: 'sell well 说明事物自身特性，用主动形式表被动意义，不能写成 is sold well。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-3-q1',
        type: 'choice',
        stem: 'The Great Wall ______ by thousands of visitors every year.',
        options: ['visits', 'is visiting', 'is visited', 'visited'],
        answer: 'C',
        explanation:
          '主语 The Great Wall 是动作的承受者，by thousands of visitors 明确引出执行者，用被动语态；every year 决定用一般现在时的被动 is visited。',
        difficulty: 1,
        tags: ['一般现在时被动', 'by 短语'],
      },
      {
        id: 'eng-grammar-3-q2',
        type: 'choice',
        stem: 'These trees ______ by the students last spring.',
        options: ['plant', 'planted', 'were planted', 'are planted'],
        answer: 'C',
        explanation:
          'last spring 是过去时间，be 用过去式；树是被种的，所以用被动 were planted。planted 只是主动的过去式，缺少 be。',
        difficulty: 2,
        tags: ['一般过去时被动', '时间状语'],
      },
      {
        id: 'eng-grammar-3-q3',
        type: 'choice',
        stem: '— Must I hand in the report now?\n— No, it ______ before Friday.',
        options: ['must finish', 'must be finished', 'can finish', 'finishes'],
        answer: 'B',
        explanation:
          '报告是被上交的，要用被动；情态动词后接 be + 过去分词，所以是 must be finished。A、C、D 都是主动形式，报告不会自己完成。',
        difficulty: 2,
        tags: ['情态动词被动'],
      },
      {
        id: 'eng-grammar-3-q4',
        type: 'choice',
        stem: 'A new subway line ______ in our city next year.',
        options: ['builds', 'will build', 'will be built', 'is building'],
        answer: 'C',
        explanation:
          '地铁线路是被修建的，next year 说明用将来时，合起来是一般将来时的被动 will be built。B 项 will build 是主动，缺少 be。',
        difficulty: 2,
        tags: ['一般将来时被动'],
      },
      {
        id: 'eng-grammar-3-q5',
        type: 'choice',
        stem: 'The little boy ______ to say sorry to his classmate at last.',
        options: ['made', 'was made', 'is made', 'has made'],
        answer: 'B',
        explanation:
          '男孩是「被要求」道歉的，用被动；make sb do 变被动后要还原 to，所以是 was made to say sorry。A、D 是主动，C 的时态与 at last 不符。',
        difficulty: 3,
        tags: ['使役动词被动', '还原 to'],
      },
      {
        id: 'eng-grammar-3-q6',
        type: 'choice',
        stem: 'The old man ______ by his neighbours for many years.',
        options: ['looks after', 'is looking after', 'has been looked after', 'has looked after'],
        answer: 'C',
        explanation:
          'for many years 表示从过去延续到现在，用现在完成时；老人是被照顾的，用被动，合起来是 has been looked after。短语动词的介词 after 不能丢。',
        difficulty: 3,
        tags: ['现在完成时被动', '短语动词'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 4. 非谓语动词                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-4',
    grade: 'all',
    unit: '非谓语',
    title: '非谓语动词：不定式、动名词与常见句型',
    enTitle: 'Infinitives and Gerunds',
    summary: '一个句子只有一个谓语，其余动词要么带 to、要么变 -ing；牢记动词搭配表，选择题就能一眼定形式。',
    points: [
      {
        level: '重点',
        text: '接不定式（to do）的动词与句型',
        explain:
          'want, hope, wish, decide, plan, agree, learn, would like, try, promise 后面接 to do；ask/tell/want/would like sb to do 是「动词 + 宾语 + to do」结构。选择题看到这些动词后跟 doing，直接排除。',
      },
      {
        level: '重点',
        text: '接动名词（doing）的动词与句型',
        explain:
          'enjoy, finish, mind, practise, keep, suggest, avoid, be busy, be worth, have fun 后面接 doing。注意 look forward to, be used to, pay attention to, get used to 里的 to 是介词，后面也必须接 doing，这是最隐蔽的陷阱。',
      },
      {
        level: '重点',
        text: '使役动词与感官动词后接动词原形',
        explain:
          'make/let/have sb do sth，see/hear/watch/notice sb do sth（看到整个动作）或 doing（看到正在进行的片段）。这类题先判断省略 to 的搭配，再判断「整个动作」还是「正在进行的片段」。',
      },
      {
        level: '次重点',
        text: '介词后接动名词',
        explain:
          '介词后面只能用名词或动名词：be good at doing, be interested in doing, thank you for doing, be afraid of doing。看到介词后跟动词原形或 to do，就可以直接排除。',
      },
      {
        level: '次重点',
        text: '不定式作目的状语与结果状语',
        explain: 'to do 表示目的（为了……），too … to do 表示「太……而不能」，… enough to do 表示「足够……可以」，in order to do 也表示目的。这三种结构要与 so … that 从句互换的题型一起练。',
      },
      {
        level: '了解',
        text: '不定式的否定式与省略 to 的固定搭配',
        explain: '否定式是 not to do（tell sb not to do），不是 do not to do。had better do, why not do, would rather do, cannot but do 后面都接动词原形。',
      },
      {
        level: '了解',
        text: '动名词与不定式意思不同的动词',
        explain: 'remember/forget to do 表示「记得／忘记要做」，remember/forget doing 表示「记得／忘记做过」；stop to do 是停下来去做另一件事，stop doing 是停止正在做的事。',
      },
    ],
    rules: [
      {
        rule: 'want / hope / decide / plan / agree 等后接不定式',
        form: '动词 + to do；否定式动词 + not to do',
        example: 'I want to be a doctor when I grow up.',
        cn: '我长大后想当医生。',
        tip: '只要动词是 want/hope/decide/plan/agree/learn，后面一定接 to do；否定形式是 not to do，不要写成 do not to do。',
      },
      {
        rule: 'ask / tell / want / would like sb to do sth',
        form: '动词 + 宾语 + to do',
        example: 'My teacher asked me to hand in the report on time.',
        cn: '老师要求我按时交报告。',
        tip: '题干里出现「动词 + 人称代词」时，要看后面是 to do 还是 do；只有 make/let/have 才接原形。',
      },
      {
        rule: 'enjoy / finish / mind / practise / keep / suggest 后接动名词',
        form: '动词 + doing',
        example: 'My sister enjoys listening to music after dinner.',
        cn: '我姐姐喜欢晚饭后听音乐。',
        tip: '把 enjoy, finish, mind, practise, keep, suggest, avoid 当成一张必背清单，看到它们就找 -ing 选项。',
      },
      {
        rule: '介词后接动名词，包括 to 作介词的情况',
        form: '介词 + doing：be good at doing / be interested in doing / look forward to doing / be used to doing',
        example: 'I am looking forward to seeing you at the party.',
        cn: '我期待在聚会上见到你。',
        tip: 'look forward to 里的 to 是介词，后面接 doing；判断方法是把 to 换成 in，如果意思仍通顺，to 就是介词。',
      },
      {
        rule: 'make / let / have sb do sth（省略 to）',
        form: 'make/let/have + 宾语 + 动词原形',
        example: 'My parents make me do sports for an hour every day.',
        cn: '父母让我每天运动一小时。',
        tip: '这类动词后面出现 to do 就是错的；但变成被动语态后 to 必须回来：be made to do。',
      },
      {
        rule: 'see / hear / watch sb do 与 doing 的区别',
        form: 'see/hear/watch sb do sth（看到整个动作已完成）；see/hear/watch sb doing sth（看到动作正在进行）',
        example: 'I saw him cross the street. / I saw him crossing the street.',
        cn: '我看见他过了马路。／我看见他正在过马路。',
        tip: '题干有 when I passed by, at that moment 这类提示，就选 doing；强调从头到尾做完了，就选 do。',
      },
      {
        rule: 'too … to do 与 … enough to do',
        form: 'too + 形容词/副词 + to do；形容词/副词 + enough + to do',
        example: 'He is too young to go to school. / He is old enough to go to school.',
        cn: '他太小了，不能上学。／他年龄够大，可以上学了。',
        tip: '这类题常与 so … that … 从句互换：too young to go = so young that he cannot go，注意否定含义的转换。',
      },
      {
        rule: '不定式作目的状语',
        form: '主句 + to do / in order to do / so as to do',
        example: 'She got up early to catch the first bus.',
        cn: '她早起是为了赶第一班公交车。',
        tip: '问「为什么做这件事」时，to do 就表示目的；改成从句时要说 so that she could catch the first bus。',
      },
    ],
    mistakes: [
      {
        wrong: 'I want go home now.',
        right: 'I want to go home now.',
        why: 'want 后面必须接带 to 的不定式，不能直接跟动词原形。这是非谓语动词最基础的错，也是选择题里干扰项的常见写法。',
      },
      {
        wrong: 'She is looking forward to see you soon.',
        right: 'She is looking forward to seeing you soon.',
        why: 'look forward to 中的 to 是介词，后面要接动名词。凡是「动词 + 介词 to」的短语（be used to, pay attention to）都接 doing。',
      },
      {
        wrong: 'My mother makes me to clean my room every weekend.',
        right: 'My mother makes me clean my room every weekend.',
        why: 'make sb do sth 省略 to；只有在被动语态中才写成 be made to do。看到 make/let/have 后带 to 的选项就可以排除。',
      },
      {
        wrong: 'He finished to do his homework and then went out.',
        right: 'He finished doing his homework and then went out.',
        why: 'finish 只能接动名词，同类还有 enjoy, mind, practise, keep, suggest。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-4-q1',
        type: 'choice',
        stem: 'My father often tells me ______ computer games for too long.',
        options: ['do not play', 'not play', 'not to play', 'to not play'],
        answer: 'C',
        explanation:
          'tell sb to do sth 的否定式是 tell sb not to do sth，not 要放在 to 前面。A 项 do not play 不能作宾语补足语，B 项漏 to，D 项 not 位置错误。',
        difficulty: 2,
        tags: ['不定式', '否定式'],
      },
      {
        id: 'eng-grammar-4-q2',
        type: 'choice',
        stem: 'Would you mind ______ the window? It is a bit hot in here.',
        options: ['open', 'to open', 'opening', 'opened'],
        answer: 'C',
        explanation: 'mind 后面接动名词，是固定搭配。open 是原形，to open 是不定式，opened 是过去式，都不能作 mind 的宾语。',
        difficulty: 1,
        tags: ['动名词', '固定搭配'],
      },
      {
        id: 'eng-grammar-4-q3',
        type: 'choice',
        stem: 'We saw some birds ______ in the tree when we passed by.',
        options: ['sing', 'singing', 'to sing', 'sang'],
        answer: 'B',
        explanation:
          'see sb doing sth 表示看到动作正在进行；when we passed by 说明是路过时看到的一个片段，所以用 singing。see sb do sth 强调看到整个过程，与语境不符。',
        difficulty: 2,
        tags: ['感官动词', 'doing'],
      },
      {
        id: 'eng-grammar-4-q4',
        type: 'choice',
        stem: 'The teacher made him ______ the story again in front of the class.',
        options: ['to read', 'read', 'reading', 'reads'],
        answer: 'B',
        explanation: 'make sb do sth 用省略 to 的动词原形，所以是 read。A 项 to read 是典型的「使役动词后误加 to」。',
        difficulty: 1,
        tags: ['使役动词', '省略 to'],
      },
      {
        id: 'eng-grammar-4-q5',
        type: 'choice',
        stem: 'Thank you for ______ me with my English.',
        options: ['help', 'helping', 'to help', 'helps'],
        answer: 'B',
        explanation: 'for 是介词，介词后接动名词，所以用 helping。凡是介词后面，都不能接动词原形或不定式。',
        difficulty: 1,
        tags: ['介词后 doing'],
      },
      {
        id: 'eng-grammar-4-q6',
        type: 'choice',
        stem: 'He was too tired ______ any further that evening.',
        options: ['to walk', 'walking', 'walk', 'walked'],
        answer: 'A',
        explanation:
          'too + 形容词 + to do 表示「太……而不能……」，答案是 to walk，含义是「太累了走不动了」。这是不定式作结果状语的结构。',
        difficulty: 2,
        tags: ['too…to', '结果状语'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 5. 宾语从句                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-5',
    grade: 'all',
    unit: '从句',
    title: '宾语从句：语序、连接词与时态一致',
    enTitle: 'Object Clauses',
    summary: '宾语从句只有三条硬规则：陈述语序、连接词按原句类型选、时态跟着主句走（客观真理除外）。',
    points: [
      {
        level: '重点',
        text: '宾语从句一律用陈述语序',
        explain:
          '无论主句是疑问句还是陈述句，从句都要写成「连接词 + 主语 + 谓语」。选项里出现 where is the bank, what did he do 这类疑问语序，可以直接排除，这是广州中考选择题出现频率最高的设错方式。',
      },
      {
        level: '重点',
        text: '连接词的三种情况：that / if(whether) / 特殊疑问词',
        explain:
          '原句是陈述句用 that（口语中可省略）；原句是一般疑问句用 if 或 whether；原句是特殊疑问句就保留原来的疑问词 what/where/when/who/why/how。判断方法是先看从句「缺什么信息」：信息完整用 that，问「是否」用 if/whether，问具体内容用疑问词。',
      },
      {
        level: '重点',
        text: '时态一致：主句过去时，从句用相应的过去时',
        explain:
          '主句是现在时，从句按需要选时态；主句是过去时，从句要用过去的某种时态（was/were doing, had done, would do）。例外只有一个：从句讲客观真理、自然规律时永远用一般现在时。',
      },
      {
        level: '次重点',
        text: 'whether 与 if 的选择',
        explain:
          'whether 后面可以直接跟 or not（whether he will come or not），也可以用在介词后和不定式前（depend on whether…, whether to go）；if 没有这些用法。看到 or not 紧跟在连接词后，就选 whether。',
      },
      {
        level: '次重点',
        text: '主句是过去时，从句的「过去将来」',
        explain: 'He said he would come to the party. 主句是过去时，从句中的 will 要改成 would，can 改成 could，is 改成 was。填词题常给 will/can 让学生改成相应的过去式。',
      },
      {
        level: '了解',
        text: '从句的标点由主句决定',
        explain: '主句是陈述句，句末用句号；主句是疑问句（Could you tell me…?），句末仍用问号。Do you know who he is? 虽然从句是陈述语序，整句仍是问句，问号不能改成句号。',
      },
      {
        level: '了解',
        text: 'think / believe 引导的宾语从句与否定前移',
        explain: 'I do not think he is right. 是否定前移，否定的是从句内容，含义相当于 I think he is not right. 但英语习惯把 not 放到主句。这类句子后面的反意疑问句要与从句一致：…, is he?',
      },
    ],
    rules: [
      {
        rule: '宾语从句用陈述语序',
        form: '连接词 + 主语 + 谓语（+ 其他）',
        example: 'Could you tell me where the nearest bank is?',
        cn: '你能告诉我最近的银行在哪里吗？',
        tip: '把从句还原成陈述句 where the bank is，再对照选项；凡是「疑问词 + is/does + 主语」的选项都是错的。',
      },
      {
        rule: '陈述句作宾语从句用 that 引导（可省略）',
        form: '主句 + that + 陈述句',
        example: 'He said that he would help me with my maths.',
        cn: '他说他会帮我学数学。',
        tip: 'that 只起连接作用、不作成分，因此从句结构必须完整；从句缺主语或宾语时不能用 that。',
      },
      {
        rule: '一般疑问句作宾语从句用 if 或 whether 引导',
        form: '主句 + if/whether + 陈述语序',
        example: 'I do not know if he will come to the meeting tomorrow.',
        cn: '我不知道他明天是否会来开会。',
        tip: '凡是能从原句翻成「是否」的，就用 if 或 whether；从句仍要写成陈述语序。',
      },
      {
        rule: '特殊疑问句作宾语从句用原疑问词引导',
        form: '主句 + what/where/when/who/why/how + 陈述语序',
        example: 'Do you know when the school sports meeting will begin?',
        cn: '你知道校运动会什么时候开始吗？',
        tip: '疑问词保留，但语序改成陈述：when + the meeting + will begin。',
      },
      {
        rule: '时态一致：主句过去时，从句用过去的相应时态',
        form: '主句过去时 + 从句 was/were doing、had done、would do 等',
        example: 'She said that she had finished her homework already.',
        cn: '她说她已经做完作业了。',
        tip: '看到主句是 said/asked/told，就先检查从句动词有没有「后退一步」。',
      },
      {
        rule: '客观真理作宾语从句时仍用一般现在时',
        form: '主句（任意时态）+ that + 一般现在时',
        example: 'The teacher told us that light travels faster than sound.',
        cn: '老师告诉我们光比声音传播得快。',
        tip: '从句内容是永远成立的事实、自然规律或谚语时，不随主句变过去，这是时态一致唯一的例外。',
      },
      {
        rule: 'whether 与 or not 搭配，且可用于介词后',
        form: 'whether … or not；介词 + whether + 从句；whether to do',
        example: 'I am not sure whether he will come or not.',
        cn: '我不确定他会不会来。',
        tip: 'or not 紧跟连接词时只能用 whether；用在 depend on, talk about 等介词后也只能用 whether。',
      },
      {
        rule: '宾语从句的标点由主句决定',
        form: '主句为陈述句 → 句末用句号；主句为疑问句 → 句末用问号',
        example: 'Do you know who he is?',
        cn: '你知道他是谁吗？',
        tip: '从句是陈述语序、主句是疑问句，句末用问号；很多学生看到陈述语序就误写成句号。',
      },
    ],
    mistakes: [
      {
        wrong: 'Could you tell me where is the station?',
        right: 'Could you tell me where the station is?',
        why: '宾语从句必须用陈述语序，疑问词后面的主语和谓语不能倒装。这是宾语从句题最常见的错误选项写法。',
      },
      {
        wrong: 'He asked me what did I do last Sunday.',
        right: 'He asked me what I did last Sunday.',
        why: '宾语从句用陈述语序，不需要助动词 did 提前；同时注意主句 asked 是过去时，从句也要用过去时。',
      },
      {
        wrong: 'I do not know if he comes to the party tomorrow.',
        right: 'I do not know if he will come to the party tomorrow.',
        why: '从句谈的是将来（tomorrow），要用一般将来时。宾语从句的时态由从句自身的时间决定，不能一律套一般现在时。',
      },
      {
        wrong: 'The teacher told us that the earth moved around the sun.',
        right: 'The teacher told us that the earth moves around the sun.',
        why: '从句是客观真理，即使主句是过去时也用一般现在时。这是「时态一致」规则中必须牢记的例外。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-5-q1',
        type: 'choice',
        stem: '— Could you tell me ______?\n— Sure. It is on the second floor.',
        options: [
          'where is the reading room',
          'where the reading room is',
          'where was the reading room',
          'the reading room where is',
        ],
        answer: 'B',
        explanation:
          '宾语从句用陈述语序：连接词 + 主语 + 谓语，所以是 where the reading room is。A、C 是疑问语序，D 把疑问词放错位置。',
        difficulty: 1,
        tags: ['宾语从句', '语序'],
      },
      {
        id: 'eng-grammar-5-q2',
        type: 'choice',
        stem: 'I am not sure ______ or not he will come to the party.',
        options: ['if', 'whether', 'that', 'what'],
        answer: 'B',
        explanation:
          'or not 紧跟在连接词后面时只能用 whether，不能用 if。that 不表示「是否」，what 在从句中要作主语或宾语，本从句成分完整。',
        difficulty: 2,
        tags: ['宾语从句', 'whether'],
      },
      {
        id: 'eng-grammar-5-q3',
        type: 'choice',
        stem: 'He asked me ______ I had finished the report.',
        options: ['that', 'what', 'if', 'which'],
        answer: 'C',
        explanation:
          '从句由一般疑问句转换而来，表示「是否」，用 if 引导；从句用陈述语序和过去完成时 had finished，与主句 asked 的过去时一致。',
        difficulty: 2,
        tags: ['宾语从句', 'if', '时态一致'],
      },
      {
        id: 'eng-grammar-5-q4',
        type: 'choice',
        stem: 'Our science teacher told us that the moon ______ around the earth.',
        options: ['moved', 'moves', 'will move', 'has moved'],
        answer: 'B',
        explanation:
          '从句陈述的是客观真理，主句虽是过去时 told，从句仍用一般现在时 moves。这是时态一致规则的唯一例外。',
        difficulty: 2,
        tags: ['宾语从句', '客观真理'],
      },
      {
        id: 'eng-grammar-5-q5',
        type: 'choice',
        stem: '— Do you know ______?\n— Next Monday.',
        options: [
          'when will the sports meeting start',
          'when the sports meeting will start',
          'when would the sports meeting start',
          'the sports meeting will start when',
        ],
        answer: 'B',
        explanation:
          '宾语从句要用陈述语序，且主句 Do you know 是现在时，从句该用将来时就写 will start，不必后退成 would。故选 B。',
        difficulty: 2,
        tags: ['宾语从句', '语序', '时态'],
      },
      {
        id: 'eng-grammar-5-q6',
        type: 'choice',
        stem: 'She said that she ______ to Beijing twice before she moved here.',
        options: ['has been', 'had been', 'went', 'goes'],
        answer: 'B',
        explanation:
          '主句 said 与从句 before she moved here 都是过去时，而「去过两次」发生在这两件事之前，属于「过去的过去」，要用过去完成时 had been。A 项没有与主句过去时呼应，C 项无法体现两个过去动作的先后。',
        difficulty: 3,
        tags: ['宾语从句', '过去完成时', '时态一致'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 6. 定语从句                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-6',
    grade: 'all',
    unit: '从句',
    title: '定语从句：关系代词与关系副词的选择',
    enTitle: 'Attributive Clauses',
    summary: '两步走：先看先行词指人还是指物（选 who/which/that），再看从句里缺什么成分（选关系代词还是关系副词）。',
    points: [
      {
        level: '重点',
        text: '关系代词 who/whom/whose/which/that 的选用',
        explain:
          '先行词指人用 who（作主语）、whom（作宾语）、whose（作定语，指「谁的」）；先行词指物用 which；that 既指人又指物。判断顺序是「先定先行词是人还是物，再看空格后缺主语还是宾语」。',
      },
      {
        level: '重点',
        text: '只能用 that 的几种情况',
        explain:
          '先行词被 all, every, no, the only, the same, the first 等或形容词最高级修饰时；先行词是不定代词 everything, anything, nothing, something 时；先行词既有人又有物时——这些情况关系代词只能用 that，不能用 which。看到 the best / the only / everything 就要立刻想到 that。',
      },
      {
        level: '重点',
        text: '关系代词作宾语时可以省略，作主语时不能省',
        explain:
          'The book (which) I bought yesterday is interesting. 中 which 作 bought 的宾语，可以省略；The man who is talking is my uncle. 中 who 作主语，必须保留。另外，作主语的关系代词决定从句谓语的人称和数：who teaches（先行词是单数）。',
      },
      {
        level: '次重点',
        text: '关系副词 where / when / why 与「介词 + which」',
        explain:
          '先行词是表示地点的名词、且从句成分完整（不缺主语或宾语）时用 where；先行词是时间名词用 when；先行词是 the reason 用 why。where = in/at which，when = in/on which，所以从句里不能再出现多余的介词。',
      },
      {
        level: '次重点',
        text: '单个介词提前的用法',
        explain:
          'This is the city in which he grew up. 中 in which 相当于 where，介词提前后关系代词只能用 which（指物）或 whom（指人），不能用 that。看到 in which / on which 这类结构要想到它等于关系副词。',
      },
      {
        level: '了解',
        text: '定语从句与同位语从句的区别',
        explain: 'That is the news that he told me.（定语从句，that 作 told 的宾语）与 That is the news that he passed the exam.（同位语从句，that 只起连接作用，从句成分完整）。判断关键是 that 在从句里是否充当成分。',
      },
      {
        level: '了解',
        text: '定语从句中谓语的人称和数',
        explain: '关系代词作主语时，从句谓语与先行词保持一致：The students who are singing are from Class Two. / The student who is singing sings well. 这是主谓一致与定语从句结合考查的常见方式。',
      },
    ],
    rules: [
      {
        rule: '先行词指人，关系代词作主语用 who',
        form: '先行词（人）+ who + 谓语 + 其他',
        example: 'The girl who is singing over there is my cousin.',
        cn: '在那边唱歌的女孩是我表妹。',
        tip: '空格后面直接跟动词，说明缺主语；先行词是人，就选 who（或 that）。',
      },
      {
        rule: '先行词指物，关系代词用 which',
        form: '先行词（物）+ which + 谓语 / 主语 + 谓语',
        example: 'The book which I borrowed from the library is very interesting.',
        cn: '我从图书馆借的那本书很有意思。',
        tip: 'which 后面的句子如果缺宾语（I borrowed __），说明 which 作宾语，可以省略。',
      },
      {
        rule: '先行词被最高级、序数词或 all/the only 修饰时只能用 that',
        form: 'the best/only/first/all/every + 名词 + that + 从句',
        example: 'This is the best film that I have ever seen.',
        cn: '这是我看过的最好的电影。',
        tip: '看到 the best, the only, the first, everything 这些词，关系代词一律选 that，选 which 就是错。',
      },
      {
        rule: 'whose 表示所属关系，指人指物都可以',
        form: '先行词 + whose + 名词 + 谓语',
        example: 'I know the boy whose father is a doctor.',
        cn: '我认识那个父亲是医生的男孩。',
        tip: '空格后面紧跟一个名词（whose father / whose door），就选 whose，它等于「先行词的」。',
      },
      {
        rule: '先行词是地点、从句成分完整时用 where',
        form: '表示地点的先行词 + where + 完整句子（= in/at which）',
        example: 'This is the school where I studied three years ago.',
        cn: '这就是我三年前学习的那所学校。',
        tip: '判断关键：从句后面有没有多余的 in/at。如果写成 the school which I studied in，用 which；写成 the school where I studied，用 where，两者不能同时出现。',
      },
      {
        rule: '先行词是时间名词、从句成分完整时用 when',
        form: '表示时间的先行词 + when + 完整句子（= in/on which）',
        example: 'I still remember the day when we first met.',
        cn: '我仍然记得我们初次见面的那一天。',
        tip: '先行词是 the day/the time/the year，且从句不缺主语宾语，就选 when。',
      },
      {
        rule: '关系代词作宾语可以省略，作主语不能省略',
        form: '先行词 + (which/whom/that) + 主语 + 谓语（作宾语，可省）',
        example: 'The story (that) he told us was very moving.',
        cn: '他给我们讲的那个故事很感人。',
        tip: '空格后紧跟「主语 + 谓语」，说明关系代词作宾语，可以省略；这类题若给了 that 和 what 两个选项，选 that（what 不能引导定语从句）。',
      },
      {
        rule: '介词提前：介词 + which / whom',
        form: '先行词 + 介词 + which/whom + 从句',
        example: 'The city in which he grew up has changed a lot.',
        cn: '他长大的那座城市变化很大。',
        tip: '介词提前后不能再用 that；in which 与 where 意思相同，两个只能出现一个。',
      },
    ],
    mistakes: [
      {
        wrong: 'This is the best film which I have ever seen.',
        right: 'This is the best film that I have ever seen.',
        why: '先行词被最高级 the best 修饰时，关系代词只能用 that。同类还有 the first, the only, everything 等。',
      },
      {
        wrong: 'The teacher who teach us English is very kind.',
        right: 'The teacher who teaches us English is very kind.',
        why: '关系代词作主语时，从句谓语的人称和数与先行词一致。the teacher 是单数，谓语要加 -es。',
      },
      {
        wrong: 'That is the house where I lived in last year.',
        right: 'That is the house where I lived last year. / That is the house which I lived in last year.',
        why: 'where 已经包含 in 的含义，后面不能再出现 in。要么用 where 不加介词，要么用 which/that + in。',
      },
      {
        wrong: 'Everything which he said was true.',
        right: 'Everything that he said was true.',
        why: '先行词是不定代词 everything, anything, nothing, something 时，关系代词只能用 that。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-6-q1',
        type: 'choice',
        stem: 'The man ______ is talking with my father is our new English teacher.',
        options: ['which', 'who', 'whom', 'whose'],
        answer: 'B',
        explanation:
          '先行词 The man 指人，空格后面直接跟谓语 is talking，说明关系代词作主语，用 who。whom 只作宾语，which 指物，whose 后面必须跟名词。',
        difficulty: 1,
        tags: ['定语从句', 'who', '作主语'],
      },
      {
        id: 'eng-grammar-6-q2',
        type: 'choice',
        stem: 'This is the most interesting book ______ I have ever read.',
        options: ['which', 'who', 'that', 'what'],
        answer: 'C',
        explanation:
          '先行词被最高级 the most interesting 修饰，关系代词只能用 that。which 在最高级后不能用，what 不能引导定语从句。',
        difficulty: 2,
        tags: ['定语从句', '只能用 that'],
      },
      {
        id: 'eng-grammar-6-q3',
        type: 'choice',
        stem: 'I still remember the day ______ we visited the Science Museum.',
        options: ['which', 'who', 'when', 'where'],
        answer: 'C',
        explanation:
          '先行词 the day 是时间名词，从句 we visited the Science Museum 成分完整，不缺主语或宾语，所以用关系副词 when。',
        difficulty: 2,
        tags: ['定语从句', 'when', '关系副词'],
      },
      {
        id: 'eng-grammar-6-q4',
        type: 'choice',
        stem: 'The girl ______ hair is very long is my best friend.',
        options: ['who', 'which', 'whose', 'that'],
        answer: 'C',
        explanation:
          '空格后面紧跟名词 hair，表示「她的头发」，属于所属关系，用 whose。who 和 that 后面应直接跟谓语，which 不能指人。',
        difficulty: 2,
        tags: ['定语从句', 'whose'],
      },
      {
        id: 'eng-grammar-6-q5',
        type: 'choice',
        stem: 'Do you know the boy ______ we met at the school gate yesterday?',
        options: ['whose', 'which', 'whom', 'what'],
        answer: 'C',
        explanation:
          '先行词 the boy 指人，从句 we met ______ 缺宾语，所以用宾格关系代词 whom（也可用 that 或省略）。which 指物，what 不能引导定语从句。',
        difficulty: 2,
        tags: ['定语从句', 'whom', '作宾语'],
      },
      {
        id: 'eng-grammar-6-q6',
        type: 'choice',
        stem: 'This is the factory ______ my uncle has worked for twenty years.',
        options: ['which', 'that', 'where', 'who'],
        answer: 'C',
        explanation:
          '先行词 the factory 是地点，从句 my uncle has worked for twenty years 结构完整、没有介词，用关系副词 where（= in which）。选 which 需要加 in，本句没有。',
        difficulty: 3,
        tags: ['定语从句', 'where', '关系副词'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 7. 状语从句                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-7',
    grade: 'all',
    unit: '从句',
    title: '状语从句：时间·条件·原因·让步·结果',
    enTitle: 'Adverbial Clauses',
    summary: '按「两件事是什么关系」选连词：时间用 when/while/until、条件用 if/unless、原因用 because、让动用 though，再注意主将从现。',
    points: [
      {
        level: '重点',
        text: '时间状语从句：when / while / as soon as / until',
        explain:
          'when 表示「当……时」，前后都可以用一般时或进行时；while 强调两个动作同时持续，后面常接进行时；as soon as 表示「一……就」，从句刚发生主句马上发生；not … until 表示「直到……才」，中文否定的句子英语常要写成 not … until。',
      },
      {
        level: '重点',
        text: '条件状语从句：if 与 unless + 主将从现',
        explain:
          'if 是「如果」，unless 是「除非／如果不」。两者引导的从句都不能用将来时，主句用将来时的时候从句用一般现在时。判断方法是把从句的中文含义写出来：能换成「如果不」的就选 unless。',
      },
      {
        level: '重点',
        text: '原因状语从句：because / since / as',
        explain:
          'because 语气最强，用来回答 why，也是中考最常考的；since 和 as 表示「既然、由于」，多放在句首。because 不能与 so 连用，中文说「因为……所以……」在英语里只能留一个。',
      },
      {
        level: '次重点',
        text: '让步状语从句：though / although / even if',
        explain:
          'though 和 although 表示「虽然」，不能与 but 连用；even if 表示「即使」。题干常给出「中文有转折但英文只能有一个连接词」的陷阱：Although it was raining, they went on working. 后面不能再加 but。',
      },
      {
        level: '次重点',
        text: '结果与目的状语从句：so … that / such … that / so that',
        explain:
          'so + 形容词/副词 + that，such + 名词短语 + that，都表示「如此……以至于」；so that 表示「为了／以便」，后面常跟 can/could 等。看到空格前是形容词或副词选 so，看到空格后是名词短语选 such。',
      },
      {
        level: '了解',
        text: '比较状语从句：as … as / not as … as / than',
        explain: 'as + 形容词/副词原级 + as 表示「和……一样」，中间必须用原级；than 前面用比较级。两个 as 一个都不能少。',
      },
      {
        level: '了解',
        text: '状语从句中的主将从现与位置灵活',
        explain: '时间、条件状语从句放在主句前时后面要加逗号，放在主句后则不加。无论位置如何，从句里都不用 will，这是判断选项对错的快速方法。',
      },
    ],
    rules: [
      {
        rule: 'when 引导时间状语从句：当……的时候',
        form: 'When + 从句，主句；或主句 + when + 从句',
        example: 'When I got home, my mother was cooking in the kitchen.',
        cn: '我到家的时候，妈妈正在厨房做饭。',
        tip: 'when 后面常跟一般过去时，主句用过去进行时，表示「当某事发生时，另一件事正在进行」。',
      },
      {
        rule: 'while 强调两个动作同时持续',
        form: 'While + 过去进行时，主句 + 过去进行时',
        example: 'While I was reading, my sister was doing her homework.',
        cn: '我看书的时候，妹妹在做作业。',
        tip: 'while 后几乎总是进行时；如果两个动作都在持续，就选 while 而不是 when。',
      },
      {
        rule: 'as soon as 引导时间状语从句：一……就',
        form: '主句（将来时）+ as soon as + 从句（一般现在时）',
        example: 'I will call you as soon as I arrive in Beijing.',
        cn: '我一到北京就给你打电话。',
        tip: 'as soon as 从句里用一般现在时代替将来时，这是主将从现最典型的考法之一。',
      },
      {
        rule: 'not … until 表示「直到……才」',
        form: 'not + 谓语 + until + 从句/时间',
        example: 'He did not go to bed until he finished his homework.',
        cn: '他直到做完作业才去睡觉。',
        tip: '中文「直到……才」在英语里必须用否定主句；如果主句是肯定形式，后面只能跟 until（表示「一直到」）。',
      },
      {
        rule: 'if 引导条件状语从句',
        form: 'If + 一般现在时，主句 + 一般将来时',
        example: 'If you study hard, you will make great progress.',
        cn: '如果你努力学习，你会取得很大进步。',
        tip: '从句里出现 will 就是错的；先排除含 will 的从句选项，再比较主句时态。',
      },
      {
        rule: 'unless 表示「除非／如果不」',
        form: '主句 + unless + 从句',
        example: 'You will miss the bus unless you hurry up.',
        cn: '除非你快点，否则你会赶不上公交车。',
        tip: '把 unless 换成 if … not 读一遍，意思通顺就说明选对了。',
      },
      {
        rule: 'because 引导原因状语从句，不与 so 连用',
        form: 'Because + 从句，主句（不再加 so）',
        example: 'He was late for school because he missed the early bus.',
        cn: '他因为没赶上早班车而上学迟到。',
        tip: '回答 why 的问句只能用 because；句中已有 so 就不能再有 because，这是连词题必考的一条。',
      },
      {
        rule: 'though / although 引导让步状语从句，不与 but 连用',
        form: 'Although/Though + 从句，主句（不再加 but）',
        example: 'Although it was raining hard, they went on working.',
        cn: '虽然雨下得很大，他们还是继续工作。',
        tip: '看到选项里 although … but … 的结构，立刻排除其中一个；英语一个句子只能有一个连词表示同一逻辑关系。',
      },
      {
        rule: 'so … that 与 such … that 表示结果',
        form: 'so + 形容词/副词 + that 从句；such + a/an + 形容词 + 名词 + that 从句',
        example: 'The box was so heavy that I could not move it.',
        cn: '这个箱子太重了，我搬不动。',
        tip: '空格后是形容词或副词用 so，是名词短语用 such；复数名词前不能用 such a。',
      },
    ],
    mistakes: [
      {
        wrong: 'Because it was raining, so we stayed at home.',
        right: 'Because it was raining, we stayed at home. / It was raining, so we stayed at home.',
        why: 'because 与 so 不能同时使用。中文的「因为……所以……」在英语里只能保留一个连接词。',
      },
      {
        wrong: 'Although he is young, but he knows a lot.',
        right: 'Although he is young, he knows a lot.',
        why: 'although/though 与 but 不能连用，同理 because 与 so 也不能连用。这是连词题里最常见的干扰结构。',
      },
      {
        wrong: 'I will tell him the news when he will come back.',
        right: 'I will tell him the news when he comes back.',
        why: 'when 引导时间状语从句，要用一般现在时代替将来时（主将从现）。主句的 will tell 已经承担了将来的含义。',
      },
      {
        wrong: 'He went to bed until he finished his homework.',
        right: 'He did not go to bed until he finished his homework.',
        why: '「直到……才」在英语里要用否定主句 not … until；肯定形式 + until 表示「一直睡到……」，与原意相反。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-7-q1',
        type: 'choice',
        stem: '______ it rains tomorrow, we will stay at home. If it is fine, we will go to the park.',
        options: ['If', 'Though', 'Because', 'Unless'],
        answer: 'A',
        explanation:
          '「如果明天下雨就待在家」与后一句「天气好就去公园」是同一个条件的两面，所以用 if 引导条件状语从句；从句用一般现在时 rains，主句用将来时 will stay，符合主将从现。用 Unless 会变成「除非下雨才待在家」，与后一句矛盾。',
        difficulty: 1,
        tags: ['条件状语从句', '主将从现'],
      },
      {
        id: 'eng-grammar-7-q2',
        type: 'choice',
        stem: 'My father was reading a newspaper ______ I was doing my homework.',
        options: ['while', 'before', 'until', 'as soon as'],
        answer: 'A',
        explanation:
          '两个动作「看报」和「做作业」在过去同时持续，用 while 引导，主从句都用过去进行时。before, until, as soon as 都表示先后关系，与「同时进行」不符。',
        difficulty: 2,
        tags: ['时间状语从句', 'while'],
      },
      {
        id: 'eng-grammar-7-q3',
        type: 'choice',
        stem: '______ he is only ten years old, he can cook quite well.',
        options: ['Because', 'Although', 'If', 'So'],
        answer: 'B',
        explanation:
          '「只有十岁」与「做饭很好」是让步关系，用 Although 引导。Because 表原因、If 表条件都与句意不符；So 不能引导从句放在句首。',
        difficulty: 2,
        tags: ['让步状语从句', 'although'],
      },
      {
        id: 'eng-grammar-7-q4',
        type: 'choice',
        stem: 'I will call you as soon as I ______ at the airport.',
        options: ['arrive', 'will arrive', 'arrived', 'am arriving'],
        answer: 'A',
        explanation:
          'as soon as 引导时间状语从句，主句是将来时 will call，从句用一般现在时 arrive 表将来。B 项 will arrive 违反主将从现。',
        difficulty: 2,
        tags: ['时间状语从句', '主将从现'],
      },
      {
        id: 'eng-grammar-7-q5',
        type: 'choice',
        stem: 'The box was ______ heavy ______ I could not move it at all.',
        options: ['so / that', 'such / that', 'too / to', 'enough / to'],
        answer: 'A',
        explanation:
          '空格后是形容词 heavy，用 so … that 引导结果状语从句。such 后面要接名词短语，too … to 和 enough to 后面接动词原形，本句后面是完整句子。',
        difficulty: 2,
        tags: ['结果状语从句', 'so that'],
      },
      {
        id: 'eng-grammar-7-q6',
        type: 'choice',
        stem: 'You will fail the exam ______ you work much harder.',
        options: ['if', 'unless', 'though', 'because'],
        answer: 'B',
        explanation:
          'unless 相当于 if … not，句意是「除非你更努力，否则考试会不及格」。用 if 会变成「如果你更努力就会不及格」，与逻辑相反；though, because 都不表示条件。',
        difficulty: 3,
        tags: ['条件状语从句', 'unless'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 8. 情态动词                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-8',
    grade: 'all',
    unit: '情态动词',
    title: '情态动词：能力·许可·义务与表推测',
    enTitle: 'Modal Verbs',
    summary: '情态动词后永远跟动词原形，难点在表推测的 must be / cannot be / may be 与 must 问句的否定回答。',
    points: [
      {
        level: '重点',
        text: 'can / could / may 表能力与许可',
        explain:
          'can 表示能力（会、能）和请求；could 是 can 的过去式，也表示更客气的请求；may 表示允许（可以）和请求。回答 May I …? 时用 Yes, you may. / Yes, please.，表示禁止用 No, you must not. 或 No, you may not.。',
      },
      {
        level: '重点',
        text: 'must 与 have to 的区别',
        explain:
          'must 强调说话人的主观意愿（「你必须」「我一定要」），have to 强调客观规定或环境所迫（「不得不」），且 have to 有 has to/had to/will have to 的变化，must 没有。',
      },
      {
        level: '重点',
        text: '表推测：must be / cannot be / may(might) be',
        explain:
          '句中出现 be at home, be Tom, be true 这类「判断」结构时，考的是推测：must be 表示「一定是」（肯定度最高），cannot be 表示「不可能是」，may/might be 表示「可能是」（把握不大）。注意否定推测不能用 must not be。',
      },
      {
        level: '次重点',
        text: 'must 问句的否定回答用 need not / do not have to',
        explain:
          '— Must I hand it in now? — No, you need not.（不必）而不是 No, you must not.（那是「禁止」，语气完全不同）。这是广州中考情态动词的经典陷阱题。',
      },
      {
        level: '次重点',
        text: 'need 的双重身份：情态动词与实义动词',
        explain:
          '作情态动词时：need do / need not do，没有第三人称单数变化；作实义动词时：need to do / do not need to do。看到 needs to do 与 need do 两种选项，先看主语和助动词形式。',
      },
      {
        level: '次重点',
        text: 'should / ought to / had better 表建议',
        explain: 'should do 表示「应该」，ought to do 意思相同但更正式，had better do 表示「最好」，后面接动词原形且没有 to。看到 had better to do 就是错的。',
      },
      {
        level: '了解',
        text: 'can 与 be able to 的区别',
        explain: 'can 只有现在时和过去式 could，表示能力；be able to 可以用于各种时态，且强调「成功做到」这一具体结果：He was able to swim across the river yesterday.。',
      },
    ],
    rules: [
      {
        rule: 'can 表示能力与请求',
        form: 'can + 动词原形；过去式 could',
        example: 'He can swim across the river.',
        cn: '他能游过那条河。',
        tip: 'can 后面只能是动词原形，任何加 -s、-ing、-ed 的形式都是错的。',
      },
      {
        rule: 'may 表示允许与请求',
        form: 'may + 动词原形',
        example: 'May I use your dictionary for a moment?',
        cn: '我可以用一下你的词典吗？',
        tip: 'May I …? 是较正式的请求；肯定回答用 Yes, please. / Yes, you may.，否定用 No, you must not. / No, you cannot.。',
      },
      {
        rule: 'must 表示必须，语气最强',
        form: 'must + 动词原形；否定 must not 表示禁止',
        example: 'You must finish your homework before dinner.',
        cn: '你必须在晚饭前完成作业。',
        tip: 'must not（mustn\'t）是「不准、禁止」，不是「不必」；「不必」要用 need not 或 do not have to。',
      },
      {
        rule: 'must 与 have to 的区别',
        form: 'must（主观）没有时态变化；have to（客观）有 has to/had to/will have to',
        example: 'I must give up smoking. / I have to stay at home because of the heavy rain.',
        cn: '我必须戒烟。／因为大雨我不得不待在家里。',
        tip: '题干强调外部原因（天气、规定、生病）用 have to；强调说话人自己的决心用 must。',
      },
      {
        rule: 'must be 表肯定推测：一定是',
        form: 'must + be/动词原形（表示对现在的推测）',
        example: 'The light in his room is on, so he must be at home.',
        cn: '他房间的灯亮着，所以他一定在家。',
        tip: '看到「有证据 + 判断」的句子结构就选 must be；注意 must 后要接动词原形 be，不能写成 must is。',
      },
      {
        rule: 'cannot be 表否定推测：不可能是',
        form: 'cannot/can not + be（不能用 must not be 表示推测）',
        example: 'It cannot be Tom. He has gone to Beijing.',
        cn: '这不可能是汤姆，他已经去北京了。',
        tip: 'must be 的反面推测是 cannot be，不是 must not be（那是「禁止」）。这一点是情态动词推测题最常见的设错点。',
      },
      {
        rule: 'may / might be 表可能性较小的推测',
        form: 'may/might + be/动词原形',
        example: 'He may come to the party, but I am not sure.',
        cn: '他可能会来参加聚会，但我不确定。',
        tip: '题干里有 I am not sure, perhaps, maybe 这类模糊词，就选 may/might，表示把握不大。',
      },
      {
        rule: 'must 引导的一般疑问句，否定回答用 need not',
        form: '— Must I …? — No, you need not. / No, you do not have to.',
        example: '— Must I return the book today? — No, you need not. You can keep it till Friday.',
        cn: '——我今天必须还书吗？——不必，你可以留到周五。',
        tip: '答句出现 can keep it longer, you may do it later 这类「不着急」的信息，答案就是 need not 或 do not have to。',
      },
      {
        rule: 'need 与 had better 的用法',
        form: 'need not do（情态）；do not need to do（实义）；had better do',
        example: 'You need not worry about it. / You had better see a doctor.',
        cn: '你不必为这件事担心。／你最好去看医生。',
        tip: 'had better 后面一定接动词原形，没有 to；need not 后面也接原形，但实义动词用法要写 need to do。',
      },
    ],
    mistakes: [
      {
        wrong: '— Must I finish it today? — No, you must not.',
        right: '— Must I finish it today? — No, you need not. / No, you do not have to.',
        why: 'must not 表示禁止（不准做），而问句问的是「有没有必要」，否定回答要用 need not 或 do not have to。',
      },
      {
        wrong: 'The light is on. He must at home.',
        right: 'The light is on. He must be at home.',
        why: '情态动词后面必须跟动词原形，表示推测时要用 be，不能直接跟介词短语。',
      },
      {
        wrong: 'You had better to see a doctor at once.',
        right: 'You had better see a doctor at once.',
        why: 'had better 后面接省略 to 的动词原形，写成 had better to do 是最常见的搭配错误。',
      },
      {
        wrong: 'You need not to worry about the exam.',
        right: 'You need not worry about the exam. / You do not need to worry about the exam.',
        why: '情态动词 need 后直接接原形；只有实义动词用法的否定式 do not need 后面才接 to do，两者不能混搭。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-8-q1',
        type: 'choice',
        stem: '— Must I return the book today?\n— No, you ______. You can keep it till Friday.',
        options: ['must not', 'need not', 'cannot', 'should not'],
        answer: 'B',
        explanation:
          'Must I …? 的否定回答表示「不必」，用 need not（也可说 do not have to）。must not 是「不准」，cannot 是「不能」，都与答句「可以留到周五」的语境不符。',
        difficulty: 2,
        tags: ['情态动词', 'must', 'need'],
      },
      {
        id: 'eng-grammar-8-q2',
        type: 'choice',
        stem: 'The dictionary ______ be Li Ming\'s. Look, his name is on the cover.',
        options: ['can', 'must', 'may', 'need'],
        answer: 'B',
        explanation:
          '封面上有他的名字，是有力的证据，表示「一定是」，用 must be。can be 表示「可能是」（多用于疑问句和否定句），may be 把握较小，need 不表推测。',
        difficulty: 2,
        tags: ['情态动词', '表推测', 'must be'],
      },
      {
        id: 'eng-grammar-8-q3',
        type: 'choice',
        stem: '— Is this Kate\'s bag?\n— It ______ be hers. Her bag is blue, but this one is red.',
        options: ['must', 'can', 'cannot', 'may'],
        answer: 'C',
        explanation:
          '颜色不符说明「不可能是她的」，否定推测用 cannot be。用 must be 与后半句矛盾；may be 表示「可能」语气太弱，与明确的证据不符。',
        difficulty: 3,
        tags: ['情态动词', 'cannot be', '表推测'],
      },
      {
        id: 'eng-grammar-8-q4',
        type: 'choice',
        stem: 'You had better ______ to bed earlier, or you will feel tired tomorrow.',
        options: ['to go', 'go', 'going', 'went'],
        answer: 'B',
        explanation: 'had better 后面接省略 to 的动词原形，所以是 go。同类省略 to 的还有 would rather do, why not do。',
        difficulty: 1,
        tags: ['情态动词', 'had better'],
      },
      {
        id: 'eng-grammar-8-q5',
        type: 'choice',
        stem: 'You ______ hand in your homework today. You can hand it in tomorrow morning.',
        options: ['need not', 'must not', 'cannot', 'may not'],
        answer: 'A',
        explanation:
          '后半句说「可以明天早上交」，说明今天「不必」交，用 need not。must not 表示禁止，cannot 表示不能，都不符合句意。',
        difficulty: 2,
        tags: ['情态动词', 'need not'],
      },
      {
        id: 'eng-grammar-8-q6',
        type: 'choice',
        stem: 'Take an umbrella with you. It ______ rain this afternoon, though I am not sure.',
        options: ['must', 'may', 'cannot', 'need not'],
        answer: 'B',
        explanation:
          'though I am not sure 说明把握不大，用 may 表示「可能」。must 语气太肯定，cannot 表示不可能，need not 不表示推测。',
        difficulty: 2,
        tags: ['情态动词', 'may', '表推测'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 9. 代词与冠词                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-9',
    grade: 'all',
    unit: '词法',
    title: '代词与冠词：人称·物主·反身·不定代词与 a/an/the',
    enTitle: 'Pronouns and Articles',
    summary: '代词看它在句中作主语还是宾语、后面有没有名词；冠词看读音（a/an）和是否特指（the 或零冠词）。',
    points: [
      {
        level: '重点',
        text: '人称代词主格与宾格、物主代词两种形式',
        explain:
          '作主语用主格（I, he, she, they），动词或介词后用宾格（me, him, her, them）；形容词性物主代词后面必须跟名词（my book），名词性物主代词后面不跟名词、相当于「我的东西」（mine = my book）。看到空格后面有名词就用形容词性，没有名词就用名词性。',
      },
      {
        level: '重点',
        text: '反身代词：主语和宾语是同一人时用',
        explain:
          'enjoy oneself, teach oneself, hurt oneself, help oneself to, by oneself, look after oneself 都是固定搭配。判断方法是看动作的承受者是不是主语本人：We enjoyed ourselves. 如果宾语是别的人，就用宾格。',
      },
      {
        level: '重点',
        text: '不定代词 both / either / neither / none',
        explain:
          'both 表示「两者都」，either 表示「两者中任一个」，neither 表示「两者都不」，none 表示「三者或三者以上的都不」。题干里出现 two 就用前三个，出现 three 或复数范围用 none；neither 与 none 作主语时谓语通常用单数。',
      },
      {
        level: '重点',
        text: '不定冠词 a / an 依读音判断，定冠词 the 表特指',
        explain:
          'a 用在辅音音素前，an 用在元音音素前：an hour（h 不发音）, an honest boy, a useful book, a university（读 /juː/ 是辅音）。the 用于特指、上文提到过、独一无二的事物、序数词与最高级前。',
      },
      {
        level: '次重点',
        text: '零冠词：三餐、球类、学科、固定短语',
        explain:
          'have breakfast, play basketball, study maths, go to school, go to bed, by bus, at home, in bed 都不加冠词。而 play the piano（乐器要 the）、go to the school（指那所学校这个建筑）要加 the。',
      },
      {
        level: '次重点',
        text: '复合不定代词与形容词后置',
        explain:
          'something, anything, nothing, somebody, anybody 等被形容词修饰时形容词要后置：something important；作主语时谓语用单数：Everyone is here. / Nothing is impossible.。',
      },
      {
        level: '了解',
        text: 'it 作形式主语与 it 指代时间、天气、距离',
        explain: 'It is important for us to learn English well. 中 it 是形式主语，真正的主语是后面的不定式；It is raining. / It is Monday. 中的 it 指天气和时间，不能说成 That is raining.。',
      },
    ],
    rules: [
      {
        rule: '人称代词主格作主语，宾格作宾语',
        form: '主格 I/we/he/she/they + 谓语；动词、介词 + 宾格 me/us/him/her/them',
        example: 'She gave me a present, and I thanked her.',
        cn: '她送给我一份礼物，我向她道谢。',
        tip: '空格在动词或介词后面一律用宾格；判断时先找出谓语动词。',
      },
      {
        rule: '形容词性物主代词后必须跟名词，名词性物主代词独立使用',
        form: '形容词性 my/your/his/her/our/their + 名词；名词性 mine/yours/his/hers/ours/theirs',
        example: 'This is my pen. That one is yours.',
        cn: '这是我的钢笔，那一支是你的。',
        tip: '看空格后面有没有名词：有名词用 my 这类，没有名词用 mine 这类，这是最省时的判断法。',
      },
      {
        rule: '反身代词用于主语与宾语一致的句子及固定搭配',
        form: 'enjoy oneself / teach oneself / help oneself to / by oneself / look after oneself',
        example: 'The children enjoyed themselves at the party.',
        cn: '孩子们在聚会上玩得很开心。',
        tip: '看到 enjoy, teach, hurt, help 后面是空，且句子的主语和宾语是同一个人，就用反身代词。',
      },
      {
        rule: 'both / either / neither 用于两者，none 用于三者以上',
        form: 'both of the two（都）；either of the two（任一）；neither of the two（都不）；none of the three（都不）',
        example: 'Both of the twins like music, but neither of them can play the piano.',
        cn: '这对双胞胎都喜欢音乐，但两人都不会弹钢琴。',
        tip: '题干里出现 two 或 a pair of 就用 both/either/neither；出现 three 或复数群体用 none。',
      },
      {
        rule: 'a 与 an 由后面单词的第一个音素决定',
        form: 'a + 辅音音素；an + 元音音素',
        example: 'He is an honest boy and he has a useful dictionary.',
        cn: '他是个诚实的孩子，而且有一本很有用的词典。',
        tip: '不要看字母，要听读音：hour 与 honest 的 h 不发音用 an，useful 与 university 读 /juː/ 用 a。',
      },
      {
        rule: 'the 表示特指、独一无二与序数词、最高级前',
        form: 'the + 名词（特指/独一无二）；the + 序数词/最高级 + 名词',
        example: 'The sun rises in the east. My brother was the first to arrive at school today.',
        cn: '太阳从东边升起。我弟弟今天第一个到校。',
        tip: '上文已经提过、说话双方都知道、世界上独一无二的事物，都要加 the。',
      },
      {
        rule: '零冠词：三餐、球类运动、学科与固定短语',
        form: 'have breakfast/lunch/dinner; play football/basketball; study English; go to school/bed; by bus; at home',
        example: 'My brother plays basketball after school every day.',
        cn: '我弟弟每天放学后打篮球。',
        tip: '球类前不加 the，但乐器前要加：play the piano。这两条是中考冠词题的固定考点。',
      },
      {
        rule: '复合不定代词被形容词修饰时形容词后置',
        form: 'something/anything/nothing/somebody + 形容词',
        example: 'I have something important to tell you.',
        cn: '我有一件重要的事要告诉你。',
        tip: '形容词要放在不定代词后面，写成 important something 一律错；并且这类词作主语时谓语用单数。',
      },
    ],
    mistakes: [
      {
        wrong: 'This book is my, and that one is your.',
        right: 'This book is mine, and that one is yours.',
        why: '句末没有名词，要用名词性物主代词 mine, yours。my 和 your 后面必须跟名词。',
      },
      {
        wrong: 'We enjoyed us very much at the party.',
        right: 'We enjoyed ourselves very much at the party.',
        why: 'enjoy 的宾语与主语是同一群人，必须用反身代词 ourselves，不能用宾格 us。',
      },
      {
        wrong: 'Neither of the two answers are right.',
        right: 'Neither of the two answers is right.',
        why: 'neither of + 复数名词作主语时，谓语通常用单数。同理 none of 作主语也常用单数。',
      },
      {
        wrong: 'He is a honest boy and he goes to the school by the bike.',
        right: 'He is an honest boy and he goes to school by bike.',
        why: 'honest 的 h 不发音，元音音素开头要用 an；go to school 和 by bike 都是固定短语，不加冠词。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-9-q1',
        type: 'choice',
        stem: 'This is not my dictionary. ______ is on the desk in my room.',
        options: ['My', 'Mine', 'Me', 'Myself'],
        answer: 'B',
        explanation:
          '空格后面没有名词，且空格在句中作主语，要用名词性物主代词 Mine（= My dictionary）。My 后面必须跟名词，Me 是宾格，Myself 是反身代词。',
        difficulty: 1,
        tags: ['物主代词', '名词性'],
      },
      {
        id: 'eng-grammar-9-q2',
        type: 'choice',
        stem: '— Would you like some tea or coffee?\n— ______ is OK. I do not mind.',
        options: ['Both', 'Either', 'Neither', 'None'],
        answer: 'B',
        explanation:
          '两者中任一个都可以，用 Either。Both 表示两者都要，与「随便哪个都行」不符；Neither 表示两个都不要；None 用于三者以上。',
        difficulty: 2,
        tags: ['不定代词', 'either'],
      },
      {
        id: 'eng-grammar-9-q3',
        type: 'choice',
        stem: '— Are the two boys from Guangzhou?\n— ______ of them is. Both of them were born in Shanghai.',
        options: ['Both', 'Either', 'Neither', 'All'],
        answer: 'C',
        explanation:
          '后半句说两人都出生在上海，说明两人都不是广州人，用 Neither（两者都不）。Both 与后句矛盾，Either 表示「任一个」，All 用于三者以上。',
        difficulty: 2,
        tags: ['不定代词', 'neither'],
      },
      {
        id: 'eng-grammar-9-q4',
        type: 'choice',
        stem: 'He is ______ honest boy, and he always tells the truth.',
        options: ['a', 'an', 'the', '/'],
        answer: 'B',
        explanation:
          'honest 的首字母 h 不发音，这个词以元音音素开头，所以用 an。冠词的选择看读音而不是看字母。',
        difficulty: 1,
        tags: ['冠词', 'a/an'],
      },
      {
        id: 'eng-grammar-9-q5',
        type: 'choice',
        stem: 'My brother plays ______ basketball with his classmates after school every day.',
        options: ['a', 'an', 'the', '/'],
        answer: 'D',
        explanation: '球类运动前不加冠词，play basketball 是固定搭配。注意乐器前要加 the：play the piano。',
        difficulty: 1,
        tags: ['冠词', '零冠词'],
      },
      {
        id: 'eng-grammar-9-q6',
        type: 'choice',
        stem: 'I have ______ to tell you about the school trip.',
        options: ['important something', 'something important', 'anything important', 'important anything'],
        answer: 'B',
        explanation:
          '肯定句中用 something，且形容词修饰复合不定代词时要后置，所以是 something important。这是「形容词后置」的固定考法。',
        difficulty: 2,
        tags: ['不定代词', '形容词后置'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 10. 介词与连词                                                      */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-10',
    grade: 'all',
    unit: '词法',
    title: '介词与连词：in/on/at 与 both…and 类关联词',
    enTitle: 'Prepositions and Conjunctions',
    summary: '时间介词按「范围大小」选 in/on/at，地点介词按「大地方/小地方」选 in/at，关联连词的主谓一致看「就近原则」。',
    points: [
      {
        level: '重点',
        text: '时间介词 in / on / at 的分工',
        explain:
          'in 用于年、月、季节、上午下午晚上（in 2010, in May, in summer, in the morning）；on 用于具体某一天或某天的上下午（on May 1st, on Monday, on the morning of May 1st）；at 用于具体时刻和某些时间点（at six o\'clock, at noon, at night）。范围由大到小：in > on > at。',
      },
      {
        level: '重点',
        text: '地点介词 in / at / to 与 on / in 的区别',
        explain:
          'arrive in + 大地方（城市、国家），arrive at + 小地方（车站、机场、学校）；不能用 arrive to。lie in/on/to 表示方位：in 表示在内部，on 表示接壤，to 表示在外部相邻之外。on the wall 指在墙面上，in the wall 指嵌在墙里（如窗户、洞）。',
      },
      {
        level: '重点',
        text: '高频动词、形容词 + 介词搭配',
        explain:
          'be good at, be interested in, be proud of, be afraid of, be full of, be angry with sb, be strict with sb, depend on, look forward to, take part in, pay attention to。这类题考的是「搭配记不记得」，看到动词或形容词就要立刻想固定介词。',
      },
      {
        level: '次重点',
        text: 'both…and / either…or / neither…nor / not only…but also',
        explain:
          'both A and B 连接两个主语时谓语用复数；either…or, neither…nor, not only…but also 连接主语时谓语与最近的主语一致（就近原则）。看到选项里的谓语形式，先判断是「都」还是「任一个」还是「都不」。',
      },
      {
        level: '次重点',
        text: 'in 与 after 表将来时间的区别',
        explain: 'in + 一段时间表示「在……之后」（用于将来时）：in two days；after + 时间点表示「在……之后」：after seven o\'clock。答语 How soon…? 常用 in + 一段时间。',
      },
      {
        level: '了解',
        text: 'by 与 until 的用法',
        explain: 'by 表示「到……为止（不迟于）」，by the end of last term 常与过去完成时连用；until 表示「直到」，not … until 表示「直到……才」。',
      },
      {
        level: '了解',
        text: '易混连词不连用',
        explain: 'because 与 so 不能连用，although 与 but 不能连用，还有 for（并列连词，表示补充原因，需放在句中并用逗号隔开）。',
      },
    ],
    rules: [
      {
        rule: '时间介词 in 用于较长时间范围',
        form: 'in + 年/月/季节/上午下午晚上',
        example: 'My uncle was born in Guangzhou in 1985.',
        cn: '我叔叔 1985 年出生在广州。',
        tip: '范围大于一天用 in：in 1998, in May, in summer, in the morning。',
      },
      {
        rule: '时间介词 on 用于具体某一天',
        form: 'on + 星期/日期/某天的上下午晚上',
        example: 'We will have a class meeting on Friday afternoon.',
        cn: '我们将在周五下午开班会。',
        tip: '只要「落到具体哪一天」，即使后面还有 morning/afternoon，也用 on：on the morning of May 1st。',
      },
      {
        rule: '时间介词 at 用于具体时刻与固定短语',
        form: 'at + 时刻：at seven o\'clock, at noon, at night, at the age of',
        example: 'The train leaves at half past seven in the morning.',
        cn: '火车早上七点半出发。',
        tip: '看到了点钟就用 at；at night 与 in the evening 要分别记住。',
      },
      {
        rule: 'arrive in / arrive at 与方位介词 in/on/to',
        form: 'arrive in + 大地方；arrive at + 小地方；方位 in（内部）/on（接壤）/to（以外）',
        example: 'They arrived in Shanghai at nine and arrived at the hotel at ten.',
        cn: '他们九点到达上海，十点到达酒店。',
        tip: '没有 arrive to 这种搭配；判断用 in 还是 at 就看后面地点的范围大小。',
      },
      {
        rule: '形容词与动词后的固定介词搭配',
        form: 'be good at / be interested in / be proud of / be afraid of / be full of / depend on / look forward to',
        example: 'Our teacher is proud of us, and we are all good at English.',
        cn: '老师为我们感到骄傲，我们英语都很好。',
        tip: '这类搭配只能靠记清单；做题时先看空格前的词，再回忆它后面必须跟哪个介词。',
      },
      {
        rule: 'both … and 连接主语时谓语用复数',
        form: 'Both A and B + 复数谓语',
        example: 'Both Tom and Jack are good at playing basketball.',
        cn: '汤姆和杰克都擅长打篮球。',
        tip: '看到 both…and 就用 are/were/do，不能用 is。',
      },
      {
        rule: 'either … or / neither … nor / not only … but also 遵循就近原则',
        form: '谓语与最近的主语保持一致',
        example: 'Either you or he is right about the answer.',
        cn: '关于这个答案，不是你对他就是他对。',
        tip: '把与谓语最近的那个主语圈出来，按它的数决定谓语，不管前面的主语是什么。',
      },
      {
        rule: 'in + 一段时间表示将来「在……之后」',
        form: 'in + 一段时间（用于一般将来时）',
        example: '— How soon will your father come back? — In two days.',
        cn: '——你爸爸多久以后回来？——两天后。',
        tip: 'How soon 的问句答语用 in + 一段时间；after 后面一般接时间点，如 after seven o\'clock。',
      },
    ],
    mistakes: [
      {
        wrong: 'He was born in May 1st, 1985.',
        right: 'He was born on May 1st, 1985.',
        why: '具体到某一天（含月日）要用 on，in 只用于年、月、季节这类较大的时间范围。',
      },
      {
        wrong: 'I will come back after three days.',
        right: 'I will come back in three days.',
        why: 'in + 一段时间表示「在……之后」，用于将来时；after 后面一般接时间点或用于过去。',
      },
      {
        wrong: 'Neither Tom nor Jack are good at English.',
        right: 'Neither Tom nor Jack is good at English.',
        why: 'neither…nor 连接主语时谓语与最近的主语一致（就近原则），Jack 是单数，所以用 is。',
      },
      {
        wrong: 'She is interested at music and she is good in maths.',
        right: 'She is interested in music and she is good at maths.',
        why: 'be interested in 与 be good at 是固定搭配，介词不能换。介词搭配题只要记混一个介词就会选错。',
      },
      {
        wrong: 'They arrived to Guangzhou last night.',
        right: 'They arrived in Guangzhou last night.',
        why: 'arrive 后面接大地方用 in，接小地方用 at，没有 arrive to 的说法。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-10-q1',
        type: 'choice',
        stem: 'My uncle was born ______ the morning of July 8th, 1985.',
        options: ['in', 'on', 'at', 'for'],
        answer: 'B',
        explanation:
          '虽然 the morning 通常与 in 连用，但这里 morning 被 of July 8th 限定为「具体某一天的早上」，必须用 on。这是时间介词最经典的陷阱题。',
        difficulty: 3,
        tags: ['时间介词', 'in/on'],
      },
      {
        id: 'eng-grammar-10-q2',
        type: 'choice',
        stem: 'We usually have a class meeting ______ Friday afternoon.',
        options: ['in', 'on', 'at', 'to'],
        answer: 'B',
        explanation: 'Friday afternoon 是具体某一天的下午，用 on。in the afternoon 用于泛指「在下午」。',
        difficulty: 2,
        tags: ['时间介词', 'on'],
      },
      {
        id: 'eng-grammar-10-q3',
        type: 'choice',
        stem: '— When will your father come back?\n— ______ two days.',
        options: ['In', 'After', 'For', 'Since'],
        answer: 'A',
        explanation:
          '问句问的是「多久以后」，答语用 in + 一段时间表示将来时间。after 后面一般接时间点（after seven），for 表示持续长度，since 表示起点。',
        difficulty: 2,
        tags: ['时间介词', 'in', '将来'],
      },
      {
        id: 'eng-grammar-10-q4',
        type: 'choice',
        stem: '______ my father ______ my mother are doctors. They work in the same hospital.',
        options: ['Either / or', 'Neither / nor', 'Both / and', 'Not only / but also'],
        answer: 'C',
        explanation:
          '后半句 They 说明两个人都符合条件，用 Both … and，谓语用复数 are。Either…or 与 Neither…nor 后面用 are 违反就近原则，Not only…but also 同样要就近用 is。',
        difficulty: 3,
        tags: ['关联连词', 'both and', '主谓一致'],
      },
      {
        id: 'eng-grammar-10-q5',
        type: 'choice',
        stem: 'He arrived ______ the airport at seven this morning.',
        options: ['in', 'to', 'at', 'on'],
        answer: 'C',
        explanation:
          'the airport 是小地点，用 arrive at；arrive in 用于城市、国家这类大地方，arrive to 没有这种搭配（arrive 后也可直接跟地点副词，如 arrive home）。',
        difficulty: 2,
        tags: ['地点介词', 'arrive at'],
      },
      {
        id: 'eng-grammar-10-q6',
        type: 'choice',
        stem: 'Not only the students but also their teacher ______ interested in the science activity.',
        options: ['are', 'is', 'were', 'be'],
        answer: 'B',
        explanation:
          'not only…but also 连接主语时谓语与最近的主语一致，their teacher 是单数，所以用 is。这是就近原则的典型考法。',
        difficulty: 3,
        tags: ['关联连词', '就近原则', '主谓一致'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 11. 主谓一致、there be 与倒装                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-grammar-11',
    grade: 'all',
    unit: '句法',
    title: '主谓一致、there be 与常见倒装句型',
    enTitle: 'Subject-Verb Agreement, There be and Inversion',
    summary: '主语长的时候先找准真正的主语：there be 与 either…or 用就近原则，as well as 与 with 用就远原则，so/neither 引导倒装。',
    points: [
      {
        level: '重点',
        text: 'There be 句型的就近原则',
        explain:
          'There be 后面的名词如果是并列的，be 的形式由最近的那个名词决定：There is a pen and two books…；There are two books and a pen…。判断时只看紧挨 be 的那个名词，不必管后面的。',
      },
      {
        level: '重点',
        text: 'There be 的时态与「there be + 名词 + doing」',
        explain:
          'there be 可以用于各种时态：there was/were（过去）, there will be（将来）, there have/has been（现在完成）。不能用 there have/has 表示「有」。表示「有……正在做某事」用 There be + 名词 + doing：There are some boys playing football.。',
      },
      {
        level: '重点',
        text: '就远原则：as well as / with / together with / except 不影响主语数',
        explain:
          '当主语后面跟 with, together with, as well as, along with, but, except, besides 引出的短语时，谓语与前面真正的主语保持一致：The teacher, together with his students, is visiting the museum. 判断时要先把这些插入成分划掉。',
      },
      {
        level: '次重点',
        text: 'a number of 与 the number of 的区别',
        explain:
          'a number of + 复数名词表示「许多」，作主语时谓语用复数：A number of students are playing.；the number of + 复数名词表示「……的数量」，作主语时谓语用单数：The number of the students is 200.。',
      },
      {
        level: '次重点',
        text: 'so / neither 引导的倒装：表示「也一样／也不」',
        explain:
          'So + 助动词 + 主语（肯定句，表示「……也是」）；Neither/Nor + 助动词 + 主语（否定句，表示「……也不是」）。助动词要和前一句一致：前句有 be 用 be，有 can 用 can，有实义动词用 do/does/did。注意 So + 主语 + 助动词 是「确实如此」，与倒装意思不同。',
      },
      {
        level: '了解',
        text: 'here / there 引导的完全倒装',
        explain: 'Here comes the bus. / There goes the bell. 主语是名词时用完全倒装（谓语在主语前）；主语是代词时不倒装：Here it is. / Here you are.。',
      },
      {
        level: '了解',
        text: '常用句型：It is + 形容词 + of/for sb to do',
        explain: 'It is important for us to protect the environment.（描述事情）与 It is kind of you to help me.（描述人的品质）用 of 还是 for，看形容词是描写事情还是描写人。',
      },
      {
        level: '了解',
        text: '集体名词与 the + 形容词作主语的一致',
        explain: 'family, class, team 强调整体时用单数，强调成员时用复数：My family is a big one. / My family are watching TV. the old, the young 作主语时谓语用复数。',
      },
    ],
    rules: [
      {
        rule: 'There be 句型遵循就近原则',
        form: 'There is + 单数名词/不可数名词；There are + 复数名词（以最近的名词为准）',
        example: 'There is a pen and two books on the desk.',
        cn: '桌上有一支钢笔和两本书。',
        tip: '只看紧挨 be 的名词：a pen 是单数就用 is，即使后面还有 two books。',
      },
      {
        rule: 'There be 的时态变化',
        form: 'There was/were …；There will be …；There have/has been …',
        example: 'There was a small river here ten years ago. / There will be a sports meeting next week.',
        cn: '十年前这里有一条小河。／下周将有一场运动会。',
        tip: '表示「有」只能用 there be，不能用 there have；时态按时间状语变化。',
      },
      {
        rule: 'There be + 名词 + doing 表示「有……正在做某事」',
        form: 'There is/are + 名词 + doing sth + 地点',
        example: 'There are some boys playing football on the playground.',
        cn: '有一些男孩正在操场上踢足球。',
        tip: '这个结构里真正的主语是名词，doing 是后置定语；谓语形式由名词的单复数决定。',
      },
      {
        rule: '就远原则：with / together with / as well as 不改变谓语形式',
        form: '主语 + with/as well as/together with + 其他 + 谓语（与主语一致）',
        example: 'The teacher, together with his students, is visiting the museum.',
        cn: '老师和他的学生们正在参观博物馆。',
        tip: '看到逗号中间的 with/as well as 结构，先用笔划掉，剩下的主语才是决定谓语的那个。',
      },
      {
        rule: 'either … or / neither … nor 遵循就近原则',
        form: 'Either A or B + 谓语（与 B 一致）',
        example: 'Either Tom or his friends are coming to the party.',
        cn: '要么汤姆来，要么他的朋友们来参加聚会。',
        tip: '与 not only…but also 一样，谓语只看最近的主语 his friends，用 are。',
      },
      {
        rule: 'a number of 与 the number of 的主谓一致',
        form: 'A number of + 复数名词 + 复数谓语；The number of + 复数名词 + 单数谓语',
        example: 'A number of students are reading in the library. / The number of the students is 200.',
        cn: '许多学生在图书馆看书。／学生人数是 200。',
        tip: '看开头的冠词：a number of 的中心词是 students（复数），the number of 的中心词是 number（单数）。',
      },
      {
        rule: 'So + 助动词 + 主语 表示「……也一样」',
        form: '— I like music. — So do I.',
        example: '— I have finished my homework. — So have I.',
        cn: '——我已经完成作业了。——我也完成了。',
        tip: '倒装表示「我也一样」；如果写成 So I have. 意思是「我确实完成了」，用来确认对方说的话。',
      },
      {
        rule: 'Neither/Nor + 助动词 + 主语 表示「……也不」',
        form: '— I have never been there. — Neither have I.',
        example: '— I cannot swim. — Neither can my brother.',
        cn: '——我不会游泳。——我弟弟也不会。',
        tip: '前句是否定句时用 Neither/Nor 开头，并保持倒装；助动词与前句一致。',
      },
      {
        rule: 'Here / There 引导的完全倒装',
        form: 'Here/There + 谓语 + 名词主语（主语是代词时不倒装）',
        example: 'Here comes the bus! / Here it is.',
        cn: '公交车来了！／它在这里。',
        tip: '主语是名词才倒装；主语是 it/they 这类代词时写成 Here it is.，不能倒装。',
      },
    ],
    mistakes: [
      {
        wrong: 'There have a lot of books in the school library.',
        right: 'There are a lot of books in the school library.',
        why: '表示「某处有某物」用 there be，不能用 there have；a lot of books 是复数，be 用 are。',
      },
      {
        wrong: 'There is some boys playing football on the playground.',
        right: 'There are some boys playing football on the playground.',
        why: 'There be + 名词 + doing 结构中，be 的形式由名词决定；some boys 是复数，要用 There are。',
      },
      {
        wrong: 'The teacher as well as the students are here now.',
        right: 'The teacher as well as the students is here now.',
        why: 'as well as 引出的部分不影响主语数，谓语与 the teacher 一致，用 is（就远原则）。',
      },
      {
        wrong: 'The number of the students in our school are more than two thousand.',
        right: 'The number of the students in our school is more than two thousand.',
        why: 'the number of 的中心词是 number，作主语时谓语用单数 is；只有 a number of（许多）才用复数谓语。',
      },
      {
        wrong: '— I like playing basketball. — So I do.',
        right: '— I like playing basketball. — So do I.',
        why: '表示「我也一样」要用倒装 So + 助动词 + 主语；So I do 的意思是「我确实喜欢」，用于确认对方的说法。',
      },
    ],
    questions: [
      {
        id: 'eng-grammar-11-q1',
        type: 'choice',
        stem: 'There ______ a book and two pens on the desk.',
        options: ['is', 'are', 'have', 'has'],
        answer: 'A',
        explanation:
          'There be 句型遵循就近原则，紧挨 be 的名词是 a book（单数），所以用 is。C、D 项用 have/has 表示「有」是中式英语错误。',
        difficulty: 1,
        tags: ['there be', '就近原则'],
      },
      {
        id: 'eng-grammar-11-q2',
        type: 'choice',
        stem: 'There ______ a lot of changes in my hometown since 2015.',
        options: ['is', 'are', 'have been', 'has been'],
        answer: 'C',
        explanation:
          'since 2015 提示用现在完成时，there be 的现在完成时形式是 there have/has been；主语 changes 是复数，用 have been。表示「有」不能用 there have 直接加名词。',
        difficulty: 3,
        tags: ['there be', '现在完成时'],
      },
      {
        id: 'eng-grammar-11-q3',
        type: 'choice',
        stem: 'The headmaster, together with the teachers, ______ the new library at the moment.',
        options: ['are visiting', 'is visiting', 'visit', 'have visited'],
        answer: 'B',
        explanation:
          'together with the teachers 是插入成分，不影响主语数，真正的中心词是 The headmaster（单数），谓语用 is；at the moment 表示此刻正在，用现在进行时。',
        difficulty: 3,
        tags: ['主谓一致', '就远原则'],
      },
      {
        id: 'eng-grammar-11-q4',
        type: 'choice',
        stem: '— I have never been to the Palace Museum.\n— ______. I hope we can go there together one day.',
        options: ['So have I', 'Neither have I', 'So I have', 'Neither I have'],
        answer: 'B',
        explanation:
          '前句是否定句（never），表示「我也没去过」要用 Neither/Nor + 助动词 + 主语的倒装结构，助动词与前句一致，用 have。A 项用于肯定句，C、D 语序错误。',
        difficulty: 2,
        tags: ['倒装', 'neither', 'so'],
      },
      {
        id: 'eng-grammar-11-q5',
        type: 'choice',
        stem: '______ of the students in our class ______ 45.',
        options: ['The number / is', 'A number / is', 'The number / are', 'A number / are'],
        answer: 'A',
        explanation:
          '「我们班学生的人数是 45」用 The number of …，谓语用单数 is。a number of 表示「许多」，谓语要用复数，与句意「人数是 45」不符。',
        difficulty: 3,
        tags: ['主谓一致', 'the number of'],
      },
      {
        id: 'eng-grammar-11-q6',
        type: 'choice',
        stem: 'There ______ a sports meeting in our school next Friday.',
        options: ['is going to have', 'will have', 'is going to be', 'are going to be'],
        answer: 'C',
        explanation:
          '表示「将有」要用 there be 的将来时 there is going to be 或 there will be，不能用 have。a sports meeting 是单数，用 is going to be。',
        difficulty: 2,
        tags: ['there be', '一般将来时'],
      },
      {
        id: 'eng-grammar-11-q7',
        type: 'choice',
        stem: 'Look! ______ the bus. Let\'s get on quickly.',
        options: ['Here the bus comes', 'Here comes the bus', 'Comes here the bus', 'The bus here comes'],
        answer: 'B',
        explanation:
          'Here/There 置于句首且主语是名词时，用完全倒装：Here comes the bus. 主语是代词时则不倒装，如 Here it comes.。',
        difficulty: 2,
        tags: ['倒装', 'here'],
      },
    ],
  },
];
