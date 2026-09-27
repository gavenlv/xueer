/**
 * 知识点卡片：把内容数据**自动派生**成一张张可背诵的卡片。
 *
 * ## 为什么要派生而不是另建一份卡片数据
 *
 * 「每个知识点都包含在内」这件事如果靠人工维护第二份清单，一定会跟正文脱节：
 * 历史时间轴加了一个时间点、材料题补了一条踩分点，卡片清单不会自己长出来。
 * 所以这里只做一件事：**读懂各科已有的数据结构，把其中的必背项抽出来**。
 * 内容一改，卡片自动跟着变，也不会出现「背了卡片却没有对应正文」的幽灵知识点。
 *
 * ## 覆盖范围（对应「文科每个知识点都包含在内」）
 *
 * | 模块 | 抽出的知识点 |
 * | --- | --- |
 * | 古诗词 | 逐句默写（给上句背下句，首句用题目提示） |
 * | 字词 | 词条（字音/字形/成语/词语/修辞）与近义辨析 |
 * | 文言文 | 重点注释、语法归类（通假字/古今异义/词类活用/特殊句式/一词多义）、段落翻译、主旨 |
 * | 现代文 | 答题技巧、主观题答题要点 |
 * | 作文 | 写作素材、范文亮点句、训练提示、主观题 |
 * | 文学常识 | 必记要点、人物形象、经典情节、章节脉络、情节链、记忆口诀、艺术特色、主题 |
 * | 历史 | **时间点**、分层考点、必背结论、易错易混、对比表、命题角度、**材料大题踩分点** |
 * | 道德与法治 | 分层考点、必背金句、易错辨析、对比表、命题角度、时政热点答题角度、材料大题踩分点 |
 * | 英语 | 分类词表、词根词缀、近义辨析、高频搭配、语法规则、易错点、考点、应试策略、写作句型 |
 * | 数学 | 概念、公式定理、易错点、解题方法 |
 *
 * 整卷模拟（`hist-exam` / `eng-exam` / 道法卷子）**不产卡片**：那是模考，题已经在考试页里。
 *
 * ## 卡片 id 的稳定性
 *
 * 形如 `${entryId}#${类型}#${该类序号}`。序号按**类型内部**从小到大给，
 * 因此新增内容时（通常追加在末尾）已有卡片的 id 不变，学生的背诵记录不会错位。
 */

import type {
  CardRecord,
  EnglishKnowledge,
  Entry,
  HistoryMaterialGroup,
  HistoryTopic,
  LiteratureItem,
  PoliticsTopic,
  QuizQuestion,
  ReciteCard,
} from '../types';
import { isMastered } from './recite';

/* ------------------------------------------------------------------ */
/* 构造工具                                                            */
/* ------------------------------------------------------------------ */

/** 卡片构造器：负责编号与公共字段，抽取函数只管「正面问什么、背面答什么」 */
class CardBuilder {
  private readonly counters = new Map<string, number>();

  constructor(
    private readonly entry: Entry,
    private readonly out: ReciteCard[],
  ) {}

  add(
    kind: string,
    front: string,
    back: string,
    extra?: { note?: string; points?: string[]; key?: boolean },
  ): void {
    const i = this.counters.get(kind) ?? 0;
    this.counters.set(kind, i + 1);
    this.out.push({
      id: `${this.entry.id}#${kind}#${i}`,
      entryId: this.entry.id,
      moduleId: this.entry.moduleId,
      title: this.entry.title,
      kind,
      front: front.trim(),
      back: back.trim(),
      ...(extra?.note?.trim() ? { note: extra.note.trim() } : {}),
      ...(extra?.points?.length ? { points: extra.points } : {}),
      ...(extra?.key ? { key: true } : {}),
    });
  }
}

/**
 * 长句子的正面提示：只给「开头一小截」，让学生补完整。
 *
 * 优先切在第一个逗号处（学生最熟悉「上句提示下句」这种背法），
 * 没有标点的短句就取前三分之一——**留一点线索，但不给答案**。
 */
