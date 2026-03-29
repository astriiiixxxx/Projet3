import { useAuth } from "../AuthContext";
import { UploadForm } from "../components/files/UploadForm";

export default function UploadPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <UploadForm anonymous={!isAuthenticated} />
    </div>
  );
}