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
import { ReciteCardGroup } from '../../components/ReciteCards';
import { extensions, extensionsOfEntry, mindMapsOfEntry, mindMapsOfModule } from '../../data';
import { getModuleMeta, getSubject } from '../../data/subjects';
import { lessonMindMap } from '../../lib/lessonMaps';
import { speechSegmentsOf } from '../../lib/entrySpeech';
import { cardStatsOf, reciteCardsOf } from '../../lib/reciteCards';

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
function ExtraSections({ entry, subjectId }: { entry: Entry; subjectId: string }) {
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
          <Link className="btn btn--sm" to={`/s/${subjectId}/extras`}>
            🧩 查看全部思维导图与拓展 →
          </Link>
        </div>
      ) : null}
    </>
  );
}

/**
 * 这一课的**知识点背诵**：把正文里的必背项（默写句、时间点、踩分点、必背结论…）
 * 抽成一张张卡片，先回忆再翻面，背对三次标熟。
 *
 * 挂在详情页里而不是单独做页面，是因为「学」与「背」本来就在同一课里：
 * 学生读完主线与考点，往下划一屏就能立刻开始背，不用再去别的页面找同一个知识点。
 * 折叠卡片头部给出「已标熟 y / N」，一眼看出这一课掌握到什么程度。
 */
function ReciteSection({ entry }: { entry: Entry }) {
  const { state } = useStudy();
  const cards = useMemo(() => reciteCardsOf(entry), [entry]);
  const stats = cardStatsOf(cards, state.cards);

  if (!cards.length) return null;

  return (
    <CollapseCard
      icon="🧠"
      title="知识点背诵"
      summary="先自己回忆，再翻面核对；连续背对 3 次即标熟（完全掌握）"
      badge={
        stats.mastered > 0 ? (
          <Tag tone="jade">
            已标熟 {stats.mastered} / {stats.total}
          </Tag>
        ) : (
          <Tag>{stats.total} 个知识点</Tag>
        )
      }
      hint={stats.due > 0 ? `${stats.due} 个待背/待复习` : '今天没有到期的'}
    >
      <ReciteCardGroup cards={cards} />
    </CollapseCard>
  );
}

export function DetailShell({
  entry,
  subjectId,
  moduleName,
  backTo,
  subtitle,
  tags,
  actions,
  speech,
  children,
}: {
  entry: Entry;
  /**
   * 所属科目 id。**一般不用传**——不传时按 `entry.moduleId` 到科目注册表里反查
   * （见下面的 `sid`），注册表才是「哪个模块属于哪个科目」的唯一出处。
   *
   * 为什么不再给一个 `= 'chinese'` 的默认值：数学与历史的详情页当初没传这个参数，
   * 于是面包屑一律显示「首页 / 语文 / 公式定理速查 / 代数公式速查」，
   * 「知识拓展」还会跳到语文的 `/s/chinese/extras`——默认值写死哪个学科，
   * 别的学科就会静默串味。现在默认值由模块反查得到，写错的可能性从根上去掉了。
   */
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
   * 面包屑与「知识拓展」指向的科目：优先用调用方显式传进来的，
   * 否则按模块 id 反查注册表（数学的 `math-*`、历史的 `hist-*` 都从这里拿到自己的科目）。
   */
  const moduleMeta = getModuleMeta(entry.moduleId);
  const sid = subjectId ?? moduleMeta?.subject.id ?? 'chinese';
  const subjectName = getSubject(sid)?.name ?? moduleMeta?.subject.name ?? '语文';

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
                { label: subjectName, to: `/s/${sid}` },
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

      {/* 知识点背诵：把这一课的必背项做成卡片（默认收起，与导图/拓展同一套折叠样式） */}
      <ReciteSection entry={entry} />

      <ExtraSections entry={entry} subjectId={sid} />

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

/**
 * 详情页里的小节包装。
 *
 * 默认保持原来的「常开卡片」（语文等学科的详情页都按这个观感写的）；
 * 传 `fold` 时变成**可折叠**卡片：标题行始终是一行（图标 + 名称 + 摘要 + 计数），
 * 正文点开才渲染——数学知识点页一页有五六个区块，全部铺开会把页面拉得很难用，
 * 收起时标题行上的摘要足以判断值不值得展开（与 `CollapseCard` 同一套交互）。
 */
export function Section({
  title,
  icon,
  extra,
  summary,
  fold,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: string;
  extra?: ReactNode;
  /** 折叠标题行上的摘要小字（仅在 `fold` 时显示） */
  summary?: string;
  /** 折叠成一行卡片（默认 false：常开，其他学科页面不受影响） */
  fold?: boolean;
  /** 折叠时的初始状态；默认收起（用户明确的口径：默认折叠） */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!fold) {
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
  return (
    <section className="card">
      <button
        className="ext__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="ext__title">
          <span style={{ fontWeight: 700 }}>
            {icon ? <span style={{ marginRight: 6 }}>{icon}</span> : null}
            {title}
          </span>
          {summary ? (
            <span className="small muted" style={{ display: 'block', fontWeight: 400, marginTop: 2 }}>
              {summary}
            </span>
          ) : null}
        </span>
        {extra}
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
