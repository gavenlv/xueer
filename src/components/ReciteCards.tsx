/**
 * 知识点卡片：正面给提示，翻面看答案，然后自评「背了／没记住」。
 *
 * 交互刻意抄「不背单词」那一套：**先自己回忆，再翻面**——直接看答案不叫背。
 * 每次点「背了」都记一次打卡（学生看到 1 次、2 次…），并按遗忘曲线排下一次复习；
 * 每张卡还留下**每一次背诵的明细**（第几次、什么时候、背没背下来），
 * 累计跨天有效 5 次即**已背诵**（= 完全掌握），在学习进度里体现。
 *
 * 组件本身不产出数据：卡片来自 `lib/reciteCards.ts`，记录落在 `useStudy().recordCardRecite`。
 */

import { useState } from 'react';
import type { CardRecord, ReciteCard } from '../types';
import { useStudy } from '../store/StudyContext';
import { RichText } from './RichText';
import { Tag } from './common';
import { cn } from '../lib/utils';
import {
  RECITE_TARGET_TIMES,
  cardLevelLabel,
  daysUntilDue,
  effectiveCount,
  isRecited,
} from '../lib/recite';

/** 明细里的时间：`10-06 20:31`，年份对学生没有意义 */
function fmtAt(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 熟练度点点：●●●○○ 一眼看出还差几次已背诵 */
function MasteryDots({ rec }: { rec: CardRecord | undefined }) {
  const filled = Math.min(RECITE_TARGET_TIMES, effectiveCount(rec));
  return (
    <span className="rcard__dots" title={cardLevelLabel(rec)} aria-label={cardLevelLabel(rec)}>
      {Array.from({ length: RECITE_TARGET_TIMES }, (_, i) => (
        <span key={i} className={cn('rcard__dot', i < filled && 'is-on')} />
      ))}
    </span>
  );
}

/** 每次背诵的轨迹：第几次、什么时候、背没背下来 */
function Attempts({ rec }: { rec: CardRecord }) {
  const [open, setOpen] = useState(false);
  const attempts = rec.attempts ?? [];
  if (!attempts.length) return null;
  /**
   * 明细只保留最近若干条，编号必须**接着总数往前推**，不能从 1 重新数——
   * 否则第 25 次会被显示成「第 5 次」，学生看到的轨迹就假了。
   */
  const offset = Math.max(0, rec.times - attempts.length);
  return (
    <div className="stack stack--sm" style={{ marginTop: 8 }}>
      <button className="btn btn--sm btn--ghost" onClick={() => setOpen((v) => !v)}>
        {open ? '收起背诵明细' : `查看背诵明细（${rec.times} 次）`}
      </button>
      {open ? (
        <div className="stack stack--sm fade-in">
          {attempts.map((a, i) => (
            <div className="row small" key={`${a.at}-${i}`} style={{ gap: 8 }}>
              <span className="muted" style={{ minWidth: 62 }}>
                第 {offset + i + 1} 次
              </span>
              <span>{fmtAt(a.at)}</span>
              <span>{a.ok ? '✅ 背了' : '❌ 没记住'}</span>
              {!a.counted ? <span className="muted">同日重复打卡，不计入有效次数</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ReciteCardItem({
  card,
  showSource = false,
}: {
  card: ReciteCard;
  /** 跨条目的清单（背诵页）要标出来源，单条目详情页里就是冗余的 */
  showSource?: boolean;
}) {
  const { state, recordCardRecite } = useStudy();
  const [revealed, setRevealed] = useState(false);
  const rec = state.cards?.[card.id];
  const recited = isRecited(rec);

  const answer = (ok: boolean) => {
    recordCardRecite(card.id, ok);
    setRevealed(false);
  };

  return (
    <div className={cn('rcard', recited && 'is-mastered', card.key && 'is-key')}>
      <div className="rcard__head">
        <span className="rcard__kind">
          {card.key ? '★ ' : ''}
          {card.kind}
        </span>
        {showSource ? <span className="rcard__from">{card.title}</span> : null}
        <span className="spacer" />
        <MasteryDots rec={rec} />
        {recited ? <Tag tone="jade">✅ 已背诵</Tag> : null}
      </div>

      <div className="rcard__front">
        <RichText text={card.front} />
      </div>

      {revealed ? (
        <div className="rcard__answer fade-in">
          <div className="rcard__back">
            <RichText text={card.back} block />
          </div>
          {card.note ? (
            <div className="rcard__note">
              <RichText text={card.note} />
            </div>
          ) : null}
          {card.points?.length ? (
            <div className="rubric">
              <div className="rubric__title">踩分点（答到这几处才给满分）</div>
              {card.points.map((p, i) => (
                <div className="rubric__item" key={i}>
                  <span className="rubric__mark">◆</span>
                  <span>
                    <RichText text={p} />
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            <button className="btn btn--sm btn--primary" onClick={() => answer(true)}>
              ✅ 背了
            </button>
            <button className="btn btn--sm" onClick={() => answer(false)}>
              ❌ 没记住
            </button>
          </div>
        </div>
      ) : (
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <button className="btn btn--sm btn--outline" onClick={() => setRevealed(true)}>
            看答案
          </button>
        </div>
      )}

      <div className="rcard__meta">
        {rec && rec.times > 0 ? (
          <>
            <span>已背 {rec.times} 次</span>
            <span>·</span>
            <span>
              {recited
                ? '已背诵（完全掌握）'
                : `有效 ${effectiveCount(rec)} / ${RECITE_TARGET_TIMES} 次`}
            </span>
            <span>·</span>
            <span>{daysUntilDue(rec) > 0 ? `${daysUntilDue(rec)} 天后复习` : '今天该复习'}</span>
          </>
        ) : (
          <span>还没背过 · 每天最多算 1 次，累计背满 {RECITE_TARGET_TIMES} 次即已背诵</span>
        )}
      </div>

      {rec && rec.times > 0 ? <Attempts rec={rec} /> : null}
    </div>
  );
}

/**
 * 一组卡片。默认最多渲染 `limit` 张，其余折叠——历史一个模块就有几百个时间点，
 * 一次性铺开既卡又让人望而生畏。
 */
export function ReciteCardGroup({
  cards,
  showSource = false,
  limit = 40,
}: {
  cards: ReciteCard[];
  showSource?: boolean;
  limit?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? cards : cards.slice(0, limit);

  return (
    <div className="stack stack--sm">
      {list.map((c) => (
        <ReciteCardItem key={c.id} card={c} showSource={showSource} />
      ))}
      {cards.length > limit && !showAll ? (
        <div className="row center">
          <button className="btn btn--sm" onClick={() => setShowAll(true)}>
            展开其余 {cards.length - limit} 张
          </button>
        </div>
      ) : null}
    </div>
  );
}