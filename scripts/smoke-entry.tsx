/**
 * 渲染冒烟测试：把每个路由在 Node 里用 renderToString 跑一遍。
 * 目的不是像素级验证，而是确保「每个页面在真实数据下都不会崩溃、不会渲染成空白」。
 */

declare const process: { exitCode: number };

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { AuthProvider } from '../src/auth/AuthContext';
import { StudyProvider } from '../src/store/StudyContext';
import { allEntries, ensureAll, entryIndex } from '../src/data';
import { allPoems } from '../src/data/chinese';
import { SUBJECTS } from '../src/data/subjects';
import { QuizLearnLinks } from '../src/components/QuizLearnLinks';
import { supplementsOf } from '../src/lib/relations';
import { relOfEntry, relPool } from '../src/lib/relNode';
import { makeReciteQuestions } from '../src/lib/quiz';

/**
 * 内容数据改为按需加载后，页面会先看「本页需要的模块是否已就绪」。
 * 冒烟测试在校验前一次性加载全部数据，于是 `isScopeReady` 首帧即为真，
 * 页面直接渲染真实内容——所以下面的「渲染出真实内容」类断言依旧有效。
 */
await ensureAll();

/** 取某模块第一条内容的 id，用于详情页与单篇练习 */
function firstId(moduleId: string): string {
  return allEntries.find((e) => e.moduleId === moduleId)?.id ?? '';
}

/**
 * 冒烟渲染树：与线上 main.tsx 的 Provider 嵌套保持一致。
 * 账户页/学习报告页会用 useAuth，缺了 AuthProvider 会直接抛错。
 */
function AppWithProviders() {
  return (
    <AuthProvider>
      <StudyProvider>
        <App />
      </StudyProvider>
    </AuthProvider>
  );
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
  // 账户页（云端未配置时渲染降级提示）
  '/account',
  // 知识拓展页：思维导图与拓展阅读两条渲染路径
  '/extras',
  // 今日背诵（间隔重复清单）
  '/recite',
  // 中考考点
  '/exam',
  // 历史：考点与考情总复习页 + 整卷模拟考试（开考前页）
  '/history-review',
  '/exam-run/paper-01',
  '/exam-run/不存在的卷子',
  '/practice/vocab?tag=%E5%BD%A2%E5%A3%B0%E5%AD%97&grade=all',
  '/this-route-does-not-exist',
];

let failed = 0;
const results: { route: string; ok: boolean; info: string }[] = [];

