/**
 * 渲染冒烟测试：把每个路由在 Node 里用 renderToString 跑一遍。
 * 目的不是像素级验证，而是确保「每个页面在真实数据下都不会崩溃、不会渲染成空白」。
 */

declare const process: { exitCode: number };

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { StudyProvider } from '../src/store/StudyContext';
import { allEntries } from '../src/data';
import { allPoems } from '../src/data/chinese';
import { SUBJECTS } from '../src/data/subjects';
import { supplementsOf } from '../src/lib/relations';

/** 取某模块第一条内容的 id，用于详情页与单篇练习 */
function firstId(moduleId: string): string {
  return allEntries.find((e) => e.moduleId === moduleId)?.id ?? '';
}

const routes: string[] = [
  '/',
  // 学科页与各学科的全部模块页、详情页、练习页
  ...SUBJECTS.filter((s) => s.available).flatMap((s) => [
    `/s/${s.id}`,
    ...s.modules.flatMap((m) => [
      `/s/${s.id}/${m.id}`,
      `/s/${s.id}/${m.id}/${firstId(m.id)}`,
      `/practice/${m.id}`,
    ]),
  ]),
  '/s/chinese/nonexistent',
  '/s/math/nonexistent',
  `/practice/poems/${allPoems[0]?.id ?? ''}`,
  '/practice/poems?grade=8b',
  // 古诗词考点专项：按篇目 id 组卷默写（中考考点页的「默写这 N 首」）
  `/practice/poems?poems=${allPoems.slice(0, 3).map((p) => p.id).join(',')}`,
  '/practice/vocab?grade=9a',
  // 广州中考「整本书阅读」专项：只出简答题，覆盖简答题渲染路径
  '/practice/literature?type=short&grade=all',
  '/practice/literature?type=choice&grade=all',
  '/wrong',
  '/stats',
  // 知识拓展页：思维导图与拓展阅读两条渲染路径
  '/extras',
  // 今日背诵（间隔重复清单）
  '/recite',
  // 中考考点
  '/exam',
  '/practice/vocab?tag=%E5%BD%A2%E5%A3%B0%E5%AD%97&grade=all',
  '/this-route-does-not-exist',
];

let failed = 0;
const results: { route: string; ok: boolean; info: string }[] = [];

for (const route of routes) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <StudyProvider>
          <App />
        </StudyProvider>
      </MemoryRouter>,
    );

    // 空白检测：不能只有外壳
    if (html.length < 400) throw new Error(`输出仅 ${html.length} 字符，疑似渲染为空`);
    if (!html.includes('container')) throw new Error('缺少主内容容器');

    // 回归保护：数学相关页面不得残留未渲染的 $...$ 公式源码
    // 覆盖两条不同的渲染路径：详情页（MathDetail）与练习页（QuizRunner）
    const isMathDetail = route.startsWith('/s/math/') && route.split('/').length === 5;
    const isMathPractice = route.startsWith('/practice/math-');
    if (isMathDetail || isMathPractice) {
      const residual = html.match(/\$[^$<]{2,}\$/g);
      if (residual) {
        throw new Error(`残留未渲染的 $...$ 公式源码 ${residual.length} 处，例如 ${residual[0].slice(0, 40)}`);
      }
      results.push({
        route,
        ok: true,
        info: `${html.length} 字符 · 公式已渲染`,
      });
      continue;
    }

    // 回归保护：名著详情页必须真的渲染出思维导图节点（而不是只有标题）
    if (route.startsWith('/s/chinese/literature/') && route !== '/s/chinese/literature') {
      const nodes = html.split('mm-label__text').length - 1;
      if (nodes < 5) throw new Error(`思维导图未渲染（仅 ${nodes} 个节点）`);
      results.push({ route, ok: true, info: `${html.length} 字符 · 导图 ${nodes} 节点` });
      continue;
    }

    results.push({ route, ok: true, info: `${html.length} 字符` });
  } catch (e) {
    failed += 1;
    results.push({ route, ok: false, info: (e as Error).message.split('\n')[0] });
  }
}

console.log('\n================ 路由渲染冒烟测试 ================');
for (const r of results) {
  console.log(`  ${r.ok ? '✅' : '❌'} ${r.route.padEnd(44)} ${r.info}`);
}
console.log('  ' + '-'.repeat(62));
console.log(`  共 ${routes.length} 条路由，通过 ${routes.length - failed} 条，失败 ${failed} 条`);

/* ------------------ 接线检查：学习进度必须真的驱动 UI ------------------ */

/**
 * 「正确率」与「已掌握」两处 UI 依赖 `recordAnswer` 把作答结果写进 `progress`。
 * 曾经漏掉那次调用，导致这两处**永远不显示**，而页面照样渲染成功、冒烟测试照样通过。
 * 所以这里注入一份带完整进度的 localStorage，验证数据能真正流到界面上。
 */
const progressTarget = allEntries.find(
  (e) => e.moduleId === 'vocab' && (e.grade === '7a' || e.grade === 'all'),
);

if (!progressTarget) {
  console.log('\n❌ 接线检查：找不到用于验证的词条');
  failed += 1;
} else {
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) =>
      k.includes('xueer')
        ? JSON.stringify({
            progress: {
              [progressTarget.id]: {
                studied: 3,
                correct: 9,
                total: 10,
                lastAt: Date.now(),
                mastered: true,
              },
            },
            wrong: {},
            checkins: [],
            daily: {},
            grade: '7a',
            totalSeconds: 0,
          })
        : null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown;

  // 去掉 React 在静态文本与插值之间插入的注释分隔符
  const plain = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/vocab']}>
      <StudyProvider>
        <App />
      </StudyProvider>
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const wiringOk = plain.includes('已掌握') && plain.includes('正确率 90%');
  console.log(
    `  ${wiringOk ? '✅' : '❌'} 接线检查：进度数据驱动 UI（已掌握标签 / 正确率 90%）`,
  );
  if (!wiringOk) failed += 1;

  /* ---------------- 接线检查：学一补多必须真的出现在详情页 ---------------- */

  /**
   * `supplementsOf` 关联规则写在 lib 里，`SupplementList` 负责渲染。
   * 只跑路由渲染无法发现「组件没接进 DetailShell」这类漏接，
   * 所以这里直接断言《陋室铭》详情页真的出现了跨模块分组与跨模块链接。
   */
  const suppHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/classical/c-loushiming']}>
      <StudyProvider>
        <App />
      </StudyProvider>
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const suppChecks: [string, boolean][] = [
    ['学一补多卡片', suppHtml.includes('学一补多')],
    ['同一作品·其他模块分组', suppHtml.includes('同一作品·其他模块')],
    ['同作者分组', suppHtml.includes('同作者·刘禹锡')],
    ['同一考点分组', suppHtml.includes('同一考点')],
    ['跨模块指向古诗词模块的《陋室铭》', suppHtml.includes('/s/chinese/poems/p7b-lou-shi-ming')],
  ];

  /**
   * 分组默认只展开第一组，因此「考点专项」按钮不一定在 HTML 里。
   * 这里挑一个**第一组就带 action** 的条目，专门验证按钮真的渲染成了链接。
   */
  const actionTarget = allEntries.find(
    (e) => e.moduleId !== 'poems' && supplementsOf(e, allEntries)[0]?.action,
  );
  if (!actionTarget) {
    suppChecks.push(['存在带考点专项入口的条目', false]);
  } else {
    const actionHtml = renderToString(
      <MemoryRouter initialEntries={[`/s/chinese/${actionTarget.moduleId}/${actionTarget.id}`]}>
        <StudyProvider>
          <App />
        </StudyProvider>
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
    suppChecks.push([
      `考点专项入口（${actionTarget.title}）`,
      actionHtml.includes(`/practice/${actionTarget.moduleId}?tag=`),
    ]);
  }

  const suppOk = suppChecks.every(([, ok]) => ok);
  console.log(
    `  ${suppOk ? '✅' : '❌'} 接线检查：学一补多（${suppChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '全部分组到位'}）`,
  );
  if (!suppOk) failed += 1;

  /* ------------- 接线检查：古诗词考点必须出现在中考考点页 ------------- */

  /**
   * 古诗词不预置题目，走的是「主题/意象/作者」聚类这一套考点。
   * 只跑路由渲染看不出这一块有没有接上，所以直接断言考点页渲染出了
   * 古诗词分区与「默写这 N 首」的按篇目组卷链接。
   */
  const examHtml = renderToString(
    <MemoryRouter initialEntries={['/exam']}>
      <StudyProvider>
        <App />
      </StudyProvider>
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const examChecks: [string, boolean][] = [
    ['古诗词考点分区', examHtml.includes('古诗词背诵与默写')],
    ['按篇目组卷链接', /href="\/practice\/poems\?poems=[^"]+"/.test(examHtml)],
    ['主题类考点', examHtml.includes('主题·')],
    ['意象类考点', examHtml.includes('意象·')],
    ['作者类考点', examHtml.includes('作者·')],
  ];
  const examOk = examChecks.every(([, ok]) => ok);
  console.log(
    `  ${examOk ? '✅' : '❌'} 接线检查：古诗词考点（${examChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '五类断言全通过'}）`,
  );
  if (!examOk) failed += 1;
}

if (failed) {
  console.log('\n❌ 存在渲染失败或接线异常的页面');
  process.exitCode = 1;
} else {
  console.log('✅ 所有页面均可在真实数据下正常渲染');
}
console.log('');
