import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="PairUp home">
          <span className="brand-mark">P</span>
          <span>PairUp</span>
          <span className="brand-divider">/</span>
          <span className="brand-caption">Resume screener</span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            New analysis
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            History
          </NavLink>
        </nav>
        <div className="workspace-label">
          <span className="status-dot" />
          HR workspace
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>PairUp Resume Screener</span>
        <span>AI evaluations support — not replace — human judgment.</span>
      </footer>
    </div>
  );
}
