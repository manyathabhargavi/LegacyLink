import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Link2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/UI";

function AuthFrame({ title, subtitle, children, footer }) {
  return <div className="auth-page"><div className="auth-visual"><div className="auth-brand"><div className="brand-mark"><Link2 size={22} /></div><span>LegacyLink</span></div><div className="auth-visual-content"><div className="auth-orbit"><ShieldCheck size={45} /></div><div className="eyebrow">YOUR DIGITAL LEGACY, ORGANIZED</div><h1>Keep what matters<br />protected and prepared.</h1><p>Organize your digital assets, define trusted contacts, and keep legacy access under your control.</p></div><div className="auth-visual-foot">Your information. Your choices. Controlled access.</div></div><div className="auth-panel"><div className="auth-form-wrap"><div className="eyebrow">WELCOME TO LEGACYLINK</div><h2>{title}</h2><p className="auth-subtitle">{subtitle}</p>{children}<div className="auth-footer">{footer}</div><p className="auth-disclaimer"><ShieldCheck size={15} /> LegacyLink organizes information; it does not replace legal advice or validate a will.</p></div></div></div>;
}

export function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (token) return <Navigate to="/" replace />;
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError("");
    if (!form.email.trim() || !form.password) return setError("Enter both your email and password.");
    setBusy(true);
    try { await login(form.email.trim(), form.password); navigate(location.state?.from?.pathname || "/", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <AuthFrame title="Sign in to your account" subtitle="Enter your details to continue to your secure workspace." footer={<>New to LegacyLink? <Link to="/register">Create an account <ArrowRight size={14} /></Link></>}>
    <form className="form-stack" onSubmit={submit}><Alert>{error}</Alert><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={update} required /></label><button className="button button-primary button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} /></button></form>
  </AuthFrame>;
}

export function RegisterPage() {
  const { token, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (token) return <Navigate to="/" replace />;
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError("");
    if (form.name.trim().length < 2) return setError("Enter a name with at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Use a password with at least 8 characters, or follow the stronger rule required by your backend.");
    if (form.password !== form.confirmPassword) return setError("The passwords do not match.");
    setBusy(true);
    try { const result = await register(form.name.trim(), form.email.trim(), form.password); navigate(result?.needsLogin ? "/login" : "/", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <AuthFrame title="Create your account" subtitle="Start organizing your digital legacy in one place." footer={<>Already registered? <Link to="/login">Sign in <ArrowRight size={14} /></Link></>}>
    <form className="form-stack" onSubmit={submit}><Alert>{error}</Alert><label>Full name<input name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update} required /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label><label>Password<input name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update} required minLength={8} /></label><label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={update} required /></label><button className="button button-primary button-full" disabled={busy}>{busy ? "Creating account…" : "Create account"} <ArrowRight size={17} /></button><p className="form-hint">Your password is sent to the backend over the API. Never share it with a trusted contact.</p></form>
  </AuthFrame>;
}
