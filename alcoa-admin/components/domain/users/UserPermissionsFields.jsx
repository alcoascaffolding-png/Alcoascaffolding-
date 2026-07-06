"use client";

import { useMemo, Fragment } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormCheckboxField } from "@/components/forms/form-fields";
import {
  PERMISSION_MODULES,
  PERMISSION_ACTION_LABELS,
  permissionKey,
  getRoleDefaultPermissions,
  ROLE_LABELS,
  isAdminRole,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

function groupModules(modules) {
  const groups = new Map();
  for (const mod of modules) {
    if (!groups.has(mod.group)) groups.set(mod.group, []);
    groups.get(mod.group).push(mod);
  }
  return [...groups.entries()];
}

export function UserPermissionsFields({ control }) {
  const { setValue } = useFormContext();
  const role = useWatch({ control, name: "role" });
  const useCustom = useWatch({ control, name: "useCustomPermissions" });
  const permissions = useWatch({ control, name: "permissions" }) || [];

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);
  const grouped = useMemo(() => groupModules(PERMISSION_MODULES), []);
  const fullAccessRole = isAdminRole(role);

  function togglePermission(key, checked) {
    const next = new Set(permissionSet);
    if (checked) next.add(key);
    else next.delete(key);
    setValue("permissions", [...next], { shouldDirty: true, shouldValidate: true });
  }

  function applyRoleDefaults() {
    setValue("permissions", getRoleDefaultPermissions(role), { shouldDirty: true });
    setValue("useCustomPermissions", true, { shouldDirty: true });
  }

  function selectAll() {
    const all = PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permissionKey(m.id, a)));
    setValue("permissions", all, { shouldDirty: true });
    setValue("useCustomPermissions", true, { shouldDirty: true });
  }

  function clearAll() {
    setValue("permissions", [permissionKey("dashboard", "read")], { shouldDirty: true });
    setValue("useCustomPermissions", true, { shouldDirty: true });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Module permissions</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Control which modules this user can view, create/edit, or delete. Super Admin and Admin roles
          always have full access.
        </p>
      </div>

      {fullAccessRole ? (
        <p className="text-sm text-muted-foreground rounded-md bg-muted/40 px-3 py-2">
          <strong>{ROLE_LABELS[role]}</strong> has full access to every module. Custom permissions
          apply only to non-admin roles.
        </p>
      ) : (
        <>
          <FormCheckboxField
            control={control}
            name="useCustomPermissions"
            label="Use custom permissions (override role defaults)"
            description={
              useCustom
                ? "Only checked permissions below are granted."
                : `Access follows ${ROLE_LABELS[role] || role} role defaults. Enable to pick permissions manually.`
            }
          />

          {useCustom && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={applyRoleDefaults}>
                  Apply {ROLE_LABELS[role] || role} defaults
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Select all
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Module</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">View</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground w-28">Edit</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map(([groupLabel, mods]) => (
                      <Fragment key={groupLabel}>
                        <tr className="bg-muted/20">
                          <td
                            colSpan={4}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {groupLabel}
                          </td>
                        </tr>
                        {mods.map((mod) => (
                          <tr key={mod.id} className="border-b border-border/60 last:border-0">
                            <td className="px-3 py-2 font-medium text-foreground">{mod.label}</td>
                            {["read", "write", "delete"].map((action) => {
                              const enabled = mod.actions.includes(action);
                              const key = permissionKey(mod.id, action);
                              return (
                                <td key={action} className="px-3 py-2 text-center">
                                  {enabled ? (
                                    <Checkbox
                                      checked={permissionSet.has(key)}
                                      onCheckedChange={(v) => togglePermission(key, !!v)}
                                      aria-label={`${mod.label} ${PERMISSION_ACTION_LABELS[action]}`}
                                    />
                                  ) : (
                                    <span className="text-muted-foreground/40">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={cn("text-xs text-muted-foreground")}>
                {permissionSet.size} permission{permissionSet.size === 1 ? "" : "s"} selected
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