export function splitCue(text: string): string {
  const t = text.trim();
  const cut = t.search(/[，,；;：:]/);
  if (cut >= 4 && cut <= 20) return `${t.slice(0, cut)}，……`;
  const head = Math.min(Math.max(t.length - 1, 1), Math.max(2, Math.ceil(t.length / 3)));
  return `${t.slice(0, head)}……`;
}

/** 主观题（有踩分点或本身就是简答）做成卡片；选择题已在练习与错题本里，不重复 */
function addQuestionCards(b: CardBuilder, questions: QuizQuestion[], kind = '答题踩分点'): void {
  for (const q of questions) {
    if (q.type === 'choice' && !q.rubric?.length) continue;
    b.add(kind, q.stem, q.answer, { note: q.explanation, points: q.rubric });
  }
}

/** 材料大题：材料 + 设问 + 参考答案 + 踩分点 */
function addMaterialCards(b: CardBuilder, groups: HistoryMaterialGroup[]): void {
  for (const g of groups) {
    for (const q of g.questions) {
      b.add('材料大题踩分点', q.stem, q.answer, { points: q.rubric, note: g.material });
    }
  }
}

/** 分层考点 / 核心观点（历史、道法、英语共用同一套结构） */
function addLevelPoints(
  b: CardBuilder,
  points: { level: string; text: string; explain?: string }[],
  kindPrefix = '考点',
): void {
  for (const p of points) {
    b.add(`${kindPrefix}·${p.level}`, splitCue(p.text), p.text, {
      note: p.explain,
      key: p.level === '重点',
    });
  }
}

/* ------------------------------------------------------------------ */
/* 语文                                                                */
/* ------------------------------------------------------------------ */

function fromPoem(b: CardBuilder, d: { title: string; author: string; dynasty: string; lines: string[]; lineNotes?: string[] }): void {
  d.lines.forEach((line, i) => {
    const front = i === 0 ? `《${d.title}》首句（${d.dynasty}·${d.author}）：` : `上句：${d.lines[i - 1]}`;
    b.add('默写', front, line, { note: d.lineNotes?.[i] });
  });
}

function fromVocab(
  b: CardBuilder,
  d: {
    term: string;
    pinyin?: string;
    meaning: string;
    pitfall?: string;
    example?: string;
    category: string;
    confusable?: { term: string; meaning: string }[];
  },
): void {
  b.add(d.category, `${d.term}${d.pinyin ? `（${d.pinyin}）` : ''}`, d.meaning, {
    note: [d.pitfall, d.example ? `例：${d.example}` : ''].filter(Boolean).join(' '),
  });
  for (const c of d.confusable ?? []) {
    b.add('近义辨析', `${d.term} ↔ ${c.term}`, c.meaning, { note: d.pitfall });
  }
}

function fromClassical(
  b: CardBuilder,
  d: {
    title: string;
    paragraphs: string[];
    annotations: { word: string; explain: string }[];
    grammar: { type: string; items: { word: string; explain: string }[] }[];
    translation: string;
    theme: string;
  },
): void {
  for (const a of d.annotations) b.add('注释', a.word, a.explain);
  for (const g of d.grammar) {
    for (const it of g.items) b.add(`语法·${g.type}`, it.word, it.explain);
  }
  // 段落与译文对齐时逐段成卡（段数不一致就不猜，宁可不做）
  const trans = d.translation.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (trans.length === d.paragraphs.length) {
    d.paragraphs.forEach((p, i) => b.add('翻译', `原文：${p}`, trans[i]));
  }
  b.add('主旨', `《${d.title}》的主旨与写作特色是？`, d.theme);
}

