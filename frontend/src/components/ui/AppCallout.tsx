
export type AppCalloutVariant = "info" | "alert" | "error";

export type AppCalloutProps = {
  variant?: AppCalloutVariant;
  label?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  announce?: boolean;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="app-callout__icon-svg"
    >
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 8v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="5.5" r="1" fill="currentColor" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="app-callout__icon-svg"
    >
      <path
        d="M10 3.5 17 16.5H3L10 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 8v3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="app-callout__icon-svg"
    >
      <path
        d="M10 2.5 16.5 6.2v7.6L10 17.5l-6.5-3.7V6.2L10 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.8v4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14.2" r="1" fill="currentColor" />
    </svg>
  );
}

function getDefaultIcon(variant: AppCalloutVariant) {
  switch (variant) {
    case "alert":
      return <AlertIcon />;
    case "error":
      return <ErrorIcon />;
    case "info":
    default:
      return <InfoIcon />;
  }
}

export function AppCallout({
  variant = "info",
  label,
  children,
  icon,
  className,
  announce = false,
}: AppCalloutProps) {
  const content = children ?? label;

  const role = announce ? (variant === "error" ? "alert" : "status") : undefined;

  return (
    <div
      className={cx("app-callout", `app-callout--${variant}`, className)}
      role={role}
    >
      <span className="app-callout__icon" aria-hidden="true">
        {icon ?? getDefaultIcon(variant)}
      </span>

      <div className="app-callout__content">{content}</div>
    </div>
  );
}