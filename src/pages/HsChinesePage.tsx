/**
 * 高中语文首页：`/hs`
 *
 * ## 为什么单独做一个「高中」入口，而不是塞进 8 个中考科目里
 *
 * App 原来的 8 个科目对应的是**广州中考**（2027 年 750 分）。高中语文是另一个考试体系：
 * 广东 2027 高考「3+1+2」，语文 150 分、全国卷。把它混进中考科目列表，会让学生以为
 * 那也是中考的一部分（而且顶栏副标题「2027 广州中考 · 8 科」会自相矛盾）。
 *
 * 所以这一页只回答一件事：**高中语文五册里有什么，高考从哪几块考。**
 * 它不承载题目、不参与中考的掌握度统计——第一步先把「课本地图」立起来，
 * 讲解与练习按册往里填（见页面底部的进度说明）。
 *
 * ## 数据来源
 *
 * 全部来自 `data/hs-chinese/books.ts`（由 `docs/gaokao-2027/01-yuwen.md` 转换而来，
 * 那份文档的每一册目录都标了核实等级与来源）。页面上把 ✅ / ⚠️ 直接显示出来：
 * 学生看到 ⚠️ 就知道「这册目录要拿书对一遍」，而不是无条件相信。
 *
 * @data-summary-only 本页只读 `data/hs-chinese/*` 这份**静态轻量目录**（五个册次的单元与课时，
 * 一共十几 KB 的纯字符串），它不在按需加载注册表里，也不需要 `useDataScope` 预载模块正文——
 * 这里没有任何「正文/题库」要下载。加上这个标记是告诉校验脚本：这不是漏了 `useDataScope`。
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Tag } from '../components/common';
import { HS_CHINESE_BOOKS, HS_CHINESE_TOTALS } from '../data/hs-chinese/books';
import { HS_CHINESE_TOPICS } from '../data/hs-chinese/topics';

/** 一册的课时统计：课文（含整本书阅读）／学习活动／古诗词诵读分开数 */
function statOfBook(bookId: string) {
  const book = HS_CHINESE_BOOKS.find((b) => b.id === bookId);
  if (!book) return { lessons: 0, activities: 0, recite: 0 };
  let lessons = 0;
  let activities = 0;
  let recite = 0;
  for (const u of book.units) {
    if (u.kind === 'activity') activities += u.lessons.length;
    else if (u.kind === 'recite') recite += u.lessons.length;
    else lessons += u.lessons.length;
  }
  return { lessons, activities, recite };
}

export default function HsChinesePage() {
  const totals = useMemo(() => {
    let lessons = 0;
    let activities = 0;
    let recite = 0;
    for (const b of HS_CHINESE_BOOKS) {
      const s = statOfBook(b.id);
      lessons += s.lessons;
      activities += s.activities;
      recite += s.recite;
    }
    return { ...HS_CHINESE_TOTALS, lessons, activities, recite };
  }, []);

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '高中语文' }]}
        title="高中语文"
        desc={
          <>
            统编版（人教社）五册 · {totals.units} 个单元 · 课文 {totals.lessons} 篇
            {totals.recite ? ` + 古诗词诵读 ${totals.recite} 首` : ''}
            {totals.activities ? ` + 学习活动 ${totals.activities} 条` : ''}
            <span className="small muted" style={{ marginLeft: 8 }}>
              广东 2027 高考：语文 150 分 · 全国卷 · 150 分钟
            </span>
          </>
        }
      />

      {/* 五册：点进去看单元与课时 */}
      <section className="stack stack--sm">
        <div className="row row--between row--wrap">
          <h2 className="section-title">按教材：五册目录</h2>
          <span className="small muted">点一册进去，按单元看课时（篇名／作者／是否自读）</span>
        </div>
        <div className="hs-books">
          {HS_CHINESE_BOOKS.map((b) => {
            const s = statOfBook(b.id);
            return (
              <Link className="card card--pad hs-book" key={b.id} to={`/hs/${b.id}`}>
                <div className="row row--between row--wrap" style={{ alignItems: 'center' }}>
                  <span className="hs-book__name">{b.name}</span>
                  <Tag tone={b.verified === '✅' ? 'jade' : 'gold'}>{b.verified} 目录核实</Tag>
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  {b.year} · {b.units.length} 单元 · 课文 {s.lessons} 篇
                  {s.recite ? ` + 诵读 ${s.recite} 首` : ''}
                  {s.activities ? ` + 活动 ${s.activities} 条` : ''}
                </div>
                <div className="small" style={{ marginTop: 8, lineHeight: 1.8 }}>
                  {b.summary}
                </div>
                <div className="small" style={{ marginTop: 6, color: 'var(--c-primary-ink)' }}>
                  看这一册的单元与课时 →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 按高考主题：考这个点该回哪几课 */}
      <section className="card card--pad">
        <div className="row row--between row--wrap">
          <h2 className="section-title" style={{ margin: 0 }}>
            按高考主题：考这块该回哪几课
          </h2>
          <span className="small muted">按新课标Ⅰ卷的题型块组织，不按学科体系</span>
        </div>
        <div className="stack stack--sm" style={{ marginTop: 10 }}>
          {HS_CHINESE_TOPICS.map((t) => (
            <div className="hs-topic" key={t.name}>
              <div className="hs-topic__name">{t.name}</div>
              <div className="small" style={{ lineHeight: 1.8 }}>
                <b>怎么考：</b>
                {t.form}
              </div>
              <div className="small" style={{ lineHeight: 1.8 }}>
                <b>回哪几课：</b>
                {t.where}
              </div>
              <div className="small muted" style={{ lineHeight: 1.8 }}>
                {t.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 后面的内容按册往里填：这里说清现在到哪一步，别让学生以为「点进去就有题」 */}
      <section className="card card--pad">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          这一版做到哪一步
        </h2>
        <div className="stack stack--sm small" style={{ lineHeight: 1.9 }}>
          <div>
            ✅ 已完成：五册的「册 → 单元 → 课时」目录、每单元「高考怎么考」、按高考主题的索引。
            目录的每一册都标了核实等级（✅ 两个独立来源一致 / ⚠️ 单一来源，需拿书对一遍）。
          </div>
          <div>
            🚧 正在补：每篇课文的**讲解**（篇目要点、考法拆解、易错）与**练习**（选择／填空／简答）。
            这一步按册推进，先做必修上册。
          </div>
          <div className="muted">
            为什么先做地图：没有「哪一课对应哪个考点」这张表，讲解和练习就没有落点；
            而课本目录是可以逐条核对的客观事实，先把它钉死，后面的内容才不会长在错的地方。
          </div>
        </div>
      </section>
    </div>
  );
}
