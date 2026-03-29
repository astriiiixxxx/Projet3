import type { ReactNode } from "react";
import {
  FieldError,
  Label,
  Radio,
  RadioGroup,
  Text,
} from "react-aria-components";

type AppSegmentedControlItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type AppSegmentedControlProps = {
  label?: string;
  items: AppSegmentedControlItem[];
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
  description?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  "aria-label"?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function renderText(content: ReactNode) {
  return <span className="app-segmented-control__text">{content}</span>;
}

export function AppSegmentedControl({
  label,
  items,
  value,
  onChange,
  isDisabled = false,
  className,
  description,
  errorMessage,
  isInvalid = false,
  "aria-label": ariaLabel,
}: AppSegmentedControlProps) {
  const hasVisibleLabel = Boolean(label);
  const hasDescription = Boolean(description);
  const hasError = Boolean(errorMessage);

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      aria-label={!hasVisibleLabel ? ariaLabel ?? "Segmented control" : undefined}
      className={cx("app-segmented-control", className)}
    >
      {hasVisibleLabel ? (
        <Label className="app-segmented-control__label">{label}</Label>
      ) : null}

      {hasDescription ? (
        <Text slot="description" className="app-segmented-control__description">
          {description}
        </Text>
      ) : null}

      <div className="app-segmented-control__group">
        {items.map((item) => (
          <Radio
            key={item.id}
            value={item.id}
            isDisabled={item.disabled}
            className="app-segmented-control__item"
          >
            {renderText(item.label)}
          </Radio>
        ))}
      </div>

      {hasError ? (
        <FieldError className="app-segmented-control__error">
          {errorMessage}
        </FieldError>
      ) : null}
    </RadioGroup>
  );
}

export default AppSegmentedControl;