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
import { reciteCardsOf } from '../src/lib/reciteCards';
import { ReciteCardGroup } from '../src/components/ReciteCards';
import type { ReciteCard } from '../src/types';
import { PhysicsFigureView } from '../src/components/PhysicsFigure';
import type { PhysicsFigure } from '../src/types';

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
  // 已上线学科的学科页、模块页、详情页、练习页
  ...SUBJECTS.filter((s) => s.available).flatMap((s) => [
    `/s/${s.id}`,
    ...s.modules
      .filter((m) => m.available)
      .flatMap((m) => [
        `/s/${s.id}/${m.id}`,
        `/s/${s.id}/${m.id}/${firstId(m.id)}`,
        `/practice/${m.id}`,
      ]),
  ]),
  // 待开发科目的轮廓页：学科页与每个占位模块页都必须能渲染出「待开发」而不是空白
  ...SUBJECTS.filter((s) => !s.available).flatMap((s) => [
    `/s/${s.id}`,
    ...s.modules.map((m) => `/s/${s.id}/${m.id}`),
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
  // 科目子页面：背诵 / 错题本 / 考点 / 知识拓展，内容都按本科过滤
  '/s/chinese/recite',
  // 知识点卡片覆盖全学科：文科（语文/历史/道法/英语）与数学都该背出东西来
  '/s/history/recite',
  '/s/politics/recite',
  '/s/english/recite',
  '/s/math/recite',
  // 已上线但不产卡片的科目（物理的掌握走「逐题过关」）
  // 与待开发科目（化学）：都要进得去，且渲染出说明而不是空白
  '/s/physics/recite',
  '/s/chemistry/recite',
  '/s/chinese/wrong',
  '/s/math/wrong',
  '/s/english/wrong',
  '/s/history/wrong',
  // 本科无错题可查：页面必须能渲染出空态而不是空白
  '/s/physics/wrong',
  '/s/chemistry/wrong',
  '/s/chinese/exam',
  '/s/math/exam',
  '/s/english/exam',
  // 历史的「考点」是考点与考情总复习页（/s/:subjectId/exam 按科目分流）
  '/s/history/exam',
  // 知识拓展页：思维导图与拓展阅读两条渲染路径
  '/s/chinese/extras',
  '/s/math/extras',
  '/s/english/extras',
  '/stats',
  // 账户页（云端未配置时渲染降级提示）
  '/account',
  '/exam-run/paper-01',
  // 英语：整卷模拟考试（同一套考试页，卷子来自英语数据）
  '/exam-run/eng-paper-01',
  // 道法：考点与考情总复习 + 整卷模拟考试
  '/s/politics/exam',
  '/exam-run/pol-paper-01',
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

/**
 * 用于验证「已标熟」能流到界面的卡片。
 * 从真实数据里派生，不写死 id——内容一改，这条断言不该跟着失效。
 */
const cardTarget = (() => {
  const e = allEntries.find((x) => x.moduleId === 'poems' && reciteCardsOf(x).length > 0);
  return e ? reciteCardsOf(e)[0] : undefined;
})();

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
            // 一张已经「背对 3 次」的卡：标熟必须能出现在首页/学习报告上
            cards: cardTarget
              ? {
                  [cardTarget.id]: {
                    times: 3,
                    streak: 3,
                    lastAt: Date.now(),
                    dueAt: Date.now() + 86400000,
                    masteredAt: Date.now(),
                  },
                }
              : {},
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
    <MemoryRouter initialEntries={['/s/chinese/exam']}>
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
    <MemoryRouter initialEntries={['/s/history/exam']}>
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

  /* ------------- 接线检查：一级菜单 = 科目，本科工具与用户入口各归其位 ------------- */

  /**
   * 这一版把一级菜单直接给科目、把「背诵/错题/考点/拓展」下沉到各科、把
   * 「学习报告/账户」收进右上角用户菜单。这类信息架构问题**渲染永远不报错**：
   * 某个科目从顶栏漏掉、本科工具入口没接进学科页、底部栏还留着空的「更多」——
   * 页面都照常显示，只是学生找不到入口。所以逐项断言。
   *
   * 注意：科目面板与用户下拉都是**点开才渲染**的，SSR 首屏里没有面板内容，
   * 因此这里断言的是「入口数量与顺序」和「学科页上的本科工具链接」。
   */
  const homeHtml = renderToString(
    <MemoryRouter initialEntries={['/']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const histModuleHtml = renderToString(
    <MemoryRouter initialEntries={['/s/history/hist-8a']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /** 学科页（语文）：本科工具入口都挂在这里 */
  const chineseSubjectHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /**
   * 待开发科目的样本**不能写死某个科目**：物理原本是待开发的，上线后这些断言就会假失败。
   * 所以从注册表里挑一个当前仍待开发的科目来当样本。
   */
  const pendingSubject = SUBJECTS.find((s) => !s.available);
  if (!pendingSubject) throw new Error('没有待开发科目可用于回归断言，请更新冒烟测试');
  const pendingSubjectHtml = renderToString(
    <MemoryRouter initialEntries={[`/s/${pendingSubject.id}`]}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const pendingModule = pendingSubject.modules[0];
  const pendingModuleHtml = renderToString(
    <MemoryRouter initialEntries={[`/s/${pendingSubject.id}/${pendingModule.id}`]}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /** 本科错题本（待开发科目）：没有错题，但必须渲染出空态而不是空白 */
  const pendingWrongHtml = renderToString(
    <MemoryRouter initialEntries={[`/s/${pendingSubject.id}/wrong`]}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /**
   * 已上线但**不产知识点卡片**的科目（物理：掌握按「逐题过关」统计）：
   * 背诵页必须给出说明并指回本科，而不是空白页。
   */
  const noCardReciteHtml = renderToString(
    <MemoryRouter initialEntries={['/s/physics/recite']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /** 数学考点页：同一套考点页按科目取数（不再只服务语文） */
  const mathExamHtml = renderToString(
    <MemoryRouter initialEntries={['/s/math/exam']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const menuOrder = SUBJECTS.map((s) => s.name);

  const navChecks: [string, boolean][] = [
    // 一级菜单 = 全部计分科目平铺，一个不多一个不少
    ['顶栏列全部科目（8 个入口）', (histModuleHtml.match(/subjmenu__trigger/g) ?? []).length === SUBJECTS.length],
    // 顺序必须与首页/SUBJECTS 一致：只比顶栏那一段的位置，避免被正文里的科目名带偏
    [
      '顶栏科目顺序与首页一致（数学在最前）',
      (() => {
        const nav = histModuleHtml.slice(
          histModuleHtml.indexOf('class="topnav"'),
          histModuleHtml.indexOf('usermenu__trigger'),
        );
        return menuOrder.every((n, i) => {
          const at = nav.indexOf(n);
          if (at < 0) return false;
          if (i === 0) return true;
          return nav.indexOf(menuOrder[i - 1]) < at;
        });
      })(),
    ],
    [
      '顶栏副标题标注 2027 中考口径',
      histModuleHtml.includes('2027 广州中考') && histModuleHtml.includes('810 分'),
    ],
    // 顶部栏与底栏成对：底栏三个入口 首页 / 学科 / 我的
    ['底部栏「学科」入口', histModuleHtml.includes('📚</span><span>学科')],
    ['底部栏「我的」入口', histModuleHtml.includes('👤</span><span>我的')],
    ['底部栏不含旧「更多」按钮', !histModuleHtml.includes('tabbar__more')],
    // 右上角用户入口（学习报告/账户收在此下拉里，收起时不渲染子项）
    ['右上角用户入口', histModuleHtml.includes('usermenu__trigger')],
    // 本科工具：语文有背诵/错题本/考点/知识拓展四个入口
    [
      '学科页本科工具（背诵/错题本/考点/知识拓展）',
      chineseSubjectHtml.includes('本科工具') &&
        ['/s/chinese/recite', '/s/chinese/wrong', '/s/chinese/exam', '/s/chinese/extras'].every((t) =>
          chineseSubjectHtml.includes(`href="${t}"`),
        ),
    ],
    // 待开发科目不该给出还没有内容的工具入口
    [
      '待开发学科页不给本科工具入口',
      pendingSubjectHtml.includes('待开发') && !pendingSubjectHtml.includes('本科工具'),
    ],
    // 待开发科目的错题本：空态 + 指回本科
    [
      '待开发科目错题本渲染空态',
      pendingWrongHtml.includes(pendingSubject.name) && pendingWrongHtml.includes(`href="/s/${pendingSubject.id}"`),
    ],
    // 没有知识点卡片的科目：说清楚为什么没有，不是空白页
    [
      '无知识点卡片的科目给出说明',
      noCardReciteHtml.includes('没有可背诵的知识点卡片') &&
        noCardReciteHtml.includes('href="/s/physics"'),
    ],
    // 学科页（语文）：本科工具 + 模块网格
    ['学科页列出本科模块', chineseSubjectHtml.split('module-card').length - 1 >= 3],
    // 考点页按科目取数：数学考点页必须是数学的，不是语文的
    ['考点页按科目取数（数学）', mathExamHtml.includes('数学') && !mathExamHtml.includes('古诗词背诵与默写')],
    // 首页：模块网格 + 快捷入口直达科目子页面
    ['首页模块网格（默认学科）', homeHtml.split('module-card').length - 1 >= 3],
    ['首页快捷入口：知识点背诵', homeHtml.includes('知识点背诵') && homeHtml.includes('/s/chinese/recite')],
    ['首页快捷入口：整卷模拟考试', homeHtml.includes('整卷模拟考试') && homeHtml.includes('/s/history/hist-exam')],
    ['首页快捷入口：历史考点与考情', homeHtml.includes('历史考点与考情') && homeHtml.includes('/s/history/exam')],
    ['首页快捷入口：语文考点', homeHtml.includes('语文考点') && homeHtml.includes('/s/chinese/exam')],
    ['首页快捷入口：知识拓展', homeHtml.includes('知识拓展') && homeHtml.includes('/s/chinese/extras')],
    [
      '首页学科切换（语文/历史）',
      homeHtml.includes('subj-tab') && homeHtml.includes('语文') && homeHtml.includes('历史'),
    ],
    ['首页学科可切换（各科都是按钮）', (homeHtml.match(/subj-tab/g) ?? []).length >= 4 && homeHtml.includes('aria-pressed')],
    // 一级菜单 = 按 2027 中考满分降序的全部计分科目（含待开发科目）
    [
      '首页按分值列出全部计分科目',
      homeHtml.includes('计分科目与分值') &&
        homeHtml.includes('810 分') &&
        menuOrder.every((n) => homeHtml.includes(n)),
    ],
    // 「计分科目与分值」一览必须按满分降序：数学 150 排在语文 140 之前。
    // 只在这段切片里比位置——页头会先出现当前学科名，全页 indexOf 会被带偏。
    [
      '分值顺序：数学 150 分在最前',
      (() => {
        const board = homeHtml.slice(homeHtml.indexOf('计分科目与分值'));
        return board.indexOf('数学') >= 0 && board.indexOf('数学') < board.indexOf('语文');
      })(),
    ],
    ['待开发科目出现在首页（化学/体育）', homeHtml.includes('待开发') && homeHtml.includes(pendingSubject.name) && homeHtml.includes('体育与健康')],
    // 待开发页面：轮廓与说明必须渲染出来
    [
      '待开发科目页渲染模块轮廓',
      pendingSubjectHtml.includes('待开发') &&
        pendingSubjectHtml.includes('内容正在准备中') &&
        pendingSubject.modules.every((m) => pendingSubjectHtml.includes(m.name)),
    ],
    [
      '待开发模块页渲染规划与返回入口',
      pendingModuleHtml.includes('待开发') &&
        pendingModuleHtml.includes('内容正在准备中') &&
        pendingModuleHtml.includes(`/s/${pendingSubject.id}"`),
    ],
  ];
  const navOk = navChecks.every(([, ok]) => ok);
  console.log(
    `  ${navOk ? '✅' : '❌'} 接线检查：科目一级菜单与本科工具（${navChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || `${navChecks.length} 项断言全通过`}）`,
  );
  if (!navOk) failed += 1;

  /* ------------- 接线检查：知识点背诵（卡片派生 / 标熟 / 学过的 ≠ 掌握的） ------------- */

  /**
   * 背诵页与详情页的「知识点背诵」区都是**派生**出来的（见 lib/reciteCards.ts）：
   * 抽取器漏一个字段，页面照样渲染得很好看，只是历史时间点或材料题踩分点一张卡都没有——
   * 学生以为背完了，其实最该背的东西从没进过清单。所以按类型点名断言。
   */
  const chineseReciteHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/recite']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const histReciteHtml = renderToString(
    <MemoryRouter initialEntries={['/s/history/recite']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  /**
   * 古诗词最容易被抽成「只剩逐句默写」——那样学生背完字音字形，遇上赏析题还是答不出。
   * 这里直接看派生结果：赏析与考点、译文、名句、易错字、主题都得在，且赏析的背面得有实质内容。
   */
  const poemCards = allEntries.filter((e) => e.moduleId === 'poems').flatMap((e) => reciteCardsOf(e));
  const poemKinds = new Set(poemCards.map((c) => c.kind));
  const appreciationBack = poemCards.find((c) => c.kind === '赏析')?.back ?? '';
  const litKinds = new Set(
    allEntries.filter((e) => e.moduleId === 'literature').flatMap((e) => reciteCardsOf(e)).map((c) => c.kind),
  );

  const reciteChecks: [string, boolean][] = [
    ['语文背诵页渲染出卡片', chineseReciteHtml.includes('rcard') && chineseReciteHtml.includes('看答案')],
    ['语文背诵页给出标熟口径', chineseReciteHtml.includes('知识点背诵') && chineseReciteHtml.includes('标熟')],
    ['历史背诵页含「历史时间点」卡片', histReciteHtml.includes('历史时间点')],
    ['历史背诵页含「材料大题踩分点」卡片', histReciteHtml.includes('材料大题踩分点')],
    ['历史背诵页含分层考点卡片', histReciteHtml.includes('考点·重点')],
    // 古诗不能只有默写：赏析与考点必须有，且背面是成段的赏析而不是空串
    ['古诗卡片含「赏析与考点」（理解性默写）', poemKinds.has('赏析') && appreciationBack.length > 20],
    ['古诗卡片含译文 / 千古名句 / 易错字 / 主题', ['译文', '千古名句', '易错字', '主题'].every((k) => poemKinds.has(k))],
    ['名著卡片含「整本书阅读」简答题', litKinds.has('整本书阅读')],
    // 详情页的知识点背诵区默认收起，但标题与待背数在首屏
    ['详情页挂上了「知识点背诵」区', histHtml.includes('知识点背诵') && histHtml.includes('个待背/待复习')],
    // 已标熟必须真的流到首页（只看 localStorage 里那张 streak=3 的卡）
    ['首页显示「已标熟知识点」', homeHtml.includes('已标熟知识点')],
    ['首页进度区分「已学内容」与「已标熟」', homeHtml.includes('已学内容') && homeHtml.includes('看过 ≠ 掌握')],
  ];
  const reciteOk = reciteChecks.every(([, ok]) => ok);
  console.log(
    `  ${reciteOk ? '✅' : '❌'} 接线检查：知识点背诵与标熟（${reciteChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || `${reciteChecks.length} 项断言全通过`}）`,
  );
  if (!reciteOk) failed += 1;

  /* ---- 接线检查：学习报告上「已学」与「已标熟」是两个数字 ---- */

  /**
   * 注入的 localStorage 里有一张标熟卡片，学习报告必须把它算进「已标熟知识点」，
   * 而条目级进度（studied）另算——这正是「学习不是看了就等于学了」的落点。
   */
  const statsHtml = renderToString(
    <MemoryRouter initialEntries={['/stats']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const statsChecks: [string, boolean][] = [
    ['学习报告有「已标熟知识点」', statsHtml.includes('已标熟知识点')],
    ['学习报告并列「已学内容（看过）」', statsHtml.includes('已学内容（看过）')],
    ['两个数字分开说明', statsHtml.includes('看过 ≠ 掌握') || statsHtml.includes('完全掌握')],
  ];
  const statsOk = statsChecks.every(([, ok]) => ok);
  console.log(
    `  ${statsOk ? '✅' : '❌'} 接线检查：学习报告的双指标（${statsChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '已学 / 已标熟 分列'}）`,
  );
  if (!statsOk) failed += 1;

  /* ------- 接线检查：卡片底部的「已背 N 次 / 还差 N 次标熟」文案 ------- */

  /**
   * 学生点完「✅ 背了」必须**当场**看到「已背 N 次 · 还差 N 次标熟 · N 天后复习」。
   * 这行字由 `ReciteCardItem` 现拼，拼错、或者把「同一天重复打卡」也算成一次熟练度，
   * 页面都照样渲染得很正常——所以直接喂两条记录来锁死文案：
   * A 卡＝今天第一次背对（次数 1、熟练度 1）；B 卡＝同一天又点了一次（次数 2、熟练度仍是 1）。
   */
  const DAY_MS = 86400000;
  const metaNow = Date.now();
  const metaIds = ['meta-a#默写#0', 'meta-b#默写#0'];
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) =>
      k.includes('xueer')
        ? JSON.stringify({
            cards: {
              [metaIds[0]]: { times: 1, streak: 1, lastAt: metaNow, dueAt: metaNow + DAY_MS },
              [metaIds[1]]: { times: 2, streak: 1, lastAt: metaNow, dueAt: metaNow + DAY_MS },
            },
          })
        : null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown;

  const metaCards = metaIds.map(
    (id, i): ReciteCard => ({
      id,
      entryId: `meta-${i}`,
      moduleId: 'poems',
      title: '接线检查用卡片',
      kind: '默写',
      front: `上句：接线检查${i + 1}`,
      back: '下句',
    }),
  );
  const metaHtml = renderToString(
    <StudyProvider>
      <ReciteCardGroup cards={metaCards} limit={10} />
    </StudyProvider>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const cardMetaChecks: [string, boolean][] = [
    ['首次背对显示「已背 1 次」', metaHtml.includes('已背 1 次')],
    ['首次背对显示「还差 2 次标熟」', metaHtml.includes('还差 2 次标熟')],
    ['首次背对显示「1 天后复习」', metaHtml.includes('1 天后复习')],
    ['同一天第二次背显示「已背 2 次」', metaHtml.includes('已背 2 次')],
    // 同一天重复点不该推进熟练度：两张卡的 streak 都还是 1
    ['同一天重复打卡不推进熟练度', !metaHtml.includes('还差 1 次标熟')],
    ['熟练度圆点各亮 1 个（共 2 个亮）', (metaHtml.match(/rcard__dot is-on/g) ?? []).length === 2],
  ];
  const cardMetaOk = cardMetaChecks.every(([, ok]) => ok);
  console.log(
    `  ${cardMetaOk ? '✅' : '❌'} 接线检查：卡片打卡文案（${cardMetaChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '已背 N 次 / 还差 N 次标熟 / 复习时间'}）`,
  );
  if (!cardMetaOk) failed += 1;

  /* ------------- 接线检查：作文范文（多篇全文 + 亮点句 + 分项点评） ------------- */

  /**
   * 作文是语文单项分值最高的题（60/140 ≈ 43%），这次按主题补了多篇完整例文。
   * 与其它内容一样，「渲染失败也不报错」的风险在于：亮点句或分项点评没接上，
   * 页面照常显示，只是学生看不到最该学的那两块。所以逐块断言。
   */
  const sampleEntry = allEntries.find(
    (e) => e.moduleId === 'writing' && (e.data as { id?: string }).id === 'w-sample-qinqin-2',
  );
  const sampleHtml = sampleEntry
    ? renderToString(
        <MemoryRouter initialEntries={[`/s/chinese/writing/${sampleEntry.id}`]}>
          <AppWithProviders />
        </MemoryRouter>,
      ).replace(/<!--[\s\S]*?-->/g, '')
    : '';
  const writingListHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chinese/writing']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const sampleChecks: [string, boolean][] = [
    ['范文详情页可渲染', Boolean(sampleEntry) && sampleHtml.includes('范文与点评')],
    ['多篇例文（同题两篇）', sampleHtml.split('accordion').length - 1 >= 2],
    ['亮点句区块', sampleHtml.includes('亮点句') && sampleHtml.includes('为什么好')],
    ['分项点评区块', sampleHtml.includes('分项点评') && sampleHtml.includes('升格建议')],
    ['主题标签与全文篇数', sampleHtml.includes('主题·亲情') && sampleHtml.includes('篇完整范例')],
    ['命题形式与档次', sampleHtml.includes('题目要求') && sampleHtml.includes('分')],
    // 模块页要能按主题筛选（「亲情」是这次给范文加的标签）
    ['模块页可按主题筛范文', writingListHtml.includes('亲情')],
  ];
  const sampleOk = sampleChecks.every(([, ok]) => ok);
  console.log(
    `  ${sampleOk ? '✅' : '❌'} 接线检查：作文范文（${sampleChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '七类断言全通过'}）`,
  );
  if (!sampleOk) failed += 1;

  /* ------------- 接线检查：英语（词根词缀 / 近义辨析 / 听说脚本 / 范文） ------------- */

  /**
   * 英语按知识模块组织，页面里的每块材料都是「渲染失败也不报错」的：
   * 词根词缀表没了、近义辨析只剩两个词没有区别、听说脚本读不出来——页面照样显示。
   * 因此逐块断言（条目按模块动态取，不写死 id，免得内容一改就失效）。
   */
  const pickOf = (moduleId: string) => allEntries.find((e) => e.moduleId === moduleId);
  const renderEntry = (id: string) =>
    renderToString(
      <MemoryRouter
        initialEntries={[`/s/english/${allEntries.find((x) => x.id === id)?.moduleId ?? 'eng-vocab'}/${id}`]}
      >
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');

  const vocabEntry = pickOf('eng-vocab');
  /** 辨析类条目要单独找：词汇模块里第一条通常是词根词缀条目，没有辨析表 */
  const confusableEntry = allEntries.find(
    (e) => e.moduleId === 'eng-vocab' && ((e.data as { confusables?: unknown[] }).confusables?.length ?? 0) > 0,
  );
  const grammarEntry = pickOf('eng-grammar');
  const readingEntry = pickOf('eng-reading');
  const listenEntry = pickOf('eng-listening');
  const writingEntry = pickOf('eng-writing');
  const engPaper = allEntries.find((e) => e.moduleId === 'eng-exam');

  const vocabHtml = vocabEntry ? renderEntry(vocabEntry.id) : '';
  /** 词表类条目要单独找：词汇模块里第一条通常是词根词缀条目，没有分类词表 */
  const wordListEntry = allEntries.find(
    (e) => e.moduleId === 'eng-vocab' && ((e.data as { wordList?: unknown[] }).wordList?.length ?? 0) > 0,
  );
  const wordListHtml = wordListEntry ? renderEntry(wordListEntry.id) : '';
  const confusableHtml = confusableEntry ? renderEntry(confusableEntry.id) : '';
  const listenHtml = listenEntry ? renderEntry(listenEntry.id) : '';
  const writingHtml = writingEntry ? renderEntry(writingEntry.id) : '';
  const paperHtml2 = engPaper ? renderEntry(engPaper.id) : '';

  const engChecks: [string, boolean][] = [
    ['英语详情页可渲染（考点分层）', Boolean(vocabEntry) && vocabHtml.includes('考点分层')],
    ['词根词缀表', vocabHtml.includes('词根词缀')],
    // 分类词表（按话题/词性/考点整理的初中词汇）：页面必须渲出词表与搜索框
    ['分类词表与搜索框', wordListHtml.includes('分类词汇表') && wordListHtml.includes('搜索单词或中文')],
    ['近义辨析（含区别）', confusableHtml.includes('同义/近义辨析') && confusableHtml.includes('区别')],
    ['听说材料区块', listenHtml.includes('听说材料')],
    // 朗读按钮在服务端渲染时不出现（拿不到浏览器语音 API），因此这里断言朗读提示本身
    ['朗读要点（重音/连读）', listenHtml.includes('朗读要点')],
    ['书面表达分档范文', writingHtml.includes('书面表达') && writingHtml.includes('为什么好')],
    ['模拟卷结构与听说说明', paperHtml2.includes('试卷结构') && paperHtml2.includes('听说')],
  ];
  const engOk = engChecks.every(([, ok]) => ok);
  console.log(
    `  ${engOk ? '✅' : '❌'} 接线检查：英语（${engChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '七类断言全通过'}）`,
  );
  if (!engOk) failed += 1;

  /* ------------- 接线检查：道法备考八块（与历史同一套结构） ------------- */

  /**
   * 道法与历史同构：主线、核心观点分层、必背金句、易错、对比、时政角度、命题角度、材料大题。
   * 这些块「渲染失败也不报错」——金句没了、材料题没渲出来，页面照样显示，
   * 只是学生复习时发现少了最要紧的东西。因此逐块断言。
   */
  const polTopic = allEntries.find((e) => e.moduleId === 'pol-nation');
  const polCurrent = allEntries.find(
    (e) => e.moduleId === 'pol-current' && ((e.data as { hotspots?: unknown[] }).hotspots?.length ?? 0) > 0,
  );
  // pol-exam 里既有整卷也有题型专题，按数据形状取卷子（否则抓到专题，结构表断言会假失败）
  const polPaper = allEntries.find((e) => e.moduleId === 'pol-exam' && 'sections' in e.data);
  const renderPol = (id: string) =>
    renderToString(
      <MemoryRouter
        initialEntries={[`/s/politics/${allEntries.find((x) => x.id === id)?.moduleId ?? 'pol-nation'}/${id}`]}
      >
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
  const polHtml = polTopic ? renderPol(polTopic.id) : '';
  const polCurrentHtml = polCurrent ? renderPol(polCurrent.id) : '';
  const polPaperHtml = polPaper ? renderPol(polPaper.id) : '';
  // pol-exam 里的「题型专题」是知识条目（无 sections），要与整卷走同一路由但不串渲染
  const polStrategy = allEntries.find((e) => e.moduleId === 'pol-exam' && !('sections' in e.data));
  const polStrategyHtml = polStrategy ? renderPol(polStrategy.id) : '';
  const polReviewHtml = renderToString(
    <MemoryRouter initialEntries={['/s/politics/exam']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const polChecks: [string, boolean][] = [
    ['道法详情页有主线', polHtml.includes('这一条的主线')],
    ['核心观点与考点分层', polHtml.includes('核心观点与考点分层') && polHtml.includes('只看重点')],
    ['必背金句与答题术语', polHtml.includes('必背金句')],
    ['易错辨析与关联对比', polHtml.includes('易错辨析') && polHtml.includes('关联与对比')],
    ['材料大题与踩分点入口', polHtml.includes('材料大题') && polHtml.includes('看参考答案与踩分点')],
    ['时政热点与答题角度', polCurrentHtml.includes('时政热点与答题角度')],
    ['考点与考情总复习页', polReviewHtml.includes('道法考点与考情总复习') && polReviewHtml.includes('70 分')],
    ['模拟卷结构表', polPaperHtml.includes('试卷结构') && polPaperHtml.includes('非选择题')],
    [
      'pol-exam 题型专题按知识条目渲染',
      polStrategyHtml.includes('核心观点与考点分层') && !polStrategyHtml.includes('试卷结构'),
    ],
  ];
  const polOk = polChecks.every(([, ok]) => ok);
  console.log(
    `  ${polOk ? '✅' : '❌'} 接线检查：道法备考（${polChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '九类断言全通过'}）`,
  );
  if (!polOk) failed += 1;

  /* ------------- 接线检查：物理（理科取向 + 图文并茂 + 全题过关才掌握） ------------- */

  /**
   * 物理这一科的接线有三件事最容易被「渲染没报错」掩盖：
   *   ① 图解是数据画的，若渲染器没接上，页面照样出现、只是图全空；
   *   ② 「全部题目过关才算掌握」的进度条与过关清单，接错了也看不出来；
   *   ③ phy-exam 里整卷与题型专题共用模块 id，分流错就会把卷子渲染成知识页。
   */
  const phyTopic = allEntries.find(
    (e) => e.moduleId === 'phy-mech' && !('sections' in e.data),
  );
  const phyPaper = allEntries.find((e) => e.moduleId === 'phy-exam' && 'sections' in e.data);
  const renderPhy = (id: string) => {
    const mod = allEntries.find((x) => x.id === id)?.moduleId ?? 'phy-mech';
    return renderToString(
      <MemoryRouter initialEntries={[`/s/physics/${mod}/${id}`]}>
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
  };
  const phyHtml = phyTopic ? renderPhy(phyTopic.id) : '';
  const phyPaperHtml = phyPaper ? renderPhy(phyPaper.id) : '';
  const phyModuleHtml = renderToString(
    <MemoryRouter initialEntries={['/s/physics/phy-mech']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  const phyPracticeHtml = renderToString(
    <MemoryRouter initialEntries={['/practice/phy-mech']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /** 停表读数那一条（实验操作 → 基本测量）：断言双盘读数讲解真的渲染到页面上 */
  const phyStopwatchHtml = renderToString(
    <MemoryRouter initialEntries={['/s/physics/phy-experiment/phy-experiment-1']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');
  /**
   * 整卷考试页也要能渲染物理的图。
   * 这一条是**真实漏洞的回归保护**：考试页原先完全不渲染 `figure`，
   * 物理卷里带图的选题在考试中会变成「无图题」，作图题的参考答案图也不显示——
   * 页面不会报错，只是学生根本没法做题。
   */
  const phyExamHtml = renderToString(
    <MemoryRouter initialEntries={['/exam-run/phy-paper-01?start=1']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  /**
   * 图解图元的**自测**：直接渲染一个含 `arc` 与 `coil` 的图，检查画出来的 SVG。
   *
   * 为什么值得单独立一条断言：`arc` 的 large-arc / sweep 两个 flag 曾经写错
   * （用度数去和 Math.PI 比），结果跨度超过约 3° 的弧全部画成反向大弧——
   * 两个内容作者都踩到了，只好绕开 `arc` 改用 `curve`。这类错误页面不会报错、
   * 只是图悄悄画反，只有把 SVG 文本抓出来比 flag 才抓得住。
   */
  const probeFigure: PhysicsFigure = {
    id: 'fig-probe',
    title: '图元自测',
    alt: '自测图：一段 90 度圆弧与一个通电螺线管',
    prims: [
      // 90°（小于半圆）：large-arc 必须是 0，方向为逆时针（to > from）故 sweep = 0
      { t: 'arc', cx: 50, cy: 50, r: 20, from: 0, to: 90, arrow: true },
      // 270°（大于半圆）：large-arc 必须是 1
      { t: 'arc', cx: 50, cy: 50, r: 10, from: 0, to: 270 },
      { t: 'angle', x: 20, y: 80, from: 0, to: 60, label: '60°' },
      { t: 'coil', x: 50, y: 20, turns: 4 },
      { t: 'coil', x: 50, y: 34, turns: 4, frontCurrent: 'down' },
      // 停表：小盘 1.5 min（过半格）+ 大盘 10.4 s，读数应为 100.4 s
      { t: 'stopwatch', x: 50, y: 50, r: 30, minute: 1.5, second: 10.4, label: '停表自测' },
      // 化学图元：试管、锥形瓶、酒精灯、集气瓶、原子、分子、铁架台、漏斗
      { t: 'testTube', x: 20, y: 30, h: 30, liquid: 0.6, color: 'blue', label: '试管' },
      { t: 'flask', x: 45, y: 34, kind: 'conical', liquid: 0.5, color: 'yellow', label: '锥形瓶' },
      { t: 'alcoholLamp', x: 62, y: 40, lit: true, label: '酒精灯' },
      { t: 'gasJar', x: 80, y: 32, liquid: 0.5, color: 'colorless', cover: true, label: '集气瓶' },
      { t: 'atom', x: 16, y: 78, symbol: 'Na', charge: '+', color: 'purple', label: '钠离子' },
      {
        t: 'molecule',
        x: 46,
        y: 78,
        atoms: [
          { dx: 0, dy: 0, symbol: 'O', color: 'red' },
          { dx: -5, dy: -4, r: 2.6, symbol: 'H' },
          { dx: 5, dy: -4, r: 2.6, symbol: 'H' },
        ],
        bonds: [[0, 1], [0, 2]],
        label: 'H₂O',
      },
      { t: 'stand', x: 78, y: 92, h: 30, clamps: [0.6], label: '铁架台' },
      { t: 'funnel', x: 92, y: 74, kind: 'long', label: '长颈漏斗' },
    ],
  };
  const probeSvg = renderToString(<PhysicsFigureView figure={probeFigure} />);
  /** 抓出两条 arc 的 d 属性，检查 large-arc 与 sweep 两个 flag */
  const arcPaths = [...probeSvg.matchAll(/d="M [^"]*?A [\d.]+ [\d.]+ 0 (\d) (\d)/g)].map((m) => `${m[1]}${m[2]}`);
  const coilLabels = [...probeSvg.matchAll(/>([NS])</g)].map((m) => m[1]).join('');
  /**
   * 停表自测：确认双盘都画出来了——两根指针（红色）、小盘在 12 点位置、
   * 大盘一圈 30 s 的刻度（0/5/…/30 七个数字）。
   * 停表最容易画错的是「大盘一圈只有 30 s」这件事（小盘决定哪一圈），
   * 因此断言里带上小盘与大数字，避免以后改成 60 s 一圈而没人发现。
   */
  const stopwatchOk =
    probeSvg.includes('停表自测') &&
    [...probeSvg.matchAll(/stroke="var\(--c-red\)"/g)].length >= 2 &&
    probeSvg.includes('>15<') &&
    probeSvg.includes('>30<');
  /**
   * 化学图元自测：确认装置与粒子都画出来了——
   *   试管/锥形瓶/集气瓶的**液体颜色**（蓝色与黄色各出现一次，无色不填充）、
   *   酒精灯的火焰、原子模型的元素符号与电荷、分子模型的化学键连线、铁架台的铁夹。
   * 这些图元错一个，装置图与粒子模型就会误导学生（化学装置图是中考实验题的核心考点）。
   */
  const chemPrimsOk =
    probeSvg.includes('#2f7fd6') && // 试管里的蓝色液体
    probeSvg.includes('#e0b020') && // 锥形瓶里的黄色液体
    probeSvg.includes('#e8a33d') && // 酒精灯火焰
    probeSvg.includes('>Na<') &&
    probeSvg.includes('>+<') &&
    probeSvg.includes('>H₂O<') &&
    [...probeSvg.matchAll(/<line[^>]*stroke="var\(--c-ink\)"/g)].length >= 2 && // 分子化学键等
    probeSvg.includes('铁架台');
  /**
   * 无色液体必须画出**液面线**：探针里的集气瓶装的是 `colorless`（无色）液体。
   * 「无色」不等于「没有液体」——液面高度、是否浸没、凹液面最低处都是考点，
   * 图上没有液面线这些考点就全部消失了（内容作者一开始只能自己用折线补）。
   */
  const colorlessOk = probeSvg.includes('fill-opacity="0.06"') || /y1="41" /.test(probeSvg);

  const phyChecks: [string, boolean][] = [
    ['问题与理解的关键', phyHtml.includes('要解决的问题') && phyHtml.includes('理解的关键')],
    ['理解过程（分步讲解）', phyHtml.includes('理解过程') && /physics-step__title/.test(phyHtml)],
    ['图解渲染成 SVG', /<svg[^>]*class="fig__svg"/.test(phyHtml) && phyHtml.includes('fig__title')],
    ['公式带适用条件', phyHtml.includes('公式与适用条件') && phyHtml.includes('适用条件')],
    ['应用：情境到物理模型', phyHtml.includes('物理模型') && phyHtml.includes('结论')],
    ['综合题与踩分点入口', phyHtml.includes('看参考答案与踩分点')],
    [
      '过关清单（全题过关才掌握）',
      phyHtml.includes('过关清单') && phyHtml.includes('全部题目都过关才算掌握') && /physics-quizItem/.test(phyHtml),
    ],
    ['模拟卷结构表（选择 10 题 + 非选择 6 题）', phyPaperHtml.includes('试卷结构') && phyPaperHtml.includes('非选择题')],
    ['模块页有物理条目', phyModuleHtml.includes('物理') && /list-item__title/.test(phyModuleHtml)],
    ['练习页可用', phyPracticeHtml.includes('phy-') || phyPracticeHtml.includes('1 / ')],
    // 图元自测：90° 弧 = (large 0, sweep 0)；270° 弧 = (large 1, sweep 0)。
    // 注意 `angle` 图元也画 <path A>，所以断言取前两条而不是要求总数为 2。
    ['图元自测：arc 的 large-arc / sweep', arcPaths.length >= 2 && arcPaths[0] === '00' && arcPaths[1] === '10'],
    // 整卷考试页要渲染题干配图（物理卷的图题不给图就没法做）
    ['整卷考试页渲染题干配图', /<svg[^>]*class="fig__svg"/.test(phyExamHtml)],
    // 卷面标题不写死学科说法：物理应是「非选择题（解答与计算…）」而不是「阅读材料，回答问题」
    [
      '整卷卷面标题按科目',
      phyExamHtml.includes('非选择题') && !phyExamHtml.includes('阅读材料，回答问题）'),
    ],
    // 螺线管极性由正面电流方向推出：向上 N 在左、向下 N 在右 → 「N」出现在两组不同位置
    ['图元自测：coil 极性随电流方向', coilLabels === 'NS' + 'SN' || /NS[\s\S]*SN/.test(probeSvg)],
    ['图元自测：停表双盘（小盘分钟 + 大盘 30 s 一圈）', stopwatchOk],
    [
      '停表读数（双盘讲解 + 读数题都渲染出来）',
      phyStopwatchHtml.includes('大盘一圈 30 s') && phyStopwatchHtml.includes('停表'),
    ],
  ];
  const phyOk = phyChecks.every(([, ok]) => ok);
  console.log(
    `  ${phyOk ? '✅' : '❌'} 接线检查：物理（${phyChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '十六类断言全通过'}）`,
  );
  if (!phyOk) failed += 1;

  /* ------------- 接线检查：化学（三重表征 + 化学用语 + 全题过关） ------------- */

  /**
   * 化学这一科最容易被「页面没报错」掩盖的三件事：
   *   ① 三重表征的教学标签（宏观/微观/符号）没渲染出来 → 学生看不到三种表达的对应；
   *   ② **化学方程式**与**实验**这两块是化学独有的，漏接就等于丢了这一科的核心内容；
   *   ③ chem-exam 里整卷与题型专题共用模块 id，分流错会把卷子渲染成知识页。
   */
  const chemTopic = allEntries.find((e) => e.moduleId === 'chem-matter' && !('sections' in e.data));
  const chemAcid = allEntries.find((e) => e.moduleId === 'chem-acid');
  const chemPaper = allEntries.find((e) => e.moduleId === 'chem-exam' && 'sections' in e.data);
  const renderChem = (id: string) => {
    const mod = allEntries.find((x) => x.id === id)?.moduleId ?? 'chem-matter';
    return renderToString(
      <MemoryRouter initialEntries={[`/s/chemistry/${mod}/${id}`]}>
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '');
  };
  const chemHtml = chemTopic ? renderChem(chemTopic.id) : '';
  const chemAcidHtml = chemAcid ? renderChem(chemAcid.id) : '';
  const chemPaperHtml = chemPaper ? renderChem(chemPaper.id) : '';
  const chemModuleHtml = renderToString(
    <MemoryRouter initialEntries={['/s/chemistry/chem-matter']}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

  const chemChecks: [string, boolean][] = [
    ['问题与理解的关键', chemHtml.includes('要解决的问题') && chemHtml.includes('理解的关键')],
    ['三重表征标签（宏观/微观/符号）', chemHtml.includes('宏观') && chemHtml.includes('微观') && chemHtml.includes('符号')],
    ['理解过程分步渲染', chemHtml.includes('理解过程') && /physics-step__title/.test(chemHtml)],
    ['化学方程式块', chemHtml.includes('化学方程式') && /chem-equation__eq/.test(chemHtml)],
    ['实验块（含现象与注意事项）', /chem-experiment__title/.test(chemAcidHtml) && chemAcidHtml.includes('注意事项')],
    ['图解渲染成 SVG', /<svg[^>]*class="fig__svg"/.test(chemHtml)],
    [
      '过关清单（全题过关才掌握）',
      chemHtml.includes('过关清单') && chemHtml.includes('全部题目都过关才算掌握') && /physics-quizItem/.test(chemHtml),
    ],
    ['综合题与踩分点入口', chemHtml.includes('看参考答案与踩分点')],
    ['模拟卷结构表（选择 12 题 + 非选择 5 题）', chemPaperHtml.includes('试卷结构') && chemPaperHtml.includes('非选择题')],
    ['模块页有化学条目', chemModuleHtml.includes('化学') && /list-item__title/.test(chemModuleHtml)],
    ['图元自测：化学装置与粒子（液体颜色/火焰/原子/分子）', chemPrimsOk],
    // 无色液体也要看得见液面：否则「液面在哪」在图上消失
    ['图元自测：无色液体的液面线', colorlessOk],
  ];
  const chemOk = chemChecks.every(([, ok]) => ok);
  console.log(
    `  ${chemOk ? '✅' : '❌'} 接线检查：化学（${chemChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || `${chemChecks.length} 类断言全通过`}）`,
  );
  if (!chemOk) failed += 1;
}

/* ------------- 接线检查：语文中考专题（内容写了必须真的渲染出来） ------------- */

/**
 * 这一块的坑特别隐蔽：专题详情页少一个 `case`（或 `searchText` 少一个分支）时，
 * 页面会落到 `DetailPage` 的 default 分支渲染「暂不支持该模块」，或者干脆抛异常——
 * 路由渲染不报错、冒烟测试也不会红，但学生点进去什么都看不到，整块内容等于白写。
 * 所以这里直接断言专题页真的渲染出了考情、讲解（含示范）与训练入口。
 */
const zhTopicEntries = allEntries.filter((e) => e.moduleId === 'zh-topics');
const zhTopic = zhTopicEntries[0];
const zhTopicHtml = zhTopic
  ? renderToString(
      <MemoryRouter initialEntries={[`/s/chinese/zh-topics/${zhTopic.id}`]}>
        <AppWithProviders />
      </MemoryRouter>,
    ).replace(/<!--[\s\S]*?-->/g, '')
  : '';
const zhTopicChecks: [string, boolean][] = [
  ['语文中考专题共 7 个', zhTopicEntries.length === 7],
  ['专题页渲染出专题名', Boolean(zhTopic) && zhTopicHtml.includes(zhTopic.title)],
  ['不是「暂不支持该模块」空态', zhTopicHtml.length > 0 && !zhTopicHtml.includes('暂不支持该模块')],
  ['近五年考情逐年渲染', ['2021', '2022', '2023', '2024', '2025'].every((y) => zhTopicHtml.includes(y))],
  ['分步讲解带示范', zhTopicHtml.includes('示范')],
  ['攻破标准（全题过关）', zhTopicHtml.includes('攻破')],
  ['训练分组与「刷这一组」入口', zhTopicHtml.includes('刷这一组') && zhTopicHtml.includes('?tag=')],
];
const zhTopicOk = zhTopicChecks.every(([, ok]) => ok);
console.log(
  `  ${zhTopicOk ? '✅' : '❌'} 接线检查：语文中考专题（${zhTopicChecks
    .filter(([, ok]) => !ok)
    .map(([n]) => n)
    .join('、') || `${zhTopicChecks.length} 类断言全通过`}）`,
);
if (!zhTopicOk) failed += 1;

/* ------------- 接线检查：学段筛选（选了的学段必须真的生效） ------------- */

/**
 * 学段筛选曾出过两类 bug，都很隐蔽、都不会让页面报错：
 *   ① 模块页把学生的选择「自动适配」回去——在单册模块（历史 hist-9b 等）点「九上」
 *      会被立刻弹回本册学段，学生看到的现象是「点九下没反应 / 怎么每次进来都是九上」；
 *   ② 学科页选好学段后，模块卡片不带 `?grade=`，点进去又回到全局学段。
 *
 * 这里用一份 `grade: '9b'` 的 localStorage 渲染四个页面来把这两点锁住：
 * 既验证「手动选择优先」，也验证「没人选时自动适配仍不让学生撞空白」。
 */
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) =>
    k.includes('xueer')
      ? JSON.stringify({
          progress: {},
          wrong: {},
          checkins: [],
          daily: {},
          grade: '9b',
          totalSeconds: 0,
          recite: {},
          cards: {},
        })
      : null,
  setItem: () => {},
  removeItem: () => {},
} as unknown;

const renderRoute = (route: string) =>
  renderToString(
    <MemoryRouter initialEntries={[route]}>
      <AppWithProviders />
    </MemoryRouter>,
  ).replace(/<!--[\s\S]*?-->/g, '');

/** 某个学段 chip 是否处于高亮态（ModulePage 的 chip 只渲染 class，不渲染事件与其它属性） */
const isActiveGrade = (html: string, short: string) =>
  html.includes(`class="chip is-active">${short}</button>`);

// 没人手动选：进「九上」单册模块时全局学段是九下，应自动落到本册，而不是筛成空白
const histAdaptHtml = renderRoute('/s/history/hist-9a');
// 手动选「九上」再进「九下」单册模块：选择必须优先，不能被自动适配弹回
const histPickedHtml = renderRoute('/s/history/hist-9b?grade=9a');
// 学科页的学段要跟着模块卡片走
const histSubjectHtml = renderRoute('/s/history');
// 学段过滤必须真的过滤列表内容（九下 / 九上各看一遍）
const poems9bHtml = renderRoute('/s/chinese/poems?grade=9b');
const poems9aHtml = renderRoute('/s/chinese/poems?grade=9a');

const gradeChecks: [string, boolean][] = [
  [
    '模块页：无人手动选时自动落到本册学段（不空白）',
    isActiveGrade(histAdaptHtml, '九上') && histAdaptHtml.includes('list-item__title'),
  ],
  ['模块页：手动选「九上」不被自动适配弹回', isActiveGrade(histPickedHtml, '九上')],
  [
    '模块页：该学段确无内容时给诚实空态，不混入别册条目',
    histPickedHtml.includes('暂无内容') && !histPickedHtml.includes('list-item__title'),
  ],
  ['学科页：模块卡片带上学段 ?grade=9b', histSubjectHtml.includes('/s/history/hist-9b?grade=9b')],
  [
    '模块页：?grade=9b 只列九下篇目',
    poems9bHtml.includes('渔家傲·秋思') && !poems9bHtml.includes('沁园春·雪'),
  ],
  [
    '模块页：?grade=9a 只列九上篇目',
    poems9aHtml.includes('沁园春·雪') && !poems9aHtml.includes('渔家傲·秋思'),
  ],
];
const gradeOk = gradeChecks.every(([, ok]) => ok);
console.log(
  `  ${gradeOk ? '✅' : '❌'} 接线检查：学段筛选（${
    gradeChecks
      .filter(([, ok]) => !ok)
      .map(([n]) => n)
      .join('、') || '六类断言全通过'
  }）`,
);
if (!gradeOk) failed += 1;

if (failed) {
  console.log('\n❌ 存在渲染失败或接线异常的页面');
  process.exitCode = 1;
} else {
  console.log('✅ 所有页面均可在真实数据下正常渲染');
}
console.log('');
