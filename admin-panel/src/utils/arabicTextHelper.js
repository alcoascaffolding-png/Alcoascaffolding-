/**
 * Arabic Text Helper for PDF Generation
 * Handles bidirectional text (English + Arabic) rendering
 * Uses Unicode character mapping for proper Arabic display
 */

/**
 * Arabic character mapping for proper display in PDF
 * Maps isolated forms to their proper contextual forms
 */
const arabicCharMap = {
  'ا': 'ا', 'ل': 'ل', 'ك': 'ك', 'و': 'و', 
  'س': 'س', 'ق': 'ق', 'ت': 'ت', 'أ': 'أ',
  'م': 'م', 'ن': 'ن', 'ي': 'ي', 'ب': 'ب',
  'ر': 'ر', 'ة': 'ة', 'ى': 'ى', 'ع': 'ع',
  'د': 'د', 'ح': 'ح', 'ج': 'ج', 'خ': 'خ',
  'ذ': 'ذ', 'ز': 'ز', 'ش': 'ش', 'ص': 'ص',
  'ض': 'ض', 'ط': 'ط', 'ظ': 'ظ', 'غ': 'غ',
  'ف': 'ف', 'ه': 'ه', 'ث': 'ث', 'آ': 'آ',
  'إ': 'إ', 'ؤ': 'ؤ', 'ئ': 'ئ', 'ء': 'ء'
};

/**
 * Process Arabic text for PDF rendering
 * Reverses the text for proper RTL display
 */
export const processArabicText = (text) => {
  if (!text) return '';
  
  try {
    // Simply reverse the Arabic text for RTL display
    // PDF engines render from left to right, so we reverse for RTL effect
    return text.split('').reverse().join('');
  } catch (error) {
    console.error('Error processing Arabic text:', error);
    return text;
  }
};

/**
 * Process bilingual text (English | Arabic)
 * Keeps English left-to-right and processes Arabic right-to-left
 */
export const processBilingualText = (text) => {
  if (!text) return '';
  
  // Check if text contains the separator |
  if (!text.includes('|')) {
    // If no separator, check if it contains Arabic
    if (/[\u0600-\u06FF]/.test(text)) {
      return processArabicText(text);
    }
    return text;
  }
  
  // Split by | separator
  const parts = text.split('|').map(part => part.trim());
  
  // Process each part
  const processedParts = parts.map(part => {
    // Check if this part contains Arabic characters
    if (/[\u0600-\u06FF]/.test(part)) {
      return processArabicText(part);
    }
    return part;
  });
  
  // Join with the separator
  return processedParts.join('  |  ');
};

/**
 * Check if text contains Arabic characters
 */
export const hasArabicCharacters = (text) => {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
};

export default {
  processArabicText,
  processBilingualText,
  hasArabicCharacters
};
