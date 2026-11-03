/**
 * Material Utilities for ReadRise
 * Handles format detection, badge colors, cover palettes, file sizes, and reading estimates
 * inspired by Scribd, Google Play Books, and modern document stores.
 */

export const FORMAT_TYPES = {
  ALL: 'all',
  PDF: 'pdf',
  DOCX: 'docx',
  IMAGE: 'image',
  EBOOK: 'ebook',
};

export const FORMAT_TABS = [
  { id: 'all', label: 'All Materials', countLabel: 'All' },
  { id: 'pdf', label: 'PDF Documents', countLabel: 'PDF' },
  { id: 'docx', label: 'Word Docs (.docx)', countLabel: 'DOCX' },
  { id: 'image', label: 'Images & Visuals', countLabel: 'Image' },
  { id: 'ebook', label: 'Chapter eBooks', countLabel: 'eBook' },
];

/**
 * Detect the material format from book object safely
 */
export function detectMaterialFormat(book) {
  if (!book) {
    return {
      type: 'ebook',
      label: 'eBook',
      ext: '',
      badgeClass: 'bg-forest-600/90 text-gold-300 border-forest-500/30',
      tagColor: 'forest',
      accentColor: '#174c38',
      description: 'Digital Publication',
    };
  }

  const fileType = String(book.file_type || '').toLowerCase();
  const fileUrl = String(book.file_url || '').toLowerCase();

  if (fileType.includes('pdf') || fileUrl.endsWith('.pdf')) {
    return {
      type: 'pdf',
      label: 'PDF',
      ext: '.pdf',
      badgeClass: 'bg-rose-600 text-white border-rose-400/40 shadow-xs',
      tagColor: 'rose',
      accentColor: '#e11d48',
      description: 'PDF Document',
    };
  }

  if (
    fileType.includes('wordprocessingml') ||
    fileType.includes('docx') ||
    fileUrl.endsWith('.docx')
  ) {
    return {
      type: 'docx',
      label: 'DOCX',
      ext: '.docx',
      badgeClass: 'bg-blue-600 text-white border-blue-400/40 shadow-xs',
      tagColor: 'blue',
      accentColor: '#2563eb',
      description: 'Word Document',
    };
  }

  if (fileType.includes('msword') || fileUrl.endsWith('.doc')) {
    return {
      type: 'doc',
      label: 'DOC',
      ext: '.doc',
      badgeClass: 'bg-sky-600 text-white border-sky-400/40 shadow-xs',
      tagColor: 'sky',
      accentColor: '#0284c7',
      description: 'Legacy Word Doc',
    };
  }

  if (
    fileType.includes('image') ||
    fileType.includes('jpeg') ||
    fileType.includes('png') ||
    fileType.includes('webp') ||
    fileUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i)
  ) {
    return {
      type: 'image',
      label: 'Image',
      ext: '.img',
      badgeClass: 'bg-purple-600 text-white border-purple-400/40 shadow-xs',
      tagColor: 'purple',
      accentColor: '#9333ea',
      description: 'Illustrated & Visual Plates',
    };
  }

  if (fileType.includes('epub') || fileUrl.endsWith('.epub')) {
    return {
      type: 'epub',
      label: 'EPUB',
      ext: '.epub',
      badgeClass: 'bg-emerald-600 text-white border-emerald-400/40 shadow-xs',
      tagColor: 'emerald',
      accentColor: '#059669',
      description: 'ePub eBook',
    };
  }

  if (fileType.includes('rtf') || fileUrl.endsWith('.rtf')) {
    return {
      type: 'rtf',
      label: 'RTF',
      ext: '.rtf',
      badgeClass: 'bg-amber-600 text-white border-amber-400/40 shadow-xs',
      tagColor: 'amber',
      accentColor: '#d97706',
      description: 'Rich Text Format',
    };
  }

  if (fileType.includes('text') || fileUrl.endsWith('.txt')) {
    return {
      type: 'txt',
      label: 'TXT',
      ext: '.txt',
      badgeClass: 'bg-slate-700 text-white border-slate-500/40 shadow-xs',
      tagColor: 'slate',
      accentColor: '#475569',
      description: 'Plain Text Manuscript',
    };
  }

  if (book.file_url) {
    return {
      type: 'file',
      label: 'FILE',
      ext: '',
      badgeClass: 'bg-stone-700 text-white border-stone-500/40 shadow-xs',
      tagColor: 'stone',
      accentColor: '#57534e',
      description: 'Digital Material',
    };
  }

  return {
    type: 'ebook',
    label: 'eBook',
    ext: '',
    badgeClass: 'bg-forest-600/95 text-gold-300 border-forest-500/30 shadow-xs',
    tagColor: 'forest',
    accentColor: '#174c38',
    description: 'Interactive Chapters',
  };
}

/**
 * Editorial Cover Themes for auto-generated document sheet covers
 */
