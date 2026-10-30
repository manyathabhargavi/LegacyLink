import { useEffect, useState } from "react";
import { ClipboardList, Send, ShieldCheck, ExternalLink } from "lucide-react";
import { api, getList } from "../api/client";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { setRequests(getList(await api.get("/access-requests"))); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function requestAccess(item) {
    const designationId = item.designationId ?? item.designation_id ?? item.id;
    if (!window.confirm("Submit an access request for this designated asset? The backend will verify your eligibility.")) return;
    setBusyId(item.id); setError(""); setSuccess("");
    try { await api.post("/access-requests", { designationId, assetId: item.assetId ?? item.asset_id }); setSuccess("Access request submitted. Its status will be shown when the backend returns it."); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  }
  const isDesignated = (r) => Boolean(r.isDesignated || r.designated || r.designationId || r.designation_id);
  const canAccess = (r) => r.accessPermitted === true || r.access_permitted === true || r.canAccessDocument === true || r.can_access_document === true;
  return <><PageHeader title="Legacy access requests" description="Review requests associated with assets designated for you, and track requests you have submitted." action={<button className="button button-secondary" onClick={load}>Refresh</button>} /><Alert>{error}</Alert><Alert type="success">{success}</Alert><section className="panel"><div className="panel-heading"><div><h2>Requests and designated assets</h2><p>Only records returned by your authenticated API are displayed.</p></div><ClipboardList size={21} /></div>{loading ? <LoadingInline label="Loading access requests…" /> : requests.length ? <div className="request-list">{requests.map((r) => <article className="request-card" key={r.id}><div className="request-card-top"><div className="request-symbol"><ClipboardList size={19} /></div><div className="request-card-title"><strong>{r.assetName || r.asset?.name || r.asset_name || "Designated asset"}</strong><span>{r.ownerName || r.owner?.name || r.requesterName || r.requester?.name || "Request details"}</span></div><StatusBadge status={r.status || "Pending"} /></div>{r.note && <p className="request-note">{r.note}</p>}<div className="request-card-actions">{isDesignated(r) && String(r.status || "").toLowerCase() !== "pending" && <button className="button button-primary button-small" disabled={busyId === r.id} onClick={() => requestAccess(r)}><Send size={15} /> {busyId === r.id ? "Submitting…" : "Request access"}</button>}{canAccess(r) ? <button className="button button-secondary button-small" onClick={() => window.alert("The backend confirms access is permitted, but the exact document retrieval route must be confirmed with the backend team.")}><ExternalLink size={15} /> Document access available</button> : <span className="access-locked"><ShieldCheck size={15} /> Document access not confirmed</span>}</div></article>)}</div> : <EmptyState title="No access records available" description="When the backend returns your designated assets or access requests, they will appear here." />}</section><p className="form-hint page-footnote">If this endpoint returns only requests you submitted and not assets designated for you, ask the backend team for a dedicated “designated assets for current contact” endpoint. The frontend cannot safely infer that list from unrelated records.</p></>;
}
