/**
 * 首页：只做一件事——**选一科进去**。
 *
 * 这里刻意不放任何学习数据（今日概览、总进度、收藏、错题数这些都被去掉了）：
 *   - 数据看板全部收进「我的」（底部栏/右上角），一处维护、一处查看；
 *   - 首页与学科页各自专注一层导航：首页选科、学科页选章节。
 * 于是首屏只剩三块：一句话问候 + 按中考满分排序的科目入口（点任意一科直接进入）+
 * 每日一句（唯一的「内容性」装饰，给人一个今天就动起来的理由）。
 *
 * 首页是**总览页**，刻意不加载任何模块的正文数据：
 * 它只用 `data/summary.ts` 那份轻量清单（id / 标题 / 模块 / 名句池），
 * 因此首屏不会被内容文本拖慢。清单由 `pnpm gen` 生成、`pnpm validate` 校验。
 *
 * @data-summary-only 声明本页只用轻量清单（校验脚本据此跳过「必须调用 useDataScope」的检查）
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOTAL_SCORE, liveSubjects, menuSubjects } from '../data/subjects';
import { DAILY_LINES, ENTRY_META } from '../data/summary';
import { subjectOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import { dateKey } from '../lib/utils';
import { Tag } from '../components/common';
import { WeightBoard } from '../components/SubjectBoard';

/**
 * 一级菜单 = 全部计分科目，按 2027—2029 广州中考满分降序（数学 150 → 体育 70）。
 * 待开发科目也列出来：分值不会因为没开发就消失，学生早看到早规划。
 */
const MENU_SUBJECTS = menuSubjects();

/** 已有内容的科目（没有任何学习记录时，「进入某科」的兜底入口只用这些） */
const LIVE_SUBJECTS = liveSubjects();

const META_BY_ID = new Map(ENTRY_META.map((m) => [m.id, m]));

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，早点休息';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export default function Home() {
  const { state } = useStudy();
  const checkedToday = state.checkins.includes(dateKey());

  /**
   * 最近学过的那一条内容（只有一条，不是列表）。
   *
   * 首页不再铺「继续学习」列表，但「接着上次的地方继续」这个动作仍然只值一次点击，
   * 所以留在英雄区里：学过的学生一点就回到原处，没学过的学生根本看不到这个按钮。
   */
  const lastEntry = useMemo(() => {
    let bestId = '';
    let bestAt = 0;
    for (const [id, p] of Object.entries(state.progress)) {
      if (!p.lastAt || (p.studied ?? 0) <= 0) continue;
      if (p.lastAt > bestAt) {
        bestAt = p.lastAt;
        bestId = id;
      }
    }
    const meta = META_BY_ID.get(bestId);
    if (!meta) return null;
    const subjectId = subjectOfModule(meta.moduleId) ?? 'chinese';
    return {
      title: meta.title.length > 10 ? `${meta.title.slice(0, 10)}…` : meta.title,
      subjectId,
      to: `/s/${subjectId}/${meta.moduleId}/${meta.id}`,
    };
  }, [state.progress]);

  /** 英雄区主按钮指向的科目：最近学的那一科，没有记录时取第一个已上线学科 */
  const targetSubject =
    MENU_SUBJECTS.find((s) => s.id === lastEntry?.subjectId) ??
    LIVE_SUBJECTS[0] ??
    MENU_SUBJECTS[0];

  /* 每日一句：按日期稳定选取（名句池来自轻量清单，不必加载整本诗词） */
  const dailyQuote = useMemo(() => {
    if (!DAILY_LINES.length) return null;
    const seed = Number(dateKey().replace(/-/g, ''));
    return DAILY_LINES[seed % DAILY_LINES.length];
  }, []);

  return (
    <div className="stack stack--lg">
      {/* 英雄区：问候 + 一步回到上次学的 / 进入某一科 */}
      <section className="hero slide-up">
        <div className="hero__inner">
          <h1 className="hero__title">{greeting()}，同学</h1>
          <p className="hero__desc">
            {checkedToday ? '今天已打卡 ✦ ' : '今天还没打卡 · '}
            2027 广州中考 {MENU_SUBJECTS.length} 科共 {TOTAL_SCORE} 分，
            点下面的科目直接进入，每一科都按章节模块逐块学。
          </p>

          <div className="hero__actions">
            {lastEntry ? (
              <Link className="btn btn--white" to={lastEntry.to}>
                ▶ 继续：{lastEntry.title}
              </Link>
            ) : null}
            {targetSubject ? (
              <Link className="btn" to={`/s/${targetSubject.id}`}>
                进入{targetSubject.name} →
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/*
        科目入口 = 首页的全部导航。按中考满分降序一行一科，
        点任意一行直接进该科（章节导航在学科页里）。
      */}
      <WeightBoard currentId={targetSubject?.id} />

      {/* 每日一句 */}
      {dailyQuote ? (
        <section className="card card--pad">
          <div className="row row--between" style={{ marginBottom: 10 }}>
            <Tag tone="gold">🖋 每日一句</Tag>
            <Link
              className="small"
              to={`/s/chinese/poems/${dailyQuote.entryId}`}
              style={{ color: 'var(--c-primary)' }}
            >
              查看全篇 →
            </Link>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-kai)',
              fontSize: 20,
              lineHeight: 1.9,
              letterSpacing: '0.04em',
            }}
          >
            {dailyQuote.text}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            —— {dailyQuote.from}
          </div>
        </section>
      ) : null}
    </div>
  );
}