/**
 * 知识拓展页：两个标签页
 * - 思维导图：按模块分组的树状知识图，用于联想记忆
 * - 拓展阅读：按类别分组的延伸内容（含不依附具体条目的通用拓展）
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { extensions, mindMaps } from '../data';
import { getModuleMeta } from '../data/subjects';
import type { Extension, ModuleId } from '../types';
import { cn, gradeShort } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { Crumbs, EmptyState, PageHeader, Tag, type Tone } from '../components/common';
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

const MODULE_ORDER: ModuleId[] = ['literature', 'classical', 'poems', 'vocab', 'reading', 'writing'];

export default function ExtrasPage() {
  const [tab, setTab] = useState<Tab>('maps');
  // 这一页只用到思维导图与拓展阅读，单独点名 extras，不加载任何模块正文
  const ready = useDataScope(['extras']);

  if (!ready) return <DataLoading label="正在加载导图与拓展…" />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '知识拓展' }]}
        title="🧩 知识拓展"
        desc="常规讲解之外的两种辅助：思维导图帮你把知识点连成网，拓展阅读帮你加深理解、打通关联。"
        extra={
          <Link className="btn btn--sm" to="/s/chinese">
            回到语文
          </Link>
        }
      />

      <div className="scroll-x">
        <button className={cn('chip', tab === 'maps' && 'is-active')} onClick={() => setTab('maps')}>
          🧠 思维导图（{mindMaps.length}）
        </button>
        <button className={cn('chip', tab === 'exts' && 'is-active')} onClick={() => setTab('exts')}>
          📚 拓展阅读（{extensions.length}）
        </button>
      </div>

      {tab === 'maps' ? <MapsTab /> : <ExtsTab />}
    </div>
  );
}

/* ------------------------------ 思维导图 ------------------------------ */

function MapsTab() {
  const [moduleFilter, setModuleFilter] = useState<ModuleId | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (moduleFilter === 'all' ? mindMaps : mindMaps.filter((m) => m.moduleId === moduleFilter)),
    [moduleFilter, mindMaps.length],
  );

  const groups = useMemo(
    () =>
      MODULE_ORDER.map((mid) => ({ mid, list: filtered.filter((m) => m.moduleId === mid) })).filter(
        (g) => g.list.length > 0,
      ),
    [filtered],
  );

  const modulesWithMaps = useMemo(() => [...new Set(mindMaps.map((m) => m.moduleId))], [mindMaps.length]);

  return (
    <div className="stack stack--lg">
      <section className="card card--pad stack stack--sm">
        <div className="scroll-x">
          <button
            className={cn('chip', moduleFilter === 'all' && 'is-active')}
            onClick={() => setModuleFilter('all')}
          >
            全部（{mindMaps.length}）
          </button>
          {modulesWithMaps.map((mid) => {
            const meta = getModuleMeta(mid);
            const count = mindMaps.filter((m) => m.moduleId === mid).length;
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

      {groups.length === 0 ? (
        <EmptyState icon="🧠" title="这里还没有思维导图" desc="换个模块筛选试试。" />
      ) : (
        groups.map(({ mid, list }) => {
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
                              <Link className="btn btn--sm" to={`/s/chinese/${m.moduleId}/${m.entryId}`}>
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
        })
      )}
    </div>
  );
}

/* ------------------------------ 拓展阅读 ------------------------------ */

function ExtsTab() {
  const [kindFilter, setKindFilter] = useState<Extension['kind'] | 'all'>('all');

  const kinds = useMemo(() => [...new Set(extensions.map((e) => e.kind))], [extensions.length]);

  const filtered = useMemo(
    () => (kindFilter === 'all' ? extensions : extensions.filter((e) => e.kind === kindFilter)),
    [kindFilter, extensions.length],
  );

  /** 按所属模块分组，便于定位 */
  const groups = useMemo(
    () =>
      MODULE_ORDER.map((mid) => ({ mid, list: filtered.filter((e) => e.moduleId === mid) })).filter(
        (g) => g.list.length > 0,
      ),
    [filtered],
  );

  return (
    <div className="stack stack--lg">
      <section className="card card--pad stack stack--sm">
        <div className="scroll-x">
          <button
            className={cn('chip', kindFilter === 'all' && 'is-active')}
            onClick={() => setKindFilter('all')}
          >
            全部（{extensions.length}）
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              className={cn('chip', kindFilter === k && 'is-active')}
              onClick={() => setKindFilter(k)}
            >
              {k}（{extensions.filter((e) => e.kind === k).length}）
            </button>
          ))}
        </div>
      </section>

      {groups.length === 0 ? (
        <EmptyState icon="📚" title="这里还没有拓展内容" desc="换个类别筛选试试。" />
      ) : (
        groups.map(({ mid, list }) => {
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
        })
      )}
    </div>
  );
}
