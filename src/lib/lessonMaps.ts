/**
 * 课时思维导图：由**既有数据**推导出每一课的结构化图谱。
 *
 * 为什么推导而不是手写：库里有 520 个条目（121 首古诗、26 篇文言文，还有字词、
 * 阅读、作文、名著），逐条手写导图既不现实，也会随内容更新而失效。而这些条目本身
 * 已经带着完整的结构化数据——逐句注释、语法归类、考点赏析、易错字、答题提示——
 * 足够拼出一张「这一课该记什么、怎么串起来」的导图。
 *
 * 每张图都遵循同一个骨架，学生换一课也不用重新适应：
 *   中心（课题）
 *     ├─ 这一课是什么（作者/出处/文体/年级）
 *     ├─ 内容脉络（怎么读下来）
 *     ├─ 必记要点（该背什么）
 *     ├─ 手法与情感 / 答题思路（怎么答）
 *     └─ 中考考点（考什么、怎么考）
 *
 * 与 `mindMaps`（人工整理的体系图，如「文言虚词体系」）是互补关系：
 * 体系图讲一类知识，课时图讲一课内容。详情页优先展示本课图，没有时回退到体系图。
 */

import type { Entry, MindMap, MindNode } from '../types';

/** 节点文字过长会让导图过宽；截断到 26 字以内并保留语义 */
function clip(text: string, max = 26): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/**
 * 把「一整句说明」拆成「短标签 + 完整说明」。
 *
 * 导图的节点标签必须短（长了整张图会被撑宽、扫不动），但释义、易错点、要点这类内容
 * 本身就是一整句话，直接塞进 label 会被截断成「「式微」的「微」指昏暗；「微君之故」的「微」是「非…」」
 * 这种把关键信息切掉的样子。所以统一取句中第一个引号里的词（没有就取前若干字）当标签，
 * 完整内容放进 note——节点上扫得动，展开又看得全。
 */
function asItem(text: string, labelMax = 16, noteMax = 120): MindNode {
  const t = text.replace(/\s+/g, ' ').trim();
  const quoted = /[「“《]([^」”》]{2,12})[」”》]/.exec(t);
  const colon = /^([^：:]{2,14})[：:]/.exec(t);
  const label = quoted?.[1] ?? colon?.[1] ?? clip(t, labelMax);
  const n: MindNode = { label: clip(label, labelMax) };
  if (t.length > n.label.length) n.note = clip(t, noteMax);
  return n;
}

/** 取「中考考点：①②③」里的分条，供拆成分支 */
function examPointItems(appreciation: string): string[] {
  const idx = appreciation.indexOf('中考考点');
  if (idx < 0) return [];
  const tail = appreciation.slice(idx + 4).replace(/^[：:]\s*/, '');
  return tail
    .split(/[①②③④⑤⑥⑦⑧⑨⑩]/)
    .map((s) => s.trim().replace(/[。；;]\s*$/, ''))
    .filter((s) => s.length >= 4);
}

/** 去掉「中考考点：…」之后的部分，留下纯粹的赏析文字 */
function appreciationBody(appreciation: string): string {
  const idx = appreciation.indexOf('中考考点');
  return (idx < 0 ? appreciation : appreciation.slice(0, idx)).trim();
}

/** 把长句拆成要点短句，供导图使用 */
function sentences(text: string, max = 3): string[] {
  return text
    .split(/[。！？；]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6)
    .slice(0, max);
}

function node(label: string, note?: string, children?: MindNode[], noteMax = 60): MindNode {
  const n: MindNode = { label: clip(label) };
  if (note) n.note = clip(note, noteMax);
  if (children?.length) n.children = children;
  return n;
}

/** 逐句脉络：每句取首字与译文要点，串成一条可回忆的线 */
function linesBranch(lines: string[], lineNotes: string[] | undefined, limit = 4): MindNode[] {
  const step = Math.max(1, Math.ceil(lines.length / limit));
  const out: MindNode[] = [];
  for (let i = 0; i < lines.length; i += step) {
    const group = lines.slice(i, i + step);
    out.push(node(group.map((l) => l.replace(/[，。？！、；：]/g, '')).join('／'), lineNotes?.[i], undefined, 90));
  }
  return out;
}

/* --------------------------------- 古诗 --------------------------------- */

