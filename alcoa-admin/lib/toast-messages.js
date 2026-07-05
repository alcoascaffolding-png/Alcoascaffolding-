/**
 * Consistent toast copy across the admin panel.
 */

export const TOAST = {
  created: (item) => `${item} created successfully`,
  updated: (item) => `${item} updated successfully`,
  deleted: (item) => `${item} deleted successfully`,
  saved: (item) => `${item} saved successfully`,
  converting: (item) => `Converting ${item}…`,
  converted: (item) => `${item} converted successfully`,
  generated: (item) => `${item} generated successfully`,
  recorded: (item) => `${item} recorded successfully`,
  network: "Network error — please check your connection and try again",
  generic: "Something went wrong. Please try again.",
  validation: "Validation failed — please check the form and try again",
  duplicate: "Duplicate record detected",
};

export function mutationErrorMessage(error) {
  const msg = error?.message || "";
  if (!msg) return TOAST.generic;
  if (/network|fetch|failed to fetch/i.test(msg)) return TOAST.network;
  if (/duplicate|already exists|unique/i.test(msg)) return TOAST.duplicate;
  if (/validation|invalid|required/i.test(msg)) return msg;
  return msg;
}
