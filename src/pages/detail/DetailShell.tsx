/** 内容详情页的公共外壳：面包屑、标题、收藏、练习题入口 */

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../../types';
import { useStudy } from '../../store/StudyContext';
import { GRADES, cn } from '../../lib/utils';
import type { SpeechSegment } from '../../lib/speech';
import { Crumbs, Tag } from '../../components/common';
import { MindMapView, countNodes } from '../../components/MindMapView';
import { ExtensionList } from '../../components/ExtensionList';
import { RelatedList } from '../../components/RelatedList';
import { SupplementList } from '../../components/SupplementList';
import { SpeechBar } from '../../components/SpeechBar';
import { extensions, extensionsOfEntry, mindMapsOfEntry, mindMapsOfModule } from '../../data';
import { lessonMindMap } from '../../lib/lessonMaps';
import { speechSegmentsOf } from '../../lib/entrySpeech';

/**
 * 可折叠的卡片：标题行始终显示（图标 + 名称 + 数量 + 一句话说明），点开才渲染正文。
 *
 * **默认收起**是刻意的：思维导图与拓展阅读都在详情页末尾，正文一次性铺开会把页面拉得
 * 很长，学生还没看到「学一补多」就已经划不动了。收起时标题行上的数量（「N 节点」/
 * 「N 篇」）与摘要足以判断值不值得展开，展开是明确的一次点击。
 */
