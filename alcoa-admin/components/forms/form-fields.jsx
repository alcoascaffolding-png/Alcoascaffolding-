"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

function defaultPlaceholder(label, explicit) {
  if (explicit) return explicit;
  if (!label) return undefined;
  return `Enter ${String(label).toLowerCase()}`;
}

function textDisplayValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function numberDisplayValue(value) {
  if (value === null || value === undefined || value === "" || Number(value) === 0) return "";
  return String(value);
}

/**
 * FormTextField - text, email, password, tel, url, number inputs
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
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
          )}
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
              onChange={
                type === "number"
                  ? (e) => field.onChange(e.target.valueAsNumber)
                  : field.onChange
              }
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage />
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
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
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
          <FormMessage />
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
          <FormItem className={className}>
            {label && (
              <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
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
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * FormNumberField
 */
export function FormNumberField({
  control,
  name,
  label,
  placeholder,
  min,
  max,
  step,
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
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
          )}
          <FormControl>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={resolvedPlaceholder}
              min={min}
              max={max}
              step={step ?? "any"}
              disabled={disabled}
              className={formInputClassName}
              value={
                showZero
                  ? textDisplayValue(field.value)
                  : numberDisplayValue(field.value)
              }
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") field.onChange(0);
                else field.onChange(Number(raw));
              }}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage />
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
          <FormMessage />
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
              <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
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
