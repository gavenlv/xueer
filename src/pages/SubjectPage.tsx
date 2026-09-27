/**
 * 学科页：**本学科的章节导航**（学段切换 + 模块网格 + 本科工具）。
 *
 * 只负责「这一科要从哪一块开始学」：所有学习数据（本科进度、已学/已标熟、分值看板）
 * 都不在这里出现——首页负责选科、学科页负责选章节，「我的」负责看数据，
 * 三层各管一件事，同一份数字也就不必在多处重复渲染。
 *
 * 学科无关，新增学科自动适配。
 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TOTAL_SCORE, getSubject, weightOf } from '../data/subjects';
import { moduleIdsOfSubject } from '../data';
import { totalsOfModule } from '../data/totals';
import { ENTRY_META } from '../data/summary';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId, Subject } from '../types';
import { GRADES, cn } from '../lib/utils';
import { EmptyState, PageHeader, SectionTitle, Tag } from '../components/common';

/**
 * 本科工具：背诵 / 错题本 / 考点 / 知识拓展。
 *
 * 这几块以前是**全站一级入口**，但它们本质上都只作用于某一科（背的是语文古诗词、
 * 错题有科属、考点是某一科的知识点），所以改为挂在各科自己的学科页上。
 * 只列这一科真的有内容的入口——点进去看不到东西的按钮不如不给。
 */
function toolsOf(subject: Subject): { to: string; icon: string; label: string; desc: string }[] {
  const tools: { to: string; icon: string; label: string; desc: string }[] = [];
  if (subject.id === 'chinese') {
    tools.push({
      to: `/s/${subject.id}/recite`,
      icon: '📅',
      label: '背诵',
      desc: '间隔重复排期',
    });
  }
  tools.push({
    to: `/s/${subject.id}/wrong`,
    icon: '🗂️',
    label: '错题本',
    desc: '只看本科错题',
  });
  tools.push({
    to: `/s/${subject.id}/exam`,
    icon: '🎯',
    label: subject.id === 'history' ? '考点与考情' : '中考考点',
    desc: '按知识点聚合',
  });
  if (subject.id === 'chinese' || subject.id === 'math') {
    tools.push({
      to: `/s/${subject.id}/extras`,
      icon: '🧩',
      label: '知识拓展',
      desc: '导图与拓展阅读',
    });
  }
  return tools;
}

/**
 * 学科页也是**总览页**：只按模块统计「共几条 / 我学了几条 / 共几题」，
 * 不需要任何正文。因此它读 `data/summary.ts` 那份轻量骨架，
 * 不加载模块内容——点进具体模块时才按需下载。
 *
 * @data-summary-only 声明本页只用轻量清单（校验脚本据此跳过「必须调用 useDataScope」的检查）
 */
const META_BY_MODULE = new Map<string, { id: string; grade: string; questions: number }[]>();
for (const m of ENTRY_META) {
  META_BY_MODULE.set(m.moduleId, [
    ...(META_BY_MODULE.get(m.moduleId) ?? []),
    { id: m.id, grade: m.grade, questions: m.questions },
  ]);
}

export default function SubjectPage() {
  const { subjectId = 'chinese' } = useParams();
  const subject = getSubject(subjectId);
  const { grade, setGrade } = useStudy();
  const [gradeFilter, setGradeFilter] = useState<GradeId | 'all'>(grade);

  const moduleIds = useMemo(() => moduleIdsOfSubject(subjectId), [subjectId]);

  /** 每个模块在本学段有多少条内容 / 多少道题——只统计骨架，不加载正文，也不看学习进度 */
  const moduleStats = useMemo(() => {
    const out: Record<string, { gradeCount: number; questions: number }> = {};
    for (const id of moduleIds) {
      const entries = (META_BY_MODULE.get(id) ?? []).filter(
        (e) => gradeFilter === 'all' || e.grade === gradeFilter || e.grade === 'all',
      );
      out[id] = {
        gradeCount: entries.length,
        questions: entries.reduce((n, e) => n + e.questions, 0),
      };
    }
    return out;
  }, [gradeFilter, moduleIds]);

  if (!subject) {
    return <EmptyState icon="🧭" title="没有这个学科" desc="请从首页重新选择。" />;
  }

  if (!subject.available) {
    return (
      <div className="stack stack--lg">
        <PageHeader
          crumbs={[{ label: '首页', to: '/' }, { label: subject.name }]}
          title={
            <span>
              {subject.icon} {subject.name}
            </span>
          }
          desc={`中考 ${subject.score} 分 · 占 ${weightOf(subject)}%${subject.examNote ? ` · ${subject.examNote}` : ''}`}
          extra={
            <Link className="btn btn--sm" to="/">
              ← 返回首页
            </Link>
          }
        />

        <section className="card card--pad stack stack--sm">
          <div className="row row--between">
            <span className="bold">🚧 本科目内容正在准备中</span>
            <Tag tone="gold">待开发</Tag>
          </div>
          <div className="page-desc">
            {subject.name}是 2027 广州中考录取计分科目之一，满分 {subject.score} 分，
            占中考总分 {TOTAL_SCORE} 分的 {weightOf(subject)}%。内容正在按下面的模块结构准备，
            先看看整体轮廓，上线后即可逐块学习与练习。
          </div>
        </section>

        <section className="stack stack--sm">
          <SectionTitle sub="按广州中考的考查模块划分，点进去可先看该模块的规划">
            模块轮廓（{subject.modules.length} 个模块）
          </SectionTitle>
          <div className="grid grid--auto">
            {subject.modules.map((m) => (
              <Link
                key={m.id}
                className="module-card"
                to={`/s/${subject.id}/${m.id}?grade=${gradeFilter}`}
              >
                <span className="module-card__accent" style={{ background: m.color }} />
                <span
                  className="module-card__icon"
                  style={{ background: `${m.color}16`, color: m.color }}
                >
                  {m.icon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="module-card__name" style={{ display: 'block' }}>
                    {m.name}
                  </span>
                  <span className="module-card__desc" style={{ display: 'block' }}>
                    {m.desc}
                  </span>
                  <span className="module-card__foot">待开发 · 点进去看规划</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const totals = moduleIds.reduce(
    (acc, id) => {
      acc.gradeCount += moduleStats[id]?.gradeCount ?? 0;
      acc.questions += moduleStats[id]?.questions ?? 0;
      return acc;
    },
    { gradeCount: 0, questions: 0 },
  );

  /** 随机练习的默认模块：取本学科第一个模块 */
  const firstModule = moduleIds[0] ?? 'poems';

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: subject.name }]}
        title={
          <span>
            {subject.icon} {subject.name}
          </span>
        }
        desc={`中考 ${subject.score} 分（占 ${weightOf(subject)}%）· ${subject.modules.length} 个模块 · ${totals.questions} 道练习题${subject.examNote ? ` · ${subject.examNote}` : ''}`}
        extra={
          <Link
            className="btn btn--primary btn--sm"
            to={`/practice/${firstModule}?grade=${gradeFilter}`}
          >
            🎲 随机练习
          </Link>
        }
      />

      {/* 学段切换：决定下面模块里显示哪一册的内容 */}
      <section className="stack stack--sm">
        <SectionTitle sub="选择教材册次，模块内容与练习范围会同步切换">学段</SectionTitle>
        <div className="scroll-x">
          <button
            className={cn('chip', gradeFilter === 'all' && 'is-active')}
            onClick={() => setGradeFilter('all')}
          >
            全部
          </button>
          {GRADES.map((g) => (
            <button
              key={g.id}
              className={cn('chip', gradeFilter === g.id && 'is-active')}
              onClick={() => {
                setGradeFilter(g.id);
                setGrade(g.id);
              }}
            >
              {g.short}
            </button>
          ))}
        </div>
      </section>

      {/* 模块：本页的主角——章节导航，点进去按篇目/词条学 */}
      <section className="stack stack--sm">
        <SectionTitle sub="点进去按篇目/词条学习，随时可以开始练习">章节模块</SectionTitle>
        <div className="grid grid--auto">
          {subject.modules.map((m) => {
            const st = moduleStats[m.id] ?? { gradeCount: 0, questions: 0 };
            const allCount = totalsOfModule(m.id as ModuleId).entries;
            return (
              <Link
                key={m.id}
                className="module-card"
                to={`/s/${subject.id}/${m.id}?grade=${gradeFilter}`}
              >
                <span className="module-card__accent" style={{ background: m.color }} />
                <span
                  className="module-card__icon"
                  style={{ background: `${m.color}16`, color: m.color }}
                >
                  {m.icon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="module-card__name" style={{ display: 'block' }}>
                    {m.name}
                  </span>
                  <span className="module-card__desc" style={{ display: 'block' }}>
                    {m.desc}
                  </span>
                  <span className="module-card__foot">
                    <span>
                      本学段 {st.gradeCount} 条 / 共 {allCount} 条
                    </span>
                    <span>·</span>
                    <span>{st.questions} 题</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 本科工具：背诵 / 错题本 / 考点 / 知识拓展，都只作用于这一科 */}
      <section className="stack stack--sm">
        <SectionTitle sub="这些入口都只看本科内容，不与其他科目混在一起">本科工具</SectionTitle>
        <div className="scroll-x quick-row">
          {toolsOf(subject).map((t) => (
            <Link className="quick" key={t.to} to={t.to}>
              <span className="quick__icon">{t.icon}</span>
              <span className="quick__label">{t.label}</span>
              <span className="quick__desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
