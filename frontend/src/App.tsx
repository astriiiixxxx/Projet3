import { useEffect, useState } from "react";
import { apiClient } from "./api/axios";

function App() {
  const [message, setMessage] = useState("chargement...");

  useEffect(() => {
    apiClient
      .get("/health")
      .then((response) => setMessage(response.data))
      .catch(() => setMessage("erreur de connexion au backend"));
  }, []);

  return (
    <main>
      <h1>frontend projet3</h1>
      <p>{message}</p>
    </main>
  );
}

export default App;