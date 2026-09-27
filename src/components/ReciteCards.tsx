/**
 * 知识点卡片：正面给提示，翻面看答案，然后自评「背了／没记住」。
 *
 * 交互刻意抄「不背单词」那一套：**先自己回忆，再翻面**——直接看答案不叫背。
 * 每次点「背了」都记一次打卡（学生看到 1 次、2 次…），并按遗忘曲线排下一次复习；
 * 连续背对到 `RECITE_MASTER_STREAK` 次即**标熟**（= 完全掌握），在学习进度里体现。
 *
 * 组件本身不产出数据：卡片来自 `lib/reciteCards.ts`，记录落在 `useStudy().recordCardRecite`。
 */

import { useState } from 'react';
import type { CardRecord, ReciteCard } from '../types';
import { useStudy } from '../store/StudyContext';
import { RichText } from './RichText';
import { Tag } from './common';
import { cn } from '../lib/utils';
import { RECITE_MASTER_STREAK, cardLevelLabel, daysUntilDue, isMastered } from '../lib/recite';

/** 熟练度三点：●●○ 一眼看出还差几次标熟 */
function MasteryDots({ rec }: { rec: CardRecord | undefined }) {
  const filled = Math.min(RECITE_MASTER_STREAK, rec?.streak ?? 0);
  return (
    <span className="rcard__dots" title={cardLevelLabel(rec)} aria-label={cardLevelLabel(rec)}>
      {Array.from({ length: RECITE_MASTER_STREAK }, (_, i) => (
        <span key={i} className={cn('rcard__dot', i < filled && 'is-on')} />
      ))}
    </span>
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
  const mastered = isMastered(rec);

  const answer = (ok: boolean) => {
    recordCardRecite(card.id, ok);
    setRevealed(false);
  };

  return (
    <div className={cn('rcard', mastered && 'is-mastered', card.key && 'is-key')}>
      <div className="rcard__head">
        <span className="rcard__kind">
          {card.key ? '★ ' : ''}
          {card.kind}
        </span>
        {showSource ? <span className="rcard__from">{card.title}</span> : null}
        <span className="spacer" />
        <MasteryDots rec={rec} />
        {mastered ? <Tag tone="jade">✅ 已标熟</Tag> : null}
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
            <span>{mastered ? '已完全掌握' : `还差 ${RECITE_MASTER_STREAK - rec.streak} 次标熟`}</span>
            <span>·</span>
            <span>
              {daysUntilDue(rec) > 0 ? `${daysUntilDue(rec)} 天后复习` : '今天该复习'}
            </span>
          </>
        ) : (
          <span>还没背过 · 背对 {RECITE_MASTER_STREAK} 次（不同三天）即标熟</span>
        )}
      </div>
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
