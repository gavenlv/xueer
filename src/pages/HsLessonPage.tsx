/**
 * 高中语文 · 一篇课时的讲解与练习：`/hs/:bookId/l/:lessonTitle`
 *
 * ## 这一页回答的问题
 *
 * 初中那套专题页回答「这类题怎么拿分」；这一页回答的是**这一篇课文怎么读、高考从这里考什么**。
 * 所以正文顺序是：为什么重要 → 逐段讲解（每段一个真问题）→ 高考怎么考 → 易错 → 练习。
 *
 * ## 练习为什么不进「掌握度」统计
 *
 * 初中练习的过关记录绑在 `Question.id` 上，并且按模块计掌握度；高中语文目前只有目录与
 * 部分单元内容，还没有接入模块注册表。硬塞进去会污染初中的统计口径（分母突然多出高中题目）。
 * 所以这里的练习是**先读后练**的即时自测：点开看答案与解析，不记分、不进错题本。
 * 等高中内容成规模、有了自己的掌握度口径，再统一接入。
 *
 * ## 数据从哪来
 *
 * `data/hs-chinese/lessons` 的注册表：只有登记过的单元才有内容，没写的一律显示
 * 「这一篇的讲解正在补充」——不假装有内容。
 *
 * @data-summary-only 这里读的也是静态轻量数据（课时的讲解与练习直接写在 `data/hs-chinese/`
 * 下的 TS 文件里，跟着主包走，不经过按需加载注册表），因此不需要 `useDataScope`。
 */

import { Link, useParams } from 'react-router-dom';
import { EmptyState, PageHeader, Tag } from '../components/common';
import { hsBookOf } from '../data/hs-chinese/books';
import { hsLessonContentOf } from '../data/hs-chinese/lessons';

export default function HsLessonPage() {
  const { bookId = '', lessonTitle = '' } = useParams();
  const title = decodeURIComponent(lessonTitle);
  const book = hsBookOf(bookId);
  const unit = book?.units.find((u) => u.lessons.some((l) => l.title === title));
  const lesson = unit?.lessons.find((l) => l.title === title);
  const content = unit ? hsLessonContentOf(bookId, unit.no, title) : undefined;

  if (!book || !unit || !lesson) {
    return (
      <div className="stack stack--lg">
        <PageHeader
          crumbs={[{ label: '首页', to: '/' }, { label: '高中语文', to: '/hs' }]}
          title="没有找到这一篇"
        />
        <EmptyState
          icon="🔍"
          title="这一篇不在高中语文的五册目录里"
          desc="可能是篇名打错，或链接过期。回到高中语文，从册次里找。"
          action={
            <Link className="btn btn--primary" to="/hs">
              ← 回到高中语文
            </Link>
          }
        />
      </div>
    );
  }

  const bookPath = `/hs/${book.id}`;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: '高中语文', to: '/hs' },
          { label: book.name, to: bookPath },
          { label: title },
        ]}
        title={
          <span>
            {title}
            {lesson.author ? (
              <span className="small muted" style={{ marginLeft: 10 }}>
                {lesson.author}
              </span>
            ) : null}
          </span>
        }
        desc={
          <span className="row row--wrap" style={{ gap: 8 }}>
            <Tag tone="purple">{unit.taskGroup}</Tag>
            {unit.theme ? <Tag>{unit.theme}</Tag> : null}
            {content ? <Tag tone="jade">{content.genre}</Tag> : null}
            {lesson.selfRead ? <Tag>自读</Tag> : null}
          </span>
        }
        extra={
          <Link className="btn btn--sm" to={bookPath}>
            ← {book.short}
          </Link>
        }
      />

      {content ? (
        <>
          <section className="card card--pad">
            <div className="hs-lesson__why">
              <b>为什么重要：</b>
              {content.why}
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              讲解
            </h2>
            <div className="stack stack--md" style={{ marginTop: 10 }}>
              {content.notes.map((n, i) => (
                <div key={i}>
                  <div className="hs-note__head">{n.heading}</div>
                  <div className="hs-note__body">{n.body}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card card--pad">
            <div className="hs-exam">
              <b>高考怎么考：</b>
              {content.exam}
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              易错（错在哪 → 怎么办）
            </h2>
            <ol className="hs-pitfalls">
              {content.pitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </section>

          <section className="card card--pad">
            <div className="row row--between row--wrap">
              <h2 className="section-title" style={{ margin: 0 }}>
                练习（{content.drills.length} 题）
              </h2>
              <span className="small muted">点「看答案与解析」自测；这一步不记分、不进错题本</span>
            </div>
            <div className="stack stack--sm" style={{ marginTop: 10 }}>
              {content.drills.map((d, i) => (
                <div className="hs-drill" key={d.id}>
                  <div className="hs-drill__stem">
                    <span className="hs-drill__no">{i + 1}</span>
                    <span>{d.stem}</span>
                  </div>
                  {d.type === 'choice' && d.options ? (
                    <ol className="hs-drill__options" type="A">
                      {d.options.map((o, k) => (
                        <li key={k}>{o}</li>
                      ))}
                    </ol>
                  ) : null}
                  <details className="hs-drill__answer">
                    <summary>看答案与解析</summary>
                    <div className="small" style={{ lineHeight: 1.9, marginTop: 6 }}>
                      <div>
                        <b>答案：</b>
                        {d.answer}
                      </div>
                      {d.rubric?.length ? (
                        <div style={{ marginTop: 4 }}>
                          <b>踩分点：</b>
                          {d.rubric.join('；')}
                        </div>
                      ) : null}
                      <div style={{ marginTop: 4 }}>
                        <b>怎么想到的：</b>
                        {d.explanation}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          icon="📖"
          title="这一篇的讲解正在补充"
          desc={`高中语文按册推进，目前先做必修上册。${unit.taskGroup}这一单元的高考考法可以先看册页里的单元说明。`}
          action={
            <Link className="btn" to={bookPath}>
              ← 回到{book.name}
            </Link>
          }
        />
      )}
    </div>
  );
}
