/** 内容详情页的公共外壳：面包屑、标题、收藏、练习题入口 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../../types';
import { useStudy } from '../../store/StudyContext';
import { GRADES } from '../../lib/utils';
import { Crumbs, Tag } from '../../components/common';
import { MindMapView } from '../../components/MindMapView';
import { ExtensionList } from '../../components/ExtensionList';
import { RelatedList } from '../../components/RelatedList';
import { SupplementList } from '../../components/SupplementList';
import { extensions, extensionsOfEntry, mindMapsOfEntry, mindMapsOfModule } from '../../data';

/**
 * 常规讲解之外的延伸内容：思维导图 + 拓展阅读。
 * 在这里统一接入，六个模块的详情页便都能自动获得。
 *
 * 两级取材：
 * 1. 精确绑定该条目的导图/拓展（entryId 命中）；
 * 2. 若没有，则回退到该模块的「体系性」导图与通用拓展（最多各 2 条），
 *    这样学《陈涉世家》时也能看到「文言语法五大现象」这类图。
 */
function ExtraSections({
  entryId,
  entryTitle,
  moduleId,
}: {
  entryId: string;
  entryTitle: string;
  moduleId: Entry['moduleId'];
}) {
  const exactMaps = mindMapsOfEntry(entryId);
  const exactExts = extensionsOfEntry(entryId);

  // 命中就用精确绑定的；没命中则回退到本模块的体系性内容
  const maps = exactMaps.length
    ? exactMaps
    : mindMapsOfModule(moduleId)
        .filter((m) => !m.entryId)
        .slice(0, 2);
  const exts = exactExts.length
    ? exactExts
    : extensions.filter((e) => e.moduleId === moduleId && !e.entryId).slice(0, 2);

  if (!maps.length && !exts.length) return null;

  return (
    <>
      {maps.map((m) => (
        <section className="card" key={m.id}>
          <div className="card__head">
            <span className="card__title">
              <span>🧠</span>
              思维导图 · {m.title}
            </span>
            <span className="spacer" />
            {m.entryId ? null : <Tag tone="purple">本模块体系图</Tag>}
          </div>
          <div className="card__body">
            <div className="small muted" style={{ marginBottom: 8 }}>
              {m.summary}
            </div>
            {/* 精确绑定的导图直接展开两层；兜底的体系图默认只显示主干，避免整页过长 */}
            <MindMapView root={m.root} defaultMode={m.entryId ? 'default' : 'none'} />
          </div>
        </section>
      ))}

      {exts.length ? (
        <section className="card">
          <div className="card__head">
            <span className="card__title">
              <span>📚</span>
              拓展阅读
              <Tag tone="purple">{exts.length} 篇</Tag>
            </span>
          </div>
          <div className="card__body">
            <div className="small muted" style={{ marginBottom: 10 }}>
              围绕《{entryTitle}》的延伸内容，用于加深理解、建立联想。
            </div>
            <ExtensionList items={exts} />
          </div>
        </section>
      ) : null}

      {maps.length || exts.length ? (
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
  children,
}: {
  entry: Entry;
  subjectId?: string;
  moduleName: string;
  backTo: string;
  subtitle?: ReactNode;
  tags?: string[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { isStarred, toggleStar, getProgress } = useStudy();
  const starred = isStarred(entry.id);
  const progress = getProgress(entry.id);

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

      {children}

      <ExtraSections entryId={entry.id} entryTitle={entry.title} moduleId={entry.moduleId} />

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
