import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppButton } from "./AppButton";
import "./ui.css";

export type AppHeaderProps = {
  isAuthenticated?: boolean;
  isMobile?: boolean;
  brand?: ReactNode;
  brandHref?: string;
  loginLabel?: string;
  accountLabel?: string;
  onLoginClick?: () => void;
  onAccountClick?: () => void;
  loginHref?: string;
  accountHref?: string;
  className?: string;
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type HeaderActionProps = {
  label: string;
  href?: string;
  onPress?: () => void;
  className?: string;
};

function HeaderAction({ label, href, onPress, className }: HeaderActionProps) {
  if (href) {
    return (
      <Link to={href} className="app-header__action-link">
        <AppButton className={className} variant="dark" size="sm">
          {label}
        </AppButton>
      </Link>
    );
  }

  return (
    <AppButton
      type="button"
      onPress={onPress}
      className={className}
      variant="dark"
      size="sm"
    >
      {label}
    </AppButton>
  );
}

export function AppHeader({
  isAuthenticated = false,
  isMobile = false,
  brand = "DataShare",
  brandHref = "/",
  loginLabel = "Se connecter",
  accountLabel = "Mon espace",
  onLoginClick,
  onAccountClick,
  loginHref,
  accountHref,
  className,
}: AppHeaderProps) {
  const actionLabel = isAuthenticated ? accountLabel : loginLabel;
  const actionHref = isAuthenticated ? accountHref : loginHref;
  const actionPress = isAuthenticated ? onAccountClick : onLoginClick;

  const brandTitle = typeof brand === "string" ? brand : undefined;

  const brandContent = brandHref ? (
    <Link
      to={brandHref}
      className="app-header__brand-link"
      aria-label={`${brandTitle ?? "Accueil"} — Accueil`}
    >
      {brand}
    </Link>
  ) : (
    brand
  );

  return (
    <header
      className={joinClassNames(
        "app-header",
        isMobile ? "app-header--mobile" : "app-header--desktop",
        className
      )}
    >
      <nav className="app-header__inner" aria-label="Navigation principale">
        <div className="app-header__brand" title={brandTitle}>
          {brandContent}
        </div>

        <div className="app-header__actions">
          <HeaderAction
            label={actionLabel}
            href={actionHref}
            onPress={actionPress}
            className="app-header__action"
          />
        </div>
      </nav>
    </header>
  );
}

export default AppHeader;