function CollapseCard({
  icon,
  title,
  badge,
  hint,
  summary,
  children,
}: {
  icon: string;
  title: string;
  badge?: ReactNode;
  hint?: string;
  summary?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card">
      <button className="ext__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="ext__title">
          <span style={{ fontWeight: 700 }}>
            <span style={{ marginRight: 6 }}>{icon}</span>
            {title}
          </span>
          {summary ? (
            <span className="small muted" style={{ display: 'block', fontWeight: 400, marginTop: 2 }}>
              {summary}
            </span>
          ) : null}
        </span>
        {badge}
        {hint ? <span className="small muted">{hint}</span> : null}
        <span className={cn('ext__caret', open && 'is-open')}>▼</span>
      </button>
      {open ? (
        <div className="card__body fade-in" style={{ borderTop: '1px solid var(--c-line)' }}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

/**
 * 常规讲解之外的延伸内容：思维导图 + 拓展阅读。
 * 在这里统一接入，六个模块的详情页便都能自动获得。
 *
 * 导图三级取材：
 * 1. **本课思维导图**——由条目自身的数据推导（逐句脉络、语法归类、考点、易错字…），
 *    因此**每一课都有**：一首古诗、一篇文言文打开就能看到这一课该记什么、怎么串。
 * 2. 人工绑定该条目的导图（entryId 命中，如 12 部名著的人物·情节图）——比推导的更细，
 *    有它就优先显示它，避免同一页出现两张讲同一课的图。
 * 3. 该模块的「体系性」导图（最多 2 张），学《陈涉世家》时也能看到
 *    「文言语法五大现象」这类图。
 *
 * 三块都**默认收起**（见 `CollapseCard`）。
 */
function ExtraSections({ entry }: { entry: Entry }) {
  const entryId = entry.id;
  const entryTitle = entry.title;
  const moduleId = entry.moduleId;

  const exactMaps = mindMapsOfEntry(entryId);
  const exactExts = extensionsOfEntry(entryId);

  /** 本课思维导图：没有任何人工导图时才作为主图，避免两张图讲同一课 */
  const lesson = exactMaps.length ? null : lessonMindMap(entry);
  const systemMaps = mindMapsOfModule(moduleId)
    .filter((m) => !m.entryId)
    .slice(0, 2);

  const exts = exactExts.length
    ? exactExts
    : extensions.filter((e) => e.moduleId === moduleId && !e.entryId).slice(0, 2);

  if (!exactMaps.length && !lesson && !systemMaps.length && !exts.length) return null;

  return (
    <>
      {/* 本课思维导图：把这一课的骨架、要点与考点串成一张图（默认收起） */}
      {lesson ? (
        <CollapseCard
          key={lesson.id}
          icon="🧠"
          title="本课思维导图"
          summary={lesson.summary}
          badge={<Tag tone="jade">{countNodes(lesson.root)} 节点</Tag>}
          hint="这一课该记什么"
        >
          <MindMapView root={lesson.root} defaultMode="default" />
        </CollapseCard>
      ) : null}

      {systemMaps.map((m) => (
        <CollapseCard
          key={m.id}
          icon="🧠"
          title={`思维导图 · ${m.title}`}
          summary={m.summary}
          badge={<Tag tone="purple">本模块体系图</Tag>}
          hint={`${countNodes(m.root)} 节点`}
        >
          {/* 精确绑定的导图直接展开两层；兜底的体系图默认只显示主干，避免展开后仍然过长 */}
          <MindMapView root={m.root} defaultMode={m.entryId ? 'default' : 'none'} />
        </CollapseCard>
      ))}

      {exts.length ? (
        <CollapseCard
          icon="📚"
          title="拓展阅读"
          badge={<Tag tone="purple">{exts.length} 篇</Tag>}
          summary={`围绕《${entryTitle}》的延伸内容，用于加深理解、建立联想`}
        >
          <ExtensionList items={exts} />
        </CollapseCard>
      ) : null}

      {lesson || exactMaps.length || systemMaps.length || exts.length ? (
        <div className="row">
          <Link className="btn btn--sm" to="/extras">
            🧩 查看全部思维导图与拓展 →
          </Link>
        </div>
      ) : null}
    </>
  );
}

export function DetailShell({
  entry,
  subjectId = 'chinese',
  moduleName,
  backTo,
  subtitle,
  tags,
  actions,
  speech,
  children,
}: {
  entry: Entry;
  subjectId?: string;
  moduleName: string;
  backTo: string;
  subtitle?: ReactNode;
  tags?: string[];
  actions?: ReactNode;
  /** 自定义朗读段落；不传则按条目数据推导（`lib/entrySpeech.ts`），传 null 表示不朗读 */
  speech?: SpeechSegment[] | null;
  children: ReactNode;
}) {
  const { isStarred, toggleStar, getProgress } = useStudy();
  const starred = isStarred(entry.id);
  const progress = getProgress(entry.id);

  /**
   * 整页朗读：段落由条目数据推导（`lib/entrySpeech.ts`），所以六个模块的详情页
   * 都能一键从正文读到译文。放在正文之前，学生一进来就能「边听边看」。
   * 需要专门排段的页面可用 `speech={null}` 关掉，自己放朗读条。
   */
  const segments = useMemo(() => (speech === null ? [] : speech ?? speechSegmentsOf(entry)), [entry, speech]);

  return (
    <div className="stack stack--lg">
      <div className="stack stack--sm slide-up">
        <div className="row row--between row--wrap" style={{ alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Crumbs
              items={[
                { label: '首页', to: '/' },
                { label: '语文', to: `/s/${subjectId}` },
                { label: moduleName, to: backTo },
                { label: entry.title },
              ]}
            />
            <h1 className="page-title">{entry.title}</h1>
            {subtitle ? <div className="page-desc">{subtitle}</div> : null}
            <div className="row row--wrap" style={{ marginTop: 8 }}>
              {entry.grade !== 'all' ? (
                <Tag tone="blue">{GRADES.find((g) => g.id === entry.grade)?.name}</Tag>
              ) : (
                <Tag>通用</Tag>
              )}
              {(tags ?? entry.tags).slice(0, 5).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              {progress.studied > 0 ? (
                <Tag tone="jade">已学习 {progress.studied} 次</Tag>
              ) : null}
            </div>
          </div>

          <div className="row row--wrap">
            {actions}
            <button
              className="btn btn--sm"
              onClick={() => toggleStar(entry.id)}
              style={starred ? { color: 'var(--c-gold)', borderColor: 'var(--c-gold)' } : undefined}
            >
              {starred ? '★ 已收藏' : '☆ 收藏'}
            </button>
          </div>
        </div>
      </div>

      {/* 整页朗读（语速/音色可调）：六个模块共用，段落由条目数据推导 */}
      <SpeechBar segments={segments} title={`朗读《${entry.title}》`} />

      {children}

      <ExtraSections entry={entry} />

      {/* 知识联动：同作者 / 同主题 / 同意象 */}
      <RelatedList entry={entry} />

      {/* 学一补多：同一作品·其他模块 / 同作者 / 同一考点 / 本篇字词 / 文学常识 */}
      {/* key 绑定条目 id，切换条目时重挂载，重新默认展开第一组 */}
      <SupplementList key={entry.id} entry={entry} />

      <div className="row row--wrap">
        <Link className="btn" to={backTo}>
          ← 返回{moduleName}
        </Link>
        {entry.questions.length > 0 ? (
          <Link className="btn btn--primary" to={`/practice/${entry.moduleId}/${entry.id}`}>
            ✍️ 做这部分的练习（{entry.questions.length} 题）
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/** 详情页里的小节包装 */
export function Section({
  title,
  icon,
  extra,
  children,
}: {
  title: string;
  icon?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card__head">
        <span className="card__title">
          {icon ? <span>{icon}</span> : null}
          {title}
        </span>
        <span className="spacer" />
        {extra}
      </div>
      <div className="card__body">{children}</div>
    </section>
  );
}
