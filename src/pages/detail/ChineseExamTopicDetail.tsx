/**
 * 语文「中考专题」（`zh-topics`）详情页：按**卷面题型逐个攻破**的备考页。
 *
 * 为什么单独做一个渲染器：`zh-topics` 与前面六个教材模块的内容形状完全不同——
 * 它不是「一篇课文 + 若干题」，而是「近五年考情 + 专门讲解 + 专项训练」三件套，
 * 落到的字段（`trends` / `trendSummary` / `angles` / `steps` / `sections` /
 * `templates` / `scoring` / `pitfalls` / `drills`）在其它详情页里都没有对应位置，
 * 因此不能复用 `PoemDetail` 那一套骨架。
 *
 * 页面按**学生的使用顺序**排布，每一块的用途都不一样：
 *
 *   ① 攻破标准        —— 本专题每一道题都答对过才算攻破（全题过关策略），并把进度摆在最上面
 *   ①′ 章节索引       —— 节数够多（≥6）时在最上面给一份可点击的目录，直接跳到要补的那一节
 *   ② 一句话拿分逻辑   —— 这个专题考什么、分丢在哪，决定复习时间怎么分配
 *   ③ 近五年考情      —— 逐年形态（最新一年置顶并标出），末尾单列趋势结论
 *   ④ 命题角度        —— 复习时对号入座：这几年反复从哪几个角度考
 *   ⑤ 分步讲解        —— 考场上的动作序列，`demo` 以「示范」引用块呈现
 *   ⑥ 逐类讲透        —— 类目之下的每个子类各一节：判定要点 + 正误对照例子 + 当节练习
 *   ⑦ 答题模板        —— 可以直接背下来套用的成套句式
 *   ⑧ 评分点／踩分点   —— 写成「写到什么才给分」，做完题逐条对照
 *   ⑨ 易错与失分      —— 三行写法：错在哪 / 应该怎么做 / 为什么容易错
 *   ⑩ 专项训练分组     —— 每组一个「刷这一组」入口，组名即题目标签
 *   ⑪ 题库总览        —— 只列题干摘要与题型，作答一律走练习页
 *   ⑫ 底部行动条      —— 「从头练这个专题（全部 N 题）」，另给「只练没过关的」
 *   ⑬ 浮动按钮        —— 滚动一段距离后淡入：回顶部 / 退回专题列表
 *
 * 「先给整体方法（分步讲解），再逐类拆开（逐类讲透），最后给可背的模板」是刻意的顺序：
 * 专题粒度太粗（「积累与运用」不是一个能直接下手的单位），真正能被学生吃下去的是
 * 子类一节一节地过——每节都有判断方法、正误例子与当节练习，学完立刻练，练完再走下一节。
 * `sections` 还没写到的专题整个区块不渲染，其余部分照旧（优雅降级）。
 *
 * 分组刷题走 `/practice/zh-topics/<条目 id>?tag=<组名>`：组名本身就是题目上的
 * 标签（见 `data/chinese/zh-topics/CONTENT-SPEC.md`），因此不需要另建一套组的 id。
 * `sections[].name` 与 `drills[].name` 是**同一个字符串**，所以每一节的「刷这一节」
 * 就是那一组的组卷链接。
 *
 * 底部「知识点背诵 / 本课思维导图 / 拓展阅读 / 关联学习 / 学一补多」由 `DetailShell`
 * 统一接上，与其它详情页完全一致，这里不再重复实现。
 *
 * ---------------------------------------------------------------------------
 * ## 这一页「太长、太重」是怎么治的
 *
 * 一个专题会一次铺开 12 个区块，其中「逐类讲透」最多 17 节、每节含判定要点 + 正误对照
 * 例子 + 易错 + 练习入口（十几行到几十行）。全部铺开时 DOM 节点上万，首屏之后的内容
 * 学生根本看不到，却照样参与样式计算、布局与绘制——这是这一页卡顿的主因。现在：
 *
 *   ① **逐类讲透每一节默认只留节头**：序号 + 节名 +「本节里有什么」+ 本节题量 +
 *      「刷这一节」。正文用**条件渲染**摘掉（不是 CSS 藏起来），真的少掉这批节点。
 *      第一节默认展开，学生一眼能看到「讲透」长什么样，服务端渲染的冒烟断言也仍能拿到正文。
 *   ② 展开集合按专题记在 `localStorage` 的 `zht-open:<专题 id>` 里，下次进同一个专题保持；
 *      标题旁的「展开全部 / 收起全部」写回同一份记录。
 *   ③ 近五年考情 / 命题角度 / 分步讲解 / 专项训练 / 题库总览共用同一个 `Fold`，
 *      默认展开（题库总览默认收起），标题行整行可点，一键收起。
 *   ④ 长区块与收起的节交给浏览器跳过离屏的布局与绘制（`content-visibility`），
 *      首屏可见的区块不加，避免占位高度与真实高度打架造成滚动跳动。
 *   ⑤ 右下角一组浮动按钮，滚动超过一屏后淡入，长页面里随时能回顶部或退回专题列表。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ChineseExamTopicEntry, QuizQuestion } from '../../types';
import { cn } from '../../lib/utils';
import { passedCount, unpassedIds } from '../../lib/progress';
import { useStudy } from '../../store/StudyContext';
import { Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

/**
 * 题库总览最多列这么多题：详情页只用来「看清题量与考法」，作答在练习页。
 * 从 40 条收到 20 条——学生要判断的是「这个专题有多少题、都是什么考法」，
 * 看 20 条足够，剩下的一半纯粹是把页面拉长（真要练就直接进练习页）。
 */
const PREVIEW_LIMIT = 20;
/** 题干摘要的截断长度（题干多是长材料，整段铺开会把页面拉爆） */
const STEM_LIMIT = 60;

/** 滚动超过这个距离才让浮动按钮淡入：刚进页面时右侧不摆多余的东西 */
const FLOAT_AFTER = 500;

const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  choice: '选择题',
  fill: '填空·默写',
  short: '简答题',
};

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = { 1: '易', 2: '中', 3: '难' };

/**
 * 数据里偶有 Markdown 加粗标记（`**…**`，如 `trendSummary`）。
 * 这是文案层面的强调约定，渲染成 `<strong>` 才不会让学生看到一排星号。
 */
function Emph({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>))}
    </>
  );
}

/** 题干摘要：把换行与连续空格压成一行，超长截断加省略号 */
function summarize(stem: string, limit = STEM_LIMIT): string {
  const one = stem.replace(/\s+/g, ' ').trim();
  return one.length > limit ? `${one.slice(0, limit)}…` : one;
}

/** 章节数达到这个数才给顶部索引：两三节的专题一眼看完，再加目录反而是噪音 */
const SECTION_NAV_MIN = 6;

/** 章节卡片的 DOM id（顶部索引按它跳转） */
const sectionAnchorId = (no: number) => `zht-sec-${no}`;

/**
 * 系统开了「减少动态效果」时不做平滑滚动、不做淡入淡出：
 * 前庭敏感的学生被强制看一段长滚动动画是会难受的，这是无障碍要求而不是口味问题。
 */
function reduceMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** 平滑还是直接跳：交给上面那条偏好决定 */
function scrollBehavior(): ScrollBehavior {
  return reduceMotion() ? 'auto' : 'smooth';
}

/**
 * 跳到某一节。
 *
 * **必须是 JS 滚动，不能写成 `<a href="#zht-sec-3">`**：本站用的是 `HashRouter`
 * （`src/main.tsx`），地址栏里的 `#` 就是路由本身——点一个 `href="#zht-sec-3"`
 * 会把路由改成 `/zht-sec-3` 并渲染「页面不存在」，而不是滚动。只有导航与滚动分离
 * （`scrollIntoView`）才既跳得对又不改路由。
 */
function jumpToSection(no: number) {
  document.getElementById(sectionAnchorId(no))?.scrollIntoView({
    behavior: scrollBehavior(),
    block: 'start',
  });
}

/**
 * 等两帧再做事：调用方先改了折叠状态，要等 React 把 DOM 提交完、浏览器重新量过高度，
 * 滚动才落得准（否则按旧高度算出来的位置会差出被展开的那几百像素）。
 * 服务端渲染里没有 `requestAnimationFrame`，兜底直接执行。
 */
function afterLayout(fn: () => void) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  } else {
    fn();
  }
}

/* ------------------- 折叠状态的持久化（localStorage） ------------------- */

/**
 * 每一节的展开集合按专题分开存：键 `zht-open:<专题 id>`，值是**已展开的节名数组**。
 * 存节名而不是下标：节增删、调序之后旧记录最多是多一条陌生节名（会被过滤掉），
 * 而存下标会让整份记录错位到别的节上。
 */
const openKeyOf = (topicId: string) => `zht-open:${topicId}`;