function fromReading(
  b: CardBuilder,
  d: { title: string; genre: string; tips?: string[]; questions: QuizQuestion[] },
): void {
  (d.tips ?? []).forEach((t, i) => {
    b.add('答题技巧', `${d.genre}答题技巧 ${i + 1}：${splitCue(t)}`, t);
  });
  addQuestionCards(b, d.questions, '答题要点');
}

function fromWriting(
  b: CardBuilder,
  d: {
    title: string;
    materials?: { theme: string; items: string[] }[];
    examples?: { title: string; highlights?: { sentence: string; why: string }[] }[];
    exercise?: { prompt: string; tips: string[] };
    questions?: QuizQuestion[];
  },
): void {
  for (const m of d.materials ?? []) {
    m.items.forEach((item, i) => {
      b.add('写作素材', `【${m.theme}】素材 ${i + 1}／${m.items.length}：${splitCue(item)}`, item);
    });
  }
  for (const ex of d.examples ?? []) {
    (ex.highlights ?? []).forEach((h) => {
      b.add('高分句', `《${ex.title}》亮点句——好在哪里：${h.why}`, h.sentence);
    });
  }
  (d.exercise?.tips ?? []).forEach((t, i) => {
    b.add('训练提示', `写作训练提示 ${i + 1}：${splitCue(t)}`, t);
  });
  addQuestionCards(b, d.questions ?? [], '答题要点');
}

function fromLiterature(b: CardBuilder, d: LiteratureItem): void {
  d.keyPoints.forEach((p, i) => {
    b.add('必记要点', `《${d.title}》必记要点 ${i + 1}／${d.keyPoints.length}：${splitCue(p)}`, p);
  });

  const book = d.book;
  if (!book) return;

  if (book.theme) b.add('主题', `《${book.name}》的主题思想是？`, book.theme);

  for (const c of book.characters ?? []) b.add('人物形象', `${c.name}（${book.name}）`, c.desc);
  for (const p of book.plots ?? []) b.add('经典情节', `${p.title}`, p.desc);
  for (const c of book.chapters ?? []) b.add('章节脉络', c.name, c.summary);
  book.plotChain?.forEach((step, i) => {
    b.add('情节链', `情节链第 ${i + 1} 环（共 ${book.plotChain?.length ?? 0} 环）`, step);
  });
  book.mnemonic?.forEach((m, i) => {
    b.add('记忆口诀', `${book.name}记忆口诀 ${i + 1}`, m);
  });
  (book.features ?? []).forEach((f, i) => {
    b.add('艺术特色', `《${book.name}》艺术特色 ${i + 1}：${splitCue(f)}`, f);
  });
}

/* ------------------------------------------------------------------ */
/* 历史 / 道德与法治                                                    */
/* ------------------------------------------------------------------ */

function fromHistoryTopic(b: CardBuilder, d: HistoryTopic): void {
  for (const tp of d.timeline) {
    b.add('历史时间点', `${tp.event} —— 发生在什么时候？`, `${tp.time}　${tp.event}`, {
      note: tp.note,
      key: tp.key,
    });
  }
  addLevelPoints(b, d.points);
  (d.conclusions ?? []).forEach((c, i) => {
    b.add('必背结论', `必背结论 ${i + 1}：${splitCue(c)}`, c);
  });
  for (const c of d.confusions ?? []) {
    b.add('易错易混', `❌ ${c.wrong}`, `✅ ${c.right}`, { note: c.why });
  }
  for (const cp of d.compares ?? []) {
    for (const row of cp.rows) {
      b.add(`对比·${cp.title}`, `${cp.title}｜${row.item}`, `${cp.left}：${row.left}　／　${cp.right}：${row.right}`);
    }
  }
  for (const a of d.examAngles ?? []) {
    b.add('命题角度', `${a.angle}${a.years ? `（${a.years}）` : ''}`, a.detail);
  }
  addMaterialCards(b, d.materials ?? []);
  addQuestionCards(b, d.questions);
}

