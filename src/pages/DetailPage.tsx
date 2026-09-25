/** 详情分发：根据模块把内容交给对应的渲染器 */

import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { findEntryById } from '../data';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import { EmptyState } from '../components/common';
import { PoemDetail } from './detail/PoemDetail';
import { VocabDetail } from './detail/VocabDetail';
import { ClassicalDetail } from './detail/ClassicalDetail';
import { ReadingDetail } from './detail/ReadingDetail';
import { WritingDetail } from './detail/WritingDetail';
import { LiteratureDetail } from './detail/LiteratureDetail';
import { MathDetail } from './detail/MathDetail';

export default function DetailPage() {
  const { moduleId = 'poems', itemId = '' } = useParams();
  const { recordStudy } = useStudy();
  const entry = useMemo(() => findEntryById(itemId), [itemId]);
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    if (counted.current === entry.id) return;
    counted.current = entry.id;
    recordStudy(entry.id);
  }, [entry, recordStudy]);

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
}
