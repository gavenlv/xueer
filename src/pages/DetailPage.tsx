/** 详情分发：根据模块把内容交给对应的渲染器 */

import { Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { ModuleId, PoliticsPaperEntry, PoliticsTopicEntry } from '../types';
import { findEntryById } from '../data';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import { useDataScope } from '../lib/useData';
import { EmptyState } from '../components/common';
import { PoemDetail } from './detail/PoemDetail';
import { VocabDetail } from './detail/VocabDetail';
import { ClassicalDetail } from './detail/ClassicalDetail';
import { ReadingDetail } from './detail/ReadingDetail';
import { WritingDetail } from './detail/WritingDetail';
import { LiteratureDetail } from './detail/LiteratureDetail';
import { HistoryDetail } from './detail/HistoryDetail';
import { HistoryPaperDetail } from './detail/HistoryPaperDetail';
import { EnglishDetail } from './detail/EnglishDetail';
import { EnglishPaperDetail } from './detail/EnglishPaperDetail';
import { PoliticsDetail } from './detail/PoliticsDetail';
import { PoliticsPaperDetail } from './detail/PoliticsPaperDetail';

/**
 * 六个模块的详情渲染器。
 *
 * 其中**只有数学是懒加载的**：它静态依赖 KaTeX（渲染器 + 样式 + 字体约 600 kB），
 * 而数学在 UI 上是隐藏的，语文学生永远用不到——所以单独拆出去，
 * 只有真的打开数学页时才下载。
 *
 * 语文六个渲染器保持静态引入是有意为之：它们各自只有几 KB，拆出去省不下多少，
 * 却会让服务端渲染（`pnpm smoke` 逐条路由验证）只拿到 Suspense 占位符、
 * 看不到真实内容——那等于把最有价值的一层回归测试弄瞎。
 */
const MathDetail = lazy(() => import('./detail/MathDetail').then((m) => ({ default: m.MathDetail })));

/** 详情页骨架占位，避免切换时闪白 */
function DetailLoading() {
  return (
    <div className="stack stack--lg">
      <div className="card card--pad">
        <div className="small muted">正在打开…</div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  const { moduleId = 'poems', itemId = '' } = useParams();
  const { recordStudy } = useStudy();
  // 本条内容所属模块的数据 + 思维导图/拓展阅读（详情页底部要用）
  const ready = useDataScope([moduleId as ModuleId, 'extras']);
  const entry = useMemo(() => findEntryById(itemId), [itemId, ready]);
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    if (counted.current === entry.id) return;
    counted.current = entry.id;
    recordStudy(entry.id);
  }, [entry, recordStudy]);

  if (!ready) return <DetailLoading />;

  if (!entry || entry.moduleId !== moduleId) {
    return (
      <EmptyState
        icon="🔍"
        title="没有找到这条内容"
        desc="它可能已被移除，或者链接不正确。"
      />
    );
  }

  const meta = getModuleMeta(entry.moduleId);

  const pick = () => {
    switch (entry.moduleId) {
      case 'poems':
        return <PoemDetail entry={entry} moduleName={meta?.module.name ?? '古诗词'} />;
      case 'vocab':
        return <VocabDetail entry={entry} moduleName={meta?.module.name ?? '字词基础'} />;
      case 'classical':
        return <ClassicalDetail entry={entry} moduleName={meta?.module.name ?? '文言文阅读'} />;
      case 'reading':
        return <ReadingDetail entry={entry} moduleName={meta?.module.name ?? '现代文阅读'} />;
      case 'writing':
        return <WritingDetail entry={entry} moduleName={meta?.module.name ?? '作文训练'} />;
      case 'literature':
        return <LiteratureDetail entry={entry} moduleName={meta?.module.name ?? '文学常识'} />;
      // 历史：模拟卷走「整卷考试」那一套渲染，其余八块（六册 + 中考专题）共用备考版详情页
      case 'hist-exam':
        return <HistoryPaperDetail entry={entry} moduleName={meta?.module.name ?? '模拟考试'} />;
      case 'hist-7a':
      case 'hist-7b':
      case 'hist-8a':
      case 'hist-8b':
      case 'hist-9a':
      case 'hist-9b':
      case 'hist-topics':
        return <HistoryDetail entry={entry} moduleName={meta?.module.name ?? '历史'} />;
      // 英语：整卷走考试页那一套，知识模块（词汇/语法/阅读/听说/写作/专题）共用知识版详情页
      case 'eng-exam':
        return <EnglishPaperDetail entry={entry} moduleName={meta?.module.name ?? '模拟考试'} />;
      case 'eng-vocab':
      case 'eng-grammar':
      case 'eng-reading':
      case 'eng-listening':
      case 'eng-writing':
      case 'eng-topics':
        return <EnglishDetail entry={entry} moduleName={meta?.module.name ?? '英语'} />;
      // 道德与法治：整卷走考试页那一套，知识模块共用备考版详情页（与历史同一套八块结构）
      case 'pol-exam':
        // pol-exam 里既有整卷模拟（有 sections），也有题型专题这类知识条目：
        // 按数据形状分流，而不是按 moduleId（两者共用 pol-exam）。
        return 'sections' in entry.data ? (
          <PoliticsPaperDetail entry={entry as PoliticsPaperEntry} moduleName={meta?.module.name ?? '模拟考试'} />
        ) : (
          <PoliticsDetail entry={entry as PoliticsTopicEntry} moduleName={meta?.module.name ?? '道德与法治'} />
        );
      case 'pol-growth':
      case 'pol-moral':
      case 'pol-law':
      case 'pol-nation':
      case 'pol-current':
        return <PoliticsDetail entry={entry} moduleName={meta?.module.name ?? '道德与法治'} />;
      case 'math-number':
      case 'math-geometry':
      case 'math-stats':
      case 'math-formula':
      case 'math-model':
      case 'math-exam':
        return <MathDetail entry={entry} moduleName={meta?.module.name ?? '数学'} />;
      default:
        return <EmptyState icon="🧭" title="暂不支持该模块" />;
    }
  };

  return <Suspense fallback={<DetailLoading />}>{pick()}</Suspense>;
}