export const COVER_THEMES = [
  {
    id: 'oxford-navy',
    name: 'Oxford Midnight',
    bg: 'from-slate-900 via-indigo-950 to-slate-950',
    accent: '#d8aa5b',
    border: 'border-indigo-800/40',
    spine: 'bg-indigo-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(216, 170, 91, 0.08)',
  },
  {
    id: 'forest-emerald',
    name: 'Emerald Scholar',
    bg: 'from-forest-900 via-forest-950 to-teal-950',
    accent: '#e6c887',
    border: 'border-emerald-800/40',
    spine: 'bg-forest-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(23, 76, 56, 0.1)',
  },
  {
    id: 'crimson-burgundy',
    name: 'Crimson Editorial',
    bg: 'from-rose-950 via-red-950 to-stone-950',
    accent: '#fbcfe8',
    border: 'border-rose-800/40',
    spine: 'bg-rose-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(225, 29, 72, 0.08)',
  },
  {
    id: 'slate-charcoal',
    name: 'Charcoal Obsidian',
    bg: 'from-zinc-900 via-stone-900 to-neutral-950',
    accent: '#e2e8f0',
    border: 'border-zinc-700/40',
    spine: 'bg-neutral-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'amber-ochre',
    name: 'Amber Leather',
    bg: 'from-amber-950 via-stone-900 to-neutral-950',
    accent: '#fef08a',
    border: 'border-amber-800/40',
    spine: 'bg-amber-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(217, 119, 6, 0.08)',
  },
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire',
    bg: 'from-blue-950 via-slate-900 to-indigo-950',
    accent: '#93c5fd',
    border: 'border-blue-800/40',
    spine: 'bg-blue-950/80',
    textColor: 'text-cream-50',
    paperTint: 'rgba(37, 99, 235, 0.08)',
  },
];

/**
 * Resolve cover theme based on book category or ID safely
 */
export function getMaterialCoverTheme(book, index = 0) {
  if (!book) return COVER_THEMES[0];

  const rawCat =
    book.category ||
    (Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : '') ||
    '';
  const cat = String(rawCat || '').toLowerCase();

  if (cat.includes('spirit') || cat.includes('relig') || cat.includes('faith')) {
    return COVER_THEMES[0]; // Oxford Midnight
  }
  if (cat.includes('psych') || cat.includes('mind') || cat.includes('health')) {
    return COVER_THEMES[5]; // Royal Sapphire
  }
  if (cat.includes('edu') || cat.includes('study') || cat.includes('academ') || cat.includes('learn')) {
    return COVER_THEMES[1]; // Emerald Scholar
  }
  if (cat.includes('fict') || cat.includes('novel') || cat.includes('stor') || cat.includes('poet')) {
    return COVER_THEMES[2]; // Crimson Editorial
  }
  if (cat.includes('busin') || cat.includes('econ') || cat.includes('invest') || cat.includes('lead')) {
    return COVER_THEMES[4]; // Amber Leather
  }
  if (cat.includes('sci') || cat.includes('tech') || cat.includes('code') || cat.includes('data')) {
    return COVER_THEMES[3]; // Charcoal Obsidian
  }

  // Consistent fallback by book ID or index
  const numId = typeof book.id === 'number' ? book.id : (index || 0);
  return COVER_THEMES[Math.abs(numId) % COVER_THEMES.length];
}

/**
 * Format raw byte size into human readable string
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return null;
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Estimate reading time or format pages/chapters safely
 */
export function estimateReadingTime(book) {
  if (!book) return '15 min read';
  if (book.pages) {
    const mins = Math.max(5, Math.round(book.pages * 1.8));
    if (mins >= 60) {
      const hours = (mins / 60).toFixed(1);
      return `~${hours} hrs`;
    }
    return `~${mins} mins`;
  }
  if (book.total_chapters) {
    const mins = book.total_chapters * 12;
    if (mins >= 60) {
      return `~${(mins / 60).toFixed(1)} hrs`;
    }
    return `~${mins} mins`;
  }
  if (book.file_size) {
    // Rough estimate from file size
    const kb = book.file_size / 1024;
    const estPages = Math.min(300, Math.max(10, Math.round(kb / 15)));
    return `~${Math.round(estPages * 1.5)} mins`;
  }
  return 'Self-paced';
}

/**
 * Get display string for length (pages or chapters) safely
 */
export function getMaterialLengthLabel(book) {
  if (!book) return '';
  if (book.pages && book.pages > 0) {
    return `${book.pages} pages`;
  }
  if (book.total_chapters && book.total_chapters > 0) {
    return `${book.total_chapters} ${book.total_chapters === 1 ? 'chapter' : 'chapters'}`;
  }
  if (book.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
    return `${book.chapters.length} ${book.chapters.length === 1 ? 'chapter' : 'chapters'}`;
  }
  const format = detectMaterialFormat(book);
  if (format.type === 'pdf') return 'PDF Document';
  if (format.type === 'docx' || format.type === 'doc') return 'Word Document';
  if (format.type === 'epub') return 'ePub eBook';
  return 'Document';
}
