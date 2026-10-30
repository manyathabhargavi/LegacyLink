import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Users, ClipboardList, Activity, ArrowUpRight, ShieldCheck, Clock3, RefreshCw } from "lucide-react";
import { api, getList, getPayload } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ assets: [], contacts: [], requests: [], monitoring: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    const results = await Promise.allSettled([api.get("/assets"), api.get("/contacts"), api.get("/access-requests"), api.get("/monitoring/status")]);
    setData({
      assets: results[0].status === "fulfilled" ? getList(results[0].value) : [],
      contacts: results[1].status === "fulfilled" ? getList(results[1].value) : [],
      requests: results[2].status === "fulfilled" ? getList(results[2].value) : [],
      monitoring: results[3].status === "fulfilled" ? getPayload(results[3].value) : null
    });
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) setError(`${failed.length} dashboard service(s) could not be loaded. Check that the corresponding backend routes are ready.`);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  const pending = data.requests.filter((r) => String(r.status || "").toLowerCase() === "pending").length;
  const name = user?.name || user?.fullName || user?.email?.split("@")[0] || "there";
  const stats = [
    { label: "Digital assets", value: data.assets.length, icon: Boxes, to: "/assets", hint: "Your registered assets" },
    { label: "Trusted contacts", value: data.contacts.length, icon: Users, to: "/contacts", hint: "People you've added" },
    { label: "Pending requests", value: pending, icon: ClipboardList, to: "/access-requests", hint: "Awaiting a decision" },
    { label: "Monitoring", value: data.monitoring ? (data.monitoring.status || data.monitoring.state || "Available") : "—", icon: Activity, to: "/monitoring", hint: "Check-in status" }
  ];
  return <><PageHeader title={`Welcome back, ${name}`} description="A clear overview of your digital legacy workspace." action={<button className="button button-secondary" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button>} /><Alert>{error}</Alert>
    {loading ? <LoadingInline label="Loading your dashboard…" /> : <>
      <div className="stats-grid">{stats.map(({ label, value, icon: Icon, to, hint }) => <Link to={to} className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19} /></span></div><div className="stat-value">{value}</div><div className="stat-hint">{hint}<ArrowUpRight size={14} /></div></Link>)}</div>
      <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Get started</h2><p>Complete the key steps to prepare your workspace.</p></div><ShieldCheck size={21} /></div><div className="quick-links"><Link to="/assets"><span className="quick-icon"><Boxes size={19} /></span><span><strong>Add a digital asset</strong><small>Record an account, policy, domain or document.</small></span><ArrowUpRight size={17} /></Link><Link to="/contacts"><span className="quick-icon"><Users size={19} /></span><span><strong>Add a trusted contact</strong><small>Use the email of an already registered user.</small></span><ArrowUpRight size={17} /></Link><Link to="/designations"><span className="quick-icon"><ClipboardList size={19} /></span><span><strong>Set a designation</strong><small>Choose which contact is associated with an asset.</small></span><ArrowUpRight size={17} /></Link><Link to="/monitoring"><span className="quick-icon"><Clock3 size={19} /></span><span><strong>Confirm you're active</strong><small>Review your check-in and monitoring status.</small></span><ArrowUpRight size={17} /></Link></div></section>
      <section className="panel"><div className="panel-heading"><div><h2>Recent assets</h2><p>Your latest registered items.</p></div><Link className="text-link" to="/assets">View all</Link></div>{data.assets.length ? <div className="recent-list">{data.assets.slice(0,4).map((a) => <div className="recent-item" key={a.id}><div className="asset-mini"><Boxes size={17} /></div><div className="recent-main"><strong>{a.name || a.title || "Untitled asset"}</strong><small>{a.category || "Uncategorized"}</small></div><StatusBadge status={a.status || "Active"} /></div>)}</div> : <EmptyState title="No assets yet" description="Add your first asset to begin organizing your digital legacy." />}</section></div>
      <div className="notice-strip"><ShieldCheck size={19} /><p><strong>Important:</strong> a designation or inactivity warning does not automatically grant document access. The backend must authorize any release.</p></div>
    </>}
  </>;
}