function poemMap(entry: Entry, poem: Extract<Entry, { moduleId: 'poems' }>['data']): MindNode[] {
  const kids: MindNode[] = [];

  kids.push(
    node(
      '这一课是什么',
      undefined,
      [
        node(`${poem.dynasty}·${poem.author}`),
        node(`${poem.genre}｜${poem.grade}`),
        ...(poem.tags?.length ? [node('主题标签', poem.tags.join('、'))] : []),
      ],
    ),
  );

  kids.push(node('内容脉络（逐句）', '按这个顺序往下背', linesBranch(poem.lines, poem.lineNotes)));

  if (poem.famousLines?.length) {
    kids.push(node('千古名句', '默写高频', poem.famousLines.map((f) => node(f.replace(/。$/, '')))));
  }

  const body = appreciationBody(poem.appreciation);
  const features = sentences(body, 4);
  if (features.length) {
    kids.push(node('赏析要点', undefined, features.map((s) => asItem(s))));
  }

  if (poem.pitfalls?.length) {
    kids.push(
      node(
        '易错字与易混点',
        `${poem.pitfalls.length} 条`,
        poem.pitfalls.slice(0, 5).map((p) => asItem(p)),
      ),
    );
  }

  const points = examPointItems(poem.appreciation);
  if (points.length) {
    kids.push(node('中考考点', `${points.length} 个`, points.map((p) => node(p))));
  }

  return kids;
}

/* -------------------------------- 文言文 -------------------------------- */

function classicalMap(
  entry: Entry,
  c: Extract<Entry, { moduleId: 'classical' }>['data'],
): MindNode[] {
  const kids: MindNode[] = [];

  kids.push(
    node('这一课是什么', undefined, [
      node(`${c.dynasty}·${c.author}`),
      ...(c.source ? [node('出处', c.source)] : []),
      node(`${c.paragraphs.length} 段｜${c.annotations.length} 条注释`),
    ]),
  );

  kids.push(
    node('段落脉络', `${c.paragraphs.length} 段`, [
      ...c.paragraphs
        .slice(0, 5)
        .map((p, i) => node(`第 ${i + 1} 段`, p.replace(/[「」“”]/g, '').slice(0, 40))),
      ...(c.paragraphs.length > 5 ? [node(`…另有 ${c.paragraphs.length - 5} 段`)] : []),
    ]),
  );

  if (c.annotations.length) {
    kids.push(
      node('重点实词', `${c.annotations.length} 条`, [
        ...c.annotations.slice(0, 6).map((a) => node(a.word, a.explain, undefined, 110)),
        ...(c.annotations.length > 6 ? [node(`…另有 ${c.annotations.length - 6} 条`)] : []),
      ]),
    );
  }

  if (c.grammar.length) {
    kids.push(
      node(
        '语法现象',
        `${c.grammar.length} 类`,
        c.grammar.map((g) =>
          node(g.type, `${g.items.length} 例`, g.items.slice(0, 4).map((i2) => node(i2.word, i2.explain, undefined, 110))),
        ),
      ),
    );
  }

  const theme = sentences(c.theme, 3);
  if (theme.length) kids.push(node('主旨与写法', undefined, theme.map((s) => asItem(s, 18, 140))));

  const points = examPointItems(c.theme);
  if (points.length) {
    kids.push(node('中考考点', `${points.length} 个`, points.map((p) => node(p))));
  }

  return kids;
}

/* --------------------------------- 字词 --------------------------------- */

function vocabMap(entry: Entry, v: Extract<Entry, { moduleId: 'vocab' }>['data']): MindNode[] {
  const kids: MindNode[] = [];
  kids.push(
    node('这个词条', undefined, [
      node(`${v.category}${v.pinyin ? `｜${v.pinyin}` : ''}`),
      node('释义', v.meaning),
    ]),
  );
  if (v.example) kids.push(node('例句', undefined, [node(v.example, undefined, undefined, 100)]));
  if (v.pitfall) kids.push(node('易错/辨析', undefined, sentences(v.pitfall, 3).map((s) => asItem(s))));
  if (v.confusable?.length) {
    kids.push(
      node('易混词对照', `${v.confusable.length} 组`, v.confusable.map((c) => node(c.term, c.meaning))),
    );
  }
  const tags = [...new Set(v.questions.flatMap((q) => q.tags ?? []))];
  if (tags.length) kids.push(node('考查方式', undefined, tags.slice(0, 6).map((t) => node(t))));
  return kids;
}

/* -------------------------------- 现代文 -------------------------------- */

