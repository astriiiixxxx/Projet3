import "./ui.css";

type CalloutVariant = "info" | "warning" | "danger";

type AppCalloutProps = {
  variant?: CalloutVariant;
  children: React.ReactNode;
};

const icons: Record<CalloutVariant, string> = {
  info: "ⓘ",
  warning: "⚠",
  danger: "⊘",
};

export function AppCallout({
  variant = "info",
  children,
}: AppCalloutProps) {
  return (
    <div className={`ds-callout ds-callout-${variant}`}>
      <span aria-hidden="true">{icons[variant]}</span>
      <span>{children}</span>
    </div>
  );
}