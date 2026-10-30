import { useEffect, useState } from "react";
import { ShieldCheck, Check, X, MessageSquareText } from "lucide-react";
import { api, getList } from "../api/client";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export default function Reviewer() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forbidden, setForbidden] = useState(false);
  async function load() {
    setLoading(true); setError(""); setForbidden(false);
    try { setRequests(getList(await api.get("/access-requests"))); }
    catch (e) { setError(e.message); if (e.message.includes("403") || e.message.toLowerCase().includes("forbidden")) setForbidden(true); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function decide(item, decision) {
    if (!window.confirm(`${decision === "approve" ? "Approve" : "Reject"} this access request?`)) return;
    setBusyId(item.id); setError(""); setSuccess("");
    try {
      await api.patch(`/access-requests/${item.id}/decision`, { decision, note: notes[item.id] || "" });
      setSuccess(`Request ${decision === "approve" ? "approved" : "rejected"} by the backend.`);
      await load();
    } catch (e) {
      setError(e.message);
      if (e.message.includes("403") || e.message.toLowerCase().includes("forbidden")) setForbidden(true);
    } finally { setBusyId(null); }
  }
  const pending = requests.filter((r) => String(r.status || "").toLowerCase() === "pending");
  const role = String(user?.role || user?.userRole || "").toLowerCase();
  return <><PageHeader title="Reviewer dashboard" description="Review pending requests only if your account has the reviewer role." action={<button className="button button-secondary" onClick={load}>Refresh</button>} /><Alert>{error}</Alert><Alert type="success">{success}</Alert>{forbidden && <div className="notice-strip warning"><ShieldCheck size={19} /><p>The backend denied access. This account may not have reviewer permissions. The frontend cannot grant itself that role.</p></div>}{role && !["admin", "reviewer", "administrator"].includes(role) && <div className="notice-strip warning"><ShieldCheck size={19} /><p>Your account role is <strong>{role}</strong>. The backend remains the authority for reviewer permissions; decision actions may be denied.</p></div>}<section className="panel"><div className="panel-heading"><div><h2>Pending access requests</h2><p>{pending.length} request{pending.length === 1 ? "" : "s"} awaiting a decision</p></div><ShieldCheck size={21} /></div>{loading ? <LoadingInline label="Loading requests…" /> : pending.length ? <div className="review-list">{pending.map((r) => <article className="review-card" key={r.id}><div className="review-top"><div><div className="eyebrow">REQUEST #{r.id}</div><h3>{r.assetName || r.asset?.name || r.asset_name || "Asset request"}</h3></div><StatusBadge status={r.status} /></div><div className="review-meta"><div><span>Requester</span><strong>{r.requesterName || r.requester?.name || r.requesterEmail || r.requester?.email || "Not supplied"}</strong></div><div><span>Owner</span><strong>{r.ownerName || r.owner?.name || r.ownerEmail || r.owner?.email || "Not supplied"}</strong></div></div><label className="note-label"><span><MessageSquareText size={15} /> Decision note (optional)</span><textarea rows={2} placeholder="Explain the reason for this decision…" value={notes[r.id] || ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} /></label><div className="form-actions"><button className="button button-danger" disabled={busyId === r.id} onClick={() => decide(r, "reject")}><X size={16} /> Reject</button><button className="button button-primary" disabled={busyId === r.id} onClick={() => decide(r, "approve")}><Check size={16} /> Approve</button></div></article>)}</div> : <EmptyState title="No pending requests" description="Pending requests returned by the backend will appear here." />}</section><p className="form-hint page-footnote">The backend must check reviewer authorization on every decision request. A hidden or disabled button is not a security boundary.</p></>;
}
