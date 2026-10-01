/**
 * 「按学期 · 单元章节」的组织方式。
 *
 * ## 为什么要有第二种看法
 *
 * 学科页默认按**模块**组织（数与代数、图形与几何、中考专题……），那个顺序是按
 * 中考复习的需要排的；非初三的学生更习惯按「这学期学到哪一单元了」找内容。
 * 两种看法共用同一批数据，这里只负责**重排**，不复制内容。
 *
 * ## 三个必须做对的地方（都是踩过的坑）
 *
 *   ① **顺序必须按章号**，不能按数据先后。条目是**按模块**串联起来的
 *      （数与代数 → 图形与几何 → 统计与概率），而模块会横跨整册：
 *      物理八下的模块文件里「第 1 章」后面紧跟着「第 6 章」，化学的单元是
 *      第三 → 第四 → 第二 → 第六 → 第五。照数据先后排，学生看到的是乱序目录。
 *   ② **同一章要合并**：同一章在数据里有多种写法（「人教版八上 · 第 17 章 因式分解」
 *      与「人教版八上 · 第17章 因式分解」），按字符串分组会拆成两组、内容各占一半。
 *      因此分组的键是**解析出来的章号**，显示名取第一个出现的写法。
 *   ③ **教材有、本站没写内容的单元不能跳过**：直接按数据分组，「第 3 章 代数式」
 *      这种还没录内容的章会整个消失，学生以为这一章不存在（作者也看不到待补清单）。
 *      所以按册的章号范围补出占位单元，标记 `empty` 由页面灰度显示。
 *
 * 章号范围表在 `src/data/textbook.ts`：数学、物理、化学的章号是**跨册连续编号**
 * （数学 1—34），光看某一册的数据推不出「这册应该有几章」，得有一份小表。
 */
import { getModuleMeta } from '../data/subjects';
import { TEXTBOOK_SERIALS } from '../data/textbook';
import type { Entry, GradeId } from '../types';

/** 条目上「单元／章节」的文字；取不到时回落到模块名 */
export function unitLabelOf(e: Entry): string {
  const d = e.data as unknown as { unit?: string; chapter?: string } | undefined;
  const raw = d?.unit?.trim() || d?.chapter?.trim() || '';
  if (raw) return raw;
  // getModuleMeta 返回 { subject, module }：这里要的是模块自己的名字
  return getModuleMeta(e.moduleId)?.module.name ?? '本册内容';
}

/* ------------------------------------------------------------------ */
/* 章号的解析                                                          */
/* ------------------------------------------------------------------ */

const CN_DIGITS: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
};

/** 「十一」→ 11、「二十三」→ 23、「三」→ 3；解析不出来返回 null */
export function chineseNumber(s: string): number | null {
  if (/^[0-9]+$/.test(s)) return Number(s);
  const m = /^([一二三四五六七八九])?十([一二三四五六七八九])?$/.exec(s);
  if (m) return (m[1] ? CN_DIGITS[m[1]] : 1) * 10 + (m[2] ? CN_DIGITS[m[2]] : 0);
  return CN_DIGITS[s] ?? null;
}

/** 数字 → 中文（1—99），只为占位单元标题与数据里的「第三单元」保持同一种写法 */
export function chineseNumberText(n: number): string {
  const d = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n < 10) return d[n];
  if (n < 20) return `十${n % 10 ? d[n % 10] : ''}`;
  return `${d[Math.floor(n / 10)]}十${n % 10 ? d[n % 10] : ''}`;
}

export interface UnitRef {
  kind: '章' | '单元' | '节' | '';
  /** 标签里涉及的全部编号：`第1章 有理数、第2章 有理数的运算` 覆盖 1 与 2 */
  numbers: number[];
}

/**
 * 从单元标签里解析出编号。
 *
 * 支持三种真实出现的写法：
 *   · 「第 15 章 电流和电路」「第15章 电流和电路」（带或不带空格）；
 *   · 「第十一单元 盐 化肥」（中文数字）；
 *   · 「第 18—19 章 焦耳定律与生活用电」「第1章 有理数、第2章 有理数的运算」
 *     （一个标签覆盖多章，`numbers` 返回全部编号，排序键取最小值）。
 */
export function unitRefOf(label: string): UnitRef {
  const re = /第\s*([0-9]+|[一二三四五六七八九十]+)\s*(?:[—\-~至]\s*([0-9]+|[一二三四五六七八九十]+)\s*)?(章|单元|节)/g;
  const numbers: number[] = [];
  let kind: UnitRef['kind'] = '';
  for (const m of label.matchAll(re)) {
    const a = chineseNumber(m[1]);
    if (a !== null) numbers.push(a);
    if (m[2]) {
      const b = chineseNumber(m[2]);
      // 范围写法（18—19）把中间的章号也补全，避免它们被当成「缺内容」再补一次
      if (b !== null && a !== null && b > a && b - a < 20) {
        for (let n = a + 1; n <= b; n += 1) numbers.push(n);
      }
    }
    if (!kind) kind = m[3] as UnitRef['kind'];
  }
  return { kind, numbers: [...new Set(numbers)].sort((x, y) => x - y) };
}

/* ------------------------------------------------------------------ */
/* 分组与排序                                                          */
/* ------------------------------------------------------------------ */

export interface UnitGroup {
  /** 章号（一个标签覆盖多章时取最小章号）；没有编号的类别为 null */
  no: number | null;
  kind: UnitRef['kind'];
  /** 显示名：取数据里第一次出现的写法；补出来的占位单元用「第 N 章」 */
  label: string;
  entries: Entry[];
  /** 教材里有、本站还没写内容 → 页面灰度显示成待补条目 */
  empty: boolean;
  /** 这一组覆盖到的全部章号（`第16章…、第17章…` 这类合写标签会覆盖多章） */
  numbers: number[];
}

/**
 * 本册应有哪些章号（含没写内容的）。
 *
 * 优先用 `textbook.ts` 的范围表（数学、物理、化学是跨册连续编号，不查表推不出来）；
 * 表里没有的学科走兜底：以本册数据出现的最大章号为上界、从 1 起补内部缺口——
 * 历史、道法这类「每册单元号各自从 1 开始」的科目用这条就够了，
 * 不会跨册串号，也不需要凭记忆写一份教材目录。
 */
function serialRangeOf(
  subjectId: string,
  grade: GradeId | 'all',
  observed: UnitGroup[],
): { kind: UnitRef['kind']; from: number; to: number } | null {
  const conf = TEXTBOOK_SERIALS[subjectId];
  const numbered = observed.filter((g) => g.no !== null);
  if (!numbered.length) return null;
  const range = grade === 'all' ? undefined : conf?.terms[grade as GradeId];
  if (range) return { kind: conf!.kind, from: range[0], to: range[1] };
  const max = Math.max(...numbered.map((g) => g.no as number));
  if (max < 2) return null;
  return { kind: numbered[0].kind, from: 1, to: max };
}

/**
 * 把条目组织成「按章号排序、缺内容也占位」的单元列表。
 *
 * 排序规则：
 *   ① 有章号的按章号升序（`第 18—19 章` 取 18，正好落在第 18 章后面）；
 *   ② 没有章号的类别（数学的「应用题 · 行程」、物理的「实验操作考试…」）
 *      排在编号单元之后，内部保持数据顺序——它们本就不是教材章，不该插进目录中间；
 *   ③ 章号相同、写法不同的合并，显示名取第一个出现的写法。
 */
export function groupByUnit(
  entries: Entry[],
  subjectId: string,
  grade: GradeId | 'all',
): UnitGroup[] {
  const groups: UnitGroup[] = [];
  /** 章号 → 所属组（用来把「第16章…、第17章…」这类合写标签并回同一章） */
  const byNumber = new Map<number, UnitGroup>();
  /** 没有编号的类别按标签各自成组 */
  const byLabel = new Map<string, UnitGroup>();

  for (const e of entries) {
    const label = unitLabelOf(e);
    const ref = unitRefOf(label);
    let host: UnitGroup | undefined;
    if (ref.numbers.length) {
      // 与已存在的组**章号相交**就并入它（取章号更小的那个当主组）
      for (const n of ref.numbers) {
        const g = byNumber.get(n);
        if (g && (host === undefined || (g.no ?? Infinity) < (host.no ?? Infinity))) host = g;
      }
    } else {
      host = byLabel.get(label);
    }
    if (!host) {
      host = {
        no: ref.numbers.length ? ref.numbers[0] : null,
        kind: ref.kind,
        label,
        entries: [],
        empty: false,
        numbers: [],
      };
      groups.push(host);
      if (!ref.numbers.length) byLabel.set(label, host);
    }
    host.entries.push(e);
    for (const n of ref.numbers) {
      if (!host.numbers.includes(n)) host.numbers.push(n);
      byNumber.set(n, host);
    }
  }

  // 教材有、本站没写内容的章号补成占位单元（第 3 章、第 22 章这类不再凭空消失）
  const range = serialRangeOf(subjectId, grade, groups);
  if (range) {
    const covered = new Set<number>();
    for (const g of groups) for (const n of g.numbers) covered.add(n);
    for (let n = range.from; n <= range.to; n += 1) {
      if (covered.has(n)) continue;
      groups.push({
        no: n,
        kind: range.kind,
        // 占位标题只写章号、不替教材编章名；化学的单元用中文数字（第三单元），与数据一致
        label:
          range.kind === '单元'
            ? `第${chineseNumberText(n)}单元（本站暂无内容）`
            : `第${n}章（本站暂无内容）`,
        entries: [],
        empty: true,
        numbers: [n],
      });
    }
  }

  // 有章号的按章号升序；没有章号的（应用题、实验操作…）排在最后，保持数据顺序
  return groups.sort((a, b) => {
    if (a.no !== null && b.no !== null) return a.no - b.no;
    if (a.no !== null) return -1;
    if (b.no !== null) return 1;
    return 0;
  });
}
