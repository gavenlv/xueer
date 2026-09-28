/** 详情分发：根据模块把内容交给对应的渲染器 */

import { Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type {
  ChemPaperEntry,
  ChemTopicEntry,
  ModuleId,
  PhysicsPaperEntry,
  PhysicsTopicEntry,
  PoliticsPaperEntry,
  PoliticsTopicEntry,
} from '../types';
import { asExamTopicEntry, findEntryById, isLazyEntryModule, lazyEntrySpecFor } from '../data';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import { useDataScope, useLazyEntries, DataLoading } from '../lib/useData';
import { EmptyState } from '../components/common';
import { PoemDetail } from './detail/PoemDetail';
import { VocabDetail } from './detail/VocabDetail';
import { ClassicalDetail } from './detail/ClassicalDetail';
import { ReadingDetail } from './detail/ReadingDetail';
import { WritingDetail } from './detail/WritingDetail';
import { LiteratureDetail } from './detail/LiteratureDetail';
import { ChineseExamTopicDetail } from './detail/ChineseExamTopicDetail';
import { ExamTopicDetail } from './detail/ExamTopicDetail';
import { HistoryDetail } from './detail/HistoryDetail';
import { HistoryPaperDetail } from './detail/HistoryPaperDetail';
import { EnglishDetail } from './detail/EnglishDetail';
import { EnglishPaperDetail } from './detail/EnglishPaperDetail';
import { PoliticsDetail } from './detail/PoliticsDetail';
import { PoliticsPaperDetail } from './detail/PoliticsPaperDetail';
import { ChemistryDetail } from './detail/ChemistryDetail';
import { ChemistryPaperDetail } from './detail/ChemistryPaperDetail';
import { PhysicsDetail } from './detail/PhysicsDetail';
import { PhysicsPaperDetail } from './detail/PhysicsPaperDetail';

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
  /**
   * 本条内容所属模块的数据；`extras`（思维导图 + 拓展阅读）是详情页底部要用的。
   *
   * **「按条目懒加载」的模块不加载 `extras`**（语文中考专题、数学中考题型专题）：
   * 这两块既没有课时导图也没有拓展阅读（`mindmaps-*.ts` / `extensions-*.ts` 里没有
   * 任何 `zht-*` / `mth-*` 数据），而 `extras` 有 125 kB（gzip 约 127 kB）——
   * 看一个专题却要白下这些，是这一页最不该付的代价。专题页底部因此不会出现导图/拓展
   * 区块（本来就该没有内容），关联学习与学一补多依赖的是 `relations.ts` 与已加载条目，
   * 不受影响。请不要「顺手」把它补回来。
   */
  const needExtras = !isLazyEntryModule(moduleId);
  const moduleReady = useDataScope(
    needExtras ? [moduleId as ModuleId, 'extras'] : [moduleId as ModuleId],
  );
  /**
   * 「中考专题」是**一条一块**：模块范围只装骨架（模块列表页因此零下载），
   * 正文要按本条内容点名下载。少了这一步，详情页会拿着骨架渲染出空白的考情与讲解
   * ——那比停在加载中更糟：学生以为「这个专题没内容」。
   *
   * 范围由注册表算：`lazyEntrySpecFor` 先同步判断「这个 id 是不是这一块的条目」
   * （手打的 / 过期的链接不该触发下载），不是就返回 `undefined`（本页不需要正文）。
   * 语文与数学共用这一段，模块 id 一个都不用出现。
   */
  const lazySpec = lazyEntrySpecFor(moduleId, itemId);
  const topic = useLazyEntries(lazySpec);
  const ready = moduleReady && topic.ready;
  const entry = useMemo(() => findEntryById(itemId), [itemId, ready]);
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    if (counted.current === entry.id) return;
    counted.current = entry.id;
    recordStudy(entry.id);
  }, [entry, recordStudy]);

  if (!moduleReady) return <DetailLoading />;
  // 专题正文还在下载：走真实的加载占位（带进度、失败可重试），不要渲染空内容
  if (!topic.ready) {
    return <DataLoading label="正在加载专题…" failed={topic.failed} onRetry={topic.retry} />;
  }

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
      // 语文「中考专题」：按卷面题型逐个攻破（近五年考情 + 分步讲解 + 答题模板 + 评分点
      // + 专项训练分组），数据形状与教材六块完全不同，所以单列一个渲染器。
      case 'zh-topics':
        return <ChineseExamTopicDetail entry={entry} moduleName={meta?.module.name ?? '中考专题'} />;
      // 数学「中考题型专题」：与语文**同一套形态**（ExamTopic），因此走同一个通用渲染器，
      // 学科差异只有两处——文案措辞（解题模板 / 步骤分）与例子的渲染方式（分步解答），
      // 由 `ExamTopicDetail` 内部按数据形状与 `subjectId` 自动处理。
      case 'math-topics':
        return (
          <ExamTopicDetail
            entry={asExamTopicEntry(entry)}
            subjectId="math"
            moduleName={meta?.module.name ?? '中考题型专题'}
            storageKeyPrefix="mth"
          />
        );

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
      case 'pol-youth':
      case 'pol-moral':
      case 'pol-law':
      case 'pol-nation':
      case 'pol-world':
      case 'pol-current':
        return <PoliticsDetail entry={entry} moduleName={meta?.module.name ?? '道德与法治'} />;
      // 化学：chem-exam 里同样既有整卷也有题型专题，按数据形状分流
      case 'chem-exam':
        return 'sections' in entry.data ? (
          <ChemistryPaperDetail entry={entry as ChemPaperEntry} moduleName={meta?.module.name ?? '模拟考试'} />
        ) : (
          <ChemistryDetail entry={entry as ChemTopicEntry} moduleName={meta?.module.name ?? '化学'} />
        );
      case 'chem-matter':
      case 'chem-substance':
      case 'chem-acid':
      case 'chem-equation':
      case 'chem-experiment':
        return <ChemistryDetail entry={entry} moduleName={meta?.module.name ?? '化学'} />;
      // 物理：phy-exam 里同样既有整卷也有题型专题，按数据形状分流
      case 'phy-exam':
        return 'sections' in entry.data ? (
          <PhysicsPaperDetail entry={entry as PhysicsPaperEntry} moduleName={meta?.module.name ?? '模拟考试'} />
        ) : (
          <PhysicsDetail entry={entry as PhysicsTopicEntry} moduleName={meta?.module.name ?? '物理'} />
        );
      case 'phy-light':
      case 'phy-heat':
      case 'phy-mech':
      case 'phy-work':
      case 'phy-electric':
      case 'phy-magnet':
      case 'phy-experiment':
        return <PhysicsDetail entry={entry} moduleName={meta?.module.name ?? '物理'} />;
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
