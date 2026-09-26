/**
 * 知识拓展（科目子页面）：两个标签页
 * - 思维导图：按模块分组的树状知识图，用于联想记忆
 * - 拓展阅读：按类别分组的延伸内容（含不依附具体条目的通用拓展）
 *
 * 内容是**跟着科目走**的：进来只看这一科的导图与拓展，不与其他科目混在一起。
 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { extensions, mindMaps, moduleIdsOfSubject } from '../data';
import { getModuleMeta, getSubject } from '../data/subjects';
import type { Extension, ModuleId } from '../types';
import { cn, gradeShort } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { EmptyState, PageHeader, Tag, type Tone } from '../components/common';
import { MindMapView, countNodes } from '../components/MindMapView';
import { ExtensionList } from '../components/ExtensionList';

type Tab = 'maps' | 'exts';

const KIND_TONE: Record<Extension['kind'], Tone> = {
  背景拓展: 'blue',
  对比阅读: 'purple',
  文化常识: 'jade',
  考点延伸: 'red',
  趣味知识: 'gold',
  学法指导: 'default',
};

export default function ExtrasPage() {
  const { subjectId = 'chinese' } = useParams();
  const subject = getSubject(subjectId);
  const [tab, setTab] = useState<Tab>('maps');
  // 这一页只用到思维导图与拓展阅读，单独点名 extras，不加载任何模块正文
  const ready = useDataScope(['extras']);

  /** 本科的模块顺序（也是分组顺序），来自学科注册表本身 */
  const moduleIds = useMemo(() => moduleIdsOfSubject(subjectId), [subjectId]);
  const maps = useMemo(
    () => mindMaps.filter((m) => moduleIds.includes(m.moduleId)),
    [moduleIds, ready],
  );
  const exts = useMemo(
    () => extensions.filter((x) => moduleIds.includes(x.moduleId)),
    [moduleIds, ready],
  );

  if (!subject) {
    return <EmptyState icon="🧭" title="没有这个学科" desc="请从首页重新选择。" />;
  }

  if (!ready) return <DataLoading label="正在加载导图与拓展…" />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: subject.name, to: `/s/${subject.id}` },
          { label: '知识拓展' },
        ]}
        title={`🧩 ${subject.name}知识拓展`}
        desc="常规讲解之外的两种辅助：思维导图帮你把知识点连成网，拓展阅读帮你加深理解、打通关联。"
        extra={
          <Link className="btn btn--sm" to={`/s/${subject.id}`}>
            回到{subject.name}
          </Link>
        }
      />

      <div className="scroll-x">
        <button className={cn('chip', tab === 'maps' && 'is-active')} onClick={() => setTab('maps')}>
          🧠 思维导图（{maps.length}）
        </button>
        <button className={cn('chip', tab === 'exts' && 'is-active')} onClick={() => setTab('exts')}>
          📚 拓展阅读（{exts.length}）
        </button>
      </div>

      {tab === 'maps' ? (
        <MapsTab moduleIds={moduleIds} items={maps} subjectId={subject.id} />
      ) : (
        <ExtsTab moduleIds={moduleIds} items={exts} />
      )}
    </div>
  );
}

/* ------------------------------ 思维导图 ------------------------------ */

