import { useEffect, useState } from "react";
import { Activity, Clock3, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { api, getPayload } from "../api/client";
import { Alert, LoadingInline, PageHeader, StatusBadge } from "../components/UI";

export default function Monitoring() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { setStatus(getPayload(await api.get("/monitoring/status"))); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function checkIn() {
    setCheckingIn(true); setError(""); setSuccess("");
    try {
      await api.post("/check-in", {});
      setSuccess("Check-in recorded by the backend.");
      await load();
    } catch (e) { setError(e.message); }
    finally { setCheckingIn(false); }
  }
  const lastCheckIn = status?.lastCheckIn || status?.last_check_in || status?.lastCheckinAt || status?.last_checkin_at;
  const state = status?.status || status?.state || status?.monitoringStatus || status?.monitoring_status || "Status unavailable";
  return <><PageHeader title="Check-in & monitoring" description="Record activity and review the monitoring status returned by the backend." action={<button className="button button-secondary" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button>} /><Alert>{error}</Alert><Alert type="success">{success}</Alert>{loading ? <LoadingInline label="Loading monitoring status…" /> : <div className="monitoring-grid"><section className="panel monitoring-main"><div className="monitoring-illustration"><Activity size={30} /></div><div className="eyebrow">YOUR MONITORING STATUS</div><h2>{String(state).replaceAll("_", " ")}</h2><p>The status shown here comes from the backend. A warning or missed check-in must not automatically release documents.</p><StatusBadge status={state} /><div className="last-checkin"><Clock3 size={18} /><div><span>Last check-in</span><strong>{lastCheckIn ? new Date(lastCheckIn).toLocaleString() : "Not supplied by backend"}</strong></div></div><button className="button button-primary button-full checkin-button" onClick={checkIn} disabled={checkingIn}>{checkingIn ? "Recording check-in…" : "Confirm I'm Active"} <CheckCircle2 size={17} /></button></section><section className="panel"><div className="panel-heading"><div><h2>How monitoring works</h2><p>What to expect from the process.</p></div><ShieldCheck size={21} /></div><div className="process-steps"><div><span>1</span><section><strong>Confirm activity</strong><p>You manually submit a check-in.</p></section></div><div><span>2</span><section><strong>Monitor inactivity</strong><p>The backend evaluates check-in timing and its configured rules.</p></section></div><div><span>3</span><section><strong>Verify and review</strong><p>Any legacy release requires the configured evidence and approval workflow.</p></section></div><div><span>4</span><section><strong>Audit the decision</strong><p>Authorized backend actions should be recorded for accountability.</p></section></div></div></section></div>}<div className="notice-strip"><ShieldCheck size={19} /><p><strong>Safety rule:</strong> inactivity alone is not proof of death or incapacity and does not itself authorize access. Backend checks and reviewer approval must enforce the actual policy.</p></div></>;
}