function readingMap(entry: Entry, r: Extract<Entry, { moduleId: 'reading' }>['data']): MindNode[] {
  const kids: MindNode[] = [];
  kids.push(
    node('这一篇是什么', undefined, [
      node(`${r.genre}｜${r.author}`),
      node(`${r.paragraphs.length} 段`),
    ]),
  );
  if (r.tips?.length) {
    kids.push(node('答题思路', `${r.tips.length} 条`, r.tips.slice(0, 5).map((t) => asItem(t, 18, 140))));
  }
  const types = [...new Set(r.questions.map((q) => q.type))];
  kids.push(
    node('题型分布', undefined, [
      node(`选择 ${r.questions.filter((q) => q.type === 'choice').length} 道`),
      node(`填空 ${r.questions.filter((q) => q.type === 'fill').length} 道`),
      node(`简答 ${r.questions.filter((q) => q.type === 'short').length} 道`),
      ...(types.length ? [] : []),
    ]),
  );
  const tags = [...new Set(r.questions.flatMap((q) => q.tags ?? []))];
  if (tags.length) kids.push(node('考查点', `${tags.length} 个`, tags.slice(0, 8).map((t) => node(t))));
  return kids;
}

/* -------------------------------- 作文 --------------------------------- */

function writingMap(
  entry: Entry,
  w: Extract<Entry, { moduleId: 'writing' }>['data'],
): MindNode[] {
  const kids: MindNode[] = [];
  kids.push(node('这一课在讲什么', w.summary, [node(w.category)]));

  const headings = w.content.filter((p) => p.trim().startsWith('## ')).map((p) => p.trim().slice(3));
  if (headings.length) kids.push(node('提纲', `${headings.length} 节`, headings.map((h) => node(h))));

  if (w.examples?.length) {
    kids.push(
      node(
        '范例',
        `${w.examples.length} 个`,
        w.examples.map((ex) => node(ex.title, ex.comment)),
      ),
    );
  }
  if (w.materials?.length) {
    kids.push(
      node(
        '素材',
        `${w.materials.length} 类`,
        w.materials.map((m) =>
          node(m.theme, `${m.items.length} 条`, m.items.slice(0, 3).map((i) => asItem(i, 18, 120))),
        ),
      ),
    );
  }
  if (w.exercise) {
    kids.push(
      node('练笔任务', w.exercise.prompt, w.exercise.tips.slice(0, 4).map((t) => asItem(t, 18, 140))),
    );
  }
  return kids;
}

/* ------------------------------- 文学常识 ------------------------------- */

function literatureMap(
  entry: Entry,
  l: Extract<Entry, { moduleId: 'literature' }>['data'],
): MindNode[] {
  const kids: MindNode[] = [];
  const b = l.book;

  kids.push(node('这一条是什么', undefined, [node(l.category), ...(b ? [node(`${b.author}`)] : [])]));

  if (b?.chapters?.length) {
    kids.push(
      node('章节脉络', `${b.chapters.length} 段`, b.chapters.map((c) => node(c.name, c.summary))),
    );
  }
  if (b?.plotChain?.length) {
    kids.push(node('情节主线', `${b.plotChain.length} 环`, b.plotChain.map((s) => node(s))));
  }
  if (b?.characters?.length) {
    kids.push(
      node('主要人物', `${b.characters.length} 位`, b.characters.map((c) => node(c.name, c.desc))),
    );
  }
  if (b?.features?.length) kids.push(node('艺术特色', undefined, b.features.map((f) => node(f))));
  if (l.keyPoints.length) {
    kids.push(
      node('必记要点', `${l.keyPoints.length} 条`, l.keyPoints.slice(0, 8).map((k) => asItem(k, 18, 140))),
    );
  }
  if (b?.mnemonic?.length) {
    kids.push(node('记忆口诀', `${b.mnemonic.length} 条`, b.mnemonic.map((m) => node(m))));
  }
  return kids;
}

/**
 * 历史的一课（一个单元或一个中考专题）：按**备考顺序**成图。
 *
 * 与语文那几张图不同，这里的分支直接对应详情页的八块内容（时间轴、分层考点、
 * 结论、易错、对比、考法），因此「导图 → 详情页」是同一套结构的两级展开：
 * 先看导图回忆骨架，想不起来再点进详情看展开。
 */