function MapsTab({
  moduleIds,
  items,
  subjectId,
}: {
  moduleIds: ModuleId[];
  items: typeof mindMaps;
  subjectId: string;
}) {
  const [moduleFilter, setModuleFilter] = useState<ModuleId | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (moduleFilter === 'all' ? items : items.filter((m) => m.moduleId === moduleFilter)),
    [moduleFilter, items],
  );

  const groups = useMemo(
    () =>
      moduleIds
        .map((mid) => ({ mid, list: filtered.filter((m) => m.moduleId === mid) }))
        .filter((g) => g.list.length > 0),
    [filtered, moduleIds],
  );

  const modulesWithMaps = useMemo(() => [...new Set(items.map((m) => m.moduleId))], [items]);

  if (!items.length) {
    return (
      <EmptyState
        icon="🧠"
        title="本科还没有思维导图"
        desc="思维导图会随各模块内容一起上线；先去学科页看看已有的模块与练习。"
      />
    );
  }

  return (
    <div className="stack stack--lg">
      <section className="card card--pad stack stack--sm">
        <div className="scroll-x">
          <button
            className={cn('chip', moduleFilter === 'all' && 'is-active')}
            onClick={() => setModuleFilter('all')}
          >
            全部（{items.length}）
          </button>
          {modulesWithMaps.map((mid) => {
            const meta = getModuleMeta(mid);
            const count = items.filter((m) => m.moduleId === mid).length;
            return (
              <button
                key={mid}
                className={cn('chip', moduleFilter === mid && 'is-active')}
                onClick={() => setModuleFilter(mid)}
              >
                {meta?.module.icon} {meta?.module.name ?? mid}（{count}）
              </button>
            );
          })}
        </div>
        <div className="small muted">
          用法：先只看主干（点「只看主干」），试着复述下面的内容；想不起来再逐层展开。
        </div>
      </section>

      {groups.map(({ mid, list }) => {
        const meta = getModuleMeta(mid);
        return (
          <section className="stack stack--sm" key={mid}>
            <h2 className="section-title">
              <span className="section-title__bar" style={{ background: meta?.module.color }} />
              {meta?.module.icon} {meta?.module.name ?? mid}
              <span className="small muted" style={{ fontWeight: 500 }}>
                （{list.length} 张）
              </span>
            </h2>

            <div className="stack stack--sm">
              {list.map((m) => {
                const open = openId === m.id;
                return (
                  <div className="card" key={m.id}>
                    <button
                      className="ext__head"
                      onClick={() => setOpenId(open ? null : m.id)}
                      aria-expanded={open}
                    >
                      <span className="ext__title">
                        <span style={{ fontWeight: 700 }}>{m.title}</span>
                        <span
                          className="small muted"
                          style={{ display: 'block', fontWeight: 400, marginTop: 2 }}
                        >
                          {m.summary}
                        </span>
                      </span>
                      <Tag tone="blue">{gradeShort(m.grade)}</Tag>
                      <Tag>{countNodes(m.root)} 节点</Tag>
                      <span className={cn('ext__caret', open && 'is-open')}>▼</span>
                    </button>

                    {open ? (
                      <div
                        className="card__body fade-in"
                        style={{ borderTop: '1px solid var(--c-line)' }}
                      >
                        <MindMapView root={m.root} />
                        {m.entryId ? (
                          <div style={{ marginTop: 12 }}>
                            <Link className="btn btn--sm" to={`/s/${subjectId}/${m.moduleId}/${m.entryId}`}>
                              查看对应内容 →
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------ 拓展阅读 ------------------------------ */

function ExtsTab({ moduleIds, items }: { moduleIds: ModuleId[]; items: typeof extensions }) {
  const [kindFilter, setKindFilter] = useState<Extension['kind'] | 'all'>('all');

  const kinds = useMemo(() => [...new Set(items.map((e) => e.kind))], [items]);

  const filtered = useMemo(
    () => (kindFilter === 'all' ? items : items.filter((e) => e.kind === kindFilter)),
    [kindFilter, items],
  );

  /** 按所属模块分组，便于定位 */
  const groups = useMemo(
    () =>
      moduleIds
        .map((mid) => ({ mid, list: filtered.filter((e) => e.moduleId === mid) }))
        .filter((g) => g.list.length > 0),
    [filtered, moduleIds],
  );

  if (!items.length) {
    return (
      <EmptyState
        icon="📚"
        title="本科还没有拓展内容"
        desc="拓展阅读会随各模块内容一起上线；先去学科页看看已有的模块与练习。"
      />
    );
  }

  return (
    <div className="stack stack--lg">
      <section className="card card--pad stack stack--sm">
        <div className="scroll-x">
          <button
            className={cn('chip', kindFilter === 'all' && 'is-active')}
            onClick={() => setKindFilter('all')}
          >
            全部（{items.length}）
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              className={cn('chip', kindFilter === k && 'is-active')}
              onClick={() => setKindFilter(k)}
            >
              {k}（{items.filter((e) => e.kind === k).length}）
            </button>
          ))}
        </div>
      </section>

      {groups.map(({ mid, list }) => {
        const meta = getModuleMeta(mid);
        return (
          <section className="stack stack--sm" key={mid}>
            <h2 className="section-title">
              <span className="section-title__bar" style={{ background: meta?.module.color }} />
              {meta?.module.icon} {meta?.module.name ?? mid}
              <span className="small muted" style={{ fontWeight: 500 }}>
                （{list.length} 篇）
              </span>
            </h2>
            <ExtensionList items={list} />
          </section>
        );
      })}
    </div>
  );
}
