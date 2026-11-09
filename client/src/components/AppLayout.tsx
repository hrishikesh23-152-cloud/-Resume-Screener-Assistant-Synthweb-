import { Link, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Resume screener home">
          <span className="brand-mark">RS</span>
          <span>Resume screener</span>
          <span className="brand-divider">/</span>
          <span className="brand-caption">AI-powered candidate evaluation</span>
        </Link>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Resume Screener</span>
        <span>AI evaluations support — not replace — human judgment.</span>
      </footer>
    </div>
  );
}
