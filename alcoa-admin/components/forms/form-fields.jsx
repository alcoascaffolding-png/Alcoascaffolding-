"use client";

import { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordVisibilityToggle } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Shared field chrome for all CRUD form inputs — theme tokens only (no hardcoded white). */
export const formInputClassName =
  "h-11 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:shadow-none";

export const formSelectClassName =
  "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground shadow-sm focus:ring-2 focus:ring-primary/20 dark:shadow-none [&>span]:text-foreground";

export const formTextareaClassName =
  "min-h-[100px] resize-y rounded-lg border border-input bg-card px-3.5 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 dark:shadow-none";

/** Label + item spacing shared by every form field component. */
export const formLabelClassName =
  "text-xs font-medium leading-tight text-muted-foreground";

export const formItemClassName = "flex flex-col gap-1.5 space-y-0";

export const formMessageClassName = "text-xs font-medium leading-tight";

/**
 * Line-item rows: equal label slot height so controls align on one baseline.
 * Wrap each field column (Description, Qty, Unit, etc.) with FormLineItemCell.
 */
export const formLineItemRowClassName =
  "grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-b pb-4 last:border-0";

export const formLineItemRowClassNameCompact =
  "grid grid-cols-12 gap-2 items-start border rounded-lg p-3";

export const formLineItemCellClassName =
  "[&_label]:min-h-[2rem] [&_label]:flex [&_label]:items-end [&_label]:whitespace-normal";

export const formLineItemLabelClassName = "text-xs text-muted-foreground mb-1.5 block min-h-[2rem]";

export const formNativeSelectClassName = formSelectClassName;

export function FormLineItemCell({ className, children }) {
  return <div className={cn(formLineItemCellClassName, className)}>{children}</div>;
}

/** Spacer + icon button aligned with h-11 inputs in a line-item row. */
export function FormLineItemDeleteCell({ className, children }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="block min-h-[2rem]" aria-hidden="true" />
      <div className="flex h-11 items-center justify-end">{children}</div>
    </div>
  );
}

function defaultPlaceholder(label, explicit) {
  if (explicit) return explicit;
  if (!label) return undefined;
  return `Enter ${String(label).toLowerCase()}`;
}

function textDisplayValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function fieldDisplayValue(value, { showZero = false } = {}) {
  if (value === null || value === undefined || value === "") {
    return showZero ? "" : "";
  }
  if (!showZero && (value === 0 || value === "0")) return "";
  return String(value);
}

/** Props for plain text inputs that accept numeric values (no browser spinners). */
export const numericTextInputProps = {
  type: "text",
  inputMode: "decimal",
  autoComplete: "off",
};

/** react-hook-form setValueAs helper for numeric text fields. */
export function setValueAsNumber(empty = 0) {
  return (value) => {
    if (value === "" || value == null) return empty;
    const n = Number(String(value).replace(/,/g, "").trim());
    return Number.isNaN(n) ? empty : n;
  };
}

function sanitizeNumericText(raw) {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return { ok: true, value: "" };
  if (!/^-?\d*\.?\d*$/.test(trimmed)) return { ok: false };
  return { ok: true, value: trimmed };
}

function coerceNumericFieldValue(raw, showZero) {
  if (raw === "") return showZero ? "" : 0;
  if (raw.endsWith(".") || raw === "-" || /^\d+\.$/.test(raw)) return raw;
  const n = Number(raw);
  return Number.isNaN(n) ? raw : n;
}

function FormPasswordControl({ field, resolvedPlaceholder, disabled, readOnly, className }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <FormControl>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(className, "pr-10")}
          {...field}
          value={textDisplayValue(field.value)}
          onChange={field.onChange}
        />
      </FormControl>
      <PasswordVisibilityToggle
        show={showPassword}
        disabled={disabled || readOnly}
        onToggle={() => setShowPassword((visible) => !visible)}
      />
    </div>
  );
}

/**
 * FormTextField - text, email, password, tel, url inputs
 */
export function FormTextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  description,
  disabled,
  readOnly,
  className,
}) {
  const resolvedPlaceholder = defaultPlaceholder(label, placeholder);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(formItemClassName, className)}>
          {label && (
            <FormLabel className={formLabelClassName}>{label}</FormLabel>
          )}
          {type === "password" ? (
            <FormPasswordControl
              field={field}
              resolvedPlaceholder={resolvedPlaceholder}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(
                formInputClassName,
                (disabled || readOnly) && "cursor-not-allowed bg-muted/40 text-muted-foreground"
              )}
            />
          ) : (
            <FormControl>
              <Input
                type={type}
                placeholder={resolvedPlaceholder}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(
                  formInputClassName,
                  (disabled || readOnly) && "cursor-not-allowed bg-muted/40 text-muted-foreground"
                )}
                {...field}
                value={textDisplayValue(field.value)}
                onChange={field.onChange}
              />
            </FormControl>
          )}
          {description && (
            <FormDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className={formMessageClassName} />
        </FormItem>
      )}
    />
  );
}

/**
 * FormTextAreaField - multiline textarea
 */
export function FormTextAreaField({
  control,
  name,
  label,
  placeholder,
  rows = 3,
  description,
  disabled,
  className,
}) {
  const resolvedPlaceholder = defaultPlaceholder(label, placeholder);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(formItemClassName, className)}>
          {label && (
            <FormLabel className={formLabelClassName}>{label}</FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={resolvedPlaceholder}
              rows={rows}
              disabled={disabled}
              className={formTextareaClassName}
              {...field}
              value={textDisplayValue(field.value)}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className={formMessageClassName} />
        </FormItem>
      )}
    />
  );
}

/**
 * FormSelectField - shadcn Select with options array
 */
export function FormSelectField({
  control,
  name,
  label,
  placeholder = "Select an option…",
  options = [],
  description,
  disabled,
  className,
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const raw =
          field.value === null || field.value === undefined || field.value === ""
            ? ""
            : String(field.value);
        const matched = options.find((o) => o.value === raw);
        const selectValue = matched ? matched.value : undefined;

        return (
          <FormItem className={cn(formItemClassName, className)}>
            {label && (
              <FormLabel className={formLabelClassName}>{label}</FormLabel>
            )}
            <Select
              key={`${name}-${options.length}-${raw}`}
              onValueChange={field.onChange}
              value={selectValue}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className={formSelectClassName}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && (
              <FormDescription className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </FormDescription>
            )}
            <FormMessage className={formMessageClassName} />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * FormNumberField — numeric values via a standard text input (no spinners).
 */
export function FormNumberField({
  control,
  name,
  label,
  placeholder,
  min: _min,
  max: _max,
  step: _step,
  description,
  disabled,
  className,
  showZero = false,
}) {
  const resolvedPlaceholder = placeholder ?? "0";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(formItemClassName, className)}>
          {label && (
            <FormLabel className={formLabelClassName}>{label}</FormLabel>
          )}
          <FormControl>
            <Input
              {...numericTextInputProps}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              className={formInputClassName}
              value={fieldDisplayValue(field.value, { showZero })}
              onChange={(e) => {
                const { ok, value } = sanitizeNumericText(e.target.value);
                if (!ok) return;
                field.onChange(coerceNumericFieldValue(value, showZero));
              }}
              onBlur={(e) => {
                const { ok, value } = sanitizeNumericText(e.target.value);
                if (!ok) return;
                const coerced = coerceNumericFieldValue(value, showZero);
                if (typeof coerced === "string") {
                  field.onChange(coerced === "" ? (showZero ? "" : 0) : Number(coerced) || 0);
                }
                field.onBlur();
              }}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className={formMessageClassName} />
        </FormItem>
      )}
    />
  );
}

export function FormCheckboxField({ control, name, label, description, disabled, className }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage className={formMessageClassName} />
        </FormItem>
      )}
    />
  );
}

export function FormSwitchField({ control, name, label, description, disabled, className }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5",
            className
          )}
        >
          <div className="space-y-0.5 pr-4">
            {label && (
              <FormLabel className={formLabelClassName}>{label}</FormLabel>
            )}
            {description && (
              <FormDescription className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
