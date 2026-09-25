/**
 * 背诵训练器：三级递进提示 + 自评 + 间隔重复排期。
 *
 * 训练流程：
 *   ① 通读（全文）
 *   ② 首字提示（每句只留第一个字）
 *   ③ 全遮（只看结构）
 * 学生自评「背下来了 / 没背下来」，据此决定下次复习时间。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Poem } from '../types';
import { useStudy } from '../store/StudyContext';
import { daysUntilDue, levelLabel } from '../lib/recite';
import { cn } from '../lib/utils';
import { Tag } from './common';

const STAGES = [
  { key: 0, name: '通读全文', hint: '先完整读一遍，注意停顿与语气' },
  { key: 1, name: '首字提示', hint: '每句只给第一个字，试着往下接' },
  { key: 2, name: '完全遮住', hint: '只看句子长度，整首背下来' },
] as const;

const HANZI = /[\u4e00-\u9fa5]/;

/** 把一句按提示级别遮罩：标点与英文数字保留，汉字按规则替换 */
function maskLine(line: string, stage: number): string {
  if (stage === 0) return line;
  let seenFirst = false;
  return [...line]
    .map((c) => {
      if (!HANZI.test(c)) return c;
      if (stage === 1 && !seenFirst) {
        seenFirst = true;
        return c;
      }
      return '□';
    })
    .join('');
}

export function ReciteTrainer({ poem, entryId }: { poem: Poem; entryId: string }) {
  const { state, recordReciteResult } = useStudy();
  const [stage, setStage] = useState(0);
  const [justJudged, setJustJudged] = useState<null | boolean>(null);

  const rec = state.recite?.[entryId];

  const maskedLines = useMemo(
    () => poem.lines.map((l) => maskLine(l, stage)),
    [poem.lines, stage],
  );

  const judge = (ok: boolean) => {
    recordReciteResult(entryId, ok);
    setJustJudged(ok);
  };

  const dueIn = daysUntilDue(rec);

  return (
    <section className="card recite">
      <div className="card__head">
        <span className="card__title">
          <span>🧠</span>
          背诵训练
        </span>
        <span className="spacer" />
        {rec ? (
          <span className="row" style={{ gap: 6 }}>
            <Tag tone="jade">{levelLabel(rec.level)}</Tag>
            <span className="small muted">
              已背 {rec.times} 次 · {dueIn === 0 ? '今天该复习' : `${dueIn} 天后复习`}
            </span>
          </span>
        ) : (
          <span className="small muted">还没练过，来试一次</span>
        )}
      </div>

      <div className="card__body">
        {/* 级别切换 */}
        <div className="recite__stages">
          {STAGES.map((s) => (
            <button
              key={s.key}
              className={cn('chip chip--sm', stage === s.key && 'is-active')}
              onClick={() => {
                setStage(s.key);
                setJustJudged(null);
              }}
            >
              {s.key + 1}. {s.name}
            </button>
          ))}
        </div>
        <div className="small muted" style={{ margin: '8px 0 14px' }}>
          {STAGES[stage].hint}
        </div>

        {/* 逐级遮罩的正文 */}
        <div className="recite__body">
          {maskedLines.map((line, i) => (
            <span
              key={i}
              className={cn('recite__line', stage === 2 && 'is-blank')}
              // 第 3 级：用句长提示代替原字
              aria-label={stage === 2 ? undefined : line}
            >
              {line}
            </span>
          ))}
        </div>

        {/* 自评 */}
        <div className="recite__judge">
          {justJudged === null ? (
            <>
              <div className="recite__judge-title">对着原句检查一下，你背下来了吗？</div>
              <div className="row row--wrap">
                <button className="btn btn--primary" onClick={() => judge(true)}>
                  ✅ 背下来了
                </button>
                <button className="btn" onClick={() => judge(false)}>
                  ❌ 还没背熟
                </button>
              </div>
              <div className="small muted" style={{ marginTop: 8 }}>
                诚实自评才有意义：「没背熟」会安排明天再练，「背下来」则逐渐拉长间隔。
              </div>
            </>
          ) : (
            <div className={cn('explain', justJudged ? 'explain--correct' : 'explain--wrong')} style={{ marginTop: 0 }}>
              <div className="explain__title">
                {justJudged ? '✅ 已记录：背下来了' : '❌ 已记录：还没背熟'}
              </div>
              <div style={{ lineHeight: 1.85 }}>
                {justJudged
                  ? `熟练度升到「${levelLabel(state.recite?.[entryId]?.level ?? 0)}」，${daysUntilDue(state.recite?.[entryId])} 天后再复习。`
                  : '已安排明天再练一次。先回到第 1、2 级多读几遍，再挑战全遮。'}
              </div>
            </div>
          )}
        </div>

        <div className="row row--wrap" style={{ marginTop: 14 }}>
          <Link className="btn btn--sm" to={`/practice/poems/${entryId}`}>
            ✍️ 用默写检验一遍
          </Link>
          <Link className="btn btn--sm btn--ghost" to="/recite">
            📅 今日背诵清单
          </Link>
        </div>
      </div>
    </section>
  );
}
