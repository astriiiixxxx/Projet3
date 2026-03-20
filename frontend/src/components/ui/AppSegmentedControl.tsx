import {
    Tab,
    TabList,
    Tabs,
    type Key,
  } from "react-aria-components";
  import "./ui.css";
  
  export type SegmentedItem = {
    id: string;
    label: string;
  };
  
  type AppSegmentedControlProps = {
    items: SegmentedItem[];
    selectedKey: Key;
    onSelectionChange: (key: Key) => void;
  };
  
  export function AppSegmentedControl({
    items,
    selectedKey,
    onSelectionChange,
  }: AppSegmentedControlProps) {
    return (
      <Tabs selectedKey={selectedKey} onSelectionChange={onSelectionChange}>
        <TabList aria-label="Filtres de fichiers" className="ds-segmented">
          {items.map((item) => (
            <Tab key={item.id} id={item.id} className="ds-segmented-item">
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    );
  }