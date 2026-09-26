/**
 * 练习引擎：选择/填空判分、即时解析、计时、结果页与错题重做。
 * 所有模块共用同一套实现。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ModuleId, QuizItem } from '../types';
import { useStudy } from '../store/StudyContext';
import {
  OPTION_KEYS,
  answerModeFor,
  checkFill,
  cn,
  formatClock,
  pct,
  scoreComment,
  shuffle,
} from '../lib/utils';
import { permuteOptions } from '../lib/quiz';
import { ProgressBar, Tag } from './common';
import { RichText } from './RichText';

interface Record0 {
  user: string;
  correct: boolean;
}

export interface QuizRunnerProps {
  items: QuizItem[];
  title: string;
  moduleId: ModuleId;
  /** 练习结束后「返回」按钮的地址 */
  backTo: string;
  /** 结果页附加操作 */
  onFinish?: (result: { correct: number; total: number }) => void;
  /** 每轮题数（用于分组提示） */
  sessionSize?: number;
}

export function QuizRunner({
  items,
  title,
  moduleId,
  backTo,
  onFinish,
}: QuizRunnerProps) {
  const navigate = useNavigate();
  const { recordAnswer, addSeconds } = useStudy();

  const [session, setSession] = useState<QuizItem[]>(() =>
    shuffle(items).map((q) => ({ ...q, ...permuteOptions(q) })),
  );
  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState<Record<string, Record0>>({});
  const [draft, setDraft] = useState('');
  const [answered, setAnswered] = useState(false);
  /** 简答题专用：已对照参考答案完成自评 */
  const [selfGraded, setSelfGraded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef(Date.now());
  const savedRef = useRef(false);

  const current = session[index];
  const total = session.length;

  /* ------------------------------ 计时 ------------------------------ */
  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, [finished]);

  /* 离开时结算学习时长 */
  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      savedRef.current = true;
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      if (secs > 3) addSeconds(secs);
    };
  }, [addSeconds]);

  const score = useMemo(() => {
    const list = Object.values(records);
    return { correct: list.filter((r) => r.correct).length, total: list.length };
  }, [records]);

  /* 完成一次练习时通知外部（只在 finish 翻转的那一次触发） */
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (finished && !notifiedRef.current) {
      notifiedRef.current = true;
      onFinish?.({ correct: score.correct, total: score.total });
    }
    if (!finished) notifiedRef.current = false;
  }, [finished, onFinish, score.correct, score.total]);

  /**
   * 记录一次作答（简答题由学生自评后调用）。
   *
   * 注意：这里**不**调用 `recordStudy`。
   * `studied` 的语义是「打开该内容的次数」，由详情页负责累加；
   * 若答题也累加，做 15 道练习就会显示「学习 15 次」，与字面不符。
   * 作答对进度的影响由 `recordAnswer` 内部写入（答题数、正确率、已掌握、最近时间）。
   */
  const record = useCallback(
    (userAnswer: string, correct: boolean) => {
      if (!current) return;
      setRecords((r) => ({ ...r, [current.id]: { user: userAnswer, correct } }));
      recordAnswer({
        questionId: current.id,
        correct,
        moduleId,
        sourceTitle: current.sourceTitle,
        sourceId: current.sourceId,
        userAnswer,
      });
    },
    [current, moduleId, recordAnswer],
  );

  /** 选择题 / 填空题：立即判分 */
  const submit = useCallback(
    (userAnswer: string) => {
      if (!current || answered) return;
      const correct =
        current.type === 'choice'
          ? userAnswer === current.answer
          : // 判分模式按题目自动选择：数学与断句题保留标点，其余忽略标点
            checkFill(userAnswer, current.answer, answerModeFor(moduleId, current.answer));
      setAnswered(true);
      setDraft(userAnswer);
      record(userAnswer, correct);
    },
    [answered, current, moduleId, record],
  );

  /** 简答题：先揭示参考答案与踩分点，等待学生自评（主观题无法自动判分） */
  const revealShort = useCallback(() => {
    if (!current || answered) return;
    setAnswered(true);
  }, [answered, current]);

  /** 简答题自评结果 */
  const selfGrade = useCallback(
    (correct: boolean) => {
      if (!current || selfGraded) return;
      setSelfGraded(true);
      record(draft.trim(), correct);
    },
    [current, draft, record, selfGraded],
  );

  const next = useCallback(() => {
    setAnswered(false);
    setSelfGraded(false);
    setDraft('');
    if (index + 1 >= total) {
      setFinished(true);
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      if (!savedRef.current) {
        savedRef.current = true;
        if (secs > 3) addSeconds(secs);
      }
      return;
    }
    setIndex((i) => i + 1);
  }, [addSeconds, index, total]);

  const restart = useCallback((list: QuizItem[]) => {
    savedRef.current = false;
    startRef.current = Date.now();
    setSession(shuffle(list).map((q) => ({ ...q, ...permuteOptions(q) })));
    setIndex(0);
    setRecords({});
    setDraft('');
    setAnswered(false);
    setSelfGraded(false);
    setFinished(false);
    setElapsed(0);
  }, []);

  /* ------------------------------ 结果页 ------------------------------ */
  if (finished) {
    const rate = pct(score.correct, score.total);
    const comment = scoreComment(rate);
    const wrongItems = session.filter((q) => records[q.id] && !records[q.id].correct);

    return (
      <div className="stack slide-up">
        <div className="card card--pad">
          <div className="result-hero">
            <div className="result-hero__emoji">{comment.emoji}</div>
            <div className="result-hero__score">{rate}%</div>
            <div className="result-hero__title">{comment.title}</div>
            <div className="result-hero__desc">{comment.desc}</div>
            <div
              className="row"
              style={{ justifyContent: 'center', gap: 18, marginTop: 20, flexWrap: 'wrap' }}
            >
              <span className="timer-pill">✅ 答对 {score.correct} 题</span>
              <span className="timer-pill">❌ 答错 {score.total - score.correct} 题</span>
              <span className="timer-pill">⏱ 用时 {formatClock(elapsed)}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="row row--wrap" style={{ justifyContent: 'center' }}>
            <button className="btn btn--primary" onClick={() => restart(items)}>
              🔄 再来一组
            </button>
            {wrongItems.length > 0 ? (
              <button className="btn" onClick={() => restart(wrongItems)}>
                🎯 只练错题（{wrongItems.length}）
              </button>
            ) : null}
            <button className="btn btn--ghost" onClick={() => navigate(backTo)}>
              返回
            </button>
          </div>
        </div>

        {wrongItems.length > 0 ? (
          <div className="card card--pad">
            <h3 className="section-title" style={{ marginBottom: 12 }}>
              <span className="section-title__bar" />
              错题回顾
            </h3>
            {wrongItems.map((q) => {
              const rec = records[q.id];
              return (
                <div className="review-item" key={q.id}>
                  <div className="review-item__head">
                    <Tag tone="blue">{q.sourceTitle}</Tag>
                    <span>
                      {q.type === 'choice' ? '选择题' : q.type === 'short' ? '简答题' : '填空题'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 650, lineHeight: 1.7 }}>
                    <RichText text={q.stem} />
                  </div>
                  <div className="small" style={{ marginTop: 8 }}>
                    你的作答：
                    <span style={{ color: 'var(--c-red)', fontWeight: 700, whiteSpace: 'pre-line' }}>
                      {q.type === 'choice' ? (
                        <>
                          {rec?.user ?? '—'}.{' '}
                          <RichText
                            text={q.options?.[OPTION_KEYS.indexOf(rec?.user as 'A')] ?? ''}
                          />
                        </>
                      ) : (
                        <RichText text={rec?.user || '（空）'} />
                      )}
                    </span>
                  </div>
                  <div className="small" style={{ marginTop: 4 }}>
                    {q.type === 'short' ? '参考答案：' : '正确答案：'}
                    <span className="explain__answer" style={{ whiteSpace: 'pre-line' }}>
                      {q.type === 'choice' ? (
                        <>
                          {q.answer}.{' '}
                          <RichText text={q.options?.[OPTION_KEYS.indexOf(q.answer as 'A')] ?? ''} />
                        </>
                      ) : q.type === 'short' ? (
                        <RichText text={q.answer} />
                      ) : (
                        <RichText text={q.answer.split('|')[0]} />
                      )}
                    </span>
                  </div>
                  <div className="small muted" style={{ marginTop: 8, lineHeight: 1.75 }}>
                    <RichText text={q.explanation} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card card--pad center">
            <div style={{ fontSize: 30 }}>🎊</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>全部答对，无可挑剔！</div>
            <div className="small muted" style={{ marginTop: 4 }}>
              错题本里没有新增记录，继续保持。
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card card--pad center">
        <div style={{ fontSize: 30 }}>🗂️</div>
        <div style={{ fontWeight: 700, marginTop: 6 }}>这里暂时没有可练习的题目</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          换个模块或学段试试。
        </div>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate(backTo)}>
          返回
        </button>
      </div>
    );
  }

  const rec = records[current.id];
  const correctKey = current.answer;
  const isShort = current.type === 'short';
  /** 简答题要等学生自评后才算完成，其它题型作答即完成 */
  const graded = isShort ? selfGraded : answered;

  return (
    <div className="stack">
      {/* 顶部进度 */}
      <div className="quiz__header">
        <span className="quiz__counter">
          {index + 1} / {total}
        </span>
        <div style={{ flex: 1 }}>
          <ProgressBar value={index + (graded ? 1 : 0)} max={total} thin />
        </div>
        <span className="timer-pill">⏱ {formatClock(elapsed)}</span>
      </div>

      <div className="card card--pad slide-up" key={current.id}>
        <div className="row row--wrap" style={{ marginBottom: 10 }}>
          <Tag tone="gold">{title}</Tag>
          <Tag>{current.sourceTitle}</Tag>
          {current.difficulty ? (
            <Tag tone={current.difficulty === 3 ? 'red' : current.difficulty === 2 ? 'gold' : 'jade'}>
              难度 {'★'.repeat(current.difficulty)}
            </Tag>
          ) : null}
        </div>

        <div className="quiz__stem" style={{ whiteSpace: 'pre-line' }}>
          <RichText text={current.stem} />
        </div>
        <div className="quiz__prompt">
          {current.type === 'choice'
            ? '选出最恰当的一项'
            : current.type === 'short'
              ? '写下你的答案，再对照参考答案自评'
              : '填写答案后按回车提交'}
        </div>

        {current.type === 'choice' ? (
          <div className="options">
            {(current.options ?? []).map((opt, i) => {
              const key = OPTION_KEYS[i];
              const isCorrectOption = answered && key === correctKey;
              const isWrongPick = answered && rec && !rec.correct && key === rec.user;
              const isPicked = !answered && draft === key;
              return (
                <button
                  key={key}
                  className={cn(
                    'option',
                    isPicked && 'is-selected',
                    isCorrectOption && 'is-correct',
                    isWrongPick && 'is-wrong',
                  )}
                  disabled={answered}
                  onClick={() => submit(key)}
                >
                  <span className="option__key">{key}</span>
                  <span style={{ flex: 1 }}>
                    <RichText text={opt} />
                  </span>
                  {isCorrectOption ? <span>✔</span> : null}
                  {isWrongPick ? <span>✘</span> : null}
                </button>
              );
            })}
          </div>
        ) : isShort ? (
          /* ---------------------------- 简答题 ---------------------------- */
          <div className="stack stack--sm">
            <textarea
              className="input input--area"
              value={draft}
              disabled={answered}
              placeholder="在此写下你的答案，尽量分点作答（如：①……②……）"
              onChange={(e) => setDraft(e.target.value)}
            />
            {!answered ? (
              <button
                className="btn btn--primary btn--block"
                disabled={!draft.trim()}
                onClick={revealShort}
              >
                对照参考答案
              </button>
            ) : null}
          </div>
        ) : (
          <div className="stack stack--sm">
            <input
              className={cn(
                'input input--lg',
                answered && rec?.correct && 'input--correct',
                answered && rec && !rec.correct && 'input--wrong',
              )}
              value={draft}
              autoFocus
              disabled={answered}
              placeholder="在此作答"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !answered && draft.trim()) submit(draft.trim());
              }}
            />
            {!answered ? (
              <button
                className="btn btn--primary btn--block"
                disabled={!draft.trim()}
                onClick={() => submit(draft.trim())}
              >
                提交答案
              </button>
            ) : null}
          </div>
        )}

        {/* 简答题：参考答案 + 踩分点 + 自评 */}
        {isShort && answered ? (
          <div className="explain fade-in">
            <div className="explain__title">📖 参考答案</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              <RichText text={current.answer} />
            </div>

            {current.rubric?.length ? (
              <div className="rubric">
                <div className="rubric__title">踩分点（对照检查自己答到了几条）</div>
                {current.rubric.map((r, i) => (
                  <div className="rubric__item" key={i}>
                    <span className="rubric__mark">◆</span>
                    <span>
                      <RichText text={r} />
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {!selfGraded ? (
              <div className="selfcheck">
                <div className="selfcheck__title">对照之后，给自己一个判断：</div>
                <div className="row row--wrap">
                  <button className="btn btn--primary" onClick={() => selfGrade(true)}>
                    ✅ 基本答到了
                  </button>
                  <button className="btn" onClick={() => selfGrade(false)}>
                    ❌ 没答到 / 答不全
                  </button>
                </div>
                <div className="small muted" style={{ marginTop: 8 }}>
                  诚实自评才能让错题本真正帮到你。
                </div>
              </div>
            ) : (
              <div className="fade-in">
                <div className="explain__title" style={{ marginTop: 14 }}>
                  {rec?.correct ? <span>✅ 已记为答对</span> : <span>❌ 已记入错题本</span>}
                </div>
                <div style={{ lineHeight: 1.85 }}>
                  <RichText text={current.explanation} />
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isShort && answered && rec ? (
          <div
            className={cn('explain fade-in', rec.correct ? 'explain--correct' : 'explain--wrong')}
          >
            <div className="explain__title">
              {rec.correct ? <span>✅ 回答正确</span> : <span>❌ 答错了</span>}
            </div>
            {!rec.correct ? (
              <div style={{ marginBottom: 8 }}>
                正确答案：
                <span className="explain__answer">
                  {current.type === 'choice' ? (
                    <>
                      {correctKey}.{' '}
                      <RichText
                        text={current.options?.[OPTION_KEYS.indexOf(correctKey as 'A')] ?? ''}
                      />
                    </>
                  ) : (
                    <RichText text={correctKey.split('|')[0]} />
                  )}
                </span>
              </div>
            ) : null}
            <div style={{ lineHeight: 1.85 }}>
              <RichText text={current.explanation} />
            </div>
            {current.tags?.length ? (
              <div className="row row--wrap" style={{ marginTop: 10 }}>
                {current.tags.slice(0, 4).map((t) => (
                  <Tag key={t}>#{t}</Tag>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {graded ? (
          <div style={{ marginTop: 16 }}>
            <button className="btn btn--primary btn--block btn--lg" onClick={next}>
              {index + 1 >= total ? '查看结果 →' : '下一题 →'}
            </button>
          </div>
        ) : null}
      </div>

      <button className="btn btn--ghost" onClick={() => navigate(backTo)}>
        ← 退出练习
      </button>
    </div>
  );
}
