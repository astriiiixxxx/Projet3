import { useMemo, useState } from "react";
import { AppSelect } from "../components/ui/AppSelect";
import { AppTextField } from "../components/ui/AppTextField";
import { AppButton } from "../components/ui/AppButton";
import { AppCallout } from "../components/ui/AppCallout";
import { AppHeader } from "../components/ui/AppHeader";
import { AppSegmentedControl } from "../components/ui/AppSegmentedControl";
import "../components/ui/ui.css";

const expirationOptions = [
  { id: "1-day", label: "Une journée" },
  { id: "3-days", label: "3 jours" },
  { id: "7-days", label: "7 jours" },
];

const statusItems = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "expired", label: "Expiré" },
];

const mixedItems = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "expired", label: "Expiré", disabled: true },
];

const viewItems = [
  { id: "card", label: "Carte" },
  { id: "list", label: "Liste" },
];

const longLabelItems = [
  { id: "mine", label: "Mes fichiers" },
  { id: "shared", label: "Partagés récemment" },
  { id: "expired", label: "Fichiers expirés" },
];

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V7M12 7L8.5 10.5M12 7L15.5 10.5M5 16.5V17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UiPreviewPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filledValue, setFilledValue] = useState("exemple@data-share.dev");
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);

  const [segmentedStatusValue, setSegmentedStatusValue] = useState("all");
  const [segmentedSelectedValue, setSegmentedSelectedValue] = useState("active");
  const [segmentedDisabledItemValue, setSegmentedDisabledItemValue] = useState("active");
  const [segmentedDisabledValue] = useState("all");
  const [segmentedLongValue, setSegmentedLongValue] = useState("mine");
  const [segmentedMobileValue, setSegmentedMobileValue] = useState("all");
  const [segmentedTightValue, setSegmentedTightValue] = useState("card");
  const [segmentedInvalidValue, setSegmentedInvalidValue] = useState("");

  const emailInvalid = useMemo(() => {
    if (email.length === 0) return false;
    return !email.includes("@");
  }, [email]);

  const passwordInvalid = useMemo(() => {
    if (password.length === 0) return false;
    return password.length < 8;
  }, [password]);

  const selectInvalid = selectedExpiration === null;
  const segmentedInvalid = segmentedInvalidValue.length === 0;

  return (
    <main className="ds-preview-page">
      <div className="ds-preview-shell">
        <header className="ds-preview-header">
          <p className="ds-preview-eyebrow">design system</p>
          <h1 className="ds-preview-title">UI Preview</h1>
          <p className="ds-preview-intro">
            Page de test des composants branchée sur le vrai projet. On commence
            par l’input component avant intégration dans les pages métier.
          </p>
        </header>

        {/* ================= INPUT ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Input Component</h2>
            <p>
              États visuels, erreurs, accessibilité, largeur desktop et rendu mobile.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card">
              <h3>default</h3>
              <AppTextField
                label="Mot de passe"
                placeholder="Optionnel"
                type="password"
              />
            </article>

            <article className="ds-preview-card">
              <h3>with value</h3>
              <AppTextField
                label="Adresse e-mail"
                placeholder="nom@exemple.com"
                type="email"
                value={filledValue}
                onChange={setFilledValue}
              />
            </article>

            <article className="ds-preview-card">
              <h3>description</h3>
              <AppTextField
                label="Adresse e-mail"
                placeholder="nom@exemple.com"
                description="Nous utiliserons cette adresse pour t’envoyer les informations liées au fichier."
                type="email"
              />
            </article>

            <article className="ds-preview-card">
              <h3>required</h3>
              <AppTextField
                label="Nom"
                placeholder="Votre nom"
                isRequired
              />
            </article>

            <article className="ds-preview-card">
              <h3>disabled</h3>
              <AppTextField
                label="Lien généré"
                placeholder="Non modifiable"
                defaultValue="https://datashare.app/download/abc123"
                isDisabled
              />
            </article>

            <article className="ds-preview-card">
              <h3>error state</h3>
              <AppTextField
                label="Adresse e-mail"
                placeholder="nom@exemple.com"
                type="email"
                value={email}
                onChange={setEmail}
                isInvalid={emailInvalid}
                errorMessage="Veuillez saisir une adresse e-mail valide."
              />
            </article>

            <article className="ds-preview-card">
              <h3>password error</h3>
              <AppTextField
                label="Mot de passe"
                placeholder="Minimum 8 caractères"
                type="password"
                value={password}
                onChange={setPassword}
                isInvalid={passwordInvalid}
                errorMessage="Le mot de passe doit contenir au moins 8 caractères."
              />
            </article>

            <article className="ds-preview-card">
              <h3>mobile width</h3>
              <div className="ds-mobile-frame">
                <AppTextField
                  label="Mot de passe"
                  placeholder="Optionnel"
                  type="password"
                />
              </div>
            </article>
          </div>
        </section>

        {/* ================= SELECT ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Select Component</h2>
            <p>
              Placeholder, valeur sélectionnée, état ouvert, erreur, disabled et rendu mobile.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card">
              <h3>default</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                placeholder="Sélectionner"
              />
            </article>

            <article className="ds-preview-card">
              <h3>selected</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                value={selectedExpiration}
                onChange={(key) =>
                  setSelectedExpiration(key ? String(key) : null)
                }
              />
            </article>

            <article className="ds-preview-card">
              <h3>description</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                description="Choisis la durée de validité du lien."
              />
            </article>

            <article className="ds-preview-card">
              <h3>required</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                isRequired
              />
            </article>

            <article className="ds-preview-card">
              <h3>disabled</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                defaultValue="1-day"
                isDisabled
              />
            </article>

            <article className="ds-preview-card">
              <h3>error state</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                value={selectedExpiration}
                onChange={(key) =>
                  setSelectedExpiration(key ? String(key) : null)
                }
                isInvalid={selectInvalid}
                errorMessage="Veuillez sélectionner une durée."
              />
            </article>

            <article className="ds-preview-card">
              <h3>open interaction</h3>
              <AppSelect
                label="Expiration"
                items={expirationOptions}
                placeholder="Clique pour ouvrir"
              />
            </article>

            <article className="ds-preview-card">
              <h3>mobile width</h3>
              <div className="ds-mobile-frame">
                <AppSelect
                  label="Expiration"
                  items={expirationOptions}
                />
              </div>
            </article>
          </div>
        </section>

        {/* ================= BUTTON ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Button Component</h2>
            <p>
              Variants visuels, états, icônes gauche/droite, tailles et rendu mobile.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card">
              <h3>primary</h3>
              <AppButton
                variant="primary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>primary disabled</h3>
              <AppButton
                variant="primary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
                isDisabled
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>secondary</h3>
              <AppButton
                variant="secondary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>secondary disabled</h3>
              <AppButton
                variant="secondary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
                isDisabled
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>tertiary</h3>
              <AppButton
                variant="tertiary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>tertiary disabled</h3>
              <AppButton
                variant="tertiary"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
                isDisabled
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>dark</h3>
              <AppButton
                variant="dark"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>dark disabled</h3>
              <AppButton
                variant="dark"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
                isDisabled
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>loading</h3>
              <AppButton variant="primary" isLoading>
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>small</h3>
              <AppButton
                variant="primary"
                size="sm"
                startIcon={<UploadIcon />}
                endIcon={<UploadIcon />}
              >
                Téléverser
              </AppButton>
            </article>

            <article className="ds-preview-card">
              <h3>mobile width</h3>
              <div className="ds-mobile-frame">
                <AppButton
                  variant="primary"
                  fullWidth
                  startIcon={<UploadIcon />}
                  endIcon={<UploadIcon />}
                >
                  Téléverser
                </AppButton>
              </div>
            </article>
          </div>
        </section>

        {/* ================= CALLOUT ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Callout Component</h2>
            <p>
              Message informatif compact avec variantes visuelles, texte long et rendu en container étroit.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card">
              <h3>info</h3>
              <AppCallout variant="info" label="Le lien a bien été généré." />
            </article>

            <article className="ds-preview-card">
              <h3>alert</h3>
              <AppCallout
                variant="alert"
                label="Ce fichier expirera bientôt. Pense à prolonger sa durée si besoin."
              />
            </article>

            <article className="ds-preview-card">
              <h3>error</h3>
              <AppCallout
                variant="error"
                label="Une erreur est survenue pendant le téléversement."
              />
            </article>

            <article className="ds-preview-card">
              <h3>long text</h3>
              <AppCallout variant="info">
                Ce callout permet d’afficher un message court ou un texte un peu
                plus long, avec retour à la ligne propre, icône à gauche et
                rendu cohérent dans le design system.
              </AppCallout>
            </article>

            <article className="ds-preview-card">
              <h3>mobile width</h3>
              <div className="ds-mobile-frame">
                <AppCallout
                  variant="error"
                  label="Le mot de passe est invalide. Vérifie la saisie puis réessaie."
                />
              </div>
            </article>
          </div>
        </section>

        {/* ================= HEADER ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Header Component</h2>
            <p>
              Header de layout/navigation avec variantes desktop/mobile et utilisateur anonyme/connecté.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card ds-preview-card--span-2">
              <h3>desktop anonymous</h3>
              <AppHeader
                isAuthenticated={false}
                isMobile={false}
                loginLabel="Se connecter"
                onLoginClick={() => console.log("login")}
              />
            </article>

            <article className="ds-preview-card ds-preview-card--span-2">
              <h3>desktop logged</h3>
              <AppHeader
                isAuthenticated
                isMobile={false}
                accountLabel="Mon espace"
                onAccountClick={() => console.log("account")}
              />
            </article>

            <article className="ds-preview-card">
              <h3>mobile anonymous</h3>
              <div className="ds-mobile-frame">
                <AppHeader
                  isAuthenticated={false}
                  isMobile
                  loginLabel="Se connecter"
                  onLoginClick={() => console.log("login")}
                />
              </div>
            </article>

            <article className="ds-preview-card">
              <h3>mobile logged</h3>
              <div className="ds-mobile-frame">
                <AppHeader
                  isAuthenticated
                  isMobile
                  accountLabel="Mon espace"
                  onAccountClick={() => console.log("account")}
                />
              </div>
            </article>

            <article className="ds-preview-card">
              <h3>tight container</h3>
              <div className="ds-mobile-frame">
                <AppHeader
                  isAuthenticated={false}
                  isMobile
                  brand="DataShare"
                  loginLabel="Se connecter"
                  onLoginClick={() => console.log("login")}
                />
              </div>
            </article>

            <article className="ds-preview-card">
              <h3>custom brand</h3>
              <AppHeader
                isAuthenticated
                isMobile={false}
                brand="DataShare"
                accountLabel="Mon espace"
                onAccountClick={() => console.log("account")}
              />
            </article>
          </div>
        </section>

        {/* ================= SEGMENTED CONTROL ================= */}
        <section className="ds-preview-section">
          <div className="ds-preview-section-head">
            <h2>Segmented Control Component</h2>
            <p>
              Sélection exclusive entre plusieurs vues ou filtres, avec état actif,
              item disabled, composant disabled, labels plus longs et rendu en largeur réduite.
            </p>
          </div>

          <div className="ds-preview-grid">
            <article className="ds-preview-card">
              <h3>default</h3>
              <AppSegmentedControl
                label="Filtrer"
                items={statusItems}
                value={segmentedStatusValue}
                onChange={setSegmentedStatusValue}
              />
            </article>

            <article className="ds-preview-card">
              <h3>selected</h3>
              <AppSegmentedControl
                label="Statut"
                items={statusItems}
                value={segmentedSelectedValue}
                onChange={setSegmentedSelectedValue}
              />
            </article>

            <article className="ds-preview-card">
              <h3>disabled item</h3>
              <AppSegmentedControl
                label="Statut"
                items={mixedItems}
                value={segmentedDisabledItemValue}
                onChange={setSegmentedDisabledItemValue}
                description="Une option est visible mais non sélectionnable."
              />
            </article>

            <article className="ds-preview-card">
              <h3>disabled component</h3>
              <AppSegmentedControl
                label="Vue"
                items={statusItems}
                value={segmentedDisabledValue}
                onChange={() => {}}
                isDisabled
              />
            </article>

            <article className="ds-preview-card">
              <h3>long labels</h3>
              <AppSegmentedControl
                label="Bibliothèque"
                items={longLabelItems}
                value={segmentedLongValue}
                onChange={setSegmentedLongValue}
              />
            </article>

            <article className="ds-preview-card">
              <h3>tight container</h3>
              <div className="ds-mobile-frame">
                <AppSegmentedControl
                  label="Affichage"
                  items={viewItems}
                  value={segmentedTightValue}
                  onChange={setSegmentedTightValue}
                />
              </div>
            </article>

            <article className="ds-preview-card">
              <h3>mobile width</h3>
              <div className="ds-mobile-frame">
                <AppSegmentedControl
                  label="Statut"
                  items={statusItems}
                  value={segmentedMobileValue}
                  onChange={setSegmentedMobileValue}
                />
              </div>
            </article>

            <article className="ds-preview-card">
              <h3>invalid state</h3>
              <AppSegmentedControl
                label="Sélection requise"
                items={statusItems}
                value={segmentedInvalidValue}
                onChange={setSegmentedInvalidValue}
                isInvalid={segmentedInvalid}
                errorMessage="Veuillez sélectionner une option."
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}