function fromPoliticsTopic(b: CardBuilder, d: PoliticsTopic): void {
  addLevelPoints(b, d.points, '核心观点');
  (d.keySentences ?? []).forEach((s, i) => {
    b.add('必背金句', `必背金句 ${i + 1}：${splitCue(s)}`, s);
  });
  for (const c of d.confusions ?? []) {
    b.add('易错辨析', `❌ ${c.wrong}`, `✅ ${c.right}`, { note: c.why });
  }
  for (const cp of d.compares ?? []) {
    for (const row of cp.rows) {
      b.add(`对比·${cp.title}`, `${cp.title}｜${row.item}`, `${cp.left}：${row.left}　／　${cp.right}：${row.right}`);
    }
  }
  for (const a of d.examAngles ?? []) {
    b.add('命题角度', `${a.angle}${a.years ? `（${a.years}）` : ''}`, a.detail);
  }
  for (const h of d.hotspots ?? []) {
    for (const ang of h.angles) {
      b.add('时政热点', `${h.event}｜从「${ang.angle}」怎么答？`, `${ang.point}\n${ang.answer}`, {
        note: h.background,
      });
    }
  }
  addMaterialCards(b, d.materials ?? []);
  addQuestionCards(b, d.questions);
}

/* ------------------------------------------------------------------ */
/* 英语                                                                */
/* ------------------------------------------------------------------ */

function fromEnglish(b: CardBuilder, d: EnglishKnowledge): void {
  for (const g of d.wordList ?? []) {
    for (const w of g.words) {
      b.add(`词汇·${g.group}`, `${w.word}${w.phonetic ? ` /${w.phonetic}/` : ''}`, `${w.pos ? `${w.pos} ` : ''}${w.cn}`, {
        note: w.note,
      });
    }
  }
  for (const a of d.affixes ?? []) {
    b.add('词根词缀', a.affix, `${a.meaning}\n${a.examples.map((e) => `${e.word} ${e.cn}`).join('；')}`);
  }
  for (const c of d.confusables ?? []) {
    b.add('近义辨析', `${c.a} vs ${c.b}`, c.diff, {
      note: [c.exampleA, c.exampleB].filter(Boolean).join(' ／ '),
    });
  }
  for (const c of d.collocations ?? []) {
    b.add('高频搭配', c.phrase, c.cn, { note: c.note });
  }
  for (const r of d.rules ?? []) {
    b.add('语法规则', `${r.rule}${r.form ? `（${r.form}）` : ''}`, `${r.example}${r.cn ? `\n${r.cn}` : ''}`, {
      note: r.tip,
    });
  }
  for (const m of d.mistakes ?? []) {
    b.add('易错点', `❌ ${m.wrong}`, `✅ ${m.right}`, { note: m.why });
  }
  addLevelPoints(b, d.points, '考点');
  (d.examTips ?? []).forEach((t, i) => {
    b.add('应试策略', `应试策略 ${i + 1}：${splitCue(t)}`, t);
  });
  (d.writing?.usefulExpressions ?? []).forEach((e, i) => {
    b.add('写作句型', `书面表达可用句型 ${i + 1}：${splitCue(e)}`, e);
  });
  for (const s of d.writing?.samples ?? []) {
    for (const h of s.highlights ?? []) {
      b.add('高分句', `${s.level}亮点句——好在哪里：${h.why}`, h.sentence);
    }
  }
  addQuestionCards(b, d.questions);
}

/* ------------------------------------------------------------------ */
/* 数学                                                                */
/* ------------------------------------------------------------------ */

function fromMath(
  b: CardBuilder,
  d: {
    concepts: { term: string; explain: string }[];
    formulas?: { name: string; tex?: string; text?: string; note?: string }[];
    pitfalls?: string[];
    methods?: string[];
    questions: QuizQuestion[];
  },
): void {
  for (const c of d.concepts) b.add('概念', c.term, c.explain);
  for (const f of d.formulas ?? []) {
    const back = f.tex ? `$${f.tex}$${f.text ? `\n${f.text}` : ''}` : (f.text ?? '');
    b.add('公式定理', f.name, back, { note: f.note });
  }
  (d.pitfalls ?? []).forEach((p, i) => b.add('易错点', `易错点 ${i + 1}：${splitCue(p)}`, p));
  (d.methods ?? []).forEach((m, i) => b.add('解题方法', `解题方法 ${i + 1}：${splitCue(m)}`, m));
  addQuestionCards(b, d.questions);
}

/* ------------------------------------------------------------------ */
/* 统一入口                                                            */
/* ------------------------------------------------------------------ */

/**
 * 一张内容条目派生出的全部知识点卡片。
 * 整卷模拟卷不产卡片（那是模考，题目在考试页里）。
 */
export function reciteCardsOf(entry: Entry): ReciteCard[] {
  // 整卷（历史/英语/道法/物理）与题型专题都通过这个形状判断，不能靠 moduleId：
  // pol-exam、phy-exam 里既有卷子也有知识条目。数据联合类型越来越宽，故先转 unknown。
  if ('sections' in (entry.data as unknown as Record<string, unknown>)) return [];

  const out: ReciteCard[] = [];
  const b = new CardBuilder(entry, out);

  switch (entry.moduleId) {
    case 'poems':
      fromPoem(b, entry.data);
      break;
    case 'vocab':
      fromVocab(b, entry.data);
      break;
    case 'classical':
      fromClassical(b, entry.data);
      break;
    case 'reading':
      fromReading(b, entry.data);
      break;
    case 'writing':
      fromWriting(b, entry.data);
      break;
    case 'literature':
      fromLiterature(b, entry.data);
      break;
    case 'hist-7a':
    case 'hist-7b':
    case 'hist-8a':
    case 'hist-8b':
    case 'hist-9a':
    case 'hist-9b':
    case 'hist-topics':
      fromHistoryTopic(b, entry.data);
      break;
    case 'pol-growth':
    case 'pol-moral':
    case 'pol-law':
    case 'pol-nation':
    case 'pol-current':
    case 'pol-exam':
      // pol-exam 上既可能是知识条目、也可能是整卷（后者已在上面按 `sections` 早退）
      fromPoliticsTopic(b, entry.data as PoliticsTopic);
      break;
    case 'eng-vocab':
    case 'eng-grammar':
    case 'eng-reading':
    case 'eng-listening':
    case 'eng-writing':
    case 'eng-topics':
      fromEnglish(b, entry.data);
      break;
    case 'math-number':
    case 'math-geometry':
    case 'math-stats':
    case 'math-formula':
    case 'math-model':
      fromMath(b, entry.data);
      break;
    default:
      // 待开发模块与整卷模拟：没有知识点卡片
      break;
  }

  return out;
}

/** 从卡片 id 反查归属条目 id（卡片 id 形如 `entryId#类型#序号`；条目 id 本身不含 `#`） */
export function entryIdOfCard(cardId: string): string {
  return cardId.slice(0, cardId.indexOf('#'));
}

/** 一批卡片的掌握情况 */
export interface CardStats {
  /** 卡片总数 */
  total: number;
  /** 已背过（至少打卡一次） */
  practiced: number;
  /** 已标熟 */
  mastered: number;
  /** 今天该复习 */
  due: number;
}

export function cardStatsOf(
  cards: ReciteCard[],
  records: Record<string, CardRecord> | undefined,
  now: number = Date.now(),
): CardStats {
  let practiced = 0;
  let mastered = 0;
  let due = 0;
  for (const c of cards) {
    const rec = records?.[c.id];
    if (!rec || rec.times === 0) {
      due += 1;
      continue;
    }
    practiced += 1;
    if (isMastered(rec)) mastered += 1;
    if (rec.dueAt <= now) due += 1;
  }
  return { total: cards.length, practiced, mastered, due };
}
