import { LoaderCircle } from "lucide-react";

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-tm-dark md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-tm-muted md:text-base">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`tm-glass p-5 transition-all duration-300 hover:shadow-tm-glow ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative">
        {Icon ? (
          <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
            <Icon size={18} />
          </div>
        ) : null}
        <p className="text-sm font-medium text-tm-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold tm-stat-value">{value}</p>
        {helper ? <p className="mt-2 text-sm text-tm-muted">{helper}</p> : null}
      </div>
    </Card>
  );
}

export function SectionTitle({ children, meta }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-tm-dark">{children}</h2>
      {meta ? <div className="text-sm text-tm-muted">{meta}</div> : null}
    </div>
  );
}

export function PrimaryButton({ className = "", ...props }) {
  return (
    <button {...props} className={`tm-btn-primary ${className}`} />
  );
}

export function SecondaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl border border-primary/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-tm-dark backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-tm-glow disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}

export function TextInput({ label, ...props }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-tm-dark">
      <span>{label}</span>
      <input {...props} className="tm-input" />
    </label>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-tm-dark">
      <span>{label}</span>
      <textarea {...props} className="tm-input min-h-28" />
    </label>
  );
}

export function SelectInput({ label, children, ...props }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-tm-dark">
      <span>{label}</span>
      <select {...props} className="tm-input">
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ title, description }) {
  return (
    <Card className="py-12 text-center">
      <h3 className="text-lg font-semibold text-tm-dark">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-tm-muted">{description}</p>
    </Card>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-primary/30 bg-white/60 text-tm-muted backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm font-medium">
        <LoaderCircle className="animate-spin text-primary" size={18} />
        {label}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    cyan: "bg-cyan-100 text-cyan-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-indigo-100 text-indigo-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}
    >
      {children}
    </span>
  );
}

export function AuthCard({ children, className = "" }) {
  return (
    <div className={`tm-glass-strong w-full p-8 shadow-tm-glow-lg ${className}`}>
      {children}
    </div>
  );
}
