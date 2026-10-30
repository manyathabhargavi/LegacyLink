import { useEffect, useState } from "react";
import { GitBranch, Plus, Trash2, ShieldCheck } from "lucide-react";
import { api, getList } from "../api/client";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

export default function Designations() {
  const [assets, setAssets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [form, setForm] = useState({ assetId: "", contactId: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    setLoading(true); setError("");
    const results = await Promise.allSettled([api.get("/assets"), api.get("/contacts"), api.get("/designations")]);
    if (results[0].status === "fulfilled") setAssets(getList(results[0].value)); else setError(results[0].reason.message);
    if (results[1].status === "fulfilled") setContacts(getList(results[1].value)); else setError((old) => old || results[1].reason.message);
    if (results[2].status === "fulfilled") setDesignations(getList(results[2].value)); else setError((old) => old || results[2].reason.message);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.assetId || !form.contactId) return setError("Choose both an asset and a trusted contact.");
    setBusy(true);
    try { await api.post("/designations", { assetId: form.assetId, contactId: form.contactId }); setSuccess("Designation submitted."); setForm({ assetId: "", contactId: "" }); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function revoke(item) {
    if (!window.confirm("Revoke this designation? This does not itself revoke any separately approved access; the backend must enforce its access policy.")) return;
    setError(""); setSuccess("");
    try { await api.delete(`/designations/${item.id}`); setSuccess("Designation revoked."); await load(); }
    catch (e) { setError(e.message); }
  }
  const assetName = (id) => assets.find((a) => String(a.id) === String(id))?.name || "Asset";
  const contactName = (id) => { const c = contacts.find((x) => String(x.id) === String(id)); return c?.name || c?.email || "Contact"; };
  return <><PageHeader title="Asset designations" description="Associate a trusted contact with a specific asset." /><Alert>{error}</Alert><Alert type="success">{success}</Alert><div className="two-column-layout"><section className="panel"><div className="panel-heading"><div><h2>Create designation</h2><p>Select the asset and contact.</p></div><Plus size={21} /></div>{loading ? <LoadingInline /> : <form className="form-stack" onSubmit={submit}><label>Digital asset<select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required><option value="">Choose an asset…</option>{assets.map((a) => <option key={a.id} value={a.id}>{a.name || `Asset ${a.id}`}</option>)}</select></label><label>Trusted contact<select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} required><option value="">Choose a contact…</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name || c.email || `Contact ${c.id}`}</option>)}</select></label><button className="button button-primary" disabled={busy || !assets.length || !contacts.length}>{busy ? "Submitting…" : "Create designation"} <GitBranch size={16} /></button>{(!assets.length || !contacts.length) && <p className="form-hint">Add at least one asset and one trusted contact before creating a designation.</p>}</form>}<div className="notice-strip"><ShieldCheck size={18} /><p>A designation is not automatic permission to read a document. Access must be separately approved and enforced by the backend.</p></div></section><section className="panel"><div className="panel-heading"><div><h2>Current designations</h2><p>Assignments returned by the API.</p></div><GitBranch size={21} /></div>{loading ? <LoadingInline /> : designations.length ? <div className="designation-list">{designations.map((d) => <div className="designation-item" key={d.id}><div className="designation-symbol"><GitBranch size={18} /></div><div className="designation-main"><strong>{d.assetName || assetName(d.assetId ?? d.asset_id)}</strong><span>For {d.contactName || contactName(d.contactId ?? d.contact_id)}</span><StatusBadge status={d.status || "Active"} /></div><button className="icon-button danger-icon" title="Revoke designation" onClick={() => revoke(d)}><Trash2 size={16} /></button></div>)}</div> : <EmptyState title="No designations yet" description="Create a designation to associate an asset with a trusted contact." />}</section></div></>;
}
