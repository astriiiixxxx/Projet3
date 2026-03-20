import { useState } from "react";
import { AppButton } from "../components/ui/AppButton";
import { AppCallout } from "../components/ui/AppCallout";
import { AppHeader } from "../components/ui/AppHeader";
import { AppSegmentedControl } from "../components/ui/AppSegmentedControl";
import { AppSelect } from "../components/ui/AppSelect";
import { AppTextField } from "../components/ui/AppTextField";
import type { Key } from "react-aria";

const expirationOptions = [
  { id: "1d", label: "Une journée" },
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
];

const filterItems = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "expired", label: "Expiré" },
];

export default function MySpacePage() {
  const [expiration, setExpiration] = useState<Key | null>("1d");
  const [filter, setFilter] = useState<Key>("all");

  return (
    <div className="ds-page">
      <main className="ds-shell">
        <h1 className="ds-section-title">Components</h1>

        <div className="ds-grid-2">
          <section className="ds-stack">
            <div>
              <h2>Input Component</h2>
              <AppTextField
                label="Mot de passe"
                placeholder="Optionnel"
                type="password"
              />
            </div>

            <div>


              <h2>Select Component</h2>
              <AppSelect
      label="Expiration"
      items={expirationOptions}
      value={expiration} 
      onChange={setExpiration}
    />
            </div>

            <div>
              <h2>Button Component</h2>
              <div className="ds-stack">
                <div className="ds-row">
                  <AppButton variant="secondary">Téléverser ↷</AppButton>
                  <AppButton variant="ghost" isDisabled>
                    Téléverser ↷
                  </AppButton>
                </div>

                <div className="ds-row">
                  <AppButton variant="primary">Téléverser ↷</AppButton>
                  <AppButton variant="ghost">Téléverser ↷</AppButton>
                </div>
              </div>
            </div>

            <div>
              <h2>Switch Component</h2>
              <AppSegmentedControl
                items={filterItems}
                selectedKey={filter}
                onSelectionChange={setFilter}
              />
            </div>
          </section>

          <section className="ds-stack">
            <div>
              <h2>Header Component</h2>
              <div className="ds-stack">
                <AppHeader isAuthenticated={false} />
                <AppHeader isAuthenticated />
              </div>
            </div>

            <div>
              <h2>Callout Component</h2>
              <div className="ds-stack" style={{ maxWidth: 320 }}>
                <AppCallout variant="info">Label</AppCallout>
                <AppCallout variant="warning">Label</AppCallout>
                <AppCallout variant="danger">Label</AppCallout>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}