function readOpenNames(topicId: string): string[] | null {
  try {
    const raw = globalThis.localStorage?.getItem(openKeyOf(topicId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    /* 服务端渲染、隐私模式、脏数据：一律回落到默认状态 */
    return null;
  }
}

function writeOpenNames(topicId: string, names: string[]): void {
  try {
    globalThis.localStorage?.setItem(openKeyOf(topicId), JSON.stringify(names));
  } catch {
    /* 写不进去也无所谓：折叠状态丢了不影响学习 */
  }
}

/**
 * 默认展开哪些节。
 * 没存过就只展开第一节——「讲透」长什么样必须一眼看到，全收起等于把内容藏起来；
 * 存过就照存的来（含「全部收起」留下的空数组）。
 */
function initialOpenNames(topicId: string, names: string[]): string[] {
  const stored = readOpenNames(topicId);
  // 与当前数据求交集：节名改过之后，旧记录里的陌生节名不该继续占位
  if (stored) return stored.filter((n) => names.includes(n));
  return names.length ? [names[0]] : [];
}

/** 区块（Fold）的展开状态：`1` / `0` 两个字符，比存 JSON 更抗脏数据 */
function readFoldOpen(storeKey: string | undefined, fallback: boolean): boolean {
  if (!storeKey) return fallback;
  try {
    const raw = globalThis.localStorage?.getItem(storeKey);
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    /* 同上：读不到就用默认值 */
  }
  return fallback;
}

function writeFoldOpen(storeKey: string | undefined, open: boolean): void {
  if (!storeKey) return;
  try {
    globalThis.localStorage?.setItem(storeKey, open ? '1' : '0');
  } catch {
    /* 同上 */
  }
}

/** 收起状态下这一节里有什么：写成一行小字，不展开也能判断值不值得看 */
function sectionOutline(ruleCount: number, exampleCount: number, pitfallCount: number): string {
  const parts: string[] = [];
  if (ruleCount) parts.push(`判定要点 ${ruleCount} 条`);
  if (exampleCount) parts.push(`正误对照 ${exampleCount} 例`);
  if (pitfallCount) parts.push(`易错 ${pitfallCount} 条`);
  return parts.join(' · ');
}

/**
 * 可折叠的长区块：标题行**整行可点**，收起时只留标题 + 数量徽标 + 一句说明。
 *
 * 正文用条件渲染摘掉（`{open ? … : null}`）而不是 CSS 隐藏——这一页的问题就是
 * DOM 节点太多（布局与绘制都按节点算），藏起来不减负等于没做。
 *
 * 展开状态也记到 localStorage（键由调用方拼好传进来）：学生把某个长区块折起来
 * 就是为了少滚动，下次进来又弹开等于白折。
 */
function Fold({
  icon,
  title,
  count,
  hint,
  defaultOpen = true,
  storeKey,
  bodyClassName,
  children,
}: {
  icon?: string;
  title: string;
  /** 标题右侧常驻的徽标（如「最近一年 · 2025」），收起时也看得见 */
  count?: ReactNode;
  /** 一句话说明这一块讲什么 */
  hint?: string;
  defaultOpen?: boolean;
  storeKey?: string;
  /** 正文容器的附加类（长列表用 `zht-cv` 让浏览器跳过离屏的布局与绘制） */
  bodyClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(() => readFoldOpen(storeKey, defaultOpen));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeFoldOpen(storeKey, next);
  };

  return (
    <section className={cn('card', 'zht-fold', open && 'is-open')}>
      <button type="button" className="zht-fold__head" aria-expanded={open} onClick={toggle}>
        <span className="card__title">
          {icon ? <span aria-hidden>{icon}</span> : null}
          {title}
        </span>
        {count}
        <span className="spacer" />
        {hint ? <span className="zht-fold__hint">{hint}</span> : null}
        <span className="zht-fold__state">{open ? '收起' : '展开'}</span>
        <span className="zht-fold__caret" aria-hidden>
          ▼
        </span>
      </button>
      {open ? <div className={cn('card__body', 'fade-in', bodyClassName)}>{children}</div> : null}
    </section>
  );
}

export default function ChineseExamTopicDetail({
  entry,
  moduleName,
}: {
  entry: ChineseExamTopicEntry;
  moduleName: string;
}) {
  const t = entry.data;
  const { state } = useStudy();
  const questions = entry.questions;
  const total = questions.length;
  const practiceBase = `/practice/${entry.moduleId}/${entry.id}`;

  /** 已过关题数：「全题过关」策略下的进度（`lib/progress.ts`），答题页写入 */
  const passed = useMemo(
    () => passedCount(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );
  const unpassed = useMemo(
    () => unpassedIds(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );

  /** 考情按年份倒序：最近一年在最上面，学生第一眼看到的是「现在怎么考」 */
  const trends = useMemo(() => [...t.trends].sort((a, b) => b.year.localeCompare(a.year)), [t.trends]);
  const latestYear = useMemo(
    () => t.trends.reduce((max, tr) => (tr.year > max ? tr.year : max), ''),
    [t.trends],
  );

  /** 每个训练组的题量；组名就是题目标签，与练习页 `?tag=` 的筛选口径完全一致 */
  const drills = useMemo(
    () =>
      t.drills.map((d) => ({
        ...d,
        count: questions.filter((q) => (q.tags ?? []).includes(d.name)).length,
      })),
    [t.drills, questions],
  );

  /** 没有任何训练组标签的题：它们仍会出现在「从头练这个专题」里，这里如实说明 */
  const ungrouped = useMemo(
    () => questions.filter((q) => !t.drills.some((d) => (q.tags ?? []).includes(d.name))).length,
    [t.drills, questions],
  );

  /**
   * 章节（逐类讲透）：每节带上**本节题量**，与训练分组同一口径（节名 = 组名 = 题目标签）。
   * `sections` 是后补字段，没写的专题拿到的是 undefined，区块与索引都自动消失。
   */
  const sections = useMemo(
    () =>
      (t.sections ?? []).map((s) => ({
        ...s,
        count: questions.filter((q) => (q.tags ?? []).includes(s.name)).length,
      })),
    [t.sections, questions],
  );

  /** 汇总用的例子总数（标题旁给「共 N 节 · M 个例子」） */
  const exampleCount = useMemo(
    () => sections.reduce((n, s) => n + (s.examples?.length ?? 0), 0),
    [sections],
  );

  /** 节名数组：折叠状态按它存、按它比对（每帧都在用，不重算） */
  const sectionNames = useMemo(() => sections.map((s) => s.name), [sections]);

  /** 题库总览：只取前若干条，切片也在 memo 里，避免每次渲染重算 */
  const preview = useMemo(() => questions.slice(0, PREVIEW_LIMIT), [questions]);

  /* ------------------------ 逐类讲透：展开集合 ------------------------ */

  const [openMemo, setOpenMemo] = useState(() => ({
    topicId: entry.id,
    names: initialOpenNames(entry.id, sectionNames),
  }));

  /**
   * 换了专题就重置展开集合。
   * 外壳的 `<main key={location.pathname}>` 让详情页整棵子树重挂载，正常情况下这里
   * 不会命中；但详情页本身不带 key（`DetailPage` 按 moduleId 分发），一旦外壳哪天改了，
   * 上一个专题的节名会留在 state 里、表现为「刚进来就莫名展开着某一节」，所以留一道闸。
   */
  if (openMemo.topicId !== entry.id) {
    setOpenMemo({ topicId: entry.id, names: initialOpenNames(entry.id, sectionNames) });
  }
  const openNames = openMemo.names;

  /** 所有写入口都走这里：先落状态再落 localStorage，两处不会漂移 */
  const applyOpenNames = (next: string[]) => {
    setOpenMemo({ topicId: entry.id, names: next });
    writeOpenNames(entry.id, next);
  };

  const toggleSection = (name: string) => {
    applyOpenNames(
      openNames.includes(name) ? openNames.filter((n) => n !== name) : [...openNames, name],
    );
  };

  /** 章节索引点击用：只加不减（学生要的是「把这一节打开给我看」） */
  const openSection = (name: string) => {
    if (openNames.includes(name)) return;
    applyOpenNames([...openNames, name]);
  };

  /** 「展开全部」：全部节名一次写进记录 */
  const expandAllSections = () => applyOpenNames(sectionNames.slice());

  /** 「收起全部」：留一个空数组（和「从来没展开过」区分开，下次进来仍是全收起） */
  const collapseAllSections = () => applyOpenNames([]);

  /* ------------------------- 浮动按钮的显隐 ------------------------- */

  const [floatOn, setFloatOn] = useState(false);
  /** 上一次的显隐结果：滚动事件每帧都来，值没变就不 setState，别让滚动变卡 */
  const floatRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > FLOAT_AFTER;
      if (next === floatRef.current) return;
      floatRef.current = next;
      setFloatOn(next);
    };
    // 先同步一次：从别的页面带着滚动位置进来时，状态要跟当前位置一致
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  /** 章节索引：先把那一节展开，等 DOM 提交完再滚过去（否则滚动位置会差一截） */
  const jumpAfterOpen = (name: string, no: number) => {
    openSection(name);
    afterLayout(() => jumpToSection(no));
  };

  return (
    <DetailShell
      entry={entry}
      subjectId="chinese"
      moduleName={moduleName}
      backTo={`/s/chinese/${entry.moduleId}`}
      subtitle={<span>{t.paper}</span>}
      actions={
        total > 0 ? (
          <Link className="btn btn--sm btn--primary" to={practiceBase}>
            ✍️ 刷题（全部 {total} 题）
          </Link>
        ) : null
      }
    >
      {/* ① 攻破标准：把「怎样才算学完」说在最前面，并把全题过关进度摆出来 */}
      <section className="card card--pad zht-standard">
        <div className="zht-standard__label">这个专题攻破的标准</div>
        <div className="zht-standard__text">本专题每一道题都答对过，才算攻破。</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="red">共 {total} 题</Tag>
          <Tag tone="jade">
            已过关 {passed} / {total}
          </Tag>
          {drills.length ? <Tag tone="gold">{drills.length} 组专项训练</Tag> : null}
          {t.trends.length ? <Tag tone="blue">近五年考情 {t.trends.length} 条</Tag> : null}
        </div>
        <div className="small muted" style={{ marginTop: 8, lineHeight: 1.85 }}>
          过关按「每道题曾经答对过一次」记：答错的题会进错题本，重做后答对同样算过关，
          不必从头再来一遍。因此这一块的进度只增不减，凑够 {total} / {total} 就是把这个专题拿下。
        </div>
      </section>

      {/*
        ①′ 章节索引：专题粒度太粗，「逐类讲透」可能有十几节，先给一份能点的目录，
        学生直接跳到「我今天就要补的那一节」。少于 6 节时不给（页面本来就不长，目录成噪音）。
        点一节会**先把那一节展开**再滚过去——收起状态下滚过去只会看到一行节头。
      */}
      {sections.length >= SECTION_NAV_MIN ? (
        <section className="card card--pad zht-secnav">
          <div className="row row--between row--wrap" style={{ gap: 8 }}>
            <div className="zht-secnav__title">🧩 章节索引（{sections.length} 节）</div>
            <span className="small muted">点一节跳到那一节：判定要点 + 正误例子 + 当节练习</span>
          </div>
          <div className="row row--wrap" style={{ marginTop: 10 }}>
            {sections.map((s, i) => (
              <button
                className="zht-secnav__item"
                key={s.name}
                onClick={() => jumpAfterOpen(s.name, i + 1)}
                title={s.intro}
              >
                <span>
                  {i + 1}. {s.name}
                </span>
                <span className="zht-secnav__count">{s.count} 题</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* ② 一句话拿分逻辑：试卷上这一块考什么、分丢在哪 */}
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">一句话拿分逻辑</div>
        <div className="history-mainline__text">
          <Emph text={t.summary} />
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          卷面定位：{t.paper}
        </div>
      </section>

      {/* ③ 近五年考情：逐年一条，最近一年置顶；结论单独强调 */}
      {trends.length ? (
        <Fold
          icon="📈"
          title={`近五年考情（${trends.length} 条）`}
          count={latestYear ? <Tag tone="purple">最近一年 · {latestYear}</Tag> : null}
          hint="逐年形态与分值"
          storeKey={`zht-fold:${entry.id}:trends`}
          bodyClassName="zht-cv"
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            只看「这几年都在考什么形态、分值大概多少、选材偏向什么」——考情用来决定复习时间往哪块倾斜，
            具体某一年考了哪道题不必记。
          </div>
          <div className="stack stack--sm">
            {trends.map((tr) => (
              <div className={cn('zht-trend', tr.year === latestYear && 'is-latest')} key={tr.year}>
                <div className="zht-trend__year">
                  <span>{tr.year}</span>
                  {tr.year === latestYear ? <Tag tone="red">最近一年</Tag> : null}
                </div>
                <div className="zht-trend__note">
                  <Emph text={tr.note} />
                </div>
              </div>
            ))}
          </div>

          {/* 趋势结论：单列强调，它是「接下来怎么复习」的依据 */}
          <div className="sample-highlight" style={{ marginTop: 12 }}>
            <div className="small muted" style={{ marginBottom: 4 }}>
              五年趋势结论
            </div>
            <div className="sample-highlight__sentence">
              <Emph text={t.trendSummary} />
            </div>
          </div>
        </Fold>
      ) : null}

      {/* ④ 命题角度：这几年反复从哪几个角度考，复习时对号入座 */}
      {t.angles.length ? (
        <Fold
          icon="🎯"
          title={`命题角度（${t.angles.length} 类）`}
          hint="复习时对号入座"
          storeKey={`zht-fold:${entry.id}:angles`}
          bodyClassName="zht-cv"
        >
          <div className="stack stack--sm">
            {t.angles.map((a, i) => (
              <div className="history-angle" key={`${a.angle}-${i}`}>
                <div className="history-angle__head">
                  <Tag tone="purple">{a.angle}</Tag>
                  {a.years ? <span className="small muted">{a.years}</span> : null}
                </div>
                <div className="history-angle__detail">
                  <Emph text={a.detail} />
                </div>
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/* ⑤ 分步讲解：考场上的动作序列，每一步「做什么」，demo 是「做一遍给你看」 */}
      {t.steps.length ? (
        <Fold
          icon="🧭"
          title={`分步讲解（${t.steps.length} 步）`}
          hint="按顺序做，别跳步"
          storeKey={`zht-fold:${entry.id}:steps`}
          bodyClassName="zht-cv"
        >
          <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
            这几步是考场上真按这个顺序执行的，读的时候把每一步的「动作」记下来，
            带「示范」的引用块是这一步的完整做法。
          </div>
          <div className="stack stack--sm">
            {t.steps.map((s, i) => (
              <div className="zht-step" key={`${s.heading}-${i}`}>
                <div className="zht-step__head">
                  <span className="zht-step__no">{i + 1}</span>
                  <span className="zht-step__heading">{s.heading}</span>
                </div>
                <div className="zht-step__body">
                  <Emph text={s.body} />
                </div>
                {s.demo ? (
                  <div className="zht-demo">
                    <div className="zht-demo__label">示范</div>
                    <div className="zht-demo__text">
                      <Emph text={s.demo} />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/*
        ⑥ 逐类讲透：专题之下每个子类一节——判定要点（rules）+ 正误对照例子（examples）
        + 本节易错（pitfalls）+ 当节练习入口。这是「讲透」真正落地的区块：
        例子必须正误对照才学得会判断，所以 ok === true 走绿色 ✔、否则走红色 ✘，
        有 fix 的直接把「改成什么」摆在错例下面。

        每一节**默认只渲染节头**（序号 + 节名 + 本节有什么 + 题量 + 刷这一节），
        正文靠条件渲染摘掉；第一节默认展开。「刷这一节」放在节头里而不是正文里，
        是为了让学生不舍得展开也能直接开练：入口和折叠无关。
      */}
      {sections.length ? (
        <Section
          title="逐类讲透"
          icon="🧩"
          extra={
            <span className="zht-secall">
              <span className="zht-secall__count">
                共 {sections.length} 节 · {exampleCount} 个例子
              </span>
              <button type="button" className="btn btn--sm" onClick={expandAllSections}>
                展开全部
              </button>
              <button type="button" className="btn btn--sm" onClick={collapseAllSections}>
                收起全部
              </button>
            </span>
          }
        >
          <div className="small muted" style={{ marginBottom: 12, lineHeight: 1.85 }}>
            一个专题（如「积累与运用」）不是一个能直接下手的单位，真正要练的是它下面的子类。
            每一节都有判断方法、正误对照的例子和当节练习——默认只展开第一节，
            想看哪一节点哪一节（章节索引也能直接跳过去），看完立刻刷一节。
          </div>

          <div className="stack stack--lg">
            {sections.map((s, i) => {
              const open = openNames.includes(s.name);
              const ruleCount = s.rules?.length ?? 0;
              const exampleNum = s.examples?.length ?? 0;
              const pitfallNum = s.pitfalls?.length ?? 0;
              return (
                <section
                  className={cn(
                    'zht-sec',
                    open && 'is-open',
                    // 收起的节只有节头一行，离屏时交给浏览器跳过布局与绘制
                    // （展开的那一节不加：它刚被点开就在眼前，跳过去反而要重新量高度）
                    !open && 'zht-cv zht-cv--sec',
                  )}
                  id={sectionAnchorId(i + 1)}
                  key={s.name}
                >
                  <div className="zht-sec__head">
                    <button
                      type="button"
                      className="zht-sec__toggle"
                      aria-expanded={open}
                      onClick={() => toggleSection(s.name)}
                    >
                      <span className="zht-sec__no">{i + 1}</span>
                      <span className="zht-sec__name">{s.name}</span>
                      <span className="zht-sec__meta">
                        {sectionOutline(ruleCount, exampleNum, pitfallNum)}
                      </span>
                      <span className="zht-sec__caret" aria-hidden>
                        ▼
                      </span>
                    </button>

                    {/* 节头右侧：本节题量 + 当节练习入口，展开与否都常驻 */}
                    <span className="zht-sec__tools">
                      <Tag tone={s.count ? 'jade' : 'default'}>{s.count} 题</Tag>
                      <Link
                        className="btn btn--sm"
                        to={`${practiceBase}?tag=${encodeURIComponent(s.name)}`}
                      >
                        ✍️ 刷这一节（本节 {s.count} 题）
                      </Link>
                      {s.count === 0 ? <span className="small muted">本节题目正在补充</span> : null}
                    </span>
                  </div>

                  {open ? (
                    <div className="zht-sec__body fade-in">
                      <div className="zht-sec__intro">
                        <Emph text={s.intro} />
                      </div>

                      {/* 判定要点：写「怎么一眼看出来」，编号列出，与正文视觉分开 */}
                      {s.rules?.length ? (
                        <div className="zht-rules">
                          <div className="zht-rules__title">判定要点</div>
                          <ol className="zht-rules__items">
                            {s.rules.map((r, k) => (
                              <li key={k}>
                                <Emph text={r} />
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}

                      {/* 正误对照：最要紧的一块——错例要说清错在哪、改成什么 */}
                      {s.examples?.length ? (
                        <div className="stack stack--sm" style={{ marginTop: 12 }}>
                          <div className="zht-ex__caption">
                            ✍️ 正误对照（{s.examples.length} 例 · ✔ 规范 ✘ 有问题）
                          </div>
                          {s.examples.map((ex, k) => {
                            const ok = ex.ok === true;
                            return (
                              <div className={cn('zht-ex', ok ? 'is-ok' : 'is-bad')} key={k}>
                                <div className="zht-ex__row">
                                  <span className="zht-ex__mark" aria-hidden>
                                    {ok ? '✔' : '✘'}
                                  </span>
                                  <span className="zht-ex__text">
                                    <Emph text={ex.text} />
                                  </span>
                                </div>
                                <div className="zht-ex__analysis">
                                  <span className="zht-ex__label">讲解：</span>
                                  <Emph text={ex.analysis} />
                                </div>
                                {ex.fix ? (
                                  <div className="zht-ex__fix">
                                    <span className="zht-ex__label">改：</span>
                                    <Emph text={ex.fix} />
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* 本节易错：与专题级同一套三行写法（✘ 常犯 / ✔ 正确 / 为什么容易错） */}
                      {s.pitfalls?.length ? (
                        <div className="zht-sec__traps">
                          <div className="zht-sec__trapsTitle">本节易错（错在哪 → 怎么办）</div>
                          <div className="stack stack--sm">
                            {s.pitfalls.map((p, k) => (
                              <div className="zht-sec__trap" key={k}>
                                <span className="zht-sec__trapMark">◆</span>
                                {typeof p === 'string' ? (
                                  <span>
                                    <Emph text={p} />
                                  </span>
                                ) : (
                                  <span className="stack stack--sm">
                                    <span>
                                      <b>✘ 常犯：</b>
                                      <Emph text={p.wrong} />
                                    </span>
                                    <span>
                                      <b>✔ 正确：</b>
                                      <Emph text={p.right} />
                                    </span>
                                    <span className="small muted">
                                      为什么容易错：<Emph text={p.why} />
                                    </span>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </Section>
      ) : null}

      {/* ⑦ 答题模板：可以直接背下来套用的成套句式 */}
      {t.templates?.length ? (
        <Section
          title={`答题模板（${t.templates.length} 套）`}
          icon="📋"
          extra={<Tag tone="jade">可以直接背下来套用</Tag>}
        >
          <div className="stack stack--lg">
            {t.templates.map((tpl, i) => (
              <div className="zht-template" key={`${tpl.name}-${i}`}>
                <div className="zht-template__name">{tpl.name}</div>
                <ol className="zht-template__items">
                  {tpl.items.map((it, k) => (
                    <li key={k}>
                      <Emph text={it} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
            用法：先背成条的句式（顺序也一起背），考场上按句式填内容——模板的作用是保证不漏项，
            不是代替思考。
          </div>
        </Section>
      ) : null}

      {/* ⑧ 评分点／踩分点：写成「写到什么才给分」，做完题逐条对照 */}
      {t.scoring?.length ? (
        <Section
          title={`评分点与踩分点（${t.scoring.length} 条）`}
          icon="✅"
          extra={<span className="small muted">写到什么才给分</span>}
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            做完一组题，拿这几条对自己的答案过一遍：说到哪几条、漏了哪几条，比「感觉答得还行」准得多。
          </div>
          <div className="rubric">
            <div className="rubric__title">对照检查自己答到了几条</div>
            {t.scoring.map((s, i) => (
              <div className="rubric__item" key={i}>
                <span className="rubric__mark">◆</span>
                <span>
                  <Emph text={s} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑨ 易错与失分：错在哪 → 应该怎么做 → 为什么容易错（三行） */}
      {t.pitfalls?.length ? (
        <Section
          title={`易错与失分（${t.pitfalls.length} 条）`}
          icon="⚠️"
          extra={<span className="small muted">都是「好像会了」的地方</span>}
        >
          <div className="stack stack--sm">
            {t.pitfalls.map((p, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="red">✘ 常见做法</Tag>
                  <span>{p.wrong}</span>
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">✔ 应该这样做</Tag>
                  <span>{p.right}</span>
                </div>
                <div className="small muted">为什么容易错：{p.why}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑩ 专项训练分组：组名即题目标签，一组一个入口，只出这一组的题 */}
      {drills.length ? (
        <Fold
          icon="🏋️"
          title={`专项训练（${drills.length} 组 · ${total} 题）`}
          hint="点「刷这一组」只出这一组的题"
          storeKey={`zht-fold:${entry.id}:drills`}
          bodyClassName="zht-cv"
        >
          <div className="small muted" style={{ marginBottom: 12, lineHeight: 1.85 }}>
            每一组对应一种卷面考法，组名就是题目上的标签。建议一组一组过：练完一组，
            这一组的题都会记进上面的过关进度。
          </div>
          <div className="grid grid--auto">
            {drills.map((d, i) => (
              <div
                className="card card--pad card--flat stack stack--sm"
                key={d.name}
                style={{ background: 'var(--c-surface-2)' }}
              >
                <div className="row row--between">
                  <span className="bold">
                    {i + 1}. {d.name}
                  </span>
                  <Tag tone={d.count ? 'jade' : 'default'}>{d.count} 题</Tag>
                </div>
                <div className="small muted" style={{ lineHeight: 1.8 }}>
                  {d.note}
                </div>
                <div className="row row--wrap">
                  <Link
                    className="btn btn--sm"
                    to={`${practiceBase}?tag=${encodeURIComponent(d.name)}`}
                  >
                    ✍️ 刷这一组
                  </Link>
                  {d.count === 0 ? <span className="small muted">本组题目正在补充</span> : null}
                </div>
              </div>
            ))}
          </div>
          {ungrouped > 0 ? (
            <div className="small muted" style={{ marginTop: 10 }}>
              另有 {ungrouped} 题暂未归入上面的训练组，练「从头练这个专题」时会一并出现。
            </div>
          ) : null}
        </Fold>
      ) : null}

      {/*
        ⑪ 题库总览：只给题干摘要与题型，用来判断题量，作答一律走练习页。
        **默认收起**：这一块最多就是一份长清单，学生进详情页要的是讲解；
        展开后也只列前 `PREVIEW_LIMIT` 条，其余的去练习页按组出题。
      */}
      <Fold
        icon="📚"
        title={`题库总览（共 ${total} 题）`}
        hint="只列题干，作答在练习页"
        defaultOpen={false}
        storeKey={`zht-fold:${entry.id}:bank`}
        bodyClassName="zht-cv"
      >
        {preview.length ? (
          <>
            <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
              这里只列题干，用来判断这一专题的题量与考法；不在详情页作答，做题请走上面的训练组入口。
            </div>
            <div>
              {preview.map((q, i) => (
                <div className="zht-q" key={q.id}>
                  <span className="zht-q__no">{i + 1}</span>
                  <span className="zht-q__stem">
                    <Emph text={summarize(q.stem)} />
                  </span>
                  <span className="zht-q__type">
                    <Tag tone="blue">{TYPE_LABEL[q.type]}</Tag>
                    {q.difficulty ? (
                      <span className="small muted">{DIFFICULTY_LABEL[q.difficulty]}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
            {total > preview.length ? (
              <div className="small muted" style={{ marginTop: 10 }}>
                以上是第 1—{preview.length} 题，其余 {total - preview.length} 题在练习页里按组出题。
              </div>
            ) : null}
          </>
        ) : (
          <div className="small muted">本专题的题库正在补充，先看讲解，题目到位后入口会自动出现。</div>
        )}
      </Fold>

      {/* ⑫ 底部行动条：从头练全部题；已经练过的，只练还没过关的那几题 */}
      <section className="card card--pad zht-cta">
        <div className="row row--between row--wrap" style={{ alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="zht-cta__title">🎯 从头练这个专题（全部 {total} 题）</div>
            <div className="small muted" style={{ marginTop: 4, lineHeight: 1.85 }}>
              {passed > 0
                ? `已过关 ${passed} / ${total}，还差 ${Math.max(total - passed, 0)} 题。`
                : '按顺序过一遍，答对的题记一次过关，答错的题进错题本，重做答对同样算过关。'}
            </div>
          </div>
          {total > 0 ? (
            <div className="row row--wrap">
              {unpassed.length > 0 && unpassed.length < total ? (
                <Link
                  className="btn btn--sm"
                  to={`${practiceBase}?ids=${unpassed.slice(0, 60).join(',')}`}
                >
                  🎯 只练还没过关的 {unpassed.length} 题
                </Link>
              ) : null}
              <Link className="btn btn--primary" to={practiceBase}>
                ✍️ 从头练这个专题（全部 {total} 题）
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/*
        ⑬ 浮动按钮：页面长起来之后（超过约一屏）才淡入。
        始终渲染在 DOM 里、靠 `is-on` 控制显隐，是为了让服务端渲染的冒烟断言
        能直接看到这组结构；`prefers-reduced-motion` 下不做平滑动画（见 index.css）。
      */}
      <nav className={cn('zht-float', floatOn && 'is-on')} aria-label="页面快捷操作">
        <button type="button" className="btn btn--sm zht-float__btn" onClick={backToTop}>
          ↑ 顶部
        </button>
        <Link className="btn btn--sm zht-float__btn" to={`/s/chinese/${entry.moduleId}`}>
          ← 专题列表
        </Link>
      </nav>
    </DetailShell>
  );
}

/**
 * 具名导出：与其它详情页 `import { XDetail } from './detail/XDetail'` 的写法保持兼容。
 * 接线时用默认导入或具名导入都可以。
 */
export { ChineseExamTopicDetail };
