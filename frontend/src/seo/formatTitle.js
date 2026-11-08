export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;

const BRAND_SUFFIX = ' | Alcoa';

/** Appends the short brand suffix only when the title has no brand and the result stays within 60 chars. */
export const formatTitle = (title, fallback = 'Aluminium Scaffolding Abu Dhabi | Alcoa UAE') => {
  if (!title) return fallback;
  if (/alcoa/i.test(title)) return title;
  const branded = `${title}${BRAND_SUFFIX}`;
  return branded.length <= MAX_TITLE_LENGTH ? branded : title;
};
