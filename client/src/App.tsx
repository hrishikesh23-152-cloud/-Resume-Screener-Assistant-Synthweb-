import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.js";
import AnalysisDetailsPage from "./pages/AnalysisDetailsPage.js";
import DashboardPage from "./pages/DashboardPage.js";
import HistoryPage from "./pages/HistoryPage.js";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="analysis/:id" element={<AnalysisDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
