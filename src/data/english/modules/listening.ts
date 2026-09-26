/**
 * 英语·听说模块（按广州中考知识模块组织，共 6 条）。
 *
 * ## 卷面依据
 *
 * 听说考试 14 小题 30 分（另场），本文件按这份结构组织内容：
 *   模仿朗读 1 题 8 分、信息获取第一节 听选 6 题 9 分、第二节 回答 4 题 4 分、
 *   角色扮演第一节 复述 1 题 7 分、第二节 询问 1 题 1 分、第三节 回答 1 题 1 分。
 * 秒数与作答时限以当年官方卷面与考场屏幕提示为准，本文件里的时间只写「约」。
 *
 * ## 关于「没有音频」
 *
 * 本应用不提供音频文件：听说材料一律写成**可朗读的英文脚本**（`scripts[].text`），
 * 由详情页顶部的朗读条（`components/SpeechBar` + `lib/entrySpeech.ts`）用浏览器内置语音
 * 读出来当听力音频，所以每段脚本都是完整、口语化、能一口气读下来的对话或独白。
 * 模仿朗读与跟读相关的脚本再给 `cues`（重音、连读、弱读、语调、停顿、听记提示），
 * 学生看得到「该在哪里连、该把重音放在哪个词上」，而不是只有文字。
 *
 * ## 每条为什么这么写
 *
 * 条目 1—6 覆盖听说考试的全部题型与流程：模仿朗读 → 信息获取（听选 / 回答）→
 * 角色扮演（复述 / 询问 / 回答）→ 应试策略。每条 `scripts` 至少 2 段（每段英文 80—200 词，
 * 逐段配中文译文、朗读提示与听力任务），`questions` 是题型方法题，`examTips` 是临场动作。
 * 全部语篇与题目为原创仿真材料，不复刻任何真题或教材原文。
 */

import type { EnglishKnowledge } from '../../../types';

