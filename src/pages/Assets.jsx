import { useEffect, useState } from "react";
import { Boxes, Plus, Search, Pencil, Trash2, X, Eye, ArrowLeft } from "lucide-react";
import { api, getList, getPayload } from "../api/client";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

const blank = { name: "", category: "Other", description: "" };
const categories = ["Email", "Cloud storage", "Social media", "Banking / insurance", "Subscription", "Domain", "Legal document", "Digital media", "Other"];

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try { setAssets(getList(await api.get("/assets"))); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function startCreate() { setForm(blank); setEditingId(null); setError(""); setSuccess(""); setMode("form"); }
  function startEdit(asset) { setForm({ name: asset.name || "", category: asset.category || "Other", description: asset.description || "" }); setEditingId(asset.id); setError(""); setSuccess(""); setMode("form"); }
  async function submit(e) {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.name.trim()) return setError("Enter an asset name.");
    setBusy(true);
    try {
      if (editingId != null) await api.put(`/assets/${editingId}`, { ...form, name: form.name.trim(), description: form.description.trim() });
      else await api.post("/assets", { ...form, name: form.name.trim(), description: form.description.trim() });
      setSuccess(editingId != null ? "Asset updated successfully." : "Asset added successfully.");
      setMode("list"); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function remove(asset) {
    if (!window.confirm(`Delete "${asset.name || "this asset"}"? This action may be permanent.`)) return;
    setError(""); setSuccess("");
    try { await api.delete(`/assets/${asset.id}`); setSuccess("Asset deleted."); await load(); }
    catch (e) { setError(e.message); }
  }
  async function view(asset) {
    setError(""); setSelected(asset); setMode("detail");
    if (asset.id == null) return;
    try { const payload = getPayload(await api.get(`/assets/${asset.id}`)); setSelected(payload?.asset ?? payload); }
    catch (e) { setError(e.message); }
  }
  const visible = assets.filter((a) => `${a.name || ""} ${a.category || ""} ${a.description || ""}`.toLowerCase().includes(query.toLowerCase()));

  if (mode === "form") return <><PageHeader title={editingId != null ? "Edit asset" : "Add a digital asset"} description="Record the information needed to identify your digital asset." action={<button className="button button-secondary" onClick={() => setMode("list")}><ArrowLeft size={16} /> Back to assets</button>} /><Alert>{error}</Alert><section className="panel form-panel"><form className="form-stack" onSubmit={submit}><label>Asset name *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Personal cloud storage" required maxLength={120} /></label><label>Category *<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add non-sensitive details to help identify this asset." rows={4} maxLength={2000} /></label><div className="notice-strip"><Boxes size={18} /><p>Do not enter passwords, recovery codes, private keys or other secrets in the description.</p></div><div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setMode("list")}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : editingId != null ? "Save changes" : "Add asset"}</button></div></form><div className="dependency-note"><strong>Document uploads</strong><p>Upload support is not enabled here because the exact backend upload route and request format must first be confirmed with the backend team. This form will not pretend an upload succeeded.</p></div></section></>;

  if (mode === "detail" && selected) return <><PageHeader title={selected.name || "Asset details"} description="Review the information returned by the backend." action={<button className="button button-secondary" onClick={() => setMode("list")}><ArrowLeft size={16} /> Back</button>} /><Alert>{error}</Alert><section className="panel detail-panel"><div className="detail-icon"><Boxes size={26} /></div><div className="detail-row"><span>Category</span><strong>{selected.category || "Not provided"}</strong></div><div className="detail-row"><span>Description</span><p>{selected.description || "No description provided."}</p></div><div className="detail-row"><span>Record ID</span><code>{selected.id ?? "Not provided by API"}</code></div><div className="detail-row"><span>Status</span><StatusBadge status={selected.status || "Active"} /></div><div className="form-actions"><button className="button button-secondary" onClick={() => startEdit(selected)}><Pencil size={16} /> Edit</button><button className="button button-danger" onClick={() => remove(selected)}><Trash2 size={16} /> Delete</button></div></section></>;

  return <><PageHeader title="Digital assets" description="Keep a structured inventory of accounts, policies, domains and other digital items." action={<button className="button button-primary" onClick={startCreate}><Plus size={17} /> Add asset</button>} /><Alert type="success">{success}</Alert><Alert>{error}</Alert><section className="panel"><div className="list-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search assets…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><span className="result-count">{visible.length} record{visible.length === 1 ? "" : "s"}</span></div>{loading ? <LoadingInline label="Loading assets from the backend…" /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Asset</th><th>Category</th><th>Status</th><th className="align-right">Actions</th></tr></thead><tbody>{visible.map((a) => <tr key={a.id}><td><div className="table-primary"><span className="asset-mini"><Boxes size={16} /></span><span><strong>{a.name || a.title || "Untitled asset"}</strong><small>{a.description || "No description"}</small></span></div></td><td>{a.category || "Other"}</td><td><StatusBadge status={a.status || "Active"} /></td><td><div className="table-actions"><button className="icon-button" title="View details" onClick={() => view(a)}><Eye size={17} /></button><button className="icon-button" title="Edit asset" onClick={() => startEdit(a)}><Pencil size={16} /></button><button className="icon-button danger-icon" title="Delete asset" onClick={() => remove(a)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title={query ? "No matching assets" : "No digital assets yet"} description={query ? "Try a different search term." : "Select “Add asset” to create your first record."} />}</section></>;
}
