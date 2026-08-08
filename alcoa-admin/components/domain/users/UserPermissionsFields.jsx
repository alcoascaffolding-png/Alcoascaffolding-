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

/** Column order + human labels for the matrix. */
const MATRIX_ACTIONS = [
  { action: "read", label: "View" },
  { action: "write", label: "Create / Edit" },
  { action: "delete", label: "Delete" },
];

/** Dashboard read is always granted — every user needs the landing page. */
const MANDATORY_KEY = permissionKey("dashboard", "read");

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

  /** Persist a permission set, always keeping the mandatory dashboard read. */
  function commit(next) {
    next.add(MANDATORY_KEY);
    setValue("permissions", [...next], { shouldDirty: true, shouldValidate: true });
  }

  /**
   * Toggle a single cell with logical dependencies:
   *  - enabling Create/Edit or Delete implies View
   *  - disabling View also removes Create/Edit and Delete
   */
  function toggleCell(modId, action, checked) {
    const next = new Set(permissionSet);
    const key = permissionKey(modId, action);
    if (checked) {
      next.add(key);
      if (action === "write" || action === "delete") {
        next.add(permissionKey(modId, "read"));
      }
    } else {
      next.delete(key);
      if (action === "read") {
        next.delete(permissionKey(modId, "write"));
        next.delete(permissionKey(modId, "delete"));
      }
    }
    commit(next);
  }

  /** Modules that expose a given action. */
  function modulesWithAction(action) {
    return PERMISSION_MODULES.filter((m) => m.actions.includes(action));
  }

  /** Select-all / clear-all for a whole action column. */
  function toggleColumn(action, checked) {
    const next = new Set(permissionSet);
    for (const mod of modulesWithAction(action)) {
      const key = permissionKey(mod.id, action);
      if (checked) {
        next.add(key);
        if (action === "write" || action === "delete") next.add(permissionKey(mod.id, "read"));
      } else {
        next.delete(key);
        if (action === "read") {
          next.delete(permissionKey(mod.id, "write"));
          next.delete(permissionKey(mod.id, "delete"));
        }
      }
    }
    commit(next);
  }

  function columnState(action) {
    const keys = modulesWithAction(action).map((m) => permissionKey(m.id, action));
    const selected = keys.filter((k) => permissionSet.has(k)).length;
    if (selected === 0) return false;
    if (selected === keys.length) return true;
    return "indeterminate";
  }

  function applyRoleDefaults() {
    setValue("useCustomPermissions", true, { shouldDirty: true });
    commit(new Set(getRoleDefaultPermissions(role)));
  }

  function selectAll() {
    setValue("useCustomPermissions", true, { shouldDirty: true });
    commit(new Set(PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permissionKey(m.id, a)))));
  }

  function clearAll() {
    setValue("useCustomPermissions", true, { shouldDirty: true });
    commit(new Set());
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Module permissions</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Control which modules this user can view, create/edit, or delete. Super Admin and Admin
          roles always have full access.
        </p>
      </div>

      {fullAccessRole ? (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <strong className="text-foreground">{ROLE_LABELS[role]}</strong> has full access to every
          module. Custom permissions apply only to non-admin roles.
        </p>
      ) : (
        <>
          <FormCheckboxField
            control={control}
            name="useCustomPermissions"
            label="Use custom permissions (override role defaults)"
            description={
              useCustom
                ? "Only the permissions checked below are granted."
                : `Access follows the ${ROLE_LABELS[role] || role} role defaults. Enable to pick permissions manually.`
            }
          />

          {useCustom && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
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
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th
                        scope="col"
                        className="px-3 py-2.5 text-left font-medium text-muted-foreground"
                      >
                        Module
                      </th>
                      {MATRIX_ACTIONS.map(({ action, label }) => (
                        <th
                          key={action}
                          scope="col"
                          className="w-28 px-3 py-2 text-center font-medium text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{label}</span>
                            <Checkbox
                              checked={columnState(action)}
                              onCheckedChange={(v) => toggleColumn(action, v === true)}
                              aria-label={`Toggle ${label} for all modules`}
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map(([groupLabel, mods]) => (
                      <Fragment key={groupLabel}>
                        <tr className="bg-muted/20">
                          <td
                            colSpan={MATRIX_ACTIONS.length + 1}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {groupLabel}
                          </td>
                        </tr>
                        {mods.map((mod) => (
                          <tr
                            key={mod.id}
                            className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-2 font-medium text-foreground">{mod.label}</td>
                            {MATRIX_ACTIONS.map(({ action, label }) => {
                              const enabled = mod.actions.includes(action);
                              const key = permissionKey(mod.id, action);
                              const isMandatory = key === MANDATORY_KEY;
                              return (
                                <td key={action} className="px-3 py-2 text-center">
                                  {enabled ? (
                                    <span className="inline-flex items-center justify-center">
                                      <Checkbox
                                        checked={isMandatory ? true : permissionSet.has(key)}
                                        disabled={isMandatory}
                                        onCheckedChange={(v) => toggleCell(mod.id, action, !!v)}
                                        aria-label={`${mod.label}: ${PERMISSION_ACTION_LABELS[action]}`}
                                        title={
                                          isMandatory
                                            ? "Dashboard access is always granted"
                                            : undefined
                                        }
                                      />
                                    </span>
                                  ) : (
                                    <span
                                      className="text-muted-foreground/40"
                                      aria-hidden="true"
                                    >
                                      —
                                    </span>
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

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Enabling <span className="font-medium text-foreground">Create / Edit</span> or{" "}
                  <span className="font-medium text-foreground">Delete</span> automatically grants{" "}
                  <span className="font-medium text-foreground">View</span>.
                </p>
                <p className={cn("text-xs font-medium text-muted-foreground")}>
                  {permissionSet.size} permission{permissionSet.size === 1 ? "" : "s"} selected
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