export const topics: EnglishKnowledge[] = [
  /* ------------------------------------------------------------------ */
  /* 1. 模仿朗读（1 小题 8 分）                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-1',
    grade: 'all',
    unit: '模仿朗读',
    title: '模仿朗读（8 分）：语音语调与跟读方法',
    enTitle: 'Reading Aloud: Sounds, Stress and Intonation',
    summary:
      '模仿朗读只有 1 小题却占 8 分，考的不是「读得快」，而是「读得像」：按意群停顿、该连读的地方连起来、用对升降调，并且在读错一个词时不回头重读。',
    points: [
      {
        level: '重点',
        text: '模仿朗读评的是三件事：准确性（音、重音）、流利度（意群停顿、不卡顿、不重复）与完整度（不跳词、不添词），语音语调贯穿这三项。',
        explain:
          '读错两三个音通常只影响局部，但逐词蹦读、句中乱停、回头重读会同时拉低流利度与完整度，是最容易避免的大失分。',
      },
      {
        level: '重点',
        text: '按意群朗读：一个意群一口气读完，标点处必停，主谓之间、从句引导词前可轻停。',
        explain:
          '判断标准是「一口气读得完、意思完整」。例：After school / we cleaned the classroom / and then went home. 三处停顿就是三个意群。',
      },
      {
        level: '重点',
        text: '连读、弱读与失去爆破是模仿朗读的主要得分点：辅音结尾接元音开头要连读，介词与冠词弱读，爆破音后接辅音只做口形不送气。',
        explain:
          '连读不等于读得快，而是自然衔接。pick it up 读成 pick_it_up（一口气），比逐词念更像英语，也是评分点最集中的地方。',
      },
      {
        level: '次重点',
        text: '重音规则：实词（名词、动词、形容词、副词）重读，虚词（冠词、介词、连词、代词）弱读；对比信息处用对比重音。',
        explain:
          '听到 I said BLUE, not black 时重音落在对比词上；朗读时把重音放错位置，句子的意思就可能被听成另一个意思。',
      },
      {
        level: '次重点',
        text: '语调：陈述句、特殊疑问句、祈使句用降调；一般疑问句用升调；选择疑问句 or 前升、or 后降。',
        explain:
          '一般疑问句若用降调，听起来像质问而不是提问，是语音题与口语评分里最常见的扣分点。',
      },
      {
        level: '了解',
        text: '准备时间与设备：模仿朗读通常给约 30 秒准备、约 1 分钟朗读（秒数以考场屏幕提示为准）；麦克风距嘴 2—3 厘米，不要用手碰耳机线。',
      },
      {
        level: '了解',
        text: '数字、年份与专有名词要读清楚：2019 读 twenty nineteen，1.5 读 one point five，Room 305 读 room three o five。',
      },
    ],
    scripts: [
      {
        title: '模仿朗读材料：校园环保周（短文，约 130 词）',
        text: "\"Our school's Green Week starts on Monday,\" said Ms Lin, our science teacher, at the morning meeting. \"This year we are not just talking about the environment. We are doing something about it.\"\n\nEvery class has a different job. Class One will collect old batteries, and Class Two will look after the small garden behind the library. Our class, Class Three, will make a short video about saving water at home.\n\nI was a little nervous at first, because I had never filmed anything before. But my classmates helped me plan the story, and we practised after school for three days. When we showed the video on Friday, everyone clapped. Ms Lin smiled and said, \"Small actions, big changes. That is what Green Week is really about.\"",
        cn: '（译文）「我们学校的绿色周从周一开始，」我们的科学老师林老师在晨会上说。「今年我们不只是谈论环境，我们要为它做点事。」\n每个班都有不同的任务。一班收集废旧电池，二班照看图书馆后面的小花园。我们三班要做一个关于家庭节约用水的短视频。\n一开始我有点紧张，因为我以前从没拍过片子。但同学们帮我一起策划故事，我们放学后练了三天。周五我们播放视频时，大家都鼓掌了。林老师笑着说：「小小的行动，大大的改变。这才是绿色周真正的意义。」',
        cues: [
          '重音：Green Week、Monday、a different job、saving water 这些实词要重读；our、the、at、of 弱读，不要每个词都用同样的力气。',
          '连读：look_after、at_home、something_about_it、not_just 连读；is_really_about 中间不停顿，一口气读完。',
          '停顿与意群：After school / we cleaned the classroom 式的短句要一口气读完；引号内的直接引语单独成一个调群，said 之后稍停，再起下一句。',
          '语调：陈述句与引语结尾都用降调；I was a little nervous at first 与 But my classmates helped me 之间是转折，But 前稍停并略提调。',
          '弱读与失去爆破：had never filmed anything 里 had 的 d 在 n 前只做口形不送气；that is what 连读成 that_is_what。',
          '结尾句：Small actions, big changes. 两个短语各自成调群，中间停顿一拍，changes 用降调收束，整段才显得完整。',
        ],
        tasks: [
          {
            id: 'eng-listen-1-s1-t1',
            type: 'choice',
            stem: '录音中 Green Week 从哪一天开始？',
            options: ['On Monday.', 'On Tuesday.', 'On Friday.', 'On Sunday.'],
            answer: 'A',
            explanation:
              '材料第一句就是 starts on Monday。On Friday 是播放视频的日子（When we showed the video on Friday），属于同类型时间干扰项，听的时候要听清动作与时间的搭配。',
            difficulty: 1,
            tags: ['听力细节', '时间信息'],
          },
          {
            id: 'eng-listen-1-s1-t2',
            type: 'choice',
            stem: '句子 Every class has a different job. 朗读时重音应落在哪些词上？',
            options: ['Every, has, a', 'class, different, job', 'has, a, job', 'Every, a, has'],
            answer: 'B',
            explanation:
              '实词重读、虚词弱读：class（名词）、different（形容词）、job（名词）是实词，要重读；every、has、a 在这种句子里弱读即可。',
            difficulty: 2,
            tags: ['重音', '语音语调'],
          },
          {
            id: 'eng-listen-1-s1-t3',
            type: 'choice',
            stem: '在 look after the small garden 中，look 与 after 之间应该怎么读？',
            options: [
              '中间停顿一拍，表示两个词',
              '连读成 look_after，中间不停顿',
              '把 after 拆成两个重读音节',
              '两个词都用升调读',
            ],
            answer: 'B',
            explanation:
              'look 以辅音结尾、after 以元音开头，要连读成 look_after。中间停一拍会把一个意群切断，流利度直接扣分。',
            difficulty: 2,
            tags: ['连读', '语音语调'],
          },
          {
            id: 'eng-listen-1-s1-t4',
            type: 'short',
            stem: '用一句英语概括 Ms Lin 对 Green Week 的看法。',
            answer:
              'Small actions can bring big changes, so everyone can do something for the environment.',
            rubric: [
              '用到了 small actions / big changes 或同义表达',
              '点出「每个人都能为环境做点事」这一层意思',
              '句子完整、时态正确（一般现在时）',
            ],
            explanation:
              '材料结尾 Ms Lin 的原话是 Small actions, big changes.，概括题要把它扩展成一句完整的话，而不是照抄两个词组，注意不能改变原意。',
            difficulty: 2,
            tags: ['语音语调', '概括表达'],
          },
        ],
      },
      {
        title: '模仿朗读材料：问路与借书（对话，约 120 词）',
        text: "M: Excuse me, could you tell me how to get to the school library?\nW: Sure. Go along this road, turn left at the second corner, and you will see a white building.\nM: Is it far from here?\nW: No, it only takes about five minutes on foot.\nM: Great. By the way, is the library open on Sunday afternoons?\nW: Yes, it is. But it closes at half past five, so don't be late.\nM: Thanks a lot. Do I need to show my student card?\nW: You do. The librarian will check it at the door.\nM: I see. And can I borrow three books at a time?\nW: Two, I'm afraid. You can keep them for two weeks.\nM: That's fine. Thank you for your help.\nW: You're welcome. Enjoy your reading!",
        cn: '男：打扰一下，你能告诉我怎么去学校图书馆吗？\n女：当然。沿这条路走，在第二个路口左转，你就会看到一栋白色的楼。\n男：离这里远吗？\n女：不远，步行大约只要五分钟。\n男：太好了。顺便问一下，图书馆周日下午开放吗？\n女：开放的。不过五点半就关门，所以别迟到。\n男：多谢。我需要出示学生证吗？\n女：需要的，图书管理员会在门口检查。\n男：明白了。我一次能借三本书吗？\n女：恐怕只能借两本，可以借两周。\n男：好的。谢谢你的帮助。\n女：不客气。祝你阅读愉快！',
        cues: [
          '连读：Excuse_me、turn_left_at_the_second_corner、at_a_time 连读；the school library 里的 the school 弱读，重音落在 library。',
          '重音：Could you TELL me how to get to the library? 疑问句重心落在 tell 与 library；I\'m aFRAID 里 afraid 重读，表示委婉否定。',
          '语调：一般疑问句 Is it far from here?、can I borrow three books? 用升调；特殊疑问句 how to get to the library 用降调；回答 Yes, it is. 用降调表示确定。',
          '弱读：to、at、for、of 弱读成 /tə/、/ət/、/fə/、/əv/，不要逐词重读；you will 在口语中常缩成 you\'ll。',
          '停顿：By the way 之后短停；转折词 But 前稍停并略提调，提示后面才是真正有用的信息（五点半关门）。',
        ],
        tasks: [
          {
            id: 'eng-listen-1-s2-t1',
            type: 'choice',
            stem: '图书馆周日下午什么时候关门？',
            options: ['At four thirty.', 'At five.', 'At half past five.', 'At six.'],
            answer: 'C',
            explanation:
              '女声说 it closes at half past five，即五点半。At five 是干扰项，half past five 里也含 five，听数字要把整个短语听全，不能只抓一个词。',
            difficulty: 2,
            tags: ['听力细节', '时间信息'],
          },
          {
            id: 'eng-listen-1-s2-t2',
            type: 'choice',
            stem: '男学生一次最多能借几本书？',
            options: ['Two.', 'Three.', 'Four.', 'Five.'],
            answer: 'A',
            explanation:
              '男生问 three books，女声回答 Two, I\'m afraid.——I\'m afraid 是礼貌的否定，说明实际只能借两本。听到问句里的数字不能直接当答案。',
            difficulty: 2,
            tags: ['听力细节', '否定信息'],
          },
          {
            id: 'eng-listen-1-s2-t3',
            type: 'choice',
            stem: '图书馆在什么位置？',
            options: [
              'In a white building after turning left at the second corner.',
              'Opposite the school gate.',
              'Behind the dining hall.',
              'Next to the playground.',
            ],
            answer: 'A',
            explanation:
              '女声说 Go along this road, turn left at the second corner, and you will see a white building——沿路走到第二个路口左转，看到一栋白楼。',
            difficulty: 1,
            tags: ['听力细节', '地点信息'],
          },
          {
            id: 'eng-listen-1-s2-t4',
            type: 'choice',
            stem: 'Is it far from here? 这句在对话中应使用什么语调？',
            options: ['升调', '降调', '先降后升', '平调'],
            answer: 'A',
            explanation:
              '这是一般疑问句（yes/no 问句），要用升调；后面的回答 No, it only takes about five minutes. 是陈述句，用降调。',
            difficulty: 1,
            tags: ['语调', '语音语调'],
          },
        ],
      },
    ],
    examTips: [
      '播放前把材料默读一遍，用铅笔在长句的意群处画斜线（After school / we cleaned the classroom / and then went home），不要在生词上纠缠。',
      '语速降到平时说话的九成，「慢而稳」比「快而乱」得分高；句末把音收完整，不要吞掉名词复数的 s。',
      '读之前把连读位置标出来：辅音结尾接元音开头（an_apple、pick_it_up）、同一个辅音相邻（a big_garden）都要连起来。',
      '一般疑问句在句尾轻轻上挑、特殊疑问句轻轻下压，读前用手势带一下语调，形成肌肉记忆。',
      '读错一个词不要回头重读整句，继续往下读；回头会造成重复与跳读，扣的比一个音多得多。',
    ],
    questions: [
      {
        id: 'eng-listen-1-q1',
        type: 'choice',
        stem: '模仿朗读的评分主要看哪三个方面？',
        options: [
          '声音大小、语速快慢、录音时长',
          '语音语调、流利度与内容完整',
          '单词拼写、语法正确、字数多少',
          '表情自然、仪态大方、眼神交流',
        ],
        answer: 'B',
        explanation:
          '听说考试按语音语调、流利度与完整度给分；声音大小只影响录音是否清晰，不作为独立评分项。',
        difficulty: 1,
        tags: ['评分标准'],
      },
      {
        id: 'eng-listen-1-q2',
        type: 'choice',
        stem: '朗读中遇到一个不认识的单词，最恰当的做法是？',
        options: [
          '停下来查词，查完再读',
          '按常见拼读规则读出来，继续往下读',
          '跳过整句不读',
          '把整段从头重读一遍',
        ],
        answer: 'B',
        explanation:
          '停顿、重复都会扣流利度与完整度；按拼读规则猜读音并继续，是失分最小的处理方式。',
        difficulty: 2,
        tags: ['临场策略'],
      },
      {
        id: 'eng-listen-1-q3',
        type: 'choice',
        stem: 'Could you tell me how to get to the library? 朗读时重音落在哪两个词上？',
        options: ['could 与 you', 'tell 与 library', 'me 与 to', 'how 与 the'],
        answer: 'B',
        explanation:
          '疑问句的信息重心落在实义动词与关键名词上：tell 与 library；could、you、me、to、the 都是弱读的功能词。',
        difficulty: 2,
        tags: ['重音', '语音语调'],
      },
      {
        id: 'eng-listen-1-q4',
        type: 'choice',
        stem: '下列句子中，朗读时应该用升调的是？',
        options: ['Where are you going?', 'Please close the door.', 'Are you coming with us?', 'I have finished my homework.'],
        answer: 'C',
        explanation:
          'Are you coming with us? 是一般疑问句，用升调；Where 开头的特殊疑问句、祈使句与陈述句都用降调。',
        difficulty: 1,
        tags: ['语调', '语音语调'],
      },
      {
        id: 'eng-listen-1-q5',
        type: 'fill',
        stem: '相邻两个单词首尾相连、一口气读出来的朗读方法叫「____」（填中文术语）。',
        answer: '连读',
        explanation:
          '连读（linking）是模仿朗读的主要得分点，如 an_apple、pick_it_up；与它并列的技巧还有弱读与失去爆破。',
        difficulty: 1,
        tags: ['连读', '术语'],
      },
      {
        id: 'eng-listen-1-q6',
        type: 'fill',
        stem: '年份 2019 在模仿朗读中通常读作 twenty ____。',
        answer: 'nineteen',
        explanation:
          '四位数年份按「前两位 + 后两位」读，2019 读 twenty nineteen；two thousand and nineteen 也能听到，但模仿朗读以录音里的读法为准。',
        difficulty: 2,
        tags: ['数字读法'],
      },
      {
        id: 'eng-listen-1-q7',
        type: 'short',
        stem: '你跟读时总是跟不上语速，请写出两条可操作的改进方法。',
        answer:
          '一是先按意群把句子切块（After school / we cleaned the classroom / and then went home.），逐块跟读，熟练后再连起来；二是先放慢速度跟读，把连读与弱读的位置标出来（look_after、at_home），等口腔习惯之后再回到原速。',
        rubric: [
          '指出按意群切块、逐块跟读',
          '指出先慢速再回到原速的练习顺序',
          '举出具体连读或弱读位置（如 look_after、at_home）',
        ],
        explanation:
          '跟不上通常不是「听不清」，而是「逐词读」破坏了意群。先分块再连读，比反复整段重读有效得多。',
        difficulty: 2,
        tags: ['跟读方法'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 2. 信息获取 第一节 听选（6 小题 9 分）                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-2',
    grade: 'all',
    unit: '信息获取',
    title: '信息获取·听选（6 小题 9 分）与听记方法',
    enTitle: 'Listening for Information: Multiple Choice',
    summary:
      '听选 6 小题 9 分，考的都是具体信息：时间、数字、地点、原因。方法只有一条——播放前看选项圈出疑问词，播放时用符号速记，听到同义替换立刻对照选项。',
    points: [
      {
        level: '重点',
        text: '听选题的四类考点：时间与数字、地点、人物与关系、原因与目的。',
        explain:
          '看选项就能预判考点：选项全是 At two o\'clock、At five 这类时间，就只盯时间。选项里的时间往往都在录音里出现过，要靠「谁问、谁答」来区分。',
      },
      {
        level: '重点',
        text: '同义替换是听选的命脉：录音说 fifty percent off，选项可能写 half price；录音说 twice as many as last year，选项写 Fifteen。',
        explain:
          '正确项很少把录音原句照搬；凡是与录音用词一模一样但上下文对不上的选项，多半是干扰项。',
      },
      {
        level: '重点',
        text: '速记只写「符号 + 关键词」：数字直接写（2:00、15、200），地点写首字母（hall、gate），原因写 because 后面的名词。',
        explain:
          '一段材料连着出 3—4 题，句子过去了就抓不回来；写整句等于放弃后面两题。',
      },
      {
        level: '次重点',
        text: '数字题三类陷阱：多个数字连读（from four to six）、倍数与比较（twice as many as）、时间表达（half past five、ten to two）。',
        explain:
          'ten to two 是 1:50 而不是 2:10，half past five 是 5:30 而不是 5:15，这类误读几乎每年都有人踩。',
      },
      {
        level: '次重点',
        text: '否定与转折之后往往是答案：but、instead、I\'m afraid、actually 之后的句子常推翻前面的信息。',
        explain:
          'Two, I\'m afraid. 否定了学生问的 three books；听到这几个词要立刻把注意力提起来。',
      },
      {
        level: '了解',
        text: '播放与作答次序：材料通常播放两遍，两遍之间的间隔很短，第一遍就要定答案，第二遍只做核对。',
      },
    ],
    scripts: [
      {
        title: '听选材料一：科学展的安排（长对话，约 150 词）',
        text: "W: Hi, Peter. Are you coming to the Science Fair this Saturday?\nM: I'd love to, but I have a football match in the morning. When does the fair start?\nW: At two o'clock in the afternoon, in the school hall. It finishes at five.\nM: That works. What do we need to bring?\nW: Nothing much — just a notebook if you want to take notes. All the models are made by students.\nM: Nice. How many groups are taking part this year?\nW: Fifteen, twice as many as last year. Each group has five minutes to explain their model.\nM: Five minutes? That's short. Can we ask questions?\nW: Of course. You can ask one question after each group. And the best three groups will get book tokens.\nM: Sounds exciting. Where should I meet you?\nW: At the school gate at ten to two. Don't be late, or we won't get good seats.",
        cn: '女：嗨，彼得。这周六的科学展你来吗？\n男：我很想来，但上午有足球比赛。科学展几点开始？\n女：下午两点，在学校礼堂，五点结束。\n男：那可以。我们需要带什么吗？\n女：不用带什么——想记笔记的话带个本子就行。所有模型都是学生做的。\n男：不错。今年有多少组参加？\n女：十五组，是去年的两倍。每组用五分钟讲解自己的模型。\n男：五分钟？那很短。我们可以提问吗？\n女：当然。每组讲完可以问一个问题。最好的三组会得到购书券。\n男：听起来很有意思。我们在哪里见面？\n女：一点五十在校门口。别迟到，否则占不到好座位。',
        cues: [
          '听记提示：数字最密的一句是 Fifteen, twice as many as last year. Each group has five minutes——15、两倍、5 分钟三个数字连着来，听到就写在草稿纸上。',
          '重音：twice as many as last year 里 twice 与 last 重读；一听到 twice，马上想到「今年是去年的两倍」。',
          '语调：When does the fair start? 是特殊疑问句，用降调；Can we ask questions? 是一般疑问句，用升调，回答 Of course. 用降调表示肯定。',
          '连读与弱读：at two_o\'clock in the afternoon 中 at 弱读、two_o\'clock 连读；don\'t be late 里 t 在 b 前只做口形不送气；ten to two 连读，不要读成 ten, two。',
        ],
        tasks: [
          {
            id: 'eng-listen-2-s1-t1',
            type: 'choice',
            stem: '科学展周六几点开始？',
            options: ['At nine in the morning.', 'At two in the afternoon.', 'At three in the afternoon.', 'At five in the afternoon.'],
            answer: 'B',
            explanation:
              '女声说 At two o\'clock in the afternoon, in the school hall. It finishes at five.——两点开始、五点结束。At five 是结束时间，属于最典型的干扰项。',
            difficulty: 1,
            tags: ['时间信息', '听力细节'],
          },
          {
            id: 'eng-listen-2-s1-t2',
            type: 'choice',
            stem: '参加者需要带什么？',
            options: ['A notebook.', 'A student card.', 'Their own model.', 'Nothing at all.'],
            answer: 'A',
            explanation:
              '女声回答 Nothing much — just a notebook if you want to take notes.；模型全部由学生制作并展出，不需要自己带模型。',
            difficulty: 2,
            tags: ['听力细节'],
          },
          {
            id: 'eng-listen-2-s1-t3',
            type: 'choice',
            stem: '今年有多少组参加科学展？',
            options: ['Five.', 'Ten.', 'Fifteen.', 'Thirty.'],
            answer: 'C',
            explanation:
              '女声说 Fifteen, twice as many as last year.——今年十五组，是去年的两倍。Ten 是「去年的组数」被反推出来的干扰项，Five 是每组讲解的分钟数。',
            difficulty: 2,
            tags: ['数字计算', '同义替换'],
          },
          {
            id: 'eng-listen-2-s1-t4',
            type: 'choice',
            stem: '两人约在哪里见面？',
            options: ['At the school hall.', 'At the school gate.', 'In the library.', 'On the football field.'],
            answer: 'B',
            explanation:
              '女声说 At the school gate at ten to two.；学校礼堂是科学展的举办地点，足球场是男生上午比赛的地方，都是地点干扰项。',
            difficulty: 1,
            tags: ['地点信息'],
          },
        ],
      },
      {
        title: '听选材料二：图书馆开放通知（广播独白，约 130 词）',
        text: "Good morning, everyone. This is Radio Sunshine with news about our town library.\n\nFrom next Monday, the library will open at nine in the morning and close at eight in the evening. It used to close at six, so students will have two more hours to study.\n\nThe reading room on the second floor is now free for all middle school students. Just bring your student card; you do not need to pay anything. Free wifi is available, but please keep your phone silent.\n\nOn Saturday afternoons, a volunteer teacher will help with English reading. The class starts at three o'clock and lasts forty-five minutes. There are only twenty seats, so call eight six five four three two one to book your place.\n\nThat's all for today's news. Thank you for listening.",
        cn: '大家早上好，这里是阳光广播，为您播报镇图书馆的消息。\n从下周一开始，图书馆上午九点开馆，晚上八点闭馆。过去是六点闭馆，也就是说学生多了两个小时的学习时间。\n二楼的阅览室现在对全体中学生免费开放。只要带上学生证，不需要付任何费用。馆内有免费无线网络，但请把手机调成静音。\n周六下午，会有一位志愿老师辅导英语阅读。课程三点开始，时长四十五分钟。名额只有二十个，请拨打 8-6-5-4-3-2-1 预约。\n今天的新闻就到这里，感谢收听。',
        cues: [
          '听记提示：这一段的答案几乎全在数字上——nine、eight、six、two more hours、three o\'clock、forty-five minutes、twenty seats，边听边在草稿纸上竖着写成一列。',
          '重音：It used to close at six 中 used 轻读、six 重读；下一句 two more hours 里 more 重读，提示「比原来多两小时」，这是同义替换的常考点。',
          '连读：电话号码 eight six five four three two one 逐位连读，几乎连成一串；call_us、book_your_place 也连读。',
          '语调：but please keep your phone silent 是请求，用降调并稍放慢；broadcast 里的 please 之后的信息通常是规定类考点。',
        ],
        tasks: [
          {
            id: 'eng-listen-2-s2-t1',
            type: 'choice',
            stem: '图书馆新的闭馆时间是？',
            options: ['At six in the evening.', 'At eight in the evening.', 'At nine in the evening.', 'At nine in the morning.'],
            answer: 'B',
            explanation:
              'From next Monday, the library will open at nine in the morning and close at eight in the evening.——九点开馆、晚上八点闭馆。six 是过去的闭馆时间，nine 是开馆时间，两个数字都会在录音里出现。',
            difficulty: 2,
            tags: ['时间信息', '同义替换'],
          },
          {
            id: 'eng-listen-2-s2-t2',
            type: 'choice',
            stem: '二楼阅览室对中学生来说？',
            options: [
              'It is free with a student card.',
              'It costs a little money.',
              'It is open to high school students only.',
              'It needs a booking two days earlier.',
            ],
            answer: 'A',
            explanation:
              'the reading room on the second floor is now free for all middle school students. Just bring your student card; you do not need to pay anything.——凭学生证免费，不是「只对高中生开放」。',
            difficulty: 2,
            tags: ['听力细节'],
          },
          {
            id: 'eng-listen-2-s2-t3',
            type: 'choice',
            stem: '英语阅读课怎么报名？',
            options: [
              'By filling in a form online.',
              'By calling a phone number.',
              'By waiting in line at the front desk.',
              'By asking the volunteer teacher in class.',
            ],
            answer: 'B',
            explanation:
              'There are only twenty seats, so call eight six five four three two one to book your place.——打电话预约。听到 so 后面的内容常常就是考题答案。',
            difficulty: 1,
            tags: ['听力细节'],
          },
        ],
      },
    ],
    examTips: [
      '播放前的十几秒只做一件事：扫一遍 6 个小题的选项，圈出疑问词与数字（When、How many、two、fifteen），用它预测要听什么。',
      '草稿纸按题号竖着写，每题最多记 3—5 个字符（2:00、15、gate、200）；写多了必然漏掉下一句。',
      '听到 but、instead、I\'m afraid、actually 立刻提高注意力——转折之后的信息才是答案。',
      '数字题等听清第二个数字再落笔：录音常先给一个数字再给正确数字（Fifteen, twice as many as last year），听全再选。',
      '某题完全没听清就按常识或已记信息猜一个，不要在第二遍还卡在那题上，否则连丢两题。',
    ],
    questions: [
      {
        id: 'eng-listen-2-q1',
        type: 'choice',
        stem: '听选时选项里出现 At two o\'clock、At five、At ten to two、At nine 四个时间，最有效的做法是？',
        options: [
          '播放前只看题干，不看选项',
          '播放前圈出题干里的疑问词，播放时把听到的时间都记下来，再按谁问谁答确定答案',
          '先把四个时间全部排除掉',
          '听到第一个时间就选它',
        ],
        answer: 'B',
        explanation:
          '四个时间往往都在录音里出现过，只选「第一个听到的」几乎必错。把时间全记下来，再判断哪一个是问题所问的，才可靠。',
        difficulty: 2,
        tags: ['听记方法'],
      },
      {
        id: 'eng-listen-2-q2',
        type: 'choice',
        stem: '录音说 It used to close at six. 这句话的意思是？',
        options: [
          '图书馆现在六点关门',
          '图书馆过去六点关门，现在不是了',
          '图书馆从不在六点关门',
          '图书馆六点开门',
        ],
        answer: 'B',
        explanation:
          'used to do 表示「过去常常如此、现在已不再如此」。这句话是时间信息类考点里最常见的表达，答错往往不是听不懂词，而是不熟这个结构。',
        difficulty: 2,
        tags: ['同义替换', '句型理解'],
      },
      {
        id: 'eng-listen-2-q3',
        type: 'choice',
        stem: '录音中出现 half past four，对应的时间是？',
        options: ['4:30', '5:30', '4:15', '3:30'],
        answer: 'A',
        explanation:
          'half past four 是「四点过了半小时」即 4:30；quarter past four 才是 4:15，five thirty 是 5:30，three thirty 是 3:30。',
        difficulty: 1,
        tags: ['时间表达'],
      },
      {
        id: 'eng-listen-2-q4',
        type: 'choice',
        stem: '录音说 Each lesson lasts forty-five minutes. 若题目问 How long does each lesson last?，正确选项是？',
        options: ['Forty-five minutes.', 'At three o\'clock.', 'Twenty minutes.', 'One hour.'],
        answer: 'A',
        explanation:
          'lasts 后面跟的是时长；at three o\'clock 是开始时间（starts at three o\'clock），twenty 是座位数，one hour 是常见干扰项。',
        difficulty: 2,
        tags: ['听力细节', '时长'],
      },
      {
        id: 'eng-listen-2-q5',
        type: 'choice',
        stem: '听到 Two, I\'m afraid. 说明说话人？',
        options: [
          '同意对方说的数字',
          '委婉地否定对方说的数字，并给出正确数字',
          '在为某件事道歉',
          '没有听清对方的问题',
        ],
        answer: 'B',
        explanation:
          'I\'m afraid 用来礼貌地纠正或表示遗憾。这里学生问 three books，实际只能借两本，所以听到 afraid、sorry 这类词要立刻准备接收「被修正后的信息」。',
        difficulty: 3,
        tags: ['否定信息', '同义替换'],
      },
      {
        id: 'eng-listen-2-q6',
        type: 'fill',
        stem: '把听到的数字 forty-five 写成阿拉伯数字：____',
        answer: '45',
        explanation:
          '英语听力里的数字一般要求写阿拉伯数字。注意 forty 不要拼成 fourty（常见拼写错误），fourteen 与 forty 的读音也要分清。',
        difficulty: 1,
        tags: ['数字听写'],
      },
      {
        id: 'eng-listen-2-q7',
        type: 'short',
        stem: '第一遍录音来不及看完所有选项，请写出你的应对顺序。',
        answer:
          '第一遍以「听 + 速记」为主：跟着题干听关键词，把听到的时间、数字、地点快速写在草稿纸上，不要求做完题；两遍录音之间的空隙立刻扫选项，把速记信息与选项对照，先定下有把握的题；第二遍播放时只核对不确定的两题。',
        rubric: [
          '第一遍以听和速记为主，不追求做完',
          '利用两遍之间的空隙读选项',
          '第二遍只核对不确定的题，不重听全部',
        ],
        explanation:
          '听选的时间被录音播放节奏控制，主动权只在「读题空隙」和「速记」上；把这两处用好，比试图听清每一个词更有效。',
        difficulty: 2,
        tags: ['听记方法', '临场策略'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 3. 信息获取 第二节 回答（4 小题 4 分）                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-3',
    grade: 'all',
    unit: '信息获取',
    title: '信息获取·回答（4 小题 4 分）与短答规范',
    enTitle: 'Answering Questions: Short Answers',
    summary:
      '回答 4 小题 4 分，每题 1 分：听到问题后用英语简短作答，答到要点就得分，追求书面长句反而容易在时态与介词上出错。',
    points: [
      {
        level: '重点',
        text: '短答的得分单位是「要点」而不是「句子」：4 小题各 1 分，答出一个正确要点即得 1 分。',
        explain:
          '问 When is the sale? 答 Next Friday. 就能得分；答成一句长句反而多出出错机会。短答要短，但必须完整到能让人听懂。',
      },
      {
        level: '重点',
        text: '疑问词决定答法：When 问时间、Where 问地点、Who 问人、Why 用 because 接原因、How much 问价格、How long 问时长、How often 问频次。',
        explain:
          '把疑问词与答句开头配成条件反射：听到 How long 就说 It lasts ...，听到 How often 就说 twice a week。答题时先想疑问词，再想内容。',
      },
      {
        level: '重点',
        text: '人称、时态与助动词必须与问题一致：问 Does he ...? 答 Yes, he does.；问 Did you ...? 答 Yes, I did.。',
        explain:
          '短答最常见的失分不是内容，而是答句与问句不匹配：问 did 答 now、问 has 答 have，评分会判为「未能回答」。',
      },
      {
        level: '次重点',
        text: '答案优先用录音里的原词，不要临时换高级表达。',
        explain:
          '录音说 outside the dining hall，就答 Outside the dining hall；换成 near the place where we eat 既不清晰，也容易说错。',
      },
      {
        level: '次重点',
        text: '数字、价格与时间要把单位说完整：eighty yuan、half past six、ninety minutes。',
        explain:
          '价格与时间是听写结合的考点，漏掉单位（yuan、minutes）或读错数字（forty 与 fourteen）都会丢分。',
      },
      {
        level: '了解',
        text: '每题作答时间通常只有几秒（以考场屏幕提示为准），听到问题就要开口，不要先在心里组织完整句子的语法。',
      },
    ],
    scripts: [
      {
        title: '问答材料一：书市准备（对话，约 120 词）',
        text: "W: Hi, Jack. Did you finish the poster for the book sale?\nM: Almost. I still need to add the price list. Everything will be fifty percent off.\nW: Fifty percent? That's great. When is the sale?\nM: Next Friday, from four to six in the afternoon, outside the dining hall.\nW: How long will it last? Only two hours?\nM: Two hours is enough. We sold almost all the books last time in ninety minutes.\nW: True. Who will help me at the table?\nM: Lily and Tom. They are free after four.\nW: Good. Should I bring some change?\nM: Yes, please. Many students pay in cash, and we need coins for change.\nW: No problem. I'll come half an hour earlier to help you set up.",
        cn: '女：嗨，杰克。书市的海报你做完了吗？\n男：差不多了。我还得加上价目表。所有书都打五折。\n女：五折？太好了。书市什么时候？\n男：下周五下午四点到六点，在饭堂外面。\n女：要办多久？只有两个小时？\n男：两个小时够了。上次我们九十分钟就把书几乎卖完了。\n女：确实。谁会来帮我看摊？\n男：莉莉和汤姆，他们四点后有空。\n女：好。我需要带些零钱吗？\n男：需要，很多同学用现金付款，我们找零要用硬币。\n女：没问题。我会提前半小时来帮你布置。',
        cues: [
          '短答规范：这 4 题每题 1 分，答到一个要点就得分，不必写整段——用最短的完整句，如 Next Friday. / Outside the dining hall.。',
          '重音：fifty percent、four to six、ninety minutes 重读；听到 fifty 与 ninety 这类数字要立刻写在草稿纸上。',
          '语调：Did you finish the poster?、Should I bring some change? 是一般疑问句，用升调；回答 Almost. / Yes, please. 用降调，表示信息确定。',
          '连读与弱读：half_an_hour、set_up、next_Friday 连读；of 在 fifty percent off 中弱读，off 要读清楚（打五折的关键词）。',
        ],
        tasks: [
          {
            id: 'eng-listen-3-s1-t1',
            type: 'short',
            stem: 'When is the book sale?',
            answer: 'Next Friday, from four to six in the afternoon.',
            rubric: [
              '答出 Friday 或 next Friday',
              '答出四点到六点这一时间段（afternoon 也可）',
              '句子简短完整即可，不必写完整长句',
            ],
            explanation:
              '录音原句是 Next Friday, from four to six in the afternoon, outside the dining hall.；只答 Next Friday 也能得分，补上时间段更稳。',
            difficulty: 2,
            tags: ['短答规范', '时间信息'],
          },
          {
            id: 'eng-listen-3-s1-t2',
            type: 'short',
            stem: 'Where will the book sale be held?',
            answer: 'Outside the dining hall.',
            rubric: [
              '答出 dining hall',
              '用介词短语 outside ... 或完整句 It will be held outside the dining hall.',
            ],
            explanation:
              '注意是 outside（在……外面）而不是 in；介词用错会把地点信息说反，这属于典型的「听懂了却答错」。',
            difficulty: 1,
            tags: ['短答规范', '地点信息'],
          },
          {
            id: 'eng-listen-3-s1-t3',
            type: 'short',
            stem: 'What does Jack ask Mary to bring?',
            answer: 'Some change, or coins for change.',
            rubric: [
              '答出 change 或 coins',
              '若只答 money 只能算部分正确（钱不等于零钱）',
            ],
            explanation:
              '原文 Should I bring some change? Yes, please ... we need coins for change.；change 是「零钱」，与 money 不是同一个信息点。',
            difficulty: 2,
            tags: ['短答规范', '听力细节'],
          },
          {
            id: 'eng-listen-3-s1-t4',
            type: 'short',
            stem: 'How did the sale go last time?',
            answer: 'Almost all the books were sold in ninety minutes.',
            rubric: [
              '答出 sold almost all the books 或 ninety minutes 其中之一',
              '动词用一般过去时',
              '人称与问题所问的内容一致',
            ],
            explanation:
              '录音是 We sold almost all the books last time in ninety minutes.；答题时保留过去时，是短答里最容易被忽略的语法分。',
            difficulty: 3,
            tags: ['短答规范', '时态一致'],
          },
        ],
      },
      {
        title: '问答材料二：体育中心会员说明（独白，约 120 词）',
        text: "Welcome to North Star Sports Centre. Here is some information for new members.\n\nThe centre opens at seven in the morning every day and closes at ten at night. Students under sixteen must come with an adult after eight in the evening.\n\nA monthly card costs one hundred and twenty yuan. If you are a middle school student, you can get it for eighty yuan — just show your student card at the front desk.\n\nSwimming lessons are on Wednesday and Sunday evenings. Each lesson lasts one hour and starts at half past six. Please arrive fifteen minutes early, because the coach will check your name before you enter the pool.\n\nFor more information, call us or visit our website.",
        cn: '欢迎来到北极星体育中心，这里是为新会员准备的一些信息。\n本中心每天早上七点开门，晚上十点关门。十六岁以下的学生晚上八点以后必须由成人陪同前来。\n月卡一百二十元。如果你是中学生，只要在前台出示学生证，八十元就可以办到。\n游泳课在周三和周日晚上，每节课一小时，六点半开始。请提前十五分钟到场，因为教练会在你下水前核对姓名。\n更多信息请致电或访问我们的网站。',
        cues: [
          '短答规范：价格与时间类问题只需答数字加单位，如 Eighty yuan. / At half past six.，把单位说清楚比句子长短重要。',
          '重音：one hundred and twenty 与 eighty 形成对比重读；听到 if you are a middle school student 就要意识到后面是「折扣价」，这是常考的同义替换。',
          '语调：请特别注意 must come with an adult 用降调，语气明确，属于「规定」类信息，通常直接出题。',
          '连读与弱读：half_past_six、fifteen_minutes_early、at_the_front_desk 连读；and 在 one hundred and twenty 中弱读成 /ən/。',
        ],
        tasks: [
          {
            id: 'eng-listen-3-s2-t1',
            type: 'short',
            stem: 'How much does a middle school student pay for a monthly card?',
            answer: 'Eighty yuan.',
            rubric: ['答出 eighty', '带上单位 yuan'],
            explanation:
              '录音说 you can get it for eighty yuan；一百二十元是普通月卡价格，是典型的干扰信息，答错多半是没有抓住 if 条件句。',
            difficulty: 2,
            tags: ['短答规范', '价格信息'],
          },
          {
            id: 'eng-listen-3-s2-t2',
            type: 'short',
            stem: 'When do the swimming lessons start?',
            answer: 'At half past six in the evening, on Wednesday and Sunday.',
            rubric: [
              '答出 half past six 或 6:30',
              '可补充 on Wednesday and Sunday evenings',
              '不要与 arrive fifteen minutes early 混淆',
            ],
            explanation:
              '原文 Each lesson lasts one hour and starts at half past six.；提前十五分钟到场是另一种时间信息，两类时间混答是常见失分点。',
            difficulty: 2,
            tags: ['短答规范', '时间信息'],
          },
          {
            id: 'eng-listen-3-s2-t3',
            type: 'short',
            stem: 'What must students under sixteen do after eight in the evening?',
            answer: 'They must come with an adult.',
            rubric: [
              '答出 with an adult',
              '主语用 they 或 students under sixteen 都可以',
              '保留 must 或 have to，表示这是规定',
            ],
            explanation:
              '原文 Students under sixteen must come with an adult after eight in the evening.；答句把主语换成 they，人称与问题保持一致即可。',
            difficulty: 2,
            tags: ['短答规范', '规定信息'],
          },
        ],
      },
    ],
    examTips: [
      '听到问题的第一个词（When、Where、How much）就先定答句开头，边听边想「我第一句说什么」。',
      '答句控制在 3—8 个词：主语 + 谓语 + 要点，如 It lasts two hours.；不要为了显得高级加上没把握的从句。',
      '问句里的人称与时态直接搬进答句（Did you → I did；Does he → he does），这是最省事的正确做法。',
      '数字、价格、时间一定带上单位：eighty yuan、half past six、ninety minutes，漏单位是最常见的丢分点。',
      '答完立刻停下，不要补充说明、不要重复上一题；多说一句就多一次出错的机会。',
    ],
    questions: [
      {
        id: 'eng-listen-3-q1',
        type: 'choice',
        stem: '问题 When is the book sale? 的最佳短答是？',
        options: [
          'Outside the dining hall.',
          'Next Friday, from four to six.',
          'Fifty percent off.',
          'Two hours.',
        ],
        answer: 'B',
        explanation:
          'When 问时间，答句必须是时间信息。其余三项分别回答了地点、折扣与时长，属于「答非所问」的典型错误，内容听得再准也拿不到分。',
        difficulty: 2,
        tags: ['短答规范', '疑问词对应'],
      },
      {
        id: 'eng-listen-3-q2',
        type: 'choice',
        stem: '问题 How long does the sale last? 应与哪一个答句搭配？',
        options: ['It lasts two hours.', 'At four o\'clock.', 'Outside the dining hall.', 'Twice a week.'],
        answer: 'A',
        explanation:
          'How long 问时长，答 It lasts + 时间；At four o\'clock 回答的是 When，Twice a week 回答的是 How often，都属于疑问词答法混淆。',
        difficulty: 1,
        tags: ['短答规范', '疑问词对应'],
      },
      {
        id: 'eng-listen-3-q3',
        type: 'choice',
        stem: '短答时最应该避免的做法是？',
        options: [
          '用录音里的原词作答',
          '开口前先在心里组织一段完整的长句',
          '只说一个正确要点',
          '用完整但简短的句子',
        ],
        answer: 'B',
        explanation:
          '作答时间只有几秒，先组织长句会错过录音窗口；短答以「要点正确」得分，简短直接最稳。',
        difficulty: 2,
        tags: ['短答规范', '临场策略'],
      },
      {
        id: 'eng-listen-3-q4',
        type: 'choice',
        stem: '问题 Why do you think students should do more sports? 的答句结构，最好的是？',
        options: [
          'Because sports keep us healthy, and they also help us think better.',
          'Yes, I think so.',
          'Sports are good.',
          'I don\'t know.',
        ],
        answer: 'A',
        explanation:
          'Why 类问题要用 because 引出理由，先给主要理由，再用 and / also 补一个；Yes, I think so. 无法回答 wh- 问题，Sports are good. 太空泛。',
        difficulty: 2,
        tags: ['短答规范', '原因表达'],
      },
      {
        id: 'eng-listen-3-q5',
        type: 'fill',
        stem: '把答句补全：问 How many groups are taking part this year? 答 Fifteen ____.（填一个词）',
        answer: 'groups',
        explanation:
          '完整短答是 Fifteen groups.；补上名词让答句更明确，也便于评分确认所指。名词复数要与问题里的 groups 保持一致。',
        difficulty: 1,
        tags: ['短答规范', '名词复数'],
      },
      {
        id: 'eng-listen-3-q6',
        type: 'short',
        stem: '你没听清问题里的数字，但大致听懂了话题。请写出你的补救思路。',
        answer:
          '先按听到的关键词给出最可能的信息，例如 It is about forty yuan. 这类句子开口作答，不要沉默、不要用中文；如果只抓住了话题词（library、lesson、price），就用它组成一个最短的英语句子（如 It costs twenty yuan.）。沉默一定不得分，开口还有可能得分。',
        rubric: [
          '不沉默、不放弃作答',
          '用听到的关键词组织出英语短句',
          '全程不使用中文',
        ],
        explanation:
          '回答题按「是否答到要点」给分，开口说一个合理的英语答案，即使数字不准也可能拿到部分要点；沉默则必然 0 分。',
        difficulty: 3,
        tags: ['临场策略', '短答规范'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 4. 角色扮演 第一节 复述（1 小题 7 分）                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-4',
    grade: 'all',
    unit: '角色扮演',
    title: '角色扮演·复述（7 分）：从听记到成段复述',
    enTitle: 'Role Play: Retelling a Story',
    summary:
      '复述 1 小题 7 分，是听说考试里分值第二高的题：听一段约 150 词的材料后，按「时间地点—人物—起因—经过—结果感受」五栏把主线讲完整，比逐句背原文更容易拿分。',
    points: [
      {
        level: '重点',
        text: '复述五步提纲：时间地点 → 人物 → 起因 → 经过（两个细节）→ 结果与感受。',
        explain:
          '听材料时按这五栏在草稿纸上记关键词，五栏都有内容，复述就不容易中途断掉；缺「结果与感受」通常进不了高分段。',
      },
      {
        level: '重点',
        text: '保主线、删细节：原材料里的对话、形容词、次要人物都可以省；时间、地点、关键事件、结果必须留。',
        explain:
          '复述按内容点给分，说 8—10 句覆盖要点，比说 20 句都是细节更划算。只抓细节、漏掉结果，是觉得自己「说得挺多」却分数低的主要原因。',
      },
      {
        level: '重点',
        text: '用连接词串成段落：First / At first / Then / In the middle of / In the end / From this experience ...',
        explain:
          '连接词既提示评分者「这里是一个内容点」，也让自己的思路不断线；没有连接词的复述听起来像一堆互不相干的散句。',
      },
      {
        level: '次重点',
        text: '人称与时态与原材料保持一致：材料用第一人称 I，就用 I 复述；材料讲过去的事，全篇用一般过去时。',
        explain:
          '复述中途改人称、改时态是最常见的失分方式，例如前面说 we cooked、后面变成 we cook，听起来像换了个人在讲另一件事。',
      },
      {
        level: '次重点',
        text: '准备时间（通常约 30 秒到 1 分钟）只做三件事：看提纲、补两个关键词、在心里说一遍开头句。',
        explain:
          '准备时间用来写新句子是浪费；开头句定了，后面往往能顺着说出来。',
      },
      {
        level: '次重点',
        text: '卡壳救场句：Let me put it another way. / What I mean is ... / Anyway, in the end ...',
        explain:
          '复述中沉默三秒以上会明显扣流利度；用一句过渡语给自己两秒缓冲，再回到主线。',
      },
      {
        level: '了解',
        text: '复述评分里，完整度与流利度的优先级高于用词高级：用简单句把要点说全，比用高级词但漏掉一半内容得分高。',
      },
    ],
    scripts: [
      {
        title: '复述材料：一次厨艺比赛（原文，约 140 词）',
        text: "Last month our class took part in a cooking competition at the school festival. Our teacher divided us into six groups, and each group had to cook two dishes in ninety minutes.\n\nAt first, we argued about the menu. Anna wanted noodles, but Ben thought dumplings would be easier. In the end we chose noodles with tomatoes and eggs, because we had practised it at home.\n\nHalfway through, we found that we had forgotten the salt. I ran to the small shop near the gate and came back in four minutes. When the judges tasted our noodles, they smiled and said the soup was fresh and light.\n\nWe did not win first prize; that went to Class Two. But we got the prize for best teamwork. Now I know that planning together matters more than cooking fast.",
        cn: '上个月我们班在学校文化节上参加了一场厨艺比赛。老师把我们分成六组，每组要在九十分钟内做两道菜。\n一开始，我们为菜单争论起来。安娜想做面条，本觉得饺子更容易。最后我们选了西红柿鸡蛋面，因为我们在家里练过。\n做到一半时，我们发现忘了带盐。我跑到校门口附近的小店，四分钟就回来了。评委尝了我们的面，笑着说汤很鲜、很清淡。\n我们没有拿到一等奖，一等奖被二班拿走了。但我们得了最佳团队奖。现在我知道，一起计划比做得快更重要。',
        cues: [
          '复述提纲（听完按这五栏记）：时间地点——last month, school festival；人物——our class, six groups, Anna, Ben, the judges；起因——cook two dishes in ninety minutes；经过——argued about the menu / forgot the salt / ran to buy it；结果感受——missed first prize, won the prize for best teamwork, teamwork matters more。',
          '重音：Halfway through、forgotten the salt、four minutes 要重读并速记——这几处是「经过」部分的细节分。',
          '语调：We did not win first prize; that went to Class Two. 分号处稍停，前半句降调；But we got the prize for best teamwork. 里 but 之后重读并降调收尾，形成转折对比。',
          '连读与弱读：took_part_in、Halfway_through、more_than 连读；had to 里的 to 弱读为 /tə/，不要读成两个重音。',
        ],
        tasks: [
          {
            id: 'eng-listen-4-s1-t1',
            type: 'short',
            stem: '用 3—5 句英语复述这段材料的主要情节。',
            answer:
              'Last month our class took part in a cooking competition at the school festival. Each group had to cook two dishes in ninety minutes. At first we argued about the menu, and in the middle of the cooking we found that we had forgotten the salt, so I ran to a shop near the gate. We did not win first prize, but we got the prize for best teamwork.',
            rubric: [
              '说清时间与事件（cooking competition at the school festival）',
              '提到规则中的关键数字（six groups 或 two dishes in ninety minutes）',
              '提到经过中的至少一个细节（争论菜单或忘带盐）',
              '说到结果（没拿一等奖、得了最佳团队奖）',
              '全篇用一般过去时，句子之间用连接词衔接',
            ],
            explanation:
              '7 分的复述按内容点给分：时间地点、起因、经过、结果四栏齐全，语言简单也能进高分段；漏掉结果通常丢一个内容点。',
            difficulty: 3,
            tags: ['复述', '内容点'],
          },
          {
            id: 'eng-listen-4-s1-t2',
            type: 'short',
            stem: '这段材料想告诉我们的道理是什么？用一句英语回答。',
            answer:
              'Planning together matters more than cooking fast, so teamwork is the most important thing.',
            rubric: [
              '点出 teamwork 或 working together',
              '与材料结尾 planning together matters more than cooking fast 意思一致',
            ],
            explanation:
              '材料最后一句就是主旨句；主旨类题目用它的同义说法作答即可，不需要另找观点。',
            difficulty: 2,
            tags: ['复述', '主旨'],
          },
          {
            id: 'eng-listen-4-s1-t3',
            type: 'choice',
            stem: '复述这段材料时，人称和时态应该怎么选？',
            options: [
              '用第三人称 he，用一般现在时',
              '用第一人称 I 或 we，用一般过去时',
              '用第二人称 you，用现在完成时',
              '人称随意，时态用一般现在时',
            ],
            answer: 'B',
            explanation:
              '原材料是第一人称、讲过去发生的事；复述保持 I / we 加一般过去时，最省力也最不容易出错。中途改人称或时态会被判为内容混乱。',
            difficulty: 2,
            tags: ['复述', '人称时态'],
          },
          {
            id: 'eng-listen-4-s1-t4',
            type: 'choice',
            stem: '复述时忘了某个次要细节（例如那家小店的名字），最恰当的处理是？',
            options: [
              '停下来想，直到想起来为止',
              '说 a shop near the gate 一带而过，继续讲主线',
              '把整个「经过」部分跳过',
              '用中文把这个细节补充出来',
            ],
            answer: 'B',
            explanation:
              '复述扣的是内容点与流利度：次要细节用模糊表达带过即可；长时间停顿会扣流利度，用中文作答则直接不得分。',
            difficulty: 2,
            tags: ['复述', '临场策略'],
          },
        ],
      },
      {
        title: '示范复述：同一材料的成段复述（约 120 词）',
        text: "Last month our class joined a cooking competition at the school festival. Our teacher put us into six groups, and every group had to cook two dishes in ninety minutes.\n\nAt the beginning, we could not agree on the menu. Anna wanted noodles while Ben preferred dumplings, so we finally chose tomatoes and eggs with noodles because we had tried it before.\n\nIn the middle of the cooking, we discovered that we had no salt, so I hurried to a shop near the gate. Luckily, the judges liked our soup and said it was fresh and light.\n\nWe missed first prize, but we won the prize for best teamwork. From this experience I learned that working together matters more than working fast.",
        cn: '上个月我们班参加了学校文化节的厨艺比赛。老师把我们分成六组，每组要在九十分钟内做两道菜。\n开始的时候，我们对菜单意见不一致。安娜想做面条，本更想包饺子，最后我们选了西红柿鸡蛋面，因为我们以前试过。\n做到一半，我们发现没有盐了，于是我赶紧跑到校门口附近的小店。幸运的是，评委很喜欢我们的汤，说汤很鲜、很清淡。\n我们没拿到一等奖，但得了最佳团队奖。这次经历让我明白，一起合作比做得快更重要。',
        cues: [
          '复述开头的三种写法：Last month our class joined ... / Our class took part in ... / I want to tell you about a cooking competition ...；选一个自己说得顺的，不要临场拼长句。',
          '示范复述每一句都对应一个提纲点：第 1 段是时间地点与人物，第 2 段是起因，第 3 段是经过，第 4 段是结果与感受；听完数一数自己漏了哪一栏。',
          '重音与停顿：We missed first prize, 稍停并轻微上提，but we won the prize for best teamwork. 用降调重读收尾——转折与结论的语调对比是复述的听觉亮点。',
        ],
        tasks: [
          {
            id: 'eng-listen-4-s2-t1',
            type: 'choice',
            stem: '示范复述与原材料相比，主要做了什么改动？',
            options: [
              '增加了新的情节与人物',
              '简化细节、保留主线，并用连接词把要点串起来',
              '把时态改成了一般现在时',
              '把第一人称改成了第三人称',
            ],
            answer: 'B',
            explanation:
              '示范复述保留了时间、起因、经过、结果与感受，省掉了对话和次要形容词，并加上 at the beginning、in the middle of 这类连接词，符合复述的评分要求。',
            difficulty: 2,
            tags: ['复述', '材料处理'],
          },
          {
            id: 'eng-listen-4-s2-t2',
            type: 'choice',
            stem: '示范复述最后一句用 From this experience I learned that ... 的作用是？',
            options: [
              '补充一个新事件',
              '为复述收尾并点出启示，覆盖「结果与感受」这一栏',
              '重复开头已经说过的信息',
              '拖延作答时间',
            ],
            answer: 'B',
            explanation:
              '复述结尾必须有收束句；点出启示既补齐了提纲第五栏，也让整段听起来完整，是进入高分档的关键一句。',
            difficulty: 2,
            tags: ['复述', '结构完整'],
          },
          {
            id: 'eng-listen-4-s2-t3',
            type: 'short',
            stem: '用 2—3 句英语复述示范文本里「忘了盐」那一段。',
            answer:
              'In the middle of the cooking, we discovered that we had no salt, so I hurried to a shop near the gate. Luckily, the judges liked our soup and said it was fresh and light.',
            rubric: [
              '提到 forgot the salt 或 had no salt 这一起因',
              '提到去附近小店买盐（hurried to a shop near the gate）',
              '提到评委的评价（liked the soup / fresh and light）',
            ],
            explanation:
              '复述单独的段落时，仍按「起因—经过—结果」三句来说，句子越简单越不容易出错。',
            difficulty: 3,
            tags: ['复述', '段落复述'],
          },
        ],
      },
    ],
    examTips: [
      '听材料时不写句子，只按五栏写关键词：两个时间词、两个人名、两个动作、一个结果，一般 15 个字符以内就能撑起整段复述。',
      '准备时间先在心里说一遍开头句（Last month our class ...），开口第一句顺了，后面不容易卡。',
      '宁可用简单句，也不用背不准的长句：We missed first prize. But we won the prize for best teamwork. 两句简单句比一句记错的复杂句得分高。',
      '每说完一个要点就接一个连接词（Then / After that / In the end），用语音告诉评分者「我讲到下一步了」。',
      '结尾一定要有收束句（From this experience I learned that ...），否则结构不完整，通常少一个内容点。',
    ],
    questions: [
      {
        id: 'eng-listen-4-q1',
        type: 'choice',
        stem: '复述评分里的「完整度」主要指？',
        options: [
          '语速是否够快',
          '是否覆盖了原材料的主要信息点',
          '发音是否像英语母语者',
          '是否用了高级词汇',
        ],
        answer: 'B',
        explanation:
          '完整度看要点覆盖面；发音与用词分别属于语音语调和语言质量。漏要点是最容易避免、也最容易被忽视的失分。',
        difficulty: 1,
        tags: ['复述', '评分标准'],
      },
      {
        id: 'eng-listen-4-q2',
        type: 'choice',
        stem: '复述一段讲述过去经历的材料，时态通常用？',
        options: ['一般现在时', '一般过去时', '现在完成时', '一般将来时'],
        answer: 'B',
        explanation:
          '听说考试的材料多为一次已经发生的事情，复述全篇用一般过去时；中途换时态是复述最常见的扣分点之一。',
        difficulty: 1,
        tags: ['复述', '时态一致'],
      },
      {
        id: 'eng-listen-4-q3',
        type: 'choice',
        stem: '下列哪一句最适合放在复述的「经过」部分？',
        options: [
          'In the end, we won a prize.',
          'In the middle of the cooking, we found we had no salt.',
          'Last month our class joined a competition.',
          'From this experience I learned a lot.',
        ],
        answer: 'B',
        explanation:
          '四句分别对应结果、经过、开头与感受；In the middle of ...、Then、After that 放在「经过」，In the end 放在结果，From this experience 放在结尾。',
        difficulty: 2,
        tags: ['复述', '连接词'],
      },
      {
        id: 'eng-listen-4-q4',
        type: 'choice',
        stem: '复述中途发现自己把一个人名说错了，最好的处理是？',
        options: [
          '停下来从头重新说一遍',
          '用 I mean Anna. 立即纠正，然后继续往下说',
          '不纠正，直接继续',
          '改用中文说明这个人是谁',
        ],
        answer: 'B',
        explanation:
          '用 I mean ... 快速修正，既保住流利度又纠正了信息；从头重说会浪费大量时间，还造成内容重复，通常扣更多分。',
        difficulty: 2,
        tags: ['复述', '临场策略'],
      },
      {
        id: 'eng-listen-4-q5',
        type: 'short',
        stem: '请为一段讲述「一次社区志愿活动」的材料写出复述提纲（五栏）。',
        answer:
          '时间地点：last Saturday, at the community centre；人物：my classmates and I, an old gardener；起因：help clean the small garden before winter；经过：we picked up rubbish, cut dry branches, and planted twenty small trees；结果感受：finished in three hours, the garden looked new, I felt proud of our work。',
        rubric: [
          '五栏齐全（时间地点、人物、起因、经过、结果感受）',
          '每栏给出可直接说出口的英文关键词或短语',
          '经过部分至少两个动作细节',
          '结果感受与前面的情节呼应',
        ],
        explanation:
          '提纲是复述的骨架。练习时先写提纲再开口，攒下十几个常见情景的提纲，换一段新材料也能套得上。',
        difficulty: 3,
        tags: ['复述', '提纲'],
      },
      {
        id: 'eng-listen-4-q6',
        type: 'fill',
        stem: '材料中表示「半途中、进行到一半时」的英文短语是 Halfway ____。',
        answer: 'through',
        explanation:
          'Halfway through（半途中）是叙述「经过」部分的高频短语，注意不要写成 Halfway in 或 Half way through。',
        difficulty: 1,
        tags: ['复述', '短语'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 5. 角色扮演 第二节 询问 + 第三节 回答（各 1 分）                    */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-5',
    grade: 'all',
    unit: '角色扮演',
    title: '角色扮演·询问与回答（各 1 分）：礼貌问句与对应作答',
    enTitle: 'Role Play: Asking and Answering',
    summary:
      '询问 1 分、回答 1 分，考的是把情景里的信息问出来、把听到的问题答回去：问句用礼貌结构加陈述语序，答句问什么答什么。',
    points: [
      {
        level: '重点',
        text: '询问题的得分点是「问对信息点 + 语法正确」（疑问语序、时态、冠词）；问错信息点（题目要问时间却问价格）直接不得分。',
        explain:
          '情景通常给中文提示与表格信息，先把提示里的名词圈出来（时间、地点、价格、方式、联系人），再套句型，信息点就不会问偏。',
      },
      {
        level: '重点',
        text: '委婉问句的语序：Could you tell me + 陈述语序（where I can ...、when the course starts），绝不能写成 where can I。',
        explain:
          '这是询问题最常见的语法错：主句是 Could you tell me，从句就是陈述语序，主语在前、动词在后，不借助助动词倒装。',
      },
      {
        level: '重点',
        text: '答句与问句要匹配：Yes/No 问句先答 Yes 或 No 再补信息；wh- 问句直接给对应信息，人称与时态跟着问题走。',
        explain:
          '问 How often 答 Twice a week.，问 How long 答 For two hours.；答句与疑问词不匹配是回答题最主要的失分点。',
      },
      {
        level: '次重点',
        text: '常用礼貌句型：Could you tell me ...? / May I ask ...? / Do you know ...? / Is it possible to ...? / Would you mind telling me ...?',
        explain:
          '比直接问 When does it start? 更稳妥，也更显水平；但无论用哪个框架，宾语从句的语序都必须正确。',
      },
      {
        level: '次重点',
        text: '中文提示要逐条落实：提示写「课程开始时间」就只能问开始时间，写「报名方式」就要问 how to sign up 或 where to sign up。',
        explain:
          '漏掉提示里的限定信息（例如「学生票价」而不是「票价」）会被判为信息点不全，即使句子语法完全正确也拿不到分。',
      },
      {
        level: '了解',
        text: '礼节性收尾：Thanks for your time. / That\'s very helpful. Thank you. 一句自然的收尾能让整段更完整，也给自己一个结束信号。',
      },
    ],
    collocations: [
      {
        phrase: 'Could you tell me when the course starts?',
        cn: '你能告诉我课程什么时候开始吗？',
        note: '问时间。Could 比 Can 更礼貌，后面接陈述语序 the course starts，不能写成 when does the course start。',
      },
      {
        phrase: 'May I ask how much the ticket costs?',
        cn: '请问票价是多少？',
        note: '问价格。how much 后接名词再加动词，比 How much is the ticket? 更正式，也更适合角色扮演。',
      },
      {
        phrase: 'Do you know where I can buy a swimming cap?',
        cn: '你知道我在哪里能买到泳帽吗？',
        note: '问地点。从句用陈述语序 where I can buy，写成 where can I buy 就是典型语法错。',
      },
      {
        phrase: 'Could you tell me how long the visit lasts?',
        cn: '你能告诉我参观持续多长时间吗？',
        note: '问时长。答句常用 It lasts two hours. 或 For two hours.，与 How long 配套。',
      },
      {
        phrase: 'I\'d like to know whether the museum is open on Monday.',
        cn: '我想知道博物馆周一是否开放。',
        note: '问「是否」。whether 引导的宾语从句在口语里比 if 更清楚，语序仍是 the museum is。',
      },
      {
        phrase: 'Would you mind telling me what I should bring?',
        cn: '你能告诉我该带什么吗？',
        note: '问要求。也可以直接问 What do I need to bring?，但礼貌度略低，考场上推荐前者。',
      },
      {
        phrase: 'Is it possible to book a seat online?',
        cn: '可以在网上订座吗？',
        note: '问方式。Is it possible to ... 是问「能否、如何」的万能句型，答句常用 Yes, you can ...',
      },
      {
        phrase: 'What time shall we meet?',
        cn: '我们几点见面？',
        note: '问见面安排。shall we 用于提出建议，回答常用 Let\'s meet at the school gate.。',
      },
      {
        phrase: 'How can I get to the sports centre?',
        cn: '我到体育中心怎么走？',
        note: '问路线。答句常见 Go along this road and turn left at the second corner.。',
      },
      {
        phrase: 'Could you tell me if there is a discount for students?',
        cn: '请问学生有折扣吗？',
        note: '问优惠。if 引导宾语从句时仍用陈述语序 there is，不要写成 is there。',
      },
      {
        phrase: 'Whom should I contact if I have more questions?',
        cn: '如果我有更多问题，应该联系谁？',
        note: '问联系人。整个句子本身就是特殊疑问句，所以主句用 should I 的疑问语序，这一点与宾语从句不同。',
      },
      {
        phrase: 'Thanks for your time. That\'s very helpful.',
        cn: '谢谢您的时间，这很有帮助。',
        note: '礼貌收尾。问完以后补一句，整段听上去完整自然，也给评分者一个结束信号。',
      },
    ],
    mistakes: [
      {
        wrong: 'Could you tell me when does the course start?',
        right: 'Could you tell me when the course starts?',
        why: '宾语从句要用陈述语序：从句主语在前、谓语在后，不能借助 does 倒装。这是询问题最典型的语法错。',
      },
      {
        wrong: 'How much the ticket costs?',
        right: 'How much does the ticket cost?',
        why: '直接问句本身是特殊疑问句，要用助动词 does 并接动词原形 cost；只有嵌入 Could you tell me 之后才改用陈述语序。',
      },
      {
        wrong: 'It cost two hundred yuan for students.',
        right: 'It costs two hundred yuan for students.',
        why: '价格、规定这类信息用一般现在时；主语 It 是第三人称单数，动词要加 s。',
      },
      {
        wrong: 'Yes, I can\'t.',
        right: 'No, I can\'t.',
        why: '英语里 Yes 后面必须跟肯定、No 后面必须跟否定。中文的「是的，我不能」要译成 No, I can\'t.。',
      },
    ],
    scripts: [
      {
        title: '角色扮演材料一：电话询问游泳课（示范问答，约 115 词）',
        text: "Receptionist: Good morning. Sunshine Sports Club. How can I help you?\nYou: Good morning. Could you tell me when the swimming course starts?\nReceptionist: Sure. The beginners' course starts on the tenth of July and lasts three weeks.\nYou: Thank you. May I ask how much it costs?\nReceptionist: Two hundred yuan for students, and you need to bring your student card.\nYou: Do you know where I can buy a swimming cap?\nReceptionist: Yes — the shop next to the front desk sells them. They are twenty yuan each.\nYou: One more question, please. What time should I arrive on the first day?\nReceptionist: Please be here at half past eight, fifteen minutes before the class.\nYou: That's very helpful. Thank you very much.",
        cn: '前台：早上好，这里是阳光体育俱乐部，需要什么帮助？\n考生：早上好，你能告诉我游泳课什么时候开始吗？\n前台：当然。初级班七月十日开始，持续三周。\n考生：谢谢。请问费用是多少？\n前台：学生两百元，需要带学生证。\n考生：你知道我在哪里能买到泳帽吗？\n前台：知道——前台旁边的商店就有卖，二十元一个。\n考生：再问一个问题，第一天我应该几点到？\n前台：请八点半到，比上课时间早十五分钟。\n考生：这太有帮助了，非常感谢。',
        cues: [
          '重音：Could you TELL me when the swimming course STARTS? —— 疑问句重心落在 tell 与 starts；May I ask how much it COSTS? 重心落在 costs。',
          '语调：Could you / May I / Do you know 开头的礼貌问句在句尾用升调；对方回答 Sure. / Two hundred yuan. 用降调，表示信息确定。',
          '连读：Could_you、Do_you_know、next_to_the_front_desk 连读；宾语从句 when the swimming course starts 要一口气读完，中间不停。',
          '停顿：One more question, please. 之后停半拍再问，给评分者「还有一问」的信号，也让自己的语速稳下来。',
        ],
        tasks: [
          {
            id: 'eng-listen-5-s1-t1',
            type: 'choice',
            stem: '示范对话中用哪一句询问价格？',
            options: [
              'Could you tell me when the swimming course starts?',
              'May I ask how much it costs?',
              'Do you know where I can buy a swimming cap?',
              'What time should I arrive on the first day?',
            ],
            answer: 'B',
            explanation:
              '问价格用 how much；其余三句分别问时间、地点与到场时间。问对信息点是询问题的第一步得分点。',
            difficulty: 1,
            tags: ['询问句型', '信息点'],
          },
          {
            id: 'eng-listen-5-s1-t2',
            type: 'choice',
            stem: '学生价是多少？',
            options: ['Twenty yuan.', 'Two hundred yuan.', 'Three weeks.', 'Eighty yuan.'],
            answer: 'B',
            explanation:
              'Two hundred yuan for students.；twenty yuan 是泳帽的价格，three weeks 是课程时长，都是同一段材料里的干扰数字。',
            difficulty: 2,
            tags: ['听力细节', '价格信息'],
          },
          {
            id: 'eng-listen-5-s1-t3',
            type: 'choice',
            stem: 'Do you know where I can buy a swimming cap? 若改写成错句，最典型的错误是？',
            options: [
              'Do you know where can I buy a swimming cap?',
              'Do you know where to buy a swimming cap?',
              'Could you tell me where I can buy a swimming cap?',
              'Do you know the shop that sells swimming caps?',
            ],
            answer: 'A',
            explanation:
              '宾语从句必须用陈述语序 where I can buy；A 项保留了疑问语序，是询问题最常见的语法错误，其余三项都正确。',
            difficulty: 2,
            tags: ['宾语从句', '语序'],
          },
          {
            id: 'eng-listen-5-s1-t4',
            type: 'short',
            stem: '情景提示：你想知道「课程地点」。请写出一句英语询问句。',
            answer: 'Could you tell me where the course is held? / Do you know where the swimming course is?',
            rubric: [
              '问的是地点（使用 where）',
              '使用礼貌结构 Could you tell me / Do you know / May I ask',
              '宾语从句用陈述语序（where the course is held），没有倒装',
            ],
            explanation:
              '询问题同时看信息点与语法：问对 where 才拿到信息分，语序正确才不失语法分。',
            difficulty: 2,
            tags: ['询问句型', '语序'],
          },
        ],
      },
      {
        title: '角色扮演材料二：回答考官提问（示范作答，约 120 词）',
        text: "Examiner: Now I'd like to ask you some questions about the sports club. Where is Sunshine Sports Club?\nYou: It's on Green Street, next to the city library.\nExaminer: How often do you go there?\nYou: I go there twice a week, usually on Wednesday and Saturday evenings.\nExaminer: Which sport do you like best at the club?\nYou: I like swimming best, because it is cool in summer and good for my back.\nExaminer: Who do you usually go with?\nYou: I usually go with my cousin, and sometimes my father joins us.\nExaminer: Why do you think students should do more sports?\nYou: Because sports keep us healthy and help us think better in class. Also, we make new friends there.\nExaminer: Thank you. That's the end of the speaking test.",
        cn: '考官：现在我想问你几个关于体育俱乐部的问题。阳光体育俱乐部在哪里？\n考生：在格林街，市图书馆旁边。\n考官：你多久去一次？\n考生：一周去两次，通常是周三和周六晚上。\n考官：在俱乐部里你最喜欢哪项运动？\n考生：我最喜欢游泳，因为夏天很凉快，而且对我的背有好处。\n考官：你通常和谁一起去？\n考生：我通常和表哥一起去，有时我爸爸也一起。\n考官：你认为学生为什么应该多做运动？\n考生：因为运动让我们保持健康，也帮助我们在课上思维更清楚。另外，我们还能在那里交到新朋友。\n考官：谢谢。口语测试到此结束。',
        cues: [
          '重音：答句里的关键信息要重读——Green Street、twice a week、swimming、my cousin、healthy，这些正是评分点所在。',
          '语调：信息型短答用降调收尾；列举理由时（because it is cool in summer and good for my back）前半句略上提、最后降下来。',
          '停顿与节奏：Why 类问题先给一句主要理由，停半拍，再用 Also 补第二句，比一口气说很长更容易听清。',
        ],
        tasks: [
          {
            id: 'eng-listen-5-s2-t1',
            type: 'choice',
            stem: 'How often do you go there? 的正确答句是？',
            options: ['Twice a week.', 'Two hours.', 'For two weeks.', 'On Wednesday.'],
            answer: 'A',
            explanation:
              'How often 问频次，答 twice a week；Two hours 回答 How long，For two weeks 回答「持续多久」，On Wednesday 只答了其中一天，都没答到问点。',
            difficulty: 2,
            tags: ['疑问词对应', '回答'],
          },
          {
            id: 'eng-listen-5-s2-t2',
            type: 'choice',
            stem: '回答 Why 类问题的最好结构是？',
            options: [
              '只说一句 Because it is good.',
              '先给主要理由，再用 and / also 补一个理由，最后收尾',
              '用 Yes, I do. 回答',
              '把问题重复一遍再回答',
            ],
            answer: 'B',
            explanation:
              'Why 类问题用 because 引出理由，两个理由让内容更充实；Yes/No 无法回答 wh- 问题，重复问题则浪费时间。',
            difficulty: 2,
            tags: ['回答', '原因表达'],
          },
          {
            id: 'eng-listen-5-s2-t3',
            type: 'choice',
            stem: '回答 Which sport do you like best at the club? 最合适的一句是？',
            options: [
              'I like swimming best, because it is cool in summer and good for my back.',
              'Yes, I like sports.',
              'I go there twice a week.',
              'Swimming is a sport.',
            ],
            answer: 'A',
            explanation:
              'Which ... best 问偏好，答句要给出选择并说明理由；B 项答非所问，C 项回答的是频次，D 项只是重复常识。',
            difficulty: 2,
            tags: ['回答', '偏好表达'],
          },
          {
            id: 'eng-listen-5-s2-t4',
            type: 'short',
            stem: '用一句英语回答：Why do you think students should do more sports?',
            answer:
              'Because sports keep us healthy and help us think better in class, and we can also make new friends there.',
            rubric: [
              '句子以 Because 引出理由',
              '说出至少两个理由（健康、上课更专注、交朋友等）',
              '句子结构完整、无明显语法错误',
            ],
            explanation:
              '回答题只有 1 分，问句与答句匹配、一句说清理由即可，不必长篇说明；理由超过一个会让内容更饱满。',
            difficulty: 2,
            tags: ['回答', '原因表达'],
          },
        ],
      },
    ],
    examTips: [
      '看到中文提示先圈名词：时间、地点、价格、方式、联系人——圈出的词必须出现在你的问句里，问偏了就白问。',
      '问句只用三种背熟的框架：Could you tell me + 陈述语序、May I ask + 陈述语序、疑问词 + 助动词 + 主语；不要临场造句。',
      '听到 Yes/No 问句就先答 Yes 或 No 再补内容；听到 wh- 问句就直接给信息，不用先重复问题。',
      '回答时把问句里的时态与人称直接搬过来（Did you → I did；Have you → I have），这是最高效的语法保险。',
      '想不出答案时用 I think ... / Maybe ... 开口作答，比沉默或说 Sorry, I can\'t. 更容易拿到分。',
    ],
    questions: [
      {
        id: 'eng-listen-5-q1',
        type: 'choice',
        stem: '下列问句中语法完全正确的是？',
        options: [
          'Could you tell me when does the course start?',
          'Could you tell me when the course starts?',
          'Could you tell me when the course start?',
          'Could you tell me when is the course start?',
        ],
        answer: 'B',
        explanation:
          '主句 Could you tell me 之后是宾语从句，用陈述语序：when + 主语 the course + 谓语 starts（第三人称单数加 s）。',
        difficulty: 2,
        tags: ['宾语从句', '语序'],
      },
      {
        id: 'eng-listen-5-q2',
        type: 'choice',
        stem: '要询问「报名方式」，最恰当的句子是？',
        options: [
          'How much does the course cost?',
          'How can I sign up for the course?',
          'How long does the course last?',
          'Why do you like the course?',
        ],
        answer: 'B',
        explanation:
          '询问方式用 How can I ...；其余三项分别问价格、时长与原因，属于问错信息点，通常不得分。',
        difficulty: 2,
        tags: ['询问句型', '信息点'],
      },
      {
        id: 'eng-listen-5-q3',
        type: 'choice',
        stem: '问句 How long does the visit last? 的答句应该是？',
        options: ['It lasts about two hours.', 'At nine o\'clock.', 'Twice a month.', 'By bus.'],
        answer: 'A',
        explanation:
          'How long 问时长，答句用 It lasts ... 或 For two hours.；其余三项分别回答时间点、频次与方式。',
        difficulty: 1,
        tags: ['疑问词对应', '回答'],
      },
      {
        id: 'eng-listen-5-q4',
        type: 'choice',
        stem: '角色扮演结束时，下面哪一句收尾最自然？',
        options: [
          'That\'s all. Bye-bye.',
          'That\'s very helpful. Thank you.',
          'I don\'t know anything.',
          'Please ask me again.',
        ],
        answer: 'B',
        explanation:
          '礼貌收尾会给整段留下完整的印象；That\'s all 显得生硬，I don\'t know anything 等于放弃作答。',
        difficulty: 1,
        tags: ['礼貌用语'],
      },
      {
        id: 'eng-listen-5-q5',
        type: 'fill',
        stem: '补全问句：Do you know ____ the shop opens on Sunday?（填一个词）',
        answer: 'whether|if',
        explanation:
          '问「是否」用 whether 或 if 引导宾语从句，从句仍用陈述语序 the shop opens on Sunday，不能倒装。',
        difficulty: 2,
        tags: ['宾语从句', 'whether'],
      },
      {
        id: 'eng-listen-5-q6',
        type: 'short',
        stem: '情景提示：你想知道「活动当天要带什么」。请写出一句英语询问句。',
        answer: 'Could you tell me what I should bring on that day? / May I ask what I need to bring?',
        rubric: [
          '问的是「带什么」（what ... bring）',
          '使用礼貌结构或语法正确的疑问句',
          '最好带上时间限定（on that day / for the activity）',
        ],
        explanation:
          '情景提示里的限定词（当天、学生、周末）是信息点的一部分，问句里带上它们才算完全问对。',
        difficulty: 2,
        tags: ['询问句型', '信息点'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 6. 应试策略：全流程与临场策略                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-listen-6',
    grade: 'all',
    unit: '应试策略',
    title: '听说考试全流程与临场策略',
    enTitle: 'Exam Routine and Test-day Strategies',
    summary:
      '听说考试 14 题 30 分在同一场完成，考的不只是英语：进场试音、听指令、读题、作答、停笔，每一步都有固定流程，走错一步就可能白白丢一题的分。',
    points: [
      {
        level: '重点',
        text: '考前 20—30 分钟到候考室，带齐准考证与身份证；草稿纸与笔由考点统一提供，手机等电子设备必须关机放到指定位置。',
        explain:
          '听说考试分批进场，迟到往往被安排到最后一批，紧张与疲惫都会影响发挥，也容易错过试音环节。',
      },
      {
        level: '重点',
        text: '进场后先试音：按屏幕提示说一句话，看音量条是否随声音起伏；麦克风距嘴 2—3 厘米、略偏嘴边，不要正对着气流吹气。',
        explain:
          '试音不合格要当场举手请监考老师调整；正式开始后再发现自己没录进去，整场分数就已损失。',
      },
      {
        level: '重点',
        text: '每部分播放前的读题时间先看选项与疑问词（Who / When / How much / Why），用它预测要听什么。',
        explain:
          '读题时间通常只有十几秒到几十秒（秒数以屏幕提示为准），看选项的收益远大于默读材料或背单词。',
      },
      {
        level: '次重点',
        text: '播放与作答次序（秒数均以考场屏幕提示为准）：模仿朗读听 1 遍、准备约 30 秒、朗读约 1 分钟；听选 6 题听完立即作答，每题约 10 秒；回答 4 题每题约 10 秒；角色扮演先听材料、准备约 30 秒到 1 分钟，再复述约 1 分钟。',
        explain:
          '每题作答时限一到录音自动截止，超时部分不计分，所以答句越短越安全，答完立刻停下。',
      },
      {
        level: '次重点',
        text: '常见失分点：忘记录音（对着屏幕不出声）、提示音未响就抢答、声音过大或过小、超时后继续补说、用中文作答、复述时长时间沉默。',
        explain:
          '这些都不是英语能力问题，却每一条都可能丢掉一题的分，属于整场考试里最容易避免的失分。',
      },
      {
        level: '了解',
        text: '应急与心态：漏听一题不回头，按常识或已记信息作答；卡壳时用 Let me put it another way. 缓冲；全部考完不要与同学对答案。',
      },
    ],
    scripts: [
      {
        title: '考场英语指令示范（试音与流程指令，约 125 词）',
        text: "Now you will take the English listening and speaking test. Before we begin, please put on your headset and adjust the microphone. You will hear a short tone. When you hear the tone, please say your name and your school clearly.\n\nThere are three parts in this test. In Part One, you will hear a passage twice and read it aloud. In Part Two, you will listen to short conversations, choose the best answers, and answer a few questions. In Part Three, you will retell a story and answer some questions about it.\n\nBefore each part, you will have time to read the questions. Please do not speak when the recording is playing. When you finish, put down your headset and wait quietly. Good luck!",
        cn: '现在你将要参加英语听说考试。开始之前，请戴上耳机并调整麦克风。你会听到一声短提示音，听到提示音后，请清楚地报出你的姓名和学校。\n本场考试共三个部分。第一部分，你会听到一段短文读两遍，然后朗读它。第二部分，你会听到几段短对话，选出最佳答案，并回答几个问题。第三部分，你要复述一个故事，并回答与它相关的一些问题。\n每一部分开始前，你都有时间阅读题目。录音播放期间请不要出声。结束后请摘下耳机，安静等待。祝你好运！',
        cues: [
          '抓提示语：Before we begin、Part One / Part Two / Part Three、Before each part 这些词在指令里都重读，听到它们就知道流程走到哪一步。',
          '重音与语气：please put on your headset、adjust the microphone、do not speak 都是祈使句，动词重读、用降调，表示明确要求。',
          '语调：When you hear the tone, please say your name 用降调表要求；最后 Good luck! 用升调，是祝愿的语气。',
          '连读：put_on、listen_to、end_of_the_test 连读；headset、adjust 里的 d 与 t 在辅音前只做口形不送气。',
        ],
        tasks: [
          {
            id: 'eng-listen-6-s1-t1',
            type: 'choice',
            stem: '听到提示音后，考生应该先做什么？',
            options: [
              '立刻开始朗读短文',
              '清楚地报出自己的姓名与学校',
              '摘下耳机等待',
              '举手询问监考老师',
            ],
            answer: 'B',
            explanation:
              '指令说 When you hear the tone, please say your name and your school clearly.；提示音是试音与录音开始的信号，报名字就是试音内容。',
            difficulty: 1,
            tags: ['考试流程'],
          },
          {
            id: 'eng-listen-6-s1-t2',
            type: 'choice',
            stem: '关于录音播放期间的要求，正确的是？',
            options: [
              '可以小声跟读，帮助自己熟悉语音',
              '录音播放时不要出声，只在允许作答时说话',
              '可以反复按暂停键',
              '可以摘下耳机休息一下',
            ],
            answer: 'B',
            explanation:
              '指令明确 Please do not speak when the recording is playing.；抢话会被录进答案，还会占掉随后的作答时间。',
            difficulty: 1,
            tags: ['考试流程'],
          },
          {
            id: 'eng-listen-6-s1-t3',
            type: 'choice',
            stem: '这套听说考试共有几个部分？',
            options: ['Two.', 'Three.', 'Four.', 'Five.'],
            answer: 'B',
            explanation:
              '指令里依次出现 Part One（模仿朗读）、Part Two（信息获取听选与回答）、Part Three（角色扮演复述与问答），共三个部分。',
            difficulty: 1,
            tags: ['考试流程'],
          },
          {
            id: 'eng-listen-6-s1-t4',
            type: 'choice',
            stem: 'adjust the microphone 的意思最接近哪一项？',
            options: ['戴上耳机', '调整麦克风的位置与音量', '检查录音文件', '更换电池'],
            answer: 'B',
            explanation:
              'adjust 是「调整」，与 put on your headset（戴上耳机）是两个不同动作；听指令时要分清这两个动词。',
            difficulty: 2,
            tags: ['指令理解'],
          },
        ],
      },
      {
        title: '全流程演练材料：慈善步行通知（独白，约 130 词）',
        text: "Attention, please. This is a notice from the Students' Union.\n\nThe school will hold a charity walk on Sunday, the twelfth of May. We will start from the school gate at half past eight in the morning and finish at the city park at about eleven.\n\nEach student should bring a bottle of water and wear comfortable shoes. Please do not bring any money with you; your parents can donate online if they wish. The money will be used to buy books for children in mountain areas.\n\nOn the way, there are three checkpoints. At each checkpoint, you will get a stamp on your card. If you collect all three stamps, you will receive a small gift at the park.\n\nSign up with your class monitor before Thursday. Thank you.",
        cn: '请注意，这是学生会的通知。\n学校将于五月十二日（星期日）举行慈善步行活动。我们上午八点半从校门口出发，大约十一点到达城市公园。\n每位同学请带一瓶水，穿舒适的鞋子。请不要随身带钱；如果家长愿意，可以在网上捐款。这笔钱将用来为山区儿童购买图书。\n途中设有三个打卡点，每到一个打卡点会在你的卡片上盖一个章。集齐三个章的同学将在公园领到一份小礼物。\n请在周四之前向班长报名。谢谢。',
        cues: [
          '听记四栏法：通知类材料按时间（the twelfth of May / half past eight）、地点（school gate → city park）、要求（a bottle of water、comfortable shoes、no money）、结果（three stamps → a small gift）记在草稿纸上。',
          '重音：the TWELFTH of May、half PAST eight、about ELEVEN 中数字重读；听到数字立刻写下来，不要等整句听完。',
          '语调与停顿：Each student should bring a bottle of water and wear comfortable shoes. 用降调逐项列出要求；Please do not ... 之前稍停，提示后面是禁止项，常考。',
          '连读与弱读：a_bottle_of_water、Sign_up_with_your_class_monitor、before_Thursday 连读；should 后的 to 弱读，不要每个词都重读。',
        ],
        tasks: [
          {
            id: 'eng-listen-6-s2-t1',
            type: 'choice',
            stem: '慈善步行几点出发？',
            options: ['At eight.', 'At half past eight.', 'At eleven.', 'At half past eleven.'],
            answer: 'B',
            explanation:
              'We will start from the school gate at half past eight in the morning.；eleven 是到达公园的时间，eight 是 half past eight 里容易被单独抓走的干扰数字。',
            difficulty: 2,
            tags: ['时间信息', '听力细节'],
          },
          {
            id: 'eng-listen-6-s2-t2',
            type: 'choice',
            stem: '学生应该带什么？',
            options: [
              'A bottle of water and comfortable shoes.',
              'Some cash for the donation.',
              'A book for the children.',
              'A stamp card from home.',
            ],
            answer: 'A',
            explanation:
              'Each student should bring a bottle of water and wear comfortable shoes.；材料还说明 Please do not bring any money with you，所以带现金是错的。',
            difficulty: 2,
            tags: ['听力细节'],
          },
          {
            id: 'eng-listen-6-s2-t3',
            type: 'choice',
            stem: '集齐三个印章会得到什么？',
            options: ['A new card.', 'A small gift at the park.', 'A book.', 'A T-shirt.'],
            answer: 'B',
            explanation:
              'If you collect all three stamps, you will receive a small gift at the park.；书是用捐款买的，T 恤材料没有提到，卡片是打卡用的。',
            difficulty: 1,
            tags: ['听力细节', '条件信息'],
          },
          {
            id: 'eng-listen-6-s2-t4',
            type: 'short',
            stem: '用一句英语复述这次活动的时间、集合地点与目的。',
            answer:
              'The charity walk will start from the school gate at half past eight on Sunday, the twelfth of May, to raise money for books for children in mountain areas.',
            rubric: [
              '说清时间（Sunday, the twelfth of May 或 half past eight）',
              '说清集合地点与终点（school gate → city park）',
              '说清目的（raise money to buy books for children in mountain areas）',
              '一到两句完整句，时态用一般将来时',
            ],
            explanation:
              '通知类材料的复述先给时间地点，再给目的；用 to raise money for ... 表示意图，比用 because 更贴切。',
            difficulty: 3,
            tags: ['复述', '信息整合'],
          },
        ],
      },
    ],
    examTips: [
      '提前 20—30 分钟到候考室，带齐准考证与身份证；候考时不要大声练读，保持嗓子放松，进考场前深呼吸三次。',
      '试音环节一定要开口：按提示说一句话，确认音量条随声音起伏；麦克风位置不对就当场举手请老师调整。',
      '每部分播放前的十几秒只做一件事——扫选项、圈疑问词（When / How much / Why）与数字，用它预测要听的信息。',
      '听的时候只在草稿纸上写 3—5 个字符（2:00、15、gate），写整句会让你漏掉后面两题。',
      '每题作答时限一到自动截止：答完就停，不补说上一题，也不在别人的答题时间里出声。',
      '模仿朗读读错不回头，复述卡壳不沉默：前者继续往下读，后者用 Let me put it another way. 撑住流利度。',
      '声音比平时说话略大、语速略慢，句末把音收完整；机器评分对吞音和过轻的声音最不友好。',
      '全部考完不要与同学对答案、不要在走廊讨论题目，把注意力留给接下来的笔试。',
      '流程中的秒数、题量与分值以当年官方卷面与考场屏幕提示为准；本应用按 14 题 30 分的听说结构组织内容。',
    ],
    questions: [
      {
        id: 'eng-listen-6-q1',
        type: 'choice',
        stem: '试音时麦克风的最佳位置是？',
        options: [
          '紧贴嘴唇，保证音量最大',
          '距嘴 2—3 厘米、略偏嘴边',
          '距嘴 10 厘米以上，避免杂音',
          '平放在桌面上',
        ],
        answer: 'B',
        explanation:
          '太近会录入气流杂音并出现爆音，太远则音量过低、评分系统识别不到；2—3 厘米并略偏嘴边是考场通行做法。',
        difficulty: 2,
        tags: ['设备与试音'],
      },
      {
        id: 'eng-listen-6-q2',
        type: 'choice',
        stem: '录音播放期间，考生最应该做的事是？',
        options: [
          '跟着录音小声朗读，熟悉语音',
          '安静听，并在草稿纸上速记关键词',
          '先把选择题的答案写好',
          '调整耳机音量与麦克风',
        ],
        answer: 'B',
        explanation:
          '播放期间出声会被录入并占用作答时间；设备调整要在试音环节完成。安静听加快记，作答窗口一到就能开口。',
        difficulty: 2,
        tags: ['考试流程', '听记方法'],
      },
      {
        id: 'eng-listen-6-q3',
        type: 'choice',
        stem: '某道听选题完全没听清，最合理的处理是？',
        options: [
          '在这一题上反复回想，直到想起来',
          '按常识或已记信息猜一个答案，立刻准备下一题',
          '留空不答',
          '举手问监考老师',
        ],
        answer: 'B',
        explanation:
          '每题作答时限一到就自动截止，纠结一题必然连丢后面两题；猜一个还有可能得分，留空一定 0 分。',
        difficulty: 2,
        tags: ['临场策略'],
      },
      {
        id: 'eng-listen-6-q4',
        type: 'choice',
        stem: '模仿朗读中读错了一个词，正确的处理是？',
        options: [
          '回到句首把整句重读一遍',
          '继续往下读，不回头',
          '停下来重新读整段',
          '降低音量把剩下的部分读完',
        ],
        answer: 'B',
        explanation:
          '回头重读会造成重复与跳读，流利度扣分更明显；继续往下读只影响一个音节的准确度。降低音量则可能被判为未录音。',
        difficulty: 2,
        tags: ['临场策略', '模仿朗读'],
      },
      {
        id: 'eng-listen-6-q5',
        type: 'choice',
        stem: '每部分开始前的读题时间，最该用来做什么？',
        options: [
          '默读选项，圈出疑问词与数字',
          '把材料默读一遍',
          '背几个高频单词',
          '检查设备与音量',
        ],
        answer: 'A',
        explanation:
          '读题时间看选项收益最高：圈出 Who / When / How much 就能预判要听什么；默读材料时间通常不够，设备检查应在试音时完成。',
        difficulty: 1,
        tags: ['读题方法'],
      },
      {
        id: 'eng-listen-6-q6',
        type: 'fill',
        stem: '把 half past eight 写成数字形式：____',
        answer: '8:30|8.30',
        explanation:
          'half past eight 是八点半，即 8:30。草稿纸上记时间一律用阿拉伯数字，比写英文快得多，也不会在换算时出错。',
        difficulty: 1,
        tags: ['时间换算'],
      },
      {
        id: 'eng-listen-6-q7',
        type: 'short',
        stem: '请写出你的听说考试作答计划，包含模仿朗读准备、听选作答、复述准备三个环节。',
        answer:
          '模仿朗读：听材料时默读一遍，在意群处画斜线，准备时间内只补标连读位置，朗读时匀速、句末收干净；听选：播放前把 6 个小题的选项扫一遍圈出疑问词，播放时每题只记 3—5 个字符，听完立刻选；复述：听材料时按「时间地点—人物—起因—经过—结果感受」写关键词，准备时间在心里说一遍开头句，复述时用连接词串起来，宁短不缺。',
        rubric: [
          '三个环节都有具体做法，不是泛泛而谈',
          '模仿朗读提到意群标记与匀速朗读',
          '听选提到读选项圈疑问词与速记',
          '复述提到五栏提纲与开头句',
          '有「按时限作答、答完即停」的意识',
        ],
        explanation:
          '听说考试的节奏由录音控制，能自己掌控的只有「读题空隙怎么用」和「速记写什么」。把这两处写进计划，临场就不会乱。',
        difficulty: 3,
        tags: ['临场策略', '作答计划'],
      },
    ],
  },
];
