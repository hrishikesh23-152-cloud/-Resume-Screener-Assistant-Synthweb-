import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.js";
import DashboardPage from "./pages/DashboardPage.js";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
