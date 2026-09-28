/**
 * 「题型专题」两级页面共用的积木，**学科无关**。
 *
 * 为什么要单独一个文件：专题页（`/s/:subjectId/:moduleId/:itemId`）与章节页
 * （`/s/:subjectId/:moduleId/:itemId/sec/:sectionNo`）是同一份数据（`types.ts` 的
 * `ExamTopic`）的两种读法——专题页读「总览 + 章节清单」，章节页读「一节讲透」。
 * 两页要用同一套折叠、同一套例子渲染、同一套章节卡片，否则「看讲解」进去之后
 * 字体、颜色、例子排版全变一遍，学生会以为跳到了另一个站。
 *
 * 每个组件都**只认字段、不认学科**：
 *   - 语文靠正误对照讲透（`ok` = 规范例句 / 省略 = 错例，`fix` = 改后的句子）；
 *   - 数学靠完整做一道题讲透（`steps` = 分步解答，`answer` = 答案）。
 * 因此文案由**数据里有什么**自动切换（见 `exampleKindOf`），这里没有任何
 * `moduleId === 'zh-topics'` 这类判断——数学那边接好线之后原样可用。
 *
 * 样式一律走 `.exam-*`（学科通用，追加在 `index.css` 末尾），不用语文的 `.zht-*`。
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ExamExample, ExamSection } from '../../types';
import { cn } from '../../lib/utils';
import { isStepExample } from '../../lib/examTopic';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';

/* ------------------------------ 文本 ------------------------------ */

/**
 * 专题正文里的行内富文本：**加粗 + 公式**，学科无关。
 *
 * - `**…**`：数据里偶有 Markdown 加粗标记（如 `trendSummary`），渲染成 `<strong>`
 *   才不会让学生看到一排星号；
 * - `$…$`：数学的行内公式（`TOPICS-SPEC.md` 第四节：正文公式用 `$…$` 包裹）。
 *   交给 `RichText` 渲染——它在**没有 `$` 时纯文本直出**（语文零开销），
 *   遇到公式才按需加载 KaTeX（`components/Tex.tsx`），因此语文学生永远不会为
 *   600 kB 的公式渲染器买单。
 *
 * 少了公式这一半，数学专题页与章节页会把 `$x^2-2x-3$` 原样显示出来
 * （冒烟测试的「数学页面不得残留 $ 公式源码」也会红）。
 */
export function Emph({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return <RichText text={text} />;
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{p}</strong>
        ) : (
          // 加粗之外的每一段各自过一遍富文本：`**…**` 与 `$…$` 混在一句里也不会漏
          <RichText key={i} text={p} />
        ),
      )}
    </>
  );
}

/**
 * 截断时不要切在 `$…$` 中间。
 *
 * 数学的一句话要点/题干里常有行内公式（`$\sqrt{12}=\sqrt3\times4$`），
 * 按字数硬切会把公式切成半个（`$\sqrt{1`）——公式渲染器拿到不配对的 `$` 只能原样吐出，
 * 学生看到的就是一段乱码。宁可少截几个字，也别把公式切坏。
 */
function cutOutsideFormula(one: string, limit: number): string {
  if (one.length <= limit) return one;
  let cut = one.slice(0, limit);
  const dollars = (cut.match(/\$/g) ?? []).length;
  if (dollars % 2 === 1) {
    const last = cut.lastIndexOf('$');
    if (last > 0) cut = cut.slice(0, last);
  }
  return `${cut}…`;
}

/** 把换行与连续空格压成一行，超长截断加省略号（题干、要点都是长文本，整段铺开会把页面拉爆） */
export function summarize(text: string, limit = 60): string {
  return cutOutsideFormula(text.replace(/\s+/g, ' ').trim(), limit);
}

/**
 * 取第一句话，超长再截断。
 *
 * 章节卡片上要「一句话说清这一节讲什么」，而 `intro` 是**整段讲解**：
 * 直接铺上去，17 节就是 17 段正文，页面又变回改造前那个样子。所以只取首句
 * （中文句末标点：。！？；），并把结尾标点去掉——卡片上是提示语，不是正文。
 */
export function firstSentence(text: string, limit = 72): string {
  const one = text.replace(/\s+/g, ' ').trim();
  const cut = one.search(/[。！？；]/);
  const head = cut >= 0 ? one.slice(0, cut) : one;
  return summarize(head, limit);
}

/** 收起的章节里有什么：写成一行小字，不展开也能判断值不值得看 */
export function sectionOutline(
  ruleCount: number,
  exampleCount: number,
  pitfallCount: number,
): string {
  const parts: string[] = [];
  if (ruleCount) parts.push(`要点 ${ruleCount} 条`);
  if (exampleCount) parts.push(`例子 ${exampleCount} 个`);
  if (pitfallCount) parts.push(`易错 ${pitfallCount} 条`);
  return parts.join(' · ');
}

/* --------------------------- 路径 / 链接 --------------------------- */

/** 章节页：一页只讲一节，能独立打开、能分享 */
export function sectionPath(
  subjectId: string,
  moduleId: string,
  itemId: string,
  no: number,
): string {
  return `/s/${subjectId}/${moduleId}/${itemId}/sec/${no}`;
}

/**
 * 章节清单路径：回专题页，并带上 `?sec=<第几节>` 让清单把那一节标出来。
 *
 * 为什么不用锚点（`#exam-sec-3`）：本站是 `HashRouter`，地址栏里的 `#` 就是路由本身，
 * 锚点会把路由改成 `/exam-sec-3` 并渲染「页面不存在」。用查询参数既不改路由，
 * 又能让专题页知道「学生是从哪一节回来的」。
 */
export function sectionListPath(
  subjectId: string,
  moduleId: string,
  itemId: string,
  no?: number,
): string {
  const base = `/s/${subjectId}/${moduleId}/${itemId}`;
  return no && no > 0 ? `${base}?sec=${no}` : base;
}

/**
 * 本节组卷链接。**组名本身就是题目上的标签**（见 `data/chinese/zh-topics/CONTENT-SPEC.md`），
 * 所以不需要另建一套组的 id：`?tag=<节名>` 与练习页的筛选口径完全一致。
 */
export function practiceTagPath(moduleId: string, itemId: string, tag: string): string {
  return `/practice/${moduleId}/${itemId}?tag=${encodeURIComponent(tag)}`;
}

/* ------------------------------ 折叠 ------------------------------ */

/**
 * 系统开了「减少动态效果」时不做平滑滚动、不做淡入淡出：
 * 前庭敏感的学生被强制看一段长滚动动画是会难受的，这是无障碍要求而不是口味问题。
 */
export function reduceMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    /* 服务端渲染里没有 window/matchMedia：按「不减少」处理 */
    return false;
  }
}

/** 平滑还是直接跳：交给上面那条偏好决定 */
export function scrollBehavior(): ScrollBehavior {
  return reduceMotion() ? 'auto' : 'smooth';
}

