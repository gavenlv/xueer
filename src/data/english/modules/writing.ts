/**
 * 英语 · 写作模块（按广州中考知识模块组织）
 *
 * 卷面依据：2027—2029 年广州中考英语笔试「写作」部分——第一节 填空题 5 小题 5 分、
 * 第二节 填空题 5 小题 5 分、第三节 书面表达 1 小题 20 分。因此本模块前两条走「填空与转换」
 * 的路线（完成句子、语篇填空），中间四条按书面表达的高频文体与话题分块，最后一条专攻
 * 语言升级（连接词、复合句、地道表达）。
 *
 * 撰写体例：
 * 1. 每条 ≥5 个分层考点（重点 ≥3），`explain` 一律写「在哪道题里考、怎么快速判断」。
 * 2. 每条的 `writing` 给出完整题目要求、≥3 条写作要求、同一题目的两篇分档范文
 *    （一类文与二类文对照，让学生看出分差在哪），每篇 80—120 词，配中文翻译与 150—300 字点评。
 * 3. `highlights[].sentence` 一律逐字摘自本篇范文，`why` 说明这句好在哪里、怎么化用。
 * 4. 范文与题目全部原创，不抄教材课文与真题范文；话题贴近初中生活，多处使用广州元素。
 * 5. 每题答案唯一且正确，一空多解时用半角竖线 `|` 给出可接受写法。
 */

import type { EnglishKnowledge } from '../../../types';

