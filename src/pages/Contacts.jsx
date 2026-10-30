import { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Mail, ShieldCheck } from "lucide-react";
import { api, getList } from "../api/client";
import { Alert, EmptyState, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    setLoading(true);
    try { setContacts(getList(await api.get("/contacts"))); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault(); setError(""); setSuccess("");
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Enter a valid email address.");
    setBusy(true);
    try { await api.post("/contacts", { email: cleanEmail }); setEmail(""); setSuccess("Trusted contact added."); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function remove(contact) {
    if (!window.confirm(`Remove ${contact.name || contact.email || "this contact"}?`)) return;
    setError(""); setSuccess("");
    try { await api.delete(`/contacts/${contact.id}`); setSuccess("Trusted contact removed."); await load(); }
    catch (e) { setError(e.message); }
  }
  return <><PageHeader title="Trusted contacts" description="Manage people who may be designated for selected assets." /><Alert>{error}</Alert><Alert type="success">{success}</Alert><div className="two-column-layout"><section className="panel"><div className="panel-heading"><div><h2>Add a contact</h2><p>Use the email tied to their existing account.</p></div><UserPlus size={21} /></div><form className="form-stack" onSubmit={add}><label>Contact email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" required /></label><button className="button button-primary" disabled={busy}>{busy ? "Adding…" : "Add trusted contact"} <UserPlus size={16} /></button></form><div className="notice-strip"><ShieldCheck size={18} /><p>The contact must already have a registered account. The backend verifies whether the email belongs to a valid user.</p></div></section><section className="panel"><div className="panel-heading"><div><h2>Your contacts</h2><p>{contacts.length} saved contact{contacts.length === 1 ? "" : "s"}</p></div><Users size={21} /></div>{loading ? <LoadingInline /> : contacts.length ? <div className="contact-list">{contacts.map((c) => <div className="contact-item" key={c.id}><div className="contact-avatar">{String(c.name || c.email || "?").slice(0,1).toUpperCase()}</div><div className="contact-main"><strong>{c.name || c.fullName || "Registered user"}</strong><span><Mail size={13} /> {c.email || c.contactEmail || "Email not provided"}</span><StatusBadge status={c.status || "Active"} /></div><button className="icon-button danger-icon" title="Remove contact" onClick={() => remove(c)}><Trash2 size={16} /></button></div>)}</div> : <EmptyState title="No trusted contacts" description="Add an existing registered user to get started." />}</section></div></>;
}
