/** 内容详情页的公共外壳：面包屑、标题、收藏、练习题入口 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../../types';
import { useStudy } from '../../store/StudyContext';
import { GRADES } from '../../lib/utils';
import type { SpeechSegment } from '../../lib/speech';
import { Crumbs, Tag } from '../../components/common';
import { MindMapView } from '../../components/MindMapView';
import { ExtensionList } from '../../components/ExtensionList';
import { RelatedList } from '../../components/RelatedList';
import { SupplementList } from '../../components/SupplementList';
import { SpeechBar } from '../../components/SpeechBar';
import { extensions, extensionsOfEntry, mindMapsOfEntry, mindMapsOfModule } from '../../data';
import { lessonMindMap } from '../../lib/lessonMaps';
import { speechSegmentsOf } from '../../lib/entrySpeech';

/**
 * 常规讲解之外的延伸内容：思维导图 + 拓展阅读。
 * 在这里统一接入，六个模块的详情页便都能自动获得。
 *
 * 导图三级取材：
 * 1. **本课思维导图**——由条目自身的数据推导（逐句脉络、语法归类、考点、易错字…），
 *    因此**每一课都有**：一首古诗、一篇文言文打开就能看到这一课该记什么、怎么串。
 * 2. 人工绑定该条目的导图（entryId 命中，如 12 部名著的人物·情节图）——比推导的更细，
 *    有它就优先显示它，避免同一页出现两张讲同一课的图。
 * 3. 该模块的「体系性」导图（最多 2 张，默认收起），学《陈涉世家》时也能看到
 *    「文言语法五大现象」这类图。
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
      {/* 本课思维导图：把这一课的骨架、要点与考点串成一张图 */}
      {lesson ? (
        <section className="card" key={lesson.id}>
          <div className="card__head">
            <span className="card__title">
              <span>🧠</span>
              本课思维导图
              <Tag tone="jade">这一课该记什么</Tag>
            </span>
            <span className="spacer" />
            <span className="small muted">点节点展开／收起</span>
          </div>
          <div className="card__body">
            <div className="small muted" style={{ marginBottom: 8 }}>
              {lesson.summary}
            </div>
            <MindMapView root={lesson.root} defaultMode="default" />
          </div>
        </section>
      ) : null}

      {systemMaps.map((m) => (
        <section className="card" key={m.id}>
          <div className="card__head">
            <span className="card__title">
              <span>🧠</span>
              思维导图 · {m.title}
            </span>
            <span className="spacer" />
            <Tag tone="purple">本模块体系图</Tag>
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