export const topics: EnglishKnowledge[] = [
  /* ------------------------------------------------------------------ */
  /* 1. 完成句子与句型转换                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-1',
    grade: 'all',
    unit: '完成句子',
    title: '完成句子与句型转换',
    enTitle: 'Sentence Completion and Transformation',
    summary:
      '写作第一、二节填空题的通用解法：先看中文提示定句型骨架，再想固定搭配，最后检查时态、语态、单复数与大小写。',
    points: [
      {
        level: '重点',
        text: '「根据中文提示补全句子」要先定句型框架，再填关键词',
        explain:
          '题干常给出英文前半句，中文提示里往往藏着固定搭配（be famous for、take part in、It takes sb some time to do sth）。先问自己「这句话的骨架是 be 动词还是实义动词」，再想搭配，最后才动笔。阅卷按空给分，搭配错、时态错都不得分。',
      },
      {
        level: '重点',
        text: '同义句改写三大高频组：because 与 because of、too...to 与 so...that、spend 与 take',
        explain:
          'because 后面接从句，because of 后面只能接名词或动名词；too...to 本身含否定意义，改写成 so...that 时 that 从句必须用否定形式；spend 的主语必须是人，take 的主语只能是 it。这三组几乎年年考。',
      },
      {
        level: '重点',
        text: '主动语态改被动语态，要连同时态一起改，并检查 be 动词有没有丢',
        explain:
          '改写时先算原句时态，再套 be + 过去分词。学生最常丢的就是 be 动词，或者忘记把动词改成过去分词，写成 The homework was finish。另外 make sb do sth 变被动要还原 to：be made to do sth。',
      },
      {
        level: '重点',
        text: '直接引语改间接引语：人称、时态、时间状语三处都要跟着变',
        explain:
          'say to sb 改 tell sb，this 改 that，now 改 then，tomorrow 改 the next day，here 改 there。三处漏改一处就失分，答题时按「人称—时态—状语」的顺序逐项检查，最后再看宾语从句的语序是不是陈述句语序。',
      },
      {
        level: '次重点',
        text: '感叹句、倒装与 there be 句型的改写',
        explain:
          '感叹句中心词是名词就用 What + 名词短语 + 主谓，中心词是形容词或副词就用 How + 形容词副词 + 主谓。never、hardly 置于句首时句子要部分倒装：Never have I seen such a beautiful lake。句式越固定，越不能凭语感写。',
      },
      {
        level: '了解',
        text: '划线部分提问：疑问词跟着被划成分的词性走',
        explain:
          '划时间用 When，划地点用 Where，划原因用 Why，划方式用 How，划人用 Who，划频率用 How often。提问后，原句剩下的部分要改成一般疑问句语序，助动词不要漏。',
      },
    ],
    writing: {
      topic:
        '广州某中学英语节以「我眼中的广州」为主题征集短文。请你根据下面的中文提示和英文要点写一篇短文，向校刊投稿。\n中文提示：广州是一座有两千多年历史的城市；这里以美味的早茶闻名，市民热情友好；每年有很多外国游客来这里参观；作为一名广州学生，我为自己的城市感到骄傲。\n英文要点：\n1. Guangzhou is a city with a long history.\n2. It is famous for morning tea and its friendly people.\n3. Many foreign visitors visit it every year.\n4. I am proud of my city.',
      requirements: [
        '80 词左右（不少于 80 词、不多于 120 词），写成一篇完整短文，不要逐条翻译中文提示。',
        '四条英文要点必须全部落到实处，可增加一两个广州细节让内容更具体。',
        '至少使用一个被动语态句子，并至少使用一个 because 引导的原因状语从句。',
        '书写规范，大小写与标点正确，文中不得出现真实校名与人名。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Guangzhou is a city with a history of more than two thousand years. It is famous for morning tea, so every weekend many families go to a teahouse to enjoy dim sum and talk happily together. The people here are friendly and always ready to help others. Because the city is full of interesting places, it is visited by a large number of foreign tourists every year. They take photos by the Pearl River and learn to say "nei hou" in Cantonese. As a boy born and raised in Guangzhou, I am proud of my city and I hope more friends will come to see it.',
          cn:
            '广州是一座有两千多年历史的城市。它以早茶闻名，因此每个周末都有许多家庭去茶楼，一边享用点心，一边开心地聊天。这里的人友好，总是乐于帮助别人。因为这座城市到处都有有趣的地方，每年都有大量外国游客来此参观。他们在珠江边拍照，还学着用粤语说「你好」。作为一个在广州土生土长的男孩，我为我的城市感到骄傲，也希望更多朋友能来看看它。',
          comment:
            '一类文的得分点有三处。第一，内容完整：四条英文要点全部落实，还补了茶楼、珠江、粤语这些广州细节，读起来不是逐条翻译。第二，语言准确且有变化：被动的 is visited by、原因状语从句 Because...、be famous for 都按要求用上，全篇时态统一，没有主谓不一致或拼写错误。第三，衔接自然：so、Because、As 把句子串成一条线，结尾 hope more friends will come to see it 收得干净，还有招呼读者来广州的意思。可挑的毛病只有个别词，如 teahouse 连写、Cantonese 要大写，属于细枝末节。',
          highlights: [
            {
              sentence:
                'It is famous for morning tea, so every weekend many families go to a teahouse to enjoy dim sum and talk happily together.',
              why:
                '用 be famous for 落实第二条要点后，紧接着用 so 把「有名」与「市民生活」连成因果关系，比逐条罗列要点更像一篇连贯的短文；enjoy dim sum 与 talk happily 两个动作并列，画面感强，也让外国读者更容易理解什么是早茶。',
            },
            {
              sentence:
                'Because the city is full of interesting places, it is visited by a large number of foreign tourists every year.',
              why:
                '一句话同时用上 because 引导的原因状语从句和被动语态 is visited by，正好命中本题的两条硬性要求；主语 it 指代前句的 the city，避免了 Guangzhou 反复出现，a large number of 也比 many 更书面。',
            },
            {
              sentence:
                'As a boy born and raised in Guangzhou, I am proud of my city and I hope more friends will come to see it.',
              why:
                'As 引导的身份状语开头，把「广州人」这个身份和结尾的期盼串在一起；过去分词短语 born and raised 作后置定语，用词经济，结尾既有交代又有呼吁。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Guangzhou is a city has a long history. It is famous for morning tea. The people in Guangzhou is very friendly. Every year many foreign visitors come to Guangzhou. They like Guangzhou very much and take many photos. Guangzhou is a beautiful city. There are also many parks and museums in the city. I am a student in Guangzhou. I am proud of Guangzhou. I want to tell everyone that Guangzhou is a good city. Welcome to Guangzhou. I hope you can come here and visit my city.',
          cn:
            '广州是一座有很长历史的城市。它以早茶闻名。广州的人很友好。每年许多外国游客来广州。他们很喜欢广州，还拍许多照片。广州是一座美丽的城市。城里也有很多公园和博物馆。我是广州的一名学生。我为广州感到骄傲。我想告诉每个人，广州是一座好城市。欢迎来广州。我希望你能来这里参观我的城市。',
          comment:
            '这篇属于二类文。四条要点都提到了，be famous for、be proud of 这类搭配没写错，内容分能拿住大半。差距有三处。一是准确性：Guangzhou is a city has a long history 一句里两个谓语打架，The people in Guangzhou is very friendly 主谓不一致，直接影响语言分。二是句式单一，十二句有九句以 Guangzhou 或 I 开头，又没有连接词。三是任务未完成：题目要求的被动语态与 because 从句都没用上。升格办法很简单：把游客那句改成被动句，用 because 合并两句，换掉重复的主语。',
          highlights: [
            {
              sentence: 'It is famous for morning tea.',
              why:
                '这是全篇最稳的一句，be famous for 用对了，第二条要点直接落实，能拿到基本分。可惜后面没有展开细节，只停在「闻名」上，若接一句 about the food here 之类的补充，内容分立刻不同。',
            },
            {
              sentence: 'I am proud of Guangzhou.',
              why:
                'be proud of 搭配完全正确，是第四条要点的标准表达，说明作者背过基本句型。问题是它孤零零地夹在叙述里，若改成 As a student in Guangzhou, I am proud of my city，同样的意思就能多得语言分。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'Guangzhou is a city with a history of more than two thousand years.（with 短语作定语，替换定语从句）',
        'It is famous for ... , so ...（be famous for + so 串因果）',
        '... is / are visited by a large number of foreign tourists every year.（被动语态写「被参观」）',
        'Because ..., ...（原因状语从句；若后面只接名词，改用 because of）',
        'As a student born and raised in Guangzhou, I ...（As 引出身份，避免每句都用 I 开头）',
        'I am proud of ... and I hope ...（并列谓语收尾，交代心情与期盼）',
        'What makes the city special is that ...（主语从句开头，适合写「最特别的一点」）',
        'not only ... but also ...（连接两个并列成分，替换第二个 and）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-1-q1',
        type: 'fill',
        stem:
          '根据中文提示补全句子，每空一词。\n广州以珠江和早茶闻名。\nThe city of Guangzhou ____ ____ ____ its Pearl River and morning tea.',
        answer: 'is famous for',
        explanation:
          'be famous for 表示「以……闻名」，主语 the city of Guangzhou 是单数，所以用 is；注意与 be famous as（作为某种身份而闻名）区分：He is famous as a writer。',
        difficulty: 1,
        tags: ['完成句子', '固定搭配'],
      },
      {
        id: 'eng-writing-1-q2',
        type: 'fill',
        stem:
          '同义句改写。\nThe teacher made the students clean the classroom.（改为被动语态）\nThe students ____ made to clean the classroom by the teacher.',
        answer: 'were',
        explanation:
          'make sb do sth 变被动语态时要还原不定式符号 to，即 be made to do sth；主语 the students 是复数，原句又是过去时，所以填 were。',
        difficulty: 2,
        tags: ['句型转换', '被动语态'],
      },
      {
        id: 'eng-writing-1-q3',
        type: 'fill',
        stem:
          '直接引语改间接引语。\nTom said to me, "I will visit you tomorrow."\nTom ____ me that he would visit me the next day.',
        answer: 'told',
        explanation:
          'say to sb 在间接引语中要改成 tell sb；从句已经给出 would visit，所以空白处只填 tell 的过去式 told。另外 tomorrow 已按要求改成 the next day，这正是间接引语必须变的第三处。',
        difficulty: 2,
        tags: ['句型转换', '间接引语'],
      },
      {
        id: 'eng-writing-1-q4',
        type: 'choice',
        stem: '下列哪一句与 The box is so heavy that I cannot carry it. 意思相同？',
        options: [
          'The box is too heavy for me to carry.',
          'The box is heavy enough for me to carry.',
          'The box is so heavy that I can carry it.',
          'The box is too heavy for me to carry it.',
        ],
        answer: 'A',
        explanation:
          'so ... that ... cannot ... 与 too ... to ... 同义，都表示「太……以致不能……」；B 意思正好相反，C 丢掉了否定，D 里 carry 的宾语已经由前面的 the box 充当，不能再加 it。',
        difficulty: 2,
        tags: ['句型转换', '同义句'],
      },
      {
        id: 'eng-writing-1-q5',
        type: 'fill',
        stem:
          '根据中文提示补全句子。\n我们昨天花了两个小时才完成这份报告。\nIt ____ us two hours to finish the report yesterday.',
        answer: 'took',
        explanation:
          'It takes sb some time to do sth 表示「某人花时间做某事」，句中有 yesterday，所以用过去式 took；注意 spend 的主语必须是人，不能写成 It spent。',
        difficulty: 2,
        tags: ['完成句子', '固定句型'],
      },
      {
        id: 'eng-writing-1-q6',
        type: 'choice',
        stem: 'The film is very interesting.（改为感叹句）\n____ interesting film it is!',
        options: ['What a', 'What an', 'How a', 'How an'],
        answer: 'B',
        explanation:
          '感叹句的中心词是可数名词单数 film 时用 What 开头，interesting 以元音音素开头，所以用 What an；How 后面只能跟形容词或副词，不能再带名词。',
        difficulty: 2,
        tags: ['句型转换', '感叹句'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 2. 语篇填空                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-2',
    grade: 'all',
    unit: '语篇填空',
    title: '语篇填空（词的适当形式与首字母）',
    enTitle: 'Text Completion: Word Forms and First Letters',
    summary:
      '写作第二节填空题的两条命题路线——用所给词的适当形式填空、按首字母填空，靠「定词性—定时态语态—定词形」三步保分。',
    points: [
      {
        level: '重点',
        text: '用所给词的适当形式填空，第一步是判断空里缺什么词性',
        explain:
          '看到括号里的词不要急着变形，先看空格的位置：主语位置缺名词，be 动词后缺形容词，修饰动词缺副词，动词后缺宾语。词性判断错了，后面变形再准也不得分。',
      },
      {
        level: '重点',
        text: '动词空要同时看三件事：时态、语态、单复数',
        explain:
          '先找时间状语（last Friday、since then、every day）定时态，再看主语与动词是主动还是被动，最后核对第三人称单数。这是本节失分最多的一类空，做题时按顺序过一遍比凭语感稳。',
      },
      {
        level: '重点',
        text: '名词空先判可数不可数，再判单复数与所有格',
        explain:
          '前面有 some、many、a few、one of the 时基本要用复数；辅音字母加 y 结尾先变 y 为 i 再加 -es（story—stories）；表示「……的」要加撇号加 s。',
      },
      {
        level: '重点',
        text: '首字母填空先靠搭配与上下文定词，再看首字母对不对',
        explain:
          '这类空的答案几乎都是初中高频词，先把句子读通、凭搭配猜出词义，最后才用首字母核对。若首字母与猜出的词不符，说明搭配判断错了，要回头重看上一句。',
      },
      {
        level: '次重点',
        text: '形容词副词的变化：比较级最高级，以及 -ing 与 -ed 两类分词形容词',
        explain:
          'than 前用比较级，Of all the students / one of the 后用最高级；描述事物本身令人怎样用 -ing（boring、interesting），描述人的感受用 -ed（bored、interested）。',
      },
      {
        level: '了解',
        text: '代词与数词也会变：主格宾格、形容词性物主代词、序数词',
        explain:
          'I—me—my—mine，we—us—our—ours；表示「第几个」用序数词 one—first、two—second。这类空看似简单，却常因没注意前面是介词还是名词而丢分。',
      },
    ],
    writing: {
      topic:
        '学校英语社团（English Club）正在招新。请你写一篇短文，介绍你参加过的一次社团活动，向新同学推荐这个社团。\n中文提示：上周五下午我们社团在校门口集合，出发去社区公园做志愿者；我们沿路捡垃圾、在湖边种花、给小朋友讲英语故事；虽然有点累，但大家都觉得这个下午很有意义。\n英文要点：\n1. Our club holds an activity every month.\n2. Last Friday we went to a community park as volunteers.\n3. We picked up rubbish, planted flowers and told English stories to children.\n4. It was tiring but meaningful.',
      requirements: [
        '80 词左右，以一般过去时讲述活动过程，最后一句可写现在的习惯或邀请。',
        '四条英文要点必须全部包含，可增加一处感受或收获。',
        '名词注意单复数，动词注意过去式，全篇不得出现主谓不一致。',
        '分两到三段，书写规范，文中不得出现真实校名与人名。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Last Friday afternoon, the members of our English Club gathered at the school gate and set off for a community park. As volunteers, we picked up rubbish along the paths, planted some flowers near the lake and told English stories to the children there. The children listened carefully and repeated every word after us. Although we were tired, everyone said the afternoon was meaningful. Our club holds such an activity every month, and each time we learn something new. If you enjoy English and want to make a difference, the English Club is the right place for you.',
          cn:
            '上周五下午，我们英语社团的成员在校门口集合，然后出发去社区公园。作为志愿者，我们沿路捡垃圾，在湖边种了一些花，还给那里的孩子讲英语故事。孩子们听得很认真，跟着我们重复每一个单词。虽然我们很累，但大家都说这个下午很有意义。我们社团每个月都举办这样的活动，每次我们都能学到新东西。如果你喜欢英语，也想做点有意义的事，英语社团就是适合你的地方。',
          comment:
            '一类文的关键是「要点全、词形准、有逻辑」。内容上四条要点一处不漏，还补了孩子们跟读的细节，活动因此有画面。语言上过去式全对，gathered、set off、picked、planted、told、listened、repeated 一气串下来，没有一处时态跳回现在；名词单复数也稳，the members、flowers、stories 都写得对，这正是语篇填空反复练的东西。结构上按「集合—活动—感受—邀请」四步推进，Although 和 If 两个从句把段落缝了起来，读着不像要点清单。可挑的毛病很小，如 gathered 与 set off 语义略重叠，删一个会更利落。',
          highlights: [
            {
              sentence:
                'As volunteers, we picked up rubbish along the paths, planted some flowers near the lake and told English stories to the children there.',
              why:
                '一句话用三个并列动词短语把三条活动内容全部落实，picked、planted、told 三个过去式形式统一；As volunteers 开头又避免了 We 反复出现，是「要点齐全」最经济的写法。',
            },
            {
              sentence: 'Although we were tired, everyone said the afternoon was meaningful.',
              why:
                'Although 引导让步状语从句，把「累」与「有意义」组成转折关系，正好对应中文提示里的「虽然……但是……」，比两个短句并列更能体现逻辑，也要注意后面绝不能再加 but。',
            },
            {
              sentence:
                'If you enjoy English and want to make a difference, the English Club is the right place for you.',
              why:
                '条件状语从句开头，结尾直接向读者发出邀请，呼应「向新同学推荐」这一写作目的；make a difference 比 do good things 地道，也比干巴巴的 Welcome to join us 有说服力。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Last Friday, we go to a park. Our English Club has a activity every month. As volunteer, we pick up rubbish and plant flower. We also tell story to the child there. We sing English songs together too. The child was very happy. We are very tired but we think it is meaningful. The park is more clean than before. I like English Club very much. I want to join it again. English Club is a good place. Welcome to our club.',
          cn:
            '上周五，我们去公园。我们英语社团每个月有一次活动。作为志愿者，我们捡垃圾、种花。我们还给那里的孩子讲故事。我们也一起唱英语歌。那个孩子很开心。我们很累，但我们觉得这很有意义。公园比以前干净了。我很喜欢英语社团。我想再参加一次。英语社团是个好地方。欢迎来我们社团。',
          comment:
            '这篇属于二类文。四条要点都写了，失分集中在词形上。一是时态：全篇用 last Friday 定下过去语境，动词却写成 go、pick、plant、tell、sing。二是名词：a activity 应为 an activity，plant flower 应为 flowers，tell story 应为 tell stories。三是单复数与比较级：As volunteer 应为 As volunteers，more clean 应为 cleaner。句式也几乎全是「主谓宾」，语言分只能停在二档。改法很明确：动词统一改过去式，核对名词单复数与比较级，再用 Although 把两句合成一句。',
          highlights: [
            {
              sentence: 'We are very tired but we think it is meaningful.',
              why:
                '用 but 把「累」与「有意义」连成一句，意思完整，是全文最接近一类文的一句。可惜前面动词时态没有与 last Friday 保持一致，前后一混，这句话的分量也跟着降下来了。',
            },
            {
              sentence: 'The child was very happy.',
              why:
                '主谓一致、时态都对，单数 the child 配 was，说明作者并非不会用过去式。问题在于前后句子分别用 go、pick、plant，全篇时态摇摆，这一句反而显得孤立。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'As volunteers, we picked up rubbish and planted flowers.（介词短语开头，避免每句都用 I 或 We 起头）',
        'Although we were tired, everyone said the afternoon was meaningful.（让步状语从句，注意后面不加 but）',
        'Our club holds such an activity every month.（一般现在时写「惯例」，与过去时形成对照）',
        'If you enjoy English and want to make a difference, ... is the right place for you.',
        'First ... Then ... Finally ...（按时间顺序串联活动经过）',
        'It is + 形容词 + for sb to do sth（把「做事很重要」写成完整句）',
        'take part in / set off for / make a difference（替换 do、go 这类笼统动词）',
        'not only ... but also ...（并列两件事，替换第二个 and）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-2-q1',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nLast Sunday we ____ (plant) ten trees in the school garden.',
        answer: 'planted',
        explanation:
          '时间状语 Last Sunday 定下过去时，plant 的过去式直接加 -ed 写作 planted，不要双写 t；另外 ten trees 说明 plant 的宾语是可数名词复数。',
        difficulty: 1,
        tags: ['语篇填空', '动词时态'],
      },
      {
        id: 'eng-writing-2-q2',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nWe told the children some interesting ____ (story) about Guangzhou.',
        answer: 'stories',
        explanation:
          'some 后面接可数名词复数；story 以「辅音字母 + y」结尾，要先把 y 变 i 再加 -es，写作 stories。同类变化还有 city—cities、baby—babies。',
        difficulty: 1,
        tags: ['语篇填空', '名词单复数'],
      },
      {
        id: 'eng-writing-2-q3',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nThe English Club is one of the most popular ____ (club) in our school.',
        answer: 'clubs',
        explanation:
          'one of the + 最高级 + 名词复数，表示「最……的其中之一」，所以 club 要用 clubs；后面的谓语动词也要用单数 is。',
        difficulty: 1,
        tags: ['语篇填空', '名词单复数'],
      },
      {
        id: 'eng-writing-2-q4',
        type: 'choice',
        stem: 'The film was so ____ that all of us fell asleep.',
        options: ['bore', 'boring', 'bored', 'boredom'],
        answer: 'B',
        explanation:
          '修饰物（the film）用 -ing 形式的形容词 boring，表示「令人厌烦的」；bored 表示人「感到厌烦的」，bore 是动词原形，boredom 是名词，都不能放在 was 后面作表语。',
        difficulty: 2,
        tags: ['语篇填空', '分词形容词'],
      },
      {
        id: 'eng-writing-2-q5',
        type: 'fill',
        stem:
          '首字母填空。\nWe were tired after the activity, but we felt very h____ because we helped others.',
        answer: 'happy',
        explanation:
          'but 表示前后转折，前面是 tired，后面应是开心的感受，结合首字母 h 填 happy；felt 是连系动词，后面接形容词作表语。',
        difficulty: 2,
        tags: ['语篇填空', '首字母填空'],
      },
      {
        id: 'eng-writing-2-q6',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nOf all the students, Li Ming speaks English the ____ (fluent).',
        answer: 'most fluently',
        explanation:
          '修饰动词 speaks 要用副词；Of all the students 表示三者以上的范围比较，所以用最高级 most fluently。fluently 是多音节词，最高级前加 most 而不是加 -est。',
        difficulty: 3,
        tags: ['语篇填空', '副词最高级'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 3. 书面表达（一）书信与邮件                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-3',
    grade: 'all',
    unit: '书面表达',
    title: '书面表达（一）·书信与邮件',
    enTitle: 'Letters and Emails',
    summary:
      '邀请信、感谢信、建议信三种高频书信的通用骨架：称呼—事由—细节—期待回复—结束语—署名，附格式要求与语气分寸。',
    points: [
      {
        level: '重点',
        text: '书信格式六件套：称呼、问候或事由、正文、期待回复、结束语、署名',
        explain:
          '格式分是白送的，也是丢得最冤的。称呼 Dear Chris, 后要加逗号；Yours, 首字母大写、后面加逗号，署名另起一行写 Li Hua；开头与结尾若题目已给出，照抄即可，不要改写。',
      },
      {
        level: '重点',
        text: '邀请信三要素：邀请什么事（时间地点）、活动内容、期待回复',
        explain:
          '第一句就写 I am writing to invite you to ..., 把「什么活动、什么时候、在哪里」一次交代完；中间介绍两三项具体活动；结尾用 Please let me know whether you can come before ... 明确要一个答复。',
      },
      {
        level: '重点',
        text: '感谢信要写「具体感谢什么」加「这件事带来什么影响」',
        explain:
          '只写 Thank you very much 拿不到内容分。要落到具体的事：Thank you for helping me with my English. 再补一句影响：It meant a lot to me and I did much better in the exam. 有细节才有分数。',
      },
      {
        level: '重点',
        text: '建议信语气要委婉，多用 Why not ...? 与 It would be a good idea to ...',
        explain:
          '给同学或朋友提建议，不要通篇 You must / You should。委婉句式既礼貌又能体现语言水平：Why not join an English club? It would be a good idea to read aloud every morning.',
      },
      {
        level: '次重点',
        text: '时态搭配：已发生的用过去时或现在完成时，将发生的用一般将来时',
        explain:
          '邀请信里活动安排用 will 或 There will be；感谢信里对方帮过的事用过去时或现在完成时。同一封信里两种时间混着写时，先把时间状语写好，时态就不容易乱。',
      },
      {
        level: '了解',
        text: '中英书信差异：英语不用「此致敬礼」，也不用把日期写在信尾',
        explain:
          '英语私人邮件通常不写日期，也不写「此致敬礼」；结束语用 Yours、Best wishes、Looking forward to your reply 都可以，后面接署名即可，不要照搬中文书信的落款顺序。',
      },
    ],
    writing: {
      topic:
        '假设你是李华，你校将于下周六在学校礼堂举办「广州文化节」（Guangzhou Culture Festival），活动包括粤剧表演、早茶体验和剪纸展示。请你给英国朋友 Chris 写一封电子邮件，邀请他来参加。\n内容要点：\n1. 提出邀请，并说明活动的时间与地点；\n2. 介绍两项具体的活动内容；\n3. 说明他为什么值得来（他一直对中国文化感兴趣）；\n4. 期待回复。\n注意：邮件开头与结尾已给出，不计入总词数。',
      requirements: [
        '80 词左右，必须写成邮件形式，包含称呼 Dear Chris, 与落款 Yours, Li Hua。',
        '四项要点齐全，活动介绍要有具体细节，不能只写 the festival is interesting。',
        '至少使用一个宾语从句，并至少使用一个表示期待或建议的句式。',
        '时态使用正确：活动安排用一般将来时，朋友的情况用一般现在时。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Dear Chris,\nI am writing to invite you to the Guangzhou Culture Festival in our school hall next Saturday. The festival will start at nine in the morning and last about three hours. There will be a Cantonese opera show, and you can also try making dim sum by yourself. Some students will teach us how to cut beautiful paper flowers. Since you are always interested in Chinese culture, I am sure you will enjoy every minute of it. Please let me know whether you can come before Thursday. I am looking forward to seeing you there.\nYours,\nLi Hua',
          cn:
            '亲爱的克里斯：我写信是想邀请你来参加下周六在我们学校礼堂举办的广州文化节。文化节上午九点开始，持续约三个小时。届时会有粤剧表演，你还可以亲手试着做点心。一些同学会教我们剪漂亮的纸花。因为你一直对中国文化感兴趣，我相信你会喜欢这里的每一分钟。请在周四之前告诉我你能否来。期待在那里见到你。你的，李华',
          comment:
            '这是一篇一类文。格式完整，称呼、正文、结束语与署名齐全，Yours 与署名分两行，完全符合邮件要求。要点也全覆盖：时间与地点在第一句交代，活动介绍落到粤剧、点心、剪纸三个具体细节，而不是空喊 interesting。语言层次是决定分数的关键：一般将来时贯穿始终，There will be 与 will teach 都用对了；Since 引导的原因状语从句加上 whether 引导的宾语从句，正好满足题目的句式要求；look forward to seeing 用动名词，介词后接动词形式的细节也没有错。结尾 ask for a reply 的时间点明确，礼貌而不啰嗦，基本没有失分点。',
          highlights: [
            {
              sentence:
                'I am writing to invite you to the Guangzhou Culture Festival in our school hall next Saturday.',
              why:
                '开头第一句就把「邀请谁、参加什么、什么时间、在哪里」全部交代清楚，收信人不必往下找信息；I am writing to invite you to ... 是邀请信最稳妥、也最省词数的开头句型。',
            },
            {
              sentence:
                'Since you are always interested in Chinese culture, I am sure you will enjoy every minute of it.',
              why:
                'Since 引导的原因状语从句把「为什么请你」讲透，同时落实了题目给的第三条要点；I am sure you will ... 比 You will like it 更有期待感，every minute of it 也让结尾显得热情。',
            },
            {
              sentence: 'Please let me know whether you can come before Thursday.',
              why:
                '用 whether 引导的宾语从句提出明确请求，并给出回复截止时间，正是邀请信的第四个要点；Please let me know whether ... 是英语书信里最常用的收尾句式，语气客气又清晰。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Dear Chris,\nI want to invite you to a festival. It is Guangzhou Culture Festival. It is in our school hall. It is next Saturday. The festival will start at nine. We have Cantonese opera. We also have dim sum and paper cutting. It is very interesting. You like Chinese culture, so you will like it. I think it is a good chance. Please come to our school. Please tell me you can come. I wait for you there.\nYours,\nLi Hua',
          cn:
            '亲爱的克里斯：我想邀请你来参加一个节日。它是广州文化节。它在我们学校礼堂。它在下周六。文化节九点开始。我们有粤剧。我们也有点心和剪纸。它非常有趣。你喜欢中国文化，所以你会喜欢的。我觉得这是个好机会。请来我们学校。请告诉我你能来。我在那里等你。你的，李华',
          comment:
            '这篇属于二类文，13—16 分。优点是格式没丢，四条要点都提到了。失分点有三处。第一，句式单调：It is 开头四次、We have 两次，没有从句与连接词。第二，内容笼统：粤剧、点心、剪纸只是列举名词，It is very interesting 属于空话。第三，准确性有漏洞：It is Guangzhou Culture Festival 缺 the，Please tell me you can come 少了 whether。升格两步：用 There will be 把三项活动并成一句，再用 Please let me know whether you can come 替换最后两句。',
          highlights: [
            {
              sentence: 'You like Chinese culture, so you will like it.',
              why:
                '用 so 连接因果关系，落实了「他对中国文化感兴趣」这条要点，是全篇结构最完整的一句。但两句都只用 like，用词重复；若改成 you are interested in Chinese culture, so I am sure you will enjoy it，准确度立刻提高。',
            },
            {
              sentence: 'The festival will start at nine.',
              why:
                '全篇唯一的将来时句子，时态用对了，说明时间安排这条要点抓得住。可惜前面连用四个 It is 短句报时间地点，显得零碎；把它们并成一句 The festival will start at nine next Saturday in our school hall，句子就有了层次。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'I am writing to invite you to ...（邀请信开头，交代写信目的）',
        'I am writing to say thank you for ...（感谢信开头）',
        'There will be ... , and you can also ...（介绍活动，替换 We have ...）',
        'Since you are interested in ... , I am sure you will enjoy ...（原因从句 + 期待）',
        'Please let me know whether you can come before ...（用 whether 从句要答复）',
        'I am looking forward to seeing you there.（look forward to 后接动名词）',
        'Thank you again for your help. It meant a lot to me.（感谢信结尾，具体说明影响）',
        'Why not ...? / It would be a good idea to ...（建议信里的委婉句式）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-3-q1',
        type: 'fill',
        stem: '补全邀请信的句子。\nI am writing to ____ you to our English corner this Friday.',
        answer: 'invite',
        explanation:
          'invite sb to a place 或 invite sb to do sth 表示邀请某人参加某事；I am writing to 后接动词原形，说明写信目的，是书信开头最常用的句型。',
        difficulty: 1,
        tags: ['书信', '补全句子'],
      },
      {
        id: 'eng-writing-3-q2',
        type: 'choice',
        stem: '下列哪一句最适合用在感谢信的结尾？',
        options: [
          'I am writing to invite you to my birthday party.',
          'Thank you again for your help. It meant a lot to me.',
          'Why not come to the club with me?',
          'Please tell me what time you will arrive.',
        ],
        answer: 'B',
        explanation:
          '感谢信结尾要再次致谢并说明这次帮助的意义，Thank you again for ... It meant a lot to me 既礼貌又具体；A 是邀请，C 是建议，D 是询问信息，都不符合感谢信的收尾要求。',
        difficulty: 2,
        tags: ['书信', '文体判断'],
      },
      {
        id: 'eng-writing-3-q3',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nI am looking forward to ____ (see) you at the Culture Festival.',
        answer: 'seeing',
        explanation:
          'look forward to 里的 to 是介词，后面接名词或动名词，所以用 seeing；这类「to 是介词」的短语还有 be used to doing、pay attention to doing。',
        difficulty: 2,
        tags: ['书信', '非谓语'],
      },
      {
        id: 'eng-writing-3-q4',
        type: 'fill',
        stem: '补全建议信的句子。\nIt ____ be a good idea to take part in the English corner.',
        answer: 'would',
        explanation:
          'It would be a good idea to do sth 是提建议的委婉句式，用 would 而不是 will，语气才够客气；同义句式还有 Why not ...? 与 You had better ...。',
        difficulty: 2,
        tags: ['书信', '建议信'],
      },
      {
        id: 'eng-writing-3-q5',
        type: 'choice',
        stem: '英语电子邮件的落款，哪一项格式正确？',
        options: [
          'Yours, 然后另起一行写 Li Hua',
          'yours 然后另起一行写 li hua',
          'Yours: 然后另起一行写 Li Hua',
          '把 Yours 与 Li Hua 写在正文最后一行中间',
        ],
        answer: 'A',
        explanation:
          '结束语 Yours 首字母大写、后面加逗号，署名另起一行、人名首字母大写；用冒号、全部小写或把署名挤在正文末尾都不符合英语书信习惯，格式分会被扣。',
        difficulty: 1,
        tags: ['书信', '格式'],
      },
      {
        id: 'eng-writing-3-q6',
        type: 'fill',
        stem: '补全邀请信的结尾。\nPlease let me ____ whether you can come before Thursday.',
        answer: 'know',
        explanation:
          'let sb do sth 中 let 后接动词原形，所以填 know；whether you can come 是宾语从句，要用陈述句语序，不能写成 whether can you come。',
        difficulty: 2,
        tags: ['书信', '宾语从句'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 4. 书面表达（二）话题作文                                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-4',
    grade: 'all',
    unit: '书面表达',
    title: '书面表达（二）·话题作文',
    enTitle: 'Topic Writing: School Life, Environment, Health and Culture',
    summary:
      '校园生活、环保、健康、传统文化四大高频话题的素材与套路：每个话题都准备「一句观点 + 两个细节 + 一句呼吁」，考场直接组装成篇。',
    points: [
      {
        level: '重点',
        text: '话题作文按「总—分—总」三段走：表明观点、分点举例、总结呼吁',
        explain:
          '首段一句表明态度（Protecting the environment matters because ...），中段用 First、Second 举两个具体例子，末段用祈使句或 should 发出呼吁。段落一分明，内容分与结构分同时到手。',
      },
      {
        level: '重点',
        text: '例子必须具体：写清「谁做什么、多久做一次」',
        explain:
          '题目常要求「举出两件你能做到的小事」，只写 We should protect the environment 是空话。要落到动作与频率：I go to school by underground every day. I take a cloth bag when I go shopping。',
      },
      {
        level: '重点',
        text: '环保话题必备词汇与句型：reduce、reuse、recycle、save water and electricity、take public transport',
        explain:
          '这三个以 re- 开头的词在环保作文里几乎必用：reduce the waste（减少浪费）、reuse the boxes（重复利用）、recycle the paper（回收）。替换 do good things 这类空泛表达能明显提分。',
      },
      {
        level: '重点',
        text: '健康话题写清三件事：饮食、运动、睡眠，建议句用 should 或 had better',
        explain:
          '内容要点通常要求「至少两条建议」，写 keep a balanced diet、do sports for an hour a day、go to bed before ten 各一句就够；had better 后必须接动词原形，不能说 had better to do。',
      },
      {
        level: '次重点',
        text: '传统文化话题要举具体事物：粤剧、早茶、剪纸、端午节',
        explain:
          'Chinese culture is great 这种句子不得分。要说清是什么、有什么特点、你为它做了什么：I have learned to make paper cuttings of the Cantonese opera masks. 越具体越像真实生活。',
      },
      {
        level: '了解',
        text: '同一素材可以跨话题改写：捡垃圾既能写进环保，也能写进校园生活',
        explain:
          '素材是通用的，关键是换标题句与总结句。写环保时落点在「地球」，写校园生活时落点在「同学与集体」。考场上先定话题，再选素材，不要临时想例子。',
      },
    ],
    writing: {
      topic:
        '学校英文报「Green Life」专栏征文，请以 Small Actions, Big Changes 为题，写一篇短文，谈谈作为中学生怎样为环保出力。\n内容要点：\n1. 说明环保为什么重要；\n2. 举出两件你或同学能做到的小事；\n3. 呼吁大家一起行动。',
      requirements: [
        '80 词左右，使用所给题目或自拟题目，写成一篇完整短文。',
        '须写出至少两个具体的环保行动，并至少写明一个数字或频率（如 every day、twice a week）。',
        '至少使用一个祈使句，并至少使用一个 should 或 had better 引导的建议句。',
        '使用连接词使层次清楚，书写规范，标点正确。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Small Actions, Big Changes\nProtecting the environment matters because we have only one Earth, and every small action can make a difference. In my daily life I try to do two things. First, I go to school by underground every day instead of asking my parents to drive me, which saves both energy and money. Second, I take a cloth bag when I go shopping, so I use fewer plastic bags. We had better turn off the lights when we leave the classroom. Let us start with these little habits today, and our city will be greener and cleaner.',
          cn:
            '小小的行动，巨大的改变\n保护环境很重要，因为我们只有一个地球，每一个小小的行动都能带来改变。在日常生活中我努力做两件事。第一，我每天坐地铁上学，而不是让父母开车送我，这既省能源又省钱。第二，我购物时带布袋，所以用的塑料袋更少。我们最好离开教室时随手关灯。让我们从今天起养成这些小习惯，我们的城市会变得更绿、更干净。',
          comment:
            '这篇一类文胜在「有观点、有细节、有呼吁」。内容上三条要点齐全，两个行动分别写在交通和购物上，还各带一个细节，比只喊口号的文章扎实。语言上最亮的是句式变化：动名词短语作主语、instead of、非限制性定语从句 which saves 三种结构连用，同时祈使句 Let us start ... 与 We had better ... 满足了题目的句式要求。衔接也顺，First、Second、also 把行动排得清清楚楚，结尾落在 greener and cleaner 上，与题目形成呼应。需要注意的是词数已接近上限，考场上不要再随意加句，写完后一定要数一遍。',
          highlights: [
            {
              sentence:
                'Protecting the environment matters because we have only one Earth, and every small action can make a difference.',
              why:
                '用动名词短语作主语开头，比 It is important to protect the environment 更有力；because 把「为什么重要」讲清，make a difference 又与题目 Small Actions, Big Changes 呼应，是很好的破题句。',
            },
            {
              sentence:
                'First, I go to school by underground every day instead of asking my parents to drive me, which saves both energy and money.',
              why:
                'First 领起第一个行动，instead of 构成对比，非限制性定语从句 which saves ... 顺手补出「为什么这件事环保」；一句话里同时有具体做法、频率与原因，内容分和语言分一起赚到。',
            },
            {
              sentence:
                'Let us start with these little habits today, and our city will be greener and cleaner.',
              why:
                '祈使句收尾直接发出呼吁，用 and 把行动与结果串成一句，greener and cleaner 两个比较级并列简洁有力，正好落在第三条要点「呼吁大家一起行动」上。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Small Actions, Big Changes\nEnvironment is very important for everyone. We should protect environment. I do some small things in my life. I turn off the light when I leave the room. I save water when I wash my hands. I do not use plastic bag when I go shopping. I also walk to school. These things are small but they are useful. We should protect the environment together. If we all do this, the world will be better. Let us start from today. Everyone can do something for our earth.',
          cn:
            '小小的行动，巨大的改变\n环境对每个人都很重要。我们应该保护环境。我在生活中做一些小事。我离开房间时关灯。我洗手时节约用水。我购物时不用塑料袋。我也走路上学。这些事很小，但它们很有用。我们应该一起保护环境。如果我们都这样做，世界会更好。让我们从今天开始。每个人都能为我们的地球做点事。',
          comment:
            '这篇是二类文。结构完整，观点、例子、呼吁三块都在，should、If 从句、祈使句都用对了。差距有三点。第一，细节太单薄：四个例子各自成一句，没有一条写出频率或数字，题目要求的「至少一个数字或频率」落了空。第二，语言偏平：缺少 because、so、instead of 这类连接，句子像并列清单。第三，准确度有硬伤：We should protect environment 丢了冠词，I do not use plastic bag 应写 a plastic bag。升格办法是挑两个例子展开成因果句，补上 every day 之类的时间状语。',
          highlights: [
            {
              sentence: 'These things are small but they are useful.',
              why:
                '用 but 连接转折，把「小」与「有用」对照起来，是全文最贴近题目 Small Actions, Big Changes 的一句，说明作者有对比意识。若再具体一点，写成 These small actions can make a big difference 就更有力。',
            },
            {
              sentence: 'We should protect the environment together.',
              why:
                'should 用对了，符合题目对建议句的要求，together 也照顾到「呼吁大家一起行动」这条要点。但前面的例子都以「我」为中心，到这里突然换成 we，中间缺一句过渡，读起来有点跳。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'Protecting the environment matters because ...（动名词作主语，开头表明观点）',
        'In my daily life I try to do two things. First, ... Second, ...（分段举例的固定框架）',
        'instead of + 动名词（表示「而不是」，对比两种做法）',
        '..., which saves both energy and money.（非限制性定语从句补充原因）',
        'We had better ... / We should ... / It is a good idea to ...（三种建议句式轮换用）',
        'Let us start with ... , and ... will be greener and cleaner.（祈使句发出呼吁）',
        'make a difference（起作用、带来改变，替换 be useful）',
        'turn off the lights / save water / take public transport / use fewer plastic bags（环保行动高频短语）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-4-q1',
        type: 'fill',
        stem:
          '根据中文提示补全句子。\n保护环境很重要，因为我们只有一个地球。\nProtecting the environment ____ because we have only one Earth.',
        answer: 'matters|is important',
        explanation:
          '动名词短语 Protecting the environment 作主语，谓语用第三人称单数。用 matters 是一个词解决；若用 is，后面必须补上形容词 important，不能只写 is。',
        difficulty: 2,
        tags: ['话题作文', '补全句子'],
      },
      {
        id: 'eng-writing-4-q2',
        type: 'choice',
        stem: '下列哪一句表达正确？',
        options: [
          'We had better use fewer plastic bags.',
          'We had better use less plastic bags.',
          'We had better to use fewer plastic bags.',
          'We had better using fewer plastic bags.',
        ],
        answer: 'A',
        explanation:
          'had better 后接动词原形，既不能加 to 也不能用 -ing；bags 是可数名词复数，要用 fewer 而不是 less，less 修饰不可数名词。',
        difficulty: 2,
        tags: ['话题作文', '建议句式'],
      },
      {
        id: 'eng-writing-4-q3',
        type: 'fill',
        stem:
          '用所给词的适当形式填空。\nI go to school by underground instead of ____ (ask) my parents to drive me.',
        answer: 'asking',
        explanation:
          'instead of 是介词短语，后面接名词或动名词，所以用 asking；要注意与 instead（副词，单独使用）区分：I walked instead.。',
        difficulty: 2,
        tags: ['话题作文', '非谓语'],
      },
      {
        id: 'eng-writing-4-q4',
        type: 'fill',
        stem: '根据中文提示补全句子，每空一词。\n与其开车，我们不如坐公交车。\n____ of driving a car, we can take a bus.',
        answer: 'Instead',
        explanation:
          'instead of 后接名词或动名词，位于句首时首字母要大写，所以填 Instead；整句意思是「不开车，我们可以坐公交」，比 we should not drive 更委婉。',
        difficulty: 2,
        tags: ['话题作文', '固定搭配'],
      },
      {
        id: 'eng-writing-4-q5',
        type: 'fill',
        stem:
          '用所给词的适当形式填空。\nIf everyone ____ (play) a part in saving water, the city will be better.',
        answer: 'plays',
        explanation:
          'if 引导的条件状语从句遵循「主将从现」：主句用一般将来时 will be，从句用一般现在时；everyone 作主语视为单数，所以用 plays。',
        difficulty: 2,
        tags: ['话题作文', '时态'],
      },
      {
        id: 'eng-writing-4-q6',
        type: 'choice',
        stem: '写健康话题时，下列哪一项搭配正确？',
        options: ['keep a healthy diet', 'do a healthy diet', 'make a healthy diet', 'take a healthy diet'],
        answer: 'A',
        explanation:
          'diet 常与 keep 或 have 搭配，keep a healthy diet 表示保持健康饮食；do、make、take 都不能与 diet 这样搭配。同类高频搭配还有 do sports、keep fit、stay healthy。',
        difficulty: 2,
        tags: ['话题作文', '搭配'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 5. 书面表达（三）图表与数据描述                                      */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-5',
    grade: 'all',
    unit: '书面表达',
    title: '书面表达（三）·图表与数据描述',
    enTitle: 'Describing Charts and Data',
    summary:
      '柱状图、表格、调查结果类作文的固定写法：先总述调查主题与对象，再说最高最低两项，然后分析原因，最后给出建议。',
    points: [
      {
        level: '重点',
        text: '首段总述：The chart shows the results of a survey on ... among ... students.',
        explain:
          '图表作文第一句必须交代三件事：什么图、调查什么、调查对象是谁。这句话是模板句，考场直接套；写完再补一句 the results are worth thinking about，就有了评论的味道。',
      },
      {
        level: '重点',
        text: '抓两端：先说占比最高与最低的两项，再补中间项，不必平均用力',
        explain:
          '题目常要求「指出最高和最低」，用 which is the highest among the four choices 这类定语从句一次说完。四项数据平均分配字数，反而显得没有重点。',
      },
      {
        level: '重点',
        text: '数据表达要准：half of the students、about 40 percent of the students、three times as many as',
        explain:
          '百分数写百分数 + of + the + 名词，谓语单复数与 of 后面的名词一致；percent 单复数同形，不能写 percents；倍数用 twice as many as、three times as much as。',
      },
      {
        level: '重点',
        text: '有结论还要有分析：The reason may be that ... 比只罗列数字多拿内容分',
        explain:
          '题目几乎都会要求「分析原因」或「谈谈看法」。用 The reason may be that ... 引出推测，再用 However 转折指出问题，最后用 Therefore 给建议，层次立刻出来。',
      },
      {
        level: '次重点',
        text: '表示数据变化的动词：rise、fall、go up、drop，注意 rise 与 raise 的区别',
        explain:
          'rise 是不及物动词，主语是数据本身：The number rose from 20 to 35；raise 是及物动词，后面必须带宾语：raise money、raise your hand。写错方向会改变句意。',
      },
      {
        level: '了解',
        text: '数字写法：句首的数字写成英文单词，百分号写在数字后面不加空格',
        explain:
          '句首一般不用阿拉伯数字，可写成 Forty percent of the students ... 或换一个开头。正文中的 40 percent、200 students 直接写数字即可，注意 percent 前有空格、后面不加 s。',
      },
    ],
    writing: {
      topic:
        '上周你校对 200 名学生的课余活动做了问卷调查，结果如下（柱状图）：使用手机 40%、做运动 30%、读书 20%、做家务 10%。请你根据调查结果写一篇英语短文投给校英文报。\n内容要点：\n1. 简要说明调查的对象与结果；\n2. 指出占比最高和最低的两项；\n3. 分析其中一个现象的原因；\n4. 提出你的建议。',
      requirements: [
        '80 词左右，四个数据必须全部出现，顺序可以调整。',
        '至少使用两种数据表达方式，如 about 40 percent of the students、20 percent of them。',
        '对调查结果要有原因分析或看法，不能只罗列数字。',
        '书写规范，数字与百分号写法正确。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Last week we asked 200 students in our school about their free-time activities, and the results are worth thinking about. About 40 percent of them spend their spare time on mobile phones, which is the highest among the four choices. Sports come second at 30 percent, while reading takes up 20 percent, and housework only 10 percent. I think the reason is simple: phones are easy to reach and they give us quick fun. However, too much screen time is bad for our eyes. Therefore, I suggest we put down our phones and play ball games for an hour every day.',
          cn:
            '上周我们就有 200 名学生的课余活动做了调查，结果值得思考。约 40% 的学生把闲暇时间花在手机上，这在四个选项中占比最高。运动以 30% 排在第二，读书占 20%，做家务只占 10%。我觉得原因很简单：手机触手可及，还能很快带来乐趣。然而，屏幕时间过长对我们的眼睛有害。因此，我建议大家放下手机，每天打一小时球。',
          comment:
            '这篇一类文把图表作文的四步走得很稳。首段交代调查对象、人数与主题，还用 the results are worth thinking about 亮出态度。中段不平均用力：先用定语从句点明最高项，再用 while 把其余三项并成一句，最低的 10% 用省略结构带出，既省词数又有对比。原因与建议在后面完成——The reason is simple 给出解释，However 转折指出问题，Therefore 收在可执行的动作上。数据表达规范，percent 没加 s，谓语单复数与 of 后的名词一致，全篇没有语法失分点。',
          highlights: [
            {
              sentence:
                'About 40 percent of them spend their spare time on mobile phones, which is the highest among the four choices.',
              why:
                '一句话把最高项与「它最高」这个判断同时说出来；About 40 percent of them 是标准的数据表达，非限制性定语从句 which is the highest 直接完成「指出占比最高」这条要点，比另起一句更紧凑。',
            },
            {
              sentence:
                'Sports come second at 30 percent, while reading takes up 20 percent, and housework only 10 percent.',
              why:
                'while 表示对比，把三项数据串成一句，剩下的最低项用省略结构 housework only 10 percent 点出；句式不重复又省词数，正是图表作文最需要的效率。',
            },
            {
              sentence: 'Therefore, I suggest we put down our phones and play ball games for an hour every day.',
              why:
                'Therefore 承接前面的问题给出结论，I suggest 后接宾语从句提建议，put down 与 play ball games 是两个可落地的动作，还有 for an hour every day 的具体安排，建议不空泛。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Last week we did a survey in our school. We asked 200 students about their free time activities. 40 percent students use mobile phone. 30 percent students do sports. 20 percent students read books. 10 percent students do housework. Mobile phone is the biggest number. I think mobile phone is very interesting. So we should not use it too much. It is bad for our eyes. We should do more sports. Sports is good for our health. I hope everyone can use phones less and do more sports.',
          cn:
            '上周我们在学校做了一次调查。我们问了 200 名学生的课余活动。40% 的学生使用手机。30% 的学生做运动。20% 的学生读书。10% 的学生做家务。手机是最大的数字。我觉得手机很有趣。所以我们不应过度使用它。它对我们的眼睛有害。我们应该多做运动。运动对我们的健康有好处。我希望每个人都能少用手机、多做运动。',
          comment:
            '这篇是二类文。四个数据都在，还补了原因与建议，语法基本正确。差距在两处。一是数据表达不规范：40 percent students 缺少 of the，应为 40 percent of the students；Mobile phone is the biggest number 把「手机」当成「数字」，是最常见的失分点。二是句式单一：十多句几乎都是主谓宾短句，连接词只有 So，缺少 while、However 的过渡。升格建议：先把 percent of the 改对，再用 while 并句，最后把 I think 换成 The reason may be that。',
          highlights: [
            {
              sentence: 'I hope everyone can use phones less and do more sports.',
              why:
                '用 I hope 收尾提出希望，use phones less 与 do more sports 前后对照，是全文结构最好的一句，也补上了「提建议」这条要点。若前面的数据部分也这样讲究句式，档次会明显不同。',
            },
            {
              sentence: 'It is bad for our eyes.',
              why:
                '用 It is + 形容词 + for sb 说清玩手机的坏处，简单句准确无误，是全文唯一的分析句。但它孤零零地夹在两个建议句之间，没有 because 或 However 与上文相连，读起来像突然插进来的一句话。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'The chart / table shows the results of a survey on ... among ... students.（首段总述模板句）',
        'About 40 percent of the students ... , which is the highest among the four choices.（点出最高项）',
        '... come second at 30 percent, while ... takes up 20 percent.（while 表示对比）',
        'A is three times as many as B.（倍数比较）',
        'The number of students who ... rose from 20 to 35.（写数据变化，用不及物动词 rise）',
        'The reason may be that ...（引出原因分析）',
        'However, too much ... is bad for ...（转折指出问题）',
        'Therefore, I suggest we ...（收尾提出建议）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-5-q1',
        type: 'fill',
        stem:
          '根据中文提示补全句子，每空一词。\n约 40% 的学生把空闲时间花在手机上。\nAbout 40 percent ____ the students spend their spare time on mobile phones.',
        answer: 'of',
        explanation:
          '百分数作主语时要用「百分数 + of + the + 名词」的结构，percent 是名词，后面必须接 of；of 后的名词前加 the 特指被调查的那些学生。',
        difficulty: 1,
        tags: ['图表作文', '数据表达'],
      },
      {
        id: 'eng-writing-5-q2',
        type: 'choice',
        stem: '下列哪一句表达正确？',
        options: [
          '40 percents of the students like sports.',
          '40 percent of the students like sports.',
          '40 percent of the students likes sports.',
          '40 percent students like sports.',
        ],
        answer: 'B',
        explanation:
          'percent 单复数同形，不能写 percents；of 后面要用 the 特指调查对象；percent of + 名词作主语时，谓语的单复数与 of 后面的名词一致，students 是复数，所以用 like。',
        difficulty: 2,
        tags: ['图表作文', '主谓一致'],
      },
      {
        id: 'eng-writing-5-q3',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nThe number of students who do sports ____ (be) larger than before.',
        answer: 'is',
        explanation:
          'the number of 表示「……的数量」，作主语时谓语用单数 is；若句子是 A number of students do sports，谓语才用复数。这是图表作文里最容易被忽略的一处主谓一致。',
        difficulty: 3,
        tags: ['图表作文', '主谓一致'],
      },
      {
        id: 'eng-writing-5-q4',
        type: 'fill',
        stem:
          '根据中文提示补全句子。\n读书的学生人数从 20 上升到 35。\nThe number of students who read books ____ from 20 to 35.',
        answer: 'rose',
        explanation:
          '表示数据「上升」用不及物动词 rise，过去式是 rose；from ... to ... 交代变化的起点与终点。raise 是及物动词，必须带宾语，不能这样用。',
        difficulty: 3,
        tags: ['图表作文', '数据变化'],
      },
      {
        id: 'eng-writing-5-q5',
        type: 'choice',
        stem: '图表作文的首段，下列哪一句写得最恰当？',
        options: [
          'The chart shows the results of a survey on free-time activities among 200 students.',
          'The chart show the results of a survey on free-time activities among 200 students.',
          'The chart showing the results of a survey on free-time activities among 200 students.',
          'The chart shows the results of a survey on free-time activities among 200 student.',
        ],
        answer: 'A',
        explanation:
          '主语 The chart 是第三人称单数，谓语用 shows；B 主谓不一致，C 整句没有谓语，D 中 200 student 应为复数 students。首段这三件事——什么图、调查什么、调查谁——必须齐全。',
        difficulty: 2,
        tags: ['图表作文', '开篇句式'],
      },
      {
        id: 'eng-writing-5-q6',
        type: 'fill',
        stem:
          '根据中文提示补全句子。\n做运动对我们的健康有好处。\nDoing sports ____ our health.',
        answer: 'is good for',
        explanation:
          '动名词短语作主语时谓语用单数，be good for 表示「对……有好处」；注意与 be good at（擅长）、be good to（对……友好）区分，介词选错句意就变了。',
        difficulty: 2,
        tags: ['图表作文', '固定搭配'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 6. 书面表达（四）看图说话与情境写作                                  */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-6',
    grade: 'all',
    unit: '书面表达',
    title: '书面表达（四）·看图说话与情境写作',
    enTitle: 'Picture-based and Situational Writing',
    summary:
      '活动通知、日记、演讲稿三种情境文体的格式与语气差异，加上看图作文的「图序—动词—连接词」三步写法。',
    points: [
      {
        level: '重点',
        text: '活动通知必须写清五要素：活动名称、时间、地点、参加对象、注意事项',
        explain:
          '通知类题目只要漏掉时间或地点就扣内容分。常用句式：There will be a lecture on ... in the school hall at 3 p.m. on Friday. 结尾补一句 All the students are welcome to ... 或 Please sign up before ...。',
      },
      {
        level: '重点',
        text: '日记格式：左上角写星期与日期，右上角写天气，正文用第一人称和过去时',
        explain:
          '英语日记开头写 Wednesday, September 10th，右上角写 Sunny 或 Rainy。正文叙事一律用过去时，写感想可用一般现在时。漏写日期或天气，格式分就没了。',
      },
      {
        level: '重点',
        text: '演讲稿要有称呼、开场点题和结尾致谢',
        explain:
          '称呼用 Dear teachers and classmates, 开场用 Good morning! Today I would like to talk about ...，结尾用 Thank you! 演讲对象是听众，所以句子要短、要有鼓动性，多用 Let us ... 这样的祈使句。',
      },
      {
        level: '重点',
        text: '看图作文按图序写，每幅图至少一个主要动词，用 First / Then / After that / Finally 衔接',
        explain:
          '先把每幅图译成一个动词短语（pick up rubbish、take a photo），再按顺序串成句子，全篇时态以一般过去时为主，若最后要写感受或呼吁再换成现在时。',
      },
      {
        level: '次重点',
        text: '三种文体的语气差异：通知客观简洁、日记私密随感、演讲有鼓动性',
        explain:
          '同一个活动，写通知用被动和 There will be（客观），写日记用 I felt so excited（主观），写演讲用 Let us join in（号召）。语气用错，即使语法全对，评卷时也会觉得不像那种文体。',
      },
      {
        level: '了解',
        text: '情境写作要符合身份与对象：写给老师要称呼 Mr / Ms，写给同学可以用 Let us',
        explain:
          '题目会给出你的身份与写作对象，称呼和语气要跟着变。给外国人介绍中国文化时，还要加一句解释性的话，如 dim sum is a kind of Cantonese food，照顾读者。',
      },
    ],
    writing: {
      topic:
        '学校下周举行英语演讲比赛，主题为 Reading Makes Me Grow。请你写一篇演讲稿参赛。\n内容要点：\n1. 开场问候并点出演讲主题；\n2. 讲一件读书带给你的真实改变（举一本书或一件事为例）；\n3. 向同学发出读书倡议；\n4. 结尾致谢。',
      requirements: [
        '80 词左右，必须符合演讲稿格式：有称呼 Dear teachers and classmates, 与结尾 Thank you!',
        '至少要有一个具体例子，写明书名或具体情节，不能只说 reading is good。',
        '使用至少两个连接词使层次清楚，并至少使用一处现在完成时。',
        '语气积极有鼓动性，书写规范。',
      ],
      samples: [
        {
          level: '一类文（18—20 分）',
          text:
            'Dear teachers and classmates,\nGood morning! Today I would like to talk about reading. Reading makes me grow. Two years ago I was afraid of speaking English because I could not find the right words. Then I read a story about a shy girl who practised in front of a mirror every day. Her courage encouraged me, and since then I have taken part in three English speech contests. Books have given me both words and courage. Let us open a book today, and we will grow a little every day. Thank you!',
          cn:
            '亲爱的老师、同学们：早上好！今天我想谈一谈阅读。阅读让我成长。两年前我不敢开口说英语，因为我找不到合适的词。后来我读到一个故事，讲的是一个害羞的女孩每天对着镜子练习。她的勇气鼓励了我，从那以后我参加了三次英语演讲比赛。书既给了我词语，也给了我勇气。让我们今天就打开一本书，我们每天都会成长一点点。谢谢！',
          comment:
            '这篇一类文完全对准了演讲稿的文体要求。称呼与 Thank you! 齐全，开场点题、结尾号召，收放都在。内容上最见功力的是那个具体例子：一位对着镜子练习的害羞女孩，有情节、有细节，把「读书让我成长」这条抽象主题落在了自己身上。语言上时态安排讲究：Two years ago 用过去时交代起点，since then、have taken part、have given 用现在完成时表现持续变化，正好满足题目要求；Then、since then、and 把段落串得顺。结尾与题目相扣，朗朗上口。',
          highlights: [
            {
              sentence:
                'Two years ago I was afraid of speaking English because I could not find the right words.',
              why:
                '用 Two years ago 设一个具体的起点，be afraid of 后接动名词形式正确，because 从句交代原因，为后面的转变做铺垫；有了这个「以前」，后面的成长才可信。',
            },
            {
              sentence:
                'Her courage encouraged me, and since then I have taken part in three English speech contests.',
              why:
                'since then 与现在完成时 have taken part 搭配，正好落实题目要求的时态要点；three 这个数字让「改变」看得见，比只写 I became brave 强得多。',
            },
            {
              sentence: 'Let us open a book today, and we will grow a little every day.',
              why:
                '祈使句发出倡议，语气有鼓动性；a little every day 与题目 Reading Makes Me Grow 相互呼应，结尾既不空洞，又让听众记得住。',
            },
          ],
        },
        {
          level: '二类文（13—16 分）',
          text:
            'Dear teachers and classmates,\nI am Li Hua. I want to talk about reading. Reading is good. I like reading very much. I read many books. Last year I read a book. It is about a girl. She is very brave. I learn a lot from her. Now I am brave too. I think everyone should read books. Books are our friends. They can help us to know the world. I hope we can all read more books. Let us read together. Thank you.',
          cn:
            '亲爱的老师、同学们：我是李华。我想谈谈阅读。阅读很好。我非常喜欢阅读。我读了很多书。去年我读了一本书。它是关于一个女孩的。她非常勇敢。我从她身上学到很多。现在我也很勇敢。我认为每个人都应该读书。书是我们的朋友。它们能帮我们认识世界。我希望我们都能多读书。让我们一起读书吧。谢谢。',
          comment:
            '这篇是二类文。演讲稿格式完整，称呼和 Thank you 都在，「倡议」这条要点也落实了。失分有三处。第一，例子太虚：Last year I read a book 之后只有 It is about a girl，没有书名也没有情节，这条要点等于没完成。第二，语言太简单：十多句几乎都是主谓宾，连接词只有 and 和 too，全篇没有出现题目要求的现在完成时。第三，时态前后矛盾：前文用 Last year 与 read 交代过去，紧接着却写 It is about a girl、She is very brave，过去的事必须统一用过去时。升格做法是补上书名与情节，把描写女孩的两句改成过去时。',
          highlights: [
            {
              sentence: 'Books are our friends. They can help us to know the world.',
              why:
                '比喻用得好，把书比作朋友，又补上具体作用，是全文最有感染力的一处，符合演讲稿结尾要能打动听众的要求。若前面能配一个具体书名或情节，这两句的分量会大得多。',
            },
            {
              sentence: 'Last year I read a book.',
              why:
                '点明时间，说明作者知道例子需要交代出处，这是值得肯定的意识。可惜后面只用 It is about a girl 一句带过，书名与情节都没写；而且过去的事紧接着用 is 来描述，时态与上一句打架。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'Good morning! Today I would like to talk about ...（演讲稿开场点题）',
        'Two years ago I ... , but now I ...（对比开头，突出变化）',
        'since then I have ...（since then 与现在完成时搭配）',
        'Let us ... , and we will ...（祈使句发出倡议）',
        'Thank you!（演讲稿结尾致谢）',
        'All the students are welcome to ... / Please sign up before Friday.（活动通知常用句）',
        'First ... Then ... After that ... Finally ...（看图作文按图序衔接）',
        'It was sunny and warm that day.（日记写天气，整句用过去时）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-6-q1',
        type: 'fill',
        stem:
          '英语日记的左上角通常写星期与日期。请补全下面的日记开头。\n____, September 10th  Sunny',
        answer: 'Wednesday',
        explanation:
          '英语日记一般左上角写星期（在前）与日期，右上角写天气；星期几首字母必须大写，后面加逗号。漏写日期或天气都会影响格式分。',
        difficulty: 1,
        tags: ['情境写作', '日记格式'],
      },
      {
        id: 'eng-writing-6-q2',
        type: 'choice',
        stem: '下列哪一句最适合作为英语演讲稿的开头？',
        options: [
          'I am writing to invite you to our English speech contest.',
          'Good morning, everyone! Today I would like to talk about reading.',
          'Dear Chris, how is everything going?',
          'All the students are welcome to take part in the contest.',
        ],
        answer: 'B',
        explanation:
          '演讲稿开头要先问候听众、再点出主题；A、C 都是书信写法，D 是活动通知的句式。三种文体的开头各有套路，混用会显得不像那种文体。',
        difficulty: 2,
        tags: ['情境写作', '文体判断'],
      },
      {
        id: 'eng-writing-6-q3',
        type: 'fill',
        stem:
          '用所给词的适当形式填空。\nSince then I ____ (take) part in three English speech contests.',
        answer: 'have taken',
        explanation:
          'since then 表示「从那时起一直到现在」，要与现在完成时连用，强调动作对现在的影响；主语是 I，所以用 have taken，不能写成 took。',
        difficulty: 2,
        tags: ['情境写作', '现在完成时'],
      },
      {
        id: 'eng-writing-6-q4',
        type: 'fill',
        stem:
          '补全活动通知。\n想去参观的同学请在本周五前报名。\nPlease ____ ____ before this Friday if you want to go.',
        answer: 'sign up',
        explanation:
          'sign up 表示报名参加，祈使句中 Please 后接动词原形；before this Friday 交代截止时间，是通知里必须写清的要素之一。',
        difficulty: 2,
        tags: ['情境写作', '活动通知'],
      },
      {
        id: 'eng-writing-6-q5',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nTwo years ago I was afraid of ____ (speak) English.',
        answer: 'speaking',
        explanation:
          'be afraid of 中的 of 是介词，后面接名词或动名词，所以用 speaking；同类结构还有 be proud of doing、be interested in doing。',
        difficulty: 2,
        tags: ['情境写作', '非谓语'],
      },
      {
        id: 'eng-writing-6-q6',
        type: 'choice',
        stem: '看图作文中，表示先后顺序的一组连接词，顺序正确的是：',
        options: ['finally, first, then', 'first, then, finally', 'then, first, finally', 'first, finally, then'],
        answer: 'B',
        explanation:
          '按图序叙述时先用 first 领起第一幅图，再用 then 或 after that 承接中间几幅图，最后用 finally 收尾，顺序不能颠倒，否则时间线就乱了。',
        difficulty: 1,
        tags: ['情境写作', '连接词'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 7. 高分语言：连接词、复合句与地道表达升级                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'eng-writing-7',
    grade: 'all',
    unit: '语言升级',
    title: '高分语言：连接词、复合句与地道表达升级',
    enTitle: 'Linking Words, Complex Sentences and Better Expressions',
    summary:
      '把「简单句排队」升格为「有连接、有从句、有地道搭配」的作文：连接词分层使用、三大从句各就各位、平庸句改高级句的三招。',
    points: [
      {
        level: '重点',
        text: '连接词分层使用：并列、递进、转折、因果、举例、总结各有专属词',
        explain:
          '并列用 and、but；递进用 besides、what is more；转折用 however、although；因果用 because、therefore；举例用 for example；总结用 in short、in a word。同一段里最多用两三个，堆砌反而扣分。',
      },
      {
        level: '重点',
        text: '三大从句在作文里的分工：宾语从句表达观点、定语从句补充细节、状语从句讲原因时间条件',
        explain:
          'I think that ... 表观点，the girl who practised ... 补细节，because / although / if 交代逻辑。一篇 80 词的作文里有两到三处从句，语言分就能站上一档，全靠短句连排最多停在二档。',
      },
      {
        level: '重点',
        text: '把「主谓宾短句」升格的三招：加从句、换动词短语、用非谓语',
        explain:
          'I was nervous 可升格为 Standing at the starting line, I felt my heart beating fast；I like reading 可升格为 Reading has become part of my life。这三招是升格训练的核心，考场上至少用上一招。',
      },
      {
        level: '重点',
        text: '地道搭配替换中式表达：very good 换 wonderful、helpful，I think 换 In my opinion',
        explain:
          'very 加形容词是最常见的中式写法，可换成 wonderful、moving、helpful、valuable 等具体形容词；I think 全篇出现三次以上就显得单调，可换 In my opinion、As far as I know、From my point of view。',
      },
      {
        level: '次重点',
        text: '避免同一主语连续开头：状语提前、代词指代、there be 换主语',
        explain:
          '全篇 I 开头四五次，读起来像流水账。把时间地点状语提前（Last Friday afternoon, ...），或用 it、there be 换主语，或用非谓语开头，都能让句子有起伏。',
      },
      {
        level: '了解',
        text: '中式双连词必须避免：although 与 but、because 与 so 不能同现',
        explain:
          '英语里一个句子只能有一个引导词。Although he was tired, but he kept running 是典型的中式错误，去掉 but 就对了；because 与 so 同理，二者只能留一个。',
      },
    ],
    writing: {
      topic:
        '下面的短文语言比较平庸，请你在不改变内容要点的前提下，把它升格为一篇高分短文（80 词左右）。\n原稿：Our school had a sports meeting last week. It was interesting. I took part in the long jump. I was very nervous. My classmates cheered for me. I felt happy. I think sports meeting is good.\n内容要点：\n1. 运动会的时间与整体感受；\n2. 你参加的项目与当时的心情；\n3. 同学给你的帮助；\n4. 你对运动会的认识。',
      requirements: [
        '80 词左右，内容要点一个不能少，但语言必须升级，不能只是把原稿的短句连起来。',
        '至少使用一个定语从句或状语从句，以及一个非谓语动词结构（现在分词、不定式或过去分词）。',
        '至少使用三个不同的连接词，不得重复使用同一个。',
        '不得出现 although ... but ...、because ... so ... 这类中式双连词。',
      ],
      samples: [
        {
          level: '一类文（升格版 18—20 分）',
          text:
            'Our school held a sports meeting last week, and the whole day was full of cheering and laughter. I took part in the long jump, which I had never tried before. Standing at the starting line, I felt my heart beating fast. Just then my classmates shouted my name and clapped their hands, so I ran forward and jumped as far as I could. Although I did not win a prize, I felt happier than ever. In short, a sports meeting teaches us that friendship matters more than the result.',
          cn:
            '上周我们学校举行了运动会，一整天都充满了欢呼声与笑声。我参加了跳远，这是我以前从没试过的项目。站在起跑线上，我感到心跳得很快。就在那时，同学们喊着我的名字为我鼓掌，于是我向前跑，尽了全力往前跳。虽然我没有获奖，但我感到前所未有的快乐。总之，运动会教会我们：友谊比结果更重要。',
          comment:
            '这是一篇升格成功的范文，与下面的原稿水平稿对照着看最有效。要点一条不少，表达方式全面升级：首句用 and 把「办运动会」与「整天热闹」并成一句，the whole day was full of cheering and laughter 换掉了平庸的 It was interesting。定语从句 which I had never tried before 补出细节，非谓语 Standing at the starting line 把「紧张」写成画面，Although 与 In short 分别承担转折与总结。全篇连接词不重复，也没有中式双连词。',
          highlights: [
            {
              sentence: 'Standing at the starting line, I felt my heart beating fast.',
              why:
                '现在分词短语作状语开头，避免了 I 连着出现；feel sth doing 表示动作正在发生，把「紧张」写得能看见，比 I was very nervous 生动得多，是升格训练里最值得背下来的一招。',
            },
            {
              sentence: 'Although I did not win a prize, I felt happier than ever.',
              why:
                'Although 引导让步状语从句，与主句构成「虽然没获奖，但更快乐」的对比，注意后面绝不能再加 but；happier than ever 用比较级收住情绪，比 I felt happy 有力得多。',
            },
            {
              sentence:
                'In short, a sports meeting teaches us that friendship matters more than the result.',
              why:
                'In short 领起总结，teaches us that 接宾语从句点出认识，matters more than the result 把「认识」写成了有分量的判断句，正好落实最后一个内容要点。',
            },
          ],
        },
        {
          level: '二类文（原稿水平 13—16 分）',
          text:
            'Our school had a sports meeting last week. It was interesting. I took part in the long jump. I was very nervous. My classmates cheered for me. I felt happy. I think sports meeting is good. It is good for us. We can do sports and make friends. I like sports meeting very much. I hope we can have it again. Next time I will take part in the running race. I will practise more before it. I want to be the first one. My classmates will cheer for me again.',
          cn:
            '上周我们学校举行了运动会。它很有趣。我参加了跳远。我非常紧张。同学们为我加油。我感到开心。我觉得运动会很好。它对我们有好处。我们可以做运动、交朋友。我非常喜欢运动会。我希望我们能再办一次。下次我会参加跑步比赛。在那之前我会多练习。我想拿第一。同学们会再次为我加油。',
          comment:
            '这篇就是未升格的二类文，可以和上面的升格版逐句对照。优点是内容要点齐全：时间、项目、心情、同学、认识全都写到了，时态统一为一般过去时，能拿到基本分。差距非常明确：十五句几乎都是「主谓宾」短句，没有一处从句也没有非谓语结构；连接词只有 and，缺 so、Although、In short 这类词，读下来像一串信息的罗列；用词偏泛，interesting、good、happy 反复出现。升格路径只有三步：用 which 从句补充跳远的细节，把「紧张」改成现在分词短语开头的句子，再把结尾两句合并成 In short 引导的总结句。',
          highlights: [
            {
              sentence: 'My classmates cheered for me.',
              why:
                '这是全文写同学帮助的唯一落点，动作清楚、用词准确，也是最适合升格的一句——加上 Just then 或 shouted my name 这样的细节，就能从「叙述」变成「画面」。',
            },
            {
              sentence: 'I felt happy.',
              why:
                '表达心情最直接的写法，没有语法错误，作为二类文的句子是合格的。但它只说出情绪，若换成 I felt happier than ever 或 a warm feeling rose in my heart，同样的意思就能多拿语言分。',
            },
          ],
        },
      ],
      usefulExpressions: [
        'Besides, / What is more, ...（递进，替换第二个 and）',
        'However, ... / Although ... , ...（转折；注意 although 与 but 不能同现）',
        'Therefore, ... / As a result, ...（因果，替换 so）',
        'For example, ... / Take ... as an example.（举例）',
        'In short, ... / In a word, ...（结尾总结）',
        'Standing at ... , I felt ...（现在分词作状语开头，避免连续 I 开头）',
        '... , which ...（非限制性定语从句补充细节，替换一个短句）',
        'sth teaches us that ... / It is + 形容词 + for sb to do sth（把笼统看法写成完整句）',
      ],
    },
    questions: [
      {
        id: 'eng-writing-7-q1',
        type: 'choice',
        stem: '下列哪一句正确？',
        options: [
          'Although he was tired, but he kept running.',
          'Although he was tired, he kept running.',
          'Although he was tired, so he kept running.',
          'He was tired, although he kept running.',
        ],
        answer: 'B',
        explanation:
          'although 与 but、so 不能在同一个句子里同时出现，这是中式双连词的典型错误，去掉后面的 but 或 so 就对了；D 把让步关系弄反了，意思变成「他虽然一直在跑，但很累」，逻辑不通。',
        difficulty: 2,
        tags: ['语言升级', '连接词'],
      },
      {
        id: 'eng-writing-7-q2',
        type: 'fill',
        stem:
          '用非谓语结构升格句子，每空一词。\nHe stood by the river and waited for his friends.\n____ by the river, he waited for his friends.',
        answer: 'Standing',
        explanation:
          '两个动作的主语都是 he，可把其中一个主动的动作改成现在分词短语作状语，避免用 and 把短句连成一串；分词短语位于句首时首字母要大写。',
        difficulty: 3,
        tags: ['语言升级', '非谓语'],
      },
      {
        id: 'eng-writing-7-q3',
        type: 'fill',
        stem:
          '用连接词升格句子。\nThe work was hard. We finished it on time.\n____ the work was hard, we finished it on time.',
        answer: 'Although',
        explanation:
          '两句之间是让步关系，用 Although 引导状语从句最贴切；要注意 although 后面不能再加 but，这是初中作文里最常见的中式双连词错误。',
        difficulty: 2,
        tags: ['语言升级', '状语从句'],
      },
      {
        id: 'eng-writing-7-q4',
        type: 'fill',
        stem: '用所给词的适当形式填空。\nIn short, reading ____ (help) us grow.',
        answer: 'helps',
        explanation:
          '动名词 reading 作主语时谓语用第三人称单数，填 helps；In short 是结尾总结用的连接语，后面常用一般现在时陈述普遍道理。',
        difficulty: 2,
        tags: ['语言升级', '主谓一致'],
      },
      {
        id: 'eng-writing-7-q5',
        type: 'choice',
        stem: '表达「我认为」时，哪一种处理最能体现语言变化？',
        options: [
          '全篇反复使用 I think ...',
          '交替使用 In my opinion, ... 与 As far as I know, ...',
          '写成 In my opinion, I think ...',
          '写成 I think in my opinion ...',
        ],
        answer: 'B',
        explanation:
          '同一个观点反复用 I think 会让语言显得单调，换用 In my opinion、As far as I know 等表达能增加变化；而 in my opinion 与 I think 语义重复，叠在一起是典型的中式累赘。',
        difficulty: 2,
        tags: ['语言升级', '地道表达'],
      },
      {
        id: 'eng-writing-7-q6',
        type: 'fill',
        stem:
          '根据中文提示补全句子。\n运动会教会我们：友谊比结果更重要。\nThe sports meeting teaches us ____ friendship matters more than the result.',
        answer: 'that',
        explanation:
          'teaches us 后面接的是一个完整的句子，需要用 that 引导宾语从句；that 在从句中不作成分，但一般不能省略，否则句子结构会显得混乱。',
        difficulty: 2,
        tags: ['语言升级', '宾语从句'],
      },
    ],
  },
];
