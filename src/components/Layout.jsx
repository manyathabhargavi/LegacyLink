import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Boxes, Users, GitBranch, ShieldCheck, ClipboardList, Activity, LogOut, Menu, X, Link2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/assets", label: "Digital assets", icon: Boxes },
  { to: "/contacts", label: "Trusted contacts", icon: Users },
  { to: "/designations", label: "Designations", icon: GitBranch },
  { to: "/access-requests", label: "Access requests", icon: ClipboardList },
  { to: "/reviewer", label: "Reviewer dashboard", icon: ShieldCheck },
  { to: "/monitoring", label: "Check-in & monitoring", icon: Activity }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user?.name || user?.fullName || user?.email || "Account";
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Link2 size={21} /></div><div><strong>LegacyLink</strong><span>Digital legacy, secured</span></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}><Icon size={18} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="security-note"><ShieldCheck size={18} /><div><strong>Access is controlled</strong><p>The server decides who can access each record.</p></div></div><button className="logout-button" onClick={handleLogout}><LogOut size={17} /> Log out</button></div>
    </aside>
    {mobileOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>LegacyLink</strong></div><div className="topbar-user"><div className="avatar">{String(displayName).slice(0,1).toUpperCase()}</div><div><strong>{displayName}</strong><span>Signed in</span></div></div></header>
      <div className="page-content"><Outlet /></div>
      <footer className="app-footer">Digital LegacyLink <span>•</span> Secure organization, controlled access, clear accountability</footer>
    </main>
  </div>;
}
