import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export function LoadingScreen({ label = "Loading…" }) {
  return <div className="loading-screen"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function LoadingInline({ label = "Loading…" }) {
  return <div className="loading-inline"><LoaderCircle className="spin" size={18} /> {label}</div>;
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={`alert alert-${type}`} role="status"><Icon size={18} /><span>{children}</span></div>;
}

export function StatusBadge({ status }) {
  const normalized = String(status || "Unknown").toLowerCase().replaceAll("_", " ");
  const className = normalized.includes("approv") ? "approved"
    : normalized.includes("reject") ? "rejected"
      : normalized.includes("pending") ? "pending"
        : normalized.includes("active") ? "active" : "neutral";
  return <span className={`status-badge ${className}`}>{normalized}</span>;
}

export function EmptyState({ title = "Nothing here yet", description = "Records will appear here when they are available." }) {
  return <div className="empty-state"><div className="empty-icon">◇</div><h3>{title}</h3><p>{description}</p></div>;
}

export function PageHeader({ eyebrow = "DIGITAL LEGACYLINK", title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>;
}
