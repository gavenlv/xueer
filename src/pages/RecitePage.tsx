/**
 * 今日背诵（科目子页面）：**按知识点**背诵，而不是按篇目。
 *
 * ## 为什么改成知识点
 *
 * 原来的「今日背诵」只列古诗词篇目，学生点进去还得自己判断「这一篇我到底记住哪几句」。
 * 现在每一句默写、每一个历史时间点、每一条材料大题踩分点都是一张卡片：
 * 背一张，打卡一次（1 次、2 次…），按遗忘曲线排下一次复习，
 * **累计跨天有效 5 次即「已背诵」= 完全掌握**（同一天重复点只算 1 次），
 * 每次点击都留下时间明细，在学习进度里单独统计。
 *
 * 于是「学过」与「掌握」被彻底分开：`已学内容` 是打开过多少条，
 * `已背诵知识点` 是真正背下来的有多少——学习不是看了就等于学了。
 *
 * 卡片本身不落库（见 `lib/reciteCards.ts`），页面按科目加载本科模块后现场派生。
 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { entriesOfModule, moduleIdsOfSubject } from '../data';
import { getSubject } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import type { ModuleId, ReciteCard } from '../types';
import { cn, pct } from '../lib/utils';
import { isRecited } from '../lib/recite';
import { cardStatsOf, reciteCardsOf } from '../lib/reciteCards';
import { useDataScope, DataLoading } from '../lib/useData';
import { EmptyState, PageHeader, ProgressBar, SectionTitle, Stat, Tag } from '../components/common';
import { ReciteCardGroup } from '../components/ReciteCards';

/** 状态筛选：全部 / 今天该复习 / 没背过 / 还没背完 / 已背诵 */
type StatusKey = 'all' | 'due' | 'fresh' | 'learning' | 'mastered';

const STATUSES: { key: StatusKey; label: string }[] = [
  { key: 'due', label: '今天该复习' },
  { key: 'fresh', label: '没背过' },
  { key: 'learning', label: '还没背完' },
  { key: 'mastered', label: '已背诵' },
  { key: 'all', label: '全部' },
];

