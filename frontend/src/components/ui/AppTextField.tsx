import {
    FieldError,
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
  } from "react-aria-components";
  import "./ui.css";
  
  type AppTextFieldProps = TextFieldProps & {
    label: string;
    description?: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
  };
  
  export function AppTextField({
    label,
    description,
    placeholder,
    type = "text",
    ...props
  }: AppTextFieldProps) {
    return (
      <TextField {...props} className="ds-stack">
        <Label className="ds-label">{label}</Label>
        <Input className="ds-input" placeholder={placeholder} type={type} />
        {description ? <Text slot="description" className="ds-description">{description}</Text> : null}
        <FieldError className="ds-error-text" />
      </TextField>
    );
  }