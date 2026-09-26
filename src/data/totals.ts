/**
 * 由**轻量清单**推导的规模统计（首页、学科页用）。
 *
 * 与 `data/index.ts` 里的 `statsOfModule` / `statsOfSubject` 的区别：
 * 那两个函数要在**已加载的内容数据**上统计，因此调用方必须先 `useDataScope(...)`；
 * 而首页与学科页只是「总览」，不该为了几个数字把全部正文下载下来，
 * 所以它们改用这里基于 `data/summary.ts` 的版本。
 *
 * 两边的数字必须一致——`pnpm validate` 会逐项比对清单与真实数据，不一致直接报错。
 */

import type { ModuleId } from '../types';
import { MODULE_TOTALS } from './summary';
import { moduleIdsOfSubject } from './index';

export interface Totals {
  entries: number;
  questions: number;
  mindMaps: number;
  extensions: number;
}

const EMPTY: Totals = { entries: 0, questions: 0, mindMaps: 0, extensions: 0 };

const BY_MODULE = new Map<string, Totals>(MODULE_TOTALS.map((m) => [m.id, m]));

/** 某模块的规模（条数/题量/导图/拓展） */
export function totalsOfModule(moduleId: ModuleId | string): Totals {
  return BY_MODULE.get(moduleId) ?? EMPTY;
}

/** 某学科的规模：把它的模块加总 */
export function totalsOfSubject(subjectId: string): Totals {
  return moduleIdsOfSubject(subjectId).reduce<Totals>((acc, mid) => {
    const t = totalsOfModule(mid);
    return {
      entries: acc.entries + t.entries,
      questions: acc.questions + t.questions,
      mindMaps: acc.mindMaps + t.mindMaps,
      extensions: acc.extensions + t.extensions,
    };
  }, { ...EMPTY });
}