function historyMap(entry: Entry): MindNode[] {
  const d = entry.data as {
    mainline?: string;
    period?: string;
    timeline?: { time: string; event: string; note?: string; key?: boolean }[];
    points?: { level: string; text: string; explain?: string }[];
    conclusions?: string[];
    confusions?: { wrong: string; right: string; why: string }[];
    compares?: { title: string; aspect: string; rows: { item: string; left: string; right: string }[] }[];
    examAngles?: { angle: string; detail: string }[];
    materials?: { questions: { id: string }[] }[];
  };
  const kids: MindNode[] = [];

  kids.push(
    node('这一条是什么', d.period, [
      node('主线', d.mainline),
      node('时段', d.period),
    ]),
  );

  if (d.timeline?.length) {
    kids.push(
      node(
        '时空坐标',
        `${d.timeline.length} 个节点`,
        d.timeline.map((p) =>
          node(`${p.time} ${clip(p.event, 16)}`, p.note, undefined, p.key ? 95 : 60),
        ),
      ),
    );
  }

  if (d.points?.length) {
    const levels: [string, string][] = [
      ['重点', '必须会背会写'],
      ['次重点', '要能再认与简述'],
      ['了解', '背景知识'],
    ];
    const levelKids = levels
      .map(([lv, hint]) => {
        const list = d.points!.filter((p) => p.level === lv);
        if (!list.length) return null;
        return node(`${lv}（${list.length}）`, hint, list.map((p) => asItem(p.text, 16, 120)));
      })
      .filter((x): x is MindNode => x !== null);
    if (levelKids.length) kids.push(node('考点分层', '复习先分主次', levelKids));
  }

  if (d.conclusions?.length) {
    kids.push(node('必背结论', '材料题直接用', d.conclusions.map((c) => asItem(c, 16, 130))));
  }

  if (d.confusions?.length) {
    kids.push(
      node(
        '易错易混',
        `${d.confusions.length} 组`,
        d.confusions.map((c) => node(clip(c.wrong, 16), `正确理解：${c.right}`, undefined, 85)),
      ),
    );
  }

  if (d.compares?.length) {
    kids.push(
      node(
        '关联与对比',
        `${d.compares.length} 组`,
        d.compares.map((c) => node(clip(c.title, 18), c.aspect)),
      ),
    );
  }

  if (d.examAngles?.length) {
    kids.push(
      node('考法与命题角度', `${d.examAngles.length} 条`, d.examAngles.map((a) => node(clip(a.angle, 16), clip(a.detail, 120)))),
    );
  }

  if (d.materials?.length) {
    const asks = d.materials.reduce((n, m) => n + m.questions.length, 0);
    kids.push(node('材料大题', `${d.materials.length} 组 · ${asks} 问`, [node('先读材料圈关键词', '再按分值分点作答')]));
  }

  return kids;
}

/* -------------------------------- 入口 --------------------------------- */

/**
 * 生成某一课的思维导图。返回 `null` 表示这一课的既有数据不足以支撑导图
 * （例如古诗词条目没有赏析、文言文没有任何注释），此时详情页回退到体系图。
 */
export function lessonMindMap(entry: Entry): MindMap | null {
  let kids: MindNode[] = [];
  let summary = '';

  switch (entry.moduleId) {
    case 'poems':
      kids = poemMap(entry, entry.data);
      summary = '这一首的读法、背法、写法与考点，一张图串起来';
      break;
    case 'classical':
      kids = classicalMap(entry, entry.data);
      summary = '这一段文言文的段落脉络、实词语法、主题写法与考点';
      break;
    case 'vocab':
      kids = vocabMap(entry, entry.data);
      summary = '这个词条的读音、释义、易混辨析与考查方式';
      break;
    case 'reading':
      kids = readingMap(entry, entry.data);
      summary = '这一篇的文体、答题思路、题型分布与考查点';
      break;
    case 'writing':
      kids = writingMap(entry, entry.data);
      summary = '这一课的方法提纲、范例、素材与练笔任务';
      break;
    case 'literature':
      kids = literatureMap(entry, entry.data);
      summary = '这一条的知识骨架与必记要点';
      break;
    // 历史（六册 + 中考专题）：备考顺序成图；模拟卷不进这里（它有自己的考试页）
    case 'hist-7a':
    case 'hist-7b':
    case 'hist-8a':
    case 'hist-8b':
    case 'hist-9a':
    case 'hist-9b':
    case 'hist-topics':
      kids = historyMap(entry);
      summary = '时间轴、分层考点、对比与考法，一张图先把骨架立起来';
      break;
    default:
      return null;
  }

  if (kids.length < 2) return null;

  return {
    id: `auto-${entry.id}`,
    moduleId: entry.moduleId,
    entryId: entry.id,
    grade: entry.grade,
    title: `${entry.title}·课时导图`,
    summary,
    root: {
      label: clip(entry.title, 20),
      note: entry.subtitle,
      children: kids,
    },
  };
}