export default function RecitePage() {
  const { subjectId = 'chinese' } = useParams();
  const subject = getSubject(subjectId);
  const { state } = useStudy();

  const [moduleFilter, setModuleFilter] = useState<ModuleId | 'all'>('all');
  const [status, setStatus] = useState<StatusKey>('due');

  /** 本科已上线模块（待开发模块没有内容，声明了也加载不到东西） */
  const moduleIds = useMemo(
    () => (subject ? subject.modules.filter((m) => m.available).map((m) => m.id as ModuleId) : []),
    [subject],
  );

  /**
   * 支持「整篇遮罩训练」的模块：只有古诗词与文言文有整篇文本（`ReciteTrainer`），
   * 其他科目（历史、道法、英语、数学）的必背项都是分散的知识点，没有可遮的整篇。
   */
  const wholeText = useMemo(
    () =>
      subject
        ? subject.modules.filter((m) => m.available && (m.id === 'poems' || m.id === 'classical'))
        : [],
    [subject],
  );
  const ready = useDataScope(moduleIds);

  /** 本科全部知识点卡片（数据就绪后派生一次；ready 进依赖，避免刷新页面时算成空） */
  const cards = useMemo(() => {
    if (!ready) return [];
    const out: ReciteCard[] = [];
    for (const m of moduleIds) for (const e of entriesOfModule(m)) out.push(...reciteCardsOf(e));
    return out;
  }, [moduleIds, ready]);

  const records = state.cards;
  const stats = useMemo(() => cardStatsOf(cards, records), [cards, records]);

  /**
   * 本次筛选下的**背诵队列**。
   *
   * 关键是「队列在筛选变化时定好，作答过程中不重排、也不移除」：
   * 一张卡点过「✅ 背了」之后 `dueAt` 会被推到明天，若按 `dueAt` 实时过滤，
   * 学生刚点完就看到卡片当场消失，「已背 1 次 · 有效 1/5 次」一眼都看不到，
   * 也就无从判断这次到底记下没有。队列冻结后卡片原地留着，底部小字实时更新，
   * 学生可以接着点第 2 次、第 3 次——这正是「不背单词」那种一张张过的手感。
   *
   * 依赖里**刻意不含 `records`**：作答只该更新卡片自己的状态与顶部的统计数字，
   * 不该重建队列。想重新排队，切一下状态或模块筛选即可。
   */
  const queue = useMemo(() => {
    const out = cards.filter((c) => {
      if (moduleFilter !== 'all' && c.moduleId !== moduleFilter) return false;
      const rec = records?.[c.id];
      if (status === 'all') return true;
      if (status === 'fresh') return !rec || rec.times === 0;
      if (status === 'mastered') return isRecited(rec);
      if (status === 'learning') return Boolean(rec && rec.times > 0) && !isRecited(rec);
      // due：没背过的也算「今天该背」，到点未复习的排前面
      return !rec || rec.times === 0 || rec.dueAt <= Date.now();
    });
    // 越早到期越靠前（没背过的 dueAt 视为 0，排最前）
    return out.sort((a, b) => (records?.[a.id]?.dueAt ?? 0) - (records?.[b.id]?.dueAt ?? 0));
  }, [cards, moduleFilter, status]);

  /** 按模块分组（模块筛选为「全部」时分组展示，避免几千张卡混在一起） */
  const groups = useMemo(() => {
    const order = new Map<ModuleId, number>(moduleIds.map((m, i) => [m, i]));
    const byModule = new Map<ModuleId, ReciteCard[]>();
    for (const c of queue) byModule.set(c.moduleId, [...(byModule.get(c.moduleId) ?? []), c]);
    return [...byModule.entries()].sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0));
  }, [queue, moduleIds]);

  const crumbs = [
    { label: '首页', to: '/' },
    ...(subject ? [{ label: subject.name, to: `/s/${subject.id}` }] : []),
    { label: '背诵' },
  ];

  /* 没有这个学科 */
  if (!subject) {
    return (
      <div className="stack stack--lg">
        <PageHeader crumbs={[{ label: '首页', to: '/' }, { label: '背诵' }]} title="🧠 知识点背诵" />
        <EmptyState icon="🧭" title="没有这个学科" desc="检查一下地址，或回首页从学科入口进。" />
      </div>
    );
  }

  if (!ready) return <DataLoading label="正在整理本科知识点…" />;

  /* 本科没有可背诵的卡片：分两种情况说清楚，别让学生撞空白页 */
  if (!cards.length) {
    /**
     * 模块已上线却没有卡片（物理：概念与计算为主，掌握按练习/考试的「逐题过关」统计），
     * 与「整科都还没写」是两回事——用同一句「正在准备中」会误导学生一直等。
     */
    const hasContent = moduleIds.length > 0;
    return (
      <div className="stack stack--lg">
        <PageHeader
          crumbs={crumbs}
          title="🧠 知识点背诵"
          desc={
            hasContent
              ? `${subject.name}的掌握情况按练习与考试的「逐题过关」统计，不设背诵卡片。`
              : `${subject.name}的知识点清单还在准备中。`
          }
          extra={
            <Link className="btn btn--sm" to={`/s/${subject.id}`}>
              ← 返回{subject.name}模块总览
            </Link>
          }
        />
        <EmptyState
          icon={hasContent ? '🎯' : '🚧'}
          title={hasContent ? `${subject.name}没有可背诵的知识点卡片` : `${subject.name}的知识点清单正在准备中`}
          desc={
            hasContent
              ? '计算与实验为主的内容不适合「翻面背」，掌握与否看练习与整卷模拟里的逐题过关结果。'
              : '知识点卡片由内容正文自动派生（默写句、历史时间点、材料题踩分点…），内容一上线，背诵清单就跟着有了。'
          }
          action={
            <Link className="btn btn--primary" to={`/s/${subject.id}`}>
              去看{subject.name}的模块
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={crumbs}
        title="🧠 知识点背诵"
        desc="每个知识点一张卡：先自己回忆，再翻面核对。每天最多算 1 次，累计背满 5 次（跨 5 天）即「已背诵」，代表完全掌握——学习不是看了就等于学了。"
        extra={
          <Link className="btn btn--sm" to={`/s/${subject.id}`}>
            返回{subject.name}
          </Link>
        }
      />

      <section className="card card--pad stack stack--sm">
        <div className="grid grid--3">
          <Stat value={stats.total} label={`${subject.name}知识点`} />
          <Stat value={stats.mastered} label="已背诵（完全掌握）" tone="#1a9a6c" />
          <Stat value={stats.due} label="今天该背 / 该复习" tone="#d24f3d" />
        </div>
        <div className="row row--between small">
          <span>
            掌握率 {pct(stats.mastered, Math.max(1, stats.total))}%（已背过 {stats.practiced} 个）
          </span>
          <span className="muted">累计 5 次已背诵 · 间隔 1→2→4→7→15→30 天</span>
        </div>
        <ProgressBar value={stats.mastered} max={Math.max(1, stats.total)} tone="jade" />
      </section>

      {/* 状态筛选：默认「今天该复习」，打开页面就是今天的任务清单 */}
      <div className="stack stack--sm">
        <div className="scroll-x">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              className={cn('chip chip--sm', status === s.key && 'is-active')}
              onClick={() => setStatus(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 模块筛选：按学科注册表顺序，与首页/顶栏一致 */}
        <div className="scroll-x">
          <button
            className={cn('chip chip--sm', moduleFilter === 'all' && 'is-active')}
            onClick={() => setModuleFilter('all')}
          >
            全部模块（{cards.length}）
          </button>
          {subject.modules
            .filter((m) => m.available)
            .map((m) => (
              <button
                key={m.id}
                className={cn('chip chip--sm', moduleFilter === m.id && 'is-active')}
                onClick={() => setModuleFilter(m.id as ModuleId)}
              >
                {m.icon} {m.name}（{cards.filter((c) => c.moduleId === m.id).length}）
              </button>
            ))}
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="card card--pad small muted">
          {status === 'due'
            ? '今天没有到期的复习任务，切到「没背过」继续背新的。'
            : '这个筛选下没有卡片。'}
        </div>
      ) : moduleFilter === 'all' ? (
        groups.map(([mid, list]) => {
          const meta = subject.modules.find((m) => m.id === mid);
          const gs = cardStatsOf(list, records);
          return (
            <section className="stack stack--sm" key={mid}>
              <SectionTitle
                sub={`共 ${gs.total} 个知识点 · 已背诵 ${gs.mastered} 个`}
                extra={
                  <Link className="btn btn--sm btn--ghost" to={`/s/${subject.id}/${mid}`}>
                    看这部分内容 →
                  </Link>
                }
              >
                {meta?.icon} {meta?.name}
              </SectionTitle>
              <ReciteCardGroup cards={list} showSource limit={12} />
            </section>
          );
        })
      ) : (
        <section className="stack stack--sm">
          <SectionTitle sub={`共 ${queue.length} 张卡片`}>
            {STATUSES.find((s) => s.key === status)?.label}
          </SectionTitle>
          <ReciteCardGroup cards={queue} showSource limit={60} />
        </section>
      )}

      <section className="card card--pad small muted">
        知识点卡片由内容正文自动派生：古诗文逐句默写、文言文注释与语法、历史时间点与材料大题踩分点、
        道法必背金句、英语词汇与语法规则、数学概念与公式……共 {stats.total} 个。
        想看正文与讲解，从
        <Link to={`/s/${subject.id}`} style={{ color: 'var(--c-primary)' }}>
          本科模块
        </Link>
        进入
        {wholeText.length > 0 ? (
          <>
            ；想按篇目整篇遮罩训练，用
            {wholeText.map((m, i) => (
              <span key={m.id}>
                {i > 0 ? '、' : ''}
                <Link to={`/s/${subject.id}/${m.id}`} style={{ color: 'var(--c-primary)' }}>
                  {m.name}
                </Link>
              </span>
            ))}
          </>
        ) : null}
        。
      </section>

      {stats.mastered > 0 ? (
        <div className="row row--wrap">
          <Tag tone="jade">✅ 已背诵 {stats.mastered} 个知识点</Tag>
          <Link className="btn btn--sm" to="/stats">
            在学习报告里看掌握情况 →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
