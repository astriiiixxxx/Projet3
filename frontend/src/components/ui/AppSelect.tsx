import {
    Button,
    Label,
    ListBox,
    ListBoxItem,
    Popover,
    Select,
    SelectValue,
    type Key,
  } from "react-aria-components";
  import "./ui.css";
  
  export type SelectOption = {
    id: Key;
    label: string;
  };
  
  type AppSelectProps = {
    label: string;
    items: SelectOption[];
    placeholder?: string;
    value?: Key | null;
    defaultValue?: Key | null;
    onChange?: (value: Key | null) => void;
  };
  
  export function AppSelect({
    label,
    items,
    placeholder = "Sélectionner",
    value,
    defaultValue,
    onChange,
  }: AppSelectProps) {
    return (
      <Select
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className="ds-stack"
      >
        <Label className="ds-label">{label}</Label>
  
        <Button className="ds-select-button">
          <SelectValue>
            {({ selectedText }) => selectedText || placeholder}
          </SelectValue>
        </Button>
  
        <Popover className="ds-select-popover">
          <ListBox items={items} className="ds-listbox">
            {(item) => (
              <ListBoxItem
                id={item.id}
                textValue={item.label}
                className="ds-listbox-item"
              >
                {item.label}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </Select>
    );
  }