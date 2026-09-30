/**
 * 把一条内容拆成「可朗读的段落」。
 *
 * 朗读控制条（`components/SpeechBar.tsx`）接在详情页外壳上，因此六个模块的详情页
 * 都能「整页朗读」，而不必各自写一遍。拆段的原则与「学生拿到纸质材料会怎么读」一致：
 *
 *   1. **正文先读**（古诗逐句、文言文逐段、现代文逐段），段落标签写明是原文第几段；
 *   2. 再读**译文、主旨、赏析**这类讲解；
 *   3. 词条/作文/文学常识类内容没有「原文」，就读它的释义、要点与正文段落。
 *
 * 纯符号或公式（数学）不送进语音引擎——朗读 `$x^2$` 只会念出一串乱码。
 * 每段长度交给 `lib/speech.ts` 的 `chunkText` 去切，这里不做长度处理。
 */

import type { Entry } from '../types';
import type { SpeechSegment } from './speech';
import { isExamTopicData } from './examTopic';

/**
 * 段落文本是否值得朗读。
 *
 * 判据是「含汉字**或拉丁字母**」——一开始只认汉字（当时只有语文内容），
 * 结果英语的听说脚本、阅读语篇、英文例句**全部被判为不可朗读**，英语页面的朗读条
 * 只剩一句中文小结。纯符号与公式（如 `$x^2$`）仍然排除：朗读它们只会念出乱码。
 */
function readable(text: string | undefined): text is string {
  return Boolean(text && /[\u4e00-\u9fa5A-Za-z]/.test(text) && !text.includes('$'));
}

function push(
  out: SpeechSegment[],
  id: string,
  text: string | undefined,
  label: string,
): void {
  if (readable(text)) out.push({ id, text: text.trim(), label });
}

/** 多条同构段落：逐段编号 */
function pushList(
  out: SpeechSegment[],
  prefix: string,
  labelOf: (i: number) => string,
  list: readonly string[] | undefined,
): void {
  (list ?? []).forEach((text, i) => push(out, `${prefix}-${i}`, text, labelOf(i)));
}

export function speechSegmentsOf(entry: Entry): SpeechSegment[] {
  const out: SpeechSegment[] = [];

  /**
   * 「题型专题」形态（`trends` + `drills`）：**按数据形状识别，不按 moduleId**。
   *
   * 整页朗读读的就是**讲解本身**——拿分逻辑 → 五年考情（逐年）→ 趋势结论 →
   * 命题角度 → 分步讲解（含示范）→ 模板 → 评分点 → 易错失分。专题没有「原文」，
   * 所以按「先讲这一块怎么考、再讲怎么做」的顺序读；训练分组只读说明（不读题号），
   * 题目留给练习页，避免整页朗读变成念题库。
   *
   * 语文（`zh-topics`）与数学（`math-topics`）共用这一段：写成 `case 'zh-topics'`
   * 时数学专题会落到下面的数学分支，整页朗读只剩一句「本节要点」，等于没有朗读。
   */
  if (isExamTopicData(entry.data)) {
    const z = entry.data;
    push(out, 'summary', z.summary, `${z.title}·拿分逻辑`);
    (z.trends ?? []).forEach((t, i) => push(out, `trend-${i}`, t.note, `${t.year} 年考情`));
    push(out, 'trendSummary', z.trendSummary, '五年趋势结论');
    (z.angles ?? []).forEach((a, i) =>
      push(out, `angle-${i}`, `${a.angle}${a.years ? `（${a.years}）` : ''}。${a.detail}`, `命题角度·第 ${i + 1} 条`),
    );
    (z.steps ?? []).forEach((s, i) => {
      push(out, `step-${i}-head`, s.heading, `第 ${i + 1} 步`);
      push(out, `step-${i}-body`, s.body, `第 ${i + 1} 步讲解`);
      push(out, `step-${i}-demo`, s.demo, `第 ${i + 1} 步示范`);
    });
    (z.templates ?? []).forEach((g, i) =>
      pushList(out, `tpl-${i}`, (j) => `${g.name}·第 ${j + 1} 条`, g.items),
    );
    pushList(out, 'scoring', (i) => `评分点·第 ${i + 1} 条`, z.scoring);
    (z.pitfalls ?? []).forEach((p, i) =>
      push(out, `pitfall-${i}`, `常见错误：${p.wrong}。正确做法：${p.right}。为什么容易错：${p.why}`, `易错失分·第 ${i + 1} 条`),
    );
    (z.drills ?? []).forEach((d, i) => push(out, `drill-${i}`, `${d.name}：${d.note}`, `训练分组·第 ${i + 1} 组`));
    return out;
  }

  switch (entry.moduleId) {
    case 'poems': {
      const p = entry.data;
      pushList(out, 'line', (i) => `原文·第 ${i + 1} 句`, p.lines);
      push(out, 'translation', p.translation, '白话译文');
      push(out, 'appreciation', p.appreciation, '赏析与考点');
      break;
    }

    case 'classical': {
      const c = entry.data;
      pushList(out, 'para', (i) => `原文·第 ${i + 1} 段`, c.paragraphs);
      push(out, 'translation', c.translation, '全文翻译');
      push(out, 'theme', c.theme, '主旨与写作特色');
      break;
    }

    case 'reading': {
      const r = entry.data;
      pushList(out, 'para', (i) => `原文·第 ${i + 1} 段`, r.paragraphs);
      pushList(out, 'tip', (i) => `答题技巧·第 ${i + 1} 条`, r.tips);
      break;
    }

    case 'writing': {
      const w = entry.data;
      push(out, 'summary', w.summary, '本讲要点');
      // 正文首行 `## ` 是小标题，读出来当段落标签更清楚
      (w.content ?? []).forEach((line, i) => {
        const isHead = line.startsWith('## ');
        const text = isHead ? line.slice(3) : line;
        push(out, `content-${i}`, text, isHead ? '小标题' : `正文·第 ${i + 1} 段`);
      });
      (w.examples ?? []).forEach((ex, i) => {
        push(out, `ex-${i}-text`, ex.text, `范例·${ex.title}`);
        push(out, `ex-${i}-comment`, ex.comment, `范例点评·${ex.title}`);
      });
      (w.materials ?? []).forEach((m, i) =>
        pushList(out, `mat-${i}`, (j) => `素材·${m.theme} 第 ${j + 1} 条`, m.items),
      );
      push(out, 'exercise', w.exercise?.prompt, '训练任务');
      pushList(out, 'ex-tip', (i) => `训练提示·第 ${i + 1} 条`, w.exercise?.tips);
      break;
    }

    case 'literature': {
      const l = entry.data;
      pushList(out, 'content', (i) => `正文·第 ${i + 1} 段`, l.content);
      pushList(out, 'key', (i) => `必记要点·第 ${i + 1} 条`, l.keyPoints);
      if (l.book) {
        push(out, 'book-theme', l.book.theme, '主题思想');
        pushList(out, 'book-feature', (i) => `艺术特色·第 ${i + 1} 条`, l.book.features);
        (l.book.chapters ?? []).forEach((c, i) =>
          push(out, `chapter-${i}`, `${c.name}：${c.summary}`, `章节脉络·第 ${i + 1} 章`),
        );
        (l.book.plots ?? []).forEach((p, i) =>
          push(out, `plot-${i}`, `${p.title}：${p.desc}`, `情节主线·第 ${i + 1} 条`),
        );
      }
      break;
    }

    case 'vocab': {
      const v = entry.data;
      push(out, 'meaning', v.meaning, `${v.term} 的释义`);
      push(out, 'pitfall', v.pitfall, '易错点与辨析');
      push(out, 'example', v.example, '例句');
      (v.confusable ?? []).forEach((c, i) =>
        push(out, `conf-${i}`, `${c.term}：${c.meaning}`, '易混词对照'),
      );
      break;
    }

    /**
     * 「题型专题」（语文 `zh-topics` / 数学 `math-topics`）不在这里：它由函数开头的
     * `isExamTopicData` 分支按**数据形状**处理，两个学科共用同一段朗读段落。
     */
    default: {
      /**
       * 物理：按**理解顺序**读——问题 → 理解的关键 → 逐步讲解（含图的文字描述）
       * → 应用（情境、模型、结论）。
       *
       * 必须放在「通用试卷分支」**之前**：物理知识点的 `materials` 也有材料与设问，
       * 若先被那个分支截走，整段理解过程就不会被读出来。
       *
       * 图的 `alt` 一定要读：物理的图承载着文字没说的信息（受力方向、光路走向、
       * 电路连接方式），只听文字不听图，等于听了一半。公式的适用条件也读出来，
       * 因为「什么时候能用」正是理科最容易错的地方。
       */
      if (entry.moduleId.startsWith('phy-')) {
        const ph = entry.data as {
          question?: string;
          keyIdea?: string;
          steps?: { heading?: string; body?: string; note?: string; figure?: { title?: string; alt?: string } }[];
          apps?: { title?: string; scene?: string; model?: string; result?: string; figure?: { title?: string; alt?: string } }[];
          formulas?: { name?: string; usage?: string; units?: string }[];
          materials?: { material?: string; questions: { stem: string }[] }[];
          basis?: string;
        };
        if (Array.isArray(ph.steps)) {
          push(out, 'question', ph.question, '要解决的问题');
          push(out, 'keyIdea', ph.keyIdea, '理解的关键');
          ph.steps.forEach((s, i) => {
            push(
              out,
              `step-${i}`,
              `${s.heading ?? ''}。${s.body ?? ''}${s.note ? `。注意：${s.note}` : ''}`,
              `理解第 ${i + 1} 步`,
            );
            if (s.figure) {
              push(out, `step-${i}-fig`, `${s.figure.title ?? ''}。${s.figure.alt ?? ''}`, `第 ${i + 1} 步的图`);
            }
          });
          ph.apps?.forEach((a, i) => {
            push(
              out,
              `app-${i}`,
              `${a.scene ?? ''}。物理模型：${a.model ?? ''}。结论：${a.result ?? ''}`,
              `应用·${a.title ?? i + 1}`,
            );
            if (a.figure) {
              push(out, `app-${i}-fig`, `${a.figure.title ?? ''}。${a.figure.alt ?? ''}`, `应用 ${i + 1} 的图`);
            }
          });
          ph.formulas?.forEach((f, i) =>
            push(
              out,
              `formula-${i}`,
              `${f.name ?? ''}。${f.units ?? ''}。适用条件：${f.usage ?? ''}`,
              `公式·${f.name ?? i + 1}`,
            ),
          );
          break;
        }
        // 物理整卷：只读卷面说明与综合题材料（题目留给学生做，念出来只是噪音）
        push(out, 'basis', ph.basis, '卷面说明');
        (ph.materials ?? []).forEach((m, i) => {
          push(out, `mat-${i}`, m.material, `材料${i + 1}`);
          m.questions.forEach((q, k) => push(out, `mat-${i}-q${k}`, q.stem, `第 ${i + 1} 题第 ${k + 1} 问`));
        });
        break;
      }

      /**
       * 化学：按**三重表征**读——问题 → 理解的关键 → 宏观现象与微观解释 → 化学方程式 → 实验。
       *
       * 方程式一定要读：`2H₂ + O₂ —点燃→ 2H₂O` 这种式子是化学的核心表达，
       * 听着记比看着记牢；实验的「现象」与「注意事项」也要读（中考实验题就考这两处）。
       * 必须放在「通用试卷分支」**之前**：化学知识点的 `materials` 也有材料与设问，
       * 否则整段讲解会被那个分支截走。
       */
      if (entry.moduleId.startsWith('chem-')) {
        const c = entry.data as {
          question?: string;
          keyIdea?: string;
          steps?: { representation?: string; heading?: string; body?: string; note?: string; figure?: { title?: string; alt?: string } }[];
          equations?: { equation?: string; condition?: string; phenomenon?: string }[];
          experiments?: { title?: string; phenomenon?: string; conclusion?: string; cautions?: string[] }[];
          materials?: { material?: string; questions: { stem: string }[] }[];
          basis?: string;
        };
        if (Array.isArray(c.steps)) {
          push(out, 'question', c.question, '要解决的问题');
          push(out, 'keyIdea', c.keyIdea, '理解的关键');
          c.steps.forEach((s, i) => {
            const rep = s.representation ? `（${s.representation}）` : '';
            push(
              out,
              `step-${i}`,
              `${s.heading ?? ''}${rep}。${s.body ?? ''}${s.note ? `。注意：${s.note}` : ''}`,
              `理解第 ${i + 1} 步${rep}`,
            );
            if (s.figure) push(out, `step-${i}-fig`, `${s.figure.title ?? ''}。${s.figure.alt ?? ''}`, `第 ${i + 1} 步的图`);
          });
          c.equations?.forEach((e, i) =>
            push(out, `eq-${i}`, `${e.equation ?? ''}。反应条件：${e.condition ?? '无'}。现象：${e.phenomenon ?? ''}`, `化学方程式 ${i + 1}`),
          );
          c.experiments?.forEach((x, i) => {
            push(out, `exp-${i}`, `实验现象：${x.phenomenon ?? ''}。结论：${x.conclusion ?? ''}`, `实验·${x.title ?? i + 1}`);
            pushList(out, `exp-${i}-caution`, (k) => `实验注意·第 ${k + 1} 条`, x.cautions);
          });
          break;
        }
        // 化学整卷：只读卷面说明与材料（题目留给学生做）
        push(out, 'basis', c.basis, '卷面说明');
        (c.materials ?? []).forEach((m, i) => {
          push(out, `mat-${i}`, m.material, `材料${i + 1}`);
          m.questions.forEach((q, k) => push(out, `mat-${i}-q${k}`, q.stem, `第 ${i + 1} 题第 ${k + 1} 问`));
        });
        break;
      }
      /**
       * 英语：**按模块 id 判断**（不是按数据形状）——英语七块的「可朗读材料」各不相同：
       *   听说脚本（本应用用它代替听力音频，点朗读条就等于听听力材料）→ 阅读语篇 →
       *   语法/专题的**例句**（最值得跟读的东西）→ 书面表达范文与句型 →
       *   词汇的词缀例词与高频搭配（跟着读一遍最有用）。
       * 无论哪一块，都先读「这一个知识点解决什么问题」，因此英语条目永远至少有一段可读。
       */
      if (entry.moduleId.startsWith('eng-')) {
        const e = entry.data as {
          scripts?: { title?: string; text?: string }[];
          passages?: { title?: string; text?: string }[];
          writing?: { samples?: { level?: string; text?: string }[]; usefulExpressions?: string[] };
          rules?: { rule?: string; example?: string }[];
          affixes?: { affix: string; meaning: string; examples: { word: string; cn: string }[] }[];
          collocations?: { phrase: string; cn: string }[];
          summary?: string;
        };
        push(out, 'summary', e.summary, '本知识点');
        (e.scripts ?? []).forEach((s, i) =>
          push(out, `script-${i}`, s.text, s.title ? `听说材料·${s.title}` : `听说材料 ${i + 1}`),
        );
        (e.passages ?? []).forEach((p, i) =>
          push(out, `passage-${i}`, p.text, p.title ? `语篇·${p.title}` : `语篇 ${i + 1}`),
        );
        pushList(
          out,
          'rule-example',
          (i) => `例句·第 ${i + 1} 条`,
          (e.rules ?? []).map((r) => r.example ?? ''),
        );
        pushList(
          out,
          'affix-word',
          (i) => `例词·第 ${i + 1} 组`,
          (e.affixes ?? []).map((a) => a.examples.map((x) => x.word).join(', ')),
        );
        pushList(
          out,
          'collocation',
          (i) => `搭配·第 ${i + 1} 条`,
          (e.collocations ?? []).map((c) => c.phrase),
        );
        (e.writing?.samples ?? []).forEach((s, i) =>
          push(out, `sample-${i}`, s.text, s.level ? `范文·${s.level}` : `范文 ${i + 1}`),
        );
        pushList(out, 'expr', (i) => `句型·第 ${i + 1} 条`, e.writing?.usefulExpressions);
        break;
      }

      // 模拟卷：读卷面说明 + 听说脚本（阅读与写作题目本身不念，考试卷是拿来做的）
      const paper = entry.data as {
        basis?: string;
        listening?: { title?: string; text?: string }[];
      };
      if (Array.isArray(paper.listening)) {
        push(out, 'basis', paper.basis, '卷面说明');
        paper.listening.forEach((s, i) =>
          push(out, `listen-${i}`, s.text, s.title ? `听说·${s.title}` : `听说材料 ${i + 1}`),
        );
        break;
      }

      // 模拟卷（历史/道法）：读卷面说明 + 材料 + 设问。
      // 选择题的题干与选项**不**送进语音：考试卷是拿来做的，逐题念出来只是噪音。
      const materialPaper = entry.data as {
        basis?: string;
        materials?: { material?: string; questions: { stem: string }[] }[];
      };
      if (Array.isArray(materialPaper.materials) && materialPaper.materials.some((m) => m.questions)) {
        push(out, 'basis', materialPaper.basis, '卷面说明');
        materialPaper.materials.forEach((m, i) => {
          push(out, `mat-${i}`, m.material, `材料${i + 1}`);
          m.questions.forEach((q, k) =>
            push(out, `mat-${i}-q${k}`, q.stem, `第 ${i + 1} 题第 ${k + 1} 问`),
          );
        });
        break;
      }

      /**
       * 道德与法治：按备考顺序读——主线 → 必背金句 → 材料与设问。
       * 核心观点与对比表是「看」的（要看层级与表格），逐条念出来反而听不清主次；
       * **金句最值得听**：道法材料题的分数就落在那几句规范表述上，听着记比看着记牢。
       */
      const pol = entry.data as {
        mainline?: string;
        keySentences?: string[];
        materials?: { material?: string; questions: { stem: string }[] }[];
      };
      if (Array.isArray(pol.keySentences)) {
        push(out, 'mainline', pol.mainline, '这一条的主线');
        pushList(out, 'keysentence', (i) => `必背金句·第 ${i + 1} 句`, pol.keySentences);
        (pol.materials ?? []).forEach((m, i) => {
          push(out, `mat-${i}`, m.material, `材料${i + 1}`);
          m.questions.forEach((q, k) =>
            push(out, `mat-${i}-q${k}`, q.stem, `第 ${i + 1} 题第 ${k + 1} 问`),
          );
        });
        break;
      }

      // 历史：按备考顺序读——主线 → 时间轴 → 必背结论 → 材料题设问
      // （考点分层与对比表是「看」的，逐条念出来反而听不清主次）
      const h = entry.data as {
        mainline?: string;
        period?: string;
        timeline?: { time: string; event: string; note?: string }[];
        conclusions?: string[];
        materials?: { material?: string; questions: { stem: string; answer: string }[] }[];
      };
      if (Array.isArray(h.timeline) || Array.isArray(h.conclusions)) {
        push(out, 'mainline', h.mainline, '这一条的主线');
        (h.timeline ?? []).forEach((p, i) =>
          push(out, `tl-${i}`, `${p.time}，${p.event}${p.note ? `。${p.note}` : ''}`, `时间轴·${p.time}`),
        );
        pushList(out, 'conclusion', (i) => `必背结论·第 ${i + 1} 条`, h.conclusions);
        (h.materials ?? []).forEach((m, i) => {
          push(out, `mat-${i}`, m.material, `材料${i + 1}`);
          m.questions.forEach((q, k) =>
            push(out, `mat-${i}-q${k}`, q.stem, `第 ${i + 1} 题第 ${k + 1} 问`),
          );
        });
        break;
      }

      // 数学模块 id 形如 `math-*`，是另一套 `MathModuleId`，只能用前缀判断
      if (!entry.moduleId.startsWith('math-')) break;
      const m = entry.data as {
        summary?: string;
        concepts?: {
          term: string;
          explain: string;
          insight?: string;
          figure?: { title?: string; alt?: string };
        }[];
        steps?: { heading?: string; body?: string; note?: string; figure?: { title?: string; alt?: string } }[];
      };
      // 与物理同一顺序：先按理解顺序读系统讲解（含图的文字描述），再读概念与要点
      (m.steps ?? []).forEach((s, i) => {
        push(
          out,
          `mstep-${i}`,
          `${s.heading ?? ''}。${s.body ?? ''}${s.note ? `。注意：${s.note}` : ''}`,
          `系统讲解第 ${i + 1} 步`,
        );
        if (s.figure) {
          push(out, `mstep-${i}-fig`, `${s.figure.title ?? ''}。${s.figure.alt ?? ''}`, `第 ${i + 1} 步的图`);
        }
      });
      // 定义与解析一起读：只读定义等于把「为什么」这一层丢掉，听的人还是不会用
      (m.concepts ?? []).forEach((c, i) => {
        const body = c.insight ? `${c.explain.replace(/[。！？]?$/, '。')}${c.insight}` : c.explain;
        push(out, `concept-${i}`, body, `概念·${c.term}`);
        if (c.figure) {
          push(out, `concept-${i}-fig`, `${c.figure.title ?? ''}。${c.figure.alt ?? ''}`, `概念图·${c.term}`);
        }
      });
      push(out, 'summary', m.summary, '本节要点');
      break;
    }
  }

  return out;
}
