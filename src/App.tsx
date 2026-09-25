import { Route, Routes } from 'react-router-dom';
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
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="s/:subjectId" element={<SubjectPage />} />
        <Route path="s/:subjectId/:moduleId" element={<ModulePage />} />
        <Route path="s/:subjectId/:moduleId/:itemId" element={<DetailPage />} />
        <Route path="practice/:moduleId" element={<PracticePage />} />
        <Route path="practice/:moduleId/:itemId" element={<PracticePage />} />
        <Route path="wrong" element={<WrongBook />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="extras" element={<ExtrasPage />} />
        <Route path="recite" element={<RecitePage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
