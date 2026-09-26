/**
 * 整卷模拟考试：60 分钟、70 分，一口气做完再批改。
 *
 * 为什么单独做一个考试页，而不复用练习引擎（`QuizRunner`）：
 * 练习引擎的设计目标是「做完一题立刻看解析」，而考试的**考查对象正是时间分配与整卷节奏**——
 * 中途看到答案，这种能力就练不出来。所以这里：
 *   1. 顺序与题号固定（不给随机打乱），有**答题卡**可以跳题、回改；
 *   2. 全程只有倒计时，交卷前不给任何正误反馈；
 *   3. 时间到自动交卷；交卷后一次性批改：选择题自动判分，材料题给出参考答案与踩分点后**自评**；
 *   4. 成绩单给出「选择得分 / 材料题自评得分 / 用时」，逐题解析，错题照常进错题本。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { HistoryPaper, QuizQuestion } from '../types';
import { findPaper } from '../data/history';
import { useDataScope, DataLoading } from '../lib/useData';
import { useStudy } from '../store/StudyContext';
import { OPTION_KEYS, cn, formatClock, pct } from '../lib/utils';
import { permuteOptions } from '../lib/quiz';
import { EmptyState, ProgressBar, Tag } from '../components/common';
import { RichText } from '../components/RichText';
import { QuizLearnLinks } from '../components/QuizLearnLinks';

/** 一道题在卷面上的位置信息 */
interface Slot {
  q: QuizQuestion;
  /** 卷面序号（从 1 开始） */
  no: number;
  /** 该题分值 */
  score: number;
  /** 材料题所属的材料组序号（材料组从 1 开始）；选择题为 0 */
  group: number;
}

export default function ExamRunPage() {
  const { paperId = '' } = useParams();
  const navigate = useNavigate();
  const ready = useDataScope(['hist-exam']);
  const { recordAnswer, addSeconds } = useStudy();

  const paper: HistoryPaper | undefined = useMemo(
    () => (ready ? findPaper(paperId) : undefined),
    [ready, paperId],
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  /** 第几次开考：每次重做都换一套选项顺序 */
  const [attempt, setAttempt] = useState(0);

  /**
   * 卷面题目：选择题在前，材料题的设问在后（顺序固定，模拟真实卷面）。
   *
   * 选择题的**选项每次开考重新打乱**（与练习引擎一致）：题库里正确答案的位置本来
   * 就有分布偏差（`pnpm validate` 的「选择题答案分布」一项就是在盯这件事），
   * 若考试页按原始顺序出题，学生「全选 B」就能拿到离谱的分数。
   * 打乱只改选项次序与答案字母，选项内容与解析不变；`attempt` 变化即重新洗一次。
   */
  const slots = useMemo<Slot[]>(() => {
    if (!paper) return [];
    const choiceScore = paper.sections.find((s) => s.kind === 'choice')?.score ?? 40;
    const materialScore = paper.sections.find((s) => s.kind === 'material')?.score ?? 30;
    const choiceQs = paper.questions
      .filter((q) => q.type === 'choice')
      .map((q) => ({ ...q, ...permuteOptions(q) }));
    const perChoice = choiceQs.length ? choiceScore / choiceQs.length : 0;
    const perGroup = paper.materials.length ? materialScore / paper.materials.length : 0;

    const out: Slot[] = choiceQs.map((q, i) => ({
      q,
      no: i + 1,
      score: perChoice,
      group: 0,
    }));
    paper.materials.forEach((g, gi) => {
      const per = g.questions.length ? perGroup / g.questions.length : 0;
      g.questions.forEach((mq) => {
        out.push({
          q: {
            id: mq.id,
            type: 'short',
            stem: mq.stem,
            answer: mq.answer,
            rubric: mq.rubric,
            explanation: `【材料题 · 第 ${gi + 1} 题】材料见卷面材料${gi + 1}。答题要点：${(mq.rubric ?? []).join('；') || '见参考答案'}`,
            tags: mq.tags ?? [],
          },
          no: out.length + 1,
          score: per,
          group: gi + 1,
        });
      });
    });
    return out;
  }, [paper, attempt]);

  /** 材料题自评结果：true=基本答到 */
  const [selfGraded, setSelfGraded] = useState<Record<string, boolean>>({});
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const savedRef = useRef(false);
  const startRef = useRef(Date.now());

  const totalMinutes = paper?.duration ?? 60;
  const remaining = Math.max(0, totalMinutes * 60 - elapsed);

  /* 计时：只有开始后才走，时间到自动交卷 */
  useEffect(() => {
    if (!started || submitted) return;
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(t);
  }, [started, submitted]);

  const finish = useCallback(() => {
    setSubmitted(true);
    const secs = Math.floor((Date.now() - startRef.current) / 1000);
    if (!savedRef.current) {
      savedRef.current = true;
      if (secs > 3) addSeconds(secs);
    }
  }, [addSeconds]);

  const submit = useCallback(() => {
    if (submitted) return;
    if (!window.confirm('确定交卷吗？交卷后不能修改答案。')) return;
    finish();
  }, [finish, submitted]);

  /* 时间到自动交卷 */
  useEffect(() => {
    if (started && !submitted && elapsed >= totalMinutes * 60) finish();
  }, [elapsed, finish, started, submitted, totalMinutes]);

  /* 交卷后把每题结果写入进度与错题本（材料题以自评为准） */
  const recordedRef = useRef(false);
  useEffect(() => {
    if (!submitted || recordedRef.current) return;
    recordedRef.current = true;
    for (const s of slots) {
      const mine = answers[s.q.id] ?? '';
      const correct =
        s.q.type === 'choice' ? mine === s.q.answer : Boolean(selfGraded[s.q.id]);
      recordAnswer({
        questionId: s.q.id,
        correct,
        moduleId: 'hist-exam',
        sourceTitle: paper?.title ?? '模拟卷',
        sourceId: paper?.id ?? '',
        userAnswer: mine,
      });
    }
  }, [answers, paper, recordAnswer, selfGraded, slots, submitted]);

  if (!ready) return <DataLoading label="正在准备试卷…" />;

  if (!paper) {
    return (
      <EmptyState icon="🔍" title="没有找到这套卷子" desc="它可能已被移除，或者链接不正确。" />
    );
  }

  /* ------------------------------ 开考前 ------------------------------ */

  if (!started) {
    return (
      <div className="stack stack--lg">
        <div className="card card--pad">
          <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
            <Tag tone="gold">📝 整卷模拟</Tag>
            <span className="spacer" />
            <Link className="btn btn--sm btn--ghost" to={`/s/history/hist-exam/${paper.id}`}>
              查看试卷结构
            </Link>
          </div>
          <h1 className="page-title" style={{ marginTop: 10 }}>
            {paper.title}
          </h1>
          <div className="small muted" style={{ lineHeight: 1.85 }}>
            {paper.basis}
          </div>
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            <Tag tone="blue">{slots.length} 题</Tag>
            <Tag tone="red">{paper.totalScore} 分</Tag>
            <Tag tone="gold">{totalMinutes} 分钟</Tag>
            <Tag>闭卷</Tag>
          </div>

          <div className="divider" />

          <div className="stack stack--sm small" style={{ lineHeight: 1.9 }}>
            <div>· 考试模式下**中途不给答案**，可以跳题、回改，交卷后统一批改。</div>
            <div>· 选择题自动判分；材料题给出参考答案与踩分点后由你自己对照自评。</div>
            <div>· 时间到会自动交卷；错题照常进入错题本。</div>
          </div>

          <div className="row row--wrap" style={{ marginTop: 16 }}>
            <button
              className="btn btn--primary btn--lg"
              onClick={() => {
                startRef.current = Date.now();
                savedRef.current = false;
                setElapsed(0);
                setStarted(true);
              }}
            >
              ▶ 开始考试（{totalMinutes} 分钟）
            </button>
            <button className="btn btn--ghost" onClick={() => navigate('/s/history/hist-exam')}>
              返回模拟卷列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ 批改结果 ------------------------------ */

  if (submitted) {
    const choiceSlots = slots.filter((s) => s.q.type === 'choice');
    const shortSlots = slots.filter((s) => s.q.type !== 'choice');
    const choiceGot = choiceSlots.filter((s) => answers[s.q.id] === s.q.answer).reduce((n, s) => n + s.score, 0);
    const shortGot = shortSlots.filter((s) => selfGraded[s.q.id]).reduce((n, s) => n + s.score, 0);
    const got = choiceGot + shortGot;
    const rate = pct(Math.round(got), paper.totalScore);
    const usedMinutes = Math.floor(elapsed / 60);

    return (
      <div className="stack stack--lg">
        <div className="card card--pad">
          <div className="result-hero">
            <div className="result-hero__emoji">{rate >= 85 ? '🏆' : rate >= 70 ? '💪' : '📚'}</div>
            <div className="result-hero__score">
              {Math.round(got)} / {paper.totalScore}
            </div>
            <div className="result-hero__title">
              {rate >= 85 ? '这一卷拿得稳' : rate >= 70 ? '基础可以，细节要补' : '先回去补主干知识'}
            </div>
            <div className="result-hero__desc">
              选择题 {Math.round(choiceGot)} / {choiceSlots.reduce((n, s) => n + s.score, 0)} 分 ·
              材料题自评 {Math.round(shortGot)} / {shortSlots.reduce((n, s) => n + s.score, 0)} 分
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
              <span className="timer-pill">⏱ 用时 {formatClock(elapsed)}</span>
              <span className="timer-pill">📊 得分率 {rate}%</span>
              <span className="timer-pill">🕐 剩余 {formatClock(remaining)}</span>
            </div>
          </div>

          <div className="small muted" style={{ marginTop: 12, lineHeight: 1.85 }}>
            材料题采用自评：请逐问对照参考答案与踩分点，诚实判断。考试时间 {totalMinutes} 分钟，
            你用了 {usedMinutes} 分钟
            {usedMinutes > totalMinutes ? '（超时，考场上要练「先易后难、按分值分配时间」）' : '——节奏正常，继续保持。'}
          </div>

          <div className="divider" />
          <div className="row row--wrap">
            <button
              className="btn"
              onClick={() => {
                recordedRef.current = false;
                setAnswers({});
                setSelfGraded({});
                setSubmitted(false);
                setElapsed(0);
                setAttempt((a) => a + 1); // 重做换一套选项顺序
                startRef.current = Date.now();
              }}
            >
              🔄 重做这一卷
            </button>
            <Link className="btn btn--ghost" to="/s/history/hist-exam">
              换一套卷子
            </Link>
          </div>
        </div>

        {/* 逐题解析 */}
        <section className="card card--pad">
          <h3 className="section-title" style={{ marginBottom: 12 }}>
            <span className="section-title__bar" />
            逐题解析
          </h3>
          <div className="stack stack--sm">
            {slots.map((s) => {
              const mine = answers[s.q.id] ?? '';
              const isChoice = s.q.type === 'choice';
              const correct = isChoice ? mine === s.q.answer : Boolean(selfGraded[s.q.id]);
              return (
                <div className="review-item" key={s.q.id}>
                  <div className="review-item__head">
                    <Tag tone={correct ? 'jade' : 'red'}>
                      {s.no}. {correct ? '✔ 得分' : isChoice ? '✘ 答错' : '✘ 未答到'}
                    </Tag>
                    <span className="small muted">
                      {isChoice ? '单项选择题' : `材料题第 ${s.group} 题`} · {s.score.toFixed(1)} 分
                    </span>
                  </div>
                  <div style={{ fontWeight: 650, lineHeight: 1.75 }}>
                    <RichText text={s.q.stem} />
                  </div>
                  {isChoice ? (
                    <div className="small" style={{ marginTop: 6 }}>
                      你的答案：<b>{mine || '（未作答）'}</b>
                      {mine && mine !== s.q.answer ? (
                        <>
                          {' '}
                          · 正确答案：<b>{s.q.answer}</b>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="small" style={{ marginTop: 6, whiteSpace: 'pre-line' }}>
                      {mine ? `你的作答：${mine}` : '（未作答）'}
                    </div>
                  )}
                  <div className="small" style={{ marginTop: 6 }}>
                    参考答案：
                    <span className="explain__answer" style={{ whiteSpace: 'pre-line' }}>
                      <RichText text={s.q.answer} />
                    </span>
                  </div>
                  {s.q.rubric?.length ? (
                    <div className="rubric">
                      <div className="rubric__title">踩分点</div>
                      {s.q.rubric.map((r, i) => (
                        <div className="rubric__item" key={i}>
                          <span className="rubric__mark">◆</span>
                          <span>
                            <RichText text={r} />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="small muted" style={{ marginTop: 6, lineHeight: 1.75 }}>
                    <RichText text={s.q.explanation} />
                  </div>
                  <QuizLearnLinks item={{ ...s.q, sourceId: paper.id, sourceTitle: paper.title, moduleId: 'hist-exam' }} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------ 答题中 ------------------------------ */

  const answeredCount = slots.filter((s) => (answers[s.q.id] ?? '').trim()).length;
  const unanswered = slots.filter((s) => !(answers[s.q.id] ?? '').trim());

  return (
    <div className="stack">
      {/* 顶部：倒计时 + 进度 + 答题卡 */}
      <div className="card card--pad exam-bar">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="gold">📝 整卷模拟</Tag>
          <span className="exam-bar__clock" title="考试剩余时间">
            ⏱ {formatClock(remaining)}
          </span>
          <div style={{ flex: 1, minWidth: 120 }}>
            <ProgressBar value={answeredCount} max={slots.length} thin />
          </div>
          <span className="small muted">
            已答 {answeredCount} / {slots.length}
          </span>
          <button className="btn btn--primary btn--sm" onClick={submit}>
            📮 交卷
          </button>
        </div>

        <div className="exam-sheet">
          {slots.map((s) => {
            const done = Boolean((answers[s.q.id] ?? '').trim());
            const isChoice = s.q.type === 'choice';
            return (
              <a
                className={cn('exam-sheet__cell', done && 'is-done', !isChoice && 'is-short')}
                href={`#${s.q.id}`}
                key={s.q.id}
                title={done ? '已作答' : '未作答'}
              >
                {s.no}
              </a>
            );
          })}
        </div>
      </div>

      {/* 选择题 */}
      <section className="card card--pad">
        <h3 className="section-title">
          <span className="section-title__bar" />
          一、单项选择题（{slots.filter((s) => s.q.type === 'choice').length} 题，每题 2 分，共{' '}
          {paper.sections.find((s) => s.kind === 'choice')?.score ?? 40} 分）
        </h3>
        <div className="stack">
          {slots
            .filter((s) => s.q.type === 'choice')
            .map((s) => (
              <div className="exam-q" id={s.q.id} key={s.q.id}>
                <div className="exam-q__stem">
                  <span className="exam-q__no">{s.no}</span>
                  <RichText text={s.q.stem} />
                </div>
                <div className="options">
                  {(s.q.options ?? []).map((opt, i) => {
                    const key = OPTION_KEYS[i];
                    const picked = answers[s.q.id] === key;
                    return (
                      <button
                        key={key}
                        className={cn('option', picked && 'is-selected')}
                        onClick={() => setAnswers((a) => ({ ...a, [s.q.id]: key }))}
                      >
                        <span className="option__key">{key}</span>
                        <span style={{ flex: 1 }}>
                          <RichText text={opt} />
                        </span>
                        {picked ? <span>✔</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 材料题 */}
      <section className="card card--pad">
        <h3 className="section-title">
          <span className="section-title__bar" />
          二、非选择题（阅读材料，回答问题）（{paper.materials.length} 题，共{' '}
          {paper.sections.find((s) => s.kind === 'material')?.score ?? 30} 分）
        </h3>
        <div className="stack stack--lg">
          {paper.materials.map((g, gi) => (
            <div key={g.id}>
              <div className="history-compare__title">第 {gi + 1} 题</div>
              <div className="history-material" style={{ marginTop: 8 }}>
                <div className="history-material__label">材料</div>
                <div className="history-material__text">
                  <RichText text={g.material} />
                </div>
              </div>
              <div className="stack stack--sm" style={{ marginTop: 8 }}>
                {slots
                  .filter((s) => s.group === gi + 1)
                  .map((s) => (
                    <div className="exam-q" id={s.q.id} key={s.q.id}>
                      <div className="exam-q__stem">
                        <span className="exam-q__no">{s.no}</span>
                        <RichText text={s.q.stem} />
                      </div>
                      <textarea
                        className="input input--area"
                        placeholder="按分值分点作答（如：①……②……），注意使用历史术语"
                        value={answers[s.q.id] ?? ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [s.q.id]: e.target.value }))}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <span className="small muted">
            {unanswered.length
              ? `还有 ${unanswered.length} 题没作答：第 ${unanswered.map((s) => s.no).join('、')} 题`
              : '全部题目已作答，可以交卷了。'}
          </span>
          <span className="spacer" />
          <button className="btn btn--primary" onClick={submit}>
            📮 交卷并批改
          </button>
        </div>
      </div>
    </div>
  );
}
