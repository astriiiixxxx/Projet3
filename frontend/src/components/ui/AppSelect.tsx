import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
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
  description?: string;
  errorMessage?: string;
  value?: Key | null;
  defaultValue?: Key | null;
  onChange?: (value: Key | null) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  name?: string;
};

export function AppSelect({
  label,
  items,
  placeholder = "Sélectionner",
  description,
  errorMessage,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  name,
}: AppSelectProps) {
  return (
    <Select
      className="ds-field ds-select"
      value={value ?? undefined}
      defaultValue={defaultValue ?? undefined}
      onChange={(key) => onChange?.(key ?? null)}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isRequired={isRequired}
      name={name}
    >
      <Label className="ds-label">{label}</Label>

      <Button className="ds-select-button">
        <SelectValue className="ds-select-value">
          {({ selectedText }) =>
            selectedText ? selectedText : (
              <span className="ds-select-placeholder">{placeholder}</span>
            )
          }
        </SelectValue>

        <span aria-hidden="true" className="ds-select-icon">
          ▾
        </span>
      </Button>

      {description ? (
        <Text slot="description" className="ds-description">
          {description}
        </Text>
      ) : null}

      <FieldError className="ds-error-text">{errorMessage}</FieldError>

      <Popover className="ds-select-popover" offset={4}>
        <ListBox className="ds-listbox">
          {items.map((item) => (
            <ListBoxItem
              key={item.id}
              id={item.id}
              textValue={item.label}
              className="ds-listbox-item"
            >
              {item.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}