import "./ui.css";
import { AppButton } from "./AppButton";

type AppHeaderProps = {
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onMySpaceClick?: () => void;
};

export function AppHeader({
  isAuthenticated = false,
  onLoginClick,
  onMySpaceClick,
}: AppHeaderProps) {
  return (
    <header className="ds-header ds-card">
      <div className="ds-brand">DataShare</div>

      {isAuthenticated ? (
        <AppButton variant="primary" onPress={onMySpaceClick}>
          Mon espace
        </AppButton>
      ) : (
        <AppButton variant="primary" onPress={onLoginClick}>
          Se connecter
        </AppButton>
      )}
    </header>
  );
}