/**
 * 英语 · 阅读模块（按广州中考知识模块组织，撰写规范见 ../../CONTENT-SPEC.md）
 *
 * 覆盖题型：完形填空、阅读选择（细节与词义猜测 / 主旨与推理 / 应用文与多模态语篇）、
 * 阅读填空（选词填空与七选五）、项目情境读写（图表信息与表达、跨学科主题探究）。
 *
 * 卷面依据：2027—2029 年广州中考英语笔试「阅读」第一节 选择题 15 小题 30 分、
 * 第二节 选择题 5 小题 5 分；「项目情境（读写综合）」第一节 选择题 5 小题 10 分、
 * 第二节 简答题 5 小题 10 分。本文件所有语篇与题目均为原创，不复刻真题原文。
 */

import type { EnglishKnowledge } from '../../../types';

export const topics: EnglishKnowledge[] = [
  {
    id: 'eng-reading-1',
    grade: 'all',
    unit: '完形填空',
    title: '完形填空解题法：先通读，再用上下文线索定词',
    enTitle: 'Cloze Test: Read First, Then Use the Clues',
    summary:
      '完形填空不考孤立的语法，考的是「读懂上下文再选词」：先花一分钟通读全文弄清人物与事情的变化，再用复现线索、固定搭配、逻辑连词和感情色彩把每个空逐个锁定。',
    points: [
      {
        level: '重点',
        text: '先通读全文，再回头逐空作答',
        explain:
          '不要从第一空就开始做。先用 40—60 秒把全文读完，弄清「谁、在哪里、发生了什么事、态度有没有变化」。完形的首句一般不设空，它就是全文的钥匙；末句常点明结果或感受，往往能帮你还原前面拿不准的选项。',
      },
      {
        level: '重点',
        text: '抓上下文复现与同义线索',
        explain:
          '同一个词或它的同义词、反义词在同一段反复出现时，空格多半就填它。上文出现 a leaking toilet，下文的意思就只能往「浪费水」上走；看到 grandmother 和 grandfather，空格的代词就只能是 she 或 he，不可能是 they。',
      },
      {
        level: '重点',
        text: '固定搭配与短语动词优先锁定',
        explain:
          'be good at、take part in、give up、hold out、look forward to doing、be proud of 这类搭配只要认出来就能直接定答案。四个选项都眼熟时，先看哪个能和空格前后的介词、名词搭得上，这一招在广州市卷里命中率最高。',
      },
      {
        level: '重点',
        text: '逻辑连词定方向',
        explain:
          'but/however/although 前后意思相反；so/therefore 后面是结果；because/since/as 后面是原因；besides/what is more 表递进；for example 后面一定是例子。判断空格前后两句是转折还是因果，比盯着单词本身更有用。',
      },
      {
        level: '次重点',
        text: '词义辨析看感情色彩与语气',
        explain:
          '四个选项意思相近时，比较它们是褒义、贬义还是中性，并与全文基调保持一致。记叙文里的评价词（encouraging、proud、careless、worried）常靠人物说话的语气和下文的结果判断。',
      },
      {
        level: '了解',
        text: '利用语法提示：时态、单复数、非谓语形式',
        explain:
          '空格前后的时间状语与主语决定动词形式：last term 配过去式，every morning 配一般现在时，have/has 后面要过去分词。名词空要数一数前面是 a 还是 many；形容词空要看后面有没有 than（有 than 就要比较级）。',
      },
    ],
    passages: [
      {
        title: 'Cantonese Opera at Our School',
        kind: '记叙文（完形填空）',
        text: "Last September our school started a Cantonese opera club. Only eight students signed up, and I was one of them, mainly because my grandma loves this art form.\nOur teacher, Ms Chen, told us that Cantonese opera is more than three hundred years old, and that it ___1___ singing, acting and fighting. She also said that we did not need a perfect voice, but we did need ___2___ and patience.\nLearning the first song was harder than I had expected. We had to stand still and ___3___ our arms for ten minutes. My legs ached and I wanted to give up. Then Ms Chen showed us a video of an old actor. He was over seventy, ___4___ he still practised every morning at six. After that, I stopped complaining.\nIn May we performed at the city library. I only had three lines, but when the music started, my heart beat fast. Grandma sat in the front row and clapped ___5___. Later she told me that my grandfather used to sing the same song in the fields. Suddenly the old art did not seem old any more: it had become a bridge between us.",
        cn: '去年九月，我们学校成立了粤剧社团。只有八名同学报名，我是其中一个，主要因为我奶奶喜欢这门艺术。\n陈老师告诉我们，粤剧有三百多年历史，它把唱、做、打结合在一起。她还说，我们不需要完美的嗓音，但确实需要练习和耐心。\n学第一支曲子比我想的难。我们要站得笔直，把手臂平举出去十分钟。我的腿又酸又痛，很想放弃。后来陈老师给我们看了一位老演员的视频：他已经七十多岁了，可还是每天早上六点练功。从那以后，我就不再抱怨了。\n五月，我们在市图书馆演出。我只有三句唱词，可音乐一响，我的心跳得很快。奶奶坐在第一排，鼓掌鼓得很响。后来她告诉我，我爷爷以前就在田里唱同一支曲子。忽然间，这门老艺术好像不再老了：它成了我们之间的一座桥。',
        questions: [
          {
            id: 'eng-reading-1-p1-q1',
            type: 'choice',
            stem: 'Choose the best answer for Blank 1: "... and that it ___1___ singing, acting and fighting."',
            options: ['counts', 'compares', 'complains', 'combines'],
            answer: 'D',
            explanation:
              '粤剧把唱、做、打「结合」在一起，用 combine。compare 是「比较」，complain 是「抱怨」，count 是「数、算」，三个词拼写相似但意思都对不上。此处主语 it 指粤剧，一般现在时第三人称单数，只有 combines 形式与词义都正确。',
            difficulty: 2,
            tags: ['动词辨析', '上下文选词'],
          },
          {
            id: 'eng-reading-1-p1-q2',
            type: 'choice',
            stem: 'Choose the best answer for Blank 2: "... but we did need ___2___ and patience."',
            options: ['money', 'practice', 'luck', 'silence'],
            answer: 'B',
            explanation:
              '后文写「我们」每天练站姿、练举手臂，最后还上台演出，可见除了耐心，最需要的是「练习」，practice 与 patience 构成自然的并列。money 与学唱戏无关，luck 与全文「靠苦练」的意思相反，silence 与唱戏矛盾。',
            difficulty: 1,
            tags: ['名词辨析', '并列结构'],
          },
          {
            id: 'eng-reading-1-p1-q3',
            type: 'choice',
            stem: 'Choose the best answer for Blank 3: "We had to stand still and ___3___ our arms for ten minutes."',
            options: ['look after', 'give up', 'put off', 'hold out'],
            answer: 'D',
            explanation:
              'hold out our arms 是「把手臂伸出去（平举）」，与前面的 stand still（站直不动）并列，都是练功动作。give up「放弃」、put off「推迟」、look after「照顾」都不能接 our arms 作宾语表示动作。短语动词题先看能否与宾语搭配。',
            difficulty: 2,
            tags: ['短语动词', '搭配'],
          },
          {
            id: 'eng-reading-1-p1-q4',
            type: 'choice',
            stem: 'Choose the best answer for Blank 4: "He was over seventy, ___4___ he still practised every morning at six."',
            options: ['so', 'because', 'or', 'but'],
            answer: 'D',
            explanation:
              '「七十多岁」与「仍然每天早上六点练功」是明显的对比关系，用 but 表转折。so 表结果（年纪大不会导致还练功），or 表选择，because 表原因（原因在前一句已经给出，逻辑不通）。逻辑连词题先判断前后句是相反还是因果。',
            difficulty: 1,
            tags: ['逻辑连词', '转折'],
          },
          {
            id: 'eng-reading-1-p1-q5',
            type: 'choice',
            stem: 'Choose the best answer for Blank 5: "Grandma sat in the front row and clapped ___5___."',
            options: ['hardly', 'rarely', 'loudly', 'quickly'],
            answer: 'C',
            explanation:
              '奶奶坐在第一排给孙女捧场，鼓掌应是「很响」，clapped loudly 是地道搭配。hardly 是「几乎不」、rarely 是「很少」，都与「看得起劲」矛盾；quickly 修饰鼓掌动作不自然（鼓掌可以热烈、响亮，但不说拍得「快」）。',
            difficulty: 2,
            tags: ['副词辨析', '搭配'],
          },
        ],
      },
      {
        title: 'A Morning in Guangzhou',
        kind: '说明文（完形填空）',
        text: "In Guangzhou, a morning often begins with tea. Many old people arrive at the teahouse before seven, order a pot of pu'er and a few dishes of dim sum, and then ___1___ for an hour or two. They call this yum cha, which means drinking tea, but tea is only a small part of it. The real pleasure is sitting with friends and talking about everything under the sun.\nYoung people have their own ___2___. Many of them buy a cup of coffee on the way to work, or order breakfast through an app. Some even eat on the metro, which saves time but is not very polite.\nHowever, the old teahouse is not ___3___. In recent years some teahouses have opened early-morning classes where young people learn to make shrimp dumplings. On Sunday mornings you can see three generations sitting around the same table: the grandmother pours tea, and the grandson takes photos of the dumplings for his friends. ___4___, the tea is the same; what has changed is who sits around the table.\nMaybe that is why yum cha has lasted for so many years. It is less about the food than about the people.",
        cn: '在广州，一个早晨常常从茶开始。很多老人七点前就到茶楼，点一壶普洱和几笼点心，然后一坐就是一两个小时。他们把这叫作「饮茶」，可茶只是其中很小的一部分，真正的乐趣是和朋友坐在一起，天南地北地聊。\n年轻人有自己的习惯。很多人上班路上买一杯咖啡，或者用手机点一份早餐；还有人在地铁上吃早餐，省了时间，但不太礼貌。\n不过，老茶楼并没有消失。近几年，一些茶楼开了早课，教年轻人做虾饺。星期天早上，你能看到三代人坐在同一张桌边：奶奶倒茶，孙子给点心拍照发给朋友。事实上，茶还是那壶茶，变的是坐在桌边的人。\n也许这就是饮茶能延续这么多年的原因：它关乎人，而不只是食物。',
        questions: [
          {
            id: 'eng-reading-1-p2-q1',
            type: 'choice',
            stem: 'Choose the best answer for Blank 1: "... and then ___1___ for an hour or two."',
            options: ['leave', 'arrive', 'stay', 'hurry'],
            answer: 'C',
            explanation:
              '老人到茶楼后又坐一到两小时，stay 表示「待着、停留」。leave 与 arrive 都与「已经到店」矛盾，hurry「匆忙离开」既不合语义也与后文「聊得尽兴」相反。此处考的是动作先后顺序的线索。',
            difficulty: 1,
            tags: ['动词辨析', '语境'],
          },
          {
            id: 'eng-reading-1-p2-q2',
            type: 'choice',
            stem: 'Choose the best answer for Blank 2: "Young people have their own ___2___."',
            options: ['mistakes', 'secrets', 'problems', 'habits'],
            answer: 'D',
            explanation:
              '下文列举年轻人「买咖啡、点外卖、在地铁上吃早餐」，这些都是日常习惯，所以用 habits（习惯）。mistakes「错误」与 problems「问题」带有负面评价，而作者只是客观描述；secrets 与随后的举例无关。',
            difficulty: 2,
            tags: ['名词辨析', '总起句'],
          },
          {
            id: 'eng-reading-1-p2-q3',
            type: 'choice',
            stem: 'Choose the best answer for Blank 3: "However, the old teahouse is not ___3___."',
            options: ['growing', 'disappearing', 'opening', 'moving'],
            answer: 'B',
            explanation:
              'However 表转折，转折后的意思是「老茶楼并没有衰亡」，后面「开了早课、三代同堂」正是它没有消失的证明，故选 disappearing。growing 方向反了（后文不是说茶楼变多）；opening 与 moving 都不能与 the old teahouse 搭配表达「消失」。',
            difficulty: 2,
            tags: ['转折逻辑', '动词辨析'],
          },
          {
            id: 'eng-reading-1-p2-q4',
            type: 'choice',
            stem: 'Choose the best answer for Blank 4: "___4___, the tea is the same; what has changed is who sits around the table."',
            options: ['As a result', 'At first', 'For example', 'In fact'],
            answer: 'D',
            explanation:
              '前一句写奶奶倒茶、孙子拍照的具体场景，本句是对这一现象的总结与点破，用 In fact（事实上）承接最自然。At first 表示「起初」，后文没有时间对比；For example 后面要接例子，而这里接的是结论；As D result 表结果，前后不构成因果。',
            difficulty: 3,
            tags: ['逻辑连接', '总结'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-1-q1',
        type: 'choice',
        stem: 'Choose the best word: "The weather was terrible. ___, the dragon boat race went on as planned."',
        options: ['Besides', 'Therefore', 'However', 'Otherwise'],
        answer: 'C',
        explanation:
          '「天气很糟」与「龙舟赛照常举行」是相反的两件事，用 However 表转折。Therefore 表结果（天气糟不会导致照常比赛），Besides 表递进，Otherwise 表「否则」，后面应接假设的结果而不是已经发生的事实。',
        difficulty: 1,
        tags: ['逻辑连词', '完形填空'],
      },
      {
        id: 'eng-reading-1-q2',
        type: 'choice',
        stem: 'Choose the best word: "My sister is good ___ telling stories about Guangzhou."',
        options: ['in', 'for', 'with', 'at'],
        answer: 'D',
        explanation:
          'be good at doing something 是固定搭配，意为「擅长做某事」。be good for 是「对……有好处」，be good with 是「善于与（人、动物）相处」，be good in 不用于此义。完形填空里只要认出固定搭配就可以直接定答案。',
        difficulty: 1,
        tags: ['固定搭配', '介词'],
      },
      {
        id: 'eng-reading-1-q3',
        type: 'choice',
        stem: 'The phrase "give up" in the sentence "My legs ached and I wanted to give up" is closest in meaning to ___.',
        options: ['take away', 'stand up', 'hand in', 'stop trying'],
        answer: 'D',
        explanation:
          'give up 意为「放弃、不再尝试」，与上文「腿又酸又痛」构成因果。stand up「站起来」、hand in「上交」、take away「拿走」都只与 give up 字面相近，放进原句意思不通。短语含义题一定要把短语放回原句读一遍再判断。',
        difficulty: 1,
        tags: ['短语含义', '词义猜测'],
      },
      {
        id: 'eng-reading-1-q4',
        type: 'choice',
        stem: 'Ms Chen said to the new members, "Do not be afraid of making mistakes." The word that best describes her tone is ___.',
        options: ['doubtful', 'angry', 'careless', 'encouraging'],
        answer: 'D',
        explanation:
          '「别怕犯错」是安慰与鼓励，因此语气是 encouraging（鼓励的）。angry 与句子内容相反；careless 形容人粗心，不是语气；doubtful「怀疑的」也与鼓励的语气不符。语气题看关键词（fear 与 not 的搭配）和全文基调。',
        difficulty: 2,
        tags: ['感情色彩', '语气判断'],
      },
      {
        id: 'eng-reading-1-q5',
        type: 'fill',
        stem: 'Fill in the blank with the correct form of the word in brackets: "He practised every morning, so he ___ (make) great progress last term."',
        answer: 'made',
        explanation:
          'so 连接的并列句时态要一致：前句 practised 是过去式，时间状语 last term 也提示过去，所以填 made。注意 make progress 是固定搭配，不能用 did；若考现在完成时则应写作 has made，本句有 last term，只能用一般过去时。',
        difficulty: 2,
        tags: ['时态', '动词形式', '固定搭配'],
      },
      {
        id: 'eng-reading-1-q6',
        type: 'short',
        stem: '做完形填空时，如果某个空的四个选项都认识，却还是选不出来，你会用什么办法？请写出两条具体可行的做法。',
        answer:
          '第一条：先跳过这个空，把后面（或前面）的句子读下去，用上下文线索回头判断——完形填空的答案常常在下一句里，例如下文出现了同义词、反义词或结果，就能反推这个空的方向。第二条：把四个选项逐一放回原句，连同前后各一句默读一遍，读不通（时态不一致、搭配不对、意思矛盾）的先排除，剩下两个再比较感情色彩与全文基调。此外还可以检查搭配：看该词能否与空格前后的介词或名词搭配，以及主语的单复数、句子的时态是否匹配。',
        rubric: [
          '写出「先跳过，靠上下文线索回填」这一条，并说明线索来自上下文（同义复现、反义词、因果或结果）。',
          '写出「选项代入原句朗读」，并说明要连前后句一起读，把不通顺、搭配错的排除。',
          '至少提到一项语法检查：时态一致、主谓单复数、介词搭配或非谓语形式。',
          '做法要具体可操作（说清怎么做），不能只写「多读几遍」「认真审题」这类空话。',
        ],
        explanation:
          '完形填空的正确答案一定能在原文里找到依据，所以「选不出」时不能凭感觉，而是回去找线索：上下文复现、逻辑关系、固定搭配、语法形式。把四个选项都代入朗读，是排除法的核心动作。',
        difficulty: 2,
        tags: ['应试策略', '完形填空方法'],
      },
    ],
    examTips: [
      '时间分配：完形填空控制在 8—10 分钟。第一遍通读约 1 分钟，第二遍逐空作答约 5 分钟，第三遍把答案代入复读约 2 分钟，绝不在一两个空上纠缠超过 40 秒。',
      '解题顺序：先做有把握的（固定搭配、连词、上下文的复现词），把拿不准的空先空着继续往下读，后面的信息常常会直接给出答案。',
      '代入复读：每个空选好后，把该句连同前后各一句默读一遍。读不通、时态不一致、搭配别扭的选项立刻改掉，这一步能救回 1—2 分。',
      '两个选项都说得通时，比较感情色彩与全文基调：记叙文看人物的态度是褒是贬，说明文看作者是在介绍、建议还是提醒，与全文一致的优先。',
    ],
  },
  {
    id: 'eng-reading-2',
    grade: 'all',
    unit: '阅读选择',
    title: '阅读理解·细节题与词义猜测',
    enTitle: 'Reading: Details and Word Guessing',
    summary:
      '细节题考「找得准」，词义猜测题考「推得出」：先用题干关键词回原文定位，正确答案多是原文的同义改写；生词的意思就藏在上下文的解释、举例、对比与因果里。',
    points: [
      {
        level: '重点',
        text: '题干关键词回原文定位',
        explain:
          '先圈出题干中的人名、地名、数字、时间、专有名词和核心动词，再回原文扫读找到同一处，答案就在那一句或相邻两句里。问 Paragraph 2 就只看第二段，不要凭印象凭全文。定位句找到后，正确项往往是它的同义改写。',
      },
      {
        level: '重点',
        text: '同义替换才是答案，照抄原文的要警惕',
        explain:
          '命题人常用近义词改写正确项，例如原文说 loud music，选项写 noisy music；原文说 free of charge，选项写 costs nothing。反之，把原文整句照搬的选项常常是「答非所问」的干扰项，要检查它是否回答了题干所问的那个点。',
      },
      {
        level: '重点',
        text: '词义猜测的四把钥匙：解释、举例、对比、因果',
        explain:
          '看到 that is、which means、or 等解释标志，答案就在后面；看到 such as、like、including，就从例子里概括；看到 but、unlike、instead of，就取相反的意思；看到 so、because，就从结果或原因反推。构词法（un-、-less、-able 等）只能作辅助，必须与语境一致。',
      },
      {
        level: '重点',
        text: '排除法：无中生有、张冠李戴、以偏概全',
        explain:
          '典型干扰项有四类：原文没提过（无中生有）、把 A 的特点安到 B 身上（张冠李戴）、把 some 说成 all 或把 always 说成 sometimes（以偏概全）、正误混杂（前半句对后半句错）。逐个核对，只要有一处与原文不符就排除。',
      },
      {
        level: '次重点',
        text: '指代题：往前找最近的、单复数一致的先行词',
        explain:
          'it/they/this/that/which 指代的内容通常在上一句或本句前半部分。判断时看单复数一致、看逻辑通顺：this 常指代前面整句所说的事，it 常指代前面提到的单数名词。把代词换成候选词读一遍，通顺的那个就是答案。',
      },
      {
        level: '了解',
        text: '限制词不能漏看',
        explain:
          'not、except、at least、at most、only、per person、in all 这类词会彻底改变答案。尤其是 NOT true / EXCEPT 题，正确的做法是逐项核对，把三个与原文一致的排除，剩下的就是答案。',
      },
    ],
    passages: [
      {
        title: 'The Lion Dance Team',
        kind: '记叙文',
        text: "When I entered Grade 8, I joined our school's lion dance team. I thought it would be easy: you just put on a lion's head and move to the drums. I was wrong.\nThe head weighs about four kilos. For the first two weeks my coach, Mr Liang, asked me to do nothing but jump, bend and squat to the beat. My shoulders hurt every evening, and I could not even lift my schoolbag with one hand. Two of my classmates quit.\nMr Liang never shouted at us. He comes from a village in Foshan, where his family has performed lion dance for four generations. \"The lion is not a costume,\" he told me. \"It is an animal. When it is curious, its eyes open wide. When it is afraid, it blinks. If you only move your feet, the audience falls asleep.\"\nLast month we performed at a temple fair near the Pearl River. A little boy watched us for twenty minutes and then told his mother that he wanted to learn lion dance too. Hearing that, I suddenly understood why Mr Liang keeps training us in the rain. He is passing on a gift that he received when he was young, and every performance adds one more link to the chain.",
        cn: '上八年级时，我加入了学校的醒狮队。我以为很容易：戴上狮头，跟着鼓点动一动就行。我错了。\n狮头大约四公斤重。头两个星期，梁师傅只让我跟着鼓点跳、弯腰、蹲马步。每天晚上我的肩膀都疼，一只手连书包都提不起来。班上有两个同学退出了。\n梁师傅从不朝我们吼。他来自佛山的一个村子，他家耍醒狮已经传了四代。「狮子不是一件戏服，」他对我说，「它是一只活的动物。它好奇的时候，眼睛睁得大大的；它害怕的时候，会眨眼睛。你要是只顾着动脚，观众就睡着了。」\n上个月，我们在珠江边的一个庙会上表演。一个小男孩看了我们二十分钟，然后跟他妈妈说他也想学醒狮。听到这句话，我忽然明白了梁师傅为什么下雨天也要带我们训练：他是在把自己小时候收到的礼物传下去，而每一次表演，都给这条链子添上新的一环。',
        questions: [
          {
            id: 'eng-reading-2-p1-q1',
            type: 'choice',
            stem: 'Why did the writer think lion dance would be easy at first?',
            options: [
              'Because he had watched many performances before.',
              'Because his coach told him that it was easy.',
              'Because he thought it was just wearing a lion head and moving to the drums.',
              'Because two of his classmates would help him.',
            ],
            answer: 'C',
            explanation:
              '定位第一段第二句：you just put on a lion\'s head and move to the drums，这正是 C 的同义改写。A 项原文未提；B 项与第三段「教练从不吼我们」，以及后文苦练的内容矛盾；D 项提到的两位同学在第二段是退出，不是帮忙。细节题要先找到定位句再逐项核对。',
            difficulty: 1,
            tags: ['细节题', '同义改写'],
          },
          {
            id: 'eng-reading-2-p1-q2',
            type: 'choice',
            stem: 'What does the underlined word "squat" in Paragraph 2 probably mean?',
            options: [
              'to turn around quickly',
              'to shout loudly',
              'to jump high into the air',
              'to bend your knees and lower your body',
            ],
            answer: 'D',
            explanation:
              'squat 与前面的 jump、bend 并列，都是练功动作；后一句说「每天晚上我的肩膀都疼」，可见是吃力的腿部训练，因此是「蹲下」。A、B、C 都是凭空想象的动作用词，与「跟着鼓点练功、肩膀酸痛」的语境无关。词义猜测要抓住并列关系与下文结果。',
            difficulty: 2,
            tags: ['词义猜测', '并列线索'],
          },
          {
            id: 'eng-reading-2-p1-q3',
            type: 'choice',
            stem: 'The two classmates "quit" the team. This means that they ___.',
            options: [
              'gave up the training',
              'joined another team',
              'trained even harder',
              'complained about the coach',
            ],
            answer: 'A',
            explanation:
              '前文写训练又累又痛（肩膀疼、书包都提不起来），紧接着说两位同学 quit，逻辑上是「受不了而退出」，即 gave up。B、C 与「训练太苦」的语境相反；D 项原文没有提到抱怨，属于无中生有。词义题要与上下文的因果、褒贬保持一致。',
            difficulty: 2,
            tags: ['词义猜测', '因果线索'],
          },
          {
            id: 'eng-reading-2-p1-q4',
            type: 'choice',
            stem: 'What did Mr Liang mean by saying "The lion is not a costume"?',
            options: [
              'The lion head is too heavy to wear for long.',
              'Lion dance costumes are too expensive for the team.',
              'Performers must make the lion look alive, not just move their feet.',
              'Students should practise lion dance in the rain.',
            ],
            answer: 'C',
            explanation:
              '画线句后面马上解释：狮子是活的动物，好奇时瞪眼、害怕时眨眼，只顾动脚观众就睡着——意思是表演要演出「活气」，故选 C。A 项是第二段的细节，与这句话的意思无关；B 项原文未提价格；D 项把最后一段提到的「下雨天训练」硬套在此，属于张冠李戴。',
            difficulty: 2,
            tags: ['句意理解', '段落细节'],
          },
        ],
      },
      {
        title: 'Turning Food Waste into Power',
        kind: '说明文',
        text: "Every day Guangzhou produces about 9,000 tonnes of food waste, the weight of more than a thousand elephants. For years this waste was buried in landfill sites, where it gave off methane, a gas that warms the earth far faster than carbon dioxide does.\nNow some of it has a second life. In a plant in Panyu, food waste is put into huge closed tanks. Bacteria break it down in the dark, and the methane they produce is collected and burned to make electricity. One tonne of food waste can produce enough power to keep a classroom's lights on for two days. What is left at the end is a dark, rich material that farmers use to feed their soil.\nBut the plant can only work with clean waste. If plastic bags, chopsticks and lunch boxes are mixed in, the machines are blocked. That is why a growing number of neighbourhoods in the city now ask residents to separate their rubbish: food in one bin, everything else in another.\nStudents can help too. In one primary school, children weigh the food left on their plates after lunch and write the number on a blackboard. Since the project started, the amount of waste has dropped by nearly a third. Nobody was told to eat less; the children simply did not want to see the number grow.",
        cn: '广州每天产生约九千吨厨余垃圾，比一千头大象还重。多年来这些垃圾被埋在填埋场里，散发出甲烷——一种使地球升温速度远快于二氧化碳的气体。\n如今其中一部分有了第二次生命。在番禺的一家工厂里，厨余垃圾被送进巨大的密闭罐。细菌在黑暗中把它分解，产生的甲烷被收集起来燃烧发电。一吨厨余垃圾发出的电，够一间教室亮两天灯。最后剩下的是一种深色肥沃的物质，农民用它来养土。\n但工厂只能处理干净的垃圾。如果混进塑料袋、筷子和饭盒，机器就会被堵住。这就是越来越多社区要求居民分类的原因：厨余放一个桶，其他放另一个桶。\n学生也能出力。在一所小学里，孩子们午饭后称一称盘子里剩下的饭菜，把数字写在黑板上。这个项目开始以来，垃圾量减少了将近三分之一。没有人叫他们少吃，只是他们不想看见那个数字变大。',
        questions: [
          {
            id: 'eng-reading-2-p2-q1',
            type: 'choice',
            stem: 'What problem does methane cause according to Paragraph 1?',
            options: [
              'It takes up too much space in landfill sites.',
              'It makes food waste smell terrible.',
              'It kills the bacteria in the soil.',
              'It warms the earth faster than carbon dioxide.',
            ],
            answer: 'D',
            explanation:
              '定位第一段最后一句：a gas that warms the earth far faster than carbon dioxide does，D 项正是它的改写（faster 对应 far faster）。A 项是垃圾占地，不是甲烷的危害；C 项细菌的作用出现在第二段，且甲烷并不杀细菌；B 项原文根本没说味道。细节题要看清「谁造成什么」。',
            difficulty: 1,
            tags: ['细节题', '定位'],
          },
          {
            id: 'eng-reading-2-p2-q2',
            type: 'choice',
            stem: 'How is food waste turned into electricity?',
            options: [
              'It is burned in the open air near the plant.',
              'Bacteria break it down and the methane is burned.',
              'It is buried first and dug out years later.',
              'It is dried and then fed to farm animals.',
            ],
            answer: 'B',
            explanation:
              '第二段说明流程：细菌在密闭罐里分解垃圾，产生的甲烷被收集燃烧发电，故选 B。A 项「露天焚烧」与 closed tanks 矛盾；C 项正是第一段被否定的旧做法；D 项把「剩下的物质给农民养土」错记成「喂牲口」，属于张冠李戴。',
            difficulty: 1,
            tags: ['细节题', '过程顺序'],
          },
          {
            id: 'eng-reading-2-p2-q3',
            type: 'choice',
            stem: 'What does the underlined word "blocked" in Paragraph 3 probably mean?',
            options: [
              'sold at a higher price',
              'made much cleaner',
              'moved to another place',
              'stopped from working',
            ],
            answer: 'D',
            explanation:
              '前一句说工厂只能处理「干净」的垃圾，下一句说塑料袋、筷子、饭盒混进去，机器就 blocked——由因果可知是「被堵住、不能运转」，即 stopped from working。A、B、C 都放进原句读不通。词义猜测先看前后句给出的是原因还是结果。',
            difficulty: 2,
            tags: ['词义猜测', '因果线索'],
          },
          {
            id: 'eng-reading-2-p2-q4',
            type: 'choice',
            stem: 'Why did the food waste in the primary school drop by nearly a third?',
            options: [
              'The children were told to eat less food.',
              'The school stopped providing lunch.',
              'The children weighed their leftovers and wanted the number to be small.',
              'The plant in Panyu took the waste away every day.',
            ],
            answer: 'C',
            explanation:
              '最后一段说孩子们称剩饭并把数字写在黑板上，没有人叫他们少吃，只是不想看到数字变大，故选 C。A 项与 Nobody was told to eat less 直接矛盾；B 项原文未提；D 项与「学生称重」这一做法无关，属于无中生有。',
            difficulty: 2,
            tags: ['细节题', '因果'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-2-q1',
        type: 'choice',
        stem: 'Read: "Unlike her brother, Mei has never liked crowded places." What can we learn about Mei?',
        options: [
          'She enjoys busy streets and markets.',
          'She prefers quiet places.',
          'She has no brother.',
          'She likes going out with her brother.',
        ],
        answer: 'B',
        explanation:
          'Unlike 是对比标志词，说明 Mei 与哥哥相反：哥哥喜欢热闹，她「从不」喜欢拥挤的地方，因此她更喜欢安静的地方。A 项与 never liked crowded places 相反；C 项误读 unlike（只是对比，不是没有）；D 项原文未提一起外出。看到 unlike、instead of、but 就要取相反或不同的一边。',
        difficulty: 2,
        tags: ['对比线索', '推理判断'],
      },
      {
        id: 'eng-reading-2-q2',
        type: 'choice',
        stem: 'Read: "The museum is free for students, but you must book a ticket online in advance." What must students do?',
        options: [
          'Pay a small fee at the gate.',
          'Book an online ticket before they go.',
          'Bring their parents with them.',
          'Arrive after lunch.',
        ],
        answer: 'B',
        explanation:
          'but 后面的内容才是要求：must book a ticket online in advance，即「提前在网上订票」，故 B 正确。A 项与 free 矛盾；C、D 项原文没有提到，属于无中生有。这类题要抓住 must / should / need to 之后的动作。',
        difficulty: 1,
        tags: ['细节定位', '情态动词'],
      },
      {
        id: 'eng-reading-2-q3',
        type: 'choice',
        stem: 'The word "unreliable" in the sentence "The old bus is slow and unreliable" most probably means ___.',
        options: [
          'not able to be trusted or depended on',
          'very comfortable to sit in',
          'quite expensive to take',
          'easy to repair',
        ],
        answer: 'A',
        explanation:
          'un- 表否定，rely 是「依靠」，-able 是「能……的」，合起来是「不能依靠的、靠不住的」，与 slow 并列构成负面评价，故选 A。B 项是正面评价，与 slow 并列不通；C、D 项都与构词与语境无关。构词法只能提示方向，还要用上下文验证。',
        difficulty: 2,
        tags: ['词义猜测', '构词法'],
      },
      {
        id: 'eng-reading-2-q4',
        type: 'choice',
        stem: 'Read: "Thousands of visitors come to the lychee garden every June, which means the village is crowded then." What does "which" refer to?',
        options: [
          'the lychee garden',
          'the month of June',
          'the fact that thousands of visitors come every June',
          'the village',
        ],
        answer: 'C',
        explanation:
          'which 在非限制性定语从句中常指代前面整句话的内容：正因为「每年六月有成千上万游客来」，所以村子那时很拥挤，故选 C。A、B、D 只是句中的单个名词，代入后与 crowded then 的因果关系说不通。指代题要把候选词代进从句读一遍。',
        difficulty: 3,
        tags: ['指代', '定语从句'],
      },
      {
        id: 'eng-reading-2-q5',
        type: 'fill',
        stem: 'Fill in the blank with the correct form of the word in brackets: "Bacteria break the waste down in closed tanks ___ (produce) methane."',
        answer: 'to produce',
        explanation:
          '此处用动词不定式表目的：「为了产生甲烷」。不定式作目的状语在说明文里非常常见，可以直接还原为 in order to produce。若填 producing 则表示伴随动作，与「分解垃圾是为了得到甲烷」的目的关系不符。',
        difficulty: 2,
        tags: ['非谓语', '目的状语'],
      },
      {
        id: 'eng-reading-2-q6',
        type: 'short',
        stem: '阅读中遇到不认识的单词时，在没有词典的情况下你能怎么猜？请写出两种方法，并各举一个例子说明。',
        answer:
          '方法一：看上下文里的解释或举例。原文常用 that is、which means、such as、like、including 等标志直接给出词义，例如 "Cantonese opera uses many props, such as a fan and a whip." 由 such as 后面的扇子、马鞭可知 props 是「道具」。方法二：看对比或因果关系。用 but、unlike、instead of 取相反的意思，例如 "Unlike his tidy sister, Tom is messy." 由 tidy 推出 messy 是「凌乱」；用 because、so 反推，例如 "The road was blocked, so we had to walk." 由「只好走路」推出 blocked 是「堵住了、不能通行」。此外还可以用构词法辅助：un-、-less、-able、re- 等词缀能提示大致方向，但必须用语境验证。',
        rubric: [
          '写出至少两种猜词方法，且是「用上下文线索」这一类可迁移的方法（解释、举例、对比、因果、构词），而不是「靠感觉猜」。',
          '每种方法配一个具体例子，例子中的生词与线索要对应清楚（说出线索词与推断结果）。',
          '至少提到一类标志词（that is、such as、but、unlike、because、so 等），显示方法可操作。',
          '最后一句话要点明原则：猜出的词义要放回原句读一遍，通顺且与全文基调一致才能确定。',
        ],
        explanation:
          '词义猜测不是拼运气，而是找线索：解释、举例给的是同向信息，对比、转折给的是反向信息，因果给的是推理路径，构词法给的是方向。四条路都试过仍不通时，再看该词的感情色彩（褒义还是贬义），也能排除一两个选项。',
        difficulty: 2,
        tags: ['词义猜测方法', '应试策略'],
      },
    ],
    examTips: [
      '时间分配：阅读选择建议每篇 6—7 分钟。先用 1 分钟看题干圈关键词，再用 2—3 分钟带着问题扫读原文，最后 2 分钟核对选项。',
      '解题顺序：先做细节题（定位就能出答案），再做词义猜测题，最后处理需要通读的题目。一篇文章里总有一两道易题，先把分拿到手。',
      '定位到自己划出的句子后，不要凭记忆选，要把该句与选项逐词对照：主语的单复数、时间、程度词（all、always、only）是否一致。',
      '遇到两个选项都像对的时候，选那个「与原文同义但换了说法」的，排除掉「照抄原文但与题干所问无关」的选项。',
    ],
  },
  {
    id: 'eng-reading-3',
    grade: 'all',
    unit: '阅读选择',
    title: '阅读理解·主旨大意与推理判断',
    enTitle: 'Reading: Main Idea and Inference',
    summary:
      '主旨题问「全篇在讲什么」，推理题问「字面背后能推出什么」：主旨看首尾段与反复出现的词，最佳标题要覆盖全文；推理必须有原文依据，但正确答案一定不是原句照抄。',
    points: [
      {
        level: '重点',
        text: '主旨题看首尾段与高频词',
        explain:
          '主旨题的答案藏在三个地方：首段（提出话题或问题）、末段（结论或呼吁）、以及全文反复出现的名词。把这三处的内容合起来，就是文章的中心。选项只覆盖某一段的，一定不是主旨。',
      },
      {
        level: '重点',
        text: '最佳标题：覆盖全文、不偏不窄、有吸引力',
        explain:
          'Best title 题要求标题能概括全文且不过大过小。范围过大的选项（如 How to Save the Earth）覆盖了全文以外的内容；范围过小的选项（如 Day 3 of the Camp）只讲了某一段。两个都不选，选那个刚好覆盖全篇、还能点出写作目的的。',
      },
      {
        level: '重点',
        text: '推理判断题必须有原文依据',
        explain:
          '题干出现 infer、learn from、suggest、probably、think 时才是推理题。推理的规则是：答案在原文里一定找得到依据（某个细节、某个数据、某句评价），但表达方式是新的；原文里逐字出现的选项反而往往不是答案，因为它不需要推理。',
      },
      {
        level: '重点',
        text: '干扰项的四张面孔',
        explain:
          '以偏概全（把 some 说成 all、把 sometimes 说成 always）、张冠李戴（把 A 的做法安到 B 身上）、无中生有（原文完全没提）、偷换逻辑（把原文的「可能」说成「一定」）。核对时逐个问自己：这一条在原文的哪一句？找不到依据就排除。',
      },
      {
        level: '次重点',
        text: '段落大意与文章结构',
        explain:
          '段落大意看该段的主题句，常在段首或段尾。全文结构常见三种：总分（先总说再分说）、对比（两方各说一段）、问题—解决（先摆问题，再给办法、给结论）。判断出结构，主旨题和段落大意题就不会串位。',
      },
      {
        level: '了解',
        text: '作者态度与写作目的',
        explain:
          '问 purpose 时注意动词：to introduce 是介绍现象，to warn 是提醒危险，to encourage 是鼓励行动，to compare 是对比。判断作者态度看评价性形容词、副词和结尾的呼吁句，不要把自己的看法当成作者的态度。',
      },
    ],
    passages: [
      {
        title: 'Should Phones Stay Outside the Classroom?',
        kind: '议论文',
        text: "Last term our school tried something new: students had to put their phones into a cloth bag at the start of every lesson. The bag hung on the wall by the door. After three months, the school asked 300 students what they thought.\nThe results were not simple. Two thirds of the students said they could concentrate better in class. Several teachers reported that more pupils raised their hands, and one maths teacher said his class finished a whole unit faster than before. But almost half of the students also said they felt worried about missing messages from their parents, especially when their parents worked late.\nThat worry is real, and schools should not ignore it. There is, however, a big difference between being reachable and being free to check a screen every two minutes. A phone lying face up on a desk is not just a phone; it is a small door that leads away from the lesson.\nThe cloth bag is not a punishment. It is a simple rule that gives everyone the same chance to think without being interrupted. If a student needs to contact home, the office phone is always there. Most lessons last forty minutes, and the world can surely wait that long.",
        cn: '上学期，我们学校试了一个新做法：每节课开始前，学生要把手机放进一个布袋里，布袋挂在门边的墙上。三个月后，学校问了三百名学生的想法。\n结果并不简单。三分之二的学生说自己在课上更能集中注意力；好几位老师反映举手的学生变多了，一位数学老师说他班里比以前快上完了一个单元。但几乎一半的学生也说，他们担心错过父母发来的信息，尤其是父母很晚才下班的时候。\n这种担心是真实的，学校不该忽视。不过，「能被联系到」和「可以每两分钟看一眼屏幕」是两回事。一部正面朝上放在桌上的手机不只是一部手机，它是一扇把注意力带离课堂的小门。\n布袋不是惩罚，而是一条简单的规则，让每个人都有同样的机会在不被打断的情况下思考。如果有学生需要联系家里，办公室的电话一直在。大多数课只有四十分钟，世界等得起。',
        questions: [
          {
            id: 'eng-reading-3-p1-q1',
            type: 'choice',
            stem: 'What is the passage mainly about?',
            options: [
              'Why students dislike their mobile phones.',
              'A school rule that keeps phones out of lessons, and why it may be worth keeping.',
              'How to use a phone to finish homework faster.',
              'Why parents in the city often work late.',
            ],
            answer: 'B',
            explanation:
              '首段介绍「上课把手机放进布袋」的规定与学生反馈，第二段给出调查结果，第三段回应学生的担心，末段说明这条规定的意义，全篇围绕这条规定及其价值展开，故选 B。A、D 项只是文中的小细节，属于以偏概全；C 项原文完全没有提到用手机做作业，属于无中生有。',
            difficulty: 2,
            tags: ['主旨大意', '最佳选项'],
          },
          {
            id: 'eng-reading-3-p1-q2',
            type: 'choice',
            stem: 'According to the survey, what did almost half of the students worry about?',
            options: [
              'Missing their favourite online games.',
              'Being late for their lessons.',
              'Losing their phones at school.',
              'Missing messages from their parents.',
            ],
            answer: 'D',
            explanation:
              '定位第二段最后一句：worried about missing messages from their parents，故选 D，属于原文的同义重现。A 项把 messages 偷换成 games；C 项手机是统一放进布袋，不是丢失；B 项原文没有提到迟到。细节题只要定位准确就不会被干扰。',
            difficulty: 1,
            tags: ['细节题', '定位'],
          },
          {
            id: 'eng-reading-3-p1-q3',
            type: 'choice',
            stem: 'What does the writer mean by saying that a phone on the desk is "a small door that leads away from the lesson"?',
            options: [
              'Phones are useful for looking up new words in class.',
              'The classroom door should always be kept closed.',
              'A phone on the desk easily takes students’ attention away from the lesson.',
              'Students should never bring phones into the school building.',
            ],
            answer: 'C',
            explanation:
              '比喻句要还原成它的本义：手机像一扇小门，学生一不留神就从课堂「走」出去了，即注意力被带走，故选 C。A 项与作者态度相反；B 项把比喻当字面意思理解；D 项说得太绝对，作者只反对「课上随手看手机」，还专门提到有事可以用办公室电话，可见不是完全禁止带手机。',
            difficulty: 2,
            tags: ['句意理解', '推理判断'],
          },
          {
            id: 'eng-reading-3-p1-q4',
            type: 'choice',
            stem: 'What is the writer’s attitude towards the cloth bag rule?',
            options: [
              'He supports it.',
              'He is strongly against it.',
              'He thinks it is useless.',
              'He does not care about it at all.',
            ],
            answer: 'A',
            explanation:
              '末段说这条规定「给每个人同样的机会不被打断地思考」，并指出办公室电话随时可用，明显是在支持这一做法，故选 A。作者虽然承认学生的担心是真实的，但随即用 there is a big difference 转折，说明他并不反对，因此 B、C 项与末段的评价相反，D 项与作者花整段篇幅论述的立场不符。',
            difficulty: 2,
            tags: ['作者态度', '推理判断'],
          },
        ],
      },
      {
        title: 'The Reading Corner Under the Banyan Tree',
        kind: '记叙文',
        text: "On Saturday mornings, Mr Huang pushes a cart of books to the corner of Renmin Road, where a huge banyan tree keeps the pavement cool. He unfolds a plastic sheet, lays out about eighty books and puts up a small wooden sign: Free to read. Take one home if you like, but please bring it back.\nMr Huang is seventy-one. He used to be a primary school teacher. Five years ago he noticed that many children in the neighbourhood spent their mornings playing games on their parents' phones while their parents were at work. Books are heavy, he says, but they are the lightest thing a child can carry for life.\nNot everyone believed the plan would work. Neighbours warned him that the books would disappear in a week. In fact, in five years only three books have never come back, and one of them came back with a letter inside: a girl wrote that she had read the book to her grandmother in hospital.\nMr Huang's cart now holds more than two hundred books, many of them given by the children themselves. On rainy days he does not come, and the corner looks strangely empty. \"I am not doing anything great,\" he says. \"I am just keeping a seat warm for whoever wants to sit down.\"",
        cn: '每到星期六早上，黄伯就推着一车书来到人民路的转角，那里有一棵大榕树，把路面遮得很凉快。他铺开一块塑料布，摆上大约八十本书，再立起一块小木牌：免费阅读。喜欢就带一本回家，但请还回来。\n黄伯七十一岁，以前是小学老师。五年前他发现，附近很多孩子趁父母上班，整个上午都在玩父母的手机。「书很重，」他说，「可它是孩子能带着走一辈子的最轻的东西。」\n并不是所有人都相信这个办法行得通。邻居提醒他，书一个星期就会不见。事实上，五年里只有三本书再没还回来，其中一本还夹着一封信一起回来：一个女孩写道，她在医院里把这本书读给了奶奶听。\n黄伯的车现在装了两百多本书，很多是孩子们自己送的。下雨天他不来，那个转角就显得格外空。「我没做什么了不起的事，」他说，「我只是给想坐下来的人留着一个位子。」',
        questions: [
          {
            id: 'eng-reading-3-p2-q1',
            type: 'choice',
            stem: 'What is Mr Huang’s rule for the books?',
            options: [
              'Readers must pay a small deposit first.',
              'Only children under ten can borrow books.',
              'Readers can take a book home but should return it.',
              'Books must be read under the tree and never taken away.',
            ],
            answer: 'C',
            explanation:
              '第一段末尾木牌上的字就是规则：Take one home if you like, but please bring it back，故选 C。A 项原文说 Free to read，不收费也不收押金；B 项原文没有年龄限制；D 项与「可以带回家」直接矛盾。读应用性文字（木牌、告示）要逐句核对条件。',
            difficulty: 1,
            tags: ['细节题', '信息定位'],
          },
          {
            id: 'eng-reading-3-p2-q2',
            type: 'choice',
            stem: 'What can we learn from Paragraph 3?',
            options: [
              'The neighbours were right about the plan.',
              'Almost all of the books were returned in the end.',
              'Mr Huang stopped lending books after a week.',
              'A girl lost one of the books in hospital.',
            ],
            answer: 'B',
            explanation:
              '第三段用 In fact 引出实情：五年里只有三本书没有还回来，可见绝大多数都还了，故选 B。A 项与 In fact 之后的内容相反（邻居预言一个星期丢光，结果并非如此）；C 项原文未提他停办；D 项是偷换——女孩是把书读给住院的奶奶听，那本书最后也回来了，并没有丢。',
            difficulty: 2,
            tags: ['段落理解', '推理判断'],
          },
          {
            id: 'eng-reading-3-p2-q3',
            type: 'choice',
            stem: 'What does Mr Huang mean by saying "I am just keeping a seat warm for whoever wants to sit down"?',
            options: [
              'He is saving a seat for his former students.',
              'He quietly offers a chance to read to anyone who wants it.',
              'He is waiting for the rain to stop before he goes home.',
              'He hopes all the children will sit with him all morning.',
            ],
            answer: 'B',
            explanation:
              '「给想坐下的人留个位子」是比喻：他提供的是一个随时可用的读书机会，谁愿意来都可以，故选 B。A 项把 whoever 误解成「他过去的学生」；C 项把比喻理解成字面意思；D 项把「提供机会」夸大成「要求孩子陪他坐一上午」，属于无中生有。',
            difficulty: 2,
            tags: ['句意理解', '隐喻'],
          },
          {
            id: 'eng-reading-3-p2-q4',
            type: 'choice',
            stem: 'What is the best title for the passage?',
            options: [
              'A Teacher’s Long Holiday',
              'Eighty Books and a Kind Heart',
              'Why Children Love Mobile Games',
              'How to Run a Bookshop in Guangzhou',
            ],
            answer: 'B',
            explanation:
              '全文写黄伯把八十本书摆在大榕树下免费借阅，以及围绕这些书发生的温暖故事，标题要覆盖「书」与「善意」两个要素，故选 B。A 项只说「假期」，与全篇内容无关；C 项把文中的手机游戏这一细节当主题，以偏概全；D 项错在 bookshop（书店卖书），而这并不是卖书的摊位。',
            difficulty: 2,
            tags: ['最佳标题', '主旨大意'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-3-q1',
        type: 'choice',
        stem: 'Read: "Many students in Guangzhou take the metro to school. Trains come every three minutes, and a monthly card costs less than a taxi ride. Still, some students prefer the bus because they can see the river on the way." The paragraph mainly tells us ___.',
        options: [
          'why the metro is popular and why some students still choose the bus',
          'how much a taxi ride costs in Guangzhou',
          'why the river in the city is polluted',
          'how to buy a monthly metro card',
        ],
        answer: 'A',
        explanation:
          '段落先说地铁方便、便宜（受欢迎的原因），再用 Still 转折说有些学生因为能看江景而选公交，两边的理由都讲到了，故选 A。B 项只是用来比较价格的一个细节；C 项原文没有提到污染；D 项原文没有说购卡方法。段落大意要覆盖整段，不能只抓一个细节。',
        difficulty: 2,
        tags: ['段落大意', '主旨'],
      },
      {
        id: 'eng-reading-3-q2',
        type: 'choice',
        stem: 'Read: "Ling closed her book and looked at the clock. It was already eleven. She had promised her mother to sleep before ten." What can we infer?',
        options: [
          'Ling had finished all her homework.',
          'Ling was reading late at night and would probably break her promise.',
          'Ling’s mother was angry with her.',
          'Ling did not enjoy reading at all.',
        ],
        answer: 'B',
        explanation:
          '三个细节共同推出结论：合上书说明刚在看书，十一点了说明很晚，答应妈妈十点前睡说明她多半做不到，故选 B。A 项原文只说她在看书，没提作业；C 项原文没有写妈妈的反应；D 项与她「看书看到十一点」相反。推理题要把几个细节连起来，而不是只看一句。',
        difficulty: 2,
        tags: ['推理判断', '细节串联'],
      },
      {
        id: 'eng-reading-3-q3',
        type: 'choice',
        stem: 'Read: "The old man waved at every child who passed the corner shop. He knew all their names and often gave them a free steamed bun before school." The best title for this passage would be ___.',
        options: [
          'A Corner Shop and Its Kind Owner',
          'How to Make Steamed Buns',
          'Children in the Neighbourhood',
          'A Busy Morning in Guangzhou',
        ],
        answer: 'A',
        explanation:
          '两个句子都在写「街角小店」和「认识每个孩子、还送包子的老人」，标题必须同时覆盖人与店，故选 A。B 项把「送包子」误当成「教做包子」；C 项只提孩子，漏掉了老人这个中心人物；D 项范围过大而且没有点出人物与善意。',
        difficulty: 2,
        tags: ['最佳标题', '主旨大意'],
      },
      {
        id: 'eng-reading-3-q4',
        type: 'fill',
        stem: 'Read: "Bamboo grows fast, needs little water, and can be used for floors, baskets and even bicycles." The main idea of this sentence is that bamboo is ___. (Answer with one English word or a short phrase.)',
        answer: 'useful|fast-growing and useful|very useful',
        explanation:
          '句子列举了竹子可以做地板、篮子、自行车，落点是「用途广」，所以主旨词是 useful；grows fast 与 needs little water 是它的特点，都是为说明「有用」服务的。做这类题要问自己：作者举这三个例子，最终想说的是哪一个总括性的词。',
        difficulty: 2,
        tags: ['段落大意', '概括'],
      },
      {
        id: 'eng-reading-3-q5',
        type: 'short',
        stem: '为什么推理判断题的答案不能是原文的照抄句？请以「文中的男孩看了看手表，跑得更快了」为例，写一句合理的推理，并说明你的依据。',
        answer:
          '因为推理题要求根据原文信息「再走一步」，答案必须是自己得出的结论，而不是原文已有的句子；原文照抄的选项往往是细节题的答案，或与题干所问无关。示例推理：这个男孩很可能快迟到了，所以他要加快速度赶去学校（或赶去某个约定的地方）。依据：句中只有两个动作信息——看手表（在确认时间，说明他对时间很在意）与跑得更快（时间不够才需要加速），两者合起来才能推出「时间紧、要赶路」这一结论。原文并没有直接写「他迟到了」，所以这是推理而不是照抄。',
        rubric: [
          '说明理由：推理题要在原文信息基础上再作一步推断，照抄原文的选项等于没有推理（或只答细节）。',
          '写出一句合理的推理，且是从「看手表」与「跑得更快」两个动作推出来的（如快迟到了、要赶时间、心里着急）。',
          '写明依据：至少点出「看手表表示在确认时间」和「跑得更快表示时间不够」这两条线索。',
          '推理要在原文信息范围内，不能凭空添加原文没有的情节（如「他要去参加考试」「他的手表坏了」而原文无据）。',
        ],
        explanation:
          '推理判断题的正确答案有两个特征：一是有原文依据（细节或评价可查），二是表达方式是新的（换成另一种说法或进一步概括）。只抄原文的选项不需要推理，凭空编造的选项没有依据，两者都不是答案。',
        difficulty: 2,
        tags: ['推理判断题', '应试策略'],
      },
    ],
    examTips: [
      '时间分配：主旨与推理类的题目放在最后做，通读全文后再答，每篇控制在 7 分钟内；若时间紧张，先答完细节题再回来处理主旨题。',
      '解题顺序：先看首段首句、末段末句和各段首句，画出全文中反复出现的名词（往往就是主旨词），再去看选项，能一次排除两三个。',
      '做推理题时，把每个选项在原文找依据：找到依据的保留，找不到的立刻排除。若某选项与原文一字不差，检查它是否答非所问。',
      '遇到绝对化词语（all、never、only、must、completely）要格外小心，中考阅读的正确项多用 may、often、some、usually 这类留有余地的表达。',
    ],
  },
  {
    id: 'eng-reading-4',
    grade: 'all',
    unit: '阅读选择',
    title: '阅读理解·应用文与多模态语篇（通知、广告、网页、表格）',
    enTitle: 'Reading: Practical Texts and Multimodal Texts',
    summary:
      '应用文不用逐字读：先看标题和板块判断语篇类型与目的，再按题干里的时间、地点、价钱、报名方式等关键词定位；图表要先看单位和图例，再比较数值大小与变化。',
    points: [
      {
        level: '重点',
        text: '先看标题与版面信息，判断语篇类型和目的',
        explain:
          '通知（notice）看时间、地点、对象、要求；广告（ad）看卖点、价格、优惠、联系方式；网页看栏目名与链接；表格看表头与单位。花十秒看清语篇类型，就知道该找什么信息，比从头读到尾快得多。',
      },
      {
        level: '重点',
        text: '按题干关键词定位四类硬信息',
        explain:
          '应用文题几乎都问这四类：时间（dates、opening hours、deadline）、地点（room number、station、exit）、钱（price、free、half price）、资格与方式（who can join、how to apply、call this number）。题干里出现哪个词，就回原文扫读哪个词，答案通常就在同一行。',
      },
      {
        level: '重点',
        text: '图表题先看单位与图例，再比大小与变化',
        explain:
          '看条形图先看纵轴单位（人、元、升、摄氏度），看表格先看表头，看饼图先看百分比的总和是否为 100。比较题要抓住 most/least、twice as many as、more than、drop by 等词，算清「谁比谁多多少」再选。',
      },
      {
        level: '重点',
        text: 'NOT true / TRUE 题逐个核对，不凭印象',
        explain:
          '这类题的做法是逐项回原文核对，把与原文一致的三个排除，剩下的就是答案。特别留意被改写过的数字（240 元写成 120 元）、被颠倒的时间（上午写成下午）、被调换的地点（二楼写成大厅）。',
      },
      {
        level: '次重点',
        text: '同义转换要认得',
        explain:
          'free of charge = free = costs nothing；sign up = register = apply；be included = come with the price；children aged 6 to 10 = children between six and ten。题干与原文用不同的词说同一件事，是应用文最常见的考法。',
      },
      {
        level: '了解',
        text: '注意网页与海报的非文字信息',
        explain:
          '二维码、电话、邮箱、链接地址、加粗的栏目名都属于「多模态」信息，往往是题目的答案出处。看到 For more information、How to apply、Note 这些小标题，先记住它们在哪个位置，答题时直接跳过去找。',
      },
    ],
    passages: [
      {
        title: 'Guangzhou Youth Science Camp 2026',
        kind: '应用文（通知）',
        text: "Are you interested in robots, drones or space? Come and spend four days with university students and engineers this summer.\nWho can join: students in Grade 7 to Grade 9 in Guangzhou.\nDates: 13—16 July (Monday to Thursday), 9:00 a.m.—4:30 p.m.\nPlace: Guangzhou Science Centre, No. 3 Liede Road (Metro Line 3, Zhujiang New Town Station, Exit B)\nPrice: 240 yuan for the whole camp, including lunch and all materials. Students from low-income families pay half if they send a short letter from their school.\nWhat you will do:\nDay 1: Build and race a small robot.\nDay 2: Fly a drone and learn the safety rules.\nDay 3: Visit a weather satellite station and study how a typhoon is tracked.\nDay 4: Work in groups of four and present your own project.\nHow to apply: Fill in the form at www.gzyouthsci.org before 30 June. Only 120 places are available. We will send you an email by 4 July to tell you whether you are in.\nNote: Bring a water bottle and wear sports shoes. Please do not bring your own drone — we provide everything.\nFor more information, call 020-8888-7654 (Tuesday to Friday, 2:00 p.m.—5:00 p.m.).",
        cn: '你对机器人、无人机或太空感兴趣吗？今年暑假，来和大学生、工程师一起度过四天吧。\n谁能参加：广州市七至九年级学生。\n时间：7 月 13—16 日（周一至周四），上午 9:00 至下午 4:30。\n地点：广州科学中心，猎德路 3 号（地铁三号线珠江新城站 B 出口）。\n费用：全程 240 元，含午餐和全部材料。低收入家庭的学生凭学校出具的简短证明可享半价。\n活动内容：\n第一天：搭建自己小组的小机器人并参加比赛。\n第二天：学飞无人机，了解安全规则。\n第三天：参观气象卫星站，研究台风是如何被追踪的。\n第四天：四人一组，展示自己的项目。\n报名方式：6 月 30 日前在 www.gzyouthsci.org 填写报名表。名额只有 120 个。我们会在 7 月 4 日前用邮件通知你是否入选。\n提示：请自带水杯，穿运动鞋。请不要自带无人机，全部器材由我们提供。\n想了解更多，请致电 020-8888-7654（周二至周五，下午 2:00—5:00）。',
        questions: [
          {
            id: 'eng-reading-4-p1-q1',
            type: 'choice',
            stem: 'Who can join the camp?',
            options: [
              'Any primary school pupil in Guangzhou.',
              'University students who study engineering.',
              'Students from Grade 7 to Grade 9 in Guangzhou.',
              'Students from any city in China.',
            ],
            answer: 'C',
            explanation:
              '定位 Who can join 这一行：students in Grade 7 to Grade 9 in Guangzhou，故选 C。A 项把年级降成小学；B 项把「与大学生一起活动」误解为「只有大学生能参加」；D 项把范围从广州扩大到全国。应用文题一定要看限制条件（年级、地域）。',
            difficulty: 1,
            tags: ['信息定位', '应用文'],
          },
          {
            id: 'eng-reading-4-p1-q2',
            type: 'choice',
            stem: 'How much will a student from a low-income family pay for the camp?',
            options: ['240 yuan', '120 yuan', '60 yuan', 'Nothing'],
            answer: 'B',
            explanation:
              '原文说全程 240 元，低收入家庭的学生 pay half（付一半），240 ÷ 2 = 120 元，故选 B。C 项是错误地按「四分之一」计算；D 项忽略了 half 的条件；A 项是没有优惠的全价。价格题要看清 half、free、including 这些限定词。',
            difficulty: 2,
            tags: ['数字计算', '细节'],
          },
          {
            id: 'eng-reading-4-p1-q3',
            type: 'choice',
            stem: 'What will students do on Day 3?',
            options: [
              'Build and race a small robot.',
              'Learn the safety rules for flying a drone.',
              'Study how a typhoon is tracked.',
              'Present their own project in groups.',
            ],
            answer: 'C',
            explanation:
              'Day 3 的内容是 Visit a weather satellite station and study how a typhoon is tracked，故选 C。A 项是 Day 1，B 项是 Day 2 的一部分，D 项是 Day 4。这类题要在原文中把「第几天」与「做什么」成对核对，防止错行。',
            difficulty: 1,
            tags: ['信息匹配', '细节'],
          },
          {
            id: 'eng-reading-4-p1-q4',
            type: 'choice',
            stem: 'Which of the following is NOT true according to the notice?',
            options: [
              'Lunch is included in the price.',
              'Students will be told the result by email.',
              'Only 120 places are available.',
              'Students should bring their own drone.',
            ],
            answer: 'D',
            explanation:
              '原文 Note 明确写着 Please do not bring your own drone — we provide everything，所以「学生应自带无人机」是错的，故选 D。A 项对应 including lunch and all materials；C 项对应 Only 120 places are available；B 项对应 We will send you an email。NOT true 题逐项核对，与原文一致的三项全部排除。',
            difficulty: 2,
            tags: ['正误判断', 'NOT true'],
          },
        ],
      },
      {
        title: 'Riverside Library — What’s On in August',
        kind: '网页（活动公告）',
        text: "Welcome to the Riverside Library, a five-minute walk from Haizhu Square Station. All events are free, but some need a ticket because the rooms are small.\nSatellite Stories (Saturday, 2 August, 10:00 a.m.)\nA retired engineer tells how the flood of 1994 changed the way our city watches the river. Room 201. Free tickets at the front desk from 26 July. Only 60 seats.\nCantonese Opera for Beginners (Sunday, 3 August, 3:00 p.m.)\nLearn to sing the first eight lines of a famous song with Ms He. No experience needed. Bring your own water. In the music room (no lift, on the second floor). Only 40 seats, so pick up a free ticket at the front desk from 26 July.\nRepair Café (Saturday, 16 August, 9:30 a.m.—12:00 p.m.)\nBring a broken lamp, fan or toy. Volunteers will show you how to fix it, and you take it home working again. In the hall on the ground floor. No ticket needed.\nKids' Reading Picnic (Sunday, 24 August, 4:00 p.m.)\nFor children aged 6 to 10 and their parents. Bring a mat and a book you love. Outside, by the river. Free, but call 020-8333-2211 to book a place before 20 August.\nThe library closes at 9:00 p.m. from Monday to Saturday. During August we also open on Sundays, from 9:00 a.m. to 5:00 p.m.",
        cn: '欢迎来到江畔图书馆，从海珠广场站步行五分钟即到。所有活动免费，但部分活动因场地较小需要领票。\n卫星故事（8 月 2 日星期六上午 10:00）\n一位退休工程师讲述 1994 年那场大水如何改变了这座城市观测河流的方式。地点：201 室。7 月 26 日起可到前台免费领票，只有 60 个座位。\n粤剧入门（8 月 3 日星期日下午 3:00）\n跟何老师学唱一首名曲的前八句，无需任何基础，请自带饮用水。地点：音乐室（无电梯，位于二楼）。只有 40 个座位，请于 7 月 26 日起到前台免费领票。\n修理咖啡馆（8 月 16 日星期六上午 9:30—12:00）\n带上一盏坏台灯、一台坏风扇或一个坏玩具，志愿者会教你怎么修，修好后带回家继续用。地点：一楼大厅，无需领票。\n少儿阅读野餐（8 月 24 日星期日下午 4:00）\n面向 6 至 10 岁儿童及家长，请自带垫子和一本你喜欢的书。地点：户外江边。免费，但需在 8 月 20 日前致电 020-8333-2211 预约。\n本馆周一至周六晚 9:00 闭馆。八月期间周日也开放，时间为上午 9:00 至下午 5:00。',
        questions: [
          {
            id: 'eng-reading-4-p2-q1',
            type: 'choice',
            stem: 'Which event needs no ticket at all?',
            options: [
              'Satellite Stories.',
              'Cantonese Opera for Beginners.',
              'Repair Café.',
              'Kids’ Reading Picnic.',
            ],
            answer: 'C',
            explanation:
              '四个活动中，只有 Repair Café 明确写着 No ticket needed，故选 C。Satellite Stories 要在 7 月 26 日起到前台领票；Cantonese Opera for Beginners 只有 40 个座位，同样要提前领票；Kids’ Reading Picnic 需在 8 月 20 日前电话预约。这类题要找到原文里「需要票」或「不需要票」的明确表述，不能凭活动大小猜测。',
            difficulty: 3,
            tags: ['信息筛选', '细节'],
          },
          {
            id: 'eng-reading-4-p2-q2',
            type: 'choice',
            stem: 'What should you bring to the Kids’ Reading Picnic?',
            options: [
              'A mat and a book you love.',
              'A broken lamp or fan.',
              'A water bottle and sports shoes.',
              'Your own drone.',
            ],
            answer: 'A',
            explanation:
              '定位 Kids’ Reading Picnic 一段：Bring a mat and a book you love，故选 A。B 项是 Repair Café 的要求；C 项把粤剧入门的 Bring your own water 与科学营的 wear sports shoes 拼在一起，属于张冠李戴；D 项同样来自科学营通知。多个语篇混排时，务必看清信息属于哪一条活动。',
            difficulty: 1,
            tags: ['信息定位', '语篇区分'],
          },
          {
            id: 'eng-reading-4-p2-q3',
            type: 'choice',
            stem: 'Where is Cantonese Opera for Beginners held?',
            options: [
              'In Room 201.',
              'In the music room on the second floor.',
              'In the hall on the ground floor.',
              'Outside, by the river.',
            ],
            answer: 'B',
            explanation:
              '该活动写明 In the music room (no lift, on the second floor)，故选 B。A 项是 Satellite Stories 的地点；C 项是 Repair Café 的地点；D 项是 Kids’ Reading Picnic 的地点。地点题要用「活动名 + 地点」配对核对，不能凭印象。',
            difficulty: 1,
            tags: ['信息定位', '地点细节'],
          },
          {
            id: 'eng-reading-4-p2-q4',
            type: 'choice',
            stem: 'Which of the following is TRUE?',
            options: [
              'All the events are held in the same room.',
              'The library is open on Sundays in August.',
              'Satellite Stories is held in the evening.',
              'You have to pay for the Repair Café.',
            ],
            answer: 'B',
            explanation:
              '末段说八月期间周日也开放（9:00 a.m. 至 5:00 p.m.），故选 B。A 项与四个活动分处 201 室、音乐室、一楼大厅、江边矛盾；C 项时间写的是上午 10:00，不是傍晚；D 项 Repair Café 属于全篇开头所说 All events are free 的范围，无需付费。TRUE 题同样要逐项核对。',
            difficulty: 2,
            tags: ['正误判断', '综合细节'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-4-q1',
        type: 'choice',
        stem: 'The table below shows how the students in Class 3 go to school.\nOn foot: 12 students\nBy metro: 18 students\nBy bus: 6 students\nBy car: 9 students\nWhich way of going to school is the most popular?',
        options: ['On foot', 'By metro', 'By bus', 'By car'],
        answer: 'B',
        explanation:
          '比较四个数字：18 > 12 > 9 > 6，乘地铁的 18 人最多，故选 B。做表格题先把数字从大到小排一遍，再看题干问的是 most 还是 least，避免看错方向。',
        difficulty: 1,
        tags: ['图表读取', '比较'],
      },
      {
        id: 'eng-reading-4-q2',
        type: 'choice',
        stem: 'According to the same table, how many students are there in Class 3 in all?',
        options: ['40', '45', '50', '18'],
        answer: 'B',
        explanation:
          '把四种方式的人数相加：12 + 18 + 6 + 9 = 45 人，故选 B。A 项漏算了 5 人（多算或少算一项），C 项是凭大概取整，D 项把最大的单项当成总数。表格题出现 in all、altogether 时一定要做加法。',
        difficulty: 2,
        tags: ['图表读取', '计算'],
      },
      {
        id: 'eng-reading-4-q3',
        type: 'choice',
        stem: 'A poster says: "Book Fair, 12—14 May, 9 a.m.—5 p.m., Hall 2. Free entry for students with a school ID card." Which student can enter for free?',
        options: [
          'A student who left his school ID card at home.',
          'A student who brings his school ID card with him.',
          'A student who comes with a parent.',
          'Anyone who arrives after 5 p.m.',
        ],
        answer: 'B',
        explanation:
          '海报的条件是 with a school ID card，即「带学生证的学生」免费，故选 B。A 项没有学生证，不符合免费条件；C 项原文没有提到家长可以带学生免费入场；D 项 5 p.m. 之后书展已结束。应用文的条件句（with、for、except）要逐个核对。',
        difficulty: 1,
        tags: ['条件核对', '应用文'],
      },
      {
        id: 'eng-reading-4-q4',
        type: 'fill',
        stem: 'A notice says: "The swimming pool will be closed on Monday morning for cleaning. It reopens at 2 p.m." At 10 a.m. on Monday, the pool is ___. (Answer with one English word.)',
        answer: 'closed',
        explanation:
          '通知说周一上午因清洁关闭、下午两点重新开放，10 a.m. 在关闭时间段内，所以填 closed。做时间推算题先在草稿上写出「关闭时段」与「开放时段」两个区间，再把题干的时间放进去对照。',
        difficulty: 1,
        tags: ['信息换算', '时间细节'],
      },
      {
        id: 'eng-reading-4-q5',
        type: 'short',
        stem: '读一张活动海报时，要找出「我能不能参加」「要花多少钱」「怎么报名」三类信息，你会按什么顺序找？请写明查找顺序和理由。',
        answer:
          '建议顺序：第一步先看海报的标题和活动时间，确认这是什么活动、什么时候举行；第二步找资格条件，即 who can join / for students aged … / Grade 7 to Grade 9 这一类说明，先判断自己能不能参加，不能参加就不必再往下算钱；第三步看费用，重点找 price、free、half price、including 这些词，注意优惠需要的条件；第四步看报名方式，找 How to apply、sign up、call …、visit …、before（截止日期）等关键词，并特别注意截止时间与名额限制。理由：先判断资格可以避免做无用功，费用与报名方式都会写在同一板块（通常在海报底部），按标题—资格—费用—报名的顺序找，路径最短、最不容易漏掉截止日期。',
        rubric: [
          '给出明确的查找顺序，并说明依据（如先判断资格可省去无用计算、费用与报名信息通常集中在海报同一板块）。',
          '指出资格类的关键词：who can join、aged …、Grade …、for students only 等。',
          '指出费用类的关键词与陷阱：price、free、half price、including，并提醒注意优惠条件。',
          '指出报名类的关键词与陷阱：How to apply、before（截止日期）、places are limited、电话或网址。',
        ],
        explanation:
          '应用文阅读的效率来自「按需检索」：先判断自己是否符合条件，再算钱、看报名方式，最后核对截止日期。这样既避免通读浪费时间，也不会漏掉名额或优惠这类关键限定。',
        difficulty: 2,
        tags: ['应用文阅读', '应试策略'],
      },
    ],
    examTips: [
      '时间分配：一篇应用文控制在 4—5 分钟。先花 20 秒扫一遍版面（标题、小标题、加粗词、数字），再带着题干关键词直接定位，不需要通读全文。',
      '解题顺序：先做信息定位题（时间、地点、价格、报名方式），再做 NOT true / TRUE 这类需要逐项核对的题，最后处理需要计算或比较的题。',
      '凡是遇到数字，先在原文的数字旁做记号：240 yuan、half、120 places、before 30 June，计算题几乎都是在这里设陷阱。',
      '多个活动或广告排在一起时，把每个活动的名称、时间、地点在草稿纸上列成三列，配对核对，可以避免把 A 活动的信息套到 B 活动上。',
    ],
  },
  {
    id: 'eng-reading-5',
    grade: 'all',
    unit: '阅读填空',
    title: '阅读填空与选词填空：把句子接回原文',
    enTitle: 'Reading: Gap-filling and Word-box Filling',
    summary:
      '阅读填空不是猜谜，而是靠指代、逻辑和复现把空格前后接起来；选词填空还要先判断词性，再改对词形（时态、比较级、副词、物主代词）。',
    points: [
      {
        level: '重点',
        text: '先读首段与各段首句，理清文章结构与顺序',
        explain:
          '七选五的空格分布在段落中间或末尾，只有先弄清「这篇文章按什么顺序写」（时间顺序、步骤顺序、问题—办法—结论），才知道某个位置该出现哪一类内容：是原因、转折、例子还是总结。',
      },
      {
        level: '重点',
        text: '用代词与指代线索锁定选项',
        explain:
          '空格后的句子若出现 this、it、they、such a plan、these two ways，那么空格里必须提到对应的内容（单复数还要一致）。例如后文说 These two ways，空格里就必须先列出「两种」做法；后文说 the boy，空格里就必须先出现 a boy。',
      },
      {
        level: '重点',
        text: '逻辑关系决定句子方向',
        explain:
          '空格前的句子与选项之间常靠连词或副词连接：However/But 表相反，For example/For instance 后面接例子，Therefore/As a result 接结果，Besides/What is more 表递进。先把空格前后的逻辑关系标出来，再去找方向一致的选项。',
      },
      {
        level: '重点',
        text: '选词填空先判断词性，再改词形',
        explain:
          '拿到选词填空，先看空格在句中做什么成分：缺谓语就填动词（注意时态与主谓一致），缺定语或表语就填形容词（注意有没有 than，有则用比较级），修饰动词用副词（加 -ly），名词前用物主代词或形容词。这一步能先排除一半的选项，再核对意思。',
      },
      {
        level: '次重点',
        text: '关键词复现：前后同词、同义、反义',
        explain:
          '空格前后的名词、动词常与选项形成复现关系。原文出现 harvest、grow again，选项里就可能有 environment 或 useful；出现 strong wind、breaks easily，空格里就是表示「小心设计」的词。找出复现词，答案往往就在手边。',
      },
      {
        level: '了解',
        text: '先易后难，最后把两个候选都代入复读',
        explain:
          '四个空格里总有最简单的，先做有把握的（有代词线索、有固定搭配的），剩下的用排除法。当只剩两个选项而拿不定时，把两句都放进去，从头读到尾，看哪一句与前后文衔接自然、语法无误。',
      },
    ],
    passages: [
      {
        title: 'Why Bamboo Is Special',
        kind: '说明文（选词填空）',
        text: "Word box: advice, careful, develop, since, strong, suddenly, they\nBamboo is one of the fastest-growing plants in the world. Some kinds can grow almost a metre a day, so it is not surprising that people in southern China have used it for hundreds of years.\n___1___ it is easy to find in the south, farmers there have turned it into baskets, chairs and even water pipes. Today engineers have ___2___ a new use for it: bamboo can be pressed into boards and used to build houses. These boards are ___3___ than concrete and much lighter, so they are easy to carry to mountain villages.\nBamboo is also good for the environment. When it is cut, it grows again from the same root, and it needs very little water. A bamboo forest can be harvested every year without being destroyed, and no chemicals are needed.\nOf course, bamboo has its own problems. It breaks easily in strong wind, so builders must design houses ___4___. Scientists are still testing how long bamboo buildings can last. In some mountain villages, families have already rebuilt ___5___ houses with bamboo boards, and they say the rooms are cooler in summer.",
        cn: '词库：advice, careful, develop, since, strong, suddenly, they\n竹子是世界上长得最快的植物之一，有的品种一天能长将近一米，所以中国南方人用它用了几百年，一点也不奇怪。\n由于南方容易找到竹子，那里的农民把它做成了篮子、椅子甚至水管。如今工程师又为它开发了一项新用途：竹子可以压成板材用来盖房子。这些板材比混凝土更结实，而且轻得多，所以很容易运到山村。\n竹子对环境也很友好。砍下来以后，它会从同一个根上重新长出来，而且几乎不需要浇水。竹林每年都可以采伐而不会被毁掉，也不需要化肥农药。\n当然，竹子也有它自己的问题。它在大风里容易折断，所以建造者设计房屋时必须非常小心。科学家还在测试竹屋能使用多久。在一些山村，一些家庭已经用竹板重建了自己的房子，他们说这种房子夏天更凉快。',
        questions: [
          {
            id: 'eng-reading-5-p1-q1',
            type: 'fill',
            stem: 'Complete Blank 1 with the correct form of a word from the box: "___ it is easy to find in the south, farmers there have turned it into baskets, chairs and even water pipes."',
            answer: 'Since|since',
            explanation:
              '空格所在句是「主句 + 原因」的结构：后面说农民把它做成篮子椅子，前面给的是原因（南方容易找到竹子），因此填表示原因的连词 Since（位于句首，首字母大写）。词库里的 since 与 because、as 同义，但只有它出现在词库中。注意空格后是完整句子，不能填介词。',
            difficulty: 2,
            tags: ['选词填空', '原因状语从句'],
          },
          {
            id: 'eng-reading-5-p1-q2',
            type: 'fill',
            stem: 'Complete Blank 2 with the correct form of a word from the box: "Today engineers have ___ a new use for it."',
            answer: 'developed',
            explanation:
              'have 后面是现在完成时，要用过去分词。词库里的候选词是 develop（开发、研制），变成过去分词 developed。句意是「如今工程师为它开发了一项新用途」，与下文「压成板材盖房子」正好衔接。选词时先看 have 确定形式，再看意思。',
            difficulty: 2,
            tags: ['选词填空', '现在完成时'],
          },
          {
            id: 'eng-reading-5-p1-q3',
            type: 'fill',
            stem: 'Complete Blank 3 with the correct form of a word from the box: "These boards are ___ than concrete and much lighter."',
            answer: 'stronger',
            explanation:
              '句中有 than，说明要用比较级，因此把形容词 strong 变成 stronger（比混凝土更结实）。若填原级 strong，则与 than 冲突；若填名词 advice、副词 suddenly 或代词 they，句子在语法上就不成立。先看有没有 than，是选词填空里最快的判断方式。',
            difficulty: 2,
            tags: ['选词填空', '比较级'],
          },
          {
            id: 'eng-reading-5-p1-q4',
            type: 'fill',
            stem: 'Complete Blank 4 with the correct form of a word from the box: "It breaks easily in strong wind, so builders must design houses ___."',
            answer: 'carefully',
            explanation:
              '空格修饰动词 design，要用副词，把形容词 careful 变成 carefully（仔细地、小心地）。这一句与前一句构成因果：因为竹子容易被大风吹断，所以设计时必须小心。判断词性再变形式，是选词填空拿满分的关键。',
            difficulty: 2,
            tags: ['选词填空', '副词'],
          },
          {
            id: 'eng-reading-5-p1-q5',
            type: 'fill',
            stem: 'Complete Blank 5 with the correct form of a word from the box: "In some mountain villages, families have already rebuilt ___ houses with bamboo boards."',
            answer: 'their',
            explanation:
              '空格后面是名词 houses，需要一个物主代词，把词库中的 they 变成 their（他们的）。句意是「一些家庭用竹板重建了自己的房子」。注意 they 是主格，不能直接修饰名词；同样，would、their、there 三个词形不能混用。',
            difficulty: 2,
            tags: ['选词填空', '物主代词'],
          },
        ],
      },
      {
        title: 'Clean-Up Day on the River',
        kind: '记叙文（七选五）',
        text: "Last month our class took part in a clean-up day on the bank of the Pearl River. We met at eight in the morning, and our teacher gave each of us a pair of gloves and a large bag. ___1___\nAt first I thought the work would be boring. In fact, there was a kind of competition among us: whoever filled a bag first could choose the music for the bus ride home. ___2___ We found bottle caps, plastic bags, an old shoe, and even a bicycle wheel.\nThe strangest thing was how much rubbish had come from everyday life. ___3___ Most of it had been dropped by people who probably did not think a single sweet wrapper mattered.\nBy eleven o'clock our bags were heavy and our backs ached. ___4___ Looking at the clean bank, we felt that a morning had been well spent. Our teacher took a photo, and we promised to come back in the autumn.\nSince that day I have carried a small bag in my pocket. It weighs almost nothing, but it has already stopped me from dropping a few things on the ground.",
        cn: '上个月，我们班参加了珠江岸边的一次净滩活动。我们早上八点集合，老师给我们每人发了一副手套和一个大袋子。老师要求我们把一切不属于这条江的东西都捡起来。\n起初我以为这活儿很无聊。其实我们之间还形成了一种比赛：谁先装满一袋，就能决定回程校车上放什么音乐。很快，大家都在江边忙着搜寻。我们捡到了瓶盖、塑料袋、一只旧鞋，甚至还有一个自行车轮子。\n最让人意外的是，有多少垃圾其实来自日常生活。其中大部分都是零食和饮料的包装。它们大多是那些根本没想过「一张糖纸算得了什么」的人随手丢下的。\n到十一点，我们的袋子沉甸甸的，背也酸了。但在捡完最后一片垃圾之前，没有人想停手。望着干净的江岸，我们觉得这个上午过得很值。老师拍了张照片，我们约定秋天再来。\n从那天起，我口袋里一直装着一个小编织袋，它几乎没有重量，却已经阻止了我好几次把东西丢在地上。',
        questions: [
          {
            id: 'eng-reading-5-p2-q1',
            type: 'choice',
            stem: 'Which sentence fits Blank 1 best?',
            options: [
              'We were told to pick up everything that did not belong to the river.',
              'We were each given a ticket for a boat trip on the river.',
              'The weather was colder than we had expected that morning.',
              'Our teacher asked us to write a report about the river.',
            ],
            answer: 'A',
            explanation:
              '空格前一句是「老师给我们每人发了一副手套和一个大袋子」，空格要接着说明这些工具用来做什么，所以是「把不属于江里的东西都捡起来」，故选 A。B、C、D 都是语法正确的句子，但与「发手套和袋子」这一动作没有承接关系，也与下一段「起初我以为这活儿很无聊」中的 the work 对不上。',
            difficulty: 2,
            tags: ['七选五', '承上启下'],
          },
          {
            id: 'eng-reading-5-p2-q2',
            type: 'choice',
            stem: 'Which sentence fits Blank 2 best?',
            options: [
              'Soon everyone was busy searching along the water.',
              'Nobody wanted to take part in the competition.',
              'We sat down and waited for the bus to arrive.',
              'The river was too dirty for us to clean.',
            ],
            answer: 'A',
            explanation:
              '空格后一句列举捡到的瓶盖、塑料袋、旧鞋、自行车轮，说明大家都在江边忙着找垃圾，故选 A。B 项与「装满一袋就能选音乐」的比赛规则矛盾；C 项与随后「捡到各种垃圾」的动作冲突；D 项与全文「一个上午就清理干净」的结果相反。',
            difficulty: 2,
            tags: ['七选五', '上下文一致'],
          },
          {
            id: 'eng-reading-5-p2-q3',
            type: 'choice',
            stem: 'Which sentence fits Blank 3 best?',
            options: [
              'Most of it was packaging from snacks and drinks.',
              'Most of it had been thrown away by visitors from other cities.',
              'The water was so clean that we could see fish swimming.',
              'The city has just built a new bridge over the river.',
            ],
            answer: 'A',
            explanation:
              '空格前说「最让人意外的是，有多少垃圾来自日常生活」，紧接着要具体说明是什么垃圾，后一句又提到 a single sweet wrapper（一张糖纸），所以填「大部分是零食和饮料的包装」最顺，故选 A。B 项把来源说成外地游客，与 everyday life 和糖纸的细节矛盾；C、D 项与「垃圾很多」的语境不符或完全无关。',
            difficulty: 3,
            tags: ['七选五', '复现线索'],
          },
          {
            id: 'eng-reading-5-p2-q4',
            type: 'choice',
            stem: 'Which sentence fits Blank 4 best?',
            options: [
              'But nobody wanted to stop before the last piece was picked up.',
              'So we went home at once and never came back.',
              'Our teacher told us that the river was not important.',
              'We decided to leave the rest of the rubbish for the next group.',
            ],
            answer: 'A',
            explanation:
              '空格前写「袋子沉、背也酸了」，后一句是「望着干净的江岸，觉得这个上午过得很值」，中间需要一个转折：虽然累，但没人肯停手，故选 A。B 项与「约定秋天再来」矛盾；C、D 项与最后「觉得过得很值」的评价相反，属于感情色彩不符。',
            difficulty: 2,
            tags: ['七选五', '转折逻辑'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-5-q1',
        type: 'choice',
        stem: 'Choose the best word: "Bamboo is cheap and strong. ___ is also easy to grow in the south of China."',
        options: ['Their', 'They', 'Them', 'It'],
        answer: 'D',
        explanation:
          'Bamboo 在这里是不可数名词，指一种植物，用 it 指代，作主语用主格。They 是复数，与 is 不一致；Them 是宾格，不能作主语；Their 是物主代词，后面必须接名词。代词题先看数，再看格。',
        difficulty: 1,
        tags: ['代词', '主语一致'],
      },
      {
        id: 'eng-reading-5-q2',
        type: 'choice',
        stem: 'Choose the best word: "Bamboo grows very fast. ___, it is not as strong as steel."',
        options: ['For example', 'Therefore', 'Besides', 'However'],
        answer: 'D',
        explanation:
          '「长得快」与「不如钢结实」是相反的两面，用 However 表转折。Therefore 表结果（长得快不会导致不结实）；Besides 表递进，后面应接同类的好处；For example 后面要举例，而本句说的是它的缺点。',
        difficulty: 1,
        tags: ['逻辑连接', '转折'],
      },
      {
        id: 'eng-reading-5-q3',
        type: 'choice',
        stem: 'Choose the correct form of the word in brackets: "The workers finished the job ___ (careful) and checked every board twice."',
        options: ['careful', 'carefulness', 'carefully', 'care'],
        answer: 'C',
        explanation:
          '空格修饰动词 finished，要用副词 carefully（仔细地）。careful 是形容词，只能作定语或表语；carefulness 是名词；care 是动词或名词。判断词性时先问：这个空在修饰谁？修饰动词就用副词。',
        difficulty: 1,
        tags: ['词性转换', '副词'],
      },
      {
        id: 'eng-reading-5-q4',
        type: 'fill',
        stem: 'Fill in the blank with the correct form of the word in brackets: "The small plant has ___ (develop) into a big business since 2020."',
        answer: 'developed',
        explanation:
          'has 后面要用过去分词，develop 的过去分词是 developed（规则变化加 -ed）。句中 since 2020 提示现在完成时，与 have/has + 过去分词 的结构一致。做这类题先找助动词，再根据时态写形式。',
        difficulty: 2,
        tags: ['现在完成时', '动词形式'],
      },
      {
        id: 'eng-reading-5-q5',
        type: 'choice',
        stem: 'Which sentence fits best? "Mr Liang trains the team every Saturday morning. ___ So he never misses a practice, even in the rain."',
        options: [
          'He has kept this habit for eleven years.',
          'His students all come from Foshan.',
          'The lion head weighs about four kilos.',
          'He does not enjoy working in the rain.',
        ],
        answer: 'A',
        explanation:
          '空格后一句用 So 引出结果「他连下雨天都不缺训练」，空格必须给出能推出这一结果的原因或事实，即「这个习惯他坚持了十一年」，故选 A。B、C 项与「不缺训练」没有因果关系；D 项与 even in the rain 直接矛盾。',
        difficulty: 2,
        tags: ['句子还原', '因果衔接'],
      },
      {
        id: 'eng-reading-5-q6',
        type: 'short',
        stem: '做七选五（句子还原）时，你会先看文章还是先看选项？请写出你的做法，并说明两条能帮你排除错误选项的线索。',
        answer:
          '做法：先快速通读文章（约 40 秒），弄清话题和段落顺序，再看选项，最后逐空回填。理由是这样能避免「单看一句话觉得都对」的情况。两条排除线索：第一，指代与单复数线索——空格后的句子若出现 this、they、these two ways、the boy，空格里必须已经提到对应的内容，单复数、冠词（a/the）也要对得上，对不上的选项直接排除。第二，逻辑与连接词线索——空格前是「累」，后是「觉得值得」，中间就要填表转折的句子；空格前是「问题」，后是「解决办法」，就要填引出办法的句子。此外还可以用关键词复现（同词、同义、反义）和「先易后难」的排除法，最后把两个候选句子分别代入朗读一遍再定。',
        rubric: [
          '给出明确做法：先通读文章把握结构与话题，再看选项逐空回填（或先看选项划关键词再定位，说明理由即可）。',
          '线索一：指代与单复数一致（this/they/such a plan 等必须与空格内容对应）。',
          '线索二：逻辑关系与连接词（转折、因果、举例、递进），并说明如何据此判断句子方向。',
          '提到关键词复现或「两个候选都代入朗读」的核对办法。',
        ],
        explanation:
          '七选五考的是「衔接」，而不是单句理解：一篇短文的话题、段落顺序、指代关系、逻辑关系都是固定的，把空格放进这些约束里去筛，四个选项自然只剩一个。',
        difficulty: 2,
        tags: ['七选五方法', '应试策略'],
      },
    ],
    examTips: [
      '时间分配：选词填空或七选五控制在 6—7 分钟。先花 1 分钟通读全文并标出逻辑词，再用 3 分钟逐空作答，最后 2 分钟把答案代入全文通读一遍。',
      '解题顺序：先做有代词线索、固定搭配或明确语法形式的空（最容易），把拿不准的空留到最后，用排除法补上。',
      '选词填空必做三件事：先判断词性（名词、动词、形容词、副词、代词），再看是否需要变形（时态、比较级、单复数、-ly），最后核对词义是否与上下文一致。',
      '填完后一定要把词（或句子）放回原文通读：读不通、指代不一致、逻辑别扭的，多半是错的，立刻回改。',
    ],
  },
  {
    id: 'eng-reading-6',
    grade: 'all',
    unit: '项目情境',
    title: '项目情境读写（一）：图表信息与表达',
    enTitle: 'Project-based Reading and Writing: Charts and Data',
    summary:
      '项目情境把「读图表」和「写句子」放在同一个任务里：第一节用图表数据做 5 道选择题，第二节用完整句子写出数据、比较和看法，得分点是数据准确加句式正确。',
    points: [
      {
        level: '重点',
        text: '读图三步：标题与单位 → 表头与图例 → 最大最小与趋势',
        explain:
          '第一步看图表标题和单位（人、元、升、摄氏度、百分比），第二步看表头或图例弄清每一列、每一块代表什么，第三步找出最大项、最小项和变化趋势。项目情境的选择题几乎都出在这三处。',
      },
      {
        level: '重点',
        text: '数据表达的固定句式要会写',
        explain:
          'The number of students who … rose from … to …；… is twice as many as …；A uses 60 litres more per person than B；The figure dropped by nearly a third（下降了近三分之一）；about / nearly / more than 用来修饰数字。简答题中只写数字不给分，要写成完整句子。',
      },
      {
        level: '重点',
        text: '选择题先定位「哪一组、哪一年、哪种方式」',
        explain:
          '图表题的题干一定会限定范围（in Grade 9、in 2024、the Zhou family），先把这个范围在图表里圈出来，再看该行或该列的数据，不要拿整体平均去回答个别组的问题。',
      },
      {
        level: '重点',
        text: '简答题踩分点：数据 + 比较或结论 + 自己的看法',
        explain:
          '广州中考项目情境第二节是简答题，答案要有三块：先答数据（准确、带单位），再说出比较或结论（比谁多、说明什么），最后按题目要求补一句自己的看法或建议。只写「160 litres」这样的片段通常拿不到满分。',
      },
      {
        level: '次重点',
        text: '数字与倍数的英文读法',
        explain:
          'twice as many as（是……的两倍）、half of the students（一半）、one in three（三分之一）、60 percent more than（比……多 60%）、an average of four hours（平均四小时）。倍数与百分比必须与被比较的对象对应清楚。',
      },
      {
        level: '了解',
        text: '不同图表类型各有读法',
        explain:
          '表格看行列交叉处的数字；条形图比长度，最直观地看出最大最小；折线图看上升与下降的趋势；饼图看各部分占整体的比例（各块相加应为 100%）。看清图型就知道该找「数值」「趋势」还是「比例」。',
      },
    ],
    passages: [
      {
        title: 'Where Does Our Free Time Go?',
        kind: '图表（调查表 + 调查报告）',
        text: "Our class project this term is called Where Does Our Free Time Go? We asked 200 students in Grade 9 at our school how they spent their free time last week. The table below shows the answers.\n\nActivity | Number of students | Hours a week (average)\nWatching short videos | 74 | 7.5\nPlaying ball games | 46 | 4\nReading for pleasure | 30 | 3.5\nHelping with housework | 28 | 2\nOther activities | 22 | 4\n\nThe results surprised us. Watching short videos was the most popular activity, and those students spent nearly twice as many hours on it as the ball-game players. Only thirty students read for pleasure, although our school library has more than ten thousand books.\nWe also noticed a difference between boys and girls: boys chose ball games more often (35 of the 46), while girls chose reading more often (21 of the 30).\nOur group has made three suggestions for next term: a twenty-minute quiet reading time after lunch, one short-video-free day every month, and longer opening hours for the school playground at weekends.",
        cn: '我们这学期的班级项目叫「我们的空闲时间都去哪儿了」。我们问了本校九年级 200 名学生上周怎样度过空闲时间，结果如下表。\n\n活动 | 人数 | 每周平均小时数\n看短视频 | 74 | 7.5\n打球 | 46 | 4\n课外阅读 | 30 | 3.5\n做家务 | 28 | 2\n其他活动 | 22 | 4\n\n结果让我们很意外。看短视频是最受欢迎的活动，这些学生花在这上面的时间几乎是打球同学的两倍。虽然学校图书馆有一万多册书，只有三十名学生课外阅读。\n我们还注意到男生和女生的差别：男生更多选择打球（46 人中有 35 人），女生更多选择阅读（30 人中有 21 人）。\n我们小组对下学期提出了三条建议：午饭后安排二十分钟的安静阅读时间，每月设一天「无短视频日」，以及周末延长学校操场的开放时间。',
        questions: [
          {
            id: 'eng-reading-6-p1-q1',
            type: 'choice',
            stem: 'What was the most popular free-time activity in the survey?',
            options: [
              'Watching short videos.',
              'Playing ball games.',
              'Reading for pleasure.',
              'Helping with housework.',
            ],
            answer: 'A',
            explanation:
              '表格中「看短视频」74 人，是五项里人数最多的，原文也直接写出 Watching short videos was the most popular activity，故选 A。做图表题先把人数从大到小排一遍，74 > 46 > 30 > 28 > 22，答案一目了然。',
            difficulty: 1,
            tags: ['图表读取', '最值'],
          },
          {
            id: 'eng-reading-6-p1-q2',
            type: 'choice',
            stem: 'How many hours a week did the ball-game players spend on their activity on average?',
            options: ['7.5 hours', '4 hours', '3.5 hours', '2 hours'],
            answer: 'B',
            explanation:
              '在表格中定位 Playing ball games 这一行，第三列是 4 小时，故选 B。A 项 7.5 小时是看短视频学生的时间，C 项 3.5 小时是阅读学生的时间，D 项 2 小时是做家务学生的时间。表格题要「行与列交叉」地看，不要串行。',
            difficulty: 1,
            tags: ['图表读取', '定位'],
          },
          {
            id: 'eng-reading-6-p1-q3',
            type: 'choice',
            stem: 'What do we know about the students who chose reading?',
            options: [
              'There were 46 of them in all.',
              'They spent 7.5 hours a week reading on average.',
              'Most of them were girls.',
              'None of them had ever used the school library.',
            ],
            answer: 'C',
            explanation:
              '原文写 girls chose reading more often (21 of the 30)，30 人中有 21 人是女生，超过一半，所以 C 正确。A 项 46 人是打球的学生；B 项 7.5 小时是看短视频学生的时间；D 项原文只说图书馆有上万册书，并没有说阅读的学生没去过图书馆，属于无中生有。',
            difficulty: 2,
            tags: ['图表+文字', '推理'],
          },
          {
            id: 'eng-reading-6-p1-q4',
            type: 'choice',
            stem: 'Which of the following is NOT one of the group’s suggestions?',
            options: [
              'A quiet reading time after lunch.',
              'One day without short videos every month.',
              'Longer opening hours for the playground at weekends.',
              'Building a new library with more books.',
            ],
            answer: 'D',
            explanation:
              '原文最后一段列出三条建议：午饭后二十分钟安静阅读、每月一天无短视频日、周末延长操场开放时间，A、B、C 都在其中。D 项「新建图书馆」是把文中提到的「图书馆有上万册书」联想出来的，原文并没有这条建议，故选 D。NOT 题必须逐项回原文找依据。',
            difficulty: 2,
            tags: ['正误判断', 'NOT 题'],
          },
          {
            id: 'eng-reading-6-p1-q5',
            type: 'choice',
            stem: 'What can we learn from the passage?',
            options: [
              'Helping with housework was the least popular activity.',
              'Students spent more time on ball games than on short videos.',
              'The survey was done among 200 Grade 9 students.',
              'Boys read for pleasure more often than girls.',
            ],
            answer: 'C',
            explanation:
              '第一段明确写着 We asked 200 students in Grade 9，故选 C。A 项错在「最少」：做家务 28 人，而其他活动只有 22 人，最少的是其他活动；B 项与「看短视频时间几乎是打球的两倍」相反；D 项与「女生更多选择阅读」相反。综合题要把每个选项都回图表或文字里核对一次。',
            difficulty: 3,
            tags: ['综合理解', '细节核对'],
          },
        ],
      },
      {
        title: 'Saving Water at Home — Our Project Report',
        kind: '图表（数据表 + 项目报告）',
        text: "Our group chose Saving Water at Home as our project topic. We asked four families in our neighbourhood to write down how much water they used every day for a week. The table shows the daily average of each family.\n\nFamily | Number of people | Water used a day (litres)\nChen | 4 | 480\nWu | 3 | 420\nLiu | 5 | 500\nZhou | 2 | 320\n\nThe numbers made us think. The Zhou family is the smallest, but it uses the most water per person: 160 litres, which is 60 percent more than the Liu family. When we visited them, we found that their toilet had been leaking for months. A leaking toilet can waste more than 200 litres of water a day.\nThe Liu family, on the other hand, uses the least water per person. They collect rainwater in two big buckets on the balcony and use it to wash the floor and water the plants. Their mother also puts a full bottle of water inside the toilet tank, so each flush uses less.\nOur project report will end with three pieces of advice: check your toilet for leaks, collect rainwater, and take shorter showers. We hope other families in our building will try at least one of them.",
        cn: '我们小组选的项目主题是「家庭节水」。我们请小区里的四个家庭连续一周记录每天用了多少水，下表是各家庭每天的平均用水量。\n\n家庭 | 人数 | 每天用水量（升）\n陈 | 4 | 480\n吴 | 3 | 420\n刘 | 5 | 500\n周 | 2 | 320\n\n这些数字让我们思考。周家人最少，人均用水却最多：每人 160 升，比刘家多 60%。我们去他家看时，发现马桶已经漏水好几个月了。一个漏水的马桶一天能浪费 200 多升水。\n刘家相反，人均用水最少。他们在阳台上用两个大桶接雨水，用来拖地和浇花；妈妈还在马桶水箱里放了一个装满水的瓶子，这样每次冲水就用得少一些。\n我们的项目报告最后会给出三条建议：检查马桶是否漏水、收集雨水、缩短洗澡时间。我们希望楼里其他家庭至少试一条。',
        questions: [
          {
            id: 'eng-reading-6-p2-q1',
            type: 'short',
            stem: 'How much water does the Zhou family use per person every day? Answer in a complete sentence and do not forget the unit.',
            answer: 'The Zhou family uses 160 litres of water per person every day.',
            rubric: [
              '数据正确：160（litres）。',
              '单位正确：litres（升），不能只写 160。',
              '写成完整句子，主语与谓语一致（The Zhou family uses …），不能只写 160 litres。',
              '说明这是 per person（人均）的数据，与表中 320 升／天的总量区分开。',
            ],
            explanation:
              '表格给出周家每天共用水 320 升、共 2 人，因此人均是 320 ÷ 2 = 160 升。项目情境的简答题要求「用完整句子回答」，答题模板是 The … family uses … litres of water per person every day.',
            difficulty: 2,
            tags: ['数据读取', '简答表达'],
          },
          {
            id: 'eng-reading-6-p2-q2',
            type: 'short',
            stem: 'Why does the Zhou family use so much water? Give one reason from the passage.',
            answer:
              'Because their toilet has been leaking for months. A leaking toilet can waste more than 200 litres of water a day.',
            rubric: [
              '答出原因：马桶漏水（their toilet had been leaking for months）。',
              '给出文中依据：一个漏水的马桶一天能浪费 200 多升水（more than 200 litres a day）。',
              '用完整句子回答，时态合理（has been leaking 用现在完成进行时最贴合原文）。',
              '不要把周家用水多归因于「人多」（周家只有 2 人，是四家中最少的）。',
            ],
            explanation:
              '原文说「周家人最少，人均用水却最多」，随后给出原因：toilet had been leaking for months。简答题里的 Why 题要用 Because 引导，并把文中的数字依据一并写出，这样才拿满踩分点。',
            difficulty: 2,
            tags: ['因果简答', '依据'],
          },
          {
            id: 'eng-reading-6-p2-q3',
            type: 'short',
            stem: 'How much more water does the Zhou family use per person than the Liu family? Use the words "more than" in your answer.',
            answer:
              'The Zhou family uses 60 litres more water per person than the Liu family (160 - 100 = 60). It uses 60 percent more water per person than the Liu family.',
            rubric: [
              '先算出刘家人均用水：500 ÷ 5 = 100 litres。',
              '再算出差值：160 - 100 = 60 litres。',
              '正确使用比较句式：… uses 60 litres more water per person than …。',
              '写出单位 litres，句子完整；若能同时写出 60 percent more than，可视为表达更充分。',
            ],
            explanation:
              '比较类简答题分两步：先把两边的数据都算成人均可比的数字（周家 160 升，刘家 500 ÷ 5 = 100 升），再用 A + 动词 + 数字 + more + 名词 + than + B 的句式表达差值。原文用 60 percent more than 说的是百分比，题目问的是多少升，不要直接抄百分比。',
            difficulty: 3,
            tags: ['数据计算', '比较句式'],
          },
          {
            id: 'eng-reading-6-p2-q4',
            type: 'short',
            stem: 'The Liu family saves water in two ways. Write them down in English.',
            answer:
              'First, they collect rainwater in two big buckets on the balcony and use it to wash the floor and water the plants. Second, they put a full bottle of water inside the toilet tank, so each flush uses less water.',
            rubric: [
              '写全两种方法：收集雨水（collect rainwater）；在水箱里放一个装满水的瓶子（put a full bottle of water inside the toilet tank）。',
              '说明雨水的用途：用来拖地、浇花（wash the floor and water the plants）。',
              '说明瓶子节水的原因：这样每次冲水用水更少（so each flush uses less water）。',
              '用 first / second 等词分条表达，句子完整、时态用一般现在时。',
            ],
            explanation:
              '这类题要在原文中找到列举标志（on the other hand、also），逐条摘取关键动词短语，再用自己的话组织成两句完整英文。摘录时不要漏掉动作的目的或结果，否则会被扣分。',
            difficulty: 2,
            tags: ['信息摘取', '英文表达'],
          },
          {
            id: 'eng-reading-6-p2-q5',
            type: 'short',
            stem: 'What could your own family do to save water? Write one suggestion and give a reason. (About 15—25 words.)',
            answer:
              'My family could take shorter showers, because a five-minute shower uses much less water than a ten-minute one. We could also check our toilet for leaks every month, as a leaking toilet may waste more than 200 litres a day.',
            rubric: [
              '写出一条具体可行的建议（缩短洗澡时间、检查马桶漏水、收集雨水、用洗菜水浇花、用杯子接水刷牙等）。',
              '给出理由，且理由与建议对应（例如缩短洗澡时间能减少每次用水量）。',
              '句子完整、语法正确（could/should + 动词原形，because 引导原因）。',
              '词数大致在要求的范围内（15—25 词），不必写长，但不能只写一个短语。',
            ],
            explanation:
              '开放性简答题的评分重点是「建议具体 + 理由对应 + 语言正确」，不要求答案唯一。参考句式：My family could … , because …；It would be better to … , since …。写的时候尽量套用文中出现过的表达（take shorter showers、check the toilet for leaks），既能保证准确，也贴合材料话题。',
            difficulty: 2,
            tags: ['开放简答', '建议与理由'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-6-q1',
        type: 'choice',
        stem: 'A class made a chart of how they use water at home:\nWashing clothes: 40%\nShowers: 30%\nWashing dishes: 20%\nDrinking and cooking: 10%\nWhich use takes up the largest part of the water?',
        options: ['Washing clothes', 'Showers', 'Washing dishes', 'Drinking and cooking'],
        answer: 'A',
        explanation:
          '比较四个百分比：40% > 30% > 20% > 10%，洗衣服占比最大，故选 A。饼图题先看各块比例的大小关系，并检查各块相加是否为 100%（40+30+20+10 = 100），如果相加不是 100，说明还有「其他」一项被漏看。',
        difficulty: 1,
        tags: ['图表读取', '饼图'],
      },
      {
        id: 'eng-reading-6-q2',
        type: 'choice',
        stem: 'Read: "Forty students in our class walk to school, and twenty take the bus." Which sentence describes the data correctly?',
        options: [
          'Twice as many students walk to school as take the bus.',
          'Half as many students walk to school as take the bus.',
          'The number of students who walk is twenty fewer than those who take the bus.',
          'Three times as many students take the bus as walk.',
        ],
        answer: 'A',
        explanation:
          '40 是 20 的两倍，所以「步行的学生是坐公交的两倍」，A 正确。B 项把倍数关系说反了；C 项说步行比坐车少 20 人，与数字相反；D 项「坐车是步行的三倍」也是反的。倍数句式要背牢：twice as many A as B（A 是 B 的两倍）、half as many A as B（A 是 B 的一半）。',
        difficulty: 2,
        tags: ['数据表达', '倍数句式'],
      },
      {
        id: 'eng-reading-6-q3',
        type: 'choice',
        stem: 'In a survey of 200 students, sixty said they read for pleasure every day. What percentage is that?',
        options: ['20%', '30%', '60%', '3%'],
        answer: 'B',
        explanation:
          '60 ÷ 200 = 0.3，即 30%，故选 B。A 项 20% 对应 40 人，C 项 60% 是把人数当成了百分比，D 项是计算错误。百分比题先写算式再选答案，可以避免与人数混淆。',
        difficulty: 2,
        tags: ['百分比计算', '数据处理'],
      },
      {
        id: 'eng-reading-6-q4',
        type: 'fill',
        stem: 'Read: "Our class used 60 litres of water for cleaning. The class next door used twice as much." How many litres did the class next door use? (Answer with a number.)',
        answer: '120',
        explanation:
          'twice as much 表示「两倍」，60 × 2 = 120 升。若题干说 half as much，则是 30 升；说 three times as much，则是 180 升。倍数词必须与数字一起计算，不能凭感觉。',
        difficulty: 1,
        tags: ['倍数计算', '数据'],
      },
      {
        id: 'eng-reading-6-q5',
        type: 'short',
        stem: '用英语写一句完整的话，说明下面这份数据（要求使用比较句式）：步行上学 12 人，骑自行车上学 18 人。',
        answer:
          'Eighteen students go to school by bike, which is six more than the twelve students who walk. / More students go to school by bike than on foot: 18 students ride bikes, while only 12 walk, so six more students ride bikes.',
        rubric: [
          '两个数据都出现且正确（by bike 18 人，on foot 12 人）。',
          '使用比较句式（more … than、six more than、compared with 等）。',
          '写成完整句子，语法正确（go to school by bike / on foot，不用 take bike）。',
          '表达要交代清楚「谁比谁多、多多少」，不能只罗列数字。',
        ],
        explanation:
          '数据表达的常用句式：More students go to school by bike than on foot.；Eighteen students ride bikes, six more than those who walk.；The number of students who ride bikes is 1.5 times that of those who walk.（若要用倍数，需先算 18 ÷ 12 = 1.5 倍。）先列数据，再选句式，最后检查交通方式的表达是否地道（by bike、on foot）。',
        difficulty: 2,
        tags: ['数据表达', '简答写作'],
      },
    ],
    examTips: [
      '时间分配：项目情境读写建议 12—15 分钟。第一节选择题 5 分钟（图表定位为主），第二节简答题 8 分钟（每题 1.5 分钟，先写有把握的），最后留 1 分钟检查拼写与单位。',
      '解题顺序：先做选择题，因为定位图表出答案最快；简答题按「先摘数据、再写完整句」两步走，不要把整段材料重抄一遍。',
      '简答题先看清题干的要求词：how much 只问数据；why 要写原因加依据；suggest 要写建议加理由；write … in English 则必须成句，不能只写短语。',
      '数字一定要带单位，百分比要写 percent，涉及计算先在草稿纸上写出算式（如 320 ÷ 2 = 160），算完再选或再写，避免因口算失误丢分。',
    ],
  },
  {
    id: 'eng-reading-7',
    grade: 'all',
    unit: '项目情境',
    title: '项目情境读写（二）：跨学科主题探究（环保、科技、文化）',
    enTitle: 'Project-based Reading and Writing: Cross-subject Projects',
    summary:
      '跨学科项目把英语和科学、地理、文化连起来：既要读懂材料里的学科概念与数据，又要用英语写出探究的结论、依据与建议，答题时不能把自己的常识当成材料的内容。',
    points: [
      {
        level: '重点',
        text: '先圈学科关键词，再抓数据与结论',
        explain:
          '环保、科技、文化类材料的骨架是「关键词 + 数据 + 结论」：先圈出 energy、pollution、traditional、technology、temperature 这类词弄清话题，再找出数据（41°C、60 percent、twice as many）和作者下的结论（so、that is why、in other words 之后）。选择题和简答题的答案都在这一条链上。',
      },
      {
        level: '重点',
        text: '分清「材料说了什么」与「你认为怎样」',
        explain:
          '跨学科材料贴近生活常识，很容易把自己的想法当答案。选择题必须能在材料中找到依据：材料没说「砍树能降温」就不能选；材料只说「可能会」，选项写「一定会」就要排除。只有标注 What do you think / your own idea 的题才允许写个人看法。',
      },
      {
        level: '重点',
        text: '简答题三段式：结论 + 依据 + 评价',
        explain:
          '项目情境第二节的简答题按「结论（先回答问的是什么）— 依据（数据或文中的例子）— 一句自己的评价或建议」组织。三段齐全的答案通常接近满分；只写数据或只写看法都会被扣分。',
      },
      {
        level: '重点',
        text: '用英语表达因果与建议',
        explain:
          '因果：because、so、as a result、That is why …、This means that …；建议：It would be better to …、We suggest that …、We could … so that …。写简答题时优先套用材料里出现过的句式（原文用 Turning water into vapour uses energy, so …，答题时就可以照这个结构改写）。',
      },
      {
        level: '次重点',
        text: '借助学科常识排错，但不能越界',
        explain:
          '常识能帮你快速排除明显违背科学的选项（例如「树木让空气更热」「漏水的马桶节水」），但常识不能替代原文：如果材料给出的数据与你的印象不同，答题一律以材料为准。',
      },
      {
        level: '了解',
        text: '项目报告的常见结构',
        explain:
          'What we did（我们做了什么）→ What we found（我们发现了什么）→ What we suggest（我们的建议）。读材料时按这三块记笔记，写简答题时也按这三块组织语言，答案自然有条理。',
      },
    ],
    passages: [
      {
        title: 'Does Our School Need More Trees?',
        kind: '说明文（跨学科项目报告：地理与生物）',
        text: "Last summer our science teacher asked a question that turned into a month-long project: is the playground hotter than the garden behind our classroom building?\nWe measured the temperature at four places every day at 2 p.m. The results were clear. On sunny days the concrete playground reached 41°C, while the grass under the trees stayed at 32°C. The west-facing wall of the classroom building was 38°C.\nOur biology teacher explained why. Plants take in water through their roots and give it out through their leaves. Turning water into vapour uses energy, so the air around a tree becomes cooler, just as sweat cools our skin on a hot day. Trees also block sunlight, which means the concrete below them never gets the chance to store heat.\nThen we looked at the air. Using a simple app, we counted tiny dust particles (PM2.5) at both places. The playground had almost twice as many as the garden. Dust sticks to leaves, so a line of trees between the road and the school can act as a filter.\nOur report suggests planting twelve more trees along the east side of the playground, where there are no buildings to block the sun. The headmaster has read the report, and he has asked us to prepare a short talk for the school meeting.",
        cn: '去年夏天，科学老师提的一个问题变成了我们一个月的项目：操场是不是比教学楼后的花园更热？\n我们每天下午两点在四个地点测温度。结果很清楚。晴天时，水泥操场达到 41°C，而树下的草地是 32°C；朝西的教学楼外墙是 38°C。\n生物老师解释了原因。植物通过根吸收水分，再通过叶子把水散出去；水变成水蒸气需要消耗能量，所以树周围的空气会变凉，就像出汗能让皮肤在热天降温一样。树还能挡住阳光，这意味着树下的水泥没有机会储存热量。\n接着我们测了空气。用一款简单的手机应用，我们在两个地点统计了细颗粒物（PM2.5）。操场上的数量几乎是花园的两倍。灰尘会附着在叶子上，因此马路与学校之间的一排树可以起到过滤器的作用。\n我们的报告建议在操场东侧多种十二棵树，因为那边没有建筑物遮挡阳光。校长已经读过报告，并让我们准备在学校大会上做一次简短的汇报。',
        questions: [
          {
            id: 'eng-reading-7-p1-q1',
            type: 'choice',
            stem: 'Why did the students do the project?',
            options: [
              'To find out whether the playground is hotter than the garden.',
              'To grow more vegetables behind the classroom building.',
              'To build a new classroom with bamboo boards.',
              'To measure how much rain falls in summer.',
            ],
            answer: 'A',
            explanation:
              '第一段直接写出研究问题：is the playground hotter than the garden behind our classroom building，故选 A。B、C、D 项在材料中都没有依据，属于无中生有。项目类材料的第一个选择题常常问研究目的，答案就在开头的问句里。',
            difficulty: 1,
            tags: ['细节题', '研究目的'],
          },
          {
            id: 'eng-reading-7-p1-q2',
            type: 'choice',
            stem: 'On sunny days, what was the temperature of the playground at 2 p.m.?',
            options: ['32°C', '38°C', '41°C', '30°C'],
            answer: 'C',
            explanation:
              '第二段写 the concrete playground reached 41°C，故选 C。A 项 32°C 是树下草地的温度，B 项 38°C 是朝西外墙的温度，D 项 30°C 材料中没有出现。这类题只在第二段中做数字对应，读清楚每个数字属于哪个地点即可。',
            difficulty: 1,
            tags: ['细节题', '数字定位'],
          },
          {
            id: 'eng-reading-7-p1-q3',
            type: 'choice',
            stem: 'According to the passage, how do trees make the air cooler?',
            options: [
              'They block the wind so that hot air cannot leave.',
              'They give out water vapour, and turning water into vapour uses energy.',
              'They store heat inside their leaves all day long.',
              'They make the sun shine less brightly in summer.',
            ],
            answer: 'B',
            explanation:
              '第三段给出原因：植物把水散出去，水变成水蒸气要消耗能量，所以周围空气变凉，故选 B。A 项方向错（树是挡阳光而不是挡风）；C 项与「树下的水泥没有机会储热」相反；D 项说树让太阳光变弱，是夸大，树只是遮挡（block）阳光。',
            difficulty: 2,
            tags: ['因果理解', '跨学科'],
          },
          {
            id: 'eng-reading-7-p1-q4',
            type: 'choice',
            stem: 'What does the underlined word "filter" in Paragraph 4 probably mean?',
            options: [
              'something that catches dust and keeps the air cleaner',
              'a machine that makes a loud noise',
              'a kind of tree that grows very fast',
              'a place where students play ball games',
            ],
            answer: 'A',
            explanation:
              '前一句说灰尘会附着在叶子上，后一句说马路与学校之间的一排树可以 act as a filter——由因果可知它是「把灰尘拦下来的东西」，即过滤器，故选 A。B、C、D 都放进原句读不通。词义猜测要靠前一句给出的原理。',
            difficulty: 2,
            tags: ['词义猜测', '因果线索'],
          },
          {
            id: 'eng-reading-7-p1-q5',
            type: 'choice',
            stem: 'What will happen next according to the passage?',
            options: [
              'The school will cut down some trees near the playground.',
              'The students will give a short talk at the school meeting.',
              'The headmaster has refused to read the report.',
              'The playground will be closed on sunny days.',
            ],
            answer: 'B',
            explanation:
              '末句写校长已读过报告，并让学生 prepare a short talk for the school meeting，故选 B。A 项与「建议多种十二棵树」相反；C 项与 has read the report 矛盾；D 项材料完全没有提到。问 next 的题只需看最后一句。',
            difficulty: 1,
            tags: ['细节题', '结尾信息'],
          },
        ],
      },
      {
        title: 'Keeping Cantonese Opera Alive',
        kind: '图表（调查数据 + 项目报告：文化主题）',
        text: "Our project topic was Keeping Cantonese Opera Alive. We wanted to know how much young people in our city know about it, so we asked 150 students in three schools three questions. Here is what we found.\n\nStudents who said they had watched a Cantonese opera performance: 24 (16%)\nStudents who could name one famous Cantonese opera song: 39 (26%)\nStudents who said they would like to learn more about it: 96 (64%)\n\nThe numbers tell an interesting story. Few students have actually watched a performance, yet nearly two thirds are willing to learn more. In other words, the problem is not that young people dislike the art; it is that few of them have been given the chance to meet it.\nWe then visited the Guangdong Cantonese Opera Theatre and interviewed Ms He, an actress who has worked there for nineteen years. She told us that the theatre now performs opera in the classroom at primary schools, and that short videos on the Internet bring in thousands of viewers. She also said that the hardest part is the language: many young people cannot understand the old Cantonese used in the songs, so the theatre adds subtitles on a screen beside the stage.\nOur group has made two suggestions. First, schools could invite an actress to give a forty-minute lesson once a term. Second, students could make one-minute videos in which they explain one opera story in simple modern Chinese.",
        cn: '我们的项目主题是「让粤剧活下去」。我们想知道这座城市的年轻人对粤剧了解多少，于是问了三所学校共 150 名学生三个问题，结果如下。\n\n表示看过粤剧演出的学生：24 人（16%）\n能说出一首著名粤剧唱段的学生：39 人（26%）\n表示想进一步了解粤剧的学生：96 人（64%）\n\n这些数字讲了一个有意思的故事：真正看过演出的人很少，但将近三分之二的人愿意了解更多。换句话说，问题不在于年轻人不喜欢这门艺术，而在于很少有人得到接触它的机会。\n随后我们走访了广东粤剧院，采访了在那里工作了十九年的何老师（演员）。她告诉我们，剧院现在到小学里做「戏曲进课堂」，网上的短视频也带来了成千上万的观看者。她还说，最难的部分是语言：很多年轻人听不懂唱词里的老式粤语，所以剧院在舞台旁边加了一块字幕屏。\n我们小组提了两条建议。第一，学校可以每学期请一位演员来上一节四十分钟的课；第二，学生可以拍一分钟短视频，用简单易懂的现代汉语讲一个戏曲故事。',
        questions: [
          {
            id: 'eng-reading-7-p2-q1',
            type: 'short',
            stem: 'How many students in the survey had watched a Cantonese opera performance? Give the number and the percentage.',
            answer:
              'Twenty-four students, that is 16 percent of the 150 students, said they had watched a Cantonese opera performance.',
            rubric: [
              '数字正确：24（人）。',
              '百分比正确：16%（16 percent）。',
              '写出调查总人数 150，说明百分比的分母。',
              '用完整句子回答，时态合理（had watched 与调查内容一致）。',
            ],
            explanation:
              '数据在图表第一行：24 人，16%。简答题要求「数字 + 百分比」时两者都要写，并且最好点明总人数（150），这样踩分点最完整。参考句式：Twenty-four students, that is 16 percent of the 150 students, said …。',
            difficulty: 2,
            tags: ['数据读取', '简答表达'],
          },
          {
            id: 'eng-reading-7-p2-q2',
            type: 'short',
            stem: 'What did the survey show about the students who would like to learn more about Cantonese opera? Answer with the number.',
            answer:
              'Ninety-six students, or 64 percent of those asked, said they would like to learn more about Cantonese opera. That is nearly two thirds of the students.',
            rubric: [
              '数字正确：96 人（64%）。',
              '用完整句子表达，说明这是 150 人中的 96 人（占比 64%）。',
              '可补充材料中的评价：nearly two thirds（将近三分之二），说明愿意了解的人占多数。',
              '不要把 96 人说成「看过演出的人数」（那是 24 人）。',
            ],
            explanation:
              '答案在图表第三行：96 人（64%）。原文用 nearly two thirds 来概括这个比例，答题时把这个概括写进去，能体现你读懂了数据之间的关系，也是很好的踩分点。',
            difficulty: 2,
            tags: ['数据读取', '信息概括'],
          },
          {
            id: 'eng-reading-7-p2-q3',
            type: 'short',
            stem: 'According to the passage, what is the biggest difficulty for young people who watch Cantonese opera? Why does the theatre do something about it?',
            answer:
              'The biggest difficulty is the language: many young people cannot understand the old Cantonese used in the songs. That is why the theatre adds subtitles on a screen beside the stage, so that the audience can follow the story.',
            rubric: [
              '答出困难：语言障碍——年轻人听不懂唱词里的老式粤语（the old Cantonese used in the songs）。',
              '答出做法及原因：剧院在舞台旁加字幕屏（adds subtitles on a screen beside the stage），帮助观众看懂故事。',
              '用 because、so、that is why 等词表达因果，句子完整。',
              '不要答成「年轻人不喜欢粤剧」——原文明确说问题不是不喜欢，而是没有机会接触。',
            ],
            explanation:
              '原文用 the hardest part is the language 引出困难，再用 so 给出剧院的应对办法。简答题要「困难 + 做法 + 原因」三块齐全，其中因果词（so that、that is why）是得分的关键标记。',
            difficulty: 2,
            tags: ['因果简答', '细节摘取'],
          },
          {
            id: 'eng-reading-7-p2-q4',
            type: 'short',
            stem: 'Ms He says the theatre has two ways of reaching young people. Write them down in English.',
            answer:
              'First, the theatre performs opera in the classroom at primary schools. Second, it puts short videos on the Internet, and these videos bring in thousands of viewers.',
            rubric: [
              '写全两种方式：到小学做「戏曲进课堂」（performs opera in the classroom at primary schools）；在互联网上发布短视频（puts short videos on the Internet）。',
              '写出短视频的效果：带来成千上万的观看者（bring in thousands of viewers）。',
              '用 first / second 或 also 等词分条表达，句子完整、第三人称单数正确（performs、puts）。',
              '不要与最后一段的项目建议混淆（那是我们小组的两条建议，不是剧院的两种做法）。',
            ],
            explanation:
              '材料里有两个并列的「两条」：剧院的做法（进课堂、发短视频）与我们小组的建议（演员来上课、学生拍视频）。答题前先看清题干问的是哪一方，这是本项目最容易失分的地方。',
            difficulty: 3,
            tags: ['信息摘取', '英文表达'],
          },
          {
            id: 'eng-reading-7-p2-q5',
            type: 'short',
            stem: 'Which of the group’s two suggestions do you think is better? Give your reason in English. (About 15—30 words.)',
            answer:
              'I think the first suggestion is better, because a real actress can show students how to sing and move, and one lesson a term is easy for schools to arrange. / I prefer the second one, because students can share their one-minute videos online, so more young people will see them without leaving home.',
            rubric: [
              '明确选择两条建议中的一条（请演员来上课，或学生拍一分钟短视频）。',
              '给出理由，且理由与所选建议直接相关（如现场体验更真实、短视频传播范围更广）。',
              '用英语成句，语法正确（I think / I prefer … because …），词数大致符合要求。',
              '允许两种答案，但必须言之有据，不能只写 I think it is good 这类空话。',
            ],
            explanation:
              '开放性简答题只要观点与理由对应、语言正确即可得满分。参考句式：I think … is better, because …；I prefer … , because … so that …。写的时候尽量借用材料中的表达（a forty-minute lesson once a term、one-minute videos、reach more young people），既准确又贴题。',
            difficulty: 2,
            tags: ['开放简答', '观点与理由'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'eng-reading-7-q1',
        type: 'choice',
        stem: 'Choose the best word: "The playground is very hot in summer, ___ we planted trees along its east side."',
        options: ['unless', 'because', 'although', 'so'],
        answer: 'D',
        explanation:
          '「操场夏天很热」是原因，「我们在东侧种了树」是结果，用 so 连接。because 后面接原因（若用 because，就成了「我们种树是操场很热的原因」，逻辑反了）；although 表让步，unless 表条件，都与句意不符。项目报告里的动作与原因要分清先后。',
        difficulty: 1,
        tags: ['逻辑连词', '因果'],
      },
      {
        id: 'eng-reading-7-q2',
        type: 'choice',
        stem: 'Read: "We found that the playground had almost twice as many dust particles as the garden. ___" Which sentence best follows?',
        options: [
          'So a line of trees between the road and the school may help clean the air.',
          'So we decided to stop measuring the air.',
          'So the garden must be hotter than the playground.',
          'So trees are useless for the environment.',
        ],
        answer: 'A',
        explanation:
          '数据说明操场灰尘多，紧接着应给出由数据推出的建议或结论：在马路与学校之间种一排树能起过滤作用，故选 A。B 项与「继续做项目、向校长报告」相矛盾；C 项把话题从灰尘换成温度，且与实测数据相反；D 项与全文结论完全相反。项目类题目要顺着「数据—结论」的思路选。',
        difficulty: 2,
        tags: ['因果推断', '段落衔接'],
      },
      {
        id: 'eng-reading-7-q3',
        type: 'choice',
        stem: 'Read: "Twice as many students chose the metro as chose the bus. Thirty students chose the bus." How many students chose the metro?',
        options: ['15', '30', '60', '90'],
        answer: 'C',
        explanation:
          'twice as many A as B 表示「A 是 B 的两倍」，公交 30 人，地铁就是 30 × 2 = 60 人，故选 C。A 项把它误当成一半；B 项照抄了题干数字；D 项是三倍（three times）。倍数句式的关键是先弄清「谁是谁的几倍」。',
        difficulty: 2,
        tags: ['倍数计算', '数据'],
      },
      {
        id: 'eng-reading-7-q4',
        type: 'fill',
        stem: 'Fill in the blank with a suitable linking word or phrase: "Trees make the air cooler. ___, they block sunlight so that the concrete below them does not store heat." (One word, meaning 「另外、而且」.)',
        answer: 'Besides|Also|Moreover|What is more',
        explanation:
          '两句都是树的优点，属于递进关系，可填 Besides、Also、Moreover 或 What is more，注意句首首字母大写、后面加逗号。若填 However 就成了相反关系，与两句都是「好处」矛盾；若填 For example，则第二句并不是第一句的例子，而是另一条并列的理由。',
        difficulty: 2,
        tags: ['逻辑连接', '递进'],
      },
      {
        id: 'eng-reading-7-q5',
        type: 'short',
        stem: '项目报告的结论必须有自己的依据。请用英语写两句：第一句说明你的结论，第二句给出你依据的数据或例子。（选择一个校园或社区话题即可，约 20—35 词。）',
        answer:
          'I think our school should plant more trees in the playground. Our group measured the temperature at 2 p.m. and found that the playground was 41°C while the grass under the trees was only 32°C.',
        rubric: [
          '第一句是明确的结论或主张（如 should plant more trees、should save water），句子完整。',
          '第二句给出具体依据：数据（带单位）或材料中的例子，且与本组结论相关。',
          '两句之间逻辑对应：依据能支持结论，不能出现数据与结论无关的情况。',
          '英语表达正确（时态一致、单位用 litres / °C / percent 等），词数大致符合要求。',
        ],
        explanation:
          '跨学科项目写作的核心是「结论有依据」。参考结构：I think … should …（结论）+ We measured / found / asked … and found that …（依据）+ 可选一句评价。写数据时要带单位与比较（41°C 对 32°C），这样依据才具体。',
        difficulty: 3,
        tags: ['跨学科写作', '结论与依据'],
      },
    ],
    examTips: [
      '时间分配：跨学科项目题建议 12—15 分钟。先花 2 分钟通读材料并圈出数据与结论，再用 5 分钟做第一节选择题，最后 6—7 分钟写第二节简答题。',
      '解题顺序：选择题先做数据定位题，再做需要推理或词义猜测的题；简答题先做「摘数据」的题（答案在材料里），再做「写看法」的题，保证基础分先拿到。',
      '简答题答题模板：先抄准数据（带单位），再用完整句子作答，最后按题干要求补一句结论或建议；三段齐全的答案得分明显更高。',
      '千万不要把自己的生活常识当答案：凡是材料里找不到依据的选项，无论听起来多合理都要排除；材料的数据与你的印象冲突时，一律以材料为准。',
    ],
  },
];
