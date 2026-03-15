import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function MySpacePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main>
      <h1>Mon espace</h1>
      <p>Connecté avec : {user?.email}</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </main>
  );
}