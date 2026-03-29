import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { AppHeader } from "./components/ui/AppHeader";
import "./components/ui/ui.css";
import AppRouter from "./routes/AppRouter";

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="ds-app-shell">
      <div className="ds-app-frame">
        <div className="ds-app-header-slot">
          <AppHeader
            brand="DataShare"
            isAuthenticated={isAuthenticated}
            loginHref="/login"
            accountHref="/my-space"
          />
        </div>

        <main className="ds-page">
          <AppRouter />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}