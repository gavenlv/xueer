/**
 * 高中语文 · 一册的单元与课时：`/hs/:bookId`
 *
 * ## 为什么一册一页，而不是把五册摊在一个页面上
 *
 * 五册 28 单元、159 个课时条目，全铺在一页就是「一个卡片装太多东西」的老问题
 * （初中专题页当初就是这么被拆掉的）。这里按册切开：一册 4—8 个单元，
 * 每个单元一张可折叠的卡——收起时只看单元名、任务群、课时数，展开才列篇目。
 *
 * ## 折叠状态用 `<details>`
 *
 * 没有本地存储、没有受控 state：单元卡是「临时看一眼」的信息，不像专题页那样需要记住
 * 学生上次折到哪。原生 `<details>` 还自带键盘可达性，少写一套 aria。
 * 默认全部收起（`open` 不加），学生看到的就是一册的骨架。
 *
 * @data-summary-only 本页只读 `data/hs-chinese/books.ts` 这份静态目录（纯字符串），
 * 不涉及按需加载的正文/题库，因此不需要 `useDataScope`。
 */

import { Link, useParams } from 'react-router-dom';
import { EmptyState, PageHeader, Tag } from '../components/common';
import { HS_CHINESE_BOOKS, hsBookOf } from '../data/hs-chinese/books';
import { hsLessonContentOf, hsUnitDoneCount } from '../data/hs-chinese/lessons';

const KIND_LABEL: Record<string, string> = {
  text: '课文单元',
  activity: '学习活动单元',
  recite: '古诗词诵读',
};

export default function HsBookPage() {
  const { bookId = '' } = useParams();
  const book = hsBookOf(bookId);

  const index = HS_CHINESE_BOOKS.findIndex((b) => b.id === bookId);
  const prev = index > 0 ? HS_CHINESE_BOOKS[index - 1] : undefined;
  const next = index >= 0 && index < HS_CHINESE_BOOKS.length - 1 ? HS_CHINESE_BOOKS[index + 1] : undefined;

  if (!book) {
    return (
      <div className="stack stack--lg">
        <PageHeader crumbs={[{ label: '首页', to: '/' }, { label: '高中语文', to: '/hs' }]} title="没有找到这一册" />
        <EmptyState
          icon="🔍"
          title="这一册不在高中语文的五册里"
          desc="高中语文是统编版必修上／下与选择性必修上／中／下，共五册。"
          action={
            <Link className="btn btn--primary" to="/hs">
              ← 回到高中语文
            </Link>
          }
        />
      </div>
    );
  }

  let lessons = 0;
  let activities = 0;
  let recite = 0;
  for (const u of book.units) {
    if (u.kind === 'activity') activities += u.lessons.length;
    else if (u.kind === 'recite') recite += u.lessons.length;
    else lessons += u.lessons.length;
  }

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '高中语文', to: '/hs' }, { label: book.name }]}
        title={book.name}
        desc={
          <>
            {book.year} · {book.units.length} 个单元 · 课文 {lessons} 篇
            {recite ? ` + 古诗词诵读 ${recite} 首` : ''}
            {activities ? ` + 学习活动 ${activities} 条` : ''}
            <span className="small muted" style={{ marginLeft: 8 }}>
              {book.publisher}
            </span>
          </>
        }
        extra={
          <>
            <Link className="btn btn--sm" to="/hs">
              ← 高中语文
            </Link>
            {prev ? (
              <Link className="btn btn--sm" to={`/hs/${prev.id}`}>
                ← {prev.short}
              </Link>
            ) : null}
            {next ? (
              <Link className="btn btn--sm" to={`/hs/${next.id}`}>
                {next.short} →
              </Link>
            ) : null}
          </>
        }
      />

      <div className="row row--wrap small muted" style={{ gap: 10 }}>
        <Tag tone={book.verified === '✅' ? 'jade' : 'gold'}>{book.verified} 目录已核对</Tag>
        <span>{book.summary}</span>
      </div>

      <div className="stack stack--sm">
        {book.units.map((u) => (
          <details className="card card--pad hs-unit" key={`${u.no}-${u.name}`}>
            <summary className="hs-unit__head">
              <span className="hs-unit__name">
                {u.no}. {u.name}
              </span>
              <Tag tone="purple">{u.taskGroup}</Tag>
              {u.theme ? <Tag>{u.theme}</Tag> : null}
              <span className="spacer" />
              <span className="small muted">
                {KIND_LABEL[u.kind]} · {u.lessons.length} {u.kind === 'activity' ? '条活动' : '篇'}
              </span>
            </summary>

            {u.examNote ? (
              <div className="hs-unit__exam small">
                <b>高考怎么考：</b>
                {u.examNote}
              </div>
            ) : null}

            <ol className="hs-lessons">
              {u.lessons.map((l, i) => {
                const has = Boolean(hsLessonContentOf(book.id, u.no, l.title));
                return (
                  <li className="hs-lesson" key={`${l.title}-${i}`}>
                    {l.no ? <span className="hs-lesson__no">{l.no}</span> : <span className="hs-lesson__dot">·</span>}
                    {has ? (
                      <Link
                        className="hs-lesson__title hs-lesson__title--link"
                        to={`/hs/${book.id}/l/${encodeURIComponent(l.title)}`}
                      >
                        {l.title}
                      </Link>
                    ) : (
                      <span className="hs-lesson__title">{l.title}</span>
                    )}
                    {l.author ? <span className="small muted hs-lesson__author">{l.author}</span> : null}
                    {l.selfRead ? <Tag>自读</Tag> : null}
                    <span className="spacer" />
                    {has ? (
                      <Tag tone="jade">有讲解</Tag>
                    ) : (
                      <span className="small muted">讲解在补</span>
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="small muted" style={{ marginTop: 8, lineHeight: 1.8 }}>
              {u.task ? `单元任务：${u.task}。` : ''}
              {hsUnitDoneCount(book.id, u.no) > 0
                ? `本单元已写 ${hsUnitDoneCount(book.id, u.no)} / ${u.lessons.length} 篇（点篇名看讲解与练习）。`
                : '这一单元的讲解与练习正在补充（按册推进，先做必修上册）。'}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
