/**
 * 「题型专题」**章节页**：一页只讲一节 —— `/s/:subjectId/:moduleId/:itemId/sec/:sectionNo`
 *
 * ## 这一页存在的理由
 *
 * 改造前，专题页既要做总览（考情 / 角度 / 步骤 / 模板 / 评分点 / 易错），又要承载
 * 「逐类讲透」全部章节的正文，最多 17 节 ×（讲解 + 要点 + 3—8 条例子 + 易错 + 练习），
 * 于是「太长、信息密度太高」成了这一页最要命的问题。章节页把**正文从专题页搬出来**：
 *
 *   - 专题页 `/s/:subjectId/:moduleId/:itemId` 只留总览 + 章节清单（一节一张紧凑卡）；
 *   - 章节页 `/s/:subjectId/:moduleId/:itemId/sec/:sectionNo` 一页讲一节，读起来舒服。
 *
 * 两条页面各自只有一个任务，学生的动作也因此变得干净：在清单上挑一节 → 进来读透 →
 * 底下直接「刷这一节」→ 点「下一节」继续。**不再需要锚点滚动**
 * （收起 - 展开 - 跳转 - 又跳回来那套），每一节的地址本身就是一条可分享的链接，
 * 直接刷新也能打开（本页自己会去加载这个专题的正文，不依赖先访问专题页）。
 *
 * ## 页面区块（自上而下）
 *
 *   ① 面包屑          —— 首页 → 科目 → 模块 → 专题 → 本节（第 N 节 / 共 M 节）
 *   ② 节标题 + 题量    —— `N. 节名`，右侧「✍️ 刷这一节（N 题）」主按钮与「← 回到章节清单」
 *   ③ 本节正文         —— 拆成三张卡：`intro`（📖 本节讲解）→ `rules`（判定要点 / 解题套路）→
 *                        `examples`（正误对照或分步解答，**逐条折叠、默认只展开第一条**）→
 *                        `pitfalls`（本节易错）
 *   ④ 上一节 / 下一节   —— 到底了就禁用；旁边常驻「← 回到章节清单」
 *   ⑤ 底部             —— 本节练习入口（带本节过关进度）+「下一节」推荐
 *   ⑥ 浮动按钮         —— 滚动一段距离后淡入：回顶部 / 回章节清单
 *
 * ## 学科无关（语文 / 数学共用）
 *
 * 这里**不判断 moduleId**：
 *   - 正文按**数据形状**认（`lib/examTopic.ts` 的 `isExamTopicData`）：`data` 是题型专题就渲染，
 *     不是就给友好提示（数学的题专题按同一套字段落地后自动可用）；
 *   - 例子两种讲法都渲染（`ExamTopicParts` 的 `ExampleList`）：语文的 `ok` / `fix`
 *     与数学的 `steps` / `answer`，逐条按数据里有什么自动切换；
 *   - 路径全部由路由参数拼出来，科目名从模块注册表取。
 *
 * 正文的加载走**通用注册表**（`data/lazyEntries.ts` + `useLazyEntries`）：
 * `lazyEntrySpecFor(moduleId, itemId)` 问一句「这一条要不要单独下载正文」，
 * 再由 `useLazyEntries` 负责加载与失败重试。语文（`zh-topics`）与数学（`math-topics`）
 * 登记在同一张表里，所以本页没有任何模块 id 判断就覆盖了数学——
 * **直接刷新 / 直接分享链接**打开某一节也不需要先访问专题页。
 */

import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Entry, ExamSection, ExamTopic, ModuleId } from '../../types';
import { cn } from '../../lib/utils';
import { passedCount } from '../../lib/progress';
import { isExamTopicData } from '../../lib/examTopic';
import { useStudy } from '../../store/StudyContext';
import { findEntryById } from '../../data';
import { lazyEntrySpecFor } from '../../data/lazyEntries';
import { getModuleMeta } from '../../data/subjects';
import { useDataScope, useLazyEntries, DataLoading } from '../../lib/useData';
import { EmptyState, PageHeader } from '../../components/common';
import {
  Emph,
  ExampleList,
  FloatNav,
  PitfallList,
  exampleKindOf,
  firstSentence,
  practiceTagPath,
  rulesTitleFor,
  sectionListPath,
  sectionPath,
} from './ExamTopicParts';

/* ------------------------- 数据形状（学科无关） ------------------------- */

/**
 * 这条内容的「题型专题」正文。
 *
 *   - `undefined`：这不是一条「题型专题」内容（走错模块或手打的链接）；
 *   - 正常返回：`sections` 可能是空数组（专题还没写分节讲解），由调用方给友好提示。
 *
 * 判据是 `lib/examTopic.ts` 的 `isExamTopicData`（两个必填数组 `trends` / `drills`），
 * **不是** `moduleId === 'zh-topics'`：数学的题型专题用的是同一套字段，
 * 这一页因此原样可用。
 */
