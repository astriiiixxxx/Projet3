import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
  type TextFieldProps,
  type ValidationResult,
} from "react-aria-components";
import "./ui.css";

type AppTextFieldProps = Omit<TextFieldProps, "children"> & {
  label: string;
  description?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search" | "url";
  errorMessage?: string | ((validation: ValidationResult) => string);
  className?: string;
};

export function AppTextField({
  label,
  description,
  placeholder,
  type = "text",
  errorMessage,
  className,
  ...props
}: AppTextFieldProps) {
  const fieldClassName = className ? `ds-field ${className}` : "ds-field";

  return (
    <TextField {...props} className={fieldClassName}>
      <Label className="ds-label">{label}</Label>

      <Input className="ds-input" type={type} placeholder={placeholder} />

      {description ? (
        <Text slot="description" className="ds-description">
          {description}
        </Text>
      ) : null}

      <FieldError className="ds-error-text">{errorMessage}</FieldError>
    </TextField>
  );
}