for (const route of routes) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <AppWithProviders />
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

    // 回归保护：名著详情页必须真的接上思维导图（而不是只有标题）
    // 导图卡片现在默认收起，正文节点不在首屏 HTML 里，因此改为断言：
    // 标题行上写着节点数（说明导图数据传进来了），且整页确实没有铺开节点。
    if (route.startsWith('/s/chinese/literature/') && route !== '/s/chinese/literature') {
      const m = /(\d+)\s*节点/.exec(html);
      const nodes = m ? Number(m[1]) : 0;
      if (nodes < 5) throw new Error(`思维导图未接上（标题行没有节点数，读到 ${nodes}）`);
      if (html.includes('mm-label__text')) throw new Error('思维导图卡片应默认收起，但节点已铺在首屏');
      results.push({ route, ok: true, info: `${html.length} 字符 · 导图 ${nodes} 节点（收起）` });
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
      <AppWithProviders />
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
      <AppWithProviders />
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
    (e) => e.moduleId !== 'poems' && supplementsOf(relOfEntry(e), relPool(allEntries))[0]?.action,
  );
  if (!actionTarget) {
    suppChecks.push(['存在带考点专项入口的条目', false]);
  } else {
    const actionHtml = renderToString(
      <MemoryRouter initialEntries={[`/s/chinese/${actionTarget.moduleId}/${actionTarget.id}`]}>
        <AppWithProviders />
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
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const examChecks: [string, boolean][] = [
    ['古诗词考点分区', examHtml.includes('古诗词背诵与默写')],
    ['按篇目组卷链接', /href="\/practice\/poems\?poems=[^"]+"/.test(examHtml)],
    ['主题类考点', examHtml.includes('主题·')],
    ['意象类考点', examHtml.includes('意象·')],
    ['作者类考点', examHtml.includes('作者·')],
    // 名著「整本书阅读」的受控考点必须出现在考点页（否则加了题学生也刷不到）
    ['名著阅读考点', examHtml.includes('人物形象') && examHtml.includes('跨书比较')],
    // 考点不能只有「练」：先学一遍 / 看相关条目也要有入口
    ['考点「先学一遍」入口', examHtml.includes('先学一遍')],
    ['考点「看相关条目」入口', examHtml.includes('看相关')],
  ];
  const examOk = examChecks.every(([, ok]) => ok);
  console.log(
    `  ${examOk ? '✅' : '❌'} 接线检查：考点页（${examChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || `${examChecks.length} 类断言全通过`}）`,
  );
  if (!examOk) failed += 1;

  /* --------- 接线检查：考点「默写这 N 首」真的组出了卷子 --------- */

  /**
   * 只断言「路由没崩」是不够的：`?poems=` 这条新路由如果没被 PracticePage 认出来，
   * 页面照样渲染，只是会退化成「按学段随机默写」——学生点了考点却默写了别的篇目。
   * 所以这里断言标题是「默写专项」，且题量正好等于这几首的逐句默写题数。
   */
  const drillPoems = allPoems.slice(0, 3);
  const drillExpected = drillPoems.reduce(
    (n, p) => n + makeReciteQuestions(p.lines, p.id, p.title).length,
    0,
  );
  const drillHtml = renderToString(
    <MemoryRouter initialEntries={[`/practice/poems?poems=${drillPoems.map((p) => p.id).join(',')}`]}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const drillOk =
    drillHtml.includes('默写专项') && drillHtml.includes(`${drillExpected} 道题`);
  console.log(
    `  ${drillOk ? '✅' : '❌'} 接线检查：考点默写专项（期望 ${drillExpected} 道题，标题「默写专项」）`,
  );
  if (!drillOk) failed += 1;

  /* ---------------- 接线检查：名著详情页的「整本书」四块内容 ---------------- */

  /**
   * 章节脉络/情节主线/记忆口诀/本部考点是挂在 `book` 上的，且数据来自独立文件
   * （books-plot-*.ts）按 id 合并。任何一环没接上，页面都会照常渲染，
   * 只是那部名著永远看不到这四块——所以这里逐块断言。
   */
  const bookHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/literature/l-xiyouji']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const bookChecks: [string, boolean][] = [
    ['情节主线区块', bookHtml.includes('情节主线')],
    ['章节脉络区块', bookHtml.includes('章节脉络')],
    ['记忆口诀区块', bookHtml.includes('记忆口诀')],
    ['本部考点区块', bookHtml.includes('本部考点')],
    ['按考点专项训练链接', /href="\/practice\/literature\/l-xiyouji\?tag=[^"]+"/.test(bookHtml)],
  ];
  const bookOk = bookChecks.every(([, ok]) => ok);
  console.log(
    `  ${bookOk ? '✅' : '❌'} 接线检查：名著整本书阅读（${bookChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '四块内容与考点入口齐备'}）`,
  );
  if (!bookOk) failed += 1;

  /* ---------------- 接线检查：每一课都有「本课思维导图」 ---------------- */

  /**
   * 课时导图是**推导出来**的，不落库：`lessonMindMap(entry)` 从条目数据生成。
   * 它没接进详情页、或某一课的数据不足，页面都不会报错，只是那张图不出现。
   *
   * 注意导图卡片现在**默认收起**（正文里的节点不会出现在首屏 HTML 里），
   * 所以这里断言标题行：既有「本课思维导图」，也有它算出来的节点数
   * ——节点数出现在标题上，正说明导图数据真的传进来了。
   */
  const mapTargets = [
    { id: allPoems[0]?.id ?? '', name: '古诗词', moduleId: 'poems' },
    { id: allEntries.find((e) => e.moduleId === 'classical')?.id ?? '', name: '文言文', moduleId: 'classical' },
  ];
  const mapChecks: [string, boolean][] = mapTargets.map(({ id, name, moduleId }) => {
    const html = renderToString(
      <MemoryRouter initialEntries={[`/s/chinese/${moduleId}/${id}`]}>
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
    const m = /(\d+)\s*节点/.exec(html);
    const nodes = m ? Number(m[1]) : 0;
    return [
      `${name}课时导图（${nodes} 节点，默认收起）`,
      html.includes('本课思维导图') && nodes >= 5 && !html.includes('mm-label__text'),
    ];
  });
  const mapOk = mapChecks.every(([, ok]) => ok);
  console.log(
    `  ${mapOk ? '✅' : '❌'} 接线检查：课时思维导图（${mapChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || mapChecks.map(([n]) => n).join(' / ')}）`,
  );
  if (!mapOk) failed += 1;

  /* ---------- 接线检查：练习里能跳回知识点（📖 / 🧩 两个入口） ---------- */

  /**
   * 练习页的「回知识点 / 关联知识」是答完题才出现的（`graded` 为真），
   * 路由级渲染看不到，所以这里直接把组件拉出来渲染《陋室铭》的一道题：
   * 必须同时给出「回知识点」链接与「关联知识」按钮，且关联条目里包含跨模块的篇目。
   */
  const learnEntry = entryIndex.get('c-loushiming');
  const learnQuestion = learnEntry?.questions[0];
  if (!learnEntry || !learnQuestion) {
    console.log('  ❌ 接线检查：练习回知识点（找不到《陋室铭》的题目）');
    failed += 1;
  } else {
    const learnHtml = renderToString(
      <MemoryRouter>
        <QuizLearnLinks
          item={{
            ...learnQuestion,
            sourceId: learnEntry.id,
            sourceTitle: learnEntry.title,
            moduleId: learnEntry.moduleId,
          }}
        />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
    const learnChecks: [string, boolean][] = [
      ['「回知识点」按钮', learnHtml.includes('回知识点') && learnHtml.includes(learnEntry.title)],
      ['链接指向来源条目详情页', learnHtml.includes(`/s/chinese/${learnEntry.moduleId}/${learnEntry.id}`)],
      // 关联知识默认收起，按钮本身必须出现（说明 `supplementsOf` 真的取到了分组）
      ['「关联知识」按钮', /关联知识（\d+）/.test(learnHtml)],
    ];
    const learnOk = learnChecks.every(([, ok]) => ok);
    console.log(
      `  ${learnOk ? '✅' : '❌'} 接线检查：练习跳回知识点（${learnChecks
        .filter(([, ok]) => !ok)
        .map(([n]) => n)
        .join('、') || '两个入口齐备'}）`,
    );
    if (!learnOk) failed += 1;
  }

  /* ---------- 接线检查：朗读 / 逐词释义 / 小段遮罩（古诗页三件套） ---------- */

  /**
   * 这三块都「渲染失败也不会报错」：朗读条没接进 shell、正文忘了传词表、
   * 背诵少一档，页面都照常显示，只是功能没了。所以逐一断言。
   * 注意朗读条在 Node 里拿不到 `speechSynthesis`，会渲染成「浏览器不支持」的提示卡——
   * 因此这里断言的是**它出现了**（说明接在了所有模块的详情页上），段落是否正确由
   * `pnpm validate` 的 `speechSegmentsOf` 逐条检查。
   */
  const audioPoem = allPoems.find((p) => (p.lineNotes?.length ?? 0) >= 4) ?? allPoems[0];
  const audioEntry = entryIndex.get(audioPoem?.id ?? '');
  const audioHtml = audioEntry
    ? renderToString(
        <MemoryRouter initialEntries={[`/s/chinese/poems/${audioEntry.id}`]}>
          <AppWithProviders />
        </MemoryRouter>,
      ).replace(/<!--[\s\S]*?-->/g, '')
    : '';
  const litHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/literature/l-xiyouji']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const audioChecks: [string, boolean][] = [
    ['古诗词详情页有朗读条', audioHtml.includes('朗读')],
    ['整页朗读接在所有模块（文学常识页也有）', litHtml.includes('朗读')],
    // 逐词释义：正文（不只是逐句串讲）里必须出现虚线词
    [`正文逐词释义（${audioHtml.split('tip-word').length - 1} 个词）`, audioHtml.split('tip-word').length - 1 >= 3],
    [
      '背诵四档（通读/首字/逐段/全遮）',
      ['通读全文', '首字提示', '逐段遮罩', '完全遮住'].every((s) => audioHtml.includes(s)),
    ],
  ];
  const audioOk = audioChecks.every(([, ok]) => ok);
  console.log(
    `  ${audioOk ? '✅' : '❌'} 接线检查：朗读·释义·小段遮罩（${audioChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '五类断言全通过'}）`,
  );
  if (!audioOk) failed += 1;

  /* ------------- 接线检查：历史备考三件套（时间轴 / 分层考点 / 材料题） ------------- */

  /**
   * 历史这一科的价值全在「能不能拿来复习」，而这三块都是**渲染失败也不报错**的：
   * 时间轴没画出来、考点层级丢了、材料题没渲染——页面照样显示，只是学生复习时发现少东西。
   * 因此拿一条真实内容逐块断言（默认收起不影响：这些都在正文里直接渲染）。
   */
  const histEntry = allEntries.find((e) => e.moduleId === 'hist-8a');
  const histHtml = histEntry
    ? renderToString(
        <MemoryRouter initialEntries={[`/s/history/hist-8a/${histEntry.id}`]}>
          <AppWithProviders />
        </MemoryRouter>,
      ).replace(/<!--[\s\S]*?-->/g, '')
    : '';
  const reviewHtml = renderToString(
    <MemoryRouter initialEntries={['/history-review']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const paperHtml = renderToString(
    <MemoryRouter initialEntries={['/exam-run/paper-01']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const histChecks: [string, boolean][] = [
    ['历史详情页有主线', histHtml.includes('这一条的主线')],
    [`时间轴渲染（${histHtml.split('history-timeline__item').length - 1} 个节点）`, histHtml.split('history-timeline__item').length - 1 >= 4],
    ['考点分层三档', ['重点', '次重点', '了解'].every((s) => histHtml.includes(s))],
    ['关联与对比表', histHtml.includes('关联与对比') && histHtml.includes('history-table')],
    ['材料大题与参考答案入口', histHtml.includes('材料大题') && histHtml.includes('看参考答案与踩分点')],
    ['考点与考情总复习页', reviewHtml.includes('考点与考情总复习') && reviewHtml.includes('70 分')],
    ['整卷模拟开考前页（含结构说明）', paperHtml.includes('开始考试') && paperHtml.includes('70')],
  ];
  const histOk = histChecks.every(([, ok]) => ok);
  console.log(
    `  ${histOk ? '✅' : '❌'} 接线检查：历史备考（${histChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '七类断言全通过'}）`,
  );
  if (!histOk) failed += 1;
}

if (failed) {
  console.log('\n❌ 存在渲染失败或接线异常的页面');
  process.exitCode = 1;
} else {
  console.log('✅ 所有页面均可在真实数据下正常渲染');
}
console.log('');