function examTopicOf(entry: Entry | undefined): ExamTopic | undefined {
  return entry && isExamTopicData(entry.data) ? entry.data : undefined;
}

/** 地址栏里的节号：只接受 1 起的整数，其余一律当「不存在」处理（不崩、给友好提示） */
function parseSectionNo(raw: string | undefined): number {
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 1 ? n : 0;
}

/* ------------------------------- 页面 ------------------------------- */

export default function ExamTopicSectionPage() {
  const { subjectId = 'chinese', moduleId = '', itemId = '', sectionNo = '' } = useParams();
  const { state, recordStudy } = useStudy();

  /** 模块范围：装骨架（模块页/面包屑/条目都在里面），与其它详情页同一套 */
  const moduleReady = useDataScope([moduleId as ModuleId]);
  /**
   * 正文（按条目下载）：范围由**通用注册表**算出来——这一条属于懒加载模块时
   * 才需要单独下载，否则返回 undefined（本页不需要额外请求）。
   */
  const spec = useMemo(() => lazyEntrySpecFor(moduleId, itemId), [moduleId, itemId]);
  const body = useLazyEntries(spec);
  const ready = moduleReady && body.ready;

  /**
   * 条目与正文**每次都现算，不要包 `useMemo`**。
   *
   * 懒加载的正文是**原地补进已有骨架条目**的（`installZhTopic` 改的是同一个对象的字段），
   * 对象引用从头到尾没变：以 `[entry]` 为依赖的记忆化在「正文到位」那一刻**不会重算**，
   * 页面会一直停在「这个专题还没有分节讲解」上。这些判断都只是一次 Map 查询与两个
   * `Array.isArray`，现算的代价可以忽略。
   */
  const entry = findEntryById(itemId);
  const topic = entry ? examTopicOf(entry) : undefined;
  const sections: ExamSection[] | undefined = topic ? topic.sections ?? [] : undefined;
  const no = parseSectionNo(sectionNo);
  const section = sections && no >= 1 && no <= sections.length ? sections[no - 1] : undefined;

  /**
   * 学习记录：读到这一节也算学过这个专题（与详情页同一条规则）。
   * 记在专题条目上而不是「第几节」上，是为了让「已学习 N 次」与其它页面的口径一致。
   *
   * 用 ref 记住已经记过的条目 id：正文到位、进度回写都会让本页重渲染，
   * 不加这道闸，同一个专题会被记成学过好几次（与 `DetailPage` 同一套写法）。
   */
  const counted = useRef<string | null>(null);
  useEffect(() => {
    if (!entry) return;
    if (counted.current === entry.id) return;
    counted.current = entry.id;
    recordStudy(entry.id);
  }, [entry, recordStudy]);

  /**
   * 进页面回到顶部。
   *
   * 本站没有全局的滚动复位（`AppShell` 只按 pathname 重挂载子树），从清单中段的第 12 节
   * 点进章节页时，浏览器会把上一页的滚动位置带过来——学生一进来看到的是正文中段。
   * `prev/next` 在页底，跳到下一节后同样需要回到顶部。
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [itemId, no]);

  const meta = getModuleMeta(moduleId);
  const crumbSubject = { label: meta?.subject.name ?? '语文', to: `/s/${subjectId}` };
  const crumbModule = { label: meta?.module.name ?? '专题', to: `/s/${subjectId}/${moduleId}` };

  /* --------------------------- 加载与异常出口 --------------------------- */

  if (!moduleReady) return <DataLoading label="正在打开这一节…" />;
  // 专题正文还在下载：走真实的加载占位（带进度、失败可重试），不要渲染空内容
  if (!body.ready) {
    return <DataLoading label="正在加载专题正文…" failed={body.failed} onRetry={body.retry} />;
  }

  if (!entry || entry.moduleId !== moduleId) {
    return (
      <div className="stack stack--lg">
        <EmptyState
          icon="🔍"
          title="没有找到这条内容"
          desc="它可能已被移除，或者链接不正确。"
          action={
            <Link className="btn" to={`/s/${subjectId}/${moduleId}`}>
              ← 回到{crumbModule.label}
            </Link>
          }
        />
      </div>
    );
  }

  /** 专题名（面包屑与标题里都要用）：题型专题用数据里的标题，否则退回条目标题 */
  const topicTitle = topic?.title ?? entry.title;

  const listTo = sectionListPath(subjectId, moduleId, itemId, no || undefined);

  /** 不是「题型专题」内容：本页没有可讲的东西，指引回内容页 */
  if (!sections) {
    return (
      <div className="stack stack--lg">
        <PageHeader
          crumbs={[
            { label: '首页', to: '/' },
            crumbSubject,
            crumbModule,
            { label: entry.title },
          ]}
          title={entry.title}
          desc="这一页只用于「逐类讲透」的分节讲解"
        />
        <EmptyState
          icon="🧩"
          title="这条内容没有分节讲解"
          desc="它可能是整卷以外的其它条目。回到内容页看讲解与练习入口。"
          action={
            <Link className="btn btn--primary" to={`/s/${subjectId}/${moduleId}/${itemId}`}>
              ← 回到内容页
            </Link>
          }
        />
      </div>
    );
  }

  /* ------------------------- 越界 / 缺节的友好出口 ------------------------- */

  if (!section) {
    const total = sections.length;
    return (
      <div className="stack stack--lg">
        <PageHeader
          crumbs={[
            { label: '首页', to: '/' },
            crumbSubject,
            crumbModule,
            { label: topicTitle, to: listTo },
            { label: `第 ${no || sectionNo || '?'} 节` },
          ]}
          title="这一节不存在"
          desc={
            total
              ? `《${topicTitle}》一共 ${total} 节，节号从 1 到 ${total}。`
              : `《${topicTitle}》还没有分节讲解。`
          }
        />
        <EmptyState
          icon="🧭"
          title={total ? `第 ${no || sectionNo} 节不在这个专题里` : '这个专题还没有分节讲解'}
          desc={
            total
              ? '链接可能过期了，或者节号打错了。回到章节清单，从列表里挑一节继续。'
              : '讲解正在补充。先回专题页看总览与专项训练，内容到位后清单会自动出现。'
          }
          action={
            <div className="row row--wrap">
              <Link className="btn btn--primary" to={sectionListPath(subjectId, moduleId, itemId)}>
                ← 回到章节清单
              </Link>
              {total ? (
                <Link className="btn" to={sectionPath(subjectId, moduleId, itemId, 1)}>
                  📖 从第 1 节开始
                </Link>
              ) : (
                <Link className="btn" to={`/s/${subjectId}/${moduleId}/${itemId}`}>
                  ← 回到专题页
                </Link>
              )}
            </div>
          }
        />
      </div>
    );
  }

  /* ------------------------------- 正常渲染 ------------------------------- */

  const total = sections.length;
  const questions = entry.questions.filter((q) => (q.tags ?? []).includes(section.name));
  const passed = passedCount(questions.map((q) => q.id), state.passed);
  const kind = exampleKindOf(section.examples);
  const practiceTo = practiceTagPath(moduleId, itemId, section.name);
  const prev = no > 1 ? sections[no - 2] : undefined;
  const next = no < total ? sections[no] : undefined;

  return (
    <div className="stack stack--lg">
      {/* ① 面包屑 + ② 节标题 / 本节题量 / 主按钮 */}
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          crumbSubject,
          crumbModule,
          { label: topicTitle, to: listTo },
          { label: `第 ${no} 节` },
        ]}
        title={
          <span>
            {no}. {section.name}
          </span>
        }
        desc={
          <span className="exam-secpage__meta">
            《{topicTitle}》第 {no} 节 / 共 {total} 节
            <span aria-hidden> · </span>
            本节 {questions.length} 题
            {passed > 0 ? ` · 已过关 ${passed} / ${questions.length}` : ''}
          </span>
        }
        extra={
          <>
            {questions.length ? (
              <Link className="btn btn--primary" to={practiceTo}>
                ✍️ 刷这一节（{questions.length} 题）
              </Link>
            ) : null}
            <Link className="btn btn--sm" to={listTo}>
              ← 回到章节清单
            </Link>
          </>
        }
      />

      {/*
        ③ 本节正文：拆成**三张卡**——讲解 / 正误对照 / 本节易错。
        一页只讲一节解决的是「17 节挤一页」，但一节里「550 字讲解 + 5 条要点 +
        5 个例子 + 易错」再全塞进一张卡，用户说的「一个卡片展示东西太多、太长」
        就又回来了。三张卡各有各的小标题，扫一眼就知道哪块是什么，也能单独折叠浏览。
      */}
      <section className="card card--pad exam-secpage">
        <div className="exam-secpage__title">📖 本节讲解</div>
        <div className="exam-secpage__intro">
          <Emph text={section.intro} />
        </div>

        {/* 判定要点 / 解题套路：写「怎么一眼看出来」，编号列出，与正文视觉分开 */}
        {section.rules?.length ? (
          <div className="exam-rules">
            <div className="exam-rules__title">{rulesTitleFor(kind)}</div>
            <ol className="exam-rules__items">
              {section.rules.map((r, k) => (
                <li key={k}>
                  <Emph text={r} />
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      {/*
        例子：语文是正误对照（✔ / ✘ + 改），数学是分步解答（步骤 + 答案）。
        **逐条折叠、默认只展开第一条**——理由写在 `ExampleList` 的注释里。
      */}
      {section.examples?.length ? (
        <section className="card card--pad exam-secpage">
          <ExampleList examples={section.examples} kind={kind} />
        </section>
      ) : null}

      {/* 本节易错：与专题级同一套三行写法（✘ 常犯 / ✔ 正确 / 为什么容易错） */}
      {section.pitfalls?.length ? (
        <section className="card card--pad exam-secpage">
          <PitfallList items={section.pitfalls} />
        </section>
      ) : null}

      {/*
        ④ 上一节 / 下一节：读完一节顺着往下走，不必回清单再找。
        第一节没有「上一节」、最后一节没有「下一节」——**禁用而不是隐藏**：
        按钮消失会让学生以为页面坏了，灰着放在原位一眼就懂。
      */}
      <nav className="exam-nav" aria-label="章节切换">
        <Link
          className={cn('btn', 'exam-nav__btn', !prev && 'is-off')}
          to={prev ? sectionPath(subjectId, moduleId, itemId, no - 1) : listTo}
          aria-disabled={!prev}
          tabIndex={prev ? undefined : -1}
          title={prev ? `上一节：${prev.name}` : '已经是第一节'}
        >
          ← 上一节{prev ? ` · ${prev.name}` : '（已是第一节）'}
        </Link>
        <Link
          className={cn('btn', 'exam-nav__btn', !next && 'is-off')}
          to={next ? sectionPath(subjectId, moduleId, itemId, no + 1) : listTo}
          aria-disabled={!next}
          tabIndex={next ? undefined : -1}
          title={next ? `下一节：${next.name}` : '已经是最后一节'}
        >
          {next ? `下一节 · ${next.name}` : '已是最后一节（返回清单）'} →
        </Link>
      </nav>

      {/* ⑤ 底部：本节练习入口（带过关进度） */}
      <section className="card card--pad exam-cta">
        <div className="row row--between row--wrap" style={{ alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="exam-cta__title">
              🎯 这一节练到全过关（{questions.length} 题）
            </div>
            <div className="small muted" style={{ marginTop: 4, lineHeight: 1.85 }}>
              {questions.length === 0
                ? '本节题目正在补充，先读讲解；题目到位后这里会出现练习入口。'
                : passed > 0
                  ? `本节已过关 ${passed} / ${questions.length}，还差 ${Math.max(questions.length - passed, 0)} 题。`
                  : '按「每道题曾经答对过一次」记过关：答错的题进错题本，重做答对同样算过关。'}
            </div>
          </div>
          {questions.length ? (
            <Link className="btn btn--primary" to={practiceTo}>
              ✍️ 刷这一节（{questions.length} 题）
            </Link>
          ) : null}
        </div>
      </section>

      {/* ⑤′ 下一节推荐：本节读完了，下一步去哪写在最下面，不用回清单翻 */}
      <section className="card card--pad exam-next">
        {next ? (
          <>
            <div className="exam-next__label">下一节</div>
            <div className="exam-next__name">
              {no + 1}. {next.name}
            </div>
            <div className="small muted exam-next__hint">
              <Emph text={firstSentence(next.intro)} />
            </div>
            <div className="row row--wrap" style={{ marginTop: 10 }}>
              <Link className="btn btn--primary" to={sectionPath(subjectId, moduleId, itemId, no + 1)}>
                📖 看下一节 →
              </Link>
              <Link className="btn btn--sm" to={listTo}>
                ← 回到章节清单
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="exam-next__label">这是最后一节</div>
            <div className="exam-next__name">
              全专题 {total} 节都读完了，接下来把题目过一遍
            </div>
            <div className="small muted exam-next__hint">
              逐类练完之后，用整卷式的一组题检验：答错的题会进错题本，重做答对同样算过关。
            </div>
            <div className="row row--wrap" style={{ marginTop: 10 }}>
              <Link className="btn btn--primary" to={`/practice/${moduleId}/${itemId}`}>
                ✍️ 练整个专题（{entry.questions.length} 题）
              </Link>
              <Link className="btn btn--sm" to={listTo}>
                ← 回到章节清单
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ⑥ 浮动按钮：长正文里随时能回顶部或退回章节清单 */}
      <FloatNav listTo={listTo} listLabel="← 章节清单" />
    </div>
  );
}
