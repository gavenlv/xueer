/**
 * 路由表。
 *
 * 页面本身**不做懒加载**：它们每一个只有几 KB，拆出去省不下多少，却会让
 * 服务端渲染（`pnpm smoke` 用 `renderToString` 逐条路由验证）只能拿到
 * Suspense 占位符、看不到真实内容，等于把最有价值的一层回归测试弄瞎。
 * 真正的大块头是**内容数据**与 **KaTeX**，它们分别在数据层与 `DetailPage`
 * 的详情渲染器里按需加载（见 `pages/DetailPage.tsx` 的 lazy 与
 * `components/RichText.tsx` 的动态 import）。
 */

import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';
import ModulePage from './pages/ModulePage';
import DetailPage from './pages/DetailPage';
import PracticePage from './pages/PracticePage';
import WrongBook from './pages/WrongBook';
import StatsPage from './pages/StatsPage';
import ExtrasPage from './pages/ExtrasPage';
import RecitePage from './pages/RecitePage';
import ExamPage from './pages/ExamPage';
import ExamRunPage from './pages/ExamRunPage';
import HistoryReviewPage from './pages/HistoryReviewPage';
import AccountPage from './pages/AccountPage';
import NotFound from './pages/NotFound';

/**
 * 「考点」在不同科目是不同形态的页面：
 * 历史有自己的「考点与考情总复习」（分层考点 + 命题角度 + 材料大题），语文/数学/英语
 * 走按知识点标签聚合的考点页（见 `ExamPage`，它按 `subjectId` 取数据）。
 */
function SubjectExamRoute() {
  const { subjectId = 'chinese' } = useParams();
  if (subjectId === 'history') return <HistoryReviewPage />;
  return <ExamPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="s/:subjectId" element={<SubjectPage />} />
        {/* 科目子页面：背诵 / 错题本 / 考点 / 知识拓展，内容都按本科过滤 */}
        <Route path="s/:subjectId/recite" element={<RecitePage />} />
        <Route path="s/:subjectId/wrong" element={<WrongBook />} />
        <Route path="s/:subjectId/exam" element={<SubjectExamRoute />} />
        <Route path="s/:subjectId/extras" element={<ExtrasPage />} />
        <Route path="s/:subjectId/:moduleId" element={<ModulePage />} />
        <Route path="s/:subjectId/:moduleId/:itemId" element={<DetailPage />} />
        <Route path="practice/:moduleId" element={<PracticePage />} />
        <Route path="practice/:moduleId/:itemId" element={<PracticePage />} />
        <Route path="stats" element={<StatsPage />} />
        {/* 整卷模拟考试（历史 / 英语）：60 分钟、交卷才批改 */}
        <Route path="exam-run/:paperId" element={<ExamRunPage />} />
        <Route path="account" element={<AccountPage />} />
        {/* 旧的全站入口改为跳到对应科目的子页面，站内老链接与浏览器书签都不失效 */}
        <Route path="wrong" element={<Navigate to="/s/chinese/wrong" replace />} />
        <Route path="recite" element={<Navigate to="/s/chinese/recite" replace />} />
        <Route path="exam" element={<Navigate to="/s/chinese/exam" replace />} />
        <Route path="extras" element={<Navigate to="/s/chinese/extras" replace />} />
        <Route path="history-review" element={<Navigate to="/s/history/exam" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
