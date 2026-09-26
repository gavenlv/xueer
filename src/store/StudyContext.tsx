/**
 * 学习状态存储：进度、错题、打卡、每日统计。
 * 使用 localStorage 持久化，通过 React Context 提供给全应用。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { GradeId, ItemProgress, StudyState, WrongRecord } from '../types';
import { dateKey } from '../lib/utils';
import { applyAnswerToProgress } from '../lib/progress';
import { applyRecite } from '../lib/recite';
import { normalizeStudyState } from '../lib/sync';

const STORAGE_KEY = 'xueer.study.state.v1';

function emptyState(): StudyState {
  return {
    progress: {},
    wrong: {},
    wrongRemoved: {},
    checkins: [],
    daily: {},
    grade: '7a',
    totalSeconds: 0,
    recite: {},
  };
}

function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    // 规范化逻辑与云端合并共用（lib/sync），避免两处漂移
    return normalizeStudyState(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

function saveState(state: StudyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式或空间不足时静默失败，不影响使用 */
  }
}

const EMPTY_PROGRESS: ItemProgress = {
  studied: 0,
  correct: 0,
  total: 0,
  lastAt: 0,
  mastered: false,
};

export interface AnswerInput {
  questionId: string;
  correct: boolean;
  /** 模块 id，用于错题本归类 */
  moduleId: string;
  /** 题目所属内容标题 */
  sourceTitle: string;
  /** 归属的内容 id（可选，用于回跳） */
  sourceId?: string;
  /** 用户作答内容 */
  userAnswer: string;
}

interface StudyContextValue {
  state: StudyState;
  grade: GradeId;
  setGrade: (g: GradeId) => void;
  /** 记录一次内容学习（打开详情/卡片） */
  recordStudy: (itemId: string) => void;
  /** 记录一次背诵打卡（仅累加次数） */
  recordRecite: (itemId: string) => void;
  /** 记录一次背诵训练结果（含间隔重复排期） */
  recordReciteResult: (itemId: string, ok: boolean) => void;
  /** 切换收藏 */
  toggleStar: (itemId: string) => void;
  /** 记录一次答题 */
  recordAnswer: (input: AnswerInput) => void;
  /** 今日打卡 */
  checkin: () => void;
  /** 累加学习时长（秒） */
  addSeconds: (n: number) => void;
  /** 清空全部学习数据 */
  resetAll: () => void;
  /** 清空错题本 */
  clearWrong: () => void;
  /** 移除单条错题 */
  removeWrong: (questionId: string) => void;
  /** 用一份完整状态替换当前状态（云端合并后写回用），并立即落盘 */
  replaceState: (next: StudyState) => void;
  getProgress: (itemId: string) => ItemProgress;
  isStarred: (itemId: string) => boolean;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(() => loadState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // 防抖写盘
  useEffect(() => {
    const t = window.setTimeout(() => saveState(state), 220);
    return () => window.clearTimeout(t);
  }, [state]);

  // 跨标签页同步
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue) as StudyState);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setGrade = useCallback((g: GradeId) => {
    setState((s) => ({ ...s, grade: g }));
  }, []);

  const patchProgress = useCallback(
    (itemId: string, fn: (p: ItemProgress) => ItemProgress) => {
      setState((s) => {
        const prev = s.progress[itemId] ?? EMPTY_PROGRESS;
        return { ...s, progress: { ...s.progress, [itemId]: fn(prev) } };
      });
    },
    [],
  );

  const recordStudy = useCallback(
    (itemId: string) => {
      patchProgress(itemId, (p) => ({ ...p, studied: p.studied + 1, lastAt: Date.now() }));
    },
    [patchProgress],
  );

  const recordRecite = useCallback(
    (itemId: string) => {
      patchProgress(itemId, (p) => ({
        ...p,
        recited: (p.recited ?? 0) + 1,
        studied: p.studied + 1,
        lastAt: Date.now(),
      }));
    },
    [patchProgress],
  );

  /**
   * 记录一次背诵训练结果：累加打卡次数，并按间隔重复排下一次复习。
   * 同时把它算作一次「学习」，这样未打开详情页直接训练的内容也会进入进度。
   */
  const recordReciteResult = useCallback(
    (itemId: string, ok: boolean) => {
      const now = Date.now();
      patchProgress(itemId, (p) => ({
        ...p,
        recited: (p.recited ?? 0) + 1,
        studied: p.studied + 1,
        lastAt: now,
      }));
      setState((s) => ({
        ...s,
        recite: { ...(s.recite ?? {}), [itemId]: applyRecite(s.recite?.[itemId], ok, now) },
      }));
    },
    [patchProgress],
  );

  const toggleStar = useCallback(
    (itemId: string) => {
      patchProgress(itemId, (p) => ({ ...p, starred: !p.starred }));
    },
    [patchProgress],
  );

  const recordAnswer = useCallback((input: AnswerInput) => {
    const { questionId, correct, moduleId, sourceTitle, sourceId, userAnswer } = input;
    const today = dateKey();
    const now = Date.now();
    setState((s) => {
      const prevWrong = s.wrong[questionId];
      const nextWrong: Record<string, WrongRecord> = { ...s.wrong };
      const nextRemoved = { ...(s.wrongRemoved ?? {}) };

      if (correct) {
        // 答对后减少一次错误计数，归零即移出错题本；
        // 同时写入墓碑，让「消错」这个删除操作也能同步到云端
        if (prevWrong) {
          if (prevWrong.wrongCount <= 1) {
            delete nextWrong[questionId];
            nextRemoved[questionId] = now;
          } else {
            nextWrong[questionId] = { ...prevWrong, wrongCount: prevWrong.wrongCount - 1 };
          }
        }
      } else {
        nextWrong[questionId] = {
          questionId,
          moduleId,
          sourceTitle,
          lastAnswer: userAnswer,
          wrongCount: (prevWrong?.wrongCount ?? 0) + 1,
          lastAt: now,
        };
      }

      // 同时把这次作答累加到「内容」的进度上：
      // 模块列表的「正确率」与「已掌握」标签都依赖它，漏掉这里两处就会永远不显示。
      let progress = s.progress;
      if (sourceId) {
        const prev = s.progress[sourceId] ?? EMPTY_PROGRESS;
        progress = { ...s.progress, [sourceId]: applyAnswerToProgress(prev, correct) };
      }

      const day = s.daily[today] ?? { answered: 0, correct: 0, minutes: 0 };
      return {
        ...s,
        wrong: nextWrong,
        wrongRemoved: nextRemoved,
        progress,
        daily: {
          ...s.daily,
          [today]: {
            ...day,
            answered: day.answered + 1,
            correct: day.correct + (correct ? 1 : 0),
          },
        },
      };
    });
  }, []);

  const checkin = useCallback(() => {
    const today = dateKey();
    setState((s) =>
      s.checkins.includes(today) ? s : { ...s, checkins: [...s.checkins, today] },
    );
  }, []);

  const addSeconds = useCallback((n: number) => {
    if (n <= 0) return;
    const today = dateKey();
    setState((s) => {
      const day = s.daily[today] ?? { answered: 0, correct: 0, minutes: 0 };
      return {
        ...s,
        totalSeconds: s.totalSeconds + n,
        daily: { ...s.daily, [today]: { ...day, minutes: day.minutes + n / 60 } },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    const g = stateRef.current.grade;
    const next = emptyState();
    next.grade = g;
    setState(next);
    saveState(next);
  }, []);

  const clearWrong = useCallback(() => setState((s) => ({ ...s, wrong: {} })), []);

  const removeWrong = useCallback((questionId: string) => {
    setState((s) => {
      const next = { ...s.wrong };
      delete next[questionId];
      return { ...s, wrong: next };
    });
  }, []);

  /** 云端合并后整体写回：立即落盘，不等防抖 */
  const replaceState = useCallback((next: StudyState) => {
    setState(next);
    saveState(next);
  }, []);

  const getProgress = useCallback(
    (itemId: string) => state.progress[itemId] ?? EMPTY_PROGRESS,
    [state.progress],
  );

  const isStarred = useCallback(
    (itemId: string) => Boolean(state.progress[itemId]?.starred),
    [state.progress],
  );

  const value = useMemo<StudyContextValue>(
    () => ({
      state,
      grade: state.grade,
      setGrade,
      recordStudy,
      recordRecite,
      recordReciteResult,
      toggleStar,
      recordAnswer,
      checkin,
      addSeconds,
      resetAll,
      clearWrong,
      removeWrong,
      replaceState,
      getProgress,
      isStarred,
    }),
    [
      state,
      setGrade,
      recordStudy,
      recordRecite,
      recordReciteResult,
      toggleStar,
      recordAnswer,
      checkin,
      addSeconds,
      resetAll,
      clearWrong,
      removeWrong,
      replaceState,
      getProgress,
      isStarred,
    ],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy 必须在 StudyProvider 内使用');
  return ctx;
}

/** 连续打卡天数（含今天） */
export function useStreak(): number {
  const { state } = useStudy();
  return useMemo(() => {
    const set = new Set(state.checkins);
    let streak = 0;
    const cursor = new Date();
    // 若今天没打卡，从昨天开始算，避免显示 0 让人沮丧
    if (!set.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    for (;;) {
      if (!set.has(dateKey(cursor))) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [state.checkins]);
}