/** 回到页面顶部（浮动按钮用） */
export function backToTop(): void {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

/** 区块（Fold）的展开状态：`1` / `0` 两个字符，比存 JSON 更抗脏数据 */
function readFoldOpen(storeKey: string | undefined, fallback: boolean): boolean {
  if (!storeKey) return fallback;
  try {
    const raw = globalThis.localStorage?.getItem(storeKey);
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    /* 服务端渲染、隐私模式、脏数据：一律回落到默认状态 */
  }
  return fallback;
}

function writeFoldOpen(storeKey: string | undefined, open: boolean): void {
  if (!storeKey) return;
  try {
    globalThis.localStorage?.setItem(storeKey, open ? '1' : '0');
  } catch {
    /* 写不进去也无所谓：折叠状态丢了不影响学习 */
  }
}

/**
 * 可折叠的长区块：标题行**整行可点**，收起时只留标题 + 数量徽标 + 一句说明。
 *
 * 正文用条件渲染摘掉（`{open ? … : null}`）而不是 CSS 隐藏——专题页的问题本来就是
 * DOM 节点太多（样式计算、布局与绘制都按节点算），藏起来不减负等于没做。
 *
 * 展开状态记在 localStorage（键由调用方拼好传进来）：学生把某个长区块折起来
 * 就是为了少滚动，下次进来又弹开等于白折。
 */
export function Fold({
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
  /** 正文容器的附加类（长列表用 `exam-cv` 让浏览器跳过离屏的布局与绘制） */
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
    <section className={cn('card', 'exam-fold', open && 'is-open')}>
      <button type="button" className="exam-fold__head" aria-expanded={open} onClick={toggle}>
        <span className="card__title">
          {icon ? <span aria-hidden>{icon}</span> : null}
          {title}
        </span>
        {count}
        <span className="spacer" />
        {hint ? <span className="exam-fold__hint">{hint}</span> : null}
        <span className="exam-fold__state">{open ? '收起' : '展开'}</span>
        <span className="exam-fold__caret" aria-hidden>
          ▼
        </span>
      </button>
      {open ? <div className={cn('card__body', 'fade-in', bodyClassName)}>{children}</div> : null}
    </section>
  );
}

/* ------------------------------ 例子 ------------------------------ */

/**
 * 这一节的例子是哪种讲法：**按数据判断，不按学科判断**（判据复用 `lib/examTopic.ts`）。
 *
 * 只要有例子写了 `steps`（数学的分步解答），整节就按「完整做一道题」的讲法排；
 * 否则按「正误对照」的讲法排（语文的 `ok` / `fix`）。同一个专题里两种混着写也扛得住
 * ——`ExampleList` 是**逐条**判断的，标题只用一个能概括整节的词。
 */
export type ExampleKind = 'pair' | 'solve';

export function exampleKindOf(examples: ExamExample[] | undefined): ExampleKind {
  return (examples ?? []).some(isStepExample) ? 'solve' : 'pair';
}

/** 判定要点 / 解题套路的小标题：两种讲法各有更顺口的说法 */
export function rulesTitleFor(kind: ExampleKind): string {
  return kind === 'solve' ? '解题套路' : '判定要点';
}

/** 例子区块的小标题 */
export function examplesCaptionFor(kind: ExampleKind, count: number): string {
  return kind === 'solve'
    ? `✍️ 例题精讲（${count} 例 · 每题分步做完）`
    : `✍️ 正误对照（${count} 例 · ✔ 规范 ✘ 有问题）`;
}

/**
 * 例子列表：一套代码渲染两种讲法。
 *
 *   - `pair`（语文）：`✔ 规范例句` / `✘ 有问题的例句` + 「讲解：错在哪」+「改：改成什么」；
 *   - `solve`（数学）：题目 + 分步解答（编号）+ 答案 + 「怎么想到的」。
 *
 * ## 为什么一条例子一个折叠（**默认只展开第一条**）
 *
 * 每节加厚到 4—6 条例子之后，把「题干 + 分步解答 / 讲解 + 改」全铺开，一节就是
 * 十几段正文——用户当初提的「一个卡片展示东西太多，导致很长，页面展示不友好」
 * 会原样回来。所以：
 *
 *   - **题干永远可见**：例子本身就是题目，藏起来学生就不知道该想什么；
 *   - **讲解默认收在第一条**：第一条给样板（怎么读讲解），其余先让学生自己判一遍
 *     再展开对答案——这类题只有这样读才长本事，先看讲解等于抄答案；
 *   - **一行「展开全部讲解 / 收起全部」**：想通读的学生一次点开，不必逐条点。
 *
 * 折叠状态**不落 localStorage**：它是「这一遍怎么读」的临时状态，学生换一节就该
 * 重新从「第一条展开」开始；记忆展开状态反而会让某几节一进来就是全铺开的。
 *
 * 分步解答里的行内公式（`$…$`）交给现有的富文本渲染口径——这里是纯文本，
 * 数学公式由页面外层的渲染器处理（与其它数学页面一致）。
 */
export function ExampleList({ examples, kind }: { examples: ExamExample[]; kind: ExampleKind }) {
  /** 已展开的例子下标。初值 `[0]` 就是「默认只展开第一条」 */
  const [open, setOpen] = useState<number[]>(() => (examples.length ? [0] : []));

  if (!examples.length) return null;

  const allOpen = open.length >= examples.length;
  const toggleOne = (k: number) =>
    setOpen((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k].sort((a, b) => a - b)));
  const toggleAll = () => setOpen(allOpen ? [] : examples.map((_, k) => k));

  return (
    <div className="stack stack--sm">
      <div className="exam-ex__bar">
        <span className="exam-ex__caption">{examplesCaptionFor(kind, examples.length)}</span>
        <span className="spacer" />
        <button
          type="button"
          className="btn btn--sm exam-ex__allbtn"
          aria-expanded={allOpen}
          onClick={toggleAll}
        >
          {allOpen ? '收起全部讲解' : '展开全部讲解'}
        </button>
      </div>
      {examples.map((ex, k) => {
        const ok = ex.ok === true;
        /** 逐条判断：一节里混着「正误对照」与「分步解答」也各按各的排版 */
        const steps = isStepExample(ex) ? (ex.steps ?? []) : [];
        const isOpen = open.includes(k);
        /** 讲解部分（数学的分步解答也算）—— 有没有东西可展开 */
        const hasBody = Boolean(steps.length || ex.answer?.trim() || ex.analysis?.trim() || ex.fix?.trim());
        const mark = steps.length ? `${k + 1}` : ok ? '✔' : '✘';
        const label = steps.length ? '展开解答' : '展开讲解';

        return (
          <div className={cn('exam-ex', ok ? 'is-ok' : 'is-bad', isOpen && 'is-open')} key={k}>
            {hasBody ? (
              /*
               * 题干那一行就是开关（整行可点，手机上不必瞄准小按钮）。
               * 用 <button> 而不是给 div 挂 onClick：键盘 Tab、回车、读屏的
               * 「已展开 / 已折叠」都是白拿的。
               */
              <button
                type="button"
                className="exam-ex__head"
                aria-expanded={isOpen}
                onClick={() => toggleOne(k)}
              >
                <span className="exam-ex__mark" aria-hidden>
                  {mark}
                </span>
                <span className="exam-ex__text">
                  <Emph text={ex.text} />
                </span>
                <span className="exam-ex__state">{isOpen ? '收起' : label}</span>
                <span className="exam-ex__caret" aria-hidden>
                  ▼
                </span>
              </button>
            ) : (
              <div className="exam-ex__row">
                <span className="exam-ex__mark" aria-hidden>
                  {mark}
                </span>
                <span className="exam-ex__text">
                  <Emph text={ex.text} />
                </span>
              </div>
            )}

            {isOpen ? (
              <div className="exam-ex__body fade-in">
                {/* 分步解答（数学）：一步一步做完，最后单列答案便于快速核对 */}
                {steps.length ? (
                  <ol className="exam-ex__steps">
                    {steps.map((s, i) => (
                      <li key={i}>
                        <Emph text={s} />
                      </li>
                    ))}
                  </ol>
                ) : null}

                {ex.answer ? (
                  <div className="exam-ex__answer">
                    <span className="exam-ex__label">答案：</span>
                    <Emph text={ex.answer} />
                  </div>
                ) : null}

                {ex.analysis ? (
                  <div className="exam-ex__analysis">
                    <span className="exam-ex__label">{steps.length ? '怎么想到的：' : '讲解：'}</span>
                    <Emph text={ex.analysis} />
                  </div>
                ) : null}

                {/* 错例必须给「改成什么」：只指出错在哪，学生改的时候还是不会 */}
                {ex.fix ? (
                  <div className="exam-ex__fix">
                    <span className="exam-ex__label">改：</span>
                    <Emph text={ex.fix} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * 本节易错：两种写法都渲染（数据层允许纯字符串与三行对象混用）。
 * 三行对象是 `{ wrong, right, why }`，与专题级易错同一套写法。
 */
export function PitfallList({
  items,
  title = '本节易错（错在哪 → 怎么办）',
}: {
  items: ExamSection['pitfalls'];
  title?: string;
}) {
  if (!items?.length) return null;
  return (
    <div className="exam-traps">
      <div className="exam-traps__title">{title}</div>
      <div className="stack stack--sm">
        {items.map((p, k) => (
          <div className="exam-trap" key={k}>
            <span className="exam-trap__mark">◆</span>
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
  );
}

/* ---------------------------- 章节卡片 ---------------------------- */

/**
 * 章节清单里的一张**紧凑卡片**：序号 + 节名 + 一句话要点 + 徽标 + 两个动作。
 *
 * 这是这次改造的核心：专题页不再内联章节正文，一节只占三四行——
 * 「📖 看讲解」进章节页读透，「✍️ 刷这一节」直接开练。两个入口互不依赖：
 * 只想练的学生不必先点进讲解页。
 */
export function SectionCard({
  no,
  name,
  hint,
  exampleCount,
  questionCount,
  readTo,
  practiceTo,
  current = false,
  id,
}: {
  /** 第几节（从 1 开始） */
  no: number;
  name: string;
  /** 一句话要点（`intro` 首句截断） */
  hint: string;
  exampleCount: number;
  questionCount: number;
  readTo: string;
  practiceTo: string;
  /** 学生刚从这一节的章节页回来：标出来，免得在十几节里找不到自己刚才看的那节 */
  current?: boolean;
  id?: string;
}) {
  return (
    <section className={cn('exam-secitem', current && 'is-current')} id={id}>
      <div className="exam-secitem__head">
        <span className="exam-secitem__no">{no}</span>
        <span className="exam-secitem__name">{name}</span>
        <span className="spacer" />
        {exampleCount ? <Tag tone="purple">{exampleCount} 个例子</Tag> : null}
        <Tag tone={questionCount ? 'jade' : 'default'}>{questionCount} 题</Tag>
      </div>
      {hint ? (
        <div className="exam-secitem__hint">
          <Emph text={hint} />
        </div>
      ) : null}
      <div className="exam-secitem__acts">
        <Link className="btn btn--sm" to={readTo}>
          📖 看讲解
        </Link>
        <Link className="btn btn--sm" to={practiceTo}>
          ✍️ 刷这一节
        </Link>
        {questionCount === 0 ? <span className="small muted">本节题目正在补充</span> : null}
      </div>
    </section>
  );
}

/* ---------------------------- 浮动按钮 ---------------------------- */

/** 滚动超过这个距离才让浮动按钮淡入：刚进页面时右侧不摆多余的东西 */
const FLOAT_AFTER = 500;

/**
 * 滚动超过一屏之后才显示浮动按钮。
 *
 * 用 ref 记住上一次的结果：滚动事件每帧都来，值没变就不 setState，别让滚动变卡。
 * 服务端渲染里没有 window，整段逻辑放在 effect 里（首帧一律 `false`）。
 */
export function useFloatNav(after = FLOAT_AFTER): boolean {
  const [on, setOn] = useState(false);
  const last = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > after;
      if (next === last.current) return;
      last.current = next;
      setOn(next);
    };
    // 先同步一次：从别的页面带着滚动位置进来时，状态要跟当前位置一致
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [after]);

  return on;
}

/**
 * 浮动按钮：回顶部 + 退回上一级（专题列表 / 章节清单）。
 * 始终渲染在 DOM 里、靠 `is-on` 控制显隐，长页面里随时能回顶部或退出去。
 */
export function FloatNav({ listTo, listLabel }: { listTo: string; listLabel: string }) {
  const on = useFloatNav();
  return (
    <nav className={cn('exam-float', on && 'is-on')} aria-label="页面快捷操作">
      <button type="button" className="btn btn--sm exam-float__btn" onClick={backToTop}>
        ↑ 顶部
      </button>
      <Link className="btn btn--sm exam-float__btn" to={listTo}>
        {listLabel}
      </Link>
    </nav>
  